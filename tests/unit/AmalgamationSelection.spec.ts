import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import AmalgamationSelection from '@/views/AmalgamationSelection.vue'
import { useBusinessStore } from '@/stores'
import { createPinia, setActivePinia } from 'pinia'
import VueRouter from 'vue-router'
import mockRouter from './mockRouter'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { BusinessServices } from '@/services'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const localVue = createLocalVue()
localVue.use(VueRouter)

describe('AmalgamationSelection', () => {
  let wrapper: any

  const mountComponent = (legalType: CorpTypeCd = CorpTypeCd.BC_COMPANY) => {
    setActivePinia(createPinia())
    const businessStore = useBusinessStore()
    businessStore.setLegalType(legalType)

    const router = mockRouter.mock()
    router.push({ name: 'amalgamation-selection' })

    wrapper = mount(AmalgamationSelection,
      {
        localVue,
        router,
        vuetify
      })
  }

  beforeEach(() => {
    mountComponent()
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
    expect(wrapper.find('#start-horizontal-short-form-card > h2').text()).toBe('Horizontal short-form amalgamation')
    expect(wrapper.find('#start-horizontal-short-form-card > p').text()).toContain(
      'A horizontal short-form amalgamation can be used if the amalgamating corporations')
    expect(wrapper.find('#start-horizontal-short-form-card > p').text()).toContain(
      'are all wholly owned subsidiaries of the same holding body corporate.')
    expect(wrapper.find('#horizontal-short-form-btn').text()).toBe('Start Horizontal Short-form')
    expect(wrapper.find('#horizontal-short-form-btn').classes()).not.toContain('v-btn--disabled')
  })

  it('content of vertical short form card is correct', () => {
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

    expect(wrapper.find('#start-regular-long-form-card > h2').text()).toBe('Regular long-form amalgamation')
    expect(wrapper.find('#start-regular-long-form-card > p').text()).toContain(
      'If amalgamating corporations don\'t meet criteria for a short-form amalgamation, they')
    expect(wrapper.find('#start-regular-long-form-card > p').text()).toContain(
      'need to complete the following steps to amalgamate:')
    expect(wrapper.find('#regular-long-form-btn').text()).toBe('Start Regular Long-form')
    expect(wrapper.find('#regular-long-form-btn').classes()).not.toContain('v-btn--disabled')

    expect(vm.isBcLimitedOrBenefitCompany).toBe(true)

    const result = wrapper.find('#start-regular-long-form-card p:last-of-type')

    expect(result.text()).toBe(
      'When the amalgamation is complete, your company will be a BC Limited Company or a BC Benefit Company.'
    )
    expect(result.findAll('strong').wrappers.map((element: any) => element.text())).toEqual([
      'BC Limited Company',
      'BC Benefit Company'
    ])
  })

  it('displays both limited company and benefit company for a benefit company', () => {
    mountComponent(CorpTypeCd.BENEFIT_COMPANY)

    const vm = wrapper.vm as any
    const result = wrapper.find('#start-regular-long-form-card p:last-of-type')

    expect(vm.isBcLimitedOrBenefitCompany).toBe(true)
    expect(result.text()).toBe(
      'When the amalgamation is complete, your company will be a BC Limited Company or a BC Benefit Company.'
    )
    expect(result.findAll('strong').wrappers.map((element: any) => element.text())).toEqual([
      'BC Limited Company',
      'BC Benefit Company'
    ])
  })

  it('displays community contribution company for CCC', () => {
    mountComponent(CorpTypeCd.BC_CCC)

    const vm = wrapper.vm as any
    const result = wrapper.find('#start-regular-long-form-card p:last-of-type')

    expect(vm.isBcLimitedOrBenefitCompany).toBe(false)
    expect(result.text()).toBe(
      'When the amalgamation is complete, your company will be a BC Community Contribution Company.'
    )
    expect(result.findAll('strong').wrappers.map((element: any) => element.text())).toEqual([
      'BC Community Contribution Company'
    ])
  })

  it('displays unlimited liability company for ULC', () => {
    mountComponent(CorpTypeCd.BC_ULC_COMPANY)

    const vm = wrapper.vm as any
    const result = wrapper.find('#start-regular-long-form-card p:last-of-type')

    expect(vm.isBcLimitedOrBenefitCompany).toBe(false)
    expect(result.text()).toBe(
      'When the amalgamation is complete, your company will be a BC Unlimited Liability Company.'
    )
    expect(result.findAll('strong').wrappers.map((element: any) => element.text())).toEqual([
      'BC Unlimited Liability Company'
    ])
  })

  it('start regular long-form button clicked', async () => {
    const createFiling = vi.spyOn(BusinessServices as any, 'createDraftBusiness')
      .mockResolvedValue({ business: { identifier: 'BC1234567' } })

    const button = wrapper.find('#regular-long-form-btn')
    await button.trigger('click')

    expect(createFiling).toHaveBeenCalled()
  })

  it('start horizontal short-form button clicked', async () => {
    const createFiling = vi.spyOn(BusinessServices as any, 'createDraftBusiness')
      .mockResolvedValue({ business: { identifier: 'BC1234567' } })

    const button = wrapper.find('#horizontal-short-form-btn')
    await button.trigger('click')

    expect(createFiling).toHaveBeenCalled()
  })

  it('start vertical short-form button clicked', async () => {
    const createFiling = vi.spyOn(BusinessServices as any, 'createDraftBusiness')
      .mockResolvedValue({ business: { identifier: 'BC1234567' } })

    const button = wrapper.find('#vertical-short-form-btn')
    await button.trigger('click')

    expect(createFiling).toHaveBeenCalled()
  })
})
