import Vue from 'vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import sinon from 'sinon'
import { shallowMount, mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import axios from '@/axios-auth'
import { AddStaffNotationDialog } from '@/components/dialogs'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('AddStaffNotationDialog', () => {
  // Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
  document.body.setAttribute('data-app', 'true')

  it('renders the page contents correctly for standard filing', () => {
    const wrapper = shallowMount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          name: 'registrarsNotation',
          attach: '#parent-page'
        },
        store
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Add a Test')
    expect(wrapper.find(CourtOrderPoa).exists()).toBe(true)
    expect(wrapper.find('#dialog-save-button')).toBeDefined()
    expect(wrapper.find('#dialog-cancel-button')).toBeDefined()

    expect(vm.notationMaxLength).toBe(2000)

    wrapper.destroy()
  })

  it('renders the page contents correctly for Administrative Dissolution', () => {
    const wrapper = shallowMount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Administrative Dissolution',
          name: 'administrativeDissolution',
          attach: '#parent-page'
        },
        store
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Administrative Dissolution')
    expect(wrapper.find(CourtOrderPoa).exists()).toBe(true)
    expect(wrapper.find('#dialog-save-button')).toBeDefined()
    expect(wrapper.find('#dialog-cancel-button')).toBeDefined()

    expect(vm.notationMaxLength).toBe(2000)

    wrapper.destroy()
  })

  it('renders the page contents correctly for Put Back On', () => {
    const wrapper = shallowMount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Put Back On',
          name: 'putBackOn',
          attach: '#parent-page'
        },
        store
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Correction - Put Back On')
    expect(wrapper.find(CourtOrderPoa).exists()).toBe(true)
    expect(wrapper.find('#dialog-save-button')).toBeDefined()
    expect(wrapper.find('#dialog-cancel-button')).toBeDefined()

    expect(vm.notationMaxLength).toBe(2000)

    wrapper.destroy()
  })

  it('emits Close=false event when user clicks Cancel button', async () => {
    const wrapper = shallowMount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test'
        },
        store,
        sync: false
      })

    // click the Cancel button
    wrapper.find('#dialog-cancel-button').trigger('click')
    await Vue.nextTick()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('validates notation is not empty', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          courtOrderNumberRequired: true
        },
        store,
        vuetify,
        sync: false
      })

    // Should not start with validation
    expect(wrapper.find('#notation-form').text()).not.toContain('Enter a Test')

    // Should validate after clicking on 'Save'
    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#notation-form').text()).toContain('Enter a Test')

    wrapper.destroy()
  })

  it('validates notation is not larger than allowed', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          courtOrderNumberRequired: true
        },
        store,
        vuetify,
        sync: false
      })

    // Valid data should be allowed
    wrapper.find('#notation').setValue('a'.repeat(2000))
    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#notation-form').text()).not.toContain('Maximum characters exceeded.')

    // Larger than allowed
    wrapper.find('#notation').setValue('a'.repeat(2001))
    await flushPromises()
    expect(wrapper.find('#notation-form').text()).toContain('Maximum characters exceeded.')

    wrapper.destroy()
  })

  it('validates court order number is required when plan of arrangement is checked', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test'
        },
        store,
        vuetify,
        sync: false
      })

    // Enables validation
    wrapper.find('#dialog-save-button').trigger('click')

    // Should not validate if plan of arrangement is not checked
    expect(wrapper.find('#court-order').text()).not.toContain('A Court Order number is required')

    wrapper.find('#plan-of-arrangement-checkbox').trigger('click')
    await Vue.nextTick()
    expect(wrapper.find('#court-order').text()).toContain('A Court Order number is required')

    wrapper.destroy()
  })

  it('validates court order number is required when courtOrderNumberRequired is true', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          courtOrderNumberRequired: true
        },
        store,
        vuetify,
        sync: false
      })

    // Should not start with validation
    expect(wrapper.find('#court-order').text()).not.toContain('A Court Order number is required')

    // Validates on 'Save'
    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#court-order').text()).toContain('A Court Order number is required')

    wrapper.destroy()
  })

  it('validates court order number has correct min length', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test'
        },
        store,
        vuetify,
        sync: false
      })

    // Less than allowed
    wrapper.find('#court-order-number-input').setValue('a'.repeat(4))
    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#court-order').text()).toContain('Court order number is invalid')

    // Allowed length
    wrapper.find('#court-order-number-input').setValue('a'.repeat(5))
    await Vue.nextTick()
    expect(wrapper.find('#court-order').text()).not.toContain('Court order number is invalid')

    wrapper.destroy()
  })

  it('validates court order number has correct max length', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test'
        },
        store,
        vuetify,
        sync: false
      })

    // Max length is valid
    wrapper.find('#court-order-number-input').setValue('a'.repeat(20))
    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#court-order').text()).not.toContain('Court order number is invalid')

    // Greater than allowed
    wrapper.find('#court-order-number-input').setValue('a'.repeat(21))
    await Vue.nextTick()
    expect(wrapper.find('#court-order').text()).toContain('Court order number is invalid')

    wrapper.destroy()
  })

  it('saves notation filing when user clicks Save button', async () => {
    // init store
    store.state.identifier = 'BC0870669'

    sinon
      .stub(axios, 'post')
      .withArgs('businesses/BC0870669/filings')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {}
          })
        )
      )

    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true
        },
        store,
        vuetify,
        sync: false
      })
    wrapper.find('#notation').setValue('Notation...')
    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([true])

    wrapper.destroy()
  })
})
