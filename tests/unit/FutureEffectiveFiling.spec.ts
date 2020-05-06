import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'

import { mount } from '@vue/test-utils'
import FutureEffectiveFiling from '@/components/Dashboard/FutureEffectiveFiling.vue'
import ErrorContact from '@/components/common/ErrorContact.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const store = getVuexStore()

describe('Future Effective Filing', () => {
  it('Displays expected content with no data', () => {
    const wrapper = mount(FutureEffectiveFiling, { vuetify, store })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Incorporation Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('for unknown')
    expect(paragraphs.at(0).text()).toContain('will be unknown Pacific Time')
    expect(paragraphs.at(1).text()).toContain('If you wish to change')
    expect(paragraphs.at(2).text()).toContain('Withdrawing this Incorporation Application')
    expect(wrapper.find(ErrorContact).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    store.state.entityName = 'ACME Benefit Inc'
    const wrapper = mount(FutureEffectiveFiling, {
      vuetify,
      store,
      propsData: { filing: { effectiveDateTime: '2020-05-15 12:00:00 PM' } }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Incorporation Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('for ACME Benefit Inc')
    expect(paragraphs.at(0).text()).toContain('will be 2020-05-15 12:00:00 PM Pacific Time')
    expect(paragraphs.at(1).text()).toContain('If you wish to change')
    expect(paragraphs.at(2).text()).toContain('Withdrawing this Incorporation Application')
    expect(wrapper.find(ErrorContact).exists()).toBe(true)

    wrapper.destroy()
  })
})
