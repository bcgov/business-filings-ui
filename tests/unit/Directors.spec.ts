import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, Wrapper } from '@vue/test-utils'
import sinon from 'sinon'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import Directors from '@/components/common/Directors.vue'
import { ConfigJson } from '@/resources/business-config'
import { click } from '../click'
import { setValue } from '../setValue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Directors as a COOP', () => {
  let wrapper: Wrapper<Directors>
  let vm: any

  beforeAll(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityFoundingDate = new Date('2018-03-01T00:00:00')
    store.state.configObject = ConfigJson.find(x => x.entityType === 'CP')
  })

  beforeEach(async () => {
    // mock GET directors
    sinon.stub(axios, 'get')
      .withArgs('businesses/CP0001191/directors?date=2020-11-16')
      .returns(new Promise(resolve => resolve({
        data:
        {
          // NB: this list gets sorted by lastName, firstName, middleName
          directors: [
            {
              officer: {
                firstName: 'Sam',
                middleInitial: 'S',
                lastName: 'Swanson'
              },
              deliveryAddress: {
                streetAddress: 'street-1',
                streetAddressAdditional: 'additional-1',
                addressCity: 'city-1',
                addressCountry: 'UK',
                postalCode: 'UKU KUK',
                addressRegion: 'Scotland',
                deliveryInstructions: 'go to the loch'
              },
              role: 'director'
            },
            {
              officer: {
                firstName: 'Gary',
                lastName: 'Griffin'
              },
              deliveryAddress: {
                streetAddress: 'street-2',
                streetAddressAdditional: '',
                addressCity: 'city-2',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              role: 'director'
            },
            {
              officer: {
                firstName: 'Peter',
                lastName: 'Parker'
              },
              deliveryAddress: {
                streetAddress: 'street-3',
                streetAddressAdditional: '',
                addressCity: 'city-3',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              role: 'director'
            }
          ]
        }
      })))

    // mount the component
    wrapper = mount(Directors, { store, vuetify })
    vm = wrapper.vm

    // fetch original directors
    await vm.getOrigDirectors('2020-11-16', true)
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches the original director data', () => {
    // spot check original directors
    expect(vm.allDirectors.length).toBe(3)
    expect(vm.allDirectors[0].officer.firstName).toBe('Gary')
    expect(vm.allDirectors[1].officer.firstName).toBe('Peter')
    expect(vm.allDirectors[2].officer.firstName).toBe('Sam')
  })

  it('emits the director data', () => {
    // verify original directors were emitted
    const original = wrapper.emitted('original').pop()[0]
    expect(original.length).toBe(3)
    expect(original[0].officer.firstName).toBe('Gary')
    expect(original[1].officer.firstName).toBe('Peter')
    expect(original[2].officer.firstName).toBe('Sam')

    // verify working directors were emitted
    const directors = wrapper.emitted('update:directors').pop()[0]
    expect(directors.length).toBe(3)
    expect(directors[0].officer.firstName).toBe('Gary')
    expect(directors[1].officer.firstName).toBe('Peter')
    expect(directors[2].officer.firstName).toBe('Sam')

    // verify directors paid change was emitted
    const directorsPaidChange = wrapper.emitted('directorsPaidChange').pop()[0]
    expect(directorsPaidChange).toBe(false)

    // verify directors free change was emitted
    const directorsFreeChange = wrapper.emitted('directorsFreeChange').pop()[0]
    expect(directorsFreeChange).toBe(false)
  })

  it('displays the warning message for too few directors', async () => {
    // verify no compliance message initially
    expect(vm.complianceMsg).toBeNull()
    expect(wrapper.find('.compliance-section').exists()).toBe(false)
    expect(wrapper.find('.warning-text').exists()).toBe(false)

    // cease first director so there are now 2 of them
    await click(vm, '#director-1-cease-btn')

    // verify compliance message
    expect(vm.complianceMsg.title).toBe('Minimum Three Directors Required')
    expect(wrapper.find('.compliance-section').exists()).toBe(true)
    expect(wrapper.find('.warning-text').exists()).toBe(true)
  })

  it('displays the warning message for too few Canadian directors', async () => {
    // verify no compliance message initially
    expect(vm.complianceMsg).toBeNull()

    // change one director to non-Canadian so that now 2 out of 3 are non-Canadian
    const directors = [...vm.allDirectors]
    directors[0].deliveryAddress.addressCountry = 'UK'
    await wrapper.setProps({ directors })

    // verify compliance message
    expect(vm.complianceMsg.title).toBe('Canadian Resident Directors Required')
    expect(wrapper.find('.warning-text').text()).toBe('Canadian Resident Directors Required')
    // NB: compliance section doesn't display on initial render
  })

  it('displays the warning message for too few directors from BC', async () => {
    // verify no compliance message initially
    expect(vm.complianceMsg).toBeNull()

    // change all directors to non-BC so that now none are from BC
    const directors = [...vm.allDirectors]
    directors[0].deliveryAddress.addressRegion = 'ON'
    directors[1].deliveryAddress.addressRegion = 'ON'
    directors[2].deliveryAddress.addressRegion = 'ON'
    await wrapper.setProps({ directors })

    // verify compliance message
    expect(vm.complianceMsg.title).toBe('BC Resident Director Required')
    expect(wrapper.find('.warning-text').text()).toBe('BC Resident Director Required')
    // NB: compliance section doesn't display on initial render
  })

  it('sets the director IDs properly', () => {
    expect(vm.allDirectors.length).toEqual(3)
    expect(vm.allDirectors[0].id).toBe(1)
    expect(vm.allDirectors[1].id).toBe(2)
    expect(vm.allDirectors[2].id).toBe(3)
  })

  it('loads the director names properly', () => {
    expect(vm.allDirectors.length).toEqual(3)
    expect(vm.allDirectors[2].officer.firstName).toEqual('Sam')
    expect(vm.allDirectors[2].officer.middleInitial).toEqual('S')
    expect(vm.allDirectors[2].officer.lastName).toEqual('Swanson')
  })

  it('loads the director addresses properly', () => {
    // spot check one complete address
    const deliveryAddress = vm.allDirectors[2].deliveryAddress
    expect(deliveryAddress.streetAddress).toBe('street-1')
    expect(deliveryAddress.streetAddressAdditional).toBe('additional-1')
    expect(deliveryAddress.addressCity).toBe('city-1')
    expect(deliveryAddress.addressCountry).toBe('UK')
    expect(deliveryAddress.postalCode).toBe('UKU KUK')
    expect(deliveryAddress.addressRegion).toBe('Scotland')
    expect(deliveryAddress.deliveryInstructions).toBe('go to the loch')

    // verify no mailing address (for COOP director)
    expect(vm.allDirectors[2].mailingAddress).toBeUndefined()
  })

  it('displays the list of directors', () => {
    const directorListUI = wrapper.findAll('.director-list-item .director-list__first-name')
    expect(directorListUI.length).toBe(3)

    // spot check the director names
    expect(directorListUI.at(0).text()).toBe('Gary')
    expect(directorListUI.at(1).text()).toBe('Peter')
    expect(directorListUI.at(2).text()).toBe('Sam')

    // verify directors are active (initial state)
    // ("Cease" button indicates this is an active director)
    expect(vm.isActive(vm.allDirectors[0])).toBe(true)
    expect(vm.isActive(vm.allDirectors[1])).toBe(true)
    expect(vm.isActive(vm.allDirectors[2])).toBe(true)
  })

  it('disables buttons/actions when instructed by parent component', async () => {
    // clear enabled prop
    await wrapper.setProps({ componentEnabled: false })

    // confirm that flag is set correctly
    expect(vm.componentEnabled).toEqual(false)

    // check that first button in first director is disabled
    const directorListUI = vm.$el.querySelectorAll('.director-list-item')
    expect(directorListUI[0].querySelector('.cease-btn').disabled).toBe(true)

    // check that Appoint New Director button is not rendered
    expect(wrapper.find('.new-director-btn').exists()).toBe(false)
  })

  it('enables buttons/actions when instructed by parent component', async () => {
    // set enabled prop
    await wrapper.setProps({ componentEnabled: true })

    // confirm that flag is set correctly
    expect(vm.componentEnabled).toEqual(true)

    // check that first button in first director is enabled
    const directorListUI = vm.$el.querySelectorAll('.director-list-item')
    expect(directorListUI[0].querySelector('.cease-btn').disabled).toBe(false)

    // check that Appoint New Director button is enabled
    expect(vm.$el.querySelector('.new-director-btn').disabled).toBe(false)
  })

  it('displays Appoint New Director form when button clicked', async () => {
    // set enabled prop
    await wrapper.setProps({ componentEnabled: true })

    // confirm that flag is set correctly
    expect(vm.componentEnabled).toEqual(true)

    // check that Appoint New Director button is enabled
    expect(vm.$el.querySelector('.new-director-btn').disabled).toBe(false)

    // click Appoint New Director button
    await click(vm, '.new-director-btn')

    // check that button is hidden
    expect(wrapper.find('.new-director-btn').isVisible()).toBe(false)

    // check that form is showing
    expect(wrapper.find('ul.new-director').isVisible()).toBe(true)

    // check that inputs are showing
    expect(wrapper.find('#new-director__first-name').isVisible()).toBe(true)
    expect(wrapper.find('#new-director__middle-initial').isVisible()).toBe(true)
    expect(wrapper.find('#new-director__last-name').isVisible()).toBe(true)
  })

  it('handles "ceased" action', async () => {
    // click first director's cease button
    await click(vm, '#director-1-cease-btn')

    // check that button has changed to "undo"
    expect(vm.$el.querySelector('#director-1-cease-btn').innerHTML).toContain('Undo')

    // check that director is marked as ceased
    expect(vm.$el.querySelector('#director-1 .director-status').innerHTML).toContain('Ceased')

    // check that director object has the 'CEASED' action
    expect(vm.allDirectors.filter(el => el.id === 1)[0].actions).toContain('ceased')
  })

  it('handles "undo ceased" action', async () => {
    // click first director's cease button
    await click(vm, '#director-1-cease-btn')

    // click first director's undo cease button
    await click(vm, '#director-1-cease-btn')

    // check that button has changed back to "cease"
    expect(vm.$el.querySelector('#director-1-cease-btn').innerHTML).toContain('Cease')

    // check that director is not marked as ceased
    expect(vm.$el.querySelector('#director-1 .director-status .v-chip')
      .getAttribute('style')).toContain('display: none;')

    // check that director object does not have the 'CEASED' action
    expect(vm.allDirectors.filter(el => el.id === 1)[0].actions).not.toContain('ceased')
  })
})

describe('Directors as a COOP (no sync)', () => {
  let wrapper: Wrapper<Directors>
  let vm: any

  beforeAll(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityFoundingDate = new Date('2018-03-01T00:00:00')
    store.state.configObject = ConfigJson.find(x => x.entityType === 'CP')
  })

  beforeEach(async () => {
    // mock GET directors
    sinon.stub(axios, 'get')
      .withArgs('businesses/CP0001191/directors?date=2020-11-16')
      .returns(new Promise(resolve => resolve({
        data:
        {
          // NB: this list gets sorted by lastName, firstName, middleName
          directors: [
            {
              officer: {
                firstName: 'Sam',
                middleInitial: 'S',
                lastName: 'Swanson'
              },
              deliveryAddress: {
                streetAddress: 'street-1',
                streetAddressAdditional: 'additional-1',
                addressCity: 'city-1',
                addressCountry: 'UK',
                postalCode: 'UKU KUK',
                addressRegion: 'Scotland',
                deliveryInstructions: 'go to the loch'
              },
              role: 'director'
            },
            {
              officer: {
                firstName: 'Gary',
                lastName: 'Griffin'
              },
              deliveryAddress: {
                streetAddress: 'street-2',
                streetAddressAdditional: '',
                addressCity: 'city-2',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              role: 'director'
            },
            {
              officer: {
                firstName: 'Peter',
                lastName: 'Parker'
              },
              deliveryAddress: {
                streetAddress: 'street-3',
                streetAddressAdditional: '',
                addressCity: 'city-3',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              role: 'director'
            }
          ]
        }
      })))

    // mount the component
    wrapper = mount(Directors, { store, vuetify })
    vm = wrapper.vm

    // fetch original directors
    await vm.getOrigDirectors('2020-11-16', true)
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('displays the change legal name form when enabled', async () => {
    // change third director's legal name
    await vm.editDirectorName(2)

    // Verify that only Change Name component is shown
    expect(vm.editFormShowHide.showAddress).toEqual(false)
    expect(vm.editFormShowHide.showName).toEqual(true)
    expect(vm.editFormShowHide.showDates).toEqual(false)

    // verify director names on screen
    expect(wrapper.find('.edit-director__first-name input').element['value']).toBe('Sam')
    expect(wrapper.find('.edit-director__middle-initial input').element['value']).toBe('S')
    expect(wrapper.find('.edit-director__last-name input').element['value']).toBe('Swanson')
  })

  it('displays the edit Director form when enabled and stores the updated value', async () => {
    // change first director's legal name
    await vm.editDirectorName(0)

    // verify that only Show Name section is shown
    expect(vm.editFormShowHide.showAddress).toEqual(false)
    expect(vm.editFormShowHide.showName).toEqual(true)
    expect(vm.editFormShowHide.showDates).toEqual(false)

    // verify the initial data
    expect(vm.allDirectors[0].officer.firstName).toBe('Gary')

    // change the input text
    await setValue(vm, '.edit-director__first-name input', 'Steve')

    // verify the updated data
    expect(vm.allDirectors[0].officer.firstName).toBe('Steve')
  })

  it('restores the directors name to its original value when the Cancel Edit Btn is clicked', async () => {
    // Open the edit director
    await vm.editDirectorName(0)

    // Verify the correct data in the text input field
    expect(vm.$el.querySelectorAll('.edit-director__first-name input')[0].value).toBe('Gary')

    // Change the text input
    await setValue(vm, '.edit-director__first-name input', 'Steve')

    // Verify the name is updated
    expect(vm.allDirectors[0].officer.firstName).toBe('Steve')

    // Cancel Director edit and verify the name is back to its base name
    await wrapper.findAll('.cancel-edit-btn').at(0).trigger('click')
    expect(vm.allDirectors[0].officer.firstName).toBe('Gary')

    // Verify the edit form is closed.
    expect(vm.editFormShowHide.showAddress).toEqual(true)
    expect(vm.editFormShowHide.showName).toEqual(true)
    expect(vm.editFormShowHide.showDates).toEqual(true)
  })

  it('disables director reset button prior to any editing', async () => {
    // Open the edit director
    await vm.editDirectorName(0)

    // Verify the reset is disabled prior to any director edit
    const resetBtn = vm.$el.querySelectorAll('.reset-name-btn')[0]
    expect(resetBtn.disabled).toBe(true)
  })

  it('enables director reset button once a director name is edited', async () => {
    // Open the edit director
    await vm.editDirectorName(0)

    // Verify the correct data in the text input field
    expect(vm.$el.querySelectorAll('.edit-director__first-name input')[0].value).toBe('Gary')

    // Change the text input
    await setValue(vm, '.edit-director__first-name input', 'Steve')

    // Verify the name is updated
    expect(vm.allDirectors[0].officer.firstName).toBe('Steve')

    // Verify the reset is disabled prior to any director edit
    expect(vm.$el.querySelectorAll('.reset-name-btn')[0].disabled).toBe(true)

    // Click Done btn and update the directors name
    await wrapper.findAll('.done-edit-btn').at(0).trigger('click')

    // Re Open the edit director
    await vm.editDirectorName(0)

    expect(vm.$el.querySelectorAll('.edit-director__first-name input')[0].value).toBe('Steve')

    // Verify the reset is now enabled post director name edit
    expect(vm.$el.querySelectorAll('.reset-name-btn')[0].disabled).toBe(false)
  })

  it('restores the directors name to its original value when reset is clicked', async () => {
    // Open the edit director
    await vm.editDirectorName(0)

    // Verify the correct data in the text input field
    expect(vm.$el.querySelectorAll('.edit-director__first-name input')[0].value).toBe('Gary')

    // Change the text input
    await setValue(vm, '.edit-director__first-name input', 'Steve')

    // Verify the name is updated
    expect(vm.allDirectors[0].officer.firstName).toBe('Steve')

    // Verify the reset is disabled prior to any director edit
    expect(vm.$el.querySelectorAll('.reset-name-btn')[0].disabled).toBe(true)

    // Click Done btn and update the directors name
    await wrapper.findAll('.done-edit-btn').at(0).trigger('click')

    // Verify Updated Data in the directors list
    expect(vm.allDirectors[0].officer.firstName).toEqual('Steve')
    expect(vm.allDirectors[0].actions[0]).toEqual('nameChanged')

    // Re Open the edit director
    await vm.editDirectorName(0)

    expect(vm.$el.querySelectorAll('.edit-director__first-name input')[0].value).toBe('Steve')

    // Verify the reset is now enabled post director name edit
    expect(vm.$el.querySelectorAll('.reset-name-btn')[0].disabled).toBe(false)

    // Click the reset btn
    await wrapper.findAll('.reset-name-btn').at(0).trigger('click')

    // Verify reset Data in the directors list
    expect(vm.allDirectors[0].officer.firstName).toEqual('Gary')
    expect(vm.allDirectors[0].actions[0]).toBeUndefined()
  })

  // FUTURE: implement this
  // it('can change a director\'s address', () => {
  // })

  // FUTURE: implement this
  // it('can reset a director\'s address change', () => {
  // })

  // FUTURE: implement this
  // it('can change a director\'s name', () => {
  // })

  // FUTURE: implement this
  // it('can reset a director\'s name change', () => {
  // })
})

describe('Directors as a BCOMP', () => {
  let wrapper: Wrapper<Directors>
  let vm: any

  beforeAll(() => {
    // init store
    store.state.identifier = 'BC0007291'
    store.state.entityType = 'BEN'
    store.state.entityFoundingDate = new Date('2018-03-01T00:00:00')
    store.state.configObject = ConfigJson.find(x => x.entityType === 'BEN')
  })

  beforeEach(async () => {
    // mock GET directors
    sinon.stub(axios, 'get')
      .withArgs('businesses/BC0007291/directors?date=2020-11-16')
      .returns(new Promise(resolve => resolve({
        data:
        {
          // NB: this list gets sorted by lastName, firstName, middleName
          directors: [
            {
              officer: {
                firstName: 'Sam',
                middleInitial: 'S',
                lastName: 'Swanson'
              },
              deliveryAddress: {
                streetAddress: 'street-del-1',
                streetAddressAdditional: 'additional-del-1',
                addressCity: 'city-del-1',
                addressCountry: 'UK',
                postalCode: 'UKU KUK',
                addressRegion: 'Scotland',
                deliveryInstructions: 'go to the loch'
              },
              mailingAddress: {
                streetAddress: 'street-mail-1',
                streetAddressAdditional: 'additional-mail-1',
                addressCity: 'city-mail-1',
                addressCountry: 'UK',
                postalCode: 'UKU KUK',
                addressRegion: 'Scotland',
                deliveryInstructions: 'go to the highlands'
              },
              role: 'director'
            },
            {
              officer: {
                firstName: 'Gary',
                lastName: 'Griffin'
              },
              deliveryAddress: {
                streetAddress: 'street-del-2',
                streetAddressAdditional: '',
                addressCity: 'city-del-2',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              mailingAddress: {
                streetAddress: 'street-mail-2',
                streetAddressAdditional: '',
                addressCity: 'city-mail-2',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              role: 'director'
            },
            {
              officer: {
                firstName: 'Peter',
                lastName: 'Parker'
              },
              deliveryAddress: {
                streetAddress: 'street-del-3',
                streetAddressAdditional: '',
                addressCity: 'city-del-3',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              mailingAddress: {
                streetAddress: 'street-mail-3',
                streetAddressAdditional: '',
                addressCity: 'city-mail-3',
                addressCountry: 'CA',
                postalCode: 'CAN ADA',
                addressRegion: 'BC',
                deliveryInstructions: ''
              },
              role: 'director'
            }
          ]
        }
      })))

    // mount the component
    wrapper = mount(Directors, { store, vuetify })
    vm = wrapper.vm

    // fetch original directors
    await vm.getOrigDirectors('2020-11-16', true)
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('fetches the original director data', () => {
    // spot check original directors
    expect(vm.allDirectors.length).toBe(3)
    expect(vm.allDirectors[0].officer.firstName).toBe('Gary')
    expect(vm.allDirectors[1].officer.firstName).toBe('Peter')
    expect(vm.allDirectors[2].officer.firstName).toBe('Sam')
  })

  it('emits the director data', () => {
    // verify original directors were emitted
    const original = wrapper.emitted('original').pop()[0]
    expect(original.length).toBe(3)
    expect(original[0].officer.firstName).toBe('Gary')
    expect(original[1].officer.firstName).toBe('Peter')
    expect(original[2].officer.firstName).toBe('Sam')

    // verify working directors were emitted
    const directors = wrapper.emitted('update:directors').pop()[0]
    expect(directors.length).toBe(3)
    expect(directors[0].officer.firstName).toBe('Gary')
    expect(directors[1].officer.firstName).toBe('Peter')
    expect(directors[2].officer.firstName).toBe('Sam')

    // verify directors paid change was emitted
    const directorsPaidChange = wrapper.emitted('directorsPaidChange').pop()[0]
    expect(directorsPaidChange).toBe(false)

    // verify directors free change was emitted
    const directorsFreeChange = wrapper.emitted('directorsFreeChange').pop()[0]
    expect(directorsFreeChange).toBe(false)
  })

  it('displays the warning message for too few directors', async () => {
    // verify no compliance message initially
    expect(vm.complianceMsg).toBeNull()
    expect(wrapper.find('.compliance-section').exists()).toBe(false)
    expect(wrapper.find('.warning-text').exists()).toBe(false)

    // cease all 3 director so there are now no active directors
    await click(vm, '#director-1-cease-btn')
    await click(vm, '#director-2-cease-btn')
    await click(vm, '#director-3-cease-btn')

    expect(vm.complianceMsg.title).toBe('One Director Required')
    expect(wrapper.find('.compliance-section').exists()).toBe(true)
    expect(wrapper.find('.warning-text').exists()).toBe(true)
  })

  it('sets the director IDs properly', () => {
    expect(vm.allDirectors.length).toEqual(3)
    expect(vm.allDirectors[0].id).toBe(1)
    expect(vm.allDirectors[1].id).toBe(2)
    expect(vm.allDirectors[2].id).toBe(3)
  })

  it('loads the director names properly', () => {
    expect(vm.allDirectors.length).toEqual(3)
    expect(vm.allDirectors[2].officer.firstName).toEqual('Sam')
    expect(vm.allDirectors[2].officer.middleInitial).toEqual('S')
    expect(vm.allDirectors[2].officer.lastName).toEqual('Swanson')
  })

  it('loads the director addresses properly', () => {
    // spot check one complete address
    const deliveryAddress = vm.allDirectors[2].deliveryAddress
    expect(deliveryAddress.streetAddress).toBe('street-del-1')
    expect(deliveryAddress.streetAddressAdditional).toBe('additional-del-1')
    expect(deliveryAddress.addressCity).toBe('city-del-1')
    expect(deliveryAddress.addressCountry).toBe('UK')
    expect(deliveryAddress.postalCode).toBe('UKU KUK')
    expect(deliveryAddress.addressRegion).toBe('Scotland')
    expect(deliveryAddress.deliveryInstructions).toBe('go to the loch')

    const mailingAddress = vm.allDirectors[2].mailingAddress
    expect(mailingAddress.streetAddress).toBe('street-mail-1')
    expect(mailingAddress.streetAddressAdditional).toBe('additional-mail-1')
    expect(mailingAddress.addressCity).toBe('city-mail-1')
    expect(mailingAddress.addressCountry).toBe('UK')
    expect(mailingAddress.postalCode).toBe('UKU KUK')
    expect(mailingAddress.addressRegion).toBe('Scotland')
    expect(mailingAddress.deliveryInstructions).toBe('go to the highlands')
  })

  it('displays the list of directors', () => {
    const directorListUI = wrapper.findAll('.director-list-item .director-list__first-name')
    expect(directorListUI.length).toBe(3)

    // spot check the director names
    expect(directorListUI.at(0).text()).toBe('Gary')
    expect(directorListUI.at(1).text()).toBe('Peter')
    expect(directorListUI.at(2).text()).toBe('Sam')

    // verify directors are active (initial state)
    // ("Cease" button indicates this is an active director)
    expect(vm.isActive(vm.allDirectors[0])).toBe(true)
    expect(vm.isActive(vm.allDirectors[1])).toBe(true)
    expect(vm.isActive(vm.allDirectors[2])).toBe(true)
  })

  it('disables buttons/actions when instructed by parent component', async () => {
    // clear enabled prop
    await wrapper.setProps({ componentEnabled: false })

    // confirm that flag is set correctly
    expect(vm.componentEnabled).toEqual(false)

    // check that first button in first director is disabled
    const directorListUI = vm.$el.querySelectorAll('.director-list-item')
    expect(directorListUI[0].querySelector('.cease-btn').disabled).toBe(true)

    // check that Appoint New Director button is not rendered
    expect(wrapper.find('.new-director-btn').exists()).toBe(false)
  })

  it('enables buttons/actions when instructed by parent component', async () => {
    // set enabled prop
    await wrapper.setProps({ componentEnabled: true })

    // confirm that flag is set correctly
    expect(vm.componentEnabled).toEqual(true)

    // check that first button in first director is enabled
    const directorListUI = vm.$el.querySelectorAll('.director-list-item')
    expect(directorListUI[0].querySelector('.cease-btn').disabled).toBe(false)

    // check that Appoint New Director button is enabled
    expect(vm.$el.querySelector('.new-director-btn').disabled).toBe(false)
  })

  it('displays Appoint New Director form when button clicked', async () => {
    // set enabled prop
    await wrapper.setProps({ componentEnabled: true })

    // confirm that flag is set correctly
    expect(vm.componentEnabled).toEqual(true)

    // check that Appoint New Director button is enabled
    expect(vm.$el.querySelector('.new-director-btn').disabled).toBe(false)

    // click Appoint New Director button
    await click(vm, '.new-director-btn')

    // check that button is hidden
    expect(wrapper.find('.new-director-btn').isVisible()).toBe(false)

    // check that form is showing
    expect(wrapper.find('ul.new-director').isVisible()).toBe(true)

    // check that inputs are showing
    expect(wrapper.find('#new-director__first-name').isVisible()).toBe(true)
    expect(wrapper.find('#new-director__middle-initial').isVisible()).toBe(true)
    expect(wrapper.find('#new-director__last-name').isVisible()).toBe(true)
  })

  it('handles "ceased" action', async () => {
    // click first director's cease button
    await click(vm, '#director-1-cease-btn')

    // check that button has changed to "undo"
    expect(vm.$el.querySelector('#director-1-cease-btn').innerHTML).toContain('Undo')

    // check that director is marked as ceased
    expect(vm.$el.querySelector('#director-1 .director-status').innerHTML).toContain('Ceased')

    // check that director object has the 'CEASED' action
    expect(vm.allDirectors.filter(el => el.id === 1)[0].actions).toContain('ceased')
  })

  it('handles "undo ceased" action', async () => {
    // click first director's cease button
    await click(vm, '#director-1-cease-btn')

    // click first director's undo cease button
    await click(vm, '#director-1-cease-btn')

    // check that button has changed back to "cease"
    expect(vm.$el.querySelector('#director-1-cease-btn').innerHTML).toContain('Cease')

    // check that director is not marked as ceased
    expect(vm.$el.querySelector('#director-1 .director-status .v-chip')
      .getAttribute('style')).toContain('display: none;')

    // check that director object does not have the 'CEASED' action
    expect(vm.allDirectors.filter(el => el.id === 1)[0].actions).not.toContain('ceased')
  })

  // FUTURE: implement this
  // it('can change a director\'s address', () => {
  // })

  // FUTURE: implement this
  // it('can reset a director\'s address change', () => {
  // })

  // FUTURE: implement this
  // it('can change a director\'s name', () => {
  // })

  // FUTURE: implement this
  // it('can reset a director\'s name change', () => {
  // })
})

describe('Appoint New Director tests', () => {
  let wrapper: Wrapper<Directors>
  let vm: any

  beforeAll(() => {
    // init store
    store.state.identifier = 'CP0001191'
    store.state.entityType = 'CP'
    store.state.entityFoundingDate = new Date('2018-03-01T00:00:00')
    store.state.configObject = ConfigJson.find(x => x.entityType === 'CP')
  })

  beforeEach(async () => {
    // mock GET directors
    sinon.stub(axios, 'get')
      .withArgs('businesses/CP0001191/directors?date=2020-11-16')
      .returns(new Promise(resolve => resolve({
        data:
        {
          directors: []
        }
      })))

    // mount the component
    wrapper = mount(Directors, { store, vuetify })
    vm = wrapper.vm

    // fetch original directors
    await vm.getOrigDirectors('2020-11-16', true)

    // click Appoint New Director button
    await click(vm, '.new-director-btn')
  })

  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('accepts valid First Name', async () => {
    await wrapper.find('#new-director__first-name').setValue('First First')
    await Vue.nextTick()

    expect(vm.newDirector.officer.firstName).toBe('First First')

    // verify that there are no validation errors
    expect(vm.$el.querySelectorAll('.v-messages')[0].textContent).toBe('')
  })

  it('displays error for invalid First Name - leading spaces', async () => {
    await wrapper.find('#new-director__first-name').setValue('  First')
    await Vue.nextTick()

    expect(vm.newDirector.officer.firstName).toBe('  First')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[0].textContent).toContain('Invalid spaces')
  })

  it('displays error for invalid First Name - trailing spaces', async () => {
    await wrapper.find('#new-director__first-name').setValue('First  ')
    await Vue.nextTick()

    expect(vm.newDirector.officer.firstName).toBe('First  ')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[0].textContent).toContain('Invalid spaces')
  })

  it('allows First Name with multiple inline spaces', async () => {
    await wrapper.find('#new-director__first-name').setValue('First  First')
    await Vue.nextTick()

    expect(vm.newDirector.officer.firstName).toBe('First  First')

    // verify that validation error is not displayed
    expect(vm.$el.querySelectorAll('.v-messages')[0].textContent).toBe('')
  })

  it('accepts valid Middle Initial', async () => {
    await wrapper.find('#new-director__middle-initial').setValue('M M')
    await Vue.nextTick()

    expect(vm.newDirector.officer.middleInitial).toBe('M M')

    // verify that there are no validation errors
    expect(vm.$el.querySelectorAll('.v-messages')[1].textContent).toBe('')
  })

  it('displays error for invalid Middle Initial - leading spaces', async () => {
    await wrapper.find('#new-director__middle-initial').setValue('  M')
    await Vue.nextTick()

    expect(vm.newDirector.officer.middleInitial).toBe('  M')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[1].textContent).toContain('Invalid spaces')
  })

  it('displays error for invalid Middle Initial - trailing spaces', async () => {
    await wrapper.find('#new-director__middle-initial').setValue('M  ')
    await Vue.nextTick()

    expect(vm.newDirector.officer.middleInitial).toBe('M  ')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[1].textContent).toContain('Invalid spaces')
  })

  it('allows Middle Initial with multiple inline spaces', async () => {
    await wrapper.find('#new-director__middle-initial').setValue('M  M')
    await Vue.nextTick()

    expect(vm.newDirector.officer.middleInitial).toBe('M  M')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[1].textContent).toBe('')
  })

  it('accepts valid Last Name', async () => {
    await wrapper.find('#new-director__last-name').setValue('Last Last')
    await Vue.nextTick()

    expect(vm.newDirector.officer.lastName).toBe('Last Last')

    // verify that there are no validation errors
    expect(vm.$el.querySelectorAll('.v-messages')[2].textContent).toBe('')
  })

  it('displays error for invalid Last Name - leading spaces', async () => {
    await wrapper.find('#new-director__last-name').setValue('  Last')
    await Vue.nextTick()

    expect(vm.newDirector.officer.lastName).toBe('  Last')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[2].textContent).toContain('Invalid spaces')
  })

  it('displays error for invalid Last Name - trailing spaces', async () => {
    await wrapper.find('#new-director__last-name').setValue('Last  ')
    await Vue.nextTick()

    expect(vm.newDirector.officer.lastName).toBe('Last  ')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[2].textContent).toContain('Invalid spaces')
  })

  it('allows Last Name with multiple inline spaces', async () => {
    await wrapper.find('#new-director__last-name').setValue('Last  Last')
    await Vue.nextTick()

    expect(vm.newDirector.officer.lastName).toBe('Last  Last')

    // verify that validation error is displayed
    expect(vm.$el.querySelectorAll('.v-messages')[2].textContent).toBe('')
  })

  // FUTURE
  // it('can appoint a new director', () => {
  // })

  // FUTURE
  // it('can edit a new director', () => {
  // })

  // FUTURE
  // it('can remove a new director', () => {
  // })
})
