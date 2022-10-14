import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import ConversionDetails from '@/components/Dashboard/TodoList/ConversionDetails.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('Conversion Details component', () => {
  it('Displays correctly with no warnings', () => {
    const wrapper = mount(ConversionDetails, {
      vuetify,
      propsData: {
        filing: {}
      }
    })

    // verify content
    expect(wrapper.find('p').text()).toBe('BC Registries is missing information about this business.')
    expect(wrapper.find('ul').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays warnings correctly', () => {
    const wrapper = mount(ConversionDetails, {
      vuetify,
      propsData: {
        filing: {
          warnings: ['Warning 1', 'Warning 2']
        }
      }
    })

    // verify content
    expect(wrapper.find('p').text()).toBe('BC Registries is missing information about this business.')
    expect(wrapper.find('ul').exists()).toBe(true)
    const items = wrapper.findAll('li')
    expect(items.at(0).text()).toBe('Warning 1')
    expect(items.at(1).text()).toBe('Warning 2')

    wrapper.destroy()
  })
})
