import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import CompletedDissolution from '@/components/Dashboard/FilingHistoryList/CompletedDissolution.vue'
import { ConfigJson } from '@/resources'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Dissolution Filing', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(CompletedDissolution, {
      store,
      vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.html()).toBeUndefined()

    wrapper.destroy()
  })

  it('Displays expected content with a valid Coop filing', () => {
    // init store
    store.state.entityName = 'MY COMPANY'
    store.state.entityType = 'CP'
    store.state.configObject = ConfigJson.find(x => x.entityType === store.state.entityType)

    const wrapper = mount(CompletedDissolution, {
      store,
      vuetify,
      propsData: {
        filing: {
          effectiveDate: new Date('2021-01-02 08:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Dissolution Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The Cooperative Association MY COMPANY was successfully')
    expect(paragraphs.at(0).text()).toContain('dissolved on January 2, 2021 at 12:00 am Pacific time')
    expect(paragraphs.at(0).text()).toContain('The Cooperative Association has been struck')
    expect(paragraphs.at(0).text()).toContain('and ceased to be an incorporated cooperative association')
    expect(paragraphs.at(0).text()).toContain('under the Cooperative Association Act.')
    expect(paragraphs.at(1).text()).toContain('You are required to retain a copy of all')

    wrapper.destroy()
  })

  it('Displays expected content with a valid corp filing', () => {
    // init store
    store.state.entityName = 'MY COMPANY'
    store.state.entityType = 'BEN'
    store.state.configObject = ConfigJson.find(x => x.entityType === store.state.entityType)

    const wrapper = mount(CompletedDissolution, {
      store,
      vuetify,
      propsData: {
        filing: {
          effectiveDate: new Date('2021-01-02 08:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Dissolution Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The Company MY COMPANY was successfully')
    expect(paragraphs.at(0).text()).toContain('dissolved on January 2, 2021 at 12:00 am Pacific time')
    expect(paragraphs.at(0).text()).toContain('The Company has been struck')
    expect(paragraphs.at(0).text()).toContain('and ceased to be an incorporated company')
    expect(paragraphs.at(0).text()).toContain('under the Business Corporations Act.')
    expect(paragraphs.at(1).text()).toContain('You are required to retain a copy of all')

    wrapper.destroy()
  })
})
