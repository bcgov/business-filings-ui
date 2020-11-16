import Vue from 'vue'
import Vuelidate from 'vuelidate'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { OfficeAddresses } from '@/components/common'
import { mount, Wrapper } from '@vue/test-utils'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

function getAddressX (x: number) {
  return {
    addressCity: `city${x}`,
    addressCountry: 'CA',
    addressRegion: 'BC',
    deliveryInstructions: `instructions${x}`,
    postalCode: `postal${x}`,
    streetAddress: `street${x}`,
    streetAddressAdditional: `additional${x}`
  }
}

describe('OfficeAddresses as a COOP', () => {
  beforeAll(() => {
    store.state.entityType = 'CP'
  })

  it('loads the current office addresses from the store', () => {
    // init store
    store.state.registeredAddress = {
      deliveryAddress: getAddressX(1),
      mailingAddress: getAddressX(2)
    }

    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ store, vuetify })
    const vm: any = instance.$mount()

    // Verify the `same as above text is not displayed
    expect(vm.$el.querySelector('#sameAsAbove')).toBeNull()

    const deliveryAddress = vm.registeredAddress.deliveryAddress
    expect(deliveryAddress['streetAddress']).toEqual('street1')
    expect(deliveryAddress['streetAddressAdditional']).toEqual('additional1')
    expect(deliveryAddress['addressCity']).toEqual('city1')
    expect(deliveryAddress['addressRegion']).toEqual('BC')
    expect(deliveryAddress['postalCode']).toEqual('postal1')
    expect(deliveryAddress['addressCountry']).toEqual('CA')
    expect(deliveryAddress['deliveryInstructions']).toEqual('instructions1')

    const mailingAddress = vm.registeredAddress.mailingAddress
    expect(mailingAddress['streetAddress']).toEqual('street2')
    expect(mailingAddress['streetAddressAdditional']).toEqual('additional2')
    expect(mailingAddress['addressCity']).toEqual('city2')
    expect(mailingAddress['addressRegion']).toEqual('BC')
    expect(mailingAddress['postalCode']).toEqual('postal2')
    expect(mailingAddress['addressCountry']).toEqual('CA')
    expect(mailingAddress['deliveryInstructions']).toEqual('instructions2')
  })

  it('loads the current office addresses from a draft filing', () => {
    const draftAddresses = {
      registeredOffice: {
        deliveryAddress: getAddressX(1),
        mailingAddress: getAddressX(2)
      }
    }

    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ propsData: { addresses: draftAddresses }, store, vuetify })
    const vm: any = instance.$mount()

    // Verify the `same as above text is not displayed
    expect(vm.$el.querySelector('#sameAsAbove')).toBeNull()

    const deliveryAddress = vm.addresses.registeredOffice.deliveryAddress
    expect(deliveryAddress['streetAddress']).toEqual('street1')
    expect(deliveryAddress['streetAddressAdditional']).toEqual('additional1')
    expect(deliveryAddress['addressCity']).toEqual('city1')
    expect(deliveryAddress['addressRegion']).toEqual('BC')
    expect(deliveryAddress['postalCode']).toEqual('postal1')
    expect(deliveryAddress['addressCountry']).toEqual('CA')
    expect(deliveryAddress['deliveryInstructions']).toEqual('instructions1')

    const mailingAddress = vm.addresses.registeredOffice.mailingAddress
    expect(mailingAddress['streetAddress']).toEqual('street2')
    expect(mailingAddress['streetAddressAdditional']).toEqual('additional2')
    expect(mailingAddress['addressCity']).toEqual('city2')
    expect(mailingAddress['addressRegion']).toEqual('BC')
    expect(mailingAddress['postalCode']).toEqual('postal2')
    expect(mailingAddress['addressCountry']).toEqual('CA')
    expect(mailingAddress['deliveryInstructions']).toEqual('instructions2')
  })

  it('displays the "same as above" text when the addresses match', () => {
    store.state.registeredAddress = {
      deliveryAddress: getAddressX(1),
      mailingAddress: getAddressX(1)
    }
    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ store, vuetify })
    const vm: any = instance.$mount()

    // Verify "same as above" text is displayed
    expect(vm.$el.querySelector('#sameAsAbove').textContent).toBe('Mailing Address same as above')

    expect(vm.mailingAddress).toEqual(vm.deliveryAddress)
  })

  it('does not display the "same as above" text when the addresses do not match', () => {
    store.state.registeredAddress = {
      deliveryAddress: getAddressX(1),
      mailingAddress: getAddressX(2)
    }
    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ store, vuetify })
    const vm: any = instance.$mount()

    // Verify "same as above" text is not displayed
    expect(vm.$el.querySelector('#sameAsAbove')).toBeNull()

    expect(vm.mailingAddress).not.toEqual(vm.deliveryAddress)
  })

  it('has enabled Change button', () => {
    const wrapper: Wrapper<OfficeAddresses> = mount(OfficeAddresses, {
      //
      // TODO: check if we can get rid of sync prop (here and Directors)
      //
      sync: false,
      propsData: { componentEnabled: true },
      store,
      vuetify
    })

    expect(wrapper.find('#reg-off-addr-change-btn').attributes('disabled')).toBeUndefined()
  })

  it('has disabled Change button', () => {
    const wrapper: Wrapper<OfficeAddresses> = mount(OfficeAddresses, {
      sync: false,
      propsData: { componentEnabled: false },
      store,
      vuetify
    })

    expect(wrapper.find('#reg-off-addr-change-btn').attributes('disabled')).toBeDefined()
  })
})

describe('OfficeAddresses as a BCOMP', () => {
  beforeAll(() => {
    // init store
    store.state.entityType = 'BEN'
  })

  it('loads the current office addresses from the store', () => {
    store.state.registeredAddress = {
      deliveryAddress: getAddressX(1),
      mailingAddress: getAddressX(2)
    }
    store.state.recordsAddress = {
      deliveryAddress: getAddressX(3),
      mailingAddress: getAddressX(4)
    }

    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ store, vuetify })
    const vm: any = instance.$mount()

    // Verify the `same as above text is not displayed
    expect(vm.$el.querySelector('#sameAsAbove')).toBeNull()

    // Verify the `same as registered` text is not displayed
    expect(vm.$el.querySelector('#sameAsRegistered')).toBeNull()

    const deliveryAddress = vm.registeredAddress.deliveryAddress
    expect(deliveryAddress['streetAddress']).toEqual('street1')
    expect(deliveryAddress['streetAddressAdditional']).toEqual('additional1')
    expect(deliveryAddress['addressCity']).toEqual('city1')
    expect(deliveryAddress['addressRegion']).toEqual('BC')
    expect(deliveryAddress['postalCode']).toEqual('postal1')
    expect(deliveryAddress['addressCountry']).toEqual('CA')
    expect(deliveryAddress['deliveryInstructions']).toEqual('instructions1')

    const mailingAddress = vm.registeredAddress.mailingAddress
    expect(mailingAddress['streetAddress']).toEqual('street2')
    expect(mailingAddress['streetAddressAdditional']).toEqual('additional2')
    expect(mailingAddress['addressCity']).toEqual('city2')
    expect(mailingAddress['addressRegion']).toEqual('BC')
    expect(mailingAddress['postalCode']).toEqual('postal2')
    expect(mailingAddress['addressCountry']).toEqual('CA')
    expect(mailingAddress['deliveryInstructions']).toEqual('instructions2')

    const recDeliveryAddress = vm.recordsAddress.deliveryAddress
    expect(recDeliveryAddress['streetAddress']).toEqual('street3')
    expect(recDeliveryAddress['streetAddressAdditional']).toEqual('additional3')
    expect(recDeliveryAddress['addressCity']).toEqual('city3')
    expect(recDeliveryAddress['addressRegion']).toEqual('BC')
    expect(recDeliveryAddress['postalCode']).toEqual('postal3')
    expect(recDeliveryAddress['addressCountry']).toEqual('CA')
    expect(recDeliveryAddress['deliveryInstructions']).toEqual('instructions3')

    const recMailingAddress = vm.recordsAddress.mailingAddress
    expect(recMailingAddress['streetAddress']).toEqual('street4')
    expect(recMailingAddress['streetAddressAdditional']).toEqual('additional4')
    expect(recMailingAddress['addressCity']).toEqual('city4')
    expect(recMailingAddress['addressRegion']).toEqual('BC')
    expect(recMailingAddress['postalCode']).toEqual('postal4')
    expect(recMailingAddress['addressCountry']).toEqual('CA')
    expect(recMailingAddress['deliveryInstructions']).toEqual('instructions4')
  })

  it('loads the current office addresses from a draft filing', () => {
    const draftAddresses = {
      registeredOffice: {
        deliveryAddress: getAddressX(1),
        mailingAddress: getAddressX(2)
      },
      recordsOffice: {
        deliveryAddress: getAddressX(3),
        mailingAddress: getAddressX(4)
      }
    }

    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ propsData: { addresses: draftAddresses }, store, vuetify })
    const vm: any = instance.$mount()

    // Verify the `same as above text is not displayed
    expect(vm.$el.querySelector('#sameAsAbove')).toBeNull()

    // Verify the `same as registered` text is not displayed
    expect(vm.$el.querySelector('#sameAsRegistered')).toBeNull()

    const deliveryAddress = vm.addresses.registeredOffice.deliveryAddress
    expect(deliveryAddress['streetAddress']).toEqual('street1')
    expect(deliveryAddress['streetAddressAdditional']).toEqual('additional1')
    expect(deliveryAddress['addressCity']).toEqual('city1')
    expect(deliveryAddress['addressRegion']).toEqual('BC')
    expect(deliveryAddress['postalCode']).toEqual('postal1')
    expect(deliveryAddress['addressCountry']).toEqual('CA')
    expect(deliveryAddress['deliveryInstructions']).toEqual('instructions1')

    const mailingAddress = vm.addresses.registeredOffice.mailingAddress
    expect(mailingAddress['streetAddress']).toEqual('street2')
    expect(mailingAddress['streetAddressAdditional']).toEqual('additional2')
    expect(mailingAddress['addressCity']).toEqual('city2')
    expect(mailingAddress['addressRegion']).toEqual('BC')
    expect(mailingAddress['postalCode']).toEqual('postal2')
    expect(mailingAddress['addressCountry']).toEqual('CA')
    expect(mailingAddress['deliveryInstructions']).toEqual('instructions2')

    const recDeliveryAddress = vm.addresses.recordsOffice.deliveryAddress
    expect(recDeliveryAddress['streetAddress']).toEqual('street3')
    expect(recDeliveryAddress['streetAddressAdditional']).toEqual('additional3')
    expect(recDeliveryAddress['addressCity']).toEqual('city3')
    expect(recDeliveryAddress['addressRegion']).toEqual('BC')
    expect(recDeliveryAddress['postalCode']).toEqual('postal3')
    expect(recDeliveryAddress['addressCountry']).toEqual('CA')
    expect(recDeliveryAddress['deliveryInstructions']).toEqual('instructions3')

    const recMailingAddress = vm.addresses.recordsOffice.mailingAddress
    expect(recMailingAddress['streetAddress']).toEqual('street4')
    expect(recMailingAddress['streetAddressAdditional']).toEqual('additional4')
    expect(recMailingAddress['addressCity']).toEqual('city4')
    expect(recMailingAddress['addressRegion']).toEqual('BC')
    expect(recMailingAddress['postalCode']).toEqual('postal4')
    expect(recMailingAddress['addressCountry']).toEqual('CA')
    expect(recMailingAddress['deliveryInstructions']).toEqual('instructions4')
  })

  it('displays the "same as registered" text when records and registered addresses match', () => {
    store.state.registeredAddress = {
      deliveryAddress: getAddressX(1),
      mailingAddress: getAddressX(2)
    }
    store.state.recordsAddress = {
      deliveryAddress: getAddressX(1),
      mailingAddress: getAddressX(2)
    }

    const Constructor = Vue.extend(OfficeAddresses)
    const instance = new Constructor({ store, vuetify })
    const vm: any = instance.$mount()

    // Verify "same as above" text is not displayed
    expect(vm.$el.querySelector('#sameAsAbove')).toBeNull()

    // Verify "same as registered" text is displayed
    expect(vm.$el.querySelector('#sameAsRegistered').textContent).toBe('Same as Registered Office')

    expect(vm.recordsAddress).toEqual(vm.registeredAddress)
  })

  it('has enabled Change button', () => {
    const wrapper: Wrapper<OfficeAddresses> = mount(OfficeAddresses, {
      sync: false,
      propsData: { componentEnabled: true },
      store,
      vuetify
    })

    expect(wrapper.find('#reg-off-addr-change-btn').attributes('disabled')).toBeUndefined()
  })

  it('has disabled Change button', () => {
    const wrapper: Wrapper<OfficeAddresses> = mount(OfficeAddresses, {
      sync: false,
      propsData: { componentEnabled: false },
      store,
      vuetify
    })

    expect(wrapper.find('#reg-off-addr-change-btn').attributes('disabled')).toBeDefined()
  })
})
