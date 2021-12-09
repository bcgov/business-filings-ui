import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import * as FeatureFlags from '@/utils/feature-flags'
import MixinTester from './mixin-tester.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// mock global function
const getFeatureFlag = jest.spyOn(FeatureFlags as any, 'getFeatureFlag')

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

  it('identifies whether Add Staff Comments is allowed', () => {
    // initial state
    expect(vm.isAllowed('addStaffComment')).toBe(false)

    store.state.keycloakRoles = ['staff']
    expect(vm.isAllowed('addStaffComment')).toBe(true)

    // cleanup
    store.state.keycloakRoles = []
  })

  it('identifies whether Dissolve Company is allowed', () => {
    store.state.entityType = 'BC'

    const tests = [
      // no supported dissolution entities:
      { value: [], expected: false },
      // missing current dissolution entity:
      { value: ['CP'], expected: false },
      // with current dissolution entity:
      { value: ['BC'], expected: true }
    ]

    for (let test of tests) {
      getFeatureFlag.mockReturnValue(test.value)
      expect(vm.isAllowed('dissolveCompany')).toBe(test.expected)
    }

    // cleanup
    store.state.entityType = null
  })

  it('identifies whether Download Business Summary is allowed', () => {
    getFeatureFlag.mockReturnValue(false)
    expect(vm.isAllowed('downloadBusinessSummary')).toBe(false)

    getFeatureFlag.mockReturnValue(true)
    expect(vm.isAllowed('downloadBusinessSummary')).toBe(true)
  })

  it('identifies whether Edit Business Profile is allowed', () => {
    const tests = [
      // no conditions:
      { isHistorical: true, businessId: null, expected: false },
      // only first condition:
      { isHistorical: false, businessId: null, expected: false },
      // only second condition:
      { isHistorical: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { isHistorical: false, businessId: 'CP1234567', expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('editBusinessProfile')).toBe(test.expected)
    }
  })

  it('identifies whether File Address Change is allowed', () => {
    const tests = [
      // no conditions:
      { isHistorical: true, hasBlocker: true, businessId: null, expected: false },
      // only first condition:
      { isHistorical: false, hasBlocker: true, businessId: null, expected: false },
      // only second condition:
      { isHistorical: true, hasBlocker: false, businessId: null, expected: false },
      // only third condition:
      { isHistorical: true, hasBlocker: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { isHistorical: false, hasBlocker: false, businessId: 'CP1234567', expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('fileAddressChange')).toBe(test.expected)
    }
  })

  it('identifies whether File Annual Report is allowed', () => {
    const tests = [
      // no conditions:
      { isHistorical: true, hasBlocker: true, businessId: null, expected: false },
      // only first condition:
      { isHistorical: false, hasBlocker: true, businessId: null, expected: false },
      // only second condition:
      { isHistorical: true, hasBlocker: false, businessId: null, expected: false },
      // only third condition:
      { isHistorical: true, hasBlocker: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { isHistorical: false, hasBlocker: false, businessId: 'CP1234567', expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('fileAnnualReport')).toBe(test.expected)
    }
  })

  it('identifies whether File Correction is allowed', () => {
    const tests = [
      // no conditions:
      { isHistorical: true, hasBlocker: true, businessId: null, roles: [], expected: false },
      // only first condition:
      { isHistorical: false, hasBlocker: true, businessId: null, roles: [], expected: false },
      // only second condition:
      { isHistorical: true, hasBlocker: false, businessId: null, roles: [], expected: false },
      // only third condition:
      { isHistorical: true, hasBlocker: true, businessId: 'CP1234567', roles: [], expected: false },
      // only fourth condition:
      { isHistorical: true, hasBlocker: true, businessId: null, roles: ['staff'], expected: false },
      // all conditions:
      { isHistorical: false, hasBlocker: false, businessId: 'CP1234567', roles: ['staff'], expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
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
      { isHistorical: true, hasBlocker: true, businessId: null, expected: false },
      // only first condition:
      { isHistorical: false, hasBlocker: true, businessId: null, expected: false },
      // only second condition:
      { isHistorical: true, hasBlocker: false, businessId: null, expected: false },
      // only third condition:
      { isHistorical: true, hasBlocker: true, businessId: 'CP1234567', expected: false },
      // all conditions:
      { isHistorical: false, hasBlocker: false, businessId: 'CP1234567', expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
      jest.spyOn(vm, 'hasBlocker', 'get').mockReturnValue(test.hasBlocker)
      if (test.businessId) sessionStorage.setItem('BUSINESS_ID', test.businessId)
      else sessionStorage.removeItem('BUSINESS_ID')
      expect(vm.isAllowed('fileDirectorChange')).toBe(test.expected)
    }
  })

  it('identifies whether File Staff Notation is allowed', () => {
    const tests = [
      // no conditions:
      { isHistorical: true, hasBlocker: true, businessId: null, roles: [], expected: false },
      // only first condition:
      { isHistorical: false, hasBlocker: true, businessId: null, roles: [], expected: false },
      // only second condition:
      { isHistorical: true, hasBlocker: false, businessId: null, roles: [], expected: false },
      // only third condition:
      { isHistorical: true, hasBlocker: true, businessId: 'CP1234567', roles: [], expected: false },
      // only fourth condition:
      { isHistorical: true, hasBlocker: true, businessId: null, roles: ['staff'], expected: false },
      // all conditions:
      { isHistorical: false, hasBlocker: false, businessId: 'CP1234567', roles: ['staff'], expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
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
      { isHistorical: true, entityType: null, expected: false },
      // only first condition:
      { isHistorical: false, entityType: null, expected: false },
      // only second condition (BEN):
      { isHistorical: true, entityType: 'BEN', expected: false },
      // only second condition (BC):
      { isHistorical: true, entityType: 'BC', expected: false },
      // only second condition (ULC):
      { isHistorical: true, entityType: 'ULC', expected: false },
      // all conditions (BEN):
      { isHistorical: false, entityType: 'BEN', expected: true },
      // all conditions (BC):
      { isHistorical: false, entityType: 'BC', expected: true },
      // all conditions (ULC):
      { isHistorical: false, entityType: 'ULC', expected: true }
    ]

    for (let test of tests) {
      store.state.isHistorical = test.isHistorical
      store.state.entityType = test.entityType
      expect(vm.isAllowed('viewChangeCompanyInfo')).toBe(test.expected)
    }
  })
})
