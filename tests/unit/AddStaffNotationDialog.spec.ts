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

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('AddStaffNotationDialog', () => {
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
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(true)
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
          name: 'dissolution',
          dissolutionType: 'administrative',
          attach: '#parent-page'
        },
        store
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Administrative Dissolution')
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(true)
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
    expect(wrapper.findComponent(CourtOrderPoa).exists()).toBe(true)
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
        store
      })

    // click the Cancel button
    await wrapper.find('#dialog-cancel-button').trigger('click')

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('validates notation is not empty for standard filing', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          courtOrderNumberRequired: true,
          name: 'registrarsNotation'
        },
        store,
        vuetify
      })

    // Should not start with validation
    expect(wrapper.find('#notation-form').text()).not.toContain('Enter a Test')

    // Should validate after clicking on 'Save'
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

    expect(wrapper.find('#notation-form').text()).toContain('Enter a Test')

    wrapper.destroy()
  })

  it('validates notation is not empty for Put Back On Filing', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          courtOrderNumberRequired: true,
          name: 'putBackOn'
        },
        store,
        vuetify
      })

    // Should not start with validation
    expect(wrapper.find('#notation-form').text()).not.toContain('Enter a detailed comment')

    // Should validate after clicking on 'Save'
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

    expect(wrapper.find('#notation-form').text()).toContain('Enter a detailed comment')

    wrapper.destroy()
  })

  it('validates notation is not empty for Administrative Dissolution Filing', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          displayName: 'Test',
          courtOrderNumberRequired: true,
          name: 'dissolution',
          dissolutionType: 'administrative'
        },
        store,
        vuetify
      })

    // Should not start with validation
    expect(wrapper.find('#notation-form').text()).not.toContain('Enter a detailed comment')

    // Should validate after clicking on 'Save'
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

    expect(wrapper.find('#notation-form').text()).toContain('Enter a detailed comment')

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
        vuetify
      })

    // Valid data should be allowed
    await wrapper.find('#notation').setValue('a'.repeat(2000))
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

    expect(wrapper.find('#notation-form').text()).not.toContain('Maximum characters exceeded.')

    // Larger than allowed
    await wrapper.find('#notation').setValue('a'.repeat(2001))
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

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
        vuetify
      })

    // Enables validation
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

    // Should not validate if plan of arrangement is not checked
    expect(wrapper.find('#court-order').text()).not.toContain('A Court Order number is required')

    await wrapper.find('#plan-of-arrangement-checkbox').trigger('click')
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
        vuetify
      })

    // Should not start with validation
    expect(wrapper.find('#court-order').text()).not.toContain('A Court Order number is required')

    // Validates on 'Save'
    await wrapper.find('#dialog-save-button').trigger('click')
    await Vue.nextTick()

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
        vuetify
      })

    // Less than allowed (min 5)
    wrapper.find('#court-order-number-input').setValue('a'.repeat(4))
    wrapper.find('#dialog-save-button').trigger('click')
    // for some reason, awaiting the 2 statements above doesn't work as expected
    await Vue.nextTick()

    expect(wrapper.find('#court-order').text()).toContain('Court order number is invalid')

    // Allowed length (min 5)
    wrapper.find('#court-order-number-input').setValue('a'.repeat(5))
    wrapper.find('#dialog-save-button').trigger('click')
    // for some reason, awaiting the 2 statements above doesn't work as expected
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
        vuetify
      })

    // Max length is valid (max 20)
    wrapper.find('#court-order-number-input').setValue('a'.repeat(20))
    wrapper.find('#dialog-save-button').trigger('click')
    // for some reason, awaiting the 2 statements above doesn't work as expected
    await Vue.nextTick()

    expect(wrapper.find('#court-order').text()).not.toContain('Court order number is invalid')

    // Greater than allowed (max 20)
    wrapper.find('#court-order-number-input').setValue('a'.repeat(21))
    wrapper.find('#dialog-save-button').trigger('click')
    // for some reason, awaiting the 2 statements above doesn't work as expected
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
        vuetify
      })

    wrapper.find('#notation').setValue('Notation...')
    wrapper.find('#dialog-save-button').trigger('click')
    // for some reason, awaiting the 2 statements above doesn't work as expected
    await flushPromises() // need to wait longer here

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([true])

    wrapper.destroy()
  })
})
