import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import AboutTheBusiness from '@/components/AgmExtension/AboutTheBusiness.vue'
import mockRouter from './mockRouter'
import { AgmExtEvalIF } from '@/interfaces'
import { DateUtilities } from '@/services'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('About The Business component', () => {
  const router = mockRouter.mock()

  it('handles empty data', async () => {
    const wrapper = shallowMount(AboutTheBusiness, {
      vuetify,
      router,
      propsData: { data: null }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-in-good-standing').exists()).toBe(false)
    expect(wrapper.find('#entity-date-of-incorporation').exists()).toBe(false)
  })

  it('displays business info properly', async () => {
    // set store properties
    businessStore.setGoodStanding(true)
    businessStore.setFoundingDate('1971-05-12T00:00:00-00:00')

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(AboutTheBusiness, {
      vuetify,
      router,
      propsData: {
        data: {
          isGoodStanding: businessStore.isGoodStanding,
          incorporationDate: businessStore.getFoundingDate
        } as unknown as AgmExtEvalIF
      }
    })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#entity-in-good-standing').text()).toBe('Yes')
    expect(wrapper.find('#entity-date-of-incorporation').text())
      .toBe(DateUtilities.dateToPacificDate(businessStore.getFoundingDate, true))
  })
})
