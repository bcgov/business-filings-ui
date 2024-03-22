// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount, Wrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Alerts from '@/components/Dashboard/Alerts.vue'

// Alerts
import Amalgamation from '@/components/Dashboard/Alerts/Amalgamation.vue'
import CorporateOnline from '@/components/Dashboard/Alerts/CorporateOnline.vue'
import FrozenInformation from '@/components/Dashboard/Alerts/FrozenInformation.vue'
import MissingInformation from '@/components/Dashboard/Alerts/MissingInformation.vue'
import NotInCompliance from '@/components/Dashboard/Alerts/NotInCompliance.vue'
import NotInGoodStanding from '@/components/Dashboard/Alerts/NotInGoodStanding.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())

describe('Dashboard - UI', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    // create wrapper for Dashboard
    // this stubs out the 5 sub-components
    wrapper = shallowMount(Alerts, {
      vuetify,
      // create local properties for use in computed object below
      data: () => ({
        _isAmalgamationAlert: false,
        _isDisableNonBenCorps: false,
        _isFrozenInformationAlert: false,
        _isMissingInformationAlert: false,
        _isNotInComplianceAlert: false,
        _isNotInGoodStandingAlert: false
      }),
      // declare computed properties to override store getters/actions
      computed: {
        isAmalgamationAlert: {
          get (): boolean { return this.$data._isAmalgamationAlert },
          set (val: boolean) { this.$data._isAmalgamationAlert = val }
        },
        isDisableNonBenCorps: {
          get (): boolean { return this.$data._isDisableNonBenCorps },
          set (val: boolean) { this.$data._isDisableNonBenCorps = val }
        },
        isFrozenInformationAlert: {
          get (): boolean { return this.$data._isFrozenInformationAlert },
          set (val: boolean) { this.$data._isFrozenInformationAlert = val }
        },
        isMissingInformationAlert: {
          get (): boolean { return this.$data._isMissingInformationAlert },
          set (val: boolean) { this.$data._isMissingInformationAlert = val }
        },
        isNotInComplianceAlert: {
          get (): boolean { return this.$data._isNotInComplianceAlert },
          set (val: boolean) { this.$data._isNotInComplianceAlert = val }
        },
        isNotInGoodStandingAlert: {
          get (): boolean { return this.$data._isNotInGoodStandingAlert },
          set (val: boolean) { this.$data._isNotInGoodStandingAlert = val }
        }
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('does not render component when there are no alerts', () => {
    // verify no alerts are displayed
    expect(wrapper.findComponent(Alerts).exists()).toBe(true)
    expect(wrapper.find('.v-expansion-panel').exists()).toBe(false)
    expect(wrapper.emitted('count').pop()[0]).toBe(0)
  })

  it('displays the Amalgamation alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(Amalgamation).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isAmalgamationAlert: true })
    expect(wrapper.findComponent(Amalgamation).exists()).toBe(true)
    expect(wrapper.emitted('count').pop()[0]).toBe(1)

    // cleanup
    await wrapper.setData({ isAmalgamationAlert: false })
  })

  it('displays the Corporate Online alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(CorporateOnline).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isDisableNonBenCorps: true })
    expect(wrapper.findComponent(CorporateOnline).exists()).toBe(true)
    expect(wrapper.emitted('count').pop()[0]).toBe(1)

    // cleanup
    await wrapper.setData({ isDisableNonBenCorps: false })
  })

  it('displays the Frozen Information alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(FrozenInformation).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isFrozenInformationAlert: true })
    expect(wrapper.findComponent(FrozenInformation).exists()).toBe(true)
    expect(wrapper.emitted('count').pop()[0]).toBe(1)

    // cleanup
    await wrapper.setData({ isFrozenInformationAlert: false })
  })

  it('displays the Missing Information alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(MissingInformation).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isMissingInformationAlert: true })
    expect(wrapper.findComponent(MissingInformation).exists()).toBe(true)
    expect(wrapper.emitted('count').pop()[0]).toBe(1)

    // cleanup
    await wrapper.setData({ isMissingInformationAlert: false })
  })

  it('displays the Not In Compliance alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(NotInCompliance).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isNotInComplianceAlert: true })
    expect(wrapper.findComponent(NotInCompliance).exists()).toBe(true)
    expect(wrapper.emitted('count').pop()[0]).toBe(1)

    // cleanup
    await wrapper.setData({ isNotInComplianceAlert: false })
  })

  it('displays the Not In Good Standing alert', async () => {
    // verify initially hidden
    expect(wrapper.findComponent(NotInGoodStanding).exists()).toBe(false)

    // enable and verify displayed
    await wrapper.setData({ isNotInGoodStandingAlert: true })
    expect(wrapper.findComponent(NotInGoodStanding).exists()).toBe(true)
    expect(wrapper.emitted('count').pop()[0]).toBe(1)

    // cleanup
    await wrapper.setData({ isNotInGoodStandingAlert: false })
  })
})
