import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AgmExtensionEvaluation from '@/components/AgmExtension/AgmExtensionEvaluation.vue'
import { AgmExtEvalIF, EmptyAgmExtEval } from '@/interfaces'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('ExtensionEvaluation', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(AgmExtensionEvaluation, {
      propsData: {
        data: {
          ...EmptyAgmExtEval,
          agmYear: '2023',
          currentDate: '2023-10-22',
          incorporationDate: new Date('2023-01-01T08:00:00.000Z')
        } as AgmExtEvalIF,
        evaluateResult: true
      },
      vuetify
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('displays normally', () => {
    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-3').text()).toBe('AGM Year')
    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')

    expect(rows.at(1).find('.col-sm-3').text()).toBe('Duration of Extension')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('')

    expect(rows.at(2).find('.col-sm-3').text()).toBe('Due date for this AGM')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('displays warning card normally', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: false
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    expect(wrapper.find('.v-card').attributes('id')).toBe('agm-extension-evaluation')
    expect(wrapper.find('header i').attributes('class')).toContain('mdi-calendar-range')
    expect(wrapper.find('header h2').text()).toBe('AGM Extension Evaluation')
    expect(wrapper.find('.content .message-box').text()).toContain('Based on the information')
  })

  it('is eligible', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: true,
        extensionDuration: 6
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('6 months')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is eligible, setting the already extended and request expired to true', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: true,
        extensionDuration: 6,
        alreadyExtended: true,
        requestExpired: true
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('6 months')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is eligible, setting the already extended to false request expired to true', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: true,
        extensionDuration: 6,
        alreadyExtended: false,
        requestExpired: true
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('6 months')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is eligible, setting the already extended to true and request expired to false', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: true,
        extensionDuration: 6,
        alreadyExtended: true,
        requestExpired: false
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('6 months')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is not eligible - already extended', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: false,
        alreadyExtended: true,
        requestExpired: false
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The business has reached maximum possible extension for this AGM.')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is not eligible - request expired', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: false,
        alreadyExtended: false,
        requestExpired: true
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The business is outside of the time window to request an extension.')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is not eligible - already extended + request expired', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: false,
        alreadyExtended: true,
        requestExpired: true
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-9').text()).toBe('2023')
    expect(rows.at(1).find('.col-sm-9').text()).toBe(
      'The AGM due date from the previous extension has passed.')
    expect(rows.at(2).find('.col-sm-9').text()).toBe('')
  })

  it('is not eligible - do not evaluate', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isEligible: false,
        alreadyExtended: true,
        requestExpired: true
      } as AgmExtEvalIF,
      evaluateResult: false
    })
    await Vue.nextTick() // wait for DOM to update

    expect(wrapper.find('.message-box').exists()).toBe(true)
  })
})
