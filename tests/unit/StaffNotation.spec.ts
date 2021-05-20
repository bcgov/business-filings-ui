import Vue from 'vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import sinon from 'sinon'
import { shallowMount, mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import axios from '@/axios-auth'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore()
describe('StaffNotation', () => {
  it('renders the page contents correctly', () => {
    const wrapper = shallowMount(StaffNotation,
      {
        propsData: {
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#add-staff-filing-label').text()).toBe('Add Staff Filing')

    wrapper.destroy()
  })
})
