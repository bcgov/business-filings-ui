import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import HeaderActions from '@/components/Dashboard/FilingHistoryList/HeaderActions.vue'
import { FilingStatus } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

setActivePinia(createPinia())
const businessStore = useBusinessStore()

const filing = {
  availableOnPaperOnly: false,
  isFutureEffectiveIa: false,
  status: null,
  name: null
}

describe('Header Actions component - disableCorrection()', () => {
  let wrapper, vm

  beforeAll(() => {
    wrapper = mount(HeaderActions, { propsData: { filing: {}, index: 0 } })
    vm = wrapper.vm as any
  })

  afterAll(() => {
    wrapper.destroy()
  })

  it('correction is disabled when corrections are not allowed', async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(false)
    await wrapper.setProps({ filing })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('correction is disabled when filing is available on paper only', async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    await wrapper.setProps({ filing: { ...filing, availableOnPaperOnly: true } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('correction is disabled when filing is future effective and not completed or corrected', async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    await wrapper.setProps({ filing: { ...filing, isFutureEffective: true, status: FilingStatus.PENDING } })
    expect(vm.disableCorrection()).toBe(true)
  })

  const NOT_SUPPORTED = [
    FilingTypes.AGM_EXTENSION,
    FilingTypes.AGM_LOCATION_CHANGE,
    FilingTypes.AMALGAMATION_OUT,
    FilingTypes.ANNUAL_REPORT,
    FilingTypes.CHANGE_OF_COMPANY_INFO,
    FilingTypes.CONSENT_AMALGAMATION_OUT,
    FilingTypes.CONSENT_CONTINUATION_OUT,
    FilingTypes.CONTINUATION_OUT,
    FilingTypes.CONVERSION,
    FilingTypes.DISSOLUTION,
    FilingTypes.DISSOLVED,
    FilingTypes.RESTORATION,
    FilingTypes.TRANSITION
  ]

  for (const name of NOT_SUPPORTED) {
    it(`correction is disabled when filing is an unsupported type '${name}''`, async () => {
      vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
      await wrapper.setProps({ filing: { ...filing, name } })
      expect(vm.disableCorrection()).toBe(true)
    })
  }

  const STAFF_FILINGS = [
    FilingTypes.ADMIN_FREEZE,
    FilingTypes.COURT_ORDER,
    FilingTypes.PUT_BACK_ON,
    FilingTypes.REGISTRARS_ORDER,
    FilingTypes.REGISTRARS_NOTATION
  ]

  for (const name of STAFF_FILINGS) {
    it(`correction is disabled when filing is a staff type '${name}''`, async () => {
      vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
      await wrapper.setProps({ filing: { ...filing, name } })
      expect(vm.disableCorrection()).toBe(true)
    })
  }

  const ALLOWED = [
    FilingTypes.ALTERATION,
    FilingTypes.CHANGE_OF_ADDRESS,
    FilingTypes.CHANGE_OF_DIRECTORS,
    FilingTypes.CHANGE_OF_NAME
  ]

  for (const name of ALLOWED) {
    it(`correction is enabled when filing is type '${name}''`, async () => {
      vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
      await wrapper.setProps({ filing: { ...filing, name } })
      expect(vm.disableCorrection()).toBe(false)
    })
  }

  const baseCompanies = [
    CorpTypeCd.BC_COMPANY,
    CorpTypeCd.BENEFIT_COMPANY,
    CorpTypeCd.CONTINUE_IN,
    CorpTypeCd.BEN_CONTINUE_IN,
    CorpTypeCd.BC_CCC,
    CorpTypeCd.CCC_CONTINUE_IN,
    CorpTypeCd.ULC_CONTINUE_IN,
    CorpTypeCd.BC_ULC_COMPANY
  ]

  const firms = [
    CorpTypeCd.PARTNERSHIP,
    CorpTypeCd.SOLE_PROP
  ]

  it(`correction is enabled for an 'amalgamationApplication' depending on legal type`, async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    // enabled
    for (const legalType of baseCompanies) {
      businessStore.setLegalType(legalType)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.AMALGAMATION_APPLICATION } })
      expect(vm.disableCorrection()).toBe(false)
    }
    // disabled
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.AMALGAMATION_APPLICATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it(`correction is enabled for a 'registration' depending on legal type`, async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    // enabled
    for (const legalType of firms) {
      businessStore.setLegalType(legalType)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.REGISTRATION } })
      expect(vm.disableCorrection()).toBe(false)
    }
    // disabled
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.REGISTRATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it(`correction is enabled for a 'continuationIn' depending on legal type`, async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    // enabled
    for (const legalType of baseCompanies) {
      businessStore.setLegalType(legalType)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CONTINUATION_IN } })
      expect(vm.disableCorrection()).toBe(false)
    }
    // disabled
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CONTINUATION_IN } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it(`correction is enabled for a 'correction' depending on legal type`, async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    // enabled
    for (const legalType of [...firms, ...baseCompanies, CorpTypeCd.COOP]) {
      businessStore.setLegalType(legalType)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CORRECTION } })
      expect(vm.disableCorrection()).toBe(false)
    }
    // disabled
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CORRECTION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it(`correction is enabled for an 'incorporationApplication' depending on legal type`, async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    // enabled
    for (const legalType of [...baseCompanies, CorpTypeCd.COOP]) {
      businessStore.setLegalType(legalType)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.INCORPORATION_APPLICATION } })
      expect(vm.disableCorrection()).toBe(false)
    }
    // disabled
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.INCORPORATION_APPLICATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it(`correction is enabled for a 'registration' depending on legal type`, async () => {
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    // enabled
    for (const legalType of firms) {
      businessStore.setLegalType(legalType)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.REGISTRATION } })
      expect(vm.disableCorrection()).toBe(false)
    }
    // disabled
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.REGISTRATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('correction is disabled when filing is unhandled', async () => {
    await wrapper.setProps({ filing })
    expect(vm.disableCorrection()).toBe(true)
  })
})
