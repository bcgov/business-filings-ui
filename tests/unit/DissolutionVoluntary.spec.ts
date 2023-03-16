import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import DissolutionVoluntary from '@/components/Dashboard/FilingHistoryList/filings/DissolutionVoluntary.vue'
import { ConfigJson } from '@/resources'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

xdescribe('Dissolution Filing', () => {
  it('Displays expected content with a null filing', () => {
    const wrapper = mount(DissolutionVoluntary, {
      store,
      vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toBeFalsy()

    wrapper.destroy()
  })

  it('Displays expected content with a valid Coop filing', () => {
    // init store
    store.commit('setLegalName', 'MY COMPANY')
    store.commit('setLegalType', 'CP')
    store.state.configObject = ConfigJson.find(x => x.entityType === store.getters.getLegalType)

    const wrapper = mount(DissolutionVoluntary, {
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
    store.commit('setLegalName', 'MY COMPANY')
    store.commit('setLegalType', 'BEN')
    store.state.configObject = ConfigJson.find(x => x.entityType === store.getters.getLegalType)

    const wrapper = mount(DissolutionVoluntary, {
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

  it('Displays expected content with a valid SP filing', () => {
    // init store
    store.commit('setLegalName', 'MY COMPANY')
    store.commit('setLegalType', 'SP')
    store.state.configObject = ConfigJson.find(x => x.entityType === store.getters.getLegalType)

    const wrapper = mount(DissolutionVoluntary, {
      store,
      vuetify,
      propsData: {
        filing: {
          submittedDate: new Date('2021-01-02 08:00:00 GMT'),
          effectiveDate: new Date('2021-01-20 08:00:00 GMT'),
          dissolutionDate: '2021-01-20'
        }
      }
    })

    // verify content
    expect(wrapper.find('h4').text()).toBe('Dissolution Complete')
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toContain('The statement of dissolution for Sole Proprietorship MY COMPANY')
    expect(paragraphs.at(0).text()).toContain('MY COMPANY was successfully')
    expect(paragraphs.at(0).text()).toContain('submitted on January 2, 2021 at 12:00 am Pacific time')
    expect(paragraphs.at(0).text()).toContain('with dissolution date of January 20, 2021.')
    expect(paragraphs.at(0).text()).toContain('The Sole Proprietorship has been struck')
    expect(paragraphs.at(0).text()).toContain('from the register and dissolved,')
    expect(paragraphs.at(0).text()).toContain('and ceased to be a registered Sole Proprietorship')
    expect(paragraphs.at(0).text()).toContain('under the Partnership Act.')
    expect(paragraphs.at(1).text()).toContain('You are required to retain a copy of all')

    wrapper.destroy()
  })
})
