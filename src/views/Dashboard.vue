<template>
  <div id="dashboard">
    <coa-warning-dialog
      :dialog="coaWarningDialog"
      @toggle="toggleCoaWarning"
      @proceed="goToStandaloneAddresses"
      attach="#dashboard"
    />

    <v-container id="dashboard-container" class="view-container">
      <article id="dashboard-article">
        <header>
          <h1 data-test-id="dashboard-title">Dashboard</h1>
        </header>

        <v-row>
          <v-col cols="12" md="9">
            <section>
              <header>
                <h2 class="mb-3" data-test-id="dashboard-todo-subtitle">
                  <span>To Do</span>&nbsp;<span class="gray6">({{taskCount}})</span>
                </h2>
              </header>
              <legal-obligation/>
              <todo-list
                :inProcessFiling="inProcessFiling"
                :coaPending="coaPending"
                :disableChanges="disableChanges"
                @task-count="taskCount = $event"
                @task-items="taskItems = $event"
                @has-blocker-task="updateBlockerTasks($event)"
              />
            </section>

            <section>
              <header>
                <h2 data-test-id="dashboard-filing-history-subtitle">
                  <span>Recent Filing History</span>&nbsp;<span class="gray6">({{historyCount}})</span>
                </h2>
                <staff-notation
                  v-if="visibleForStaff"
                  addScrollbarOffset="true"
                  @close="reloadDashboardIfNeeded($event)"
                />
              </header>
              <filing-history-list
                 class="mt-3"
                :disableChanges="disableChanges"
                @history-count="historyCount = $event"
                @history-items="historyItems = $event"
              />
            </section>
          </v-col>

          <v-col cols="12" md="3" style="position: relative">
            <section>
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-addresses-subtitle">Office Addresses</h2>
                <v-scale-transition>
                  <v-tooltip top content-class="pending-tooltip">
                    <template v-slot:activator="{ on }">
                      <v-chip small label color="yellow" text-color="black"
                        class="pending-chip"
                        v-show="coaPending"
                        v-on="on"
                      >
                        <span>Pending</span>
                      </v-chip>
                    </template>
                    <span>The updated office addresses will be legally effective on {{ coaEffectiveDate }},
                      12:01 am Pacific time. No other filings are allowed until then.</span>
                  </v-tooltip>
                </v-scale-transition>
                <v-btn text small color="primary"
                  id="standalone-addresses-button"
                  class="change-btn"
                  :disabled="disableChanges"
                  @click.native.stop="proceedCoa()">
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </header>
              <v-card flat>
                <address-list-sm
                  :coaPending="coaPending"
                  :showCompleteYourFilingMessage="isIncorpAppTask"
                  :showGrayedOut="isIncorpAppFiling"
                />
              </v-card>
            </section>

            <section>
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-directors-subtitle">Current Directors</h2>
                <v-btn text small color="primary"
                  id="standalone-directors-button"
                  class="change-btn"
                  :disabled="disableChanges"
                  @click.native.stop="goToStandaloneDirectors()">
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </header>
              <div class="scrollable-container" style="max-height: 49rem">
                <v-card flat>
                  <director-list-sm
                    :showCompleteYourFilingMessage="isIncorpAppTask"
                    :showGrayedOut="isIncorpAppFiling"
                  />
                </v-card>
              </div>
            </section>
          </v-col>
        </v-row>
      </article>
    </v-container>
  </div>
</template>

<script lang="ts">
// Libraries
import axios from '@/axios-auth'
import { mapState, mapActions, mapGetters } from 'vuex'
import { getFeatureFlag } from '@/utils'

// Components
import TodoList from '@/components/Dashboard/TodoList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'

// Dialogs
import { CoaWarningDialog } from '@/components/dialogs'

// Enums and Interfaces
import { EntityStatus, FilingStatus, Routes } from '@/enums'
import { HistoryItemIF, TaskItemIF } from '@/interfaces'

export default {
  name: 'Dashboard',

  components: {
    TodoList,
    FilingHistoryList,
    AddressListSm,
    DirectorListSm,
    CoaWarningDialog,
    LegalObligation,
    StaffNotation
  },

  data () {
    return {
      hasPendingFiling: false,
      taskCount: 0,
      taskItems: [] as Array<TaskItemIF>,
      historyCount: 0,
      historyItems: [] as Array<HistoryItemIF>,
      refreshTimer: null as number,
      checkFilingStatusCount: 0,
      inProcessFiling: null as any,
      coaPending: false,
      coaEffectiveDate: null as string,
      coaWarningDialog: false
    }
  },

  computed: {
    ...mapState(['entityIncNo', 'entityStatus']),

    ...mapGetters(['isBComp', 'hasBlockerTask', 'isRoleStaff']),

    /** Whether this is a Draft Incorporation Application. */
    isIncorpAppTask (): boolean {
      return (this.entityStatus === EntityStatus.DRAFT_INCORP_APP)
    },

    /** Whether this is a Paid or Completed Incorporation Application. */
    isIncorpAppFiling (): boolean {
      return (this.entityStatus === EntityStatus.FILED_INCORP_APP)
    },

    /** Whether to block a new filing because another item has to be finished first.
     * No changes are allowed if
     * 1) this is a temporary reg number until it switches to a real business number
     * 2) has a filing pending (is PAID) and waiting for completion
     * 3) has a blocker task in the todo list (ie. draft, paid, error, correction )
     */
    disableChanges (): boolean {
      return (this.hasBlockerTask || this.hasPendingFiling || !!this.tempRegNumber)
    },

    /** The Incorporation Application's Temporary Registration Number string. */
    tempRegNumber (): string {
      return sessionStorage.getItem('TEMP_REG_NUMBER')
    },

    /** True if StaffNotation menu should be rendered. */
    visibleForStaff (): boolean {
      return getFeatureFlag('staff-notation-enabled') && this.isRoleStaff
    }
  },

  methods: {
    ...mapActions(['setCurrentFilingStatus', 'setHasBlockertask']),

    goToStandaloneDirectors () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: 0 } }) // 0 means "new COD filing"
    },

    goToStandaloneAddresses () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: 0 } }) // 0 means "new COA filing"
    },

    updateBlockerTasks (hasBlockerTask: boolean) {
      this.setHasBlockertask(hasBlockerTask)
    },

    reloadDashboardIfNeeded (needReload: boolean) {
      if (needReload) this.$root.$emit('triggerDashboardReload')
    },

    checkToReloadDashboard () {
      // cancel any existing timer so we can start fresh here
      clearTimeout(this.refreshTimer)

      let filingId = null
      // NB: use unary plus operator to cast string to number
      if (this.$route !== undefined) filingId = +this.$route.query.filing_id // if missing, this is NaN (false)

      // only consider refreshing the dashboard if we came from a filing
      if (!filingId) return

      const isInFilingHistory = Boolean(this.historyItems.find(el => el.filingId === filingId))
      const isInTodoList = Boolean(this.taskItems.find(el => el.id === filingId))

      // if this filing is NOT in the to-do list and IS in the filing history list, do nothing - there is no problem
      if (!isInTodoList && isInFilingHistory) return

      // if this filing is in the to-do list, mark it as in-progress for to-do list to format differently
      if (isInTodoList) {
        this.inProcessFiling = filingId
      }

      // reset iteration counter
      this.checkFilingStatusCount = 0

      // check for updated status to reload dashboard
      this.checkFilingStatus(filingId)
    },

    // checks whether this filing's status has changed
    // respawns itself approx. every 1 second for up to 10 iterations
    checkFilingStatus (filingId) {
      // stop this cycle after 10 iterations
      if (++this.checkFilingStatusCount >= 10) {
        this.inProcessFiling = null
        return
      }

      // get current filing status
      let url = `businesses/${this.entityIncNo}/filings/${filingId}`
      axios.get(url).then(res => {
        // if the filing status is now COMPLETE, reload the dashboard
        if (res && res.data && res.data.filing && res.data.filing.header &&
        res.data.filing.header.status === FilingStatus.COMPLETED) {
          // emit dashboard reload trigger event
          this.$root.$emit('triggerDashboardReload')
        } else {
          // call this function again in 1 second
          let vue = this
          this.refreshTimer = setTimeout(() => {
            vue.checkFilingStatus(filingId)
          }, 1000)
        }
      }).catch(() => {
        // call this function again in 1 second
        let vue = this
        this.refreshTimer = setTimeout(() => {
          vue.checkFilingStatus(filingId)
        }, 1000)
      })
    },

    /**
     * Searches the history items for a "pending" state, (ie, paid / not yet completed).
     * Used to block new filings while there's a pending one.
     */
    checkForPendingFilings (): void {
      if (!this.historyItems?.length) return // safety check

      const foundPaid = this.historyItems.some(filing => {
        if (filing.isPaid) {
          if (filing.isBcompCoaFutureEffective) {
            this.coaPending = true
            this.coaEffectiveDate = filing.effectiveDate
          }
          this.hasPendingFiling = true
          return true
        }
        return false
      })
    },

    /** Toggle the Change of address warning dialog. */
    toggleCoaWarning () {
      this.coaWarningDialog = !this.coaWarningDialog
    },

    /** Display COA warning if BCOMP else proceed to COA. */
    proceedCoa () {
      this.isBComp ? this.toggleCoaWarning() : this.goToStandaloneAddresses()
    }
  },

  watch: {
    historyItems () {
      // check if any history item has a pending state
      this.checkForPendingFilings()

      // check whether to reload the dashboard with updated data
      this.checkToReloadDashboard()
    },

    taskItems () {
      // check whether to reload the dashboard with updated data
      this.checkToReloadDashboard()
    }
  },

  destroyed () {
    // kill the refresh timer if it is running
    clearTimeout(this.refreshTimer)
  }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';

section header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-size: 1.125rem;
  }
}

.change-btn {
  padding: 0 6px 0 6px!important;
}

.pending-tooltip {
  max-width: 16rem;
}
</style>
