import Vue from 'vue'
import Vuetify from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import { shallowMount } from '@vue/test-utils'
import ArDate from '@/components/AnnualReport/ARDate.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

Vue.use(Vuetify)

setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

describe('AnnualReport - UI', () => {
  beforeAll(() => {
    // init store
    rootStore.currentJsDate = new Date('2019-07-15T12:00:00')
    rootStore.currentDate = '2019-07-15'
    rootStore.nextARDate = '2020-09-18'
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
  })

  it('initializes the store variables properly', () => {
    const wrapper = shallowMount(ArDate)
    const vm: any = wrapper.vm

    expect(rootStore.getCurrentDate).toEqual('2019-07-15')
    expect(rootStore.nextARDate).toEqual('2020-09-18')

    wrapper.destroy()
  })

  it('succeeds when the Annual report date outputs are correct', () => {
    const wrapper = shallowMount(ArDate)
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.ar-date').textContent).toContain('Sep 18, 2020')
    expect(vm.$el.querySelector('.file-date').textContent).toContain('Today (Jul 15, 2019)')

    wrapper.destroy()
  })
})
