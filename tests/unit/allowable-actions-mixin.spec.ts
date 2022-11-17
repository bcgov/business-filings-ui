import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import * as FeatureFlags from '@/utils/feature-flags'
import MixinTester from '@/mixin-tester.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// mock global function
const getFeatureFlag = jest.spyOn((FeatureFlags as any), 'getFeatureFlag')

describe('Allowable Actions Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(MixinTester, { store, vuetify })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('identifies default case', () => {
    expect(vm.isAllowed(undefined)).toBeNull()
    expect(vm.isAllowed(null)).toBeNull()
    expect(vm.isAllowed('')).toBeNull()
  })

  it('identifies whether Add Detail Comment is allowed', () => {
    const tests = [
      // no conditions:
      { businessId: null, roles: [], expected: false },
      // only first condition:
      { businessId: 'CP1234567', roles: [], expected: false },
      // only second condition:
      { businessId: null, roles: ['staff'], expected: false },
      // all conditions:
      { businessId: 'CP1234567', roles: ['staff'], expected: true }
    ]

    for (const test of tests) {
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      store.state.keycloakRoles = test.roles
      expect(vm.isAllowed('addDetailComment')).toBe(test.expected)
    }
  })

  it('identifies whether Add Staff Comment is allowed', () => {
    // no conditions:
    store.state.keycloakRoles = []
    expect(vm.isAllowed('addStaffComment')).toBe(false)

    // all conditions:
    store.state.keycloakRoles = ['staff']
    expect(vm.isAllowed('addStaffComment')).toBe(true)
  })

  it('identifies whether Dissolve Company for BC is allowed', () => {
    store.state.entityType = 'BC'

    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, flag: [], expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, flag: [], expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, flag: [], expected: false },
      // only thirdcondition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: 'CP1234567', flag: [], expected: false },
      // only fourth condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, flag: ['BC'], expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'CP1234567', flag: ['BC'], expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      getFeatureFlag.mockReturnValue(test.flag)
      expect(vm.isAllowed('dissolveCompany')).toBe(test.expected)
    }
  })

  it('identifies whether Dissolve Company for SP is allowed', () => {
    store.state.entityType = 'SP'

    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, flag: [], expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, flag: [], expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, flag: [], expected: false },
      // only thirdcondition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: 'SP1234567', flag: [], expected: false },
      // only fourth condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, flag: ['SP'], expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'SP1234567', flag: ['SP'], expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      getFeatureFlag.mockReturnValue(test.flag)
      expect(vm.isAllowed('dissolveCompany')).toBe(test.expected)
    }
  })

  it('identifies whether Download Business Summary is allowed', () => {
    const tests = [
      // no conditions:
      { businessId: null, entityType: null, flag: 'CP BEN', expected: false },
      // only first condition:
      { businessId: 'CP1234567', entityType: null, flag: 'CP BEN', expected: false },
      // only second condition:
      { businessId: null, entityType: 'CP', flag: 'CP BEN', expected: false },
      // all conditions:
      { businessId: 'CP1234567', entityType: 'CP', flag: 'CP BEN', expected: true },
      { businessId: 'BC1234567', entityType: 'BEN', flag: 'CP BEN', expected: true },
      { businessId: 'BC1234567', entityType: 'BC', flag: 'CP BEN', expected: false },
      { businessId: 'BC1234567', entityType: 'ULC', flag: 'CP BEN', expected: false }
    ]

    for (const test of tests) {
      store.state.entityType = test.entityType
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      getFeatureFlag.mockReturnValue(test.flag)
      expect(vm.isAllowed('downloadBusinessSummary')).toBe(test.expected)
    }
  })

  it('identifies whether Edit Business Profile is allowed', () => {
    // no conditions:
    sessionStorage.removeItem('BUSINESS_ID')
    expect(vm.isAllowed('editBusinessProfile')).toBe(false)

    // all conditions:
    sessionStorage.setItem('BUSINESS_ID', 'CP1234567')
    expect(vm.isAllowed('editBusinessProfile')).toBe(true)
  })

  it('identifies whether File Address Change is allowed', () => {
    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, expected: false },
      // only third condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'CP1234567', expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('fileAddressChange')).toBe(test.expected)
    }
  })

  it('identifies whether File Annual Report is allowed', () => {
    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, expected: false },
      // only third condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'CP1234567', expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('fileAnnualReport')).toBe(test.expected)
    }
  })

  it('identifies whether File Correction is allowed', () => {
    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, roles: [], expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, roles: [], expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, roles: [], expected: false },
      // only third condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: 'CP1234567', roles: [], expected: false },
      // only fourth condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, roles: ['staff'], expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'CP1234567', roles: ['staff'], expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      store.state.keycloakRoles = test.roles
      expect(vm.isAllowed('fileCorrection')).toBe(test.expected)
    }
  })

  it('identifies whether File Director Change is allowed', () => {
    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, expected: false },
      // only third condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'CP1234567', expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('fileDirectorChange')).toBe(test.expected)
    }
  })

  it('identifies whether File Staff Notation is allowed', () => {
    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, roles: [], expected: false },
      // only first condition:
      { entityState: 'ACTIVE', hasBlocker: true, businessId: null, roles: [], expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', hasBlocker: false, businessId: null, roles: [], expected: false },
      // only third condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: 'CP1234567', roles: [], expected: false },
      // only fourth condition:
      { entityState: 'HISTORICAL', hasBlocker: true, businessId: null, roles: ['staff'], expected: false },
      // all conditions:
      { entityState: 'ACTIVE', hasBlocker: false, businessId: 'CP1234567', roles: ['staff'], expected: true },
      // For SP/GP conditions:
      // eslint-disable-next-line max-len
      { entityState: 'ACTIVE', hasBlockerExceptStaffApproval: false, businessId: 'SP1234567', roles: ['staff'], expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      store.state.keycloakRoles = test.roles
      expect(vm.isAllowed('fileStaffNotation')).toBe(test.expected)
    }
  })

  it('identifies whether View Change Company Info is allowed', () => {
    const tests = [
      // no conditions:
      { entityState: 'HISTORICAL', businessId: null, entityType: null, expected: false },
      // only first condition:
      { entityState: 'ACTIVE', businessId: null, entityType: null, expected: false },
      // only second condition:
      { entityState: 'HISTORICAL', businessId: 'CP1234567', entityType: null, expected: false },
      // only third condition (BEN):
      { entityState: 'HISTORICAL', businessId: null, entityType: 'BEN', expected: false },
      // only third condition (BC):
      { entityState: 'HISTORICAL', businessId: null, entityType: 'BC', expected: false },
      // only third condition (ULC):
      { entityState: 'HISTORICAL', businessId: null, entityType: 'ULC', expected: false },
      // all conditions (BC):
      { entityState: 'ACTIVE', businessId: 'BC1234567', entityType: 'BC', expected: true },
      // all conditions (BEN):
      { entityState: 'ACTIVE', businessId: 'BC1234567', entityType: 'BEN', expected: true },
      // all conditions (CCC):
      { entityState: 'ACTIVE', businessId: 'BC1234567', entityType: 'CC', expected: true },
      // all conditions (GP):
      { entityState: 'ACTIVE', businessId: 'FM1234567', entityType: 'GP', expected: true },
      // all conditions (SP):
      { entityState: 'ACTIVE', businessId: 'FM1234567', entityType: 'SP', expected: true },
      // all conditions (ULC):
      { entityState: 'ACTIVE', businessId: 'BC1234567', entityType: 'ULC', expected: true }
    ]

    for (const test of tests) {
      store.state.entityState = test.entityState
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      store.state.entityType = test.entityType
      expect(vm.isAllowed('viewChangeCompanyInfo')).toBe(test.expected)
    }
  })
})
