import { createPinia, PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
import Vuex from 'vuex'

/**
 * Configures and returns Vuex Store.
 * (We still need this for sbc-common-components.)
 */
export function getVuexStore () {
  Vue.use(Vuex)
  return new Vuex.Store<any>({})
}

/**
 * Configures and returns Pinia Store.
 */
export function getPiniaStore () {
  Vue.use(PiniaVuePlugin)
  return createPinia()
}

export * from './authenticationStore'
export * from './businessStore'
export * from './configurationStore'
export * from './filingHistoryListStore'
export * from './rootStore'
