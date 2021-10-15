<template>
  <div id="entity-info" :class="{ 'staff': isRoleStaff, 'hover': showHoverStyle }">
    <v-container class="pt-0 pb-0">
      <v-breadcrumbs :items="breadcrumbs" divider=">" class="mt-1 pa-0">
        <v-breadcrumbs-item
          slot="item"
          slot-scope="{ item }"
          exact
          :to="item.to"
          :href="item.href"
        >
          {{ item.text }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>

      <v-row no-gutters class="pt-3 pb-4">
        <v-col cols="12" md="9">
          <header>
            <!-- Entity Name / IA Title -->
            <div v-if="businessId" id="entity-legal-name" aria-label="Business Legal Name">
              <span>{{ getEntityName || 'Unknown Name' }}</span>
            </div>
            <div v-if="tempRegNumber" id="incorp-app-title" aria-label="Incorporation Application Title">
              <span>{{ getEntityName || getCorpTypeNumberedDescription(getEntityType)}}</span>
            </div>

            <!-- Entity Type -->
            <div v-if="entityDescription" id="entity-description">{{ entityDescription }}</div>
            <div v-if="nrDescription" id="nr-subtitle">{{ nrDescription }}</div>
          </header>

          <menu class="mt-4 ml-n3">
            <!-- Staff Comments -->
            <span v-if="businessId && isRoleStaff">
              <StaffComments
                :axios="axios"
                :businessId="businessId"
                :maxLength="2000"
              />
            </span>

            <!-- View and Change Company Information -->
            <span v-if="showViewChangeInfoBtn">
              <v-btn
                small text color="primary"
                id="company-information-button"
                :disabled="hasBlocker || !isInGoodStanding"
                @click="viewChangeCompanyInfo()"
                @mouseenter="showHoverStyle = true"
                @mouseleave="showHoverStyle = false"
              >
                <v-icon medium>mdi-file-document-edit-outline</v-icon>
                <span>View and Change Company Information</span>
              </v-btn>

              <v-tooltip top content-class="pending-tooltip" v-if="isPendingDissolution || isNotInCompliance">
                <template v-slot:activator="{ on }">
                  <span class="pending-alert" v-on="on">
                    <v-icon color="orange darken-2">mdi-alert</v-icon>
                  </span>
                </template>
                <template v-if="isPendingDissolution">
                  You cannot view or change company information while the company is pending dissolution.
                </template>
                <template v-if="isNotInCompliance">
                  You cannot view or change company information while the company is not in compliance.
                </template>
              </v-tooltip>
            </span>

            <!-- Download Summary -->
            <span v-if="showDownloadSummaryBtn">
              <v-btn
                small text color="primary"
                id="download-summary-button"
                @click="downloadBusinessSummary()"
              >
                <v-icon medium>mdi-file-pdf-outline</v-icon>
                <span>Download Summary</span>
              </v-btn>
            </span>
          </menu>
        </v-col>

        <v-col cols="12" md="3">
          <dl>
            <!-- Business Number -->
            <template v-if="businessId">
              <dt class="mr-2">Business Number:</dt>
              <dd id="entity-business-number">{{ entityBusinessNo || 'Not Available' }}</dd>
            </template>

            <!-- Incorporation Number -->
            <template v-if="businessId">
              <dt class="mr-2">Incorporation Number:</dt>
              <dd id="entity-incorporation-number">{{ getEntityIncNo || 'Not Available' }}</dd>
            </template>

            <!-- NR Number -->
            <template v-if="getNrNumber">
              <dt class="mr-2">Name Request Number:</dt>
              <dd id="nr-number">{{ getNrNumber }}</dd>
            </template>

            <!-- Email -->
            <template v-if="businessId">
              <dt class="mr-2">Email:</dt>
              <dd id="entity-business-email" @click="editBusinessProfile()">
                <span>{{businessEmail || 'Not Available'}}</span>
                <v-btn small text color="primary" id="change-email-button">
                  <v-icon small>mdi-pencil</v-icon>
                  <span>Change</span>
                </v-btn>
              </dd>
            </template>

            <!-- Phone -->
            <template v-if="businessId">
              <dt class="mr-2">Phone:</dt>
              <dd id="entity-business-phone" @click="editBusinessProfile()">
                <span>{{fullPhoneNumber || 'Not Available'}}</span>
                <v-btn small text color="primary" id="change-phone-button">
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
import { Component, Mixins } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'
import { getFeatureFlag } from '@/utils'
import { CommonMixin, EnumMixin } from '@/mixins'
import { EntityStatus, CorpTypeCd, Routes } from '@/enums'
import { BreadcrumbIF } from '@/interfaces'
import { StaffComments } from '@bcrs-shared-components/staff-comments'
import axios from '@/axios-auth'

@Component({
  components: { StaffComments }
})
export default class EntityInfo extends Mixins(CommonMixin, EnumMixin) {
  @State ARFilingYear!: string
  @State entityStatus!: EntityStatus
  @State entityBusinessNo!: string
  @State businessEmail!: string
  @State businessPhone!: string
  @State businessPhoneExtension!: string

  @Getter getEntityType!: CorpTypeCd
  @Getter getEntityIncNo!: number
  @Getter getEntityName!: string
  @Getter isRoleStaff!: boolean
  @Getter isBComp!: boolean
  @Getter isBcCompany!: boolean
  @Getter isUlc!: boolean
  @Getter getNrNumber!: string
  @Getter hasBlocker!: boolean
  @Getter isInGoodStanding!: boolean
  @Getter isPendingDissolution!: boolean
  @Getter isNotInCompliance!: boolean

  readonly axios = axios // for template

  /** Whether to show the hover style. */
  private showHoverStyle = false

  /** True if View and Change Company Info button should be rendered. */
  private get showViewChangeInfoBtn (): boolean {
    return (this.isBComp || this.isBcCompany || this.isUlc)
  }

  /** True if Download Summary button should be rendered. */
  private get showDownloadSummaryBtn (): boolean {
    return getFeatureFlag('download-summary-enabled')
  }

  /** The Business ID string. */
  private get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Edit URL string. */
  private get editUrl (): string {
    return sessionStorage.getItem('EDIT_URL')
  }

  /** The Business Profile URL string. */
  private get businessProfileUrl (): string {
    return sessionStorage.getItem('AUTH_WEB_URL') + 'businessprofile'
  }

  /** The Incorporation Application's Temporary Registration Number string. */
  private get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** The Manage Businesses URL string. */
  private get manageBusinessesUrl (): string {
    return sessionStorage.getItem('AUTH_WEB_URL') + 'business'
  }

  /** The entity description. */
  private get entityDescription (): string {
    return this.getCorpTypeDescription(this.getEntityType)
  }

  /** The NR description. */
  private get nrDescription (): string {
    return this.entityStatusToDescription(this.entityStatus, this.getEntityType)
  }

  /** The business phone number and optional extension. */
  private get fullPhoneNumber (): string {
    if (this.businessPhone) {
      return `${this.businessPhone}${this.businessPhoneExtension ? (' x' + this.businessPhoneExtension) : ''}`
    }
    return ''
  }

  /** Redirects the user to the Edit UI to view or change their company information. */
  private viewChangeCompanyInfo (): void {
    const url = `${this.editUrl}${this.getEntityIncNo}/alteration`
    window.location.assign(url) // assume URL is always reachable
  }

  /** Redirects the user to the Auth UI to update their business profile. */
  private editBusinessProfile (): void {
    window.location.assign(this.businessProfileUrl) // assume URL is always reachable
  }

  /** Downloads business summary PDF. */
  private downloadBusinessSummary (): void {
    // FUTURE
  }

  /** The route breadcrumbs list. */
  private get breadcrumbs (): Array<BreadcrumbIF> {
    const breadcrumbs = this.$route?.meta?.breadcrumb

    // Apply the filing year to the breadcrumb trail for Annual Reports
    const ArCrumb = breadcrumbs?.find(item => item.to.name === Routes.ANNUAL_REPORT)
    if (ArCrumb) ArCrumb.text = `File ${this.ARFilingYear} Annual Report`

    return [
      {
        text: 'Manage Businesses Dashboard',
        disabled: false,
        href: this.manageBusinessesUrl
      },
      {
        text: this.getEntityName || this.getCorpTypeNumberedDescription(this.getEntityType),
        disabled: false,
        exact: true,
        to: { name: Routes.DASHBOARD }
      },
      ...(breadcrumbs || [])
    ]
  }
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

  // ENABLE THIS TO GET STAFF-SPECIFIC BACKGROUND IMAGE
  // &.staff {
  //   background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='100'><text x='0' y='105' font-size='30' transform='rotate(-45 10,40)' opacity='0.1'>STAFF</text></svg>");
  //   background-repeat: repeat-x;
  // }
}

.v-breadcrumbs li {
  font-size: 0.75rem;
}

::v-deep {
  .v-breadcrumbs a {
    color: $gray8 !important;
  }

  .v-breadcrumbs a:hover {
    color: $BCgovABlue3 !important;
  }
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

#entity-description,
#nr-subtitle {
  font-size: 0.875rem;
  color: $gray9;
}

// vertical lines between buttons:
menu > span + span {
  border-left: 1px solid $gray3;
  border-radius: 0;
}

dl {
  font-size: 0.875rem;
  line-height: 1.5rem;
}

dt {
  color: $gray9;
  font-weight: bold;
  float: left;
  clear: left;
  margin-right: 0.5rem;
}

dd {
  cursor: pointer;
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

.pending-tooltip {
  max-width: 16rem;
}

.pending-alert .v-icon {
  font-size: 18px; // same as other v-icons
  padding-left: 0.875rem;
}
</style>
