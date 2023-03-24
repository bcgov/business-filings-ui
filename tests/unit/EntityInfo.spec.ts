import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import EntityInfo from '@/components/EntityInfo.vue'
import EntityDefinitions from '@/components/EntityInfo/EntityDefinitions.vue'
import EntityHeader from '@/components/EntityInfo/EntityHeader.vue'
import EntityMenu from '@/components/EntityInfo/EntityMenu.vue'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Entity Info component', () => {
  it('renders sub-components', async () => {
    // session storage must be set before mounting component
    sessionStorage.clear()

    // set store properties
    store.commit('setLegalName', null)
    store.commit('setLegalType', null)
    store.state.entityStatus = null
    store.commit('setTaxId', null)

    const wrapper = shallowMount(EntityInfo, { store, vuetify })
    await Vue.nextTick()

    expect(wrapper.findComponent(EntityDefinitions).exists()).toBe(true)
    expect(wrapper.findComponent(EntityHeader).exists()).toBe(true)
    expect(wrapper.findComponent(EntityMenu).exists()).toBe(true)
  })
})
