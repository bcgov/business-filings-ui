import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import EntityInfo from '@/components/EntityInfo.vue'
import EntityDefinitions from '@/components/EntityInfo/EntityDefinitions.vue'
import EntityHeader from '@/components/EntityInfo/EntityHeader.vue'
import EntityMenu from '@/components/EntityInfo/EntityMenu.vue'

Vue.use(Vuetify)
Vue.use(VueRouter)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

describe('Entity Info component', () => {
  it('renders sub-components', async () => {
    // session storage must be set before mounting component
    sessionStorage.clear()

    // set store properties
    businessStore.setLegalName(null)
    businessStore.setLegalType(null)
    rootStore.entityStatus = null
    businessStore.setTaxId(null)

    const wrapper = shallowMount(EntityInfo, { vuetify })
    await Vue.nextTick()

    expect(wrapper.findComponent(EntityDefinitions).exists()).toBe(true)
    expect(wrapper.findComponent(EntityHeader).exists()).toBe(true)
    expect(wrapper.findComponent(EntityMenu).exists()).toBe(true)
  })
})
