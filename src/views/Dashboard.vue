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
                  <span>To Do</span>&nbsp;<span class="gray6">({{todoCount}})</span>
                </h2>
              </header>
              <todo-list
                :inProcessFiling="inProcessFiling"
                :coaPending="coaPending"
                :disableChanges="disableChanges"
                @todo-count="todoCount = $event"
                @todo-filings="todoListFilings = $event"
                @has-blocker-task="hasBlockerTask = $event"
              />
            </section>

            <section>
              <header>
                <h2 class="mb-3" data-test-id="dashboard-filing-history-subtitle">
                  <span>Recent Filing History</span>&nbsp;<span class="gray6">({{filedCount}})</span>
                </h2>
              </header>
              <filing-history-list
                :disableChanges="disableChanges"
                @filed-count="filedCount = $event"
                @filings-list="historyFilings = $event"
                @has-blocker-filing="hasBlockerFiling = $event"
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
                      12:01 AM (Pacific Time). No other filings are allowed until then.</span>
                  </v-tooltip>
                </v-scale-transition>
                <v-btn text small color="primary"
                  id="standalone-addresses-button"
                  class="change-btn"
                  :disabled="disableChanges"
                  @click.native.stop="proceedCoa()"
                >
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
                  @click.native.stop="goToStandaloneDirectors()"
                >
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </header>
              <v-card flat>
                <director-list-sm
                  :showCompleteYourFilingMessage="isIncorpAppTask"
                  :showGrayedOut="isIncorpAppFiling"
                />
              </v-card>
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
import { mapState, mapActions } from 'vuex'

// Components
import TodoList from '@/components/Dashboard/TodoList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'

// Mixins
import { CommonMixin } from '@/mixins'

// Dialogs
import { CoaWarningDialog } from '@/components/dialogs'

// Enums and Constants
import { EntityStatus, FilingStatus } from '@/enums'
import { STANDALONE_ADDRESSES, STANDALONE_DIRECTORS } from '@/constants'

export default {
  name: 'Dashboard',

  mixins: [CommonMixin],

  components: {
    TodoList,
    FilingHistoryList,
    AddressListSm,
    DirectorListSm,
    CoaWarningDialog
  },

  data () {
    return {
      todoCount: 0,
      hasBlockerTask: false,
      hasBlockerFiling: false,
      hasPendingFiling: false,
      filedCount: 0,
      historyFilings: [],
      todoListFilings: [],
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

    /** Whether this is a Draft Incorporation Application. */
    isIncorpAppTask (): boolean {
      return (this.entityStatus === EntityStatus.DRAFT_INCORP_APP)
    },

    /** Whether this is a Paid Incorporation Application. */
    isIncorpAppFiling (): boolean {
      return (this.entityStatus === EntityStatus.PAID_INCORP_APP)
    },

    /** Whether to block a new filing because another item has to be finished first. */
    disableChanges (): boolean {
      return (this.hasBlockerTask || this.hasBlockerFiling || this.hasPendingFiling)
    }
  },

  methods: {
    ...mapActions(['setCurrentFilingStatus']),

    goToStandaloneDirectors () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: STANDALONE_DIRECTORS, params: { filingId: 0 } }) // 0 means "new COD filing"
    },

    goToStandaloneAddresses () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: STANDALONE_ADDRESSES, params: { filingId: 0 } }) // 0 means "new COA filing"
    },

    checkToReloadDashboard () {
      // cancel any existing timer so we can start fresh here
      clearTimeout(this.refreshTimer)

      let filingId = null
      // NB: use unary plus operator to cast string to number
      if (this.$route !== undefined) filingId = +this.$route.query.filing_id // if missing, this is NaN (false)

      // only consider refreshing the dashboard if we came from a filing
      if (!filingId) return

      const isInFilingHistory = Boolean(this.historyFilings.find(el => el.filingId === filingId))
      const isInTodoList = Boolean(this.todoListFilings.find(el => el.id === filingId))

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
     * Searches the filings history for a "pending" state, ie, paid (not yet completed).
     * Used to block new filings while there's a pending one.
     */
    checkPendingFilings (): void {
      if (!this.historyFilings?.length) return // safety check

      const foundPaid = this.historyFilings.some(filing => {
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

    /**
     * Toggle the Change of address warning dialog.
     */
    toggleCoaWarning () {
      this.coaWarningDialog = !this.coaWarningDialog
    },

    /**
     * Display COA warning if BCOMP else proceed to COA.
     */
    proceedCoa () {
      this.isBComp() ? this.toggleCoaWarning() : this.goToStandaloneAddresses()
    }
  },

  watch: {
    historyFilings () {
      // check if any filing has a pending state
      this.checkPendingFilings()

      // check whether to reload the dashboard with updated data
      this.checkToReloadDashboard()
    },

    todoListFilings () {
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
