import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import ProprietorPartnersListSm from '@/components/Dashboard/ProprietorPartnersListSm.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

const PARTIES = [
  {
    officer: {
      firstName: 'Adam',
      lastName: 'Apple'
    },
    mailingAddress: {
      streetAddress: '111 Ardmore Ave',
      addressCity: 'Abbotsford',
      addressRegion: 'BC',
      postalCode: 'V1V 1V1',
      addressCountry: 'CA'
    },
    roles: [
      {
        appointmentDate: '2022-04-01',
        roleType: 'Director'
      }
    ]
  },
  {
    officer: {
      organizationName: 'Bacon House',
      taxId: '222222222'
    },
    mailingAddress: {
      streetAddress: '222 Burdett St',
      addressCity: 'Bowser',
      addressRegion: 'BC',
      postalCode: 'V2V 2V2',
      addressCountry: 'CA'
    },
    roles: [
      {
        appointmentDate: '2022-04-01',
        roleType: 'Proprietor'
      }
    ]
  },
  {
    officer: {
      firstName: 'Charles',
      lastName: 'Carrot'
    },
    mailingAddress: {
      streetAddress: '333 Cook St',
      addressCity: 'Castlegar',
      addressRegion: 'BC',
      postalCode: 'V3V 3V3',
      addressCountry: 'CA'
    },
    roles: [
      {
        appointmentDate: '2022-04-01',
        roleType: 'Partner'
      }
    ]
  },
  {
    officer: {
      organizationName: 'Donut House',
      taxId: '444444444'
    },
    mailingAddress: {
      streetAddress: '444 Dallas Rd',
      addressCity: 'Duncan',
      addressRegion: 'BC',
      postalCode: 'V4V 4V4',
      addressCountry: 'CA'
    },
    roles: [
      {
        appointmentDate: '2022-04-01',
        roleType: 'Partner'
      }
    ]
  }
]

describe('ProprietorPartnersListSm', () => {
  it('displays proprietor (SP filing)', async () => {
    // init store
    store.state.entityType = 'SP'
    store.state.parties = PARTIES

    const wrapper = mount(ProprietorPartnersListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getParties.length).toEqual(4)
    expect(vm.proprietorPartners.length).toEqual(1)
    expect(wrapper.find('.list-item__title').text()).toBe('Bacon House')

    wrapper.destroy()
  })

  it('displays partners (GP filing)', async () => {
    // init store
    store.state.entityType = 'GP'
    store.state.parties = PARTIES

    const wrapper = mount(ProprietorPartnersListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getParties.length).toEqual(4)
    expect(vm.proprietorPartners.length).toEqual(2)
    expect(wrapper.findAll('.list-item__title').at(0).text()).toBe('Charles  Carrot')
    expect(wrapper.findAll('.list-item__title').at(1).text()).toBe('Donut House')

    wrapper.destroy()
  })

  it('displays "complete your filing" message', async () => {
    // init store
    store.state.entityType = 'SP'

    const wrapper = mount(ProprietorPartnersListSm,
      {
        store,
        vuetify,
        propsData: {
          showCompleteYourFilingMessage: true
        }
      })
    await Vue.nextTick()

    // verify that "complete your filing" message is displayed
    expect(wrapper.find('.complete-filing').text()).toBe('Complete your filing to display')

    wrapper.destroy()
  })

  it('displays "grayed out" mode', async () => {
    // init store
    store.state.entityType = 'GP'
    store.state.parties = PARTIES

    const wrapper = mount(ProprietorPartnersListSm,
      {
        store,
        vuetify,
        propsData: {
          showGrayedOut: true
        }
      })
    await Vue.nextTick()

    // verify that component has "disabled" class
    expect(wrapper.classes()).toContain('disabled')

    // verify that expansion buttons aren't clickable
    expect(wrapper.findAll('.address-panel-toggle').at(0).attributes('tabindex')).toBe('-1')
    expect(wrapper.findAll('.address-panel-toggle').at(1).attributes('tabindex')).toBe('-1')

    // verify that expansion icons aren't displayed
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(0).isVisible()).toBe(false)
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(1).isVisible()).toBe(false)

    wrapper.destroy()
  })

  it('displays "not entered" message for firm registration', async () => {
    // init store
    store.state.entityType = 'GP'
    store.state.parties = [
      {
        officer: {
          organizationName: 'Bacon House',
          taxId: '222222222',
          email: null
        },
        deliveryAddress: null,
        mailingAddress: null,
        roles: [
          {
            appointmentDate: '2022-04-01',
            roleType: 'Partner'
          }
        ]
      },
      {
        officer: {
          organizationName: 'Donut House',
          taxId: '444444444',
          email: null
        },
        deliveryAddress: null,
        mailingAddress: null,
        roles: [
          {
            appointmentDate: '2022-04-01',
            roleType: 'Partner'
          }
        ]
      }
    ]

    const wrapper = mount(ProprietorPartnersListSm,
      {
        store,
        vuetify,
        propsData: {
          showCompleteYourFilingMessage: false
        }
      }
    )
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // Verify to organization names
    expect(vm.getParties.length).toEqual(2)
    expect(vm.proprietorPartners.length).toEqual(2)
    expect(wrapper.findAll('.list-item__title').at(0).text()).toBe('Bacon House')
    expect(wrapper.findAll('.list-item__title').at(1).text()).toBe('Donut House')

    // const item = vm.$el.querySelector('.v-expansion-panel-header.address-panel-toggle')
    // const items = vm.$el.querySelector('.align-items-top address-panel')
    const buttons = vm.$el.querySelectorAll('.v-expansion-panel-header.address-panel-toggle')
    await buttons[0].click()
    await buttons[1].click()

    // Verify delivery addresses 'Not Entered'
    expect(wrapper.findAll('.email-address-text').at(0).text()).toBe('Not Entered')
    expect(wrapper.findAll('.email-address-text').at(1).text()).toBe('Not Entered')

    // Verify mailing addresses 'Not Entered'
    expect(wrapper.findAll('.delivery-address-not-entered').at(0).text()).toBe('Not Entered')
    expect(wrapper.findAll('.delivery-address-not-entered').at(1).text()).toBe('Not Entered')

    // // Verify mailing addresses 'Not Entered'
    expect(wrapper.findAll('.mailing-address-not-entered').at(0).text()).toBe('Not Entered')
    expect(wrapper.findAll('.mailing-address-not-entered').at(1).text()).toBe('Not Entered')
    wrapper.destroy()
  })
})
