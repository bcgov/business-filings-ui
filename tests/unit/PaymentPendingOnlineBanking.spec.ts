import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaymentPendingOnlineBanking from '@/components/Dashboard/TodoList/PaymentPendingOnlineBanking.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Payment Pending Online Banking', () => {
  it('Displays expected content with no data', () => {
    const wrapper = mount(PaymentPendingOnlineBanking, { vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Online Banking Payment Pending')

    expect(wrapper.find('p').text()).toContain('This filing is pending')

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(4)
    expect(listItems.at(0).text()).toContain('If you have not done so')
    expect(listItems.at(1).text()).toContain('Once submitted through your bank')
    expect(listItems.at(2).text()).toContain('Changes based on this filing')
    expect(listItems.at(2).text()).toContain('for this filing is received')
    expect(listItems.at(3).text()).toContain('You can use a credit card')
    expect(listItems.at(3).text()).toContain('for this filing immediately')

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    const wrapper = mount(PaymentPendingOnlineBanking, { vuetify,
      propsData: { filing: { draftTitle: 'Director Change' } }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Online Banking Payment Pending')

    expect(wrapper.find('p').text()).toContain('This Director Change is pending')

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(4)
    expect(listItems.at(0).text()).toContain('If you have not done so')
    expect(listItems.at(1).text()).toContain('Once submitted through your bank')
    expect(listItems.at(2).text()).toContain('Changes based on this Director Change')
    expect(listItems.at(2).text()).toContain('for this Director Change is received')
    expect(listItems.at(3).text()).toContain('You can use a credit card')
    expect(listItems.at(3).text()).toContain('for this Director Change immediately')

    wrapper.destroy()
  })
})
