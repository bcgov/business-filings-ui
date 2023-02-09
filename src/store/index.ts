import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { state } from './state'
import CurrentAccount from '@/store/CurrentAccount'

/**
 * Configures and returns Vuex Store.
 */
export function getVuexStore () {
  Vue.use(Vuex)

  return new Vuex.Store({
    actions,
    getters,
    mutations,
    state,
    modules: {
      currentAccount: CurrentAccount
    }
  })
}
