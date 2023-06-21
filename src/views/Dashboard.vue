<template>
  <div id="dashboard">
    <CoaWarningDialog
      :dialog="coaWarningDialog"
      @toggle="toggleCoaWarning()"
      @proceed="goToStandaloneAddresses()"
      attach="#dashboard"
    />

    <v-container id="dashboard-container" class="view-container">
      <article id="dashboard-article">
        <v-row class="mt-n9">
          <v-col cols="12" md="9">
            <!-- Alerts section-->
            <section v-if="alertCount > 0" id="dashboard-alerts-section" class="mb-n6">
              <header>
                <h2 class="mb-3">
                  <span>Alerts</span>&nbsp;<span class="section-count">({{ alertCount }})</span>
                </h2>
              </header>
              <!-- FUTURE: move these to a new Alerts component and inside one expansion panel -->
              <FrozenInformation v-if="isFrozenInformationAlert" />
              <MissingInformation v-if="isMissingInformationAlert" />
              <NotInCompliance v-if="isNotInComplianceAlert" />
              <NotInGoodStanding v-if="isNotInGoodStandingAlert" />
            </section>

            <!-- To Do section-->
            <section id="dashboard-todo-section">
              <header>
                <h2 class="mb-3">
                  <span>To Do</span>&nbsp;<span class="section-count">({{todoCount}})</span>
                </h2>
              </header>
              <LegalObligation />
              <TodoList
                :highlightId="filingId"
                @todo-count="todoCount = $event"
              />
            </section>

            <!-- Recent Filing History section -->
            <section id="dashboard-filing-history-section">
              <header>
                <h2>
                  <span>Recent Filing History</span>&nbsp;<span class="section-count">({{getHistoryCount}})</span>
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

          <v-col cols="12" md="3" style="position: relative">
            <!-- Custodian of Records -->
            <section v-if="isHistorical && custodians.length > 0">
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-custodians-subtitle">Custodian of Records</h2>
              </header>
              <div class="scrollable-container" style="max-height: 49rem">
                <v-card flat>
                  <CustodianListSm :custodians="custodians" />
                </v-card>
              </div>
            </section>

            <!-- Office Addresses -->
            <section>
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-addresses-subtitle">
                  {{ isFirm ? 'Business Addresses' : 'Office Addresses' }}
                </h2>

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
                    {{dateToPacificDateTime(coaEffectiveDate)}}.
                    No other filings are allowed until then.
                  </v-tooltip>
                </v-scale-transition>

                <v-btn v-if="!isHistorical"
                  text small color="primary"
                  id="standalone-addresses-button"
                  class="change-btn"
                  :disabled="!isAllowed(AllowableActions.ADDRESS_CHANGE)"
                  @click.native.stop="onAddressChangeClick()"
                >
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </header>

              <v-card flat>
                <AddressListSm
                  :showCompleteYourFilingMessage="isAppTask"
                  :showGrayedOut="isAppFiling"
                />
              </v-card>
            </section>

            <!-- Proprietor / Partners -->
            <section v-if="isFirm">
              <header class="aside-header mb-3">
                <h2 v-if="isSoleProp" data-test-id="dashboard-proprietor-subtitle">Proprietor</h2>
                <h2 v-if="isPartnership" data-test-id="dashboard-partners-subtitle">Partners</h2>
                <v-btn text small color="primary"
                  id="change-proprietor-partners-button"
                  class="change-btn"
                  v-if="!isHistorical"
                  :disabled="!isAllowed(AllowableActions.DIRECTOR_CHANGE)"
                  @click.native.stop="goToChangeFiling()"
                >
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </header>

              <div class="scrollable-container" style="max-height: 49rem">
                <v-card flat>
                  <ProprietorPartnersListSm
                    :showCompleteYourFilingMessage="isAppTask"
                    :showGrayedOut="isAppFiling"
                  />
                </v-card>
              </div>
            </section>

            <!-- Current Directors-->
            <section v-else>
              <header class="aside-header mb-3">
                <h2 data-test-id="dashboard-directors-subtitle">Current Directors</h2>
                <v-btn v-if="!isHistorical"
                  text small color="primary"
                  id="standalone-directors-button"
                  class="change-btn"
                  :disabled="!isAllowed(AllowableActions.DIRECTOR_CHANGE)"
                  @click.native.stop="goToStandaloneDirectors()"
                >
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </header>

              <div class="scrollable-container" style="max-height: 49rem">
                <v-card flat>
                  <DirectorListSm
                    :showCompleteYourFilingMessage="isAppTask"
                    :showGrayedOut="isAppFiling"
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
import { mapActions, mapState } from 'pinia'
import { navigate } from '@/utils'
import AddressListSm from '@/components/Dashboard/AddressListSm.vue'
import CustodianListSm from '@/components/Dashboard/CustodianListSm.vue'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import FrozenInformation from '@/components/Dashboard/Alerts/FrozenInformation.vue'
import LegalObligation from '@/components/Dashboard/LegalObligation.vue'
import ProprietorPartnersListSm from '@/components/Dashboard/ProprietorPartnersListSm.vue'
import StaffNotation from '@/components/Dashboard/StaffNotation.vue'
import TodoList from '@/components/Dashboard/TodoList.vue'
import { CoaWarningDialog } from '@/components/dialogs'
import MissingInformation from '@/components/Dashboard/Alerts/MissingInformation.vue'
import NotInCompliance from '@/components/Dashboard/Alerts/NotInCompliance.vue'
import NotInGoodStanding from '@/components/Dashboard/Alerts/NotInGoodStanding.vue'
import { FilingStatus, Routes, AllowableActions, Roles } from '@/enums'
import { PartyIF } from '@/interfaces'
import { AllowableActionsMixin, CommonMixin, DateMixin, EnumMixin } from '@/mixins'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore, useRootStore } from '@/stores'

export default {
  name: 'Dashboard', // eslint-disable-line vue/multi-word-component-names

  mixins: [
    AllowableActionsMixin,
    CommonMixin,
    DateMixin,
    EnumMixin
  ],

  components: {
    AddressListSm,
    CoaWarningDialog,
    CustodianListSm,
    DirectorListSm,
    FilingHistoryList,
    FrozenInformation,
    LegalObligation,
    MissingInformation,
    NotInCompliance,
    NotInGoodStanding,
    ProprietorPartnersListSm,
    StaffNotation,
    TodoList
  },

  data () {
    return {
      todoCount: 0,
      coaWarningDialog: false,

      // enum in template
      AllowableActions
    }
  },

  computed: {
    ...mapState(useBusinessStore,
      [
        'getIdentifier',
        'hasComplianceWarning',
        'hasMissingInfoWarning',
        'isAdminFrozen',
        'isBenBcCccUlc',
        'isFirm',
        'isGoodStanding',
        'isHistorical',
        'isPartnership',
        'isSoleProp'
      ]),

    ...mapState(useConfigurationStore,
      [
        'getEditUrl'
      ]),

    ...mapState(useFilingHistoryListStore,
      [
        'getHistoryCount',
        'getPendingCoa'
      ]),

    ...mapState(useRootStore,
      [
        'getParties',
        'isAppFiling',
        'isAppTask',
        'isRoleStaff'
      ]),

    /** Whether a COA is pending. */
    isCoaPending (): boolean {
      return !!this.getPendingCoa
    },

    /** The COA effective date, if a COA is pending, else null. */
    coaEffectiveDate (): Date {
      return this.getPendingCoa
        ? new Date(this.getPendingCoa.effectiveDate)
        : null
    },

    /** The Business ID string. */
    businessId (): string {
      return sessionStorage.getItem('BUSINESS_ID')
    },

    /**
     * The Filing ID route query parameter. May be NaN (which is falsy).
     * This is sometimes provided on the URL to highlight a filing, for example
     * when returning from saving/filing it.
     */
    filingId (): number {
      // NB: use unary plus operator to cast string to number
      return +this.$route.query.filing_id
    },

    /** Whether to show Missing Information alert. */
    isMissingInformationAlert (): boolean {
      return this.hasMissingInfoWarning
    },

    /** Whether to show Missing Information alert. */
    isFrozenInformationAlert (): boolean {
      return this.isAdminFrozen
    },

    /** Whether to show Not In Compliance alert. */
    isNotInComplianceAlert (): boolean {
      return this.hasComplianceWarning
    },

    /** Whether to show Not In Good Standing alert. */
    isNotInGoodStandingAlert (): boolean {
      return !this.isGoodStanding
    },

    /** The number of alerts. */
    alertCount (): number {
      let count = 0
      if (this.isFrozenInformationAlert) count++
      if (this.isMissingInformationAlert) count++
      if (this.isNotInComplianceAlert) count++
      if (this.isNotInGoodStandingAlert) count++
      return count
    },

    custodians (): PartyIF[] {
      return this.getParties.filter(party => party.roles?.some(role => role.roleType === Roles.CUSTODIAN))
    }
  },

  methods: {
    ...mapActions(useRootStore, ['setCurrentFilingStatus']),

    goToStandaloneDirectors () {
      this.setCurrentFilingStatus(FilingStatus.NEW)
      this.$router.push({ name: Routes.STANDALONE_DIRECTORS, params: { filingId: 0 } }) // 0 means "new COD filing"
    },

    goToChangeFiling () {
      const url = `${this.getEditUrl}${this.getIdentifier}/change`
      navigate(url)
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

    /**
     * If entity is a Firm then navigate to Edit UI.
     * If entity is a BComp then display COA warning.
     * Otherwise proceed to COA.
     */
    onAddressChangeClick () {
      if (this.isFirm) {
        const url = `${this.getEditUrl}${this.getIdentifier}/change`
        navigate(url)
      } else if (this.isBenBcCccUlc) {
        this.toggleCoaWarning()
      } else {
        this.goToStandaloneAddresses()
      }
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
</style>
