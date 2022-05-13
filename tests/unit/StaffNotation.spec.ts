import Vue from 'vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

const staffFilingTypes = [
  {
    name: 'Registrar\'s Notation',
    type: 'registrarsNotation'
  },
  {
    name: 'Registrar\'s Order',
    type: 'registrarsOrder'
  },
  {
    name: 'Court Order',
    type: 'courtOrder'
  }
]
describe('StaffNotation', () => {
  // Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
  document.body.setAttribute('data-app', 'true')
  document.body.setAttribute('id', 'staff-notation')
  store.state.isFirm = true
  it('renders the page contents correctly', () => {
    const wrapper = mount(StaffNotation, {store})

    expect(wrapper.vm.$data.expand).toBe(false)
    expect(wrapper.find('#add-staff-filing-label').text()).toBe('Add Staff Filing')
    wrapper.destroy()
  })

  it('renders the menu correctly', async () => {
    const wrapper = mount(StaffNotation, {
      vuetify,
      sync: false,
      store
    })

    // Open menu
    wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    await Vue.nextTick()
    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Notation')
    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Order')
    expect(wrapper.find('.v-list').text()).toContain('Add Court Order')
    expect(wrapper.find('.v-list').text()).toContain('Record Conversion')

    wrapper.destroy()
  })

  it('emits close', async () => {
    const wrapper = mount(StaffNotation, {
      vuetify,
      sync: false,
      store
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

  for (const test of staffFilingTypes) {
    
    it(`renders the modal correctly for ${test.name}`, async () => {
      const wrapper = mount(StaffNotation, {
        vuetify,
        sync: false,
        store
      })

      // Open menu
      wrapper.find('.menu-btn').trigger('click')
      expect(wrapper.vm.$data.expand).toBe(true)
      await Vue.nextTick()

      // Click on first item
      let index = staffFilingTypes.indexOf(test)
      wrapper.findAll('.v-list .v-item-group .v-list-item').at(index).trigger('click')
      await flushPromises()
      switch (test.type) {
        case 'registrarsNotation':
          expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeTruthy()
          break;
        case 'registrarsOrder':
          expect(wrapper.vm.$data.isAddingRegistrarsOrder).toBeTruthy()
          break;
        case 'courtOrder':
          expect(wrapper.vm.$data.isAddingCourtOrder).toBeTruthy()
          break;
        default:
          break;
      }

      // Verify the modal title
      expect(wrapper.find('#dialog-title').text()).toContain(`Add a ${test.name}`)
      expect(wrapper.find('#notation-form .text-input-field .v-label').text()).toContain(test.name)

      // click the Cancel button
      wrapper.find('#dialog-cancel-button').trigger('click')
      await Vue.nextTick()
      expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeFalsy()

      // verify Close event
      expect(wrapper.emitted('close').pop()).toEqual([false])
      wrapper.destroy()
    })
  }
})
