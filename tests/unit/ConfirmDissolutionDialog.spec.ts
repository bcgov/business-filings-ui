import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores/businessStore'
import { useRootStore } from '@/stores/rootStore'
import { ConfirmDissolutionDialog } from '@/components/dialogs'
import { ConfigJson } from '@/resources'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

describe('Confirm Dissolution Dialog - Displays Confirmation messages', () => {
  it('displays confirmation modal to users for Sole Proprietorship', () => {
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP)
    rootStore.setConfigObject(ConfigJson.find(x => x.entityType === businessStore.getLegalType))

    const wrapper = shallowMount(ConfirmDissolutionDialog,
      {
        propsData: {
          dialog: true
        },
        vuetify
      })

    expect(wrapper.find('#dialog-title').text()).toBe('Dissolution')
    expect(wrapper.find('#dialog-proceed-button')).toBeDefined()
    expect(wrapper.find('#dialog-proceed-button').text()).toContain('Continue with Dissolution')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(1).text()).toContain('You are about to dissolve this company;')
    expect(paragraphs.at(1).text()).toContain('once this process is completed and the required documents are filed,')
    expect(paragraphs.at(1).text()).toContain('the Sole Proprietorship will be')
    expect(paragraphs.at(1).text()).toContain('struck from the register and dissolved')
    expect(paragraphs.at(1).text()).toContain('ceasing to be a registered business under the')
    expect(paragraphs.at(1).text()).toContain('Partnership Act.')
    expect(paragraphs.at(2).text()).toContain('Make sure your business information is up to date before dissolving.')

    wrapper.destroy()
  })

  it('displays confirmation modal to users for General Partnership', () => {
    businessStore.setLegalType(CorpTypeCd.PARTNERSHIP)
    rootStore.setConfigObject(ConfigJson.find(x => x.entityType === businessStore.getLegalType))

    const wrapper = shallowMount(ConfirmDissolutionDialog,
      {
        propsData: {
          dialog: true
        },
        vuetify
      })

    expect(wrapper.find('#dialog-title').text()).toBe('Dissolution')
    expect(wrapper.find('#dialog-proceed-button')).toBeDefined()
    expect(wrapper.find('#dialog-proceed-button').text()).toContain('Continue with Dissolution')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(1).text()).toContain('You are about to dissolve this company;')
    expect(paragraphs.at(1).text()).toContain('once this process is completed and the required documents are filed,')
    expect(paragraphs.at(1).text()).toContain('the General Partnership will be')
    expect(paragraphs.at(1).text()).toContain('struck from the register and dissolved,')
    expect(paragraphs.at(1).text()).toContain('ceasing to be a registered business under the')
    expect(paragraphs.at(1).text()).toContain('Partnership Act.')
    expect(paragraphs.at(2).text()).toContain('Make sure your business information is up to date before dissolving.')

    wrapper.destroy()
  })

  it('displays confirmation modal to users for Benefit Company', () => {
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    rootStore.setConfigObject(ConfigJson.find(x => x.entityType === businessStore.getLegalType))

    const wrapper = shallowMount(ConfirmDissolutionDialog,
      {
        propsData: {
          dialog: true
        },
        vuetify
      })

    expect(wrapper.find('#dialog-title').text()).toBe('Voluntary Dissolution')
    expect(wrapper.find('#dialog-proceed-button')).toBeDefined()
    expect(wrapper.find('#dialog-proceed-button').text()).toContain('Continue with Voluntary Dissolution')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(1).text()).toContain('You are about to voluntarily dissolve this company;')
    expect(paragraphs.at(1).text()).toContain('once this process is completed and the required documents are filed,')
    expect(paragraphs.at(1).text()).toContain('the Company will be')
    expect(paragraphs.at(1).text()).toContain('struck from the register and dissolved,')
    expect(paragraphs.at(1).text()).toContain('ceasing to be an incorporated company under the')
    expect(paragraphs.at(1).text()).toContain('Business Corporations Act.')

    wrapper.destroy()
  })
})
