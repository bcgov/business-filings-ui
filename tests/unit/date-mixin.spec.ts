import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import ArDate from '@/components/AnnualReport/ARDate.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Date Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    // (this can be any component since we are not really using it)
    const wrapper = shallowMount(ArDate, { store, vuetify })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  // FUTURE: fix so this works in GH CI action
  xit('returns correct values for dateToYyyyMmDd()', () => {
    expect(vm.dateToYyyyMmDd(null)).toBeNull()
    expect(vm.dateToYyyyMmDd(new Date('not a date'))).toBeNull()
    // verify that GMT/UTC is correctly converted to Pacific
    expect(vm.dateToYyyyMmDd(new Date('2021-01-01 07:00:00 GMT'))).toBe('2020-12-31') // Standard Time
    expect(vm.dateToYyyyMmDd(new Date('2021-01-01 08:00:00 GMT'))).toBe('2021-01-01') // Standard Time
    expect(vm.dateToYyyyMmDd(new Date('2021-07-01 06:00:00 GMT'))).toBe('2021-06-30') // Daylight Time
    expect(vm.dateToYyyyMmDd(new Date('2021-07-01 07:00:00 GMT'))).toBe('2021-07-01') // Daylight Time
    // verify that Pacific is correctly converted to Pacific
    expect(vm.dateToYyyyMmDd(new Date('2021-01-01 00:00:00 PST'))).toBe('2021-01-01')
    expect(vm.dateToYyyyMmDd(new Date('2021-01-01 23:59:59 PST'))).toBe('2021-01-01')
    expect(vm.dateToYyyyMmDd(new Date('2021-07-01 00:00:00 PDT'))).toBe('2021-07-01')
    expect(vm.dateToYyyyMmDd(new Date('2021-07-01 23:59:59 PDT'))).toBe('2021-07-01')
    // verify that Eastern is correctly converted to Pacific
    expect(vm.dateToYyyyMmDd(new Date('2021-01-01 02:00:00 EST'))).toBe('2020-12-31')
    expect(vm.dateToYyyyMmDd(new Date('2021-01-01 03:00:00 EST'))).toBe('2021-01-01')
    expect(vm.dateToYyyyMmDd(new Date('2021-07-01 02:00:00 EDT'))).toBe('2021-06-30')
    expect(vm.dateToYyyyMmDd(new Date('2021-07-01 03:00:00 EDT'))).toBe('2021-07-01')
  })

  it('returns correct values for compareDates()', () => {
    expect(vm.compareDates(null, '2020-01-01', '<')).toBe(true)
    expect(vm.compareDates('2019-12-31', null, '<')).toBe(true)
    expect(vm.compareDates('2019-12-31', '2020-01-01', null)).toBe(true)
    expect(vm.compareDates('2019-12-31', '2020-01-01', '<')).toBe(true)
    expect(vm.compareDates('2020-01-01', '2019-12-31', '<')).toBe(false)
    expect(vm.compareDates('2019-12-31', '2020-01-01', '>')).toBe(false)
    expect(vm.compareDates('2020-01-01', '2019-12-31', '>')).toBe(true)
    expect(vm.compareDates('2019-12-31', '2020-01-01', '==')).toBe(false)
  })

  it('returns correct values for earliestDate()', () => {
    expect(vm.earliestDate(null, null)).toBeNull()
    expect(vm.earliestDate(null, '2020-01-01')).toBe('2020-01-01')
    expect(vm.earliestDate('2019-12-31', null)).toBe('2019-12-31')
    expect(vm.earliestDate('2019-12-31', '2020-01-01')).toBe('2019-12-31')
    expect(vm.earliestDate('2020-01-01', '2019-12-31')).toBe('2019-12-31')
  })

  it('returns correct values for latestDate()', () => {
    expect(vm.latestDate(null, null)).toBeNull()
    expect(vm.latestDate(null, '2020-01-01')).toBe('2020-01-01')
    expect(vm.latestDate('2019-12-31', null)).toBe('2019-12-31')
    expect(vm.latestDate('2019-12-31', '2020-01-01')).toBe('2020-01-01')
    expect(vm.latestDate('2020-01-01', '2019-12-31')).toBe('2020-01-01')
  })

  it('returns correct values for formatDateString()', () => {
    expect(vm.formatDateString(null)).toBeNull()
    expect(vm.formatDateString('123456789')).toBeNull()
    expect(vm.formatDateString('2020-01-01')).toBe('Jan 1, 2020')
  })

  it('returns correct values for apiToPacificDateTime()', () => {
    expect(vm.apiToPacificDateTime('2021-01-01T00:00:00+00:00')).toBe('Dec 31, 2020 at 4:00 pm Pacific time') // PST
    expect(vm.apiToPacificDateTime('2021-07-01T00:00:00+00:00')).toBe('Jun 30, 2021 at 5:00 pm Pacific time') // PDT
  })

  // FUTURE: fix so this works in GH CI action
  xit('returns correct values for dateStringToApi()', () => {
    expect(vm.dateStringToApi('2021-01-01')).toBe('2021-01-01T08:00:00+00:00') // PST
    expect(vm.dateStringToApi('2021-07-01')).toBe('2021-07-01T07:00:00+00:00') // PDT
  })

  it('returns correct values for daysFromToday()', () => {
    // init store
    store.state.currentDate = '2021-01-20'

    expect(vm.daysFromToday(null)).toBeNaN()
    expect(vm.daysFromToday('2021-01-19')).toBe(-1) // yesterday
    expect(vm.daysFromToday('2021-01-20')).toBe(0) // today
    expect(vm.daysFromToday('2021-01-21')).toBe(1) // tomorrow
  })
})
