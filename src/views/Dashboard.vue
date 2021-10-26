<template>
  <div id="dashboard">
    <CoaWarningDialog
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
              <LegalObligation/>
              <TodoList
                :highlightId="filingId"
                :disableChanges="disableChanges"
                @todo-count="todoCount = $event"
              />
            </section>

            <section>
              <header>
                <h2 data-test-id="dashboard-filing-history-subtitle">
                  <span>Recent Filing History</span>&nbsp;<span class="gray6">({{historyCount}})</span>
                </h2>
                <StaffNotation
                  v-if="isRoleStaff && !tempRegNumber"
                  addScrollbarOffset="true"
                  @close="reloadDataIfNeeded($event)"
                />
              </header>
              <FilingHistoryList
                class="mt-3"
                :highlightId="filingId"
                :disableChanges="disableChanges"
                @history-count="historyCount = $event"
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
                        v-show="isCoaPending"
                        v-on="on"
                      >
                        <span>Pending</span>
                      </v-chip>
                    </template>
                    The updated office addresses will be legally effective on
                    {{dateToPacificDateTime(getCoaEffectiveDate)}}.
                    No other filings are allowed until then.
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
                <AddressListSm
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
                  <DirectorListSm
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

// Components and Dialogs
import TodoList from '@/components/Dashboard/TodoList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'
import { CoaWarningDialog } from '@/components/dialogs'

// Enums and Interfaces
import { EntityStatus, FilingStatus, Routes } from '@/enums'

// Mixins
import { DateMixin, EnumMixin } from '@/mixins'

export default {
  name: 'Dashboard',

  mixins: [DateMixin, EnumMixin],

  components: {
    TodoList,
    FilingHistoryList,
    AddressListSm,
    DirectorListSm,
    LegalObligation,
    StaffNotation,
    CoaWarningDialog
  },

  data () {
    return {
      todoCount: 0,
      historyCount: 0,
      coaWarningDialog: false
    }
  },

  computed: {
    ...mapState(['entityStatus']),

    ...mapGetters(['isBComp', 'hasBlocker', 'isRoleStaff', 'isCoaPending', 'getCoaEffectiveDate']),

    /** Whether this is a Draft Incorporation Application. */
    isIncorpAppTask (): boolean {
      return (this.entityStatus === EntityStatus.DRAFT_INCORP_APP)
    },

    /** Whether this is a Paid or Completed Incorporation Application. */
    isIncorpAppFiling (): boolean {
      return (this.entityStatus === EntityStatus.FILED_INCORP_APP)
    },

    /**
     * Whether to block a new filing, ie:
     * 1) there is a blocker task in the todo list or blocker filing in the filing history list
     * 2) this is a temporary reg number until it switches to a real business number
     */
    disableChanges (): boolean {
      return (this.hasBlocker || !!this.tempRegNumber)
    },

    /** The Incorporation Application's Temporary Registration Number string. */
    tempRegNumber (): string {
      return sessionStorage.getItem('TEMP_REG_NUMBER')
    },

    /** The Filing ID route query parameter. May be NaN (which is falsy). */
    filingId (): number {
      // NB: use unary plus operator to cast string to number
      return +this.$route.query.filing_id
    }
  },

  methods: {
    ...mapActions(['setCurrentFilingStatus']),

    goToStandaloneDirectors () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: 0 } }) // 0 means "new COD filing"
    },

    goToStandaloneAddresses () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: 0 } }) // 0 means "new COA filing"
    },

    reloadDataIfNeeded (needed: boolean) {
      if (needed) this.$root.$emit('reloadData')
    },

    /** Toggle the Change of address warning dialog. */
    toggleCoaWarning () {
      this.coaWarningDialog = !this.coaWarningDialog
    },

    /** Display COA warning if BCOMP else proceed to COA. */
    proceedCoa () {
      this.isBComp ? this.toggleCoaWarning() : this.goToStandaloneAddresses()
    }
  }
}
</script>

<style lang="scss" scoped>
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
  max-width: 16.5rem;
}
</style>
