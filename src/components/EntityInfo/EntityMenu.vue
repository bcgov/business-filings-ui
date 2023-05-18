<template>
  <menu id="entity-menu">
    <!-- Staff Comments -->
    <span v-if="isAllowed(AllowableActions.STAFF_COMMENT)">
      <StaffComments
        :axios="axios"
        :businessId="businessId"
        :maxLength="2000"
      />
    </span>

    <span v-if="isHistorical">
      <v-chip
        id="historical-chip"
        class="primary mt-n1 ml-4 pointer-events-none" small label text-color="white"
      >
        <strong>HISTORICAL</strong>
      </v-chip>
      <span class="font-14 mx-3">{{ getReasonText || 'Unknown Reason' }}</span>
    </span>

    <!-- View and Change Business Information -->
    <span v-if="isBusiness && !isHistorical">
      <v-btn
        small text color="primary"
        id="company-information-button"
        :disabled="!isAllowed(AllowableActions.BUSINESS_INFORMATION)"
        @click="promptChangeCompanyInfo()"
      >
        <v-icon medium>mdi-file-document-edit-outline</v-icon>
        <span class="font-13 ml-1">View and Change Business Information</span>
      </v-btn>

      <v-tooltip v-if="isPendingDissolution" top content-class="top-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-icon color="orange darken-2" size="24px" class="pr-2" v-on="on">mdi-alert</v-icon>
        </template>
        You cannot view or change business information while the business is pending dissolution.
      </v-tooltip>
    </span>

    <!-- Download Business Summary -->
    <span v-if="isAllowed(AllowableActions.BUSINESS_SUMMARY)">
      <v-tooltip top content-class="top-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-btn
            small text color="primary"
            id="download-summary-button"
            @click="emitDownloadBusinessSummary()"
            v-on="on"
          >
            <img src="@/assets/images/business_summary_icon.svg" alt="" class="pa-1">
            <span class="font-13 ml-1">Business Summary</span>
          </v-btn>
        </template>
        View and download a summary of information about the business.
      </v-tooltip>
    </span>

    <!-- View/Add Digital Credentials -->
    <span v-if="isAllowed(AllowableActions.DIGITAL_CREDENTIALS)">
      <v-tooltip top content-class="top-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-btn
            small text color="primary"
            id="view-add-digital-credentials-button"
            @click="emitViewAddDigitalCredentials()"
            v-on="on"
          >
            <v-icon medium>mdi-file-certificate-outline</v-icon>
            <span class="font-13 ml-1">Business Digital Credentials</span>
          </v-btn>
        </template>
        Manage the digital credentials generated for the business.
      </v-tooltip>
    </span>

    <!-- More Actions -->
    <span v-if="isBusiness && !isHistorical">
      <v-menu offset-y transition="slide-y-transition" v-model="expand">
        <template v-slot:activator="{ on }">
          <v-btn text color="primary" class="menu-btn pr-3" v-on="on">
            <v-icon v-if="expand">mdi-menu-up</v-icon>
            <v-icon v-else>mdi-menu-down</v-icon>
            <span>More Actions</span>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item-group color="primary">
            <!-- Dissolve Business -->
            <v-tooltip right content-class="right-tooltip">
              <template v-slot:activator="{ on }">
                <v-list-item
                  id="dissolution-list-item"
                  v-on="on"
                  @click="promptDissolve()"
                  :disabled="!isAllowed(AllowableActions.VOLUNTARY_DISSOLUTION)"
                >
                  <v-list-item-title>
                    <span class="app-blue">Dissolve this Business</span>
                  </v-list-item-title>
                </v-list-item>
              </template>
              Dissolving the business will make this business historical
              and it will be struck from the corporate registry.
            </v-tooltip>

            <!-- Consent to Continue Out -->
            <v-tooltip right content-class="right-tooltip">
              <template v-slot:activator="{ on }">
                <v-list-item
                  v-if="isBenBcCccUlc"
                  id="cco-list-item"
                  v-on="on"
                  @click="goToConsentContinuationOutFiling()"
                  :disabled="!isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)"
                >
                  <v-list-item-title>
                    <span class="app-blue">Consent to Continue Out</span>
                  </v-list-item-title>
                </v-list-item>
              </template>
              Submit a Consent to Continue Out of the province of B.C.
            </v-tooltip>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </span>
  </menu>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import axios from '@/axios-auth'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import { AllowableActions, NigsMessage } from '@/enums'
import { AllowableActionsMixin } from '@/mixins'
import { navigate } from '@/utils'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'

@Component({
  components: { StaffComments },
  mixins: [AllowableActionsMixin]
})
export default class EntityMenu extends Vue {
  @Prop({ required: true }) readonly businessId!: string // may be null

  @Getter(useConfigurationStore) getEditUrl!: string
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useRootStore) getReasonText!: string
  @Getter(useBusinessStore) isBenBcCccUlc!: boolean
  @Getter(useBusinessStore) isCoop!: boolean
  @Getter(useBusinessStore) isFirm!: boolean
  @Getter(useBusinessStore) isGoodStanding!: boolean
  @Getter(useBusinessStore) isHistorical!: boolean
  @Getter(useRootStore) isPendingDissolution!: boolean

  expand = false

  // enums for template
  readonly axios = axios
  readonly AllowableActions = AllowableActions

  /** Whether this entity is a business (and not a draft IA/Registration). */
  get isBusiness (): boolean {
    return !!this.businessId
  }

  /**
   * Emits an event to display NIGS dialog if company is not in good standing.
   * Otherwise, navigates to the Edit UI to view or change company information.
   */
  promptChangeCompanyInfo (): void {
    if (!this.isGoodStanding) {
      this.emitNotInGoodStanding(NigsMessage.CHANGE_COMPANY_INFO)
    } else {
      let url = `${this.getEditUrl}${this.getIdentifier}`
      // Append appropriate route based on entity type
      if (this.isFirm) {
        url += '/change'
      } else if (this.isCoop) {
        url += '/special-resolution'
      } else {
        url += '/alteration'
      }
      navigate(url)
    }
  }

  /**
   * Emits an event to display NIGS dialog if company is not in good standing.
   * Otherwise, emits an event to prompt user to confirm voluntary dissolution.
   */
  promptDissolve (): void {
    if (!this.isGoodStanding) {
      this.emitNotInGoodStanding(NigsMessage.DISSOLVE)
      return
    }
    this.emitConfirmDissolution()
  }

  /** Emits an event to confirm dissolution. */
  @Emit('confirmDissolution')
  private emitConfirmDissolution (): void {}

  /** Emits an event to download the business summary. */
  @Emit('downloadBusinessSummary')
  emitDownloadBusinessSummary (): void {}

  /** Emits an event to indicate business is not in good standing. */
  @Emit('notInGoodStanding')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitNotInGoodStanding (message: NigsMessage): void {}

  /** Emits an event to view / add digital credentials. */
  @Emit('viewAddDigitalCredentials')
  emitViewAddDigitalCredentials (): void {}
}
</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
</style>
