import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import Alerts from '@/components/Dashboard/Alerts.vue'
import { ContactInfo } from '@/components/common'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { WarningTypes } from '@/enums'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('Not In Compliance alert', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.goodStanding = true
    businessStore.$state.businessInfo.legalType = CorpTypeCd.SOLE_PROP
    businessStore.$state.businessInfo.warnings = [
      {
        code: null,
        message: null,
        warningType: WarningTypes.COMPLIANCE
      }
    ]
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Alerts, { vuetify })

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('not-in-compliance-panel')
    expect(wrapper.find('h3').text()).toBe('This business is not in compliance')
    expect(wrapper.find('button.details-btn').text()).toBe('View Details')

    wrapper.destroy()
  })

  it('Displays expansion panel opened', async () => {
    const wrapper = mount(Alerts, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('not-in-compliance-panel')
    expect(wrapper.find('h3').text()).toBe('This business is not in compliance')
    expect(wrapper.find('button.details-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.v-expansion-panel-content p').text()).toContain('To resolve this issue, you MUST')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
