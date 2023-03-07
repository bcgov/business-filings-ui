import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import * as FeatureFlags from '@/utils/feature-flags'
import MixinTester from '@/mixin-tester.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Allowable Actions Mixin', () => {
  let vm: any

  function setAllowedFilingType (filingType = {}) {
    store.commit('setAllowedActions', { filing: { filingTypes: [filingType] } })
  }

  function setFeatureFlag (val: any) {
    jest.spyOn((FeatureFlags as any), 'getFeatureFlag').mockReturnValue(val)
  }

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(MixinTester, { store, vuetify })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('identifies default case', () => {
    // verify unknown filing actions
    expect(vm.isAllowed(undefined)).toBe(false)
    expect(vm.isAllowed(null)).toBe(false)
    expect(vm.isAllowed('')).toBe(false)
  })

  it('identifies whether Address Change is allowed - firm', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('addressChange')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'changeOfRegistration' })
    expect(vm.isAllowed('addressChange')).toBe(true)
  })

  it('identifies whether Address Change is allowed - other', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('addressChange')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'changeOfAddress' })
    expect(vm.isAllowed('addressChange')).toBe(true)
  })

  it('identifies whether Administrative Dissolution is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('administrativeDissolution')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'dissolution' })
    expect(vm.isAllowed('administrativeDissolution')).toBe(true)
  })

  it('identifies whether Annual Report is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('annualReport')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'annualReport' })
    expect(vm.isAllowed('annualReport')).toBe(true)
  })

  it('identifies whether Business Information is allowed - Coop', () => {
    jest.spyOn(vm, 'isCoop', 'get').mockReturnValue(true)
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify allowed filing type but no feature flag
    setAllowedFilingType({ name: 'specialResolution' })
    setFeatureFlag(false)
    expect(vm.isAllowed('businessInformation')).toBe(false)

    // verify feature flag but no allowed filing type
    setFeatureFlag(true)
    setAllowedFilingType()
    expect(vm.isAllowed('businessInformation')).toBe(false)

    // verify both feature flag and allowed filing type
    setFeatureFlag(true)
    setAllowedFilingType({ name: 'specialResolution' })
    expect(vm.isAllowed('businessInformation')).toBe(true)
  })

  it('identifies whether Business Information is allowed - firm', () => {
    jest.spyOn(vm, 'isCoop', 'get').mockReturnValue(false)
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('businessInformation')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'changeOfRegistration' })
    expect(vm.isAllowed('businessInformation')).toBe(true)
  })

  it('identifies whether Business Information is allowed - other', () => {
    jest.spyOn(vm, 'isCoop', 'get').mockReturnValue(false)
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('businessInformation')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'alteration' })
    expect(vm.isAllowed('businessInformation')).toBe(true)
  })

  it('identifies whether Business Summary is allowed', () => {
    jest.spyOn(vm, 'getLegalType', 'get').mockReturnValue('BC')

    // verify business but no feature flag
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    setFeatureFlag([])
    expect(vm.isAllowed('businessSummary')).toBe(false)

    // verify feature flag but no business
    setFeatureFlag(['BC'])
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed('businessSummary')).toBe(false)

    // verify both feature flag and business
    setFeatureFlag(['BC'])
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    expect(vm.isAllowed('businessSummary')).toBe(true)
  })

  it('identifies whether Consent Continuation Out is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('consentContinuationOut')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'consentContinuationOut' })
    expect(vm.isAllowed('consentContinuationOut')).toBe(true)
  })

  it('identifies whether Correction is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('correction')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'correction' })
    expect(vm.isAllowed('correction')).toBe(true)
  })

  it('identifies whether Court Order is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('courtOrder')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'courtOrder' })
    expect(vm.isAllowed('courtOrder')).toBe(true)
  })

  it('identifies whether Detail Comment allowed', () => {
    // verify business but not staff
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(false)
    expect(vm.isAllowed('detailComment')).toBe(false)

    // verify staff but no business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed('detailComment')).toBe(false)

    // verify both staff and business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    expect(vm.isAllowed('detailComment')).toBe(true)
  })

  xit('identifies whether Digital Credentials is allowed', () => {
    // FUTURE: implement
  })

  it('identifies whether Director Change is allowed - firm', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(true)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('directorChange')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'changeOfRegistration' })
    expect(vm.isAllowed('directorChange')).toBe(true)
  })

  it('identifies whether Director Change is allowed - other', () => {
    jest.spyOn(vm, 'isFirm', 'get').mockReturnValue(false)

    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('directorChange')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'changeOfDirectors' })
    expect(vm.isAllowed('directorChange')).toBe(true)
  })

  it('identifies whether Freeze/Unfreeze is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('freezeUnfreeze')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'adminFreeze' })
    expect(vm.isAllowed('freezeUnfreeze')).toBe(true)
  })

  it('identifies whether Limited Resto Convert is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('limitedRestoConvert')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'restoration', type: 'limitedRestorationToFull' })
    expect(vm.isAllowed('limitedRestoConvert')).toBe(true)
  })

  it('identifies whether Limited Resto Extend is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('limitedRestoExtend')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'restoration', type: 'limitedRestorationExtension' })
    expect(vm.isAllowed('limitedRestoExtend')).toBe(true)
  })

  it('identifies whether Put Back On is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('putBackOn')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'putBackOn' })
    expect(vm.isAllowed('putBackOn')).toBe(true)
  })

  it('identifies whether Record Conversion is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('recordConversion')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'conversion' })
    expect(vm.isAllowed('recordConversion')).toBe(true)
  })

  it('identifies whether Registrars Notation is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('registrarsNotation')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'registrarsNotation' })
    expect(vm.isAllowed('registrarsNotation')).toBe(true)
  })

  it('identifies whether Registrars Order is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('registrarsOrder')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'registrarsOrder' })
    expect(vm.isAllowed('registrarsOrder')).toBe(true)
  })

  it('identifies whether Restoration is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('restoration')).toBe(false)

    // verify full restoration
    setAllowedFilingType({ name: 'restoration', type: 'fullRestoration' })
    expect(vm.isAllowed('restoration')).toBe(true)

    // verify limited restoration
    setAllowedFilingType({ name: 'restoration', type: 'limitedRestoration' })
    expect(vm.isAllowed('restoration')).toBe(true)
  })

  it('identifies whether Staff Comment allowed', () => {
    // verify business but not staff
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(false)
    expect(vm.isAllowed('staffComment')).toBe(false)

    // verify staff but no business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed('staffComment')).toBe(false)

    // verify both staff and business
    jest.spyOn(vm, 'isRoleStaff', 'get').mockReturnValue(true)
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    expect(vm.isAllowed('staffComment')).toBe(true)
  })

  it('identifies whether Transition is allowed', () => {
    // verify no allowed filing type
    setAllowedFilingType()
    expect(vm.isAllowed('transition')).toBe(false)

    // verify allowed filing type
    setAllowedFilingType({ name: 'transition' })
    expect(vm.isAllowed('transition')).toBe(true)
  })

  it('identifies whether Voluntary Dissolution is allowed', () => {
    jest.spyOn(vm, 'getLegalType', 'get').mockReturnValue('BC')

    // verify allowed filing type but no feature flag
    setAllowedFilingType({ name: 'transition' })
    setFeatureFlag([])
    expect(vm.isAllowed('voluntaryDissolution')).toBe(false)

    // verify feature flag but no allowed filing type
    setFeatureFlag(['BC'])
    setAllowedFilingType()
    expect(vm.isAllowed('voluntaryDissolution')).toBe(false)

    // verify both feature flag and allowed filing type
    setFeatureFlag(['BC'])
    setAllowedFilingType({ name: 'dissolution' })
    expect(vm.isAllowed('voluntaryDissolution')).toBe(true)
  })
})
