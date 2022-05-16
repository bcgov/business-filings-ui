import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { shallowMount } from '@vue/test-utils'
import ArDate from '@/components/AnnualReport/ARDate.vue'

Vue.use(Vuetify)

const store = getVuexStore() as any // remove typings for unit tests

describe('AnnualReport - UI', () => {
  beforeAll(() => {
    // init store
    store.state.currentJsDate = new Date('2019-07-15T12:00:00')
    store.state.currentDate = '2019-07-15'
    store.state.nextARDate = '2020-09-18'
    store.state.entityType = 'BEN'
  })

  it('initializes the store variables properly', () => {
    const wrapper = shallowMount(ArDate, { store })
    const vm: any = wrapper.vm

    expect(vm.$store.getters.getCurrentDate).toEqual('2019-07-15')
    expect(vm.$store.state.nextARDate).toEqual('2020-09-18')

    wrapper.destroy()
  })

  it('succeeds when the Annual report date outputs are correct', () => {
    const wrapper = shallowMount(ArDate, { store })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.ar-date').textContent).toContain('Sep 18, 2020')
    expect(vm.$el.querySelector('.file-date').textContent).toContain('Today (Jul 15, 2019)')

    wrapper.destroy()
  })
})
