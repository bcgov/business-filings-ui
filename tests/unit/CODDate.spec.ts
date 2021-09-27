import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, Wrapper } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import CodDate from '@/components/StandaloneDirectorChange/CODDate.vue'

// suppress "Avoid mutating a prop directly" warnings
// ref: https://github.com/vuejs/vue-test-utils/issues/532
Vue.config.silent = true

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('COD Date - COOPs', () => {
  let wrapper: Wrapper<CodDate>
  let vm: any

  beforeEach(() => {
    // init store
    store.state.currentDate = '2019-07-15'

    // set Last Filing Date and verify new Min Date
    store.state.entityFoundingDate = '2018-03-01T00:00:00'
    store.state.entityType = 'CP'

    wrapper = mount(CodDate, { store, vuetify })
    vm = wrapper.vm
  })

  afterEach(() => {
    wrapper.destroy()
    wrapper = null
  })

  it('loads variables properly when initial COD Date is set', () => {
    wrapper.setProps({ initialCodDate: '2019-05-10' })

    // verify local variables
    expect(vm.$data.date).toBe('2019-05-10')
    expect(vm.$data.dateFormatted).toBe('2019/05/10')

    // verify emitted COD Date
    const codDates = wrapper.emitted('codDate')
    expect(codDates.length).toBe(1)
    expect(codDates[0]).toEqual(['2019-05-10'])

    // verify emitted Valid
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(1)
    expect(valids[0]).toEqual([true])
  })

  it('sets Min Date properly based on global properties', () => {
    // verify default Min Date
    expect(vm.minDate).toBe('2018-03-01')

    // set Last COD Filing Date and verify new Min Date
    store.state.lastCodFilingDate = new Date('2019-03-01 12:00:00 GMT')
    expect(vm.minDate).toBe('2019-03-01')

    // cleanup
    store.state.filings = []
  })

  it('sets Min Date to entity founding date if no filings are present', () => {
    store.state.lastCodFilingDate = null
    expect(vm.minDate).toBe('2018-03-01')
  })

  it('sets Max Date to current date in store', () => {
    expect(vm.maxDate).toBe(vm.$store.state.currentDate)
  })

  it('Shows error message when date has invalid length', () => {
    wrapper.setData({ dateFormatted: '2019/11/6' })
    expect(vm.$data.date).toBe('')
    expect(vm.$el.querySelector('.v-messages').textContent).toContain('A Director change date is required.')
  })

  it('sets date picker and emits date changed and valid events when date is changed', () => {
    wrapper.setData({ dateFormatted: '2019/05/10' })

    // verify local variables
    expect(vm.$data.date).toBe('2019-05-10')

    wrapper.setData({ dateFormatted: '2019/05/11' })

    // verify local variables
    expect(vm.$data.date).toBe('2019-05-11')

    // verify emitted COD Dates
    // first emit is from init
    // second emit is from text field update
    const codDates = wrapper.emitted('codDate')
    expect(codDates.length).toBe(2)
    expect(codDates[0]).toEqual(['2019-05-10'])
    expect(codDates[1]).toEqual(['2019-05-11'])

    // verify emitted Valids
    // first emit is from init
    // second emit is from text field update
    const valids = wrapper.emitted('valid')
    expect(valids.length).toBe(2)
    expect(valids[0]).toEqual([true])
    expect(valids[1]).toEqual([true])
  })

  it('invalidates the component when entered month is after Max Date', () => {
    wrapper = mount(CodDate, {
      store,
      vuetify,
      computed: {
        minDate () {
          return '2019-01-01'
        },
        maxDate () {
          return '2019-05-05'
        }
      }
    })

    wrapper.setData({ dateFormatted: '2019/11/11' })
    wrapper.vm.$v.$touch()
    expect(wrapper.vm.$v.dateFormatted.isValidCodDate).toBe(false)
  })

  it('invalidates the component when entered month is before Min Date', () => {
    wrapper = mount(CodDate, {
      store,
      vuetify,
      computed: {
        minDate () {
          return '2019-01-01'
        },
        maxDate () {
          return '2019-05-05'
        }
      }
    })

    wrapper.setData({ dateFormatted: '2018/11/11' })
    wrapper.vm.$v.$touch()
    expect(wrapper.vm.$v.dateFormatted.isValidCodDate).toBe(false)
  })
})

describe('COD Date - BCOMPs', () => {
  let wrapper: Wrapper<CodDate>
  let vm: any

  beforeEach(() => {
    // init store
    store.state.currentDate = '2019-07-15'

    // set Last Filing Date and verify new Min Date
    store.state.entityFoundingDate = '2018-03-01T00:00:00'
    store.state.entityType = 'BEN'

    wrapper = mount(CodDate, { store, vuetify })
    vm = wrapper.vm
  })

  afterEach(() => {
    wrapper.destroy()
    wrapper = null
  })

  it('sets BCOMP Min Date to the last COD date if COD filings exist', () => {
    // set Last COD Filing Date and verify new Min Date
    store.state.lastCodFilingDate = new Date('2019-03-01 12:00:00 GMT')
    expect(vm.minDate).toBe('2019-03-01')

    // cleanup
    store.state.filings = []
  })

  it('sets BCOMP Min Date to entity founding date if no filings are present', () => {
    store.state.lastCodFilingDate = null
    expect(vm.minDate).toBe('2018-03-01')
  })
})
