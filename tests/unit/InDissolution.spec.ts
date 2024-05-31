import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import Alerts from '@/components/Dashboard/Alerts.vue'
import { ContactInfo } from '@/components/common'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { WarningTypes } from '@/enums'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

describe('Missing Information alert', () => {
  beforeAll(() => {
    businessStore.$state.businessInfo.goodStanding = true
    businessStore.$state.businessInfo.legalType = CorpTypeCd.BENEFIT_COMPANY
    businessStore.$state.businessInfo.warnings = [
      {
        code: null,
        data: {
          targetDissolutionDate: '2024-06-11'
        },
        message: null,
        warningType: WarningTypes.INVOLUNTARY_DISSOLUTION
      }
    ]
    rootStore.currentDate = '2024-06-01'
  })

  it('Displays expansion panel closed', () => {
    const wrapper = mount(Alerts, { vuetify })

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('in-dissolution-panel')
    expect(wrapper.find('h3').text()).toBe('Urgent - this business is in the process of being dissolved')
    expect(wrapper.find('button.details-btn').text()).toBe('View Details')

    wrapper.destroy()
  })

  it('Displays expansion panel opened', async () => {
    const wrapper = mount(Alerts, { vuetify })

    // click the button
    await wrapper.find('.details-btn').trigger('click')

    // verify content
    expect(wrapper.findAll('.v-expansion-panel').length).toBe(1)
    expect(wrapper.find('.v-expansion-panel').attributes('id')).toBe('in-dissolution-panel')
    expect(wrapper.find('h3').text()).toBe('Urgent - this business is in the process of being dissolved')
    expect(wrapper.find('button.details-btn').text()).toBe('Hide Details')
    expect(wrapper.findAll('.v-expansion-panel-content p').at(0).text()).toContain(
      'This means that the business will be struck')
    expect(wrapper.findAll('.v-expansion-panel-content p').at(1).text()).toContain(
      'For assistance, please contact BC Registries staff:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
