<template>
  <v-app class="app-container theme--light" id="app">

    <dashboard-unavailable-dialog
      :dialog="dashboardUnavailableDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <account-authorization-dialog
      :dialog="accountAuthorizationDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <!-- Initial Page Load Transition -->
    <transition name="fade">
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
          <div class="loading-msg">Loading Business Dashboard</div>
        </div>
      </div>
    </transition>

    <sbc-header ref="sbcHeader" />

    <div class="app-body">
      <!-- only show pages while signing in or once the data is loaded -->
      <main v-if="isSigninRoute || dataLoaded">
        <entity-info />
        <router-view />
      </main>
    </div>

    <sbc-footer />

  </v-app>
</template>

<script lang="ts">
// Libraries
import { mapActions } from 'vuex'
import axios from '@/axios-auth'
import { Route } from 'vue-router/types'

// Components
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import EntityInfo from '@/components/EntityInfo.vue'

// Dialogs
import { DashboardUnavailableDialog, AccountAuthorizationDialog } from '@/components/dialogs'

// Mixins
import { DateMixin, CommonMixin, DirectorMixin } from '@/mixins'

// Folder containing the array of configuration objects
import { configJson } from '@/resources'

// Constants
import { SIGNIN, DASHBOARD } from '@/constants'

export default {
  name: 'App',

  mixins: [DateMixin, CommonMixin, DirectorMixin],

  data () {
    return {
      dataLoaded: false as boolean,
      dashboardUnavailableDialog: false as boolean,
      accountAuthorizationDialog: false as boolean,
      currentDateTimerId: null as number
    }
  },

  components: {
    DashboardUnavailableDialog,
    AccountAuthorizationDialog,
    SbcHeader,
    SbcFooter,
    EntityInfo
  },

  computed: {
    /** The Auth API string. */
    authApiUrl (): string {
      return sessionStorage.getItem('AUTH_API_URL')
    },

    /** The Business ID string. */
    businessId (): string {
      return sessionStorage.getItem('BUSINESS_ID')
    },

    /** True if loading container should be shown. */
    showLoadingContainer (): boolean {
      return (!this.dataLoaded && !this.dashboardUnavailableDialog && !this.accountAuthorizationDialog)
    },

    /** True if route is Signin. */
    isSigninRoute (): boolean {
      return Boolean(this.$route.name === SIGNIN)
    },

    /** True if user is authenticated. */
    isAuthenticated (): boolean {
      // FUTURE: also check that token isn't expired!
      return Boolean(sessionStorage.getItem('KEYCLOAK_TOKEN'))
    }
  },

  created (): void {
    // do not fetch data if we need to authenticate
    // just let signin page do its thing
    if (!this.isAuthenticated) {
      return
    }

    // init current date
    this.updateCurrentDate()

    // fetch business data
    this.fetchData()

    // listen for dashboard reload trigger event
    this.$root.$on('triggerDashboardReload', () => this.fetchData())
  },

  methods: {
    ...mapActions(['setKeycloakRoles', 'setAuthRoles', 'setBusinessEmail', 'setBusinessPhone',
      'setBusinessPhoneExtension', 'setCurrentDate', 'setEntityName', 'setEntityType', 'setEntityStatus',
      'setEntityBusinessNo', 'setEntityIncNo', 'setLastPreLoadFilingDate', 'setEntityFoundingDate', 'setLastAgmDate',
      'setNextARDate', 'setTasks', 'setFilings', 'setRegisteredAddress', 'setRecordsAddress', 'setDirectors',
      'setLastAnnualReportDate', 'setConfigObject']),

    /** Stores today's date and sets timeout to keep it updated. */
    updateCurrentDate (): void {
      // clear previous timeout, if any
      clearTimeout(this.currentDateTimerId)

      // set current date
      const now = new Date()
      const date = this.dateToUsableString(now)
      this.setCurrentDate(date)

      // set timeout to run this again at midnight
      const hoursToMidnight = 23 - now.getHours()
      const minutesToMidnight = 59 - now.getMinutes()
      const secondsToMidnight = 59 - now.getSeconds()
      const timeout = ((((hoursToMidnight * 60) + minutesToMidnight) * 60) + secondsToMidnight) * 1000
      this.currentDateTimerId = setTimeout(this.updateCurrentDate, timeout)
    },

    fetchData (): void {
      this.dataLoaded = false

      try {
        // get Keycloak roles
        const jwt = this.getJWT()
        const keycloakRoles = this.getKeycloakRoles(jwt)
        this.setKeycloakRoles(keycloakRoles)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.accountAuthorizationDialog = true
        return // do not execute remaining code
      }

      // check if current user is authorized
      this.getAuthorizations().then(data => {
        this.storeAuthorizations(data) // throws if no role

        // good so far ... fetch the rest of the data
        Promise.all([
          this.getBusinessInfo(),
          this.getEntityInfo(),
          this.getTasks(),
          this.getFilings(),
          this.getAddresses(),
          this.getDirectors()
        ]).then(data => {
          if (!data || data.length !== 6) throw new Error('Incomplete data')
          this.storeBusinessInfo(data[0])
          this.storeEntityInfo(data[1])
          this.storeTasks(data[2])
          this.storeFilings(data[3])
          this.storeAddresses(data[4])
          this.storeDirectors(data[5])
          this.dataLoaded = true
        }).catch(error => {
          // eslint-disable-next-line no-console
          console.error(error)
          this.dashboardUnavailableDialog = true
        })
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.accountAuthorizationDialog = true
      })
    },

    /** Gets Keycloak JWT and parses it. */
    getJWT (): any {
      const token = sessionStorage.getItem('KEYCLOAK_TOKEN')
      if (token) {
        return this.parseToken(token)
      }
      throw new Error('Error getting Keycloak token')
    },

    /** Decodes and parses Keycloak token. */
    parseToken (token: string): any {
      try {
        const base64Url = token.split('.')[1]
        const base64 = decodeURIComponent(window.atob(base64Url).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(base64)
      } catch (error) {
        throw new Error('Error parsing token - ' + error)
      }
    },

    /** Gets Keycloak roles from JWT. */
    getKeycloakRoles (jwt: any): Array<string> {
      const keycloakRoles = jwt.roles
      if (keycloakRoles && keycloakRoles.length > 0) {
        return keycloakRoles
      }
      throw new Error('Error getting Keycloak roles')
    },

    /** Gets authorizations from Auth API. */
    getAuthorizations (): Promise<any> {
      const url = this.businessId + '/authorizations'
      const config = {
        baseURL: this.authApiUrl + 'entities/'
      }
      return axios.get(url, config)
    },

    storeAuthorizations (response: any): void {
      // NB: roles array may contain 'view', 'edit' or nothing
      const authRoles = response && response.data && response.data.roles
      if (authRoles && authRoles.length > 0) {
        this.setAuthRoles(authRoles)
      } else {
        throw new Error('Invalid auth roles')
      }
    },

    /** Gets business info from Auth API. */
    getBusinessInfo (): Promise<any> {
      const url = this.businessId
      const config = {
        baseURL: this.authApiUrl + 'entities/'
      }
      return axios.get(url, config)
    },

    storeBusinessInfo (response: any): void {
      const contacts = response && response.data && response.data.contacts
      // ensure we received the right looking object
      // but allow empty contacts array
      if (contacts) {
        // at this time there is at most 1 contact
        const contact = contacts.length > 0 && contacts[0]
        if (contact) {
          this.setBusinessEmail(contact.email)
          this.setBusinessPhone(contact.phone)
          this.setBusinessPhoneExtension(contact.phoneExtension)
        }
      } else {
        throw new Error('Invalid business contact info')
      }
    },

    /** Gets entity info from Legal API. */
    getEntityInfo (): Promise<any> {
      const url = this.businessId
      return axios.get(url)
    },

    storeEntityInfo (response: any): void {
      if (response && response.data && response.data.business) {
        this.setEntityName(response.data.business.legalName)
        this.setEntityType(response.data.business.legalType)
        this.setNextARDate(response.data.business.nextAnnualReport)
        this.setEntityStatus(response.data.business.status)
        this.setEntityBusinessNo(response.data.business.taxId)
        this.setEntityIncNo(response.data.business.identifier)
        this.setLastPreLoadFilingDate(response.data.business.lastLedgerTimestamp
          ? response.data.business.lastLedgerTimestamp.split('T')[0] : null)
        this.setEntityFoundingDate(response.data.business.foundingDate) // datetime
        this.setLastAnnualReportDate(response.data.business.lastAnnualReport)

        this.storeConfigObject(response.data.business.legalType)

        const date = response.data.business.lastAnnualGeneralMeetingDate
        if (
          date &&
          date.length === 10 &&
          date.indexOf('-') === 4 &&
          date.indexOf('-', 5) === 7 &&
          date.indexOf('-', 8) === -1
        ) {
          this.setLastAgmDate(date)
        } else {
          this.setLastAgmDate(null)
        }
      } else {
        throw new Error('Invalid entity info')
      }
    },

    /** Gets tasks list from Legal API. */
    getTasks (): Promise<any> {
      const url = this.businessId + '/tasks'
      return axios.get(url)
    },

    storeTasks (response: any): void {
      if (response && response.data && response.data.tasks) {
        this.setTasks(response.data.tasks)
      } else {
        throw new Error('Invalid tasks')
      }
    },

    /** Gets filings list from Legal API. */
    getFilings (): Promise<any> {
      const url = this.businessId + '/filings'
      return axios.get(url)
    },

    storeFilings (response: any): void {
      if (response && response.data && response.data.filings) {
        this.setFilings(response.data.filings)
      } else {
        throw new Error('Invalid filings')
      }
    },

    /** Gets addresses from Legal API. */
    getAddresses (): Promise<any> {
      const url = this.businessId + '/addresses'
      return axios.get(url)
    },

    storeAddresses (response: any): void {
      if (response && response.data) {
        if (response.data.registeredOffice) {
          this.setRegisteredAddress(this.omitProps(response.data.registeredOffice,
            ['deliveryAddress', 'mailingAddress'],
            ['addressType']))
        }
        if (response.data.recordsOffice) {
          this.setRecordsAddress(this.omitProps(response.data.recordsOffice,
            ['deliveryAddress', 'mailingAddress'],
            ['addressType']))
        }
      } else {
        throw new Error('invalid office addresses')
      }
    },

    /** Gets directors list from Legal API. */
    getDirectors (): Promise<any> {
      const url = this.businessId + '/directors'
      return axios.get(url)
    },

    storeDirectors (response: any): void {
      if (response && response.data && response.data.directors) {
        const directorsList = response.data.directors
        const directors = directorsList.sort(this.fieldSorter(['lastName', 'firstName', 'middleName']))
        for (var i = 0; i < directors.length; i++) {
          directors[i].id = i + 1
          directors[i].isNew = false
          directors[i].isDirectorActive = true
        }
        this.setDirectors(directors)
      } else {
        throw new Error('Invalid directors')
      }
    },

    /** Stores config object matching this business' legal type. */
    storeConfigObject (legalType: string): void {
      const configObject = configJson.find(x => x.typeEnum === legalType)
      this.setConfigObject(configObject)
    },

    /** Handles Exit click event from dialogs. */
    onClickExit (): void {
      // redirect to Business Registry home page
      const businessesUrl = sessionStorage.getItem('BUSINESSES_URL')
      // assume Businesses URL is always reachable
      businessesUrl && window.location.assign(businessesUrl)
    },

    /** Handles Retry click event from dialogs. */
    onClickRetry (): void {
      this.dashboardUnavailableDialog = false
      this.accountAuthorizationDialog = false
      this.fetchData()
    }
  },

  watch: {
    '$route' (): void {
      // if we (re)route to the dashboard then re-fetch all data
      // (does not fire on initial dashboard load)
      if (this.$route.name === DASHBOARD) {
        this.fetchData()
      }
    }
  }
}
</script>

<style lang="scss">
// @import '@/assets/styles/theme.scss';
</style>
