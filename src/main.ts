import 'core-js/stable' // to polyfill ECMAScript features
import 'regenerator-runtime/runtime' // to use transpiled generator functions
import '@mdi/font/css/materialdesignicons.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Vuelidate from 'vuelidate'
import Affix from 'vue-affix'
import Vue2Filters from 'vue2-filters' // needed by SbcFeeSummary
import { initLdClient, navigate, setBaseRouteAndBusinessId } from '@/utils'
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
import Hotjar from 'vue-hotjar'

// get rid of "You are running Vue in development mode" console message
Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(Affix)
Vue.use(Vue2Filters) // needed by SbcFeeSummary

const store = getVuexStore()

// main code
async function start () {
  // get config from environment
  const processEnvBaseUrl: string = process.env.BASE_URL // eg, /business/
  const windowLocationPathname = window.location.pathname // eg, /business/CP1234567/...
  const windowLocationOrigin = window.location.origin // eg, http://localhost:8080
  const applicationUrl = windowLocationOrigin + processEnvBaseUrl

  // first load the configuration, then set base route and check business id
  await store.dispatch('loadConfiguration', applicationUrl)
  setBaseRouteAndBusinessId(windowLocationPathname, processEnvBaseUrl, windowLocationOrigin) // may throw an error

  if (window['sentryEnable'] === 'true') {
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
  }

  // initialize Hotjar
  if (window['hotjarId']) {
    console.info('Initializing Hotjar...') // eslint-disable-line no-console
    Vue.use(Hotjar, { id: window['hotjarId'], isProduction: true })
  }

  // initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing LaunchDarkly...') // eslint-disable-line no-console
    await initLdClient()
  }

  // configure Keycloak Service
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  await KeycloakService.setKeycloakConfigUrl(store.getters.getKeycloakConfigPath)

  // initialize token service which will do a check-sso to initiate session
  // don't start during Jest tests as it messes up the test JWT
  if (process.env.JEST_WORKER_ID === undefined) {
    console.info('Starting token refresh service...') // eslint-disable-line no-console
    await KeycloakService.initializeToken()
  }

  // get Vue objects only after we have config
  const router = getVueRouter()

  // start Vue application
  console.info('Starting app...') // eslint-disable-line no-console
  new Vue({
    vuetify: new Vuetify({
      iconfont: 'mdi',
      theme: {
        themes: {
          light: {
            primary: '#1669bb', // same as $app-blue
            appDkBlue: '#38598a', // same as $app-dk-blue
            error: '#d3272c', // same as $app-red
            success: '#1a9031', // same as $app-green
            alert: '#F8661A' // same as $app-alert
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
  // try to navigate to Business Registry home page
  navigate(sessionStorage.getItem('BUSINESSES_URL'))
})
