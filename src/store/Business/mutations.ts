// import Vue from 'vue'
import { BusinessIF } from '@/interfaces'

export default {
  // *** TODO: discuss this with Jonathan
  setBusinessInfo (state: BusinessIF, val: BusinessIF) {
    // state = val // doesn't work

    // Vue.set(state, 'business', val) // doesn't work

    Object.keys(val).forEach(key => {
      // Vue.set(state, key, val[key]) // works but more complex than necessary
      state[key] = val[key]
    })
  }
}
