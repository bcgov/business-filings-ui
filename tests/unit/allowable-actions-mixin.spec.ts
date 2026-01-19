import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import MixinTester from '@/mixin-tester.vue'
import { AllowableActions } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingTypeIF } from '@/interfaces'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('Allowable Actions Mixin', () => {
  let vm: any

  function setAllowedFilingType (filingType = {}) {
    businessStore.setAllowedActions({
      digitalBusinessCard: false,
      filing: {
        filingSubmissionLink: '',
        filingTypes: [filingType as FilingTypeIF]
      }
    })
  }

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(MixinTester, { vuetify })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('identifies default case', () => {
    // verify unknown filing actions
    expect(vm.isAllowed(undefined)).toBe(false)
    expect(vm.isAllowed(null)).toBe(false)
    expect(vm.isAllowed('')).toBe(false)
    expect(vm.isAllowed(0)).toBe(false)
  })

  it('identifies whether Address Change is allowed - firm', () => {
    vi.spyOn(vm, 'isEntityFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_REGISTRATION })
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(true)
  })

  it('identifies whether Address Change is allowed - other', () => {
    vi.spyOn(vm, 'isEntityFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_ADDRESS })
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(true)
  })

  it('identifies whether Amalgamation is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.AMALGAMATION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.AMALGAMATION_APPLICATION })
    expect(vm.isAllowed(AllowableActions.AMALGAMATION)).toBe(true)
  })

  it('identifies whether Amalgamation Out is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.AMALGAMATION_OUT)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.AMALGAMATION_OUT })
    expect(vm.isAllowed(AllowableActions.AMALGAMATION_OUT)).toBe(true)
  })

  it('identifies whether Annual Report is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ANNUAL_REPORT)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.ANNUAL_REPORT })
    expect(vm.isAllowed(AllowableActions.ANNUAL_REPORT)).toBe(true)
  })

  it('identifies whether Consent Amalgamation Out is allowed', () => {
    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CONSENT_AMALGAMATION_OUT })
    expect(vm.isAllowed(AllowableActions.CONSENT_AMALGAMATION_OUT)).toBe(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.CONSENT_AMALGAMATION_OUT)).toBe(false)
  })

  it('identifies whether Consent Continuation Out is allowed', () => {
    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CONSENT_CONTINUATION_OUT })
    expect(vm.isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)).toBe(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)).toBe(false)
  })

  it('identifies whether Continuation Out is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.CONTINUATION_OUT)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CONTINUATION_OUT })
    expect(vm.isAllowed(AllowableActions.CONTINUATION_OUT)).toBe(true)
  })

  it('identifies whether Court Order is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.COURT_ORDER)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.COURT_ORDER })
    expect(vm.isAllowed(AllowableActions.COURT_ORDER)).toBe(true)
  })

  it.skip('identifies whether Digital Credentials is allowed', () => {
    // FUTURE: implement
  })

  it('identifies whether Director Change is allowed - firm', () => {
    vi.spyOn(vm, 'isEntityFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_REGISTRATION })
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(true)
  })

  it('identifies whether Director Change is allowed - other', () => {
    vi.spyOn(vm, 'isEntityFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_DIRECTORS })
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(true)
  })
})
