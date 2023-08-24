import 'core-js/stable' // to polyfill ECMAScript features
import 'regenerator-runtime/runtime' // to use transpiled generator functions
import '@mdi/font/css/materialdesignicons.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Vuelidate from 'vuelidate'
import Affix from 'vue-affix'
import Vue2Filters from 'vue2-filters' // needed by SbcFeeSummary
import { GetFeatureFlag, InitLdClient, navigate, setBaseRouteAndBusinessId } from '@/utils'
import { getVueRouter } from '@/router'
import { getPiniaStore, getVuexStore } from '@/stores'
import '@/assets/styles/base.scss'
import '@/assets/styles/layout.scss'
import '@/assets/styles/overrides.scss'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import App from '@/App.vue'
import * as Integrations from '@sentry/integrations'
import * as Sentry from '@sentry/vue'
import Hotjar from 'vue-hotjar'
import { useConfigurationStore } from './stores'

// get rid of "You are running Vue in development mode" console message
Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(Affix)
Vue.use(Vue2Filters) // needed by SbcFeeSummary

const store = getVuexStore()
const pinia = getPiniaStore()

// Needed to fix "getActivePinia was called with no active Pinia" error
// Type assertion to turn off type checking
// Ref: https://stackoverflow.com/questions/74865884/cant-access-pinia-store-in-beforeenter-in-vue-2-app
Vue.use(pinia as any)

// main code
async function start () {
  // get config from environment
  const processEnvBaseUrl: string = import.meta.env.BASE_URL // eg, /business/
  const windowLocationPathname = window.location.pathname // eg, /business/CP1234567/...
  const windowLocationOrigin = window.location.origin // eg, http://localhost:8080

  // first load the configuration, then set base route and check business id
  const configurationStore = useConfigurationStore()
  configurationStore.loadConfiguration()

  setBaseRouteAndBusinessId(windowLocationPathname, processEnvBaseUrl, windowLocationOrigin) // may throw an error

  // initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing LaunchDarkly...') // eslint-disable-line no-console
    await InitLdClient()
  }

  if (GetFeatureFlag('sentry-enable')) {
    // initialize Sentry
    const sentryDsn = window['sentryDsn']
    if (sentryDsn) {
      console.info('Initializing Sentry...') // eslint-disable-line no-console
      Sentry.init({
        Vue,
        dsn: sentryDsn,
        integrations: [
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

  // configure Keycloak Service
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  const keycloakConfig: any = {
    url: `${window['keycloakAuthUrl']}`,
    realm: `${window['keycloakRealm']}`,
    clientId: `${window['keycloakClientId']}`
  }

  await KeycloakService.setKeycloakConfigUrl(keycloakConfig)

  // initialize token service which will do a check-sso to initiate session
  // don't start during Vitest tests as it messes up the test JWT
  if (import.meta.env.VITEST === undefined) {
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
            alert: '#F8661A', // same as $app-alert
            tooltipColor: '#3b6cff' // same as $app-tooltip-color
          }
        }
      }
    }),
    router,
    store,
    pinia,
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
