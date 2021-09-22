import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { mount } from '@vue/test-utils'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/FutureEffectivePending.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // make type-less for unit tests

describe('Future Effective Pending', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.html()).toBeUndefined()

    wrapper.destroy()
  })

  it('Displays expected content with an empty filing', () => {
    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: { filing: {} }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('The filing date and time for this company')
    expect(paragraphs.at(0).text()).toContain('has been recorded as unknown Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing.')
    expect(paragraphs.at(2).text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE named IA', () => {
    store.state.entityName = 'My Incorporation'

    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIaPending: true,
          effectiveDateTime: '2020-05-15 12:00:00 PM'
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for My Incorporation')
    expect(paragraphs.at(0).text()).toContain('has been recorded as 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing.')
    expect(paragraphs.at(2).text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE numbered IA', () => {
    store.state.entityName = ''

    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIaPending: true,
          effectiveDateTime: '2020-05-15 12:00:00 PM'
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for this Numbered Benefit Company')
    expect(paragraphs.at(0).text()).toContain('has been recorded as 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing.')
    expect(paragraphs.at(2).text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE Alteration', () => {
    store.state.entityName = 'My Alteration'

    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveAlterationPending: true,
          effectiveDateTime: '2020-05-15 12:00:00 PM',
          courtOrderNumber: 'NUMBER',
          isArrangement: true
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Alteration Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(5)
    expect(paragraphs.at(0).text()).toContain('The alteration date and time for My Alteration')
    expect(paragraphs.at(0).text()).toContain('has been recorded as 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing.')
    expect(paragraphs.at(2).text()).toContain('Court Order Number: NUMBER')
    expect(paragraphs.at(3).text()).toContain('Pursuant to a Plan of Arrangement')
    expect(paragraphs.at(4).text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
