import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaymentIncomplete from '@/components/Dashboard/TodoList/PaymentIncomplete.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Payment Incomplete', () => {
  it('Displays expected content with no data', () => {
    const wrapper = mount(PaymentIncomplete, { vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Payment Incomplete -') // NB: no trailling space

    expect(wrapper.find('p').text()).toBe('')

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    const wrapper = mount(PaymentIncomplete, { vuetify,
      propsData: {
        filing: {
          payErrorObj: {
            title: 'Payment Error',
            detail: 'Something went <i>wrong</i>.'
          }
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Payment Incomplete - Payment Error')

    expect(wrapper.find('p').text()).toBe('Something went wrong.')

    wrapper.destroy()
  })
})
