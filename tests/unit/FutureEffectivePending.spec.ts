/* eslint max-len: 0 */
import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { mount } from '@vue/test-utils'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/FutureEffectivePending.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Future Effective Pending', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toBeFalsy()

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
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The filing date and time for this company')
    expect(paragraphs.at(0).text()).toContain('has been recorded as Unknown.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing. If this issue persists,')
    expect(paragraphs.at(1).text()).toContain('please contact us.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE named IA', () => {
    store.commit('setLegalName', 'My Incorporation')

    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIaPending: true,
          effectiveDate: new Date('2020-05-15 19:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for My Incorporation')
    expect(paragraphs.at(0).text()).toContain('has been recorded as May 15, 2020 at 12:00 pm Pacific time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing. If this issue persists,')
    expect(paragraphs.at(1).text()).toContain('please contact us.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE numbered IA', () => {
    store.commit('setLegalName', null)

    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIaPending: true,
          effectiveDate: new Date('2020-05-15 19:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Incorporation Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for this company')
    expect(paragraphs.at(0).text()).toContain('has been recorded as May 15, 2020 at 12:00 pm Pacific time.')
    expect(paragraphs.at(1).text()).toContain('It may take up to one hour to process this filing. If this issue persists,')
    expect(paragraphs.at(1).text()).toContain('please contact us.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE Alteration', () => {
    store.commit('setLegalName', 'My Alteration')

    const wrapper = mount(FutureEffectivePending, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveAlterationPending: true,
          effectiveDate: new Date('2020-05-15 19:00:00 GMT'),
          courtOrderNumber: '123',
          isArrangement: true
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Alteration Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(4)
    expect(paragraphs.at(0).text()).toContain('The alteration date and time for My Alteration')
    expect(paragraphs.at(0).text()).toContain('has been recorded as May 15, 2020 at 12:00 pm Pacific time.')
    expect(paragraphs.at(1).text()).toContain('Court Order Number: 123')
    expect(paragraphs.at(2).text()).toContain('Pursuant to a Plan of Arrangement')
    expect(paragraphs.at(3).text()).toContain('It may take up to one hour to process this filing. If this issue persists,')
    expect(paragraphs.at(3).text()).toContain('please contact us.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
