import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import HeaderActions from '@/components/Dashboard/FilingHistoryList/HeaderActions.vue'
import { FilingStatus } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

setActivePinia(createPinia())
const businessStore = useBusinessStore()

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

  it('returns allowed (disabled=false) when no conditions are met', async () => {
    // no conditions
    vi.spyOn(vm, 'isAllowed').mockReturnValue(true)
    await wrapper.setProps({ filing })
    expect(vm.disableCorrection()).toBe(false)
  })

  it('returns allowed (disabled=false) when conditions[2]', async () => {
    // conditions[2]: FE filing that is Completed or Corrected
    for (const status of [FilingStatus.COMPLETED, FilingStatus.CORRECTED]) {
      await wrapper.setProps({ filing: { ...filing, isFutureEffective: true, status } })
      expect(vm.disableCorrection()).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when conditions[3]', async () => {
    // conditions[3]: IA as a BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    for (const entityType of baseCompanies) {
      businessStore.setLegalType(entityType as any)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.INCORPORATION_APPLICATION } })
      expect(vm.disableCorrection()).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when conditions[4]', async () => {
    // conditions[4]: Change of Registration as a firm
    for (const entityType of [CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP]) {
      businessStore.setLegalType(entityType as any)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CHANGE_OF_REGISTRATION } })
      expect(vm.disableCorrection({ ...filing, name: FilingTypes.CHANGE_OF_REGISTRATION })).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when conditions[5]', async () => {
    // conditions[5]: Correction as a firm or BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    for (const entityType of [CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP, ...baseCompanies]) {
      businessStore.setLegalType(entityType as any)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CORRECTION } })
      expect(vm.disableCorrection({ ...filing, name: FilingTypes.CORRECTION })).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when conditions[6]', async () => {
    // conditions[6]: Registration as a firm
    for (const entityType of [CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP]) {
      businessStore.setLegalType(entityType as any)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.REGISTRATION } })
      expect(vm.disableCorrection({ ...filing, name: FilingTypes.REGISTRATION })).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when conditions[7]', async () => {
    // conditions[7]: Amalgamation as a BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    for (const entityType of baseCompanies) {
      businessStore.setLegalType(entityType as any)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.AMALGAMATION_APPLICATION } })
      expect(vm.disableCorrection({ ...filing, name: FilingTypes.AMALGAMATION_APPLICATION })).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when conditions[8]', async () => {
    // conditions[8]: Continuation In as a BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    for (const entityType of baseCompanies) {
      businessStore.setLegalType(entityType as any)
      await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CONTINUATION_IN } })
      expect(vm.disableCorrection({ ...filing, name: FilingTypes.CONTINUATION_IN })).toBe(false)
    }
  })

  it('returns allowed (disabled=false) when misc filings', async () => {
    // Annual Report, Alteration, Change of Address, Change of Directors, Conversion
    const names = [
      FilingTypes.ANNUAL_REPORT,
      FilingTypes.ALTERATION,
      FilingTypes.CHANGE_OF_ADDRESS,
      FilingTypes.CHANGE_OF_DIRECTORS,
      FilingTypes.CONVERSION
    ]
    for (const name of names) {
      await wrapper.setProps({ filing: { ...filing } })
      expect(vm.disableCorrection({ ...filing, name })).toBe(false)
    }
  })

  it('returns not allowed (disabled=true) when conditions[0]', async () => {
    // only conditions[0]
    await wrapper.setProps({ filing: { ...filing, availableOnPaperOnly: true } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('returns not allowed (disabled=true) when conditions[1]', async () => {
    const names = [
      FilingTypes.ADMIN_FREEZE,
      FilingTypes.COURT_ORDER,
      FilingTypes.PUT_BACK_ON,
      FilingTypes.REGISTRARS_ORDER,
      FilingTypes.REGISTRARS_NOTATION
    ]
    // only conditions[1]
    for (const name of names) {
      await wrapper.setProps({ filing: { ...filing, name } })
      expect(vm.disableCorrection()).toBe(true)
    }
  })

  it('returns not allowed (disabled=true) when conditions[2]', async () => {
    const statuses = [
      FilingStatus.CANCELLED,
      FilingStatus.DELETED,
      FilingStatus.DRAFT,
      FilingStatus.ERROR,
      FilingStatus.NEW,
      FilingStatus.PAID,
      FilingStatus.PENDING,
      FilingStatus.WITHDRAWN
    ]
    // only conditions[2]
    for (const status of statuses) {
      await wrapper.setProps({ filing: { ...filing, isFutureEffective: true, status } })
      expect(vm.disableCorrection()).toBe(true)
    }
  })

  it('returns not allowed (disabled=true) when conditions[3]', async () => {
    // only conditions[3]: IA as not a CP nor BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.INCORPORATION_APPLICATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('returns not allowed (disabled=true) when conditions[4]', async () => {
    // only conditions[4]: Change of Registration as not a firm
    businessStore.setLegalType(CorpTypeCd.COOP)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CHANGE_OF_REGISTRATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('returns not allowed (disabled=true) when conditions[5]', async () => {
    // only conditions[5]: Correction as not a firm nor CP nor BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    businessStore.setLegalType(null)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CORRECTION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('returns not allowed (disabled=true) when conditions[6]', async () => {
    // only conditions[6]: Registration as not a firm
    businessStore.setLegalType(CorpTypeCd.COOP)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.REGISTRATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('returns not allowed (disabled=true) when conditions[7]', async () => {
    // only conditions[7]: Amalgamation as not a BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    businessStore.setLegalType(CorpTypeCd.COOP)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.AMALGAMATION_APPLICATION } })
    expect(vm.disableCorrection()).toBe(true)
  })

  it('returns not allowed (disabled=true) when conditions[8]', async () => {
    // only conditions[8]: Continuation In as not a BC/BEN/C/CBEN/CC/CCC/CUL/ULC
    businessStore.setLegalType(CorpTypeCd.COOP)
    await wrapper.setProps({ filing: { ...filing, name: FilingTypes.CONTINUATION_IN } })
    expect(vm.disableCorrection()).toBe(true)
  })
})
