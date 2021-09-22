import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import CompletedAlteration from '@/components/Dashboard/FilingHistoryList/CompletedAlteration.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // make type-less for unit tests

describe('Alteration Filing', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(CompletedAlteration, {
      store,
      vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.html()).toBeUndefined()

    wrapper.destroy()
  })

  it('Displays expected content with an empty filing', () => {
    const wrapper = mount(CompletedAlteration, {
      store,
      vuetify,
      propsData: { filing: {} }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Alteration Complete')
    expect(wrapper.findAll('p').length).toBe(0)

    wrapper.destroy()
  })

  it('Displays expected with a valid filing', () => {
    // init store
    store.state.entityName = 'MY COMPANY'

    const wrapper = mount(CompletedAlteration, {
      store,
      vuetify,
      propsData: {
        filing: {
          oldLegalType: 'OLD TYPE',
          newLegalType: 'NEW TYPE',
          effectiveDateTime: 'DATE & TIME',
          courtOrderNumber: 'NUMBER',
          isArrangement: true
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Alteration Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toContain('MY COMPANY was successfully altered')
    expect(paragraphs.at(0).text()).toContain('from a OLD TYPE')
    expect(paragraphs.at(0).text()).toContain('to a NEW TYPE')
    expect(paragraphs.at(0).text()).toContain('on DATE & TIME Pacific Time.')
    expect(paragraphs.at(1).text()).toContain('Court Order Number: NUMBER')
    expect(paragraphs.at(2).text()).toContain('Pursuant to a Plan of Arrangement')

    wrapper.destroy()
  })
})
