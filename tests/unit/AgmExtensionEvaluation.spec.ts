import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AgmExtensionEvaluation from '@/components/AgmExtension/AgmExtensionEvaluation.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

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
          isEligible: true,
          alreadyExtended: false,
          requestExpired: false
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe('months')

    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is eligible, setting the already extended and request expired to true', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: true,
          alreadyExtended: true,
          requestExpired: true
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe('months')

    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is eligible, setting the already extended to false request expired to true', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: true,
          alreadyExtended: false,
          requestExpired: true
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe('months')

    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is eligible, setting the already extended to true and request expired to false', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: true,
          alreadyExtended: true,
          requestExpired: false
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe('months')

    expect(rows.at(2).find('.col-sm-9').text()).toBe('')

    wrapper.destroy()
  })

  it('is not eligible - already extended', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: false,
          alreadyExtended: true,
          requestExpired: false
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The business has reached maximum possible extension for this AGM.')

    expect(rows.at(2).find('.col-sm-9').text()).toBe(
      'The due date for this AGM cannot be set since extension has already been requested.')

    wrapper.destroy()
  })

  it('is not eligible - request expired', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: false,
          alreadyExtended: false,
          requestExpired: true
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The period to request an extension for this AGM has expired.')

    expect(rows.at(2).find('.col-sm-9').text()).toBe(
      'The due date for this AGM cannot be set since the request for extension has expired.')

    wrapper.destroy()
  })

  it('is not eligible - already extended + request expired', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: false,
          alreadyExtended: true,
          requestExpired: true
        }
      },
      vuetify
    })

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The business has reached maximum possible extension for this AGM. ' +
      'The period to request an extension has expired.')

    expect(rows.at(2).find('.col-sm-9').text()).toBe(
      'The due date for this AGM cannot be set since extension has already been requested ' +
      'and the request for extension has expired.')

    wrapper.destroy()
  })

  it('is not eligible yellow-box verification', () => {
    // init store

    const wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          agmYear: 2023,
          isEligible: false,
          alreadyExtended: true,
          requestExpired: true
        }
      },
      vuetify
    })

    const yellowEvalBox = wrapper.find('.message-box')

    expect(yellowEvalBox.exists()).toBe(true)

    wrapper.destroy()
  })
})
