import { createPinia, PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
import Vuex from 'vuex'
import { state } from './state'

/**
 * Configures and returns Vuex Store. - We still need this for sbc-common-components.
 */
export function getVuexStore () {
  Vue.use(Vuex)

  return new Vuex.Store({
    state
  })
}

/**
 * Configures and returns Pinia Store.
 */
export function getPiniaStore () {
  Vue.use(PiniaVuePlugin)

  return createPinia()
}
