import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { mount } from '@vue/test-utils'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/FutureEffective.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // make type-less for unit tests

describe('Future Effective IA', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.html()).toBeUndefined()

    wrapper.destroy()
  })

  it('Displays expected content with an empty filing', () => {
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: { filing: {} }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Filing Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(4)
    expect(paragraphs.at(0).text()).toContain('The filing date and time for this company')
    expect(paragraphs.at(0).text()).toContain('will be unknown Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('If you wish to change the information')
    expect(paragraphs.at(1).text()).toContain('in this filing, you must')
    expect(paragraphs.at(1).text()).toContain('contact Registry Staff')
    expect(paragraphs.at(2).text()).toContain('Withdrawing this Filing')
    expect(paragraphs.at(2).text()).toContain('will remove this filing')
    expect(paragraphs.at(2).text()).toContain('and all associated information')
    expect(paragraphs.at(3).text()).toContain('Registries contact information:')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE named IA', () => {
    store.state.entityName = 'My Incorporation'
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIa: true,
          effectiveDateTime: '2020-05-15 12:00:00 PM'
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Incorporation Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(4)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for My Incorporation')
    expect(paragraphs.at(0).text()).toContain('will be 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('the information in this incorporation')
    expect(paragraphs.at(2).text()).toContain('Withdrawing this Incorporation Application')
    expect(paragraphs.at(2).text()).toContain('will remove this incorporation')
    expect(paragraphs.at(3).text()).toContain('Registries contact information:')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE numbered IA', () => {
    store.state.entityName = ''
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIa: true,
          effectiveDateTime: '2020-05-15 12:00:00 PM'
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Incorporation Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(4)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for this Numbered Benefit Company')
    expect(paragraphs.at(0).text()).toContain('will be 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('the information in this incorporation')
    expect(paragraphs.at(2).text()).toContain('Withdrawing this Incorporation Application')
    expect(paragraphs.at(2).text()).toContain('will remove this incorporation')
    expect(paragraphs.at(3).text()).toContain('Registries contact information:')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE alteration', () => {
    store.state.entityName = 'My Alteration'
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveAlteration: true,
          effectiveDateTime: '2020-05-15 12:00:00 PM',
          courtOrderNumber: 'NUMBER',
          isArrangement: true
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Alteration Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(6)
    expect(paragraphs.at(0).text()).toContain('The alteration date and time for My Alteration')
    expect(paragraphs.at(0).text()).toContain('will be 2020-05-15 12:00:00 PM Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('If you wish to change the information in this')
    expect(paragraphs.at(2).text()).toContain('Withdrawing this Alteration Notice will')
    expect(paragraphs.at(2).text()).toContain('will remove this alteration')
    expect(paragraphs.at(3).text()).toContain('Court Order Number: NUMBER')
    expect(paragraphs.at(4).text()).toContain('Pursuant to a Plan of Arrangement')
    expect(paragraphs.at(5).text()).toContain('Registries contact information:')
    expect(wrapper.find(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
