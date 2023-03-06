import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, Wrapper } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import AgmDate from '@/components/AnnualReport/AGMDate.vue'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('AgmDate', () => {
  let wrapper: Wrapper<AgmDate>
  let vm: any

  beforeEach(() => {
    // init store
    store.state.ARFilingYear = 2019
    store.state.arMinDate = '2019-01-01'
    store.state.arMaxDate = '2019-12-31'
    store.commit('setLegalType', 'CP')
    store.commit('setLastAnnualReportDate', '2018-07-15')

    wrapper = mount(AgmDate, { store, vuetify })
    vm = wrapper.vm
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('initializes the local variables properly', () => {
    // verify local variables
    expect(vm.$data.dateText).toBe('')
    expect(vm.$data.datePicker).toBe('2019-12-31')
    expect(vm.$data.agmExtension).toBe(false)
    expect(vm.$data.noAgm).toBe(false)
  })

  it('does not render the checkbox if today is before max AGM date', async () => {
    await vm.$store.commit('currentDate', '2019-03-15')
    expect(wrapper.find('#no-agm-checkbox').exists()).toBe(false)
  })

  it('renders the checkbox if today is after max AGM date', async () => {
    await vm.$store.commit('currentDate', '2020-01-01')
    expect(wrapper.find('#no-agm-checkbox').exists()).toBe(true)
  })

  it('sets AGM Date when date picker is set', async () => {
    await wrapper.setData({ datePicker: '2019-05-10' })
    vm.onDatePickerChanged('2019-05-10')

    // verify local variables
    expect(vm.$data.dateText).toBe('2019-05-10')
    expect(vm.$data.datePicker).toBe('2019-05-10')
    expect(vm.$data.noAgm).toBe(false)

    // verify emitted AGM Dates
    const agmDates = wrapper.emitted('agmDate')
    expect(agmDates.length).toBe(1)
    expect(agmDates[0]).toEqual(['2019-05-10'])

    // verify emitted Valids
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(1)
    expect(valids[0]).toEqual([true])
  })

  xit('sets No AGM when checkbox is checked', async () => {
    await wrapper.setData({ noAgm: true })
    vm.onCheckboxChanged(true)

    // verify local variables
    expect(vm.$data.dateText).toBe('')
    expect(vm.$data.datePicker).toBe('2019-07-15')
    expect(vm.$data.noAgm).toBe(true)

    // verify emitted AGM Dates
    const agmDates = wrapper.emitted('agmDate')
    expect(agmDates.length).toBe(1)
    expect(agmDates[0]).toEqual([''])

    // verify emitted No AGMs
    const noAgms = wrapper.emitted('noAgm')
    expect(noAgms.length).toBe(1)
    expect(noAgms[0]).toEqual([true])

    // verify emitted Valids
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(1)
    expect(valids[0]).toEqual([true])
  })

  it('sets AGM Date when AGM Date prop is set to a date', async () => {
    await wrapper.setProps({ newAgmDate: '2019-05-10' })

    // verify local variables
    expect(vm.$data.dateText).toBe('2019-05-10')
    expect(vm.$data.datePicker).toBe('2019-05-10')
    expect(vm.$data.noAgm).toBe(false)

    // verify emitted AGM Dates
    const agmDates = wrapper.emitted('agmDate')
    expect(agmDates.length).toBe(1)
    expect(agmDates[0]).toEqual(['2019-05-10'])

    // verify emitted Valids
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(1)
    expect(valids[0]).toEqual([true])
  })

  xit('clears AGM Date when AGM Date prop is set to empty', async () => {
    await wrapper.setProps({ newAgmDate: '' })

    // verify local variables
    expect(vm.$data.dateText).toBe('')
    expect(vm.$data.datePicker).toBe('2019-07-15')
    expect(vm.$data.noAgm).toBe(false)

    // verify emitted AGM Dates
    const agmDates = wrapper.emitted('agmDate')
    expect(agmDates.length).toBe(1)
    expect(agmDates[0]).toEqual([''])

    // verify emitted Valids
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(1)
    expect(valids[0]).toEqual([false])
  })

  xit('sets No AGM when No AGM prop is set to true', async () => {
    await wrapper.setProps({ newNoAgm: true })

    // verify local variables
    expect(vm.$data.dateText).toBe('')
    expect(vm.$data.datePicker).toBe('2019-07-15')
    expect(vm.$data.noAgm).toBe(true)

    // verify emitted No AGMs
    const noAgms = wrapper.emitted('noAgm')
    expect(noAgms.length).toBe(1)
    expect(noAgms[0]).toEqual([true])

    // verify emitted Valids
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(1)
    expect(valids[0]).toEqual([true])
  })

  xit('displays disabled address change message when allowCoa is false', async () => {
    await wrapper.setData({ dateText: '2019-07-15' })
    await wrapper.setProps({ allowCoa: false })

    // verify validation error
    expect(vm.$el.querySelector('.restriction-messages').textContent.trim()).toContain(
      'You can not change your Registered Office Addresses in this Annual Report'
    )
  })

  xit('displays disabled director change message when allowCod is false', async () => {
    await wrapper.setData({ dateText: '2019-07-15' })
    await wrapper.setProps({ allowCod: false })

    // verify validation error
    expect(vm.$el.querySelector('.restriction-messages').textContent.trim()).toContain(
      'You can not change your Directors in this Annual Report'
    )
  })

  xit('displays disabled address + director change message when allowCoa and allowCod are both false', async () => {
    await wrapper.setData({ dateText: '2019-07-15' })
    await wrapper.setProps({ allowCoa: false, allowCod: false })

    // verify validation error
    expect(vm.$el.querySelector('.restriction-messages').textContent.trim()).toContain(
      'You can not change your Registered Office Addresses or Directors in this Annual Report'
    )
  })
})
