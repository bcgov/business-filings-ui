import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import EntityInfo from '@/components/EntityInfo.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const store = getVuexStore()

describe('Enum Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    // (this can be any component since we are not really using it)
    const wrapper = shallowMount(EntityInfo, { store, vuetify })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('returns correct values for filing status helpers', () => {
    expect(vm.isStatusCompleted({ status: 'COMPLETED' })).toBe(true)
    expect(vm.isStatusDraft({ status: 'DRAFT' })).toBe(true)
    expect(vm.isStatusEpoch({ status: 'EPOCH' })).toBe(true)
    expect(vm.isStatusError({ status: 'ERROR' })).toBe(true)
    expect(vm.isStatusNew({ status: 'NEW' })).toBe(true)
    expect(vm.isStatusPaid({ status: 'PAID' })).toBe(true)
    expect(vm.isStatusPending({ status: 'PENDING' })).toBe(true)
    expect(vm.isStatusCorrectionPending({ status: 'PENDING_CORRECTION' })).toBe(true)
    expect(vm.isStatusAlterationPending({ status: 'PENDING_ALTERATION' })).toBe(true)
  })

  it('returns correct values for filing type helpers', () => {
    expect(vm.isTypeAlteration({ filingType: 'alteration' })).toBe(true)
    expect(vm.isTypeAnnualReport({ filingType: 'annualReport' })).toBe(true)
    expect(vm.isTypeCorrection({ filingType: 'correction' })).toBe(true)
    expect(vm.isTypeIncorporationApplication({ filingType: 'incorporationApplication' })).toBe(true)
    expect(vm.isTypeNameRequest({ filingType: 'nameRequest' })).toBe(true)
  })

  it('returns correct values Filing Type To Name helper', () => {
    expect(vm.filingTypeToName('annualReport', '2020')).toBe('Annual Report (2020)')
    expect(vm.filingTypeToName('changeOfAddress')).toBe('Address Change')
    expect(vm.filingTypeToName('changeOfDirectors')).toBe('Director Change')
    expect(vm.filingTypeToName('changeOfName')).toBe('Legal Name Change')
    expect(vm.filingTypeToName('correction')).toBe('Correction')
    expect(vm.filingTypeToName('incorporationApplication')).toBe('Incorporation Application')
    expect(vm.filingTypeToName('nameRequest')).toBe('Name Request')
    expect(vm.filingTypeToName('alteration')).toBe('Changes to Company Information')
    expect(vm.filingTypeToName('specialResolution')).toBe('Special Resolution')
    expect(vm.filingTypeToName('voluntaryDissolution')).toBe('Voluntary Dissolution')
    expect(vm.filingTypeToName('someUnknownFiling')).toBe('Some Unknown Filing')
  })
})
