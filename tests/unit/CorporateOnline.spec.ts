import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import Alerts from '@/components/Dashboard/Alerts.vue'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import * as utils from '@/utils'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('Corporate Online alert', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.goodStanding = true
    businessStore.$state.businessInfo.legalType = CorpTypeCd.BC_COMPANY
    businessStore.$state.businessInfo.identifier = 'BC1234567'

    vi.spyOn(utils, 'GetFeatureFlag').mockImplementation(flag => {
      if (flag === 'businesses-to-manage-in-colin') return ['BC1234567']
      return []
    })
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Alerts, { vuetify })

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('corporate-online-panel')
    expect(wrapper.find('h3').text()).toBe('This business must be managed in Corporate Online.')
    expect(wrapper.find('button.details-btn').text()).toBe('View Details')

    wrapper.destroy()
  })

  it('Displays expansion panel opened', async () => {
    const wrapper = mount(Alerts, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('corporate-online-panel')
    expect(wrapper.find('h3').text()).toBe('This business must be managed in Corporate Online.')
    expect(wrapper.find('button.details-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.v-expansion-panel-content p').text()).toContain('This BC Limited Company must be')
    expect(wrapper.find('.v-expansion-panel-content a').text()).toBe('Corporate Online')

    wrapper.destroy()
  })
})
