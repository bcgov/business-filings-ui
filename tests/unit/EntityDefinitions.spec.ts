import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import EntityDefinitions from '@/components/EntityInfo/EntityDefinitions.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const configurationStore = useConfigurationStore()
const rootStore = useRootStore()

describe('Entity Definitions component', () => {
  it('handles empty data', async () => {
    // set empty store properties
    rootStore.businessEmail = null
    rootStore.businessPhone = null
    rootStore.businessPhoneExtension = null
    configurationStore.setConfiguration({ VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    businessStore.setFoundingDate(null)
    businessStore.setIdentifier(null)
    businessStore.setLegalType(null)
    rootStore.nameRequest = null
    businessStore.setTaxId(null) // aka business number

    const wrapper = shallowMount(EntityDefinitions, { vuetify, propsData: { businessId: null } })
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
    rootStore.businessEmail = 'business@mail.zzz'
    rootStore.businessPhone = '(111)222-3333'
    rootStore.businessPhoneExtension = '444'
    configurationStore.setConfiguration({ VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    businessStore.setFoundingDate(null)
    businessStore.setIdentifier('CP0001191')
    businessStore.setLegalType(CorpTypeCd.COOP)
    rootStore.nameRequest = null
    businessStore.setTaxId('123456789')

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityDefinitions, { vuetify, propsData: { businessId: 'CP0001191' } })
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
    rootStore.businessEmail = 'business@mail.zzz'
    rootStore.businessPhone = '(111)222-3333'
    rootStore.businessPhoneExtension = '444'
    configurationStore.setConfiguration({ VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    businessStore.setFoundingDate('2023-01-06T22:21:35.965694+00:00')
    businessStore.setIdentifier('FM0001191')
    businessStore.setLegalType(CorpTypeCd.PARTNERSHIP)
    businessStore.setTaxId('123456789')

    // mount the component and wait for everything to stabilize
    const wrapper = shallowMount(EntityDefinitions, { vuetify, propsData: { businessId: 'FM0001191' } })
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
    rootStore.businessEmail = null
    rootStore.businessPhone = null
    rootStore.businessPhoneExtension = null
    configurationStore.setConfiguration({ VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    businessStore.setFoundingDate(null)
    businessStore.setIdentifier(null)
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    businessStore.setTaxId(null)

    const wrapper = shallowMount(EntityDefinitions, { vuetify, propsData: { businessId: null } })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#registration-date').exists()).toBe(false)
    expect(wrapper.find('#registration-number').exists()).toBe(false)
    expect(wrapper.find('#business-number').exists()).toBe(false)
    expect(wrapper.find('#incorporation-number').exists()).toBe(false)
    expect(wrapper.find('#email').exists()).toBe(false)
    expect(wrapper.find('#phone').exists()).toBe(false)
  })

  it('displays IA info properly - Numbered Benefit Company', async () => {
    // set store properties
    rootStore.businessEmail = null
    rootStore.businessPhone = null
    rootStore.businessPhoneExtension = null
    configurationStore.setConfiguration({ VUE_APP_AUTH_WEB_URL: 'auth-web-url/' })
    businessStore.setFoundingDate(null)
    businessStore.setIdentifier(null)
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.nameRequest = null
    businessStore.setTaxId(null)

    const wrapper = shallowMount(EntityDefinitions, { vuetify, propsData: { businessId: null } })
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
