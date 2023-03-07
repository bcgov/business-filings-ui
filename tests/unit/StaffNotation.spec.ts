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

    // set necessary variables
    store.commit('setTestConfiguration', { key: 'BUSINESS_EDIT_URL', value: 'https://edit.url/' })
    store.commit('setTestConfiguration', { key: 'BUSINESS_CREATE_URL', value: 'https://create.url/' })
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // allow all filings referenced in this component
    // some of these are normally mutually exclusive, but that's OK for testing
    store.commit('setAllowedActions', {
      filing: {
        filingTypes: [
          { name: 'registrarsNotation' },
          { name: 'registrarsOrder' },
          { name: 'courtOrder' },
          { name: 'conversion' },
          { name: 'dissolution' }, // FUTURE: add dissolution type
          { name: 'restoration', type: 'fullRestoration' },
          { name: 'putBackOn' },
          { name: 'adminFreeze' },
          { name: 'consentContinuationOut' },
          { name: 'restoration', type: 'limitedRestorationExtension' },
          { name: 'restoration', type: 'limitedRestorationToFull' }
        ]
      }
    })
    store.commit('setLegalType', 'SP') // firm
    store.commit('setState', 'ACTIVE') // not historical
    store.commit('setAdminFreeze', false) // not frozen
    store.commit('setIdentifier', 'SP1234567') // business id
  })

  it('renders menu button correctly', () => {
    const wrapper = mount(StaffNotation, { store, vuetify })

    expect(wrapper.vm.$data.expand).toBe(false)
    expect(wrapper.find('.menu-btn').text()).toBe('Add Staff Filing')

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - full list, all allowed actions', async () => {
    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // menu items expected as follows
    const menuItems = [
      {
        type: 'registrars-notation',
        label: 'Add Registrar\'s Notation',
        disabled: false
      },
      {
        type: 'registrars-order',
        label: 'Add Registrar\'s Order',
        disabled: false
      },
      {
        type: 'court-order',
        label: 'Add Court Order',
        disabled: false
      },
      {
        type: 'record-conversion',
        label: 'Record Conversion',
        disabled: false
      },
      {
        type: 'administrative-dissolution',
        label: 'Administrative Dissolution',
        disabled: false
      },
      {
        type: 'restoration',
        label: 'Restore Company',
        disabled: false
      },
      {
        type: 'put-back-on',
        label: 'Put Back On',
        disabled: false
      },
      {
        type: 'admin-freeze',
        label: 'Freeze Business',
        disabled: false
      },
      {
        type: 'consent-continue-out',
        label: 'Consent to Continuation Out',
        disabled: false
      },
      {
        type: 'extend-limited-restoration',
        label: 'Extend Limited Restoration',
        disabled: false
      },
      {
        type: 'convert-full-restoration',
        label: 'Convert to Full Restoration',
        disabled: false
      }
    ]

    // verify menu items
    for (const menuItem of menuItems) {
      const menuItemUnderTest = wrapper.find('[data-type="' + menuItem.type + '"]')
      expect(menuItemUnderTest.text()).toBe(menuItem.label)
      if (menuItem.disabled) {
        expect(menuItemUnderTest.classes()).toContain('v-list-item--disabled')
      } else {
        expect(menuItemUnderTest.classes()).not.toContain('v-list-item--disabled')
      }
    }
    expect(wrapper.findAll('.v-list-item__title')).toHaveLength(menuItems.length)

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - not firm', async () => {
    // set store specifically for this test
    store.commit('setLegalType', 'BC') // not firm

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // verify item
    expect(wrapper.find('[data-type="record-conversion"]').exists()).toBe(false)

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - historical', async () => {
    // set store specifically for this test
    store.commit('setState', 'HISTORICAL') // historical

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // verify item
    expect(wrapper.find('[data-type="administrative-dissolution"]').exists()).toBe(false)

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - frozen', async () => {
    // set store specifically for this test
    store.commit('setAdminFreeze', true) // frozen

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // verify item
    expect(wrapper.find('[data-type="admin-freeze"]').text()).toBe('Unfreeze Business')

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - full list, no allowed actions', async () => {
    // set store specifically for this test
    store.commit('setAllowedActions', null) // no allowed filings

    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // menu items expected as follows
    const menuItems = [
      {
        type: 'registrars-notation',
        label: 'Add Registrar\'s Notation',
        disabled: true
      },
      {
        type: 'registrars-order',
        label: 'Add Registrar\'s Order',
        disabled: true
      },
      {
        type: 'court-order',
        label: 'Add Court Order',
        disabled: true
      },
      {
        type: 'record-conversion',
        label: 'Record Conversion',
        disabled: true
      },
      {
        type: 'administrative-dissolution',
        label: 'Administrative Dissolution',
        disabled: true
      },
      {
        type: 'consent-continue-out',
        label: 'Consent to Continuation Out',
        disabled: true
      }
    ]

    // verify menu items
    for (const menuItem of menuItems) {
      const menuItemUnderTest = wrapper.find('[data-type="' + menuItem.type + '"]')
      expect(menuItemUnderTest.text()).toBe(menuItem.label)
      if (menuItem.disabled) {
        expect(menuItemUnderTest.classes()).toContain('v-list-item--disabled')
      } else {
        expect(menuItemUnderTest.classes()).not.toContain('v-list-item--disabled')
      }
    }
    expect(wrapper.findAll('.v-list-item__title')).toHaveLength(menuItems.length)

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

  it('renders the staff notation dialog for Admin Freeze', async () => {
    const wrapper = mount(StaffNotation, { vuetify, store })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="admin-freeze"]').trigger('click')
    await Vue.nextTick()

    // verify flag
    expect(wrapper.vm.$data.isAddingAdministerFreeze).toBe(true)

    // verify modal title
    expect(wrapper.find('#dialog-title').text()).toContain('Freeze Business')

    // verify textarea label
    expect(wrapper.find('#notation-form .notation-textarea .v-label').text()).toBe('Add Detail')

    // click Cancel button
    await wrapper.find('#dialog-cancel-button').trigger('click')
    await Vue.nextTick() // need to wait longer here
    expect(wrapper.vm.$data.isAddingRegistrarsNotation).toBe(false)

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('goes to conversion filing', async () => {
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
    store.commit('setLegalType', 'BC') // corp
    store.commit('setIdentifier', 'BC1234567')

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

  it('goes to limited restoration filing', async () => {
    // set store specifically for this test
    store.commit('setLegalType', 'BC') // corp
    store.commit('setIdentifier', 'BC1234567')

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
    await wrapper.find('.v-list-item[data-type="extend-limited-restoration"]').trigger('click')
    await Vue.nextTick()

    // verify that build and create methods were called
    expect(buildRestorationFiling).toHaveBeenCalled()
    expect(createFiling).toHaveBeenCalled()

    // verify redirection
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://edit.url/BC1234567/limitedRestorationExtension?restoration-id=1234')

    wrapper.destroy()
    sinon.restore()
  })
})
