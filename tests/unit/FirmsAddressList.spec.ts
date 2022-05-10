import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import FirmsAddressList from '@/components/Dashboard/FirmsAddressList.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('FirmsAddressList', () => {
  it('displays title and icons for delivery/mailing address', async () => {
    // init store
    store.state.businessAddress = null

    const wrapper = mount(FirmsAddressList, {
      store,
      vuetify,
      propsData: {
        showCompleteYourFilingMessage: false,
        showGrayedOut: false
      }
    })
    await Vue.nextTick()

    // Verify delivery/mailing address title
    expect(wrapper.findAll('.address-title').at(0).text()).toBe('Delivery Address')
    expect(wrapper.findAll('.address-title').at(1).text()).toBe('Mailing Address')

    // Veryfi delivery/mailing icons
    expect(wrapper.find('.address-icon .v-icon.mdi-truck').exists()).toBeTruthy()
    expect(wrapper.find('.address-icon .v-icon.mdi-email-outline').exists()).toBeTruthy()

    wrapper.destroy()
  })

  it('displays "Complete your filing to display" for addresses', async () => {
    // init store
    store.state.businessAddress = null

    const wrapper = mount(FirmsAddressList, {
      store,
      vuetify,
      propsData: {
        showCompleteYourFilingMessage: true,
        showGrayedOut: false
      }
    })
    await Vue.nextTick()

    // Verify Not Entered Texts
    expect(wrapper.find('.delivery-address-list-item .complete-filing').text())
      .toBe('Complete your filing to display')
    expect(wrapper.find('.mailing-address-list-item .complete-filing').text())
      .toBe('Complete your filing to display')

    wrapper.destroy()
  })

  it('displays "Not Entered" for delivery/mailing address', async () => {
    // init store
    store.state.businessAddress = null

    const wrapper = mount(FirmsAddressList, {
      store,
      vuetify,
      propsData: {
        showCompleteYourFilingMessage: false,
        showGrayedOut: false
      }
    })
    await Vue.nextTick()

    // Verify Not Entered Texts
    expect(wrapper.find('.delivery-address-not-entered').text()).toBe('Not Entered')
    expect(wrapper.find('.mailing-address-not-entered').text()).toBe('Not Entered')

    wrapper.destroy()
  })

  it('displays same address for delivery/mailing address', async () => {
    let sameAddress = {
      streetAddress: '333 Cook St',
      addressCity: 'Castlegar',
      addressRegion: 'BC',
      postalCode: 'V3V 3V3',
      addressCountry: 'CA'
    }
    // init store
    store.state.businessAddress = {
      deliveryAddress: sameAddress,
      mailingAddress: sameAddress
    }

    const wrapper = mount(FirmsAddressList, {
      store,
      vuetify,
      propsData: {
        showCompleteYourFilingMessage: false,
        showGrayedOut: false
      }
    })
    await Vue.nextTick()

    // Verify delivery address
    expect(wrapper.find('.delivery-address-list-item .address-line1').text()).toBe('333 Cook St')
    expect(wrapper.find('.delivery-address-list-item .address-line2').text()).toBe('')
    expect(wrapper.find('.delivery-address-list-item .address-line3').text()).toContain('Castlegar')
    expect(wrapper.find('.delivery-address-list-item .address-line3').text()).toContain('BC')
    expect(wrapper.find('.delivery-address-list-item .address-line3').text()).toContain('V3V 3V3')
    expect(wrapper.find('.delivery-address-list-item .address-line4').text()).toBe('Canada')

    // Verify mailing address
    expect(wrapper.find('.mailing-address-list-item .same-as-above').text()).toBe('Same as above')

    wrapper.destroy()
  })

  it('displays different address for delivery/mailing address', async () => {
    let deliveryAddress = {
      streetAddress: '333 Cook St',
      addressCity: 'Castlegar',
      addressRegion: 'BC',
      postalCode: 'V3V 3V3',
      addressCountry: 'CA'
    }
    let mailingAddress = { ...deliveryAddress, streetAddress: '444 Fish Rd' }
    // init store
    store.state.businessAddress = {
      deliveryAddress: deliveryAddress,
      mailingAddress: mailingAddress
    }

    const wrapper = mount(FirmsAddressList, {
      store,
      vuetify,
      propsData: {
        showCompleteYourFilingMessage: false,
        showGrayedOut: false
      }
    })
    await Vue.nextTick()

    // Verify delivery address
    expect(wrapper.find('.delivery-address-list-item .address-line1').text()).toBe('333 Cook St')
    expect(wrapper.find('.delivery-address-list-item .address-line2').text()).toBe('')
    expect(wrapper.find('.delivery-address-list-item .address-line3').text()).toContain('Castlegar')
    expect(wrapper.find('.delivery-address-list-item .address-line3').text()).toContain('BC')
    expect(wrapper.find('.delivery-address-list-item .address-line3').text()).toContain('V3V 3V3')
    expect(wrapper.find('.delivery-address-list-item .address-line4').text()).toBe('Canada')

    // Verify mailing address
    expect(wrapper.find('.mailing-address-list-item .address-line1').text()).toBe('444 Fish Rd')
    expect(wrapper.find('.mailing-address-list-item .address-line2').text()).toBe('')
    expect(wrapper.find('.mailing-address-list-item .address-line3').text()).toContain('Castlegar')
    expect(wrapper.find('.mailing-address-list-item .address-line3').text()).toContain('BC')
    expect(wrapper.find('.mailing-address-list-item .address-line3').text()).toContain('V3V 3V3')
    expect(wrapper.find('.mailing-address-list-item .address-line4').text()).toBe('Canada')

    wrapper.destroy()
  })
})
