import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import * as FeatureFlags from '@/utils/feature-flags'
import MixinTester from '@/mixin-tester.vue'
import { AllowableActions, FilingSubTypes, FilingTypes } from '@/enums'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { FilingTypeIF } from '@/interfaces'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

// mock the entire module
// it's the only way to override any exported function
jest.mock('@/utils/feature-flags', () => {
  // we just care about this one function
  return { GetFeatureFlag: jest.fn() }
})

describe('Allowable Actions Mixin', () => {
  let vm: any

  function setAllowedFilingType (filingType = {}) {
    businessStore.setAllowedActions({
      filing: {
        filingSubmissionLink: '',
        filingTypes: [filingType as FilingTypeIF]
      }
    })
  }

  function setFeatureFlag (val: any) {
    // return the value we want for the test
    jest.spyOn(FeatureFlags, 'GetFeatureFlag').mockReturnValue(val)
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
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_REGISTRATION })
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(true)
  })

  it('identifies whether Address Change is allowed - other', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_ADDRESS })
    expect(vm.isAllowed(AllowableActions.ADDRESS_CHANGE)).toBe(true)
  })

  it('identifies whether Administrative Dissolution is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ADMINISTRATIVE_DISSOLUTION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.DISSOLUTION })
    expect(vm.isAllowed(AllowableActions.ADMINISTRATIVE_DISSOLUTION)).toBe(true)
  })

  it('identifies whether Annual Report is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.ANNUAL_REPORT)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.ANNUAL_REPORT })
    expect(vm.isAllowed(AllowableActions.ANNUAL_REPORT)).toBe(true)
  })

  it('identifies whether Business Information is allowed - Coop', () => {
    jest.spyOn(vm, 'isCoop', 'get').mockReturnValue(true)
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify allowed filing type but no feature flag
    setAllowedFilingType({ name: FilingTypes.SPECIAL_RESOLUTION })
    setFeatureFlag(false)
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(false)

    // verify feature flag but no allowed filing type
    setFeatureFlag(true)
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(false)

    // verify both feature flag and allowed filing type
    setFeatureFlag(true)
    setAllowedFilingType({ name: FilingTypes.SPECIAL_RESOLUTION })
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(true)
  })

  it('identifies whether Business Information is allowed - firm', () => {
    jest.spyOn(vm, 'isCoop', 'get').mockReturnValue(false)
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_REGISTRATION })
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(true)
  })

  it('identifies whether Business Information is allowed - other', () => {
    jest.spyOn(vm, 'isCoop', 'get').mockReturnValue(false)
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.ALTERATION })
    expect(vm.isAllowed(AllowableActions.BUSINESS_INFORMATION)).toBe(true)
  })

  it('identifies whether Business Summary is allowed', () => {
    jest.spyOn(vm, 'getLegalType', 'get').mockReturnValue(CorpTypeCd.BC_COMPANY)

    // verify business but no feature flag
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    setFeatureFlag([])
    expect(vm.isAllowed(AllowableActions.BUSINESS_SUMMARY)).toBe(false)

    // verify feature flag but no business
    setFeatureFlag([CorpTypeCd.BC_COMPANY])
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed(AllowableActions.BUSINESS_SUMMARY)).toBe(false)

    // verify both feature flag and business
    setFeatureFlag([CorpTypeCd.BC_COMPANY])
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    expect(vm.isAllowed(AllowableActions.BUSINESS_SUMMARY)).toBe(true)
  })

  xit('identifies whether Consent Continuation Out is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CONSENT_CONTINUATION_OUT })
    expect(vm.isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)).toBe(true)
  })

  it('identifies whether Continuation Out is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.CONTINUATION_OUT)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CONTINUATION_OUT })
    expect(vm.isAllowed(AllowableActions.CONTINUATION_OUT)).toBe(true)
  })

  it('identifies whether Correction is allowed', () => {
    jest.spyOn(vm, 'getLegalType', 'get').mockReturnValue(CorpTypeCd.BENEFIT_COMPANY)

    // verify allowed filing type but no feature flag
    setAllowedFilingType({ name: FilingTypes.CORRECTION })
    setFeatureFlag([])
    expect(vm.isAllowed(AllowableActions.CORRECTION)).toBe(false)

    // verify feature flag but no allowed filing type
    setFeatureFlag([CorpTypeCd.BENEFIT_COMPANY])
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.CORRECTION)).toBe(false)

    // verify both feature flag and allowed filing type
    setFeatureFlag([CorpTypeCd.BENEFIT_COMPANY])
    setAllowedFilingType({ name: FilingTypes.CORRECTION })
    expect(vm.isAllowed(AllowableActions.CORRECTION)).toBe(true)
  })

  it('identifies whether Court Order is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.COURT_ORDER)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.COURT_ORDER })
    expect(vm.isAllowed(AllowableActions.COURT_ORDER)).toBe(true)
  })

  it('identifies whether Detail Comment allowed', () => {
    // verify business but not staff
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(false)
    expect(vm.isAllowed(AllowableActions.DETAIL_COMMENT)).toBe(false)

    // verify staff but no business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed(AllowableActions.DETAIL_COMMENT)).toBe(false)

    // verify both staff and business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    expect(vm.isAllowed(AllowableActions.DETAIL_COMMENT)).toBe(true)
  })

  xit('identifies whether Digital Credentials is allowed', () => {
    // FUTURE: implement
  })

  it('identifies whether Director Change is allowed - firm', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_REGISTRATION })
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(true)
  })

  it('identifies whether Director Change is allowed - other', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CHANGE_OF_DIRECTORS })
    expect(vm.isAllowed(AllowableActions.DIRECTOR_CHANGE)).toBe(true)
  })

  it('identifies whether Freeze/Unfreeze is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.FREEZE_UNFREEZE)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.ADMIN_FREEZE })
    expect(vm.isAllowed(AllowableActions.FREEZE_UNFREEZE)).toBe(true)
  })

  it('identifies whether Limited Restoration Extension is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.LIMITED_RESTORATION_EXTENSION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.RESTORATION, type: FilingSubTypes.LIMITED_RESTORATION_EXTENSION })
    expect(vm.isAllowed(AllowableActions.LIMITED_RESTORATION_EXTENSION)).toBe(true)
  })

  it('identifies whether Limited Restoration To Full is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.LIMITED_RESTORATION_TO_FULL)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.RESTORATION, type: FilingSubTypes.LIMITED_RESTORATION_TO_FULL })
    expect(vm.isAllowed(AllowableActions.LIMITED_RESTORATION_TO_FULL)).toBe(true)
  })

  it('identifies whether Put Back On is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.PUT_BACK_ON)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.PUT_BACK_ON })
    expect(vm.isAllowed(AllowableActions.PUT_BACK_ON)).toBe(true)
  })

  it('identifies whether Record Conversion is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.RECORD_CONVERSION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.CONVERSION })
    expect(vm.isAllowed(AllowableActions.RECORD_CONVERSION)).toBe(true)
  })

  it('identifies whether Registrars Notation is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.REGISTRARS_NOTATION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.REGISTRARS_NOTATION })
    expect(vm.isAllowed(AllowableActions.REGISTRARS_NOTATION)).toBe(true)
  })

  it('identifies whether Registrars Order is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.REGISTRARS_ORDER)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.REGISTRARS_ORDER })
    expect(vm.isAllowed(AllowableActions.REGISTRARS_ORDER)).toBe(true)
  })

  it('identifies whether Restoration is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.RESTORATION)).toBe(false)

    // verify full restoration
    setAllowedFilingType({ name: FilingTypes.RESTORATION, type: FilingSubTypes.FULL_RESTORATION })
    expect(vm.isAllowed(AllowableActions.RESTORATION)).toBe(true)

    // verify limited restoration
    setAllowedFilingType({ name: FilingTypes.RESTORATION, type: FilingSubTypes.LIMITED_RESTORATION })
    expect(vm.isAllowed(AllowableActions.RESTORATION)).toBe(true)
  })

  it('identifies whether Staff Comment allowed', () => {
    // verify business but not staff
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(false)
    expect(vm.isAllowed(AllowableActions.STAFF_COMMENT)).toBe(false)

    // verify staff but no business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed(AllowableActions.STAFF_COMMENT)).toBe(false)

    // verify both staff and business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    expect(vm.isAllowed(AllowableActions.STAFF_COMMENT)).toBe(true)
  })

  it('identifies whether Transition is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.TRANSITION)).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: FilingTypes.TRANSITION })
    expect(vm.isAllowed(AllowableActions.TRANSITION)).toBe(true)
  })

  it('identifies whether Voluntary Dissolution is allowed', () => {
    jest.spyOn(vm, 'getLegalType', 'get').mockReturnValue(CorpTypeCd.BC_COMPANY)

    // verify allowed filing type but no feature flag
    setAllowedFilingType({ name: FilingTypes.DISSOLUTION })
    setFeatureFlag([])
    expect(vm.isAllowed(AllowableActions.VOLUNTARY_DISSOLUTION)).toBe(false)

    // verify feature flag but no allowed filing type
    setFeatureFlag([CorpTypeCd.BC_COMPANY])
    setAllowedFilingType()
    expect(vm.isAllowed(AllowableActions.VOLUNTARY_DISSOLUTION)).toBe(false)

    // verify both feature flag and allowed filing type
    setFeatureFlag([CorpTypeCd.BC_COMPANY])
    setAllowedFilingType({ name: FilingTypes.DISSOLUTION })
    expect(vm.isAllowed(AllowableActions.VOLUNTARY_DISSOLUTION)).toBe(true)
  })
})
