import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount, Wrapper } from '@vue/test-utils'
import TransactionalFolioNumber from '@/components/common/TransactionalFolioNumber.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('TransactionalFolioNumber', () => {
  let wrapper: Wrapper<Vue>

  const factory = (propsData = {}) => {
    return mount(TransactionalFolioNumber, {
      vuetify,
      propsData
    })
  }

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the component', () => {
    wrapper = factory()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('#transactional-folio-number').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('shows an empty field if transactionalFolioNumber is not set', () => {
    wrapper = factory({ accountFolioNumber: '1234', transactionalFolioNumber: null })
    expect(wrapper.vm.$data.localFolioNumber).toBe('')
  })

  it('shows transactionalFolioNumber if set', () => {
    wrapper = factory({ accountFolioNumber: '1234', transactionalFolioNumber: '4321' })
    expect(wrapper.vm.$data.localFolioNumber).toBe('4321')
  })

  it('updates localFolioNumber when transactionalFolioNumber prop changes', async () => {
    wrapper = factory({ accountFolioNumber: 'A', transactionalFolioNumber: 'B' })
    expect(wrapper.vm.$data.localFolioNumber).toBe('B')
    await wrapper.setProps({ transactionalFolioNumber: 'C' })
    await Vue.nextTick()
    expect(wrapper.vm.$data.localFolioNumber).toBe('C')
  })

  it('has update event for transactionalFolioNumber when a user changes the folio number', async () => {
    wrapper = factory({ accountFolioNumber: '1234', transactionalFolioNumber: null })
    const input = wrapper.find('input')
    await input.setValue('NEWFOLIO')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change').pop()[0]).toEqual('NEWFOLIO')
    // Should emit valid event when transactionalFolioNumber is updated
    expect(wrapper.emitted('valid')).toBeTruthy()
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
  })

  it('limits input to 50 characters', async () => {
    wrapper = factory({ accountFolioNumber: '', transactionalFolioNumber: '' })
    const input = wrapper.find('input')
    const longValue = 'x'.repeat(51)
    await input.setValue(longValue)
    await input.trigger('blur')
    // Error message should be displayed
    const error = wrapper.find('.v-messages__message')
    expect(error.exists()).toBe(true)
    expect(error.text()).toContain('Cannot exceed 50 characters')
    // Should emit invalid event
    expect(wrapper.emitted('valid')).toBeTruthy()
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
  })

  it('accepts input up to 50 characters', async () => {
    wrapper = factory({ accountFolioNumber: '', transactionalFolioNumber: '' })
    const input = wrapper.find('input')
    const validValue = 'x'.repeat(50)
    await input.setValue(validValue)
    // Error message should not be present
    const error = wrapper.find('.v-messages__message')
    expect(error.exists()).toBe(false)
    expect(wrapper.vm.$data.localFolioNumber).toBe(validValue)
    // Should emit valid event
    expect(wrapper.emitted('valid')).toBeTruthy()
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
  })
})
