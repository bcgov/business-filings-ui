import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import GenericErrorDialog from '@/dialogs/GenericErrorDialog.vue'
import RegistriesContactInfo from '@/components/common/RegistriesContactInfo.vue'

const vuetify = new Vuetify({})

describe('GenericErrorDialog.vue', () => {
  it('does not render the dialog when disabled', () => {
    const wrapper = mount(GenericErrorDialog, {
      vuetify
    })

    expect(wrapper.find('div[role="dialog"]').exists()).toBe(false)

    wrapper.destroy()
  })

  it('renders the dialog with default text and title', () => {
    const wrapper = mount(GenericErrorDialog, {
      vuetify,
      propsData: { dialog: true }
    })

    expect(wrapper.find('div[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('.v-card__title').text()).toBe('An error occurred')
    expect(wrapper.find('.v-card__text > div').text()).toBe('Please contact us:')
    expect(wrapper.find('.v-card__text').findComponent(RegistriesContactInfo).exists()).toBe(true)
    expect(wrapper.find('.v-card__actions').text()).toBe('Close')

    wrapper.destroy()
  })

  it('renders the dialog with custom text and title', () => {
    const wrapper = mount(GenericErrorDialog, {
      vuetify,
      propsData: { dialog: true, text: 'Custom text', title: 'Custom title' }
    })

    expect(wrapper.find('div[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('.v-card__title').text()).toBe('Custom title')
    expect(wrapper.find('.v-card__text > div').text()).toBe('Custom text')
    expect(wrapper.find('.v-card__text').findComponent(RegistriesContactInfo).exists()).toBe(true)
    expect(wrapper.find('.v-card__actions').text()).toBe('Close')

    wrapper.destroy()
  })

  it('emits close event when the Close button is clicked', async () => {
    const wrapper = mount(GenericErrorDialog, {
      vuetify,
      propsData: { dialog: true }
    })

    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.find('.v-btn').trigger('click')
    expect(wrapper.emitted('close')).toEqual([[]])

    wrapper.destroy()
  })
})
