import Vue from 'vue'
import { createStore } from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { state } from './state'

/**
 * Configures and returns Vuex Store.
 */
export function getVuexStore () {
  // new change in vuex 4.0 app.use(store) from new method createStore
  const store = createStore({
    actions,
    getters,
    mutations,
    state
  })

  Vue.use(store)

  return store
}
