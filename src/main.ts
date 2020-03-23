import 'core-js/stable' // to polyfill ECMAScript features
import 'regenerator-runtime/runtime' // to use transpiled generator functions
import '@mdi/font/css/materialdesignicons.min.css' // ensure you are using css-loader
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Vuelidate from 'vuelidate'
import Affix from 'vue-affix'
import Vue2Filters from 'vue2-filters' // needed by SbcFeeSummary
import { fetchConfig } from '@/utils'
import { getVueRouter } from '@/router'
import { getVuexStore } from '@/store'
import { withFlagProvider } from 'ld-vue'
import '@/registerServiceWorker'
import '@/assets/styles/base.scss'
import '@/assets/styles/layout.scss'
import '@/assets/styles/overrides.scss'
import KeyCloakService from 'sbc-common-components/src/services/keycloak.services'
import App from '@/App.vue'

// get rid of "You are running Vue in development mode" console message
Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(Affix)
Vue.use(Vue2Filters)

// main code
async function start () {
  // fetch config from environment and API
  await fetchConfig()

  // configure Keycloak Service
  await KeyCloakService.setKeycloakConfigUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH'))

  // get Vue objects only after we have config
  const router = getVueRouter()
  const store = getVuexStore()

  // start Vue application
  new Vue({
    vuetify: new Vuetify({ iconfont: 'mdi' }),
    router,
    store,
    mixins: [withFlagProvider({ clientSideId: window['ldClientId'] })],
    render: h => h(App)
  }).$mount('#app')
}

// execution and error handling
start().catch((error) => {
  console.error(error) // eslint-disable-line no-console
  alert('There was an error starting this page. (See console for details.)\n' +
    'Click OK to go to the BC Registry home page.')
  // redirect to BC Registry home page
  // NB: this is a hard-coded URL because we are probably missing the config keys
  const bcRegUrl = 'https://www.bcregistry.ca/' // TODO: update when new URLs are set up
  // assume BC Registry URL is always reachable
  window.location.assign(bcRegUrl)
})
