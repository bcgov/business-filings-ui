import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ExtensionRequest from '@/components/AgmExtension/ExtensionRequest.vue'
import { DatePicker } from '@bcrs-shared-components/date-picker'
import { AgmExtEvalIF, EmptyAgmExtEval } from '@/interfaces'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())

describe('ExtensionRequest', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ExtensionRequest, {
      propsData: {
        data: {
          ...EmptyAgmExtEval,
          currentDate: '2023-10-22',
          incorporationDate: new Date('2023-01-01T08:00:00.000Z')
        } as AgmExtEvalIF
      },
      vuetify
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('displays the initial view properly', () => {
    // Verify component headers
    expect(wrapper.find('.v-card').attributes('id')).toBe('extension-request')
    expect(wrapper.find('header i').attributes('class')).toContain('mdi-calendar-range')
    expect(wrapper.find('header h2').text()).toBe('Extension Request')

    const rows = wrapper.findAll('.content .row')

    // Verify isFirstAgm radio group
    expect(rows.at(0).find('.col-sm-3').text()).toBe('Is this the first AGM?')
    expect(rows.at(0).find('.col-sm-9 .v-input--radio-group').exists()).toBe(true)

    // Verify AGM year text field
    expect(rows.at(1).find('.col-sm-3').text()).toBe('AGM Year')
    expect(rows.at(1).find('#year-txt').exists()).toBe(true)
    expect(rows.at(1).find('#year-txt').attributes().disabled).toBeDefined()

    // Verify isPrevExtension radio group
    expect(rows.at(2).find('.col-sm-3').text()).toBe('Has an extension been requested for this AGM year already?')
    expect(rows.at(2).find('.col-sm-9').text())
      .toContain('Yes - Specify the date the extension expires')
    expect(rows.at(2).find('.col-sm-9').text()).toContain('No - this is the first extension request for this AGM')

    // Verify intended date picker
    expect(rows.at(3).find('.col-sm-3').text()).toBe('Intended date this AGM will be held')
    expect(rows.at(3).find('.col-sm-9').findComponent(DatePicker).exists()).toBe(true)
  })

  it('displays first agm with no previous extension requested', async () => {
    // Click "Yes" radio button for isFirstAgm radio group
    const firstAgmRadios = wrapper.find('#first-agm-radio-group').findAll('input[type="radio"]')
    await firstAgmRadios.at(0).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    // Click "No" radio button for isPrevExtension radio group
    const prevExtensionRadios = wrapper.find('#prev-extension-radio-group').findAll('input[type="radio"]')
    await prevExtensionRadios.at(1).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    // Verify isFirstAgm radio group
    expect(firstAgmRadios.at(0).attributes('aria-checked')).toBe('true')
    expect(firstAgmRadios.at(1).attributes('aria-checked')).toBe('false')

    // Verify AGM year text field
    expect(rows.at(1).find('#year-txt').attributes().disabled).toBeDefined()
    expect(wrapper.vm.data.agmYear).toBe('2023')

    // Verify isPrevExtension radio group
    expect(prevExtensionRadios.at(0).attributes('aria-checked')).toBe('false')
    expect(prevExtensionRadios.at(1).attributes('aria-checked')).toBe('true')
  })

  it('displays first agm with previous extension requested', async () => {
    // Click "Yes" radio button for isFirstAgm radio group
    const firstAgmRadios = wrapper.find('#first-agm-radio-group').findAll('input[type="radio"]')
    await firstAgmRadios.at(0).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    // Click "Yes" radio button for isPrevExtension radio group
    const prevExtensionRadios = wrapper.find('#prev-extension-radio-group').findAll('input[type="radio"]')
    await prevExtensionRadios.at(0).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    // Verify isFirstAgm radio group
    expect(firstAgmRadios.at(0).attributes('aria-checked')).toBe('true')
    expect(firstAgmRadios.at(1).attributes('aria-checked')).toBe('false')

    // Verify AGM year text field
    expect(rows.at(1).find('#year-txt').attributes().disabled).toBeDefined()
    expect(wrapper.vm.data.agmYear).toBe('2023')

    // Verify isPrevExtension radio group
    expect(prevExtensionRadios.at(0).attributes('aria-checked')).toBe('true')
    expect(prevExtensionRadios.at(1).attributes('aria-checked')).toBe('false')

    // Verify expiry date picker
    expect(rows.at(2).find('#date-text-field').attributes().disabled).toBeUndefined()
  })

  it('displays subsequent agm with no previous extension requested', async () => {
    // Click "No" radio button for isFirstAgm radio group
    const firstAgmRadios = wrapper.find('#first-agm-radio-group').findAll('input[type="radio"]')
    await firstAgmRadios.at(1).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    // Click "Yes" radio button for isPrevExtension radio group
    const prevExtensionRadios = wrapper.find('#prev-extension-radio-group').findAll('input[type="radio"]')
    await prevExtensionRadios.at(1).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    // Verify isFirstAgm radio group
    expect(firstAgmRadios.at(0).attributes('aria-checked')).toBe('false')
    expect(firstAgmRadios.at(1).attributes('aria-checked')).toBe('true')

    // Verify AGM year text field
    expect(rows.at(1).find('#year-txt').attributes().disabled).toBeUndefined()

    // Verify isPrevExtension radio group
    expect(prevExtensionRadios.at(0).attributes('aria-checked')).toBe('false')
    expect(prevExtensionRadios.at(1).attributes('aria-checked')).toBe('true')

    // Verify previous agm date picker
    expect(rows.at(2).find('#date-text-field').exists()).toBe(true)
  })

  it('displays subsequent agm with previous extension requested', async () => {
    // Click "No" radio button for isFirstAgm radio group
    const firstAgmRadios = wrapper.find('#first-agm-radio-group').findAll('input[type="radio"]')
    await firstAgmRadios.at(1).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    // Click "Yes" radio button for isPrevExtension radio group
    const prevExtensionRadios = wrapper.find('#prev-extension-radio-group').findAll('input[type="radio"]')
    await prevExtensionRadios.at(0).trigger('click')
    await Vue.nextTick() // wait for DOM to update

    const rows = wrapper.findAll('.content .row')

    // Verify isFirstAgm radio group
    expect(firstAgmRadios.at(0).attributes('aria-checked')).toBe('false')
    expect(firstAgmRadios.at(1).attributes('aria-checked')).toBe('true')

    // Verify AGM year text field
    expect(rows.at(1).find('#year-txt').attributes().disabled).toBeUndefined()

    // Verify isPrevExtension radio group
    expect(prevExtensionRadios.at(0).attributes('aria-checked')).toBe('true')
    expect(prevExtensionRadios.at(1).attributes('aria-checked')).toBe('false')

    // Verify previous agm date picker
    expect(rows.at(2).find('#date-text-field').exists()).toBe(true)

    // Verify expiry date picker
    expect(rows.at(3).find('#date-text-field').exists()).toBe(true)
    expect(rows.at(3).find('#date-text-field').attributes().disabled).toBeUndefined()
  })

  it('handles eligible case for first agm with no previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: true,
        isPrevExtension: false,
        incorporationDate: new Date('2022-06-15T08:00:00.000Z')
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Eligible
    expect(wrapper.vm.data.isEligible).toBe(true)
    expect(wrapper.vm.data.extensionDuration).toBe(6)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(false)
  })

  it('handles "request expired" case for first agm with no previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: true,
        isPrevExtension: false,
        incorporationDate: new Date('2022-01-01T08:00:00.000Z')
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Not eligible because:
    // CurrentDate > (IncorporationDate + 18 Months + 5 days)
    expect(wrapper.vm.data.isEligible).toBe(false)
    expect(wrapper.vm.data.extensionDuration).toBe(null)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(true)
  })

  it('handles eligible case for first agm with previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: true,
        isPrevExtension: true,
        incorporationDate: new Date('2022-01-01T08:00:00.000Z'),
        prevExpiryDate: '2023-12-01'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Eligible
    expect(wrapper.vm.data.isEligible).toBe(true)
    expect(wrapper.vm.data.extensionDuration).toBe(6)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(false)
  })

  it('handles "request expired" case for first agm with previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: true,
        isPrevExtension: true,
        incorporationDate: new Date('2021-11-05T08:00:00.000Z'),
        prevExpiryDate: '2023-08-01'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Not eligible because:
    // CurrentDate > (ExpirationDate + 5 days)
    expect(wrapper.vm.data.isEligible).toBe(false)
    expect(wrapper.vm.data.extensionDuration).toBe(null)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(true)
  })

  it('handles eligible case for subsequent agm with no previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: false,
        isPrevExtension: false,
        incorporationDate: new Date('1998-08-23T08:00:00.000Z'),
        prevAgmDate: '2022-11-01'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    expect(wrapper.vm.data.isEligible).toBe(true)
    expect(wrapper.vm.data.extensionDuration).toBe(6)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(false)
  })

  it('handles "request expired" case for subsequent agm with no previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: false,
        isPrevExtension: false,
        incorporationDate: new Date('1998-08-23T08:00:00.000Z'),
        prevAgmDate: '2020-06-01'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Not eligible because:
    // CurrentDate > (PrevAgmDate + 15 Months + 5 days)
    expect(wrapper.vm.data.isEligible).toBe(false)
    expect(wrapper.vm.data.extensionDuration).toBe(null)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(true)
  })

  it('handles eligible case for subsequent agm with previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: false,
        isPrevExtension: true,
        incorporationDate: new Date('1998-08-23T08:00:00.000Z'),
        prevAgmDate: '2022-12-31',
        prevExpiryDate: '2023-10-31'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Eligible
    expect(wrapper.vm.data.isEligible).toBe(true)
    expect(wrapper.vm.data.extensionDuration).toBe(2)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(false)
  })

  it('handles "already extended" case for subsequent agm with previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: false,
        isPrevExtension: true,
        incorporationDate: new Date('1998-08-23T08:00:00.000Z'),
        prevAgmDate: '2021-12-31',
        prevExpiryDate: '2023-10-31'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Not eligible because:
    // (ExpirationDate - PrevAgmDate) > 12 months
    expect(wrapper.vm.data.isEligible).toBe(false)
    expect(wrapper.vm.data.extensionDuration).toBe(null)
    expect(wrapper.vm.data.alreadyExtended).toBe(true)
    expect(wrapper.vm.data.requestExpired).toBe(false)
  })

  it('handles "request expired" case for subsequent agm with previous extension requested', async () => {
    wrapper.setData({
      data: {
        ...wrapper.vm.data,
        isFirstAgm: false,
        isPrevExtension: true,
        incorporationDate: new Date('1998-08-23T08:00:00.000Z'),
        prevAgmDate: '2022-12-31',
        prevExpiryDate: '2023-10-11'
      } as AgmExtEvalIF
    })
    await Vue.nextTick() // wait for DOM to update

    // Not eligible because:
    // CurrentDate > (ExpirationDate + 5 days)
    expect(wrapper.vm.data.isEligible).toBe(false)
    expect(wrapper.vm.data.extensionDuration).toBe(null)
    expect(wrapper.vm.data.alreadyExtended).toBe(false)
    expect(wrapper.vm.data.requestExpired).toBe(true)
  })
})
