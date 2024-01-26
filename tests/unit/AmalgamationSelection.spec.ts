import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import AmalgamationSelection from '@/views/AmalgamationSelection.vue'
import { useBusinessStore } from '@/stores'
import { createPinia, setActivePinia } from 'pinia'
import VueRouter from 'vue-router'
import mockRouter from './mockRouter'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { LegalServices } from '@/services'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const localVue = createLocalVue()
localVue.use(VueRouter)
setActivePinia(createPinia())

describe('AmalgamationSelection', () => {
  let wrapper: any

  beforeEach(() => {
    const router = mockRouter.mock()
    router.push({ name: 'amalgamation-selection', params: { filingId: '0' } })
    wrapper = mount(AmalgamationSelection,
      {
        localVue,
        router,
        vuetify
      })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('initializes correctly', () => {
    expect(wrapper.find('#amalgamation-selection').exists()).toBe(true)
    expect(wrapper.find('#start-horizontal-short-form-card').exists()).toBe(true)
    expect(wrapper.find('#start-vertical-short-form-card').exists()).toBe(true)
    expect(wrapper.find('#start-regular-long-form-card').exists()).toBe(true)
    expect(wrapper.find('.btn-div').exists()).toBe(true)
  })

  it('content of horizontal short form card is correct', () => {
    const vm = wrapper.vm as any
    useBusinessStore().setLegalType(CorpTypeCd.BC_COMPANY)
    
    expect(wrapper.find('#start-horizontal-short-form-card > h2').text()).toBe('Horizontal short-form amalgamation')
    expect(wrapper.find('#start-horizontal-short-form-card > p').text()).toContain(
      'A horizontal short-form amalgamation can be used if the amalgamating corporations')
    expect(wrapper.find('#start-horizontal-short-form-card > p').text()).toContain(
      'are all wholly owned subsidiaries of the same holding body corporate.')
    expect(wrapper.find('#horizontal-short-form-btn').text()).toBe('Start Horizontal Short-form')
    expect(wrapper.find('#horizontal-short-form-btn').classes()).not.toContain('v-btn--disabled')
  })

  it('content of vertical short form card is correct', () => {
    const vm = wrapper.vm as any
    useBusinessStore().setLegalType(CorpTypeCd.BC_COMPANY)

    expect(wrapper.find('#start-vertical-short-form-card > h2').text()).toBe('Vertical short-form amalgamation')
    expect(wrapper.find('#start-vertical-short-form-card > p').text()).toContain(
      'A vertical short-form amalgamation can be used if the subsidiary')
    expect(wrapper.find('#start-vertical-short-form-card > p').text()).toContain(
      'corporations are wholly owned by the corporation they are amalgamating with.')
    expect(wrapper.find('#vertical-short-form-btn').text()).toBe('Start Vertical Short-form')
    expect(wrapper.find('#vertical-short-form-btn').classes()).not.toContain('v-btn--disabled')
  })

  it('content of regular long form card is correct', () => {
    const vm = wrapper.vm as any
    useBusinessStore().setLegalType(CorpTypeCd.BC_COMPANY)

    expect(wrapper.find('#start-regular-long-form-card > h2').text()).toBe('Regular long-form amalgamation')
    expect(wrapper.find('#start-regular-long-form-card > p').text()).toContain(
      'If amalgamating corporations don\'t meet criteria for a short-form amalgamation, they')
    expect(wrapper.find('#start-regular-long-form-card > p').text()).toContain(
      'need to complete the following steps to amalgamate:')
    expect(wrapper.find('#regular-long-form-btn').text()).toBe('Start Regular Long-form')
    expect(wrapper.find('#regular-long-form-btn').classes()).not.toContain('v-btn--disabled') // enabled

    expect(vm.getRegularAmalgamationText()).toBe('BC limited company')
  })

  it('start regular long-form button clicked', async () => {
    const createFiling = vi.spyOn((LegalServices as any), 'createDraftBusiness')
    const button = wrapper.find('#regular-long-form-btn')
    await button.trigger('click')

    expect(createFiling).toHaveBeenCalled()
  })

  it('start horizontal short-form button clicked', async () => {
    const createFiling = vi.spyOn((LegalServices as any), 'createDraftBusiness')
    const button = wrapper.find('#horizontal-short-form-btn')
    await button.trigger('click')

    expect(createFiling).toHaveBeenCalled()
  })

  it('start vertical short-form button clicked', async () => {
    const createFiling = vi.spyOn((LegalServices as any), 'createDraftBusiness')
    const button = wrapper.find('#vertical-short-form-btn')
    await button.trigger('click')

    expect(createFiling).toHaveBeenCalled()
  })
})
