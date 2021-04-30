import 'core-js/stable' // to polyfill ECMAScript features
import 'regenerator-runtime/runtime' // to use transpiled generator functions
import '@mdi/font/css/materialdesignicons.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Vuelidate from 'vuelidate'
import Affix from 'vue-affix'
import Vue2Filters from 'vue2-filters' // needed by SbcFeeSummary
import { fetchConfig, initLdClient } from '@/utils'
import { getVueRouter } from '@/router'
import { getVuexStore } from '@/store'
import '@/registerServiceWorker'
import '@/assets/styles/base.scss'
import '@/assets/styles/layout.scss'
import '@/assets/styles/overrides.scss'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import App from '@/App.vue'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

// get rid of "You are running Vue in development mode" console message
Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(Affix)
Vue.use(Vue2Filters)

// main code
async function start () {
  // fetch config from environment and API
  // must come first as inits below depend on config
  await fetchConfig()

  // initialize Sentry
  const sentryDsn = window['sentryDsn']
  if (sentryDsn) {
    console.info('Initializing Sentry...') // eslint-disable-line no-console
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        new Integrations.Vue({ Vue, attachProps: true }),
        new Integrations.CaptureConsole({ levels: ['error'] })
      ]
    })
  }

  // initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing LaunchDarkly...') // eslint-disable-line no-console
    await initLdClient()
  }

  // configure Keycloak Service
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  const keycloakConfigPath = sessionStorage.getItem('KEYCLOAK_CONFIG_PATH')
  await KeycloakService.setKeycloakConfigUrl(keycloakConfigPath)

  // get Vue objects only after we have config
  const router = getVueRouter()
  const store = getVuexStore()

  // start Vue application
  console.info('Starting app...') // eslint-disable-line no-console
  new Vue({
    vuetify: new Vuetify({
      iconfont: 'mdi',
      theme: {
        themes: {
          light: {
            primary: '#1669bb', // same as $app-blue
            error: '#d3272c', // same as $app-red
            success: '#1a9031' // same as $app-green
          }
        }
      }
    }),
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

// execution and error handling
start().catch(error => {
  // log any error after configuring sentry.
  // it helps to identify configuration issues specific to the environment.
  // note that it won't log anything related to `fetchConfig()` since sentry is depending on a config value.
  Sentry.captureException(error)
  console.log(error) // eslint-disable-line no-console
  // bypass alert if this specific error
  if (!error?.message?.startsWith('Missing or invalid')) {
    alert('There was an error starting this page. (See console for details.)\n' +
      'Please try again later.')
  }
  // try to redirect to BCROS home page
  const bcrosHomeUrl = sessionStorage.getItem('BUSINESSES_URL')
  if (bcrosHomeUrl) {
    window.location.assign(bcrosHomeUrl) // assume URL is always reachable
  }
})
