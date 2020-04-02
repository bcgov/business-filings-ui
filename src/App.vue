<template>
  <v-app class="app-container theme--light" id="app">

    <dashboard-unavailable-dialog
      :dialog="dashboardUnavailableDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <business-auth-error-dialog
      :dialog="businessAuthErrorDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <name-request-auth-error-dialog
      :dialog="nameRequestAuthErrorDialog"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <name-request-invalid-dialog
      :dialog="nameRequestInvalidDialog"
      :type="nameRequestInvalidType"
      @exit="onClickExit"
      @retry="onClickRetry"
      attach="#app"
    />

    <!-- Initial Page Load Transition -->
    <transition name="fade">
      <div class="loading-container" v-show="showLoadingContainer">
        <div class="loading__content">
          <v-progress-circular color="primary" size="50" indeterminate />
          <div class="loading-msg" v-if="!isSignoutRoute">Loading Dashboard</div>
        </div>
      </div>
    </transition>

    <sbc-header />

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
import { NOT_FOUND } from 'http-status-codes'

// Components
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import EntityInfo from '@/components/EntityInfo.vue'

// Dialogs
import { DashboardUnavailableDialog, BusinessAuthErrorDialog, NameRequestAuthErrorDialog,
  NameRequestInvalidDialog } from '@/components/dialogs'

// Mixins
import { DateMixin, CommonMixin, DirectorMixin, NamexRequestMixin } from '@/mixins'

// Folder containing the array of configuration objects
import { configJson } from '@/resources'

// Enums and Constants
import { EntityStatus, FilingStatus, FilingTypes, NameRequestStates } from '@/enums'
import { SIGNIN, SIGNOUT, DASHBOARD } from '@/constants'

export default {
  name: 'App',

  mixins: [DateMixin, CommonMixin, DirectorMixin, NamexRequestMixin],

  data () {
    return {
      dataLoaded: false as boolean,
      dashboardUnavailableDialog: false as boolean,
      businessAuthErrorDialog: false as boolean,
      nameRequestAuthErrorDialog: false as boolean,
      nameRequestInvalidDialog: false as boolean,
      nameRequestInvalidType: null as NameRequestStates,
      currentDateTimerId: null as number,
      nameRequest: null as object,

      // enums
      EntityStatus,
      FilingStatus,
      FilingTypes
    }
  },

  components: {
    DashboardUnavailableDialog,
    BusinessAuthErrorDialog,
    NameRequestAuthErrorDialog,
    NameRequestInvalidDialog,
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

    /** The NR Number string. */
    nrNumber (): string {
      return sessionStorage.getItem('NR_NUMBER')
    },

    /** True if loading container should be shown. */
    showLoadingContainer (): boolean {
      return (!this.dataLoaded &&
        !this.dashboardUnavailableDialog &&
        !this.businessAuthErrorDialog &&
        !this.nameRequestAuthErrorDialog &&
        !this.nameRequestInvalidDialog)
    },

    /** True if route is Signin. */
    isSigninRoute (): boolean {
      return Boolean(this.$route.name === SIGNIN)
    },

    /** True if route is Signout. */
    isSignoutRoute (): boolean {
      return Boolean(this.$route.name === SIGNOUT)
    },

    /** True if user is authenticated. */
    isAuthenticated (): boolean {
      // FUTURE: also check that token isn't expired!
      return Boolean(sessionStorage.getItem('KEYCLOAK_TOKEN'))
    }
  },

  created (): void {
    // init current date
    this.updateCurrentDate()

    // listen for dashboard reload trigger event
    this.$root.$on('triggerDashboardReload', () => this.fetchData())
  },

  mounted (): void {
    // do not fetch data if we need to authenticate
    // just let signin page do its thing
    if (!this.isAuthenticated) {
      return
    }

    // fetch business data
    this.fetchData()
  },

  destroyed (): void {
    // stop listening for dashboard reload trigger event
    this.$root.$off('triggerDashboardReload')
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
        // safety check
        if (!this.businessId && !this.nrNumber) throw new Error('Missing Business ID or NR Number')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        if (this.businessId) this.businessAuthErrorDialog = true
        if (this.nrNumber) this.nameRequestAuthErrorDialog = true
        return // do not execute remaining code
      }

      // check if current user is authorized
      this.getAuthorizations().then(data => {
        this.storeAuthorizations(data) // throws if no role

        // good so far ... fetch the business data
        if (this.businessId) {
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
        }

        // good so far ... fetch the NR data
        if (this.nrNumber) {
          this.nameRequestInvalidType = null
          Promise.all([
            this.getNrData(),
            this.getTasks(),
            this.getFilings()
          ]).then(data => {
            if (!data || data.length !== 3) throw new Error('Incomplete data')
            this.storeNrData(data[0])
            this.storeTasks(data[1])
            this.storeFilings(data[2])
            this.dataLoaded = true
          }).catch(error => {
            // eslint-disable-next-line no-console
            console.error(error)
            this.nameRequestInvalidDialog = true
          })
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.error(error)
        if (this.businessId) this.businessAuthErrorDialog = true
        if (this.nrNumber) this.nameRequestAuthErrorDialog = true
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
      const id = this.businessId || this.nrNumber
      const url = id + '/authorizations'
      const config = {
        baseURL: this.authApiUrl + 'entities/'
      }
      return axios.get(url, config)
    },

    storeAuthorizations (response: any): void {
      // NB: roles array may contain 'view', 'edit' or nothing
      const authRoles = response?.data?.roles
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
      const contacts = response?.data?.contacts
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
      const url = `businesses/${this.businessId}`
      return axios.get(url)
    },

    storeEntityInfo (response: any): void {
      const business = response?.data?.business
      if (business) {
        this.setEntityName(business.legalName)
        this.setEntityType(business.legalType)
        this.setNextARDate(business.nextAnnualReport)
        this.setEntityStatus(business.status)
        this.setEntityBusinessNo(business.taxId)
        this.setEntityIncNo(business.identifier)
        this.setLastPreLoadFilingDate(business.lastLedgerTimestamp
          ? business.lastLedgerTimestamp.split('T')[0] : null)
        this.setEntityFoundingDate(business.foundingDate) // datetime
        this.setLastAnnualReportDate(business.lastAnnualReport)

        this.storeConfigObject(business.legalType)

        const date = business.lastAnnualGeneralMeetingDate
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

    /** Gets NR data from Legal API. */
    getNrData (): Promise<any> {
      const url = `nameRequests/${this.nrNumber}`
      return axios.get(url)
        // FUTURE: should fix this workaround
        .then(response => Promise.resolve(response.data))
    },

    storeNrData (data: any): void {
      // check if NR is valid
      if (!this.isNrValid(data)) {
        this.nameRequestInvalidDialog = true
        // eslint-disable-next-line no-console
        console.log('Invalid NR, data =', data)
        throw new Error('Invalid NR data')
      }

      // FOR DEBUGGING ONLY - REMOVE WHEN NR DATA IS GOOD
      const expireDays = this.daysFromToday(data.expirationDate)
      if (isNaN(expireDays) || expireDays < 1) {
        const tomorrowMs = Date.now() + this.MS_IN_A_DAY
        data.expirationDate = new Date(tomorrowMs)
      }

      // check if NR is consumable
      const nrState: NameRequestStates = this.getNrState(data)
      if (nrState !== NameRequestStates.APPROVED) {
        this.nameRequestInvalidDialog = true
        this.nameRequestInvalidType = nrState
        // eslint-disable-next-line no-console
        console.log('NR not consumable, state =', nrState)
        throw new Error('NR not consumable')
      }

      // save data for later use (FOR DEBUGGING)
      this.nameRequest = data

      // save the approved name, etc
      this.setEntityName(data.names.find(name => name.state === NameRequestStates.APPROVED).name)
      this.setEntityType(data.requestTypeCd)
      this.setEntityIncNo(data.nrNum)
    },

    /** Gets tasks list from Legal API. */
    getTasks (): Promise<any> {
      const id = this.businessId || this.nrNumber
      const url = `businesses/${id}/tasks`
      return axios.get(url)
        .catch(error => {
          // if Business or Name Request is not found, return empty array
          if (error?.response?.status === NOT_FOUND) {
            return Promise.resolve({ data: { tasks: [] } })
          }
          return Promise.reject(error)
        })
    },

    storeTasks (response: any): void {
      const tasks = response?.data?.tasks
      if (this.businessId) {
        if (tasks) {
          this.setTasks(tasks)
        } else {
          throw new Error('Invalid tasks')
        }
      }
      // FUTURE: update this when API returns New Incorporation task (#3102)
      if (this.nrNumber) {
        if (tasks) {
          // if we have existing tasks, use them
          if (tasks.length > 0) {
            this.setTasks(tasks)
            this.setEntityStatus(EntityStatus.INCORPORATION_APPLICATION)
          } else {
            // otherwise create a New Incorporation task
            tasks.push({
              enabled: true,
              order: 1,
              task: {
                todo: {
                  nameRequest: this.nameRequest,
                  header: {
                    name: FilingTypes.NAME_REQUEST,
                    status: FilingStatus.NEW
                  }
                }
              }
            })
            this.setTasks(tasks)
            this.setEntityStatus(EntityStatus.NAME_REQUEST)
          }
        } else {
          throw new Error('Invalid tasks')
        }
      }
    },

    /** Gets filings list from Legal API. */
    getFilings (): Promise<any> {
      const id = this.businessId || this.nrNumber
      const url = `businesses/${id}/filings`
      return axios.get(url)
        .catch(error => {
          // if Business or Name Request is not found, return empty array
          if (error?.response?.status === NOT_FOUND) {
            return Promise.resolve({ data: { filings: [] } })
          }
          return Promise.reject(error)
        })
    },

    storeFilings (response: any): void {
      const filings = response?.data?.filings
      if (filings) {
        this.setFilings(filings)
      } else {
        throw new Error('Invalid filings')
      }
    },

    /** Gets addresses from Legal API. */
    getAddresses (): Promise<any> {
      const url = `businesses/${this.businessId}/addresses`
      return axios.get(url)
    },

    storeAddresses (response: any): void {
      if (response?.data) {
        if (response.data.registeredOffice) {
          this.setRegisteredAddress(this.omitProps(response.data.registeredOffice,
            ['deliveryAddress', 'mailingAddress'], ['addressType']))
        }
        if (response.data.recordsOffice) {
          this.setRecordsAddress(this.omitProps(response.data.recordsOffice,
            ['deliveryAddress', 'mailingAddress'], ['addressType']))
        }
      } else {
        throw new Error('invalid office addresses')
      }
    },

    /** Gets directors list from Legal API. */
    getDirectors (): Promise<any> {
      const url = `businesses/${this.businessId}/directors`
      return axios.get(url)
    },

    storeDirectors (response: any): void {
      const directors = response?.data?.directors
      if (directors) {
        const directorsSorted = directors.sort(this.fieldSorter(['lastName', 'firstName', 'middleName']))
        for (var i = 0; i < directorsSorted.length; i++) {
          directorsSorted[i].id = i + 1
          directorsSorted[i].isNew = false
          directorsSorted[i].isDirectorActive = true
        }
        this.setDirectors(directorsSorted)
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
      // reroute / redirect to Signout page
      // this.$router.push({ name: SIGNOUT })
      const baseUrl = sessionStorage.getItem('BASE_URL')
      baseUrl && window.location.assign(`${baseUrl}signout`)
    },

    /** Handles Retry click event from dialogs. */
    onClickRetry (): void {
      this.dashboardUnavailableDialog = false
      this.businessAuthErrorDialog = false
      this.nameRequestAuthErrorDialog = false
      this.nameRequestInvalidDialog = false
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
