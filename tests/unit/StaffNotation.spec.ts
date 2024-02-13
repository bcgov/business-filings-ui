import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import sinon from 'sinon'
import axios from '@/axios-auth'
import { createLocalVue, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'
import LegalServices from '@/services/legal-services'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { EntityState, FilingSubTypes, FilingTypes } from '@/enums'
import { waitForUpdate } from '../wait-for-update'
import * as utils from '@/utils'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

// Prevent the warning "[Vuetify] Unable to locate target #staff-notation"
document.body.setAttribute('id', 'staff-notation')
describe('StaffNotation - Put Back On', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: vi.fn() } as any

    const configuration = {
      VUE_APP_BUSINESS_CREATE_URL: 'https://create.url/',
      VUE_APP_BUSINESS_EDIT_URL: 'https://edit.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // allow all filings referenced in this component
    // some of these are normally mutually exclusive, but that's OK for testing
    businessStore.setAllowedActions({
      digitalBusinessCard: false,
      filing: {
        filingTypes: [
          { name: FilingTypes.PUT_BACK_ON }
        ]
      } as any
    })
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP) // firm
    businessStore.setState(EntityState.HISTORICAL) // not active
    businessStore.setAdminFreeze(false) // not frozen
    businessStore.setIdentifier('SP1234567') // business id
  })

  it('renders the staff notation dialog correction for Put Back On', async () => {
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-put-back-on-entities') return 'SP'
      return null
    })
    const wrapper = mount(StaffNotation, { vuetify })
    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="put-back-on"]').trigger('click')
    await Vue.nextTick()
    const menuItemUnderTest = wrapper.find('[data-type="put-back-on"]')

    // verify enabled Put Back On option
    expect(menuItemUnderTest.classes()).not.toContain('v-list-item--disabled')

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
})

describe('StaffNotation', () => {
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: vi.fn() } as any

    const configuration = {
      VUE_APP_BUSINESS_CREATE_URL: 'https://create.url/',
      VUE_APP_BUSINESS_EDIT_URL: 'https://edit.url/'
    }

    // set configurations
    configurationStore.setConfiguration(configuration)
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    // allow all filings referenced in this component
    // some of these are normally mutually exclusive, but that's OK for testing
    businessStore.setAllowedActions({
      digitalBusinessCard: false,
      filing: {
        filingTypes: [
          { name: FilingTypes.REGISTRARS_NOTATION },
          { name: FilingTypes.REGISTRARS_ORDER },
          { name: FilingTypes.COURT_ORDER },
          { name: FilingTypes.CONVERSION },
          { name: FilingTypes.DISSOLUTION }, // FUTURE: add dissolution type
          { name: FilingTypes.RESTORATION, type: FilingSubTypes.FULL_RESTORATION },
          { name: FilingTypes.PUT_BACK_ON },
          { name: FilingTypes.ADMIN_FREEZE },
          { name: FilingTypes.CONSENT_CONTINUATION_OUT },
          { name: FilingTypes.RESTORATION, type: FilingSubTypes.LIMITED_RESTORATION_EXTENSION },
          { name: FilingTypes.RESTORATION, type: FilingSubTypes.LIMITED_RESTORATION_TO_FULL }
        ]
      } as any
    })
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP) // firm
    businessStore.setState(EntityState.ACTIVE) // not historical
    businessStore.setAdminFreeze(false) // not frozen
    businessStore.setIdentifier('SP1234567') // business id
  })

  it('renders menu button correctly', () => {
    const wrapper = mount(StaffNotation, { vuetify })

    expect(wrapper.vm.$data.expand).toBe(false)
    expect(wrapper.find('.menu-btn').text()).toBe('Add Staff Filing')

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - full list, all allowed actions', async () => {
    const wrapper = mount(StaffNotation, { vuetify })
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
        type: 'put-back-on',
        label: 'Put Back On',
        disabled: false
      },
      {
        type: 'administrative-dissolution',
        label: 'Administrative Dissolution',
        disabled: false
      },
      {
        type: 'admin-freeze',
        label: 'Freeze Business',
        disabled: false
      }
      // only displayed for corps and coops (not firms)
      // {
      //   type: 'consent-continue-out',
      //   label: 'Consent to Continuation Out',
      //   disabled: false
      // },
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
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY) // not firm

    const wrapper = mount(StaffNotation, { vuetify })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // verify item
    expect(wrapper.find('[data-type="record-conversion"]').exists()).toBe(false)

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - historical', async () => {
    // set store specifically for this test
    businessStore.setState(EntityState.HISTORICAL)

    const wrapper = mount(StaffNotation, { vuetify })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // verify item
    expect(wrapper.find('[data-type="administrative-dissolution"]').exists()).toBe(false)
    wrapper.destroy()
  })

  it('renders drop-down menu correctly - frozen', async () => {
    // set store specifically for this test
    businessStore.setAdminFreeze(true) // frozen

    const wrapper = mount(StaffNotation, { vuetify })

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // verify item
    expect(wrapper.find('[data-type="admin-freeze"]').text()).toBe('Unfreeze Business')

    wrapper.destroy()
  })

  it('renders drop-down menu correctly - full list, no allowed actions', async () => {
    // set store specifically for this test
    businessStore.setAllowedActions(null) // no allowed filings

    const wrapper = mount(StaffNotation, { vuetify })

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
      }
      // only displayed for corps and coops (not firms
      // {
      //   type: 'consent-continue-out',
      //   label: 'Consent to Continuation Out',
      //   disabled: true
      // }
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

  it('renders drop down menu correctly - historical', async () => {
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-restoration-entities') return 'SP'
      return null
    })
    businessStore.setState(EntityState.HISTORICAL)
    const wrapper = mount(StaffNotation, { vuetify })

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
        type: 'admin-freeze',
        label: 'Freeze Business',
        disabled: false
      },
      {
        type: 'restoration',
        label: 'Restore Company',
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
      const wrapper = mount(StaffNotation, { vuetify })

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

  it('renders the staff notation dialog correction for Put Back Onaa', async () => {
    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'supported-put-back-on-entities') return 'SP'
      return null
    })
    const wrapper = mount(StaffNotation, { vuetify })

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
    const wrapper = mount(StaffNotation, { vuetify })

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
    const wrapper = mount(StaffNotation, { vuetify, localVue })

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
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY) // corp
    businessStore.setIdentifier('BC1234567')
    businessStore.setState(EntityState.HISTORICAL)
    // stub "create draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/BC1234567/filings?draft=true').returns(
      new Promise(resolve =>
        resolve({ data: { filing: { header: { filingId: 1234 } } } })
      )
    )

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const wrapper = mount(StaffNotation, { vuetify, localVue })

    // spy on build and create methods
    const buildRestorationFiling = vi.spyOn((wrapper.vm as any), 'buildRestorationFiling')
    const createFiling = vi.spyOn((LegalServices as any), 'createFiling')

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="restoration"]').trigger('click')
    await Vue.nextTick()

    // verify that build and create methods were called
    expect(buildRestorationFiling).toHaveBeenCalled()
    expect(createFiling).toHaveBeenCalled()
    await Vue.nextTick()

    // verify redirection
    expect(window.location.assign).toHaveBeenCalledWith('https://create.url/?id=BC1234567')

    wrapper.destroy()
    sinon.restore()
  })

  it('goes to limited restoration extension filing', async () => {
    // set store specifically for this test
    businessStore.setLegalType(CorpTypeCd.BC_COMPANY)
    businessStore.setIdentifier('BC1234567')
    businessStore.setState(EntityState.HISTORICAL)
    // stub "create draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/BC1234567/filings?draft=true').returns(
      new Promise(resolve =>
        resolve({ data: { filing: { header: { filingId: 1234 } } } })
      )
    )

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const wrapper = mount(StaffNotation, { vuetify, localVue })

    // spy on build and create methods
    const buildRestorationFiling = vi.spyOn((wrapper.vm as any), 'buildRestorationFiling')
    const createFiling = vi.spyOn((LegalServices as any), 'createFiling')

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="extend-limited-restoration"]').trigger('click')
    await Vue.nextTick()

    // verify that build and create methods were called
    expect(buildRestorationFiling).toHaveBeenCalled()
    expect(createFiling).toHaveBeenCalled()

    // need to update DOM to not get previous test results
    await waitForUpdate(2)

    // verify redirection
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://edit.url/BC1234567/limitedRestorationExtension?restoration-id=1234')

    wrapper.destroy()
    sinon.restore()
  })

  it('goes to limited restoration conversion filing', async () => {
    // set store specifically for this test
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setIdentifier('BC1234567')
    rootStore.currentDate = '2022-12-31'
    businessStore.setState(EntityState.HISTORICAL)
    rootStore.setStateFiling({
      business: {
        state: 'ACTIVE'
      },
      restoration: {
        type: 'limitedRestoration'
      }
    })

    // stub "create draft" endpoint
    sinon.stub(axios, 'post').withArgs('businesses/BC1234567/filings?draft=true').returns(
      new Promise(resolve =>
        resolve({ data: { filing: { header: { filingId: 1234 } } } })
      )
    )

    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const wrapper = mount(StaffNotation, { vuetify, localVue })

    // spy on build and create methods
    const buildRestorationFiling = vi.spyOn((wrapper.vm as any), 'buildRestorationFiling')
    const createFiling = vi.spyOn((LegalServices as any), 'createFiling')

    // open menu
    await wrapper.find('.menu-btn').trigger('click')
    expect(wrapper.vm.$data.expand).toBe(true)

    // find and click respective item
    await wrapper.find('.v-list-item[data-type="convert-full-restoration"]').trigger('click')
    await Vue.nextTick()

    // verify that build and create methods were called
    expect(buildRestorationFiling).toHaveBeenCalled()
    expect(createFiling).toHaveBeenCalled()

    // need to update DOM to not get previous test results
    await waitForUpdate(3)

    // verify redirection
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://edit.url/BC1234567/limitedRestorationToFull?restoration-id=1234')

    wrapper.destroy()
    sinon.restore()
  })
})
