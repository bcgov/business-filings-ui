import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import sinon from 'sinon'
import axios from '@/axios-auth'
import { createLocalVue, mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'
import LegalServices from '@/services/legal-services'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

// Prevent the warning "[Vuetify] Unable to locate target #staff-notation"
document.body.setAttribute('id', 'staff-notation')

describe('StaffNotation', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any

    // set necessary session variables
    sessionStorage.setItem('CREATE_URL', 'https://create.url/')
    sessionStorage.setItem('EDIT_URL', 'https://edit.url/')
  })

  afterAll(() => {
    window.location.assign = assign
  })

  it('renders menu button correctly', () => {
    const wrapper = mount(StaffNotation, { store, vuetify })

    expect(wrapper.vm.$data.expand).toBe(false)
    expect(wrapper.find('.menu-btn').text()).toBe('Add Staff Filing')

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - active', async () => {
    // set store specifically for this test
    store.state.entityType = 'SP'
    store.state.entityState = 'ACTIVE'

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Notation')
    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Order')
    expect(wrapper.find('.v-list').text()).toContain('Add Court Order')
    expect(wrapper.find('.v-list').text()).toContain('Record Conversion')
    expect(wrapper.find('.v-list').text()).toContain('Administrative Dissolution')
    expect(wrapper.find('.v-list').text()).not.toContain('Restore Company')
    expect(wrapper.find('.v-list').text()).not.toContain('Put Back On')

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - historical', async () => {
    // set store specifically for this test
    store.state.entityType = 'SP'
    store.state.entityState = 'HISTORICAL'

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Notation')
    expect(wrapper.find('.v-list').text()).toContain('Add Registrar\'s Order')
    expect(wrapper.find('.v-list').text()).toContain('Add Court Order')
    expect(wrapper.find('.v-list').text()).toContain('Record Conversion')
    expect(wrapper.find('.v-list').text()).not.toContain('Administrative Dissolution')
    expect(wrapper.find('.v-list').text()).not.toContain('Restore Company')
    expect(wrapper.find('.v-list').text()).toContain('Put Back On')

    wrapper.destroy()
  })

  const staffFilingTypes = [
    {
      name: 'Registrar\'s Notation',
      type: 'registrars-notation'
    },
    {
      name: 'Registrar\'s Order',
      type: 'registrars-order'
    },
    {
      name: 'Court Order',
      type: 'court-order'
    },
    {
      name: 'Administrative Dissolution',
      type: 'administrative-dissolution'
    }
  ]

  for (const test of staffFilingTypes) {
    it(`renders the staff notation dialog correctly for ${test.name}`, async () => {
      // set store specifically for this test
      store.state.entityType = 'SP'
      store.state.entityState = 'ACTIVE'

      const wrapper = mount(StaffNotation, { vuetify, store })

      // open menu
      await wrapper.find('.menu-btn').trigger('click')
      expect(wrapper.vm.$data.expand).toBe(true)

      // find and click respective item
      await wrapper.find(`.v-list-item[data-type="${test.type}"]`).trigger('click')
      await Vue.nextTick()

      switch (test.type) {
        case 'registrarsNotation':
          // verify flag
          expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeTruthy()
          // verify modal title
          expect(wrapper.find('#dialog-title').text()).toBe('Add a Registrar\'s Order')
          // verify textarea label
          expect(wrapper.find('#notation-form .notation-textarea .v-label').text()).toBe(test.name)
          break
        case 'registrarsOrder':
          // verify flag
          expect(wrapper.vm.$data.isAddingRegistrarsOrder).toBeTruthy()
          // verify modal title
          expect(wrapper.find('#dialog-title').text()).toBe('Add a Registrar\'s Order')
          // verify textarea label
          expect(wrapper.find('#notation-form .notation-textarea .v-label').text()).toBe(test.name)
          break
        case 'courtOrder':
          // verify flag
          expect(wrapper.vm.$data.isAddingCourtOrder).toBeTruthy()
          // verify modal title
          expect(wrapper.find('#dialog-title').text()).toBe('Add a Court Order')
          // verify textarea label
          expect(wrapper.find('#notation-form .notation-textarea .v-label').text()).toBe(test.name)
          break
        case 'administrativeDissolution':
          // verify flag
          expect(wrapper.vm.$data.isAddingAdministrativeDissolution).toBeTruthy()
          // verify modal title
          expect(wrapper.find('#dialog-title').text()).toBe('Administrative Dissolution')
          // verify textarea label
          expect(wrapper.find('#notation-form .notation-textarea .v-label').text()).toBe('Add Detail')
          break
        default:
          break
      }

      // click Cancel button
      await wrapper.find('#dialog-cancel-button').trigger('click')
      await Vue.nextTick() // need to wait longer here
      expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeFalsy()

      // verify Close event
      expect(wrapper.emitted('close').pop()).toEqual([false])

      wrapper.destroy()
    })
  }

  it('renders the staff notation dialog correction for Put Back On', async () => {
    // set store specifically for this test
    store.state.entityType = 'SP'
    store.state.entityState = 'HISTORICAL'

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="put-back-on"]').trigger('click')
    await Vue.nextTick()

    // verify flag
    expect(wrapper.vm.$data.isAddingPutBackOn).toBeTruthy()

    // verify modal title
    expect(wrapper.find('#dialog-title').text()).toContain('Correction - Put Back On')

    // verify textarea label
    expect(wrapper.find('#notation-form .notation-textarea .v-label').text()).toBe('Add Detail')

    // click Cancel button
    await wrapper.find('#dialog-cancel-button').trigger('click')
    await Vue.nextTick() // need to wait longer here
    expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBeFalsy()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('goes to conversion filing', async () => {
    // set store specifically for this test
    store.state.entityType = 'SP'
    store.state.entityState = 'ACTIVE'
    store.state.identifier = 'SP1234567'

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const wrapper = mount(StaffNotation, { vuetify, store, localVue })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="record-conversion"]').trigger('click')
    await Vue.nextTick()

    // verify redirection
    expect(window.location.assign).toHaveBeenCalledWith('https://edit.url/SP1234567/conversion')

    wrapper.destroy()
  })

  it('goes to restoration filing', async () => {
    // set store specifically for this test
    store.state.entityType = 'BEN'
    store.state.entityState = 'HISTORICAL'
    store.state.identifier = 'BC1234567'

    // stub "create draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/BC1234567/filings?draft=true').returns(
      new Promise(resolve =>
        resolve({ data: { filing: { header: { filingId: 1234 } } } })
      )
    )

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const wrapper = mount(StaffNotation, { vuetify, store, localVue })

    // spy on build and create methods
    const buildRestorationFiling = jest.spyOn((wrapper.vm as any), 'buildRestorationFiling')
    const createFiling = jest.spyOn((LegalServices as any), 'createFiling')

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="restoration"]').trigger('click')
    await Vue.nextTick()

    // verify that build and create methods were called
    expect(buildRestorationFiling).toHaveBeenCalled()
    expect(createFiling).toHaveBeenCalled()

    // verify redirection
    expect(window.location.assign).toHaveBeenCalledWith('https://create.url/?id=BC1234567')

    wrapper.destroy()
    sinon.restore()
  })
})
