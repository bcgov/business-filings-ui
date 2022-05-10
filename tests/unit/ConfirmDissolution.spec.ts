import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import { ConfirmDissolution } from '@/components/dialogs'
import { ConfigJson } from '@/resources'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('ConfirmDissolution - Displays Confirmation messages', () => {
  beforeAll(() => {
    store.state.entityType = 'SP' // now added only for SP
    store.state.configObject = ConfigJson.find(x => x.entityType === store.state.entityType)
  })

  afterAll(() => {
    store.state.entityType = null
    store.state.configObject = null
  })

  it('displays confirmation modal to users', () => {
    const wrapper = shallowMount(ConfirmDissolution,
      {
        propsData: {
          dialog: true
        },
        store,
        vuetify
      })

    expect(wrapper.find('#dialog-title').text()).toBe('Dissolution')
    expect(wrapper.find('#dialog-proceed-button')).toBeDefined()
    expect(wrapper.find('#dialog-proceed-button').text()).toContain('Continue with Dissolution')

    wrapper.destroy()
  })
})
