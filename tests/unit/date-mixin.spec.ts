import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores/rootStore'
import MixinTester from '@/mixin-tester.vue'

setActivePinia(createPinia())
const rootStore = useRootStore()

describe('Date Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(MixinTester)
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

  it('returns correct values for compareYyyyMmDd()', () => {
    expect(vm.compareYyyyMmDd(null, '2020-01-01', '<')).toBe(true)
    expect(vm.compareYyyyMmDd('2019-12-31', null, '<')).toBe(true)
    expect(vm.compareYyyyMmDd('2019-12-31', '2020-01-01', null)).toBe(true)
    expect(vm.compareYyyyMmDd('2019-12-31', '2020-01-01', '<')).toBe(true)
    expect(vm.compareYyyyMmDd('2020-01-01', '2019-12-31', '<')).toBe(false)
    expect(vm.compareYyyyMmDd('2019-12-31', '2020-01-01', '>')).toBe(false)
    expect(vm.compareYyyyMmDd('2020-01-01', '2019-12-31', '>')).toBe(true)
    expect(vm.compareYyyyMmDd('2019-12-31', '2020-01-01', '==')).toBe(false)
  })

  it('returns correct values for earliestYyyyMmDd()', () => {
    expect(vm.earliestYyyyMmDd(null, null)).toBeNull()
    expect(vm.earliestYyyyMmDd(null, '2020-01-01')).toBe('2020-01-01')
    expect(vm.earliestYyyyMmDd('2019-12-31', null)).toBe('2019-12-31')
    expect(vm.earliestYyyyMmDd('2019-12-31', '2020-01-01')).toBe('2019-12-31')
    expect(vm.earliestYyyyMmDd('2020-01-01', '2019-12-31')).toBe('2019-12-31')
  })

  it('returns correct values for latestYyyyMmDd()', () => {
    expect(vm.latestYyyyMmDd(null, null)).toBeNull()
    expect(vm.latestYyyyMmDd(null, '2020-01-01')).toBe('2020-01-01')
    expect(vm.latestYyyyMmDd('2019-12-31', null)).toBe('2019-12-31')
    expect(vm.latestYyyyMmDd('2019-12-31', '2020-01-01')).toBe('2020-01-01')
    expect(vm.latestYyyyMmDd('2020-01-01', '2019-12-31')).toBe('2020-01-01')
  })

  it('returns correct values for formatYyyyMmDd()', () => {
    // init store
    rootStore.currentJsDate = new Date('2020-01-01T08:00:00')

    expect(vm.formatYyyyMmDd(null)).toBeNull()
    expect(vm.formatYyyyMmDd('123456789')).toBeNull()
    expect(vm.formatYyyyMmDd('2020-01-01')).toBe('Jan 1, 2020')
  })

  it('returns correct values for apiToPacificDateTime()', () => {
    expect(vm.apiToPacificDateTime('2021-01-01T00:00:00+00:00')).toBe('Dec 31, 2020 at 4:00 pm Pacific time') // PST
    expect(vm.apiToPacificDateTime('2021-07-01T00:00:00+00:00')).toBe('Jun 30, 2021 at 5:00 pm Pacific time') // PDT
  })

  // FUTURE: fix so this works in GH CI action
  xit('returns correct values for yyyyMmDdToApi()', () => {
    expect(vm.yyyyMmDdToApi('2021-01-01')).toBe('2021-01-01T08:00:00.000+00:00') // PST
    expect(vm.yyyyMmDdToApi('2021-07-01')).toBe('2021-07-01T07:00:00.000+00:00') // PDT
    expect(vm.yyyyMmDdToApi('2023/05/03')).toBe('2023-05-03T07:00:00.000+00:00')
  })

  it('returns correct values for daysFromToday()', () => {
    // init store
    rootStore.currentJsDate = new Date('2021-11-23T12:00:00')

    expect(vm.daysFromToday(null)).toBeNaN()
    expect(vm.daysFromToday(new Date(2021, 10, 22))).toBe(-1) // yesterday
    expect(vm.daysFromToday(new Date(2021, 10, 23, 0, 0, 0, 0))).toBe(0) // today
    expect(vm.daysFromToday(new Date(2021, 10, 23, 23, 59, 59, 999))).toBe(0) // today
    expect(vm.daysFromToday(new Date(2021, 10, 24))).toBe(1) // tomorrow
  })

  it('returns correct values for DAYLIGHT SAVINGS spring forward daysFromToday()', () => {
    // init store
    rootStore.currentJsDate = new Date('2022-03-01T12:00:00')

    expect(vm.daysFromToday(new Date(2022, 3 - 1, 2))).toBe(1) // before time change
    expect(vm.daysFromToday(new Date(2022, 3 - 1, 15))).toBe(14) // after time change
  })

  it('returns correct values for DAYLIGHT SAVINGS fall back daysFromToday()', () => {
    // init store
    rootStore.currentJsDate = new Date('2022-11-01T12:00:00')

    expect(vm.daysFromToday(new Date(2022, 11 - 1, 2))).toBe(1) // before time change
    expect(vm.daysFromToday(new Date(2022, 11 - 1, 8))).toBe(7) // after time change
  })

  it('returns correct values for yyyyMmDdToDate()', () => {
    // init store
    rootStore.currentJsDate = new Date('2021-11-23T12:00:00')

    expect(vm.yyyyMmDdToDate(null)).toBeNull()
    expect(vm.yyyyMmDdToDate('12345678901')).toBeNull()
    expect(vm.yyyyMmDdToDate('2021-01-01').toISOString()).toEqual('2021-01-01T08:00:00.000Z') // PST
    expect(vm.yyyyMmDdToDate('2021-07-01').toISOString()).toEqual('2021-07-01T07:00:00.000Z') // PDT
  })
})
