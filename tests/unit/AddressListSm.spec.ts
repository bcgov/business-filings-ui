import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'

import { getVuexStore } from '@/store'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import { mount } from '@vue/test-utils'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('AddressListSm', () => {
  it('handles empty data', async () => {
    // init store
    store.state.registeredAddress = null
    store.state.recordsAddress = null

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.registeredAddress).toBeNull()
    expect(vm.recordsAddress).toBeNull()

    wrapper.destroy()
  })

  it('displays all addresses when a COOP', async () => {
    // init store
    store.state.business.legalType = 'CP'
    store.state.registeredAddress = {
      'deliveryAddress':
      {
        'streetAddress': '111 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '222 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }
    store.state.recordsAddress = null

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.registeredAddress).toBeDefined()
    expect(vm.recordsAddress).toBeNull()

    // verify registered addresses
    expect(vm.$el.querySelector('#registered-office-panel .delivery-address-list-item .address-subtitle')
      .textContent).toContain('111 Buchanan St')
    expect(vm.$el.querySelector('#registered-office-panel .mailing-address-list-item .same-as-above'))
      .toBeNull()
    expect(vm.$el.querySelector('#registered-office-panel .mailing-address-list-item .address-subtitle')
      .textContent).toContain('222 Buchanan St')

    wrapper.destroy()
  })

  it('displays "same as above" when a COOP', async () => {
    // init store
    store.state.business.legalType = 'CP'
    store.state.registeredAddress = {
      'deliveryAddress':
      {
        'streetAddress': '220 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '220 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }
    store.state.recordsAddress = null

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.registeredAddress).toBeDefined()
    expect(vm.recordsAddress).toBeNull()

    // verify registered addresses
    expect(vm.$el.querySelector('#registered-office-panel .delivery-address-list-item .address-subtitle')
      .textContent).toContain('220 Buchanan St')
    expect(vm.$el.querySelector('#registered-office-panel .mailing-address-list-item .same-as-above')
      .textContent).toContain('Same as above')
    expect(vm.$el.querySelector('#registered-office-panel .mailing-address-list-item .address-subtitle'))
      .toBeNull()

    wrapper.destroy()
  })

  it('displays all addresses when a BCOMP', async () => {
    // init store
    store.state.business.legalType = 'BEN'
    store.state.registeredAddress = {
      'deliveryAddress':
      {
        'streetAddress': '111 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '222 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }
    store.state.recordsAddress = {
      'deliveryAddress':
      {
        'streetAddress': '123 Cloverdale St',
        'addressCity': 'Victoria',
        'addressRegion': 'BC',
        'postalCode': 'V8X 2T5',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '456 Cloverdale St',
        'addressCity': 'Victoria',
        'addressRegion': 'BC',
        'postalCode': 'V8X 2T5',
        'addressCountry': 'CA'
      }
    }

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // Click the records office tab to display the addresses
    await wrapper.find('#records-office-panel-toggle').trigger('click')
    await Vue.nextTick() // wait for DOM to update

    expect(vm.registeredAddress).toBeDefined()
    expect(vm.recordsAddress).toBeDefined()

    // verify registered addresses
    expect(wrapper.find('#registered-office-panel .delivery-address-list-item .address-subtitle').text())
      .toContain('111 Buchanan St')
    expect(wrapper.find('#registered-office-panel .mailing-address-list-item .same-as-above').exists())
      .toBe(false)
    expect(wrapper.find('#registered-office-panel .mailing-address-list-item .address-subtitle').text())
      .toContain('222 Buchanan St')

    // verify records addresses
    expect(wrapper.find('#records-office-panel .delivery-address-list-item .address-subtitle').text())
      .toContain('123 Cloverdale St')
    expect(wrapper.find('#records-office-panel .mailing-address-list-item .same-as-above').exists())
      .toBe(false)
    expect(wrapper.find('#records-office-panel .mailing-address-list-item .address-subtitle').text())
      .toContain('456 Cloverdale St')

    // verify that "complete your filing" message isn't displayed
    expect(wrapper.find('#registered-office-panel .delivery-address-list-item .complete-filing').exists())
      .toBe(false)
    expect(wrapper.find('#registered-office-panel .mailing-address-list-item .complete-filing').exists())
      .toBe(false)
    expect(wrapper.find('#records-office-panel .delivery-address-list-item .complete-filing').exists())
      .toBe(false)
    expect(wrapper.find('#records-office-panel .mailing-address-list-item .complete-filing').exists())
      .toBe(false)

    // verify that expansion panel doesn't have "disabled" class
    expect(wrapper.find('#registered-office-panel').classes()).not.toContain('disabled')

    // verify that expansion buttons are clickable
    expect(wrapper.find('#registered-office-panel-toggle').attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('#records-office-panel-toggle').attributes('tabindex')).toBeUndefined()

    // verify that expansion icons are displayed
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(0).isVisible()).toBe(true)
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(1).isVisible()).toBe(true)

    wrapper.destroy()
  })

  it('displays "same as above" when a BCOMP', async () => {
    // init store
    store.state.business.legalType = 'BEN'
    store.state.registeredAddress = {
      'deliveryAddress':
      {
        'streetAddress': '220 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '220 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }
    store.state.recordsAddress = {
      'deliveryAddress':
      {
        'streetAddress': '123 Cloverdale St',
        'addressCity': 'Victoria',
        'addressRegion': 'BC',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '123 Cloverdale St',
        'addressCity': 'Victoria',
        'addressRegion': 'BC',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // Click the records office tab to display the addresses
    await wrapper.find('#records-office-panel-toggle').trigger('click')
    await Vue.nextTick() // wait for DOM to update

    expect(vm.registeredAddress).toBeDefined()
    expect(vm.recordsAddress).toBeDefined()

    // verify registered addresses
    expect(vm.$el.querySelector('#registered-office-panel .delivery-address-list-item .address-subtitle')
      .textContent).toContain('220 Buchanan St')
    expect(vm.$el.querySelector('#registered-office-panel .mailing-address-list-item .same-as-above')
      .textContent).toContain('Same as above')
    expect(vm.$el.querySelector('#registered-office-panel .mailing-address-list-item .address-subtitle'))
      .toBeNull()

    // verify records addresses
    expect(vm.$el.querySelector('#records-office-panel .delivery-address-list-item .address-subtitle')
      .textContent).toContain('123 Cloverdale St')
    expect(vm.$el.querySelector('#records-office-panel .mailing-address-list-item .same-as-above')
      .textContent).toContain('Same as above')
    expect(vm.$el.querySelector('#records-office-panel .mailing-address-list-item .address-subtitle'))
      .toBeNull()

    wrapper.destroy()
  })

  it('displays "complete your filing" message', async () => {
    // init store
    store.state.business.legalType = 'BEN'

    const wrapper = mount(AddressListSm,
      {
        store,
        vuetify,
        propsData: {
          showCompleteYourFilingMessage: true
        }
      })
    await Vue.nextTick()

    // click the records office tab to display the addresses
    await wrapper.find('#records-office-panel-toggle').trigger('click')

    const expectedMessage = 'Complete your filing to display'
    expect(wrapper.find('#registered-office-panel .delivery-address-list-item .complete-filing').text())
      .toBe(expectedMessage)
    expect(wrapper.find('#registered-office-panel .mailing-address-list-item .complete-filing').text())
      .toBe(expectedMessage)
    expect(wrapper.find('#records-office-panel .delivery-address-list-item .complete-filing').text())
      .toBe(expectedMessage)
    expect(wrapper.find('#records-office-panel .mailing-address-list-item .complete-filing').text())
      .toBe(expectedMessage)

    wrapper.destroy()
  })

  it('displays "grayed out" mode', async () => {
    // init store
    store.state.business.legalType = 'BEN'
    store.state.registeredAddress = {
      'deliveryAddress':
      {
        'streetAddress': '111 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '222 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }
    store.state.recordsAddress = {
      'deliveryAddress':
      {
        'streetAddress': '123 Cloverdale St',
        'addressCity': 'Victoria',
        'addressRegion': 'BC',
        'postalCode': 'V8X 2T5',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '456 Cloverdale St',
        'addressCity': 'Victoria',
        'addressRegion': 'BC',
        'postalCode': 'V8X 2T5',
        'addressCountry': 'CA'
      }
    }

    const wrapper = mount(AddressListSm,
      {
        store,
        vuetify,
        propsData: {
          showGrayedOut: true
        }
      })
    await Vue.nextTick()

    // verify that expansion panel has "disabled" class
    expect(wrapper.find('#registered-office-panel').classes()).toContain('disabled')

    // verify that expansion buttons aren't clickable
    expect(wrapper.find('#registered-office-panel-toggle').attributes('tabindex')).toBe('-1')
    expect(wrapper.find('#records-office-panel-toggle').attributes('tabindex')).toBe('-1')

    // verify that expansion icons aren't displayed
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(0).isVisible()).toBe(false)
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(1).isVisible()).toBe(false)

    wrapper.destroy()
  })

  it('displays all addresses when a Firm', async () => {
    // init store
    store.state.business.legalType = 'SP'
    store.state.businessAddress = {
      'deliveryAddress':
      {
        'streetAddress': '111 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '222 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify business addresses
    expect(vm.$el.querySelector('#business-address-panel .delivery-address-list-item .address-subtitle')
      .textContent).toContain('111 Buchanan St')
    expect(vm.$el.querySelector('#business-address-panel .mailing-address-list-item .same-as-above'))
      .toBeNull()
    expect(vm.$el.querySelector('#business-address-panel .mailing-address-list-item .address-subtitle')
      .textContent).toContain('222 Buchanan St')

    wrapper.destroy()
  })

  it('displays "same as above" when a Firm', async () => {
    // init store
    store.state.business.legalType = 'SP'
    store.state.businessAddress = {
      'deliveryAddress':
      {
        'streetAddress': '220 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      },
      'mailingAddress':
      {
        'streetAddress': '220 Buchanan St',
        'addressCity': 'Glasgow',
        'addressRegion': 'Scotland',
        'postalCode': 'G1 2FFF',
        'addressCountry': 'CA'
      }
    }

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify registered addresses
    expect(vm.$el.querySelector('#business-address-panel .delivery-address-list-item .address-subtitle')
      .textContent).toContain('220 Buchanan St')
    expect(vm.$el.querySelector('#business-address-panel .mailing-address-list-item .same-as-above')
      .textContent).toContain('Same as above')
    expect(vm.$el.querySelector('#business-address-panell .mailing-address-list-item .address-subtitle'))
      .toBeNull()

    wrapper.destroy()
  })

  it('displays "complete your filing" message for firm registration', async () => {
    // init store
    store.state.business.legalType = 'SP'

    const wrapper = mount(AddressListSm,
      {
        store,
        vuetify,
        propsData: {
          showCompleteYourFilingMessage: true
        }
      })
    await Vue.nextTick()

    const expectedMessage = 'Complete your filing to display'
    expect(wrapper.find('#business-address-panel .delivery-address-list-item .complete-filing').text())
      .toBe(expectedMessage)
    expect(wrapper.find('#business-address-panel .mailing-address-list-item .complete-filing').text())
      .toBe(expectedMessage)
    expect(wrapper.find('#business-address-panel .delivery-address-list-item .complete-filing').text())
      .toBe(expectedMessage)
    expect(wrapper.find('#business-address-panel .mailing-address-list-item .complete-filing').text())
      .toBe(expectedMessage)

    wrapper.destroy()
  })

  it('displays "(Not entered)" message for firm registration', async () => {
    // init store
    store.state.business.legalType = 'SP'
    store.state.businessAddress = {
      'deliveryAddress': null,
      'mailingAddress': null
    }

    const wrapper = mount(AddressListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // Verify delivery address '(Not entered)'
    expect(vm.$el.querySelector('#business-address-panel .delivery-address-list-item .delivery-address-not-entered')
      .textContent).toContain('(Not entered)')
    expect(vm.$el.querySelector('#business-address-panel .delivery-address-list-item .address-line1'))
      .toBeNull()

    // verify mailing address '(Not entered)'
    expect(vm.$el.querySelector('#business-address-panel .mailing-address-list-item .mailing-address-not-entered')
      .textContent).toContain('(Not entered)')
    expect(vm.$el.querySelector('#business-address-panel .mailing-address-list-item .same-as-above'))
      .toBeNull()
    expect(vm.$el.querySelector('#business-address-panel .mailing-address-list-item .address-subtitle .address-line1'))
      .toBeNull()

    wrapper.destroy()
  })
})
