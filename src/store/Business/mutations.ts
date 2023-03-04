// import Vue from 'vue'
import { BusinessIF } from '@/interfaces'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

export default {
  // *** TODO: discuss this with Jonathan
  setBusinessInfo (state: BusinessIF, val: BusinessIF) {
    // state = val // doesn't work

    // Vue.set(state, 'business', val) // doesn't work

    Object.keys(val).forEach(key => {
      // Vue.set(state, key, val[key]) // works but more complex than necessary
      state[key] = val[key]
    })
  },

  setGoodStanding (state: BusinessIF, val: boolean) {
    state.goodStanding = val
  },

  setIdentifier (state: BusinessIF, val: string) {
    state.identifier = val
  },

  setLegalName (state: BusinessIF, val: string) {
    state.legalName = val
  },

  setLegalType (state: BusinessIF, val: CorpTypeCd) {
    state.legalType = val
  }
}
