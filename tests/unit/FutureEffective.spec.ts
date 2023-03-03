/* eslint max-len: 0 */
import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store'
import { mount } from '@vue/test-utils'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/FutureEffective.vue'
import { ContactInfo } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Future Effective IA', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(FutureEffective, {
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
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: { filing: {} }
    })

    // verify content
    expect(wrapper.findAll('h4').at(0).text()).toBe('Future Effective Filing Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The filing date and time for this company')
    expect(paragraphs.at(0).text()).toContain('will be Unknown.')
    expect(paragraphs.at(1).text()).toContain('If you wish to change the information in this filing, you must contact BC')
    expect(paragraphs.at(1).text()).toContain('Registries staff to file a withdrawal. Withdrawing this filing will remove')
    expect(paragraphs.at(1).text()).toContain('this filing and all associated information, and will incur a $20.00 fee.')
    expect(wrapper.findAll('h4').at(1).text()).toBe('BC Registries Contact Information:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE named IA', () => {
    store.state.business.entityName = 'My Incorporation'
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIa: true,
          effectiveDate: new Date('2020-05-15 19:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.findAll('h4').at(0).text()).toBe('Future Effective Incorporation Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for My Incorporation')
    expect(paragraphs.at(0).text()).toContain('will be May 15, 2020 at 12:00 pm Pacific time.')
    expect(paragraphs.at(1).text()).toContain('If you wish to change the information in this incorporation, you must contact BC')
    expect(paragraphs.at(1).text()).toContain('Registries staff to file a withdrawal. Withdrawing this Incorporation Application will remove')
    expect(paragraphs.at(1).text()).toContain('this incorporation and all associated information, and will incur a $20.00 fee.')
    expect(wrapper.findAll('h4').at(1).text()).toBe('BC Registries Contact Information:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE numbered IA', () => {
    store.state.business.entityName = ''
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveIa: true,
          effectiveDate: new Date('2020-05-15 19:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.findAll('h4').at(0).text()).toBe('Future Effective Incorporation Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The incorporation date and time for this company')
    expect(paragraphs.at(0).text()).toContain('will be May 15, 2020 at 12:00 pm Pacific time.')
    expect(paragraphs.at(1).text()).toContain('If you wish to change the information in this incorporation, you must contact BC')
    expect(paragraphs.at(1).text()).toContain('Registries staff to file a withdrawal. Withdrawing this Incorporation Application will remove')
    expect(paragraphs.at(1).text()).toContain('this incorporation and all associated information, and will incur a $20.00 fee.')
    expect(wrapper.findAll('h4').at(1).text()).toBe('BC Registries Contact Information:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays expected content with a FE alteration', () => {
    store.state.business.entityName = 'My Alteration'
    const wrapper = mount(FutureEffective, {
      vuetify,
      store,
      propsData: {
        filing: {
          isFutureEffectiveAlteration: true,
          effectiveDate: new Date('2020-05-15 19:00:00 GMT'),
          courtOrderNumber: '123',
          isArrangement: true
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Future Effective Alteration Date')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(4)
    expect(paragraphs.at(0).text()).toContain('The alteration date and time for My Alteration')
    expect(paragraphs.at(0).text()).toContain('will be May 15, 2020 at 12:00 pm Pacific time.')
    expect(paragraphs.at(1).text()).toContain('Court Order Number: 123')
    expect(paragraphs.at(2).text()).toContain('Pursuant to a Plan of Arrangement')
    expect(paragraphs.at(3).text()).toContain('If you wish to change the information in this alteration, you must contact BC')
    expect(paragraphs.at(3).text()).toContain('Registries staff to file a withdrawal. Withdrawing this Alteration Notice will remove')
    expect(paragraphs.at(3).text()).toContain('this alteration and all associated information, and will incur a $20.00 fee.')
    expect(wrapper.findAll('h4').at(1).text()).toBe('BC Registries Contact Information:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    wrapper.destroy()
  })
})
