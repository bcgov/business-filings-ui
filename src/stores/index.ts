import { createPinia, PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
/**
 * Configures and returns Pinia Store.
 */
export function getPiniaStore () {
  Vue.use(PiniaVuePlugin)
  return createPinia()
}

export * from './businessStore'
export * from './configurationStore'
export * from './filingHistoryListStore'
export * from './rootStore'
