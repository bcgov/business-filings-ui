import 'core-js/stable' // to polyfill ECMAScript features
import 'regenerator-runtime/runtime' // to use transpiled generator functions
import '@mdi/font/css/materialdesignicons.min.css' // ensure you are using css-loader
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Vuelidate from 'vuelidate'
import Affix from 'vue-affix'
import Vue2Filters from 'vue2-filters' // needed by SbcFeeSummary
import configHelper from '@/utils/config-helper'
import router from '@/router'
import store from '@/store/store'
import { withFlagProvider } from 'ld-vue'
import '@/registerServiceWorker'
import '@/assets/styles/base.scss'
import '@/assets/styles/layout.scss'
import '@/assets/styles/overrides.scss'
import TokenServices from 'sbc-common-components/src/services/token.services'
import App from '@/App.vue'

// get rid of "You are running Vue in development mode" console message
Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(Affix)
Vue.use(Vue2Filters)

const vuetify = new Vuetify({ iconfont: 'mdi' })

// eslint-disable-next-line
sessionStorage.setItem('KEYCLOAK_TOKEN', 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3FQbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiJmZGY2NTFmYy1jOTEwLTQzZmYtYjZjZi02YmE0M2FiYjY5YzIiLCJleHAiOjE1ODIzMzE0ODIsIm5iZiI6MCwiaWF0IjoxNTgyMzAyNjgyLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwiYWNjb3VudCJdLCJzdWIiOiJjODdjNjdmOS01NWE2LTQ0NTctYjJiNi04Yzc1YjZjZGE3N2MiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzYmMtYXV0aC13ZWIiLCJub25jZSI6IjhhYTFkYjY5LTBkZGQtNGYzYy04ODBmLWE2YjIwOGVmNmQxNiIsImF1dGhfdGltZSI6MTU4MjMwMjY3MSwic2Vzc2lvbl9zdGF0ZSI6ImM1MzBjMWFiLTVhMjYtNDU2OS05YjI5LTAzYzNiYTcwNzA5ZiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwLyIsImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC8qIiwiMTkyLjE2OC4wLjEzIiwiaHR0cDovL2xvY2FsaG9zdDo0MjAwLyoiLCIqIiwiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJwdWJsaWNfdXNlciIsImVkaXQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQiLCJmaXJzdG5hbWUiOiJCQ1JFRzIgU2V5bW91ciIsInJvbGVzIjpbInB1YmxpY191c2VyIiwiZWRpdCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXSwibmFtZSI6IkJDUkVHMiBTZXltb3VyIFRXTyIsInByZWZlcnJlZF91c2VybmFtZSI6ImJjc2MvZm9nZHA3YXNkZjdkd2l4YjZiaWp2cGFzbGN2ZHh3ZGQiLCJsb2dpblNvdXJjZSI6IkJDU0MiLCJsYXN0bmFtZSI6IlRXTyIsInVzZXJuYW1lIjoiYmNzYy9mb2dkcDdhc2RmN2R3aXhiNmJpanZwYXNsY3ZkeHdkZCJ9.R72kDaaUqBmIdmL7zAq3xqRlxcVAmfvakEhOS77VWHzoYBVxDorhCgS6ju67yhdxvbBQD_OIrbcedxQFElXggXvAhNfg8U5E6LtPTRv1KBDvUxDxct-Js9bo5DwYPJfb6Pm5DCGj_lUoDoppaVh0Qko610pnAVmKhjPrhjs3reYtVkugsD3_v7tbQwXV7KVWCDVYCkDDQFG7TRPONA_VTVHcmadk-uRRjpKN2UjPlqkWcAaHEG3qiNQO5TWbmOLcunfAts8zQ-JsqW4Ufuj7rVVZ0R3xuFA-sWtdNjtuqdN77FgIrxDavvWhY0K20KD91B1LpLhr02qLmqoVwYHA7w')
// eslint-disable-next-line
sessionStorage.setItem('KEYCLOAK_REFRESH_TOKEN', 'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0YjYxZGViZi01M2NlLTQxODMtYWFhMS1jMmU2NjQxMDNhZWQifQ.eyJqdGkiOiI2YTg4NWZhMi05ZGViLTQ1NzgtODczOS03ODQ4MTdiMGEzNTciLCJleHAiOjE1NzgwMzU2OTgsIm5iZiI6MCwiaWF0IjoxNTc4MDA2ODk4LCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJzdWIiOiI4YjgwZWM1ZC01YzUzLTRmOTMtYWJjNC1kMjE2MGU5ZTE1NjEiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoic2JjLWF1dGgtd2ViIiwibm9uY2UiOiIyMWZjNzBmZC02ZWI0LTQxYmMtOGIyOC0zNjJjNzlhNWQ1N2MiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI0NzUzZjU1OS1iNjJjLTQ3YTctYjEzZC0yNjM2NzRjMmFlMjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsicHVibGljX3VzZXIiLCJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIn0.MlBJFMqGNK9N-Cz8odC7IYyBfMFY_DF1p9GJYNEbgDo')
// eslint-disable-next-line
sessionStorage.setItem('KEYCLOAK_ID_TOKEN', 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3FQbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiI0YjUzM2E0ZS0yNjYxLTQxMTktYWIyOC1iZjA0ZDBkZmFjN2IiLCJleHAiOjE1NzgwMDg2OTgsIm5iZiI6MCwiaWF0IjoxNTc4MDA2ODk4LCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOiJzYmMtYXV0aC13ZWIiLCJzdWIiOiI4YjgwZWM1ZC01YzUzLTRmOTMtYWJjNC1kMjE2MGU5ZTE1NjEiLCJ0eXAiOiJJRCIsImF6cCI6InNiYy1hdXRoLXdlYiIsIm5vbmNlIjoiMjFmYzcwZmQtNmViNC00MWJjLThiMjgtMzYyYzc5YTVkNTdjIiwiYXV0aF90aW1lIjoxNTc3OTk3MzY4LCJzZXNzaW9uX3N0YXRlIjoiNDc1M2Y1NTktYjYyYy00N2E3LWIxM2QtMjYzNjc0YzJhZTIwIiwiYWNyIjoiMCIsImZpcnN0bmFtZSI6IkJDUkVHVEVTVCBHcmVnb3J5IiwibmFtZSI6IkJDUkVHVEVTVCBHcmVnb3J5IFRXRU5UWU9ORSIsInByZWZlcnJlZF91c2VybmFtZSI6ImJjc2Mvb2ljM25obzNxanZuamNmaXF5eXVyejRkeGNyYm5pNnkiLCJsb2dpblNvdXJjZSI6IkJDU0MiLCJsYXN0bmFtZSI6IlRXRU5UWU9ORSIsInVzZXJuYW1lIjoiYmNzYy9vaWMzbmhvM3Fqdm5qY2ZpcXl5dXJ6NGR4Y3Jibmk2eSJ9.RQv-tvgNhr2LN5zh8BXyvfk3mCKpkB6-Mhja-sIe9yBRLUDuiIPqXYe_Cm7wuHKDOrJKCMQSSFsGKp8zdJ6s0fofpYAaIntmVd7crpGq_9D29ZERXXWOTHtuGfY0lCzpFf10_Zj6ViYrbr5u2L9THiu050knYj-L_Q8nLsiiHhgNMXHoLVOYo_b91Ku30V5tgmj7A9Ado5KurxvqZzyaGQBTOhD3NIFwsqvp5ZHEdY_iz7ePYzPqrZG7ZDyOqn4eDk2oPVYZIewRSf_GkKzNNxMQDftL3gGQipEZ8f1fLsdBFszhqLJSqX1K_zwELV6_zhNbTaKMlM8gUG_fvXStyg')
sessionStorage.setItem('BUSINESS_IDENTIFIER', 'CP0001484')
sessionStorage.setItem('USER_FULL_NAME', 'Firstname Lastname')

/**
 * first fetch config from server, then load Vue
 */
configHelper.fetchConfig()
  .then(() => {
    // ensure we have the necessary Keycloak tokens
    if (!haveKcTokens()) {
      console.info('Redirecting to Signin URL...') // eslint-disable-line no-console
      const signinUrl: string = sessionStorage.getItem('SIGNIN_URL') || ''
      const businessesUrl: string = sessionStorage.getItem('BUSINESSES_URL') || ''
      // assume Signin URL is always reachable
      // append Businesses URL to return to
      signinUrl && businessesUrl && window.location.assign(signinUrl + encodeURIComponent(businessesUrl))
      return // do not execute remaining code
    }

    // start token service to refresh KC token periodically
    console.info('Starting token refresh service...') // eslint-disable-line no-console
    const tokenServices = new TokenServices()
    tokenServices.initUsingUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_URL'))
      .then(() => tokenServices.scheduleRefreshTimer())

    new Vue({
      vuetify,
      router,
      store,
      mixins: [withFlagProvider({ clientSideId: window['ldClientId'] })],
      render: h => h(App)
    }).$mount('#app')
  })
  .catch(error => {
    /**
     * This catches any un-handled errors from fetchConfig()
     * or anything else in then() block above.
     */
    console.error(error) // eslint-disable-line no-console
    alert('There was an error starting this page. (See console for details.)' +
      '\n\n' +
      'Click OK to go to Cooperatives Online.')
    window.location.assign('/cooperatives/auth/') // TODO: update this when new URLs are in place
  })

function haveKcTokens (): boolean {
  return Boolean(sessionStorage.getItem('KEYCLOAK_TOKEN') &&
    sessionStorage.getItem('KEYCLOAK_REFRESH_TOKEN') &&
    sessionStorage.getItem('KEYCLOAK_ID_TOKEN'))
}
