import Vue from 'vue'
import Vuelidate from 'vuelidate' // needed?
import Vuetify from 'vuetify'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import axios from '@/axios-auth'
import { getVuexStore } from '@/store'
import { OfficeAddresses } from '@/components/common'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // make type-less for unit tests
const sinonAxiosGet = sinon.stub(axios, 'get')

function getAddressX (x: number, type: string): any {
  return {
    addressCity: `city${x}`,
    addressCountry: 'CA',
    addressRegion: 'BC',
    addressType: type,
    deliveryInstructions: `instructions${x}`,
    postalCode: `postal${x}`,
    streetAddress: `street${x}`,
    streetAddressAdditional: `additional${x}`
  }
}

describe('OfficeAddresses as a COOP', () => {
  beforeAll(() => {
    store.state.entityType = 'CP'
    store.state.entityIncNo = 'CP0000841'
  })

  it('fetches the original office addresses with different delivery and mailing', async () => {
    const address1 = getAddressX(1, 'delivery')
    const address2 = getAddressX(2, 'mailing')

    // mock GET addresses
    sinonAxiosGet
      .withArgs('businesses/CP0000841/addresses?date=2020-11-16')
      .returns(new Promise((resolve) => resolve({
        data: {
          registeredOffice: {
            deliveryAddress: address1,
            mailingAddress: address2
          },
          recordsOffice: undefined
        }
      })))

    // mount the component
    const wrapper = mount(OfficeAddresses, { store, vuetify })

    // fetch original addresses
    await (wrapper.vm as any).getOrigAddresses('2020-11-16', true)

    // verify delivery address
    const regDelivAddressRows = wrapper.findAll('.registered-delivery-address .address-block__info-row')
    expect(regDelivAddressRows.at(0).text()).toBe(address1.streetAddress)
    expect(regDelivAddressRows.at(1).text()).toBe(address1.streetAddressAdditional)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressCity)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressRegion)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.postalCode)
    expect(regDelivAddressRows.at(3).text()).toBe('Canada')
    expect(regDelivAddressRows.at(4).text()).toBe(address1.deliveryInstructions)

    // verify that "mailing address same as above" text is not displayed
    expect(wrapper.find('#regMailSameAsDeliv').exists()).toBe(false)

    // verify mailing address
    const regMailAddressRows = wrapper.findAll('.registered-mailing-address .address-block__info-row')
    expect(regMailAddressRows.at(0).text()).toBe(address2.streetAddress)
    expect(regMailAddressRows.at(1).text()).toBe(address2.streetAddressAdditional)
    expect(regMailAddressRows.at(2).text()).toContain(address2.addressCity)
    expect(regMailAddressRows.at(2).text()).toContain(address2.addressRegion)
    expect(regMailAddressRows.at(2).text()).toContain(address2.postalCode)
    expect(regMailAddressRows.at(3).text()).toBe('Canada')
    expect(regMailAddressRows.at(4).text()).toBe(address2.deliveryInstructions)

    // verify original addresses were emitted
    const original = wrapper.emitted('original')
    expect(original.length).toBe(1)
    expect(original[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        }
      }]
    )

    // verify working addresses were emitted
    const addresses = wrapper.emitted('update:addresses')
    expect(addresses.length).toBe(1)
    expect(addresses[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        }
      }]
    )

    // verify modified state was emitted
    const modified = wrapper.emitted('modified')
    expect(modified.length).toBe(1)
    expect(modified[0]).toStrictEqual([false])
  })

  it('fetches the original office addresses with same delivery and mailing', async () => {
    const address1 = getAddressX(1, 'delivery')
    const address2 = getAddressX(1, 'mailing')

    // mock GET addresses
    sinonAxiosGet
      .withArgs('businesses/CP0000841/addresses?date=2020-11-16')
      .returns(new Promise((resolve) => resolve({
        data: {
          registeredOffice: {
            deliveryAddress: address1,
            mailingAddress: address2
          },
          recordsOffice: undefined
        }
      })))

    // mount the component
    const wrapper = mount(OfficeAddresses, { store, vuetify })

    // fetch original addresses
    await (wrapper.vm as any).getOrigAddresses('2020-11-16', true)

    // verify delivery address
    const regDelivAddressRows = wrapper.findAll('.registered-delivery-address .address-block__info-row')
    expect(regDelivAddressRows.at(0).text()).toBe(address1.streetAddress)
    expect(regDelivAddressRows.at(1).text()).toBe(address1.streetAddressAdditional)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressCity)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressRegion)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.postalCode)
    expect(regDelivAddressRows.at(3).text()).toBe('Canada')
    expect(regDelivAddressRows.at(4).text()).toBe(address1.deliveryInstructions)

    // verify that "mailing address same as above" text is displayed
    expect(wrapper.find('#regMailSameAsDeliv').exists()).toBe(true)

    // verify original addresses were emitted
    const original = wrapper.emitted('original')
    expect(original.length).toBe(1)
    expect(original[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        }
      }]
    )

    // verify working addresses were emitted
    const addresses = wrapper.emitted('update:addresses')
    expect(addresses.length).toBe(1)
    expect(addresses[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        }
      }]
    )

    // verify modified state was emitted
    const modified = wrapper.emitted('modified')
    expect(modified.length).toBe(1)
    expect(modified[0]).toStrictEqual([false])
  })

  it('has enabled Change button when enabled', () => {
    const wrapper = mount(OfficeAddresses, { store, vuetify, propsData: { componentEnabled: true } })

    expect(wrapper.find('#reg-off-addr-change-btn').attributes('disabled')).toBeUndefined()
  })

  it('has no Change button when component is disabled', () => {
    const wrapper = mount(OfficeAddresses, { store, vuetify, propsData: { componentEnabled: false } })

    expect(wrapper.find('#reg-off-addr-change-btn').exists()).toBe(false)
  })
})

describe('OfficeAddresses as a BCOMP', () => {
  beforeAll(() => {
    // init store
    store.state.entityType = 'BEN'
    store.state.entityIncNo = 'BC1218881'
  })

  it('fetches the original office addresses with different registered and records', async () => {
    const address1 = getAddressX(1, 'delivery')
    const address2 = getAddressX(2, 'mailing')
    const address3 = getAddressX(3, 'delivery')
    const address4 = getAddressX(4, 'mailing')

    // mock GET addresses
    sinonAxiosGet
      .withArgs('businesses/BC1218881/addresses?date=2020-11-16')
      .returns(new Promise((resolve) => resolve({
        data: {
          registeredOffice: {
            deliveryAddress: address1,
            mailingAddress: address2
          },
          recordsOffice: {
            deliveryAddress: address3,
            mailingAddress: address4
          }
        }
      })))

    // mount the component
    const wrapper = mount(OfficeAddresses, { store, vuetify })

    // fetch original addresses
    await (wrapper.vm as any).getOrigAddresses('2020-11-16', true)

    // verify registered delivery address
    const regDelivAddressRows = wrapper.findAll('.registered-delivery-address .address-block__info-row')
    expect(regDelivAddressRows.at(0).text()).toBe(address1.streetAddress)
    expect(regDelivAddressRows.at(1).text()).toBe(address1.streetAddressAdditional)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressCity)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressRegion)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.postalCode)
    expect(regDelivAddressRows.at(3).text()).toBe('Canada')
    expect(regDelivAddressRows.at(4).text()).toBe(address1.deliveryInstructions)

    // verify that "mailing address same as above" text is not displayed
    expect(wrapper.find('#regMailSameAsDeliv').exists()).toBe(false)

    // verify registered mailing address
    const regMailAddressRows = wrapper.findAll('.registered-mailing-address .address-block__info-row')
    expect(regMailAddressRows.at(0).text()).toBe(address2.streetAddress)
    expect(regMailAddressRows.at(1).text()).toBe(address2.streetAddressAdditional)
    expect(regMailAddressRows.at(2).text()).toContain(address2.addressCity)
    expect(regMailAddressRows.at(2).text()).toContain(address2.addressRegion)
    expect(regMailAddressRows.at(2).text()).toContain(address2.postalCode)
    expect(regMailAddressRows.at(3).text()).toBe('Canada')
    expect(regMailAddressRows.at(4).text()).toBe(address2.deliveryInstructions)

    // verify that "same as registered office" text is not displayed
    expect(wrapper.find('#recSameAsReg').exists()).toBe(false)

    // verify records delivery address
    const recDelivAddressRows = wrapper.findAll('.records-delivery-address .address-block__info-row')
    expect(recDelivAddressRows.at(0).text()).toBe(address3.streetAddress)
    expect(recDelivAddressRows.at(1).text()).toBe(address3.streetAddressAdditional)
    expect(recDelivAddressRows.at(2).text()).toContain(address3.addressCity)
    expect(recDelivAddressRows.at(2).text()).toContain(address3.addressRegion)
    expect(recDelivAddressRows.at(2).text()).toContain(address3.postalCode)
    expect(recDelivAddressRows.at(3).text()).toBe('Canada')
    expect(recDelivAddressRows.at(4).text()).toBe(address3.deliveryInstructions)

    // verify that "mailing address same as above" text is not displayed
    expect(wrapper.find('#recMailSameAsDeliv').exists()).toBe(false)

    // verify records mailing address
    const recMailAddressRows = wrapper.findAll('.records-mailing-address .address-block__info-row')
    expect(recMailAddressRows.at(0).text()).toBe(address4.streetAddress)
    expect(recMailAddressRows.at(1).text()).toBe(address4.streetAddressAdditional)
    expect(recMailAddressRows.at(2).text()).toContain(address4.addressCity)
    expect(recMailAddressRows.at(2).text()).toContain(address4.addressRegion)
    expect(recMailAddressRows.at(2).text()).toContain(address4.postalCode)
    expect(recMailAddressRows.at(3).text()).toBe('Canada')
    expect(recMailAddressRows.at(4).text()).toBe(address4.deliveryInstructions)

    // verify original addresses were emitted
    const original = wrapper.emitted('original')
    expect(original.length).toBe(1)
    expect(original[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        },
        recordsOffice:
        {
          deliveryAddress: { ...address3, actions: [] },
          mailingAddress: { ...address4, actions: [] }
        }
      }]
    )

    // verify working addresses were emitted
    const addresses = wrapper.emitted('update:addresses')
    expect(addresses.length).toBe(1)
    expect(addresses[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        },
        recordsOffice:
        {
          deliveryAddress: { ...address3, actions: [] },
          mailingAddress: { ...address4, actions: [] }
        }
      }]
    )

    // verify modified state was emitted
    const modified = wrapper.emitted('modified')
    expect(modified.length).toBe(1)
    expect(modified[0]).toStrictEqual([false])
  })

  it('fetches the original office addresses with same registered and records', async () => {
    const address1 = getAddressX(1, 'delivery')
    const address2 = getAddressX(2, 'mailing')

    // mock GET addresses
    sinonAxiosGet
      .withArgs('businesses/BC1218881/addresses?date=2020-11-16')
      .returns(new Promise((resolve) => resolve({
        data: {
          registeredOffice: {
            deliveryAddress: address1,
            mailingAddress: address2
          },
          recordsOffice: {
            deliveryAddress: address1,
            mailingAddress: address2
          }
        }
      })))

    // mount the component
    const wrapper = mount(OfficeAddresses, { store, vuetify })

    // fetch original addresses
    await (wrapper.vm as any).getOrigAddresses('2020-11-16', true)

    // verify registered delivery address
    const regDelivAddressRows = wrapper.findAll('.registered-delivery-address .address-block__info-row')
    expect(regDelivAddressRows.at(0).text()).toBe(address1.streetAddress)
    expect(regDelivAddressRows.at(1).text()).toBe(address1.streetAddressAdditional)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressCity)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.addressRegion)
    expect(regDelivAddressRows.at(2).text()).toContain(address1.postalCode)
    expect(regDelivAddressRows.at(3).text()).toBe('Canada')
    expect(regDelivAddressRows.at(4).text()).toBe(address1.deliveryInstructions)

    // verify that "mailing address same as above" text is not displayed
    expect(wrapper.find('#regMailSameAsDeliv').exists()).toBe(false)

    // verify registered mailing address
    const regMailAddressRows = wrapper.findAll('.registered-mailing-address .address-block__info-row')
    expect(regMailAddressRows.at(0).text()).toBe(address2.streetAddress)
    expect(regMailAddressRows.at(1).text()).toBe(address2.streetAddressAdditional)
    expect(regMailAddressRows.at(2).text()).toContain(address2.addressCity)
    expect(regMailAddressRows.at(2).text()).toContain(address2.addressRegion)
    expect(regMailAddressRows.at(2).text()).toContain(address2.postalCode)
    expect(regMailAddressRows.at(3).text()).toBe('Canada')
    expect(regMailAddressRows.at(4).text()).toBe(address2.deliveryInstructions)

    // verify that "same as registered office" text is displayed
    expect(wrapper.find('#recSameAsReg').exists()).toBe(true)

    // verify original addresses were emitted
    const original = wrapper.emitted('original')
    expect(original.length).toBe(1)
    expect(original[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        },
        recordsOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        }
      }]
    )

    // verify working addresses were emitted
    const addresses = wrapper.emitted('update:addresses')
    expect(addresses.length).toBe(1)
    expect(addresses[0]).toStrictEqual(
      [{
        registeredOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        },
        recordsOffice:
        {
          deliveryAddress: { ...address1, actions: [] },
          mailingAddress: { ...address2, actions: [] }
        }
      }]
    )

    // verify modified state was emitted
    const modified = wrapper.emitted('modified')
    expect(modified.length).toBe(1)
    expect(modified[0]).toStrictEqual([false])
  })

  it('has enabled Change button when enabled', () => {
    const wrapper = mount(OfficeAddresses, { store, vuetify, propsData: { componentEnabled: true } })

    expect(wrapper.find('#reg-off-addr-change-btn').attributes('disabled')).toBeUndefined()
  })

  it('has no Change button when component is disabled', () => {
    const wrapper = mount(OfficeAddresses, { store, vuetify, propsData: { componentEnabled: false } })

    expect(wrapper.find('#reg-off-addr-change-btn').exists()).toBe(false)
  })
})
