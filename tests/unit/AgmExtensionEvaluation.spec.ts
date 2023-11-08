import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores'
import AgmExtensionEvaluation from '@/components/AgmExtension/AgmExtensionEvaluation.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())

describe('ExtensionEvaluation', () => {
  it('displays normally', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023
        }
      },
      vuetify
    })

    expect(wrapper.find('.v-card').attributes('id')).toBe('agm-extension-evaluation')
    expect(wrapper.find('header i').attributes('class')).toContain('mdi-calendar-range')
    expect(wrapper.find('header h2').text()).toBe('AGM Extension Evaluation')
    expect(wrapper.find('.content .message-box').text()).toContain('Based on the information')

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-3').text()).toBe('AGM Year')
    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-3').text()).toBe('Duration of Extension')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('')

    expect(rows.at(2).find('.col-sm-3').text()).toBe('Due date for this AGM')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is eligible', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: true
        },
        extensionDurationText: '',
        dueDateText: ''
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe('months')

    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is eligible, setting the extensionDurationText and dueDateText', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: true
        },
        extensionDurationText: '6 months',
        dueDateText: 'December 2, 2023'
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe('months')

    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is not eligible', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: false
        },
        extensionDurationText: 'The business has reached maximum possible extension for this AGM.',
        dueDateText: 'The business is overdue for this AGM and extension cannot be requested.'
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The business has reached maximum possible extension for this AGM.')

    expect(rows.at(2).find('.col-sm-9').text()).toBe(
      'The business is overdue for this AGM and extension cannot be requested.')

    wrapper.destroy()
  })
})
