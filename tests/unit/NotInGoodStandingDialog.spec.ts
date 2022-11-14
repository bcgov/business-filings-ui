import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount, mount } from '@vue/test-utils'
import { NotInGoodStandingDialog } from '@/components/dialogs'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Not In Good Standing Dialog', () => {
  it('displays Dissolve message', () => {
    const wrapper = shallowMount(NotInGoodStandingDialog,
      {
        vuetify,
        propsData: { dialog: true, message: 'dissolve' }
      })

    expect(wrapper.attributes('contentclass')).toBe('not-in-good-standing-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('.warning-title').text()).toContain('Business is not in good standing')
    expect(wrapper.findAll('.warning-text').at(0).text())
      .toContain('This business cannot be dissolved at this time because it is not in good standing')
    expect(wrapper.findAll('.warning-text').at(1).text())
      .toContain('Please file any overdue annual reports in your To Do list and try your voluntary')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-close-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays Change Company Info message', () => {
    const wrapper = shallowMount(NotInGoodStandingDialog,
      {
        vuetify,
        propsData: { dialog: true, message: 'changeCompanyInfo' }
      })

    expect(wrapper.attributes('contentclass')).toBe('not-in-good-standing-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('.warning-title').text()).toContain('Business is not in good standing')
    expect(wrapper.findAll('.warning-text').at(0).text())
      .toContain('The complete company information for this business cannot be viewed or changed at')
    expect(wrapper.findAll('.warning-text').at(1).text())
      .toContain('Please file any overdue annual reports in your To Do list and try to view and change')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-close-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('displays fallback message', () => {
    const wrapper = shallowMount(NotInGoodStandingDialog,
      {
        vuetify,
        propsData: { dialog: true }
      })

    expect(wrapper.attributes('contentclass')).toBe('not-in-good-standing-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('.warning-title').text()).toContain('Business is not in good standing')
    expect(wrapper.find('.warning-text').text()).toContain('Please contact BC Registries staff:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('#dialog-close-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('emits an event when Close button is clicked', async () => {
    const wrapper = mount(NotInGoodStandingDialog,
      {
        vuetify,
        propsData: { dialog: true }
      })

    expect(wrapper.emitted('close')).toBeUndefined()

    // verify and click Exit button
    const exitButton = wrapper.find('#dialog-close-button')
    expect(exitButton.text()).toBe('OK')
    await exitButton.trigger('click')
    await Vue.nextTick() // need to wait longer here

    expect(wrapper.emitted('close').length).toBe(1)

    wrapper.destroy()
  })
})
