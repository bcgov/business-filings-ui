import Vue from 'vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('StaffNotation', () => {
  // Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
  document.body.setAttribute('data-app', 'true')
  document.body.setAttribute('id', 'staff-notation')

  it('renders the page contents correctly', () => {
    const wrapper = mount(StaffNotation, {})

    expect(wrapper.vm.$data.expand).toBe(false)
    expect(wrapper.find('#add-staff-filing-label').text()).toBe('Add Staff Filing')
    wrapper.destroy()
  })

  it('renders the menu correctly', async () => {
    const wrapper = mount(StaffNotation, {
      vuetify,
      sync: false
    })

    // Open menu
    wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    await Vue.nextTick()
    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Notation')
    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Order')
    expect(wrapper.find('.v-list .v-item-group').text()).toContain('Add Court Order')

    wrapper.destroy()
  })

  it('emits close', async () => {
    const wrapper = mount(StaffNotation, {
      vuetify,
      sync: false
    })

    // Open menu
    wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)
    await Vue.nextTick()

    // Click on first item
    wrapper.find('.v-list .v-item-group .v-list-item').trigger('click')
    await flushPromises()
    expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeTruthy()

    // click the Cancel button
    wrapper.find('#dialog-cancel-button').trigger('click')
    await Vue.nextTick()
    expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeFalsy()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])
    wrapper.destroy()
  })
})
