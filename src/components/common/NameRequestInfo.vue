<template>
  <div id="name-request-summary">
    <v-row>
      <v-col id="name-request-info" cols="4">
        <ul>
          <li>
            <label>
              <strong>Name Request</strong>
            </label>
          </li>
          <li>Entity Type: {{ entityTypeDescription() }}</li>
          <li>Request Type: {{ requestType() }}</li>
          <li>Expiry Date: {{ formattedExpirationDate() }}</li>
          <li>
            <v-icon v-if="nameRequestDetails.status === NameRequestStates.APPROVED"
              color="green" class="nr-status-icon">mdi-check</v-icon>
            Status: {{ nameRequestDetails.status | capitalize }}
          </li>
          <li id="condition-consent">
            <v-icon v-if="conditionConsent() === RECEIVED_STATE || conditionConsent() === NOT_REQUIRED"
              color="green" class="nr-status-icon">mdi-check</v-icon>
            <v-icon v-if="conditionConsent() === NOT_RECEIVED_STATE" color="red"
              class="nr-status-icon">mdi-close</v-icon>
            Condition/Consent: {{ conditionConsent() }}
          </li>
        </ul>
      </v-col>
      <v-col id="name-request-applicant-info" cols="8">
        <ul>
          <li>
            <label>
              <strong>Name Request Applicant</strong>
            </label>
          </li>
          <li>Name: {{ applicantName() }}</li>
          <li>Address: {{ applicantAddress() }}</li>
          <li>Email: {{ nameRequestApplicant.emailAddress }}</li>
          <li>Phone: {{ nameRequestApplicant.phoneNumber | VMask("(###) ###-####") }}</li>
        </ul>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Mixins, Vue, Prop } from 'vue-property-decorator'
import { getName } from 'country-list'
import { VueMaskFilter } from 'v-mask'

// Enums
import { EntityTypes, NameRequestStates } from '@/enums'

// Interfaces
import { NameRequestIF, NameRequestDetailsIF, NameRequestApplicantIF } from '@/interfaces'

// Mixins
import { CommonMixin, DateMixin, EnumMixin, NamexRequestMixin } from '@/mixins'

@Component({
  filters: { 'VMask': VueMaskFilter }
})
export default class NameRequestInfo extends Mixins(CommonMixin, DateMixin, EnumMixin, NamexRequestMixin) {
  // Template Enums
  readonly NameRequestStates = NameRequestStates
  readonly EntityTypes = EntityTypes
  readonly RECEIVED_STATE = 'Received'
  readonly NOT_RECEIVED_STATE= 'Not Received'
  readonly NOT_REQUIRED = 'Not Required'

  @Prop()
  private nameRequest: any

  private parsedNameRequest: NameRequestIF

  private nameRequestDetails:NameRequestDetailsIF

  private nameRequestApplicant: NameRequestApplicantIF

  private created () {
    if (!this.nameRequest) return // safety check

    this.parsedNameRequest = this.parseNameRequest(this.nameRequest, null)
    this.nameRequestDetails = this.parsedNameRequest.details
    this.nameRequestApplicant = this.parsedNameRequest.applicant
  }

  /** The entity title  */
  private entityTypeDescription (): string {
    return this.entityTypeToName(this.parsedNameRequest.entityType)
  }

  /** The request type */
  private requestType (): string {
    return 'New Business'
  }

  /** Return formatted expiration date */
  private formattedExpirationDate (): string {
    return this.toReadableDate(this.nameRequestDetails.expirationDate)
  }

  /** Return consent received string by checking if conditional and if consent has been received */
  private conditionConsent (): string {
    if (this.nameRequestDetails.status === NameRequestStates.CONDITIONAL) {
      return this.nameRequestDetails.consentFlag === 'R' ? this.RECEIVED_STATE : this.NOT_RECEIVED_STATE
    } else {
      return this.NOT_REQUIRED
    }
  }

  /** Return formatted applicant name */
  private applicantName (): string {
    let name = this.nameRequestApplicant.firstName
    if (this.nameRequestApplicant.middleName) {
      name = `${name} ${this.nameRequestApplicant.middleName} ${this.nameRequestApplicant.lastName}`
    } else {
      name = `${name} ${this.nameRequestApplicant.lastName}`
    }
    return name
  }

  /** Return formatted address string */
  private applicantAddress (): string {
    // Get Address info
    const city = this.nameRequestApplicant.city
    const stateProvince = this.nameRequestApplicant.stateProvinceCode
    const postal = this.nameRequestApplicant.postalCode
    const country = this.nameRequestApplicant.countryTypeCode
      ? getName(this.nameRequestApplicant.countryTypeCode)
      : ''

    // Build address lines
    let address = this.nameRequestApplicant.addressLine1
    if (this.nameRequestApplicant.addressLine2) {
      address = `${address}, ${this.nameRequestApplicant.addressLine2}`
    }
    if (this.nameRequestApplicant.addressLine3) {
      address = `${address}, ${this.nameRequestApplicant.addressLine3}`
    }

    return `${address}, ${city}, ${stateProvince}, ${postal}, ${country}`
  }
}
</script>

<style lang="scss" scoped>
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  #name-request-summary {
    font-size: 0.9rem;
    margin-left: 0.875rem
  }

  .nr-status-icon {
    margin-left:-2rem;
    margin-right:0.2 rem
  }
</style>
