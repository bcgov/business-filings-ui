import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PaymentIncompleteBcol from '@/components/Dashboard/TodoList/PaymentIncompleteBcol.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Payment Incomplete Bcol', () => {
  it('Displays expected content with no data', () => {
    const wrapper = mount(PaymentIncompleteBcol, { vuetify })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Payment Incomplete -') // NB: no trailling space

    expect(wrapper.find('p').text()).toBe('')

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    const wrapper = mount(PaymentIncompleteBcol, { vuetify,
      propsData: {
        filing: {
          bcolErrObj: {
            title: 'BCOL ERROR',
            detail: 'Something went <i>wrong</i>.'
          }
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Payment Incomplete - BCOL ERROR')

    expect(wrapper.find('p').text()).toBe('Something went wrong.')

    wrapper.destroy()
  })
})
