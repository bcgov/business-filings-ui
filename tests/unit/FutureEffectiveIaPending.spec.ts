import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { mount } from '@vue/test-utils'
import FutureEffectiveIaPending from '@/components/Dashboard/FilingHistoryList/FutureEffectiveIaPending.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const store = getVuexStore()

describe('Future Effective IA Pending', () => {
  it('Displays expected content with no data', () => {
    const wrapper = mount(FutureEffectiveIaPending, { vuetify, store })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for this Numbered Benefit Company')
    expect(paragraphs.at(0).text()).toContain('has been recorded as unknown Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing.')
    expect(paragraphs.at(2).text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    store.state.entityName = 'ACME Benefit Inc'
    const wrapper = mount(FutureEffectiveIaPending, {
      vuetify,
      store,
      propsData: { filing: { effectiveDateTime: '2020-05-15 12:00:00 PM' } }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for ACME Benefit Inc')
    expect(paragraphs.at(0).text()).toContain('has been recorded as 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing.')
    expect(paragraphs.at(2).text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
