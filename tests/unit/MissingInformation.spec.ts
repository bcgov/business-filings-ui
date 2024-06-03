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

describe('Missing Information alert', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.goodStanding = true
    businessStore.$state.businessInfo.legalType = CorpTypeCd.SOLE_PROP
    businessStore.$state.businessInfo.warnings = [
      {
        code: null,
        message: null,
        warningType: WarningTypes.MISSING_REQUIRED_BUSINESS_INFO
      }
    ]
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Alerts, { vuetify })

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('missing-information-panel')
    expect(wrapper.find('h3').text()).toBe('Missing information')
    expect(wrapper.find('button.details-btn').text()).toBe('View Details')

    wrapper.destroy()
  })

  it('Displays expansion panel opened', async () => {
    const wrapper = mount(Alerts, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('missing-information-panel')
    expect(wrapper.find('h3').text()).toBe('Missing information')
    expect(wrapper.find('button.details-btn').text()).toBe('Hide Details')
    expect(wrapper.findAll('.v-expansion-panel-content p').at(0).text()).toContain('BC Registries is missing')
    expect(wrapper.findAll('.v-expansion-panel-content p').at(1).text()).toContain('If further action is required')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
