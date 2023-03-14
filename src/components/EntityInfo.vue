<template>
  <div id="entity-info" :class=" { 'staff': isRoleStaff, 'hover': showHoverStyle }">
    <v-container class="pt-0 pb-0">
      <v-row no-gutters class="pt-3 pb-4">
        <v-col class="flex-column d-flex justify-space-between" cols="12" md="9">
          <header>
            <!-- Entity Name / IA Title -->
            <div v-if="!!businessId" id="entity-legal-name" aria-label="Business Legal Name">
              <span>{{ getLegalName || 'Unknown Name' }}</span>
            </div>
            <div v-if="!!tempRegNumber" id="incorp-app-title" aria-label="Incorporation Application Title">
              <span>{{ getLegalName || GetCorpNumberedDescription(getLegalType)}}</span>
            </div>

            <!-- Business Description -->
            <div v-if="!!businessId">
              <span id="business-subtitle">{{ businessDescription }}</span>

              <span id="limited-restoration" class="ml-3" v-if="isInLimitedRestoration">
                <span class="ml-3">Active until {{ getLimitedreRestorationActiveUntil || 'Unknown' }}</span>
                <v-chip
                  class="primary mt-n1 ml-3 pointer-events-none font-weight-bold"
                  small label text-color="white"
                >
                  LIMITED RESTORATION
                </v-chip>
              </span>

              <span id="authorized-to-continue-out" v-if="isAuthorizedToContinueOut">
                <v-chip
                  class="primary mt-n1 ml-3 pointer-events-none font-weight-bold"
                  small label text-color="white"
                >
                  AUTHORIZED TO CONTINUE OUT
                </v-chip>
              </span>
            </div>

            <!-- IA/Registration Description -->
            <div v-if="!!tempRegNumber" id="ia-reg-subtitle">{{ iaRegDescription }}</div>
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
                    @click="downloadBusinessSummary()"
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
                    @click="viewAddDigitalCredentials()"
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
          <dl>
            <!-- Registration Date -->
            <template v-if="!!businessId && isFirm">
              <dt class="mr-2">Registration Date:</dt>
              <dd id="entity-business-registration-date">
                {{ this.dateToPacificDate(getFoundingDate, true) || 'Not Available' }}</dd>
            </template>

            <!-- Registration Number -->
            <template v-if="!!businessId && isFirm">
              <dt class="mr-2">Registration Number:</dt>
              <dd id="entity-business-registration-number">{{ getIdentifier || 'Not Available' }}</dd>
            </template>

            <!-- Business Number -->
            <template v-if="!!businessId">
              <dt class="mr-2">Business Number:</dt>
              <dd id="entity-business-number">{{ getBusinessNumber || 'Not Available' }}</dd>
            </template>

            <!-- Incorporation Number -->
            <template v-if="!!businessId && !isFirm">
              <dt class="mr-2">Incorporation Number:</dt>
              <dd id="entity-incorporation-number">{{ getIdentifier || 'Not Available' }}</dd>
            </template>

            <!-- NR Number -->
            <template v-if="nameRequestNumber">
              <dt class="mr-2">Name Request Number:</dt>
              <dd id="nr-number">{{ nameRequestNumber }}</dd>
            </template>

            <!-- Email -->
            <template v-if="!!businessId">
              <dt class="mr-2">Email:</dt>
              <dd id="entity-business-email" class="cursor-pointer" @click="editBusinessProfile()">
                <span>{{businessEmail || 'Not Available'}}</span>
                <v-btn id="change-email-button" small text color="primary">
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </dd>
            </template>

            <!-- Phone -->
            <template v-if="!!businessId">
              <dt class="mr-2">Phone:</dt>
              <dd id="entity-business-phone" class="cursor-pointer" @click="editBusinessProfile()">
                <span>{{fullPhoneNumber || 'Not Available'}}</span>
                <v-btn id="change-phone-button" small text color="primary">
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </dd>
            </template>
          </dl>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'
import { AllowableActionsMixin, CommonMixin, DateMixin, EnumMixin } from '@/mixins'
import { AllowableActions, CorpTypeCd, FilingNames, FilingTypes, NigsMessage } from '@/enums'
import { StateFilingIF } from '@/interfaces'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import axios from '@/axios-auth'
import { navigate } from '@/utils'
import { GetCorpFullDescription, GetCorpNumberedDescription } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: { StaffComments },
  mixins: [
    AllowableActionsMixin,
    CommonMixin,
    DateMixin,
    EnumMixin
  ]
})
export default class EntityInfo extends Vue {
  // FUTURE: change these to getters
  @State ARFilingYear!: string
  @State businessEmail!: string
  @State businessPhone!: string
  @State businessPhoneExtension!: string

  @Getter getEditUrl!: string
  @Getter getBusinessProfileUrl!: string
  @Getter getBusinessNumber!: string
  @Getter getFoundingDate!: Date
  @Getter getLegalName!: string
  @Getter getIdentifier!: number
  @Getter getLimitedreRestorationActiveUntil!: string
  @Getter getNameRequest!: any
  @Getter getReasonText!: string
  @Getter getStateFiling!: StateFilingIF
  @Getter isAdminFreeze!: boolean
  @Getter isAuthorizedToContinueOut!: boolean
  @Getter isFirm!: boolean
  @Getter isHistorical!: boolean
  @Getter isInLimitedRestoration!: boolean
  @Getter isPendingDissolution!: boolean
  @Getter isSoleProp!: boolean

  // enums for template
  readonly axios = axios
  readonly AllowableActions = AllowableActions
  readonly GetCorpNumberedDescription = GetCorpNumberedDescription

  /** Whether to show the hover style. */
  protected showHoverStyle = false

  /** The name request number. */
  get nameRequestNumber (): string {
    return this.getNameRequest?.nrNum
  }

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
    const corpTypeDescription = GetCorpFullDescription(this.getLegalType)
    if (this.isSoleProp && this.tempRegNumber) {
      return `${corpTypeDescription} / Doing Business As (DBA)`
    } else {
      return corpTypeDescription
    }
  }

  /** The incorporation application or registration description. */
  get iaRegDescription (): string {
    const filingName = [CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP].includes(this.getLegalType)
      ? FilingNames.REGISTRATION
      : FilingNames.INCORPORATION_APPLICATION

    return `${this.businessDescription} ${filingName}`
  }

  /** The business phone number and optional extension. */
  get fullPhoneNumber (): string {
    if (this.businessPhone) {
      return `${this.businessPhone}${this.businessPhoneExtension ? (' x' + this.businessPhoneExtension) : ''}`
    }
    return ''
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

  /** Navigates to the Auth UI to update business profile. */
  protected editBusinessProfile (): void {
    navigate(this.getBusinessProfileUrl)
  }

  // Pass prompt downloads business summary event to parent. */
  @Emit('downloadBusinessSummary')
  private downloadBusinessSummary (): void {}

  // Pass confirm dissolution event to parent.
  @Emit('confirmDissolution')
  private emitConfirmDissolution (): void {}

  // Pass not in good standing event to parent.
  @Emit('notInGoodStanding')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitNotInGoodStanding (message: NigsMessage): void {}

  // Pass prompt to view / add digital credentials event to parent. */
  @Emit('viewAddDigitalCredentials')
  private viewAddDigitalCredentials (): void {}
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
#incorp-app-title {
  display: inline-block;
  color: $gray9;
  letter-spacing: -0.01rem;
  font-size: 1.375rem;
  font-weight: 700;
  text-transform: uppercase;
}

#entity-status {
  margin-top: 5px;
  margin-left: 0.5rem;
  vertical-align: top;
}

#business-subtitle,
#limited-restoration,
#ia-reg-subtitle {
  font-size: $px-14;
  color: $gray7;
}

// vertical lines between items:
#limited-restoration,
menu > span + span {
  border-left: 1px solid $gray3;
}

dl {
  font-size: $px-14;
  line-height: 1.5rem;
}

dt {
  color: $gray9;
  font-weight: bold;
  float: left;
  clear: left;
  margin-right: 0.5rem;
}

// hide change buttons when not hovering on value:
dd:not(:hover) > button {
  display: none;
}

#change-email-button,
#change-phone-button {
  height: 1.125rem;
  padding: 0.25rem 0.5rem;
  margin-top: -0.125rem;
  margin-left: 0.125rem;
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
