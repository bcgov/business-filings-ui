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
const store = getVuexStore()

describe('AddStaffNotationDialog', () => {
  it('renders the page contents correctly', () => {
    const wrapper = shallowMount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          itemName: 'Test',
          attach: '#parent-page'
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Add a Test')
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
          itemName: 'Test'
        },
        store,
        vuetify
      })

    // click the Cancel button
    wrapper.find('#dialog-cancel-button').trigger('click')
    await flushPromises()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('validates notation is not empty', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          itemName: 'Test'
        },
        store,
        vuetify
      })

    expect(wrapper.find('#notation-form').text()).not.toContain('Enter a Test')
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
          itemName: 'Test'
        },
        store,
        vuetify
      })
    wrapper.find('#notation').setValue('a'.repeat(2000))
    await flushPromises()
    expect(wrapper.find('#notation-form').text()).not.toContain('Maximum characters exceeded.')

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
          itemName: 'Test'
        },
        store,
        vuetify
      })

    expect(wrapper.find('#court-order').text()).not.toContain('A Court Order number is required')
    wrapper.find('#plan-of-arrangement-checkbox').trigger('click')
    await flushPromises()
    expect(wrapper.find('#court-order').text()).toContain('A Court Order number is required')

    wrapper.destroy()
  })

  it('validates court order number has correct lenght', async () => {
    const wrapper = mount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true,
          itemName: 'Test'
        },
        store,
        vuetify
      })

    expect(wrapper.find('#court-order').text()).not.toContain('Court order number is invalid')
    wrapper.find('#court-order-number-input').setValue('1234')
    await flushPromises()
    expect(wrapper.find('#court-order').text()).toContain('Court order number is invalid')
    wrapper.find('#court-order-number-input').setValue('12345')
    await flushPromises()
    expect(wrapper.find('#court-order').text()).not.toContain('Court order number is invalid')
    wrapper.find('#court-order-number-input').setValue('a'.repeat(20))
    await flushPromises()
    expect(wrapper.find('#court-order').text()).not.toContain('Court order number is invalid')
    wrapper.find('#court-order-number-input').setValue('a'.repeat(21))
    await flushPromises()
    expect(wrapper.find('#court-order').text()).toContain('Court order number is invalid')
    wrapper.destroy()
  })

  xit('saves notation filing when user clicks Save button', async () => {
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/xyz')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {}
          })
        )
      )

    const wrapper = shallowMount(AddStaffNotationDialog,
      {
        propsData: {
          dialog: true
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    wrapper.find('#dialog-save-button').trigger('click')
    await flushPromises()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([true])

    wrapper.destroy()
  })
})
