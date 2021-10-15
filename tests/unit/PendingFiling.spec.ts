import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PendingFiling from '@/components/Dashboard/FilingHistoryList/PendingFiling.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Pending Filing', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(PendingFiling, {
      vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.html()).toBeUndefined()

    wrapper.destroy()
  })

  it('Displays expected content with an empty filing', () => {
    const wrapper = mount(PendingFiling, {
      vuetify,
      propsData: { filing: {} }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This Filing is paid')
    expect(paragraphs.at(1).text()).toContain('If this issue persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with an alteration filing', () => {
    const wrapper = mount(PendingFiling, {
      vuetify,
      propsData: {
        filing: {
          name: 'alteration',
          courtOrderNumber: 'NUMBER',
          isArrangement: true
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(4)
    expect(paragraphs.at(0).text()).toContain('This Alteration is paid')
    expect(paragraphs.at(1).text()).toContain('Court Order Number: NUMBER')
    expect(paragraphs.at(2).text()).toContain('Pursuant to a Plan of Arrangement')
    expect(paragraphs.at(3).text()).toContain('If this issue persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a filing', () => {
    const wrapper = mount(PendingFiling, {
      vuetify,
      propsData: {
        filing: {
          displayName: 'Incorporation Application'
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('This Incorporation Application is paid')
    expect(paragraphs.at(1).text()).toContain('If this issue persists')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)
    expect(wrapper.find('.to-dashboard-container').exists()).toBe(true)

    wrapper.destroy()
  })
})
