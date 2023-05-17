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

    <!-- Dissolve Business -->
    <span v-if="isBusiness && !isHistorical">
      <v-tooltip top content-class="top-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-btn
            small text color="primary"
            id="dissolution-button"
            :disabled="!isAllowed(AllowableActions.VOLUNTARY_DISSOLUTION)"
            @click="promptDissolve()"
            v-on="on"
          >
            <img src="@/assets/images/Dissolution_Header_Icon.svg" alt="" class="pa-1">
            <span class="font-13 ml-1">Dissolve this Business</span>
          </v-btn>
        </template>
        Dissolving the business will make this business historical
        and it will be struck from the corporate registry.
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
  @Getter(useBusinessStore) isFirm!: boolean
  @Getter(useBusinessStore) isGoodStanding!: boolean
  @Getter(useBusinessStore) isHistorical!: boolean
  @Getter(useRootStore) isPendingDissolution!: boolean

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
  protected promptChangeCompanyInfo (): void {
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
  protected promptDissolve (): void {
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
  private emitDownloadBusinessSummary (): void {}

  /** Emits an event to indicate business is not in good standing. */
  @Emit('notInGoodStanding')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitNotInGoodStanding (message: NigsMessage): void {}

  /** Emits an event to view / add digital credentials. */
  @Emit('viewAddDigitalCredentials')
  private emitViewAddDigitalCredentials (): void {}
}
</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
</style>
