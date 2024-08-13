<template>
  <div id="dashboard">
    <CoaWarningDialog
      :dialog="coaWarningDialog"
      attach="#dashboard"
      @toggle="toggleCoaWarning()"
      @proceed="goToStandaloneAddresses()"
    />

    <v-container
      id="dashboard-container"
      class="view-container"
    >
      <article id="dashboard-article">
        <v-row class="mt-n9">
          <v-col
            cols="12"
            md="9"
          >
            <!-- Alerts section-->
            <section
              v-show="alertCount > 0"
              id="alerts-section"
            >
              <header>
                <h2 class="mb-3">
                  <span>Alerts</span>&nbsp;<span class="section-count">({{ alertCount }})</span>
                </h2>
              </header>
              <Alerts @count="alertCount = $event" />
            </section>

            <!-- To Do section-->
            <section id="dashboard-todo-section">
              <header>
                <h2 class="mb-3">
                  <span>To Do</span>&nbsp;<span class="section-count">({{ todoCount }})</span>
                </h2>
              </header>
              <LegalObligation />
              <TodoList
                :highlightId="filingId"
                @todo-count="todoCount = $event"
              />
            </section>

            <!-- Pending section-->
            <section
              v-if="getPendingsList.length > 0"
              id="dashboard-pending-section"
            >
              <header>
                <h2 class="mb-3">
                  <span>Pending Staff Review</span>&nbsp;<span class="section-count">({{ pendingCount }})</span>
                </h2>
              </header>
              <PendingList :highlightId="filingId" />
            </section>

            <!-- Recent Filing History section -->
            <section id="dashboard-filing-history-section">
              <header>
                <h2>
                  <span>Recent Filing History</span>&nbsp;<span class="section-count">({{ getHistoryCount }})</span>
                </h2>
                <StaffNotation
                  v-if="isRoleStaff && !!businessId"
                  addScrollbarOffset="true"
                  @close="reloadDataIfNeeded($event)"
                />
              </header>
              <FilingHistoryList
                class="mt-3"
                :highlightId="filingId"
              />
            </section>
          </v-col>

          <v-col
            cols="12"
            md="3"
            style="position: relative"
          >
            <!-- Custodian of Records -->
            <section v-if="isHistorical && custodians.length > 0">
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-custodians-subtitle">
                  Custodian of Records
                </h2>
              </header>
              <div
                class="scrollable-container scrollable-container-height"
              >
                <v-card flat>
                  <CustodianListSm :custodians="custodians" />
                </v-card>
              </div>
            </section>

            <!-- Office Addresses -->
            <section>
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-addresses-subtitle">
                  {{ isEntityFirm ? 'Business Addresses' : 'Office Addresses' }}
                </h2>

                <v-scale-transition>
                  <v-tooltip
                    top
                    content-class="pending-tooltip"
                  >
                    <template #activator="{ on }">
                      <v-chip
                        v-show="isCoaPending"
                        small
                        label
                        color="yellow"
                        text-color="black"
                        class="pending-chip"
                        v-on="on"
                      >
                        <span>Pending</span>
                      </v-chip>
                    </template>
                    The updated office addresses will be legally effective on
                    {{ dateToPacificDateTime(coaEffectiveDate) }}.
                    No other filings are allowed until then.
                  </v-tooltip>
                </v-scale-transition>

                <v-btn
                  v-if="!isDisableNonBenCorps && !isHistorical"
                  id="standalone-addresses-button"
                  text
                  small
                  color="primary"
                  class="change-btn"
                  :disabled="!isAllowed(AllowableActions.ADDRESS_CHANGE)"
                  @click.native.stop="onAddressChangeClick()"
                >
                  <v-icon small>
                    mdi-pencil
                  </v-icon>
                  <span>Change</span>
                </v-btn>
              </header>

              <v-card flat>
                <AddressListSm
                  :showCompleteYourFilingMessage="isBootstrapTodo"
                  :showGrayedOut="isBootstrapFiling || isBootstrapPending"
                />
              </v-card>
            </section>

            <!-- Proprietor / Partners -->
            <section v-if="isEntityFirm">
              <header class="aside-header mb-3">
                <h2
                  v-if="isEntitySoleProp"
                  data-test-id="dashboard-proprietor-subtitle"
                >
                  Proprietor
                </h2>
                <h2
                  v-if="isEntityPartnership"
                  data-test-id="dashboard-partners-subtitle"
                >
                  Partners
                </h2>
                <v-btn
                  v-if="!isHistorical"
                  id="change-proprietor-partners-button"
                  text
                  small
                  color="primary"
                  class="change-btn"
                  :disabled="!isAllowed(AllowableActions.DIRECTOR_CHANGE)"
                  @click.native.stop="goToChangeFiling()"
                >
                  <v-icon small>
                    mdi-pencil
                  </v-icon>
                  <span>Change</span>
                </v-btn>
              </header>

              <div
                class="scrollable-container scrollable-container-height"
              >
                <v-card flat>
                  <ProprietorPartnersListSm
                    :showCompleteYourFilingMessage="isBootstrapTodo"
                    :showGrayedOut="isBootstrapFiling || isBootstrapPending"
                  />
                </v-card>
              </div>
            </section>

            <!-- Current Directors-->
            <section v-else>
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-directors-subtitle">
                  Current Directors
                </h2>
                <v-btn
                  v-if="!isDisableNonBenCorps && !isHistorical"
                  id="standalone-directors-button"
                  text
                  small
                  color="primary"
                  class="change-btn"
                  :disabled="!isAllowed(AllowableActions.DIRECTOR_CHANGE)"
                  @click.native.stop="goToStandaloneDirectors()"
                >
                  <v-icon small>
                    mdi-pencil
                  </v-icon>
                  <span>Change</span>
                </v-btn>
              </header>

              <div
                class="scrollable-container scrollable-container-height"
              >
                <v-card flat>
                  <DirectorListSm
                    :showCompleteYourFilingMessage="isBootstrapTodo"
                    :showGrayedOut="isBootstrapFiling || isBootstrapPending"
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
import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { navigate } from '@/utils'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import Alerts from '@/components/Dashboard/Alerts.vue'
import CustodianListSm from '@/components/Dashboard/CustodianListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'
import PendingList from '@/components/Dashboard/PendingList.vue'
import ProprietorPartnersListSm from '@/components/Dashboard/ProprietorPartnersListSm.vue'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'
import TodoList from '@/components/Dashboard/TodoList.vue'
import { CoaWarningDialog } from '@/components/dialogs'
import { Routes, AllowableActions, Roles } from '@/enums'
import { ApiFilingIF, PartyIF } from '@/interfaces'
import { AllowableActionsMixin, CommonMixin, DateMixin } from '@/mixins'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from '@/stores'

@Component({
  components: {
    AddressListSm,
    Alerts,
    CoaWarningDialog,
    CustodianListSm,
    DirectorListSm,
    FilingHistoryList,
    LegalObligation,
    PendingList,
    ProprietorPartnersListSm,
    StaffNotation,
    TodoList
  }
})
export default class Dashboard extends Mixins(AllowableActionsMixin, CommonMixin, DateMixin) {
  // local variables
  todoCount = 0
  coaWarningDialog = false
  alertCount = 0

  // enum for template
  readonly AllowableActions = AllowableActions

  // store references
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useBusinessStore) isBaseCompany!: boolean
  @Getter(useBusinessStore) isDisableNonBenCorps!: boolean
  // @Getter(useBusinessStore) isEntityFirm!: boolean
  @Getter(useBusinessStore) isEntityPartnership!: boolean
  // @Getter(useBusinessStore) isEntitySoleProp!: boolean
  @Getter(useBusinessStore) isHistorical!: boolean

  @Getter(useConfigurationStore) getEditUrl!: string

  @Getter(useFilingHistoryListStore) getHistoryCount!: number
  @Getter(useFilingHistoryListStore) getPendingCoa!: ApiFilingIF

  @Getter(useRootStore) getParties!: Array<PartyIF>
  @Getter(useRootStore) getPendingsList!: Array<any>
  @Getter(useRootStore) isBootstrapFiling!: boolean
  @Getter(useRootStore) isBootstrapPending!: boolean
  @Getter(useRootStore) isBootstrapTodo!: boolean
  // @Getter(useRootStore) isRoleStaff!: boolean

  get pendingCount (): number {
    return this.getPendingsList.length
  }

  /** Whether a COA is pending. */
  get isCoaPending (): boolean {
    return !!this.getPendingCoa
  }

  /** The COA effective date, if a COA is pending, else null. */
  get coaEffectiveDate (): Date {
    return this.getPendingCoa
      ? new Date(this.getPendingCoa.effectiveDate)
      : null
  }

  /** The Business ID string. */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /**
   * The Filing ID route query parameter. May be NaN (which is falsy).
    * This is sometimes provided on the URL to highlight a filing, for example
    * when returning from saving/filing it.
    */
  get filingId (): number {
    // NB: use unary plus operator to cast string to number
    return +this.$route.query.filing_id
  }

  get custodians (): PartyIF[] {
    return this.getParties.filter(party => party.roles?.some(role => role.roleType === Roles.CUSTODIAN))
  }

  goToStandaloneDirectors () {
    this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: '0' } }) // 0 means "new COD filing"
  }

  goToChangeFiling () {
    const url = `${this.getEditUrl}${this.getIdentifier}/change`
    navigate(url)
  }

  goToStandaloneAddresses () {
    this.$router.push({ name: Routes.STANDALONE_ADDRESSES, params: { filingId: '0' } }) // 0 means "new COA filing"
  }

  reloadDataIfNeeded (needed: boolean) {
    if (needed) this.$root.$emit('reloadData')
  }

  /** Toggle the Change of address warning dialog. */
  toggleCoaWarning () {
    this.coaWarningDialog = !this.coaWarningDialog
  }

  /**
    * If entity is a Firm then navigate to Edit UI.
    * If entity is a base company then display COA warning.
    * Otherwise proceed to COA.
    */
  onAddressChangeClick () {
    if (this.isEntityFirm) {
      const url = `${this.getEditUrl}${this.getIdentifier}/change`
      navigate(url)
    } else if (this.isBaseCompany) {
      this.toggleCoaWarning()
    } else {
      this.goToStandaloneAddresses()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

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

.section-count {
  color: $gray9;
  font-weight: normal;
}

.scrollable-container-height {
  max-height: 49rem;
}
</style>
