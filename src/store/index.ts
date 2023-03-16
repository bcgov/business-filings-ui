import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { state } from './state'
import Authentication from '@/store/Authentication'
import Business from '@/store/Business'
import Configuration from '@/store/Configuration'
import FilingHistoryList from '@/store/FilingHistoryList'

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
      authentication: Authentication,
      business: Business,
      configuration: Configuration,
      filingHistoryList: FilingHistoryList
    }
  })
}
