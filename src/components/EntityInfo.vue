<template>
  <div id="entity-info" :class="{ 'staff': isRoleStaff }">
    <v-container class="py-2 pb-6">
      <v-breadcrumbs :items="breadcrumbs" divider=">" class="pa-0">
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

      <!-- Entity Name, Entity Status -->
      <div class="d-flex justify-space-between mt-5">
        <div class="left-column align-self-end">
          <div class="title-container">
            <div v-if="businessId" class="mb-1" id="entity-legal-name" aria-label="Business Legal Name">
              <span>{{ entityName || 'Unknown Name' }}</span>
            </div>
            <div v-if="tempRegNumber" class="mb-1" id="incorp-app-title" aria-label="Incorporation Application Title">
              <span>{{ entityName || entityTypeToNumberedDescription(entityType)}}</span>
            </div>

            <v-chip v-if="isGoodStanding" class="blue" id="entity-status" small label text-color="white">
              <span>In Good Standing</span>
            </v-chip>
            <v-chip v-else-if="isPendingDissolution" class="red" id="entity-status" small label text-color="white">
              <span>Pending Dissolution</span>
            </v-chip>
            <v-chip v-else-if="isNotInCompliance" class="red" id="entity-status" small label text-color="white">
              <span>Not in Compliance</span>
            </v-chip>
          </div>

          <!-- Business Number, Incorporation Number -->
          <template v-if="businessId">
            <dl class="business-info">
              <!-- FUTURE?
              <dt class="sr-only mr-2">Description:</dt>
              <dd id="entity-business-number">{{ entityDescription || 'Not Available' }}</dd>
              -->
              <dt class="mr-2">Business No:</dt>
              <dd id="entity-business-number">{{ entityBusinessNo || 'Not Available' }}</dd>
              <dt class="mr-2">Incorporation No:</dt>
              <dd id="entity-incorporation-number">{{ entityIncNo || 'Not Available' }}</dd>
            </dl>
          </template>

          <!-- NR Subtitle, NR Number -->
          <template v-if="tempRegNumber">
            <dl class="nr-info">
              <dt><span class="sr-only mr-2">Sub Title:</span></dt>
              <dd id="nr-subtitle">{{ nrSubtitle }}</dd>
              <template v-if="nrNumber">
                <dt class="mr-2">Name Request No:</dt>
                <dd id="nr-number">{{ nrNumber }}</dd>
              </template>
            </dl>
          </template>
        </div>

        <div class="right-column text-right align-self-end">
          <template v-if="businessId">
            <!-- if LTD or ULC, show new menu -->
            <div v-if="isLtdOrUlc">
              <v-btn small text color="primary" id="company-information-button" @click="viewChangeCompanyInfo()">
                <v-icon small>mdi-pencil</v-icon>
                <span>View and Change Company Information</span>
              </v-btn>

              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <!-- FUTURE? -> remove disabled prop -->
                  <v-btn id="menu-down-button" small icon color="primary" v-on="on" disabled>
                    <v-icon small>mdi-menu-down</v-icon>
                  </v-btn>
                </template>

                <v-list class="pt-0 pb-0">
                  <v-list-item id="business-summary-menuitem" @click="downloadBusinessSummary()">
                    <v-icon>mdi-download</v-icon>
                    <v-list-item-title class="pl-1">Download Business Summary</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <!-- Business Email, Phone -->
            <dl class="profile-info">
              <dt><span class="sr-only mr-2">Business Email:</span></dt>
              <dd id="entity-business-email">{{businessEmail || 'Unknown Email'}}</dd>
              <template v-if="fullPhoneNumber">
                <dt><span class="sr-only mr-2">Business Phone:</span></dt>
                <dd id="entity-business-phone">{{fullPhoneNumber}}</dd>
              </template>
            </dl>

            <!-- if not LTD or ULC, show old menu -->
            <v-menu v-if="!isLtdOrUlc" bottom left offset-y>
              <template v-slot:activator="{ on }">
                <v-btn id="entity-settings-button" small icon color="primary" v-on="on" class="mt-n4 ml-1">
                  <v-icon small>mdi-cog</v-icon>
                </v-btn>
              </template>

              <v-list class="pt-0 pb-0">
                <v-list-item id="update-business-profile-menuitem" @click="editBusinessProfile()">
                  <v-list-item-title>Update business profile</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </div>
      </div>
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

@Component({
  computed: {
    // Property definitions for runtime environment.
    ...mapState(['ARFilingYear', 'entityName', 'entityType', 'entityStatus', 'entityBusinessNo', 'entityIncNo',
      'businessEmail', 'businessPhone', 'businessPhoneExtension']),
    ...mapGetters(['isRoleStaff', 'nrNumber', 'isLtd', 'isUlc'])
  }
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

  /** True if current company is LTD or ULC. */
  private get isLtdOrUlc (): boolean {
    // return (this.isLtd || this.isUlc)
    // return getFeatureFlag('alteration-ui-enabled')
    // FOR NOW, FOR TESTING, LOOK FOR A SESSION STORAGE ITEM
    return Boolean(sessionStorage.getItem('SHOW_COMPANY_INFO_BUTTON'))
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

  /** The NR Subtitle string. */
  private get nrSubtitle (): string {
    switch (this.entityStatus) {
      case EntityStatus.NAME_REQUEST:
        return `${this.entityTypeToDescription(this.entityType)} Name Request`
      case EntityStatus.DRAFT_INCORP_APP:
      case EntityStatus.FILED_INCORP_APP:
        return `${this.entityTypeToDescription(this.entityType)} Incorporation Application`
    }
    return '' // should never happen
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

// ENABLE THIS TO GET STAFF-SPECIFIC BACKGROUND IMAGE
// #entity-info.staff {
//   background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='100'><text x='0' y='105' font-size='30' transform='rotate(-45 10,40)' opacity='0.1'>STAFF</text></svg>");
//   background-repeat: repeat-x;
// }

#entity-legal-name,
#incorp-app-title {
  display: inline-block;
  color: $gray9;
  letter-spacing: -0.01rem;
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
}

#entity-status {
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  vertical-align: top;
}

dl {
  display: inline-block;
  overflow: hidden;
  color: $gray6;
}

dd, dt {
  float: left;
}

dt {
  position: relative;
}

dd + dt:before {
  content: "•";
  display: inline-block;
  margin-right: 0.75rem;
  margin-left: 0.75rem;
}

#company-information-button {
  border-right: 1px solid $gray1;
}
</style>
