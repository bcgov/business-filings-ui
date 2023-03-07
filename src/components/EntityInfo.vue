<template>
  <div id="entity-info" :class=" { 'staff': isRoleStaff, 'hover': showHoverStyle }">
    <v-container class="pt-0 pb-0">
      <v-row no-gutters class="pt-3 pb-4">
        <v-col class="flex-column d-flex justify-space-between" cols="12" md="9">
          <header>
            <template v-if="!!businessId">
              <!-- First line -->
              <div id="entity-legal-name" aria-label="Entity Legal Name">
                {{ getEntityName || 'Unknown Name' }}
              </div>

              <!-- Second line -->
              <div>
                <span id="business-description">{{ businessDescription }}</span>

                <span id="limited-restoration" class="ml-3" v-if="isInLimitedRestoration">
                  <span class="ml-3">Active until {{ getLimitedreRestorationActiveUntil || 'Unknown' }}</span>
                  <v-chip class="primary mt-n1 ml-3 pointer-events-none font-weight-bold"
                    small label text-color="white">LIMITED RESTORATION</v-chip>
                </span>

                <span id="authorized-to-continue-out" v-if="isAuthorizedToContinueOut">
                  <v-chip class="primary mt-n1 ml-3 pointer-events-none font-weight-bold"
                    small label text-color="white">AUTHORIZED TO CONTINUE OUT</v-chip>
                </span>
              </div>
            </template>

            <template v-if="!!tempRegNumber">
              <!-- First line -->
              <div id="ia-reg-name" aria-label="Incorporation Application or Registration Entity Name">
                {{ getEntityName || 'Unknown Name' }}
              </div>

              <!-- Second line -->
              <div id="ia-reg-description" aria-label="Incorporation Application or Registration Description">
                {{ iaRegDescription }}
              </div>
            </template>
          </header>

          <menu class="mt-4 ml-n4">
            <!-- Staff Comments -->
            <span v-if="!!businessId && isAllowed(AllowableActions.ADD_STAFF_COMMENT)">
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
              <span class="font-14 mx-3">{{getReasonText || 'Unknown Reason'}}</span>
            </span>

            <template v-else>
              <!-- View and Change Company Information -->
              <span v-if="isAllowed(AllowableActions.VIEW_CHANGE_COMPANY_INFO)">
                <v-btn
                  small text color="primary"
                  id="company-information-button"
                  :disabled="hasBlocker"
                  @click="promptChangeCompanyInfo()"
                >
                  <v-icon medium>mdi-file-document-edit-outline</v-icon>
                  <span class="font-13 ml-1">View and Change Business Information</span>
                </v-btn>

                <v-tooltip top content-class="top-tooltip" transition="fade-transition" v-if="isPendingDissolution">
                  <template v-slot:activator="{ on }">
                    <v-icon color="orange darken-2" size="24px" class="pr-2" v-on="on">mdi-alert</v-icon>
                  </template>
                  You cannot view or change business information while the business is pending dissolution.
                </v-tooltip>
              </span>

              <!-- Dissolve Company -->
              <span v-if="isAllowed(AllowableActions.DISSOLVE_COMPANY)">
                <v-tooltip top content-class="top-tooltip" transition="fade-transition">
                <template v-slot:activator="{ on }">
                  <v-btn
                    small text color="primary"
                    id="dissolution-button"
                    :disabled="hasBlocker"
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
            </template>

            <!-- Download Business Summary -->
            <span v-if="isAllowed(AllowableActions.DOWNLOAD_BUSINESS_SUMMARY)">
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
            <span v-if="isAllowed(AllowableActions.VIEW_ADD_DIGITAL_CREDENTIALS)">
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
        </v-col>

        <v-col cols="12" md="3">
          <Tombstone />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import axios from '@/axios-auth'
import { AllowableActions, CorpTypeCd, FilingNames, NigsMessage } from '@/enums'
import { StateFilingIF } from '@/interfaces'
import { AllowableActionsMixin } from '@/mixins'
import { DateUtilities } from '@/services'
import { navigate } from '@/utils'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import Tombstone from './Tombstone.vue'

@Component({
  components: {
    StaffComments,
    Tombstone
  },
  mixins: [
    AllowableActionsMixin
  ]
})
export default class EntityInfo extends Vue {
  @Getter getEditUrl!: string
  @Getter getEntityName!: string
  @Getter getIdentifier!: string
  @Getter getLimitedreRestorationActiveUntil!: string
  @Getter getReasonText!: string
  @Getter getStateFiling!: StateFilingIF
  @Getter isAuthorizedToContinueOut!: boolean
  @Getter isFirm!: boolean
  @Getter isHistorical!: boolean
  @Getter isInLimitedRestoration!: boolean
  @Getter isPendingDissolution!: boolean
  @Getter isRoleStaff!: boolean
  @Getter isSoleProp!: boolean

  // enums for template
  readonly axios = axios
  readonly AllowableActions = AllowableActions

  /** Whether to show the hover style. */
  protected showHoverStyle = false

  /** The Business ID string. */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Temporary Registration Number string. */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** The business description. */
  get businessDescription (): string {
    const corpFullDescription = GetCorpFullDescription(this.getLegalType)
    if (this.isSoleProp && !!this.tempRegNumber) {
      return `${corpFullDescription} / Doing Business As (DBA)`
    } else {
      return corpFullDescription
    }
  }

  /** The incorporation application or registration description. */
  get iaRegDescription (): string {
    const filingName = [CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP].includes(this.getLegalType)
      ? FilingNames.REGISTRATION
      : FilingNames.INCORPORATION_APPLICATION

    return `${this.businessDescription} ${filingName}`
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
   * Otherwise, emits an event to prompt user to confirm voluntary dissolution. */
  protected promptDissolve (): void {
    if (!this.isGoodStanding) {
      this.emitNotInGoodStanding(NigsMessage.DISSOLVE)
      return
    }
    this.emitConfirmDissolution()
  }

  // Pass Download Business Summary event to parent. */
  @Emit('downloadBusinessSummary')
  private emitDownloadBusinessSummary (): void {}

  // Pass Confirm Dissolution event to parent.
  @Emit('confirmDissolution')
  private emitConfirmDissolution (): void {}

  // Pass Not In Good Standing event to parent.
  @Emit('notInGoodStanding')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitNotInGoodStanding (message: NigsMessage): void {}

  // Pass View / Add Digital Credentials event to parent. */
  @Emit('viewAddDigitalCredentials')
  private emitViewAddDigitalCredentials (): void {}
}
</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#entity-info {
  background: $BCgovInputBG;

  &.hover {
    background: $app-bg-lt-blue;
  }

  .v-chip--label {
    font-size: $px-11;
  }

  // ENABLE THIS TO GET STAFF-SPECIFIC BACKGROUND IMAGE
  // &.staff {
  //   background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='100'><text x='0' y='105' font-size='30' transform='rotate(-45 10,40)' opacity='0.1'>STAFF</text></svg>");
  //   background-repeat: repeat-x;
  // }
}

#entity-legal-name,
#ia-reg-name {
  display: inline-block;
  color: $gray9;
  letter-spacing: -0.01rem;
  font-size: 1.375rem;
  font-weight: 700;
  text-transform: uppercase;
}

#business-description,
#limited-restoration,
#ia-reg-description {
  font-size: $px-14;
  color: $gray7;
}

// vertical lines between items:
#limited-restoration,
menu > span + span {
  border-left: 1px solid $gray3;
}

// Disable btn and tooltip overrides
:deep(.v-btn.v-btn--disabled, .v-btn.v-btn--disabled .v-icon) {
  opacity: 0.4 !important;
  color: $app-blue !important;
}

:deep(#staff-comments .v-btn) {
  margin-top: -4px; // for vertical alignment
}

#company-information-button,
#dissolution-button,
#download-summary-button {
  margin-top: -4px; // for vertical alignment
}

:deep(.v-chip__content) {
  letter-spacing: 0.5px;
}
</style>
