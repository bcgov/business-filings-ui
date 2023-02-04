import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import StaffFiling from '@/components/Dashboard/FilingHistoryList/StaffFiling.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Staff Filing', () => {
  it('displays no content with a null filing', () => {
    const wrapper = mount(StaffFiling, {
      vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toBeFalsy()

    wrapper.destroy()
  })

  it('displays expected content with all data', () => {
    const wrapper = mount(StaffFiling, {
      vuetify,
      propsData: {
        filing: {
          details: 'Notation Or Order',
          fileNumber: '1234',
          planOfArrangement: 'Plan Of Arrangement'
        }
      }
    })

    // verify content
    const paras = wrapper.findAll('.staff-filing-details > p')
    expect(paras.at(0).text()).toBe('Notation Or Order')
    expect(paras.at(1).text()).toBe('Court Order Number: 1234')
    expect(paras.at(2).text()).toBe('Plan Of Arrangement')

    wrapper.destroy()
  })
})
