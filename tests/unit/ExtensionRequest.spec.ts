import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores'
import ExtensionRequest from '@/components/AgmExtension/ExtensionRequest.vue'
import { DatePicker } from '@bcrs-shared-components/date-picker'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const rootStore = useRootStore()

describe('ExtensionRequest', () => {
  it('displays normally', () => {
    // init store
    rootStore.keycloakRoles = ['']

    const wrapper = mount(ExtensionRequest, {
      propsData: {
        data: {}
      },
      vuetify
    })

    expect(wrapper.find('.v-card').attributes('id')).toBe('extension-request')
    expect(wrapper.find('header i').attributes('class')).toContain('mdi-calendar-range')
    expect(wrapper.find('header h2').text()).toBe('Extension Request')

    const rows = wrapper.findAll('.content .row')

    expect(rows.at(0).find('.col-sm-3').text()).toBe('Is this the first AGM?')
    expect(rows.at(0).find('.col-sm-9 .v-input--radio-group').exists()).toBe(true)

    expect(rows.at(1).find('.col-sm-3').text()).toBe('AGM Year')
    expect(rows.at(1).find('.col-sm-9 .v-text-field').exists()).toBe(true)

    expect(rows.at(2).find('.col-sm-3').text()).toBe('Has an extension been requested for this AGM year already?')
    expect(rows.at(2).find('.col-sm-9').text())
      .toContain('Yes - Specify the date the extension expiresDate of extension expiry')
    expect(rows.at(2).find('.col-sm-9').text()).toContain('No - this is the first extension request for this AGM')

    expect(rows.at(3).find('.col-sm-3').text()).toBe('Intended date this AGM will be held')
    expect(rows.at(3).find('.col-sm-9').findComponent(DatePicker).exists()).toBe(true)

    wrapper.destroy()
  })
})
