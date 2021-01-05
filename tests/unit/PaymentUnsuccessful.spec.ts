import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaymentUnsuccessful from '@/components/Dashboard/TodoList/PaymentUnsuccessful.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Payment Unsuccessful', () => {
  it('Displays expected content', () => {
    const wrapper = mount(PaymentUnsuccessful, { vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Payment Unsuccessful')

    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This filing is pending payment')
    expect(paragraphs.at(1).text()).toContain('You may continue this filing')

    wrapper.destroy()
  })
})
