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
              <span>{{ entityName || 'Unknown Name' }}</span>
            </div>
            <div v-if="tempRegNumber" id="incorp-app-title" aria-label="Incorporation Application Title">
              <span>{{ entityName || entityTypeToNumberedDescription(entityType)}}</span>
            </div>

            <!-- Entity Status -->
            <v-chip v-if="isGoodStanding" class="blue" id="entity-status" small label text-color="white">
              <span>In Good Standing</span>
            </v-chip>
            <v-chip v-else-if="isPendingDissolution" class="red" id="entity-status" small label text-color="white">
              <span>Pending Dissolution</span>
            </v-chip>
            <v-chip v-else-if="isNotInCompliance" class="red" id="entity-status" small label text-color="white">
              <span>Not in Compliance</span>
            </v-chip>

            <!-- Entity Type -->
            <div v-if="entityDescription" id="entity-description">{{ entityDescription }}</div>
            <div v-if="nrDescription" id="nr-subtitle">{{ nrDescription }}</div>
          </header>

          <menu class="mt-4 ml-n3">
            <!-- Staff Comments -->
            <span v-if="businessId && isRoleStaff">
              <staff-comments
                :axios="axios"
                :businessId="businessId"
                :maxLength="2000"
              />
            </span>

            <!-- View and Change Company Information -->
            <span v-if="viewChangeInfoEnabled">
              <v-btn
                small text color="primary"
                id="company-information-button"
                @click="viewChangeCompanyInfo()"
                @mouseenter="showHoverStyle = true"
                @mouseleave="showHoverStyle = false"
              >
                <v-icon medium>mdi-file-document-edit-outline</v-icon>
                <span>View and Change Company Information</span>
              </v-btn>
            </span>

            <!-- Download Summary -->
            <span v-if="downloadSummaryEnabled">
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
              <dd id="entity-incorporation-number">{{ entityIncNo || 'Not Available' }}</dd>
            </template>

            <!-- NR Number -->
            <template v-if="nrNumber">
              <dt class="mr-2">Name Request Number:</dt>
              <dd id="nr-number">{{ nrNumber }}</dd>
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
import { mapGetters, mapState } from 'vuex'
import { getFeatureFlag } from '@/utils'
import { CommonMixin, EnumMixin } from '@/mixins'
import { EntityStatus, EntityTypes, Routes } from '@/enums'
import { BreadcrumbIF } from '@/interfaces'
import { StaffComments } from '@/components/common'
import axios from '@/axios-auth'

@Component({
  computed: {
    // Property definitions for runtime environment.
    ...mapState(['ARFilingYear', 'entityName', 'entityType', 'entityStatus', 'entityBusinessNo',
      'entityIncNo', 'businessEmail', 'businessPhone', 'businessPhoneExtension']),
    ...mapGetters(['isRoleStaff', 'nrNumber', 'isLtd', 'isUlc'])
  },
  components: { StaffComments }
})
export default class EntityInfo extends Mixins(CommonMixin, EnumMixin) {
  // Local definitions of computed properties for static type checking.
  // Use non-null assertion operator to allow use before assignment.
  readonly entityName!: string
  readonly ARFilingYear!: string
  readonly entityType!: EntityTypes
  readonly entityStatus!: EntityStatus
  readonly entityBusinessNo!: string
  readonly entityIncNo!: number
  readonly businessEmail!: string
  readonly businessPhone!: string
  readonly businessPhoneExtension!: string
  readonly isRoleStaff!: boolean
  readonly isLtd!: boolean
  readonly isUlc!: boolean
  readonly nrNumber!: string

  readonly axios = axios // for template

  /** Whether to show the hover style. */
  private showHoverStyle = false

  /** True if View and Change Company Info button should be rendered. */
  private get viewChangeInfoEnabled (): boolean {
    return (this.isLtd || this.isUlc) && getFeatureFlag('alteration-ui-enabled')
  }

  /** True if Download Summary button should be rendered. */
  private get downloadSummaryEnabled (): boolean {
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
    return sessionStorage.getItem('AUTH_URL') + 'businessprofile'
  }

  /** The Incorporation Application's Temporary Registration Number string. */
  private get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** The Manage Businesses URL string. */
  private get manageBusinessesUrl (): string {
    return sessionStorage.getItem('AUTH_URL') + 'business'
  }

  /** The entity description. */
  private get entityDescription (): string {
    return this.entityTypeToDescription(this.entityType)
  }

  /** The NR description. */
  private get nrDescription (): string {
    return this.entityStatusToDescription(this.entityStatus, this.entityType)
  }

  /** The business phone number and optional extension. */
  private get fullPhoneNumber (): string {
    if (this.businessPhone) {
      return `${this.businessPhone}${this.businessPhoneExtension ? (' x' + this.businessPhoneExtension) : ''}`
    }
    return ''
  }

  /** True if the entity has the subject status. */
  private get isGoodStanding (): boolean {
    return (this.entityStatus === EntityStatus.GOOD_STANDING)
  }

  /** True if the entity has the subject status. */
  private get isPendingDissolution (): boolean {
    return (this.entityStatus === EntityStatus.PENDING_DISSOLUTION)
  }

  /** True if the entity has the subject status. */
  private get isNotInCompliance (): boolean {
    return (this.entityStatus === EntityStatus.NOT_IN_COMPLIANCE)
  }

  /** Redirects the user to the Edit UI to view or change their company information. */
  private viewChangeCompanyInfo (): void {
    const url = `${this.editUrl}${this.entityIncNo}/alteration`
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
        text: this.entityName || this.entityTypeToNumberedDescription(this.entityType),
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
  // margin-left: 0;
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
</style>
