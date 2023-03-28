import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import EntityDefinitions from '@/components/EntityInfo/EntityDefinitions.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Entity Definitions component', () => {
  it('handles empty data', async () => {
    // set empty store properties
    store.state.businessEmail = null
    store.state.businessPhone = null
    store.state.businessPhoneExtension = null
    store.commit('setConfiguration', { VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    store.commit('setFoundingDate', null)
    store.commit('setIdentifier', null)
    store.commit('setLegalType', null)
    store.state.nameRequest = null
    store.commit('setTaxId', null) // aka business number

    const wrapper = shallowMount(EntityDefinitions, { store, vuetify, propsData: { businessId: null } })
    await Vue.nextTick()

    // verify getter and elements
    expect((wrapper.vm as any).getBusinessProfileUrl).toBe('auth-web-url/businessprofile')
    expect(wrapper.find('#registration-date').exists()).toBe(false)
    expect(wrapper.find('#registration-number').exists()).toBe(false)
    expect(wrapper.find('#business-number').exists()).toBe(false)
    expect(wrapper.find('#incorporation-number').exists()).toBe(false)
    expect(wrapper.find('#name-request-number').exists()).toBe(false)
    expect(wrapper.find('#email').exists()).toBe(false)
    expect(wrapper.find('#phone').exists()).toBe(false)
  })

  it('displays Business info properly - Coop', async () => {
    // set store properties
    store.state.businessEmail = 'business@mail.zzz'
    store.state.businessPhone = '(111)222-3333'
    store.state.businessPhoneExtension = '444'
    store.commit('setConfiguration', { VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    store.commit('setFoundingDate', null)
    store.commit('setIdentifier', 'CP0001191')
    store.commit('setLegalType', 'CP')
    store.state.nameRequest = null
    store.commit('setTaxId', '123456789')

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityDefinitions, { store, vuetify, propsData: { businessId: 'CP0001191' } })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#registration-date').exists()).toBe(false)
    expect(wrapper.find('#registration-number').exists()).toBe(false)
    expect(wrapper.find('#business-number').text()).toBe('123456789')
    expect(wrapper.find('#incorporation-number').text()).toBe('CP0001191')
    expect(wrapper.find('#name-request-number').exists()).toBe(false)
    expect(wrapper.find('#email span').text()).toBe('business@mail.zzz')
    expect(wrapper.find('#phone span').text()).toBe('(111)222-3333 x444')
  })

  it('displays Business info properly - Firm', async () => {
    // set store properties
    store.state.businessEmail = 'business@mail.zzz'
    store.state.businessPhone = '(111)222-3333'
    store.state.businessPhoneExtension = '444'
    store.commit('setConfiguration', { VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    store.commit('setFoundingDate', '2023-01-06T22:21:35.965694+00:00')
    store.commit('setIdentifier', 'FM0001191')
    store.commit('setLegalType', 'GP')
    store.commit('setTaxId', '123456789')

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityDefinitions, { store, vuetify, propsData: { businessId: 'FM0001191' } })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#registration-date').text()).toBe('January 6, 2023')
    expect(wrapper.find('#registration-number').text()).toBe('FM0001191')
    expect(wrapper.find('#business-number').text()).toBe('123456789')
    expect(wrapper.find('#incorporation-number').exists()).toBe(false)
    expect(wrapper.find('#name-request-number').exists()).toBe(false)
    expect(wrapper.find('#email span').text()).toBe('business@mail.zzz')
    expect(wrapper.find('#phone span').text()).toBe('(111)222-3333 x444')
  })

  it('displays IA info properly - Named Benefit Company', async () => {
    // set store properties
    store.state.businessEmail = null
    store.state.businessPhone = null
    store.state.businessPhoneExtension = null
    store.commit('setConfiguration', { VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    store.commit('setFoundingDate', null)
    store.commit('setIdentifier', null)
    store.commit('setLegalType', 'BEN')
    store.state.nameRequest = { nrNum: 'NR 1234567' }
    store.commit('setTaxId', null) // aka business number

    const wrapper = shallowMount(EntityDefinitions, { store, vuetify, propsData: { businessId: null } })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#registration-date').exists()).toBe(false)
    expect(wrapper.find('#registration-number').exists()).toBe(false)
    expect(wrapper.find('#business-number').exists()).toBe(false)
    expect(wrapper.find('#incorporation-number').exists()).toBe(false)
    expect(wrapper.find('#name-request-number').text()).toBe('NR 1234567')
    expect(wrapper.find('#email').exists()).toBe(false)
    expect(wrapper.find('#phone').exists()).toBe(false)
  })

  it('displays IA info properly - Numbered Benefit Company', async () => {
    // set store properties
    store.state.businessEmail = null
    store.state.businessPhone = null
    store.state.businessPhoneExtension = null
    store.commit('setConfiguration', { VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    store.commit('setFoundingDate', null)
    store.commit('setIdentifier', null)
    store.commit('setLegalType', 'BEN')
    store.state.nameRequest = null
    store.commit('setTaxId', null) // aka business number

    const wrapper = shallowMount(EntityDefinitions, { store, vuetify, propsData: { businessId: null } })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#registration-date').exists()).toBe(false)
    expect(wrapper.find('#registration-number').exists()).toBe(false)
    expect(wrapper.find('#business-number').exists()).toBe(false)
    expect(wrapper.find('#incorporation-number').exists()).toBe(false)
    expect(wrapper.find('#name-request-number').exists()).toBe(false)
    expect(wrapper.find('#email').exists()).toBe(false)
    expect(wrapper.find('#phone').exists()).toBe(false)
  })
})
