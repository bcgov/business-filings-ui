import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import MixinTester from '@/mixin-tester.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Enum Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(MixinTester, { store, vuetify })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('returns correct values for filing state helpers', () => {
    expect(vm.isStatusCancelled({ status: 'CANCELLED' })).toBe(true)
    expect(vm.isStatusCompleted({ status: 'COMPLETED' })).toBe(true)
    expect(vm.isStatusCorrected({ status: 'CORRECTED' })).toBe(true)
    expect(vm.isStatusDeleted({ status: 'DELETED' })).toBe(true)
    expect(vm.isStatusDraft({ status: 'DRAFT' })).toBe(true)
    expect(vm.isStatusError({ status: 'ERROR' })).toBe(true)
    expect(vm.isStatusNew({ status: 'NEW' })).toBe(true)
    expect(vm.isStatusPaid({ status: 'PAID' })).toBe(true)
    expect(vm.isStatusPending({ status: 'PENDING' })).toBe(true)
    expect(vm.isStatusWithdrawn({ status: 'WITHDRAWN' })).toBe(true)
  })

  it('returns correct values for filing type helpers', () => {
    expect(vm.isTypeAlteration({ name: 'alteration' })).toBe(true)
    expect(vm.isTypeAnnualReport({ name: 'annualReport' })).toBe(true)
    expect(vm.isTypeChangeOfAddress({ name: 'changeOfAddress' })).toBe(true)
    expect(vm.isTypeChangeOfDirectors({ name: 'changeOfDirectors' })).toBe(true)
    expect(vm.isTypeChangeOfName({ name: 'changeOfName' })).toBe(true)
    expect(vm.isTypeChangeOfRegistration({ name: 'changeOfRegistration' })).toBe(true)
    expect(vm.isTypeConversion({ name: 'conversion' })).toBe(true)
    expect(vm.isTypeCorrection({ name: 'correction' })).toBe(true)
    expect(vm.isTypeDissolution({ name: 'dissolution' })).toBe(true)
    expect(vm.isTypeIncorporationApplication({ name: 'incorporationApplication' })).toBe(true)
    expect(vm.isTypeRegistration({ name: 'registration' })).toBe(true)
    expect(vm.isTypeTransition({ name: 'transition' })).toBe(true)
    expect(vm.isTypePutBackOn({ name: 'putBackOn' })).toBe(true)
    expect(vm.isTypeSpecialResolution({ name: 'specialResolution' })).toBe(true)

    expect(vm.isTypeStaff({ name: 'registrarsNotation' })).toBe(true)
    expect(vm.isTypeStaff({ name: 'registrarsOrder' })).toBe(true)
    expect(vm.isTypeStaff({ name: 'courtOrder' })).toBe(true)
    expect(vm.isTypeStaff({ name: 'putBackOn' })).toBe(true)
  })

  it('returns correct values for payment method helpers', () => {
    expect(vm.isPayMethodCreditCard({ paymentMethod: 'CC' })).toBe(true)
    expect(vm.isPayMethodDirectPay({ paymentMethod: 'DIRECT_PAY' })).toBe(true)
    expect(vm.isPayMethodDrawdown({ paymentMethod: 'DRAWDOWN' })).toBe(true)
    expect(vm.isPayMethodOnlineBanking({ paymentMethod: 'ONLINE_BANKING' })).toBe(true)
  })

  it('returns correct values for filingTypeToName()', () => {
    expect(vm.filingTypeToName('alteration', null, true)).toBe('Alteration')
    expect(vm.filingTypeToName('alteration', null, false)).toBe('Change of Company Information')
    expect(vm.filingTypeToName('annualReport', '2020')).toBe('Annual Report (2020)')
    expect(vm.filingTypeToName('changeOfAddress')).toBe('Address Change')
    expect(vm.filingTypeToName('changeOfDirectors')).toBe('Director Change')
    expect(vm.filingTypeToName('changeOfName')).toBe('Legal Name Change')
    expect(vm.filingTypeToName('conversion')).toBe('Record Conversion')
    expect(vm.filingTypeToName('correction')).toBe('Correction')
    expect(vm.filingTypeToName('courtOrder')).toBe('Court Order')
    expect(vm.filingTypeToName('dissolution')).toBe('Dissolution')
    expect(vm.filingTypeToName('dissolved')).toBe('Involuntary Dissolution')
    expect(vm.filingTypeToName('incorporationApplication')).toBe('Incorporation Application')
    expect(vm.filingTypeToName('involuntaryDissolution')).toBe('Involuntary Dissolution')
    expect(vm.filingTypeToName('registrarsNotation')).toBe('Registrar\'s Notation')
    expect(vm.filingTypeToName('registrarsOrder')).toBe('Registrar\'s Order')
    expect(vm.filingTypeToName('registration')).toBe('Registration')
    expect(vm.filingTypeToName('specialResolution')).toBe('Special Resolution')
    expect(vm.filingTypeToName('transition')).toBe('Transition Application')
    expect(vm.filingTypeToName('voluntaryDissolution')).toBe('Voluntary Dissolution')
    expect(vm.filingTypeToName('putBackOn')).toBe('Put Back On')
    expect(vm.filingTypeToName('unknown')).toBe('Unknown')
  })

  it('returns correct values for dissolutionTypeToName()', () => {
    expect(vm.dissolutionTypeToName('voluntary')).toBe('Voluntary Dissolution')
    expect(vm.dissolutionTypeToName('unknown')).toBe('Unknown')
    expect(vm.dissolutionTypeToName('administrative')).toBe('Administrative Dissolution')
  })
})
