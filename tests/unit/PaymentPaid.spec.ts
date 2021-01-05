import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaymentPaid from '@/components/Dashboard/TodoList/PaymentPaid.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Payment Paid', () => {
  it('Displays expected content', () => {
    const wrapper = mount(PaymentPaid, { vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Paid')

    expect(wrapper.find('p').text()).toContain('This filing is paid but')

    wrapper.destroy()
  })
})
