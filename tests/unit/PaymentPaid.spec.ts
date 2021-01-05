import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaymentPaid from '@/components/Dashboard/TodoList/PaymentPaid.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

xdescribe('Payment Paid', () => {
  it('Displays expected content with no data', () => {
    const wrapper = mount(PaymentPaid, { vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This filing is paid')
    expect(paragraphs.at(1).text()).toContain('If this issue persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    const wrapper = mount(PaymentPaid, { vuetify,
      propsData: { filing: { title: 'Incorporation Application' } }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This Incorporation Application is paid')
    expect(paragraphs.at(1).text()).toContain('If this issue persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })
})
