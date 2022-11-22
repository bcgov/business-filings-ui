<template>
  <div class="name-request-info">
    <v-row no-gutters>
      <v-col cols="6" class="pl-8">
        <ul class="ma-0 pa-0">
          <li>
            <label class="hdr">Name Request</label>
          </li>
          <li class="mt-4">
            <span class="key">Entity Type:</span>
            <span class="val">{{ entityTypeDescription }}</span>
          </li>
          <li>
            <span class="key">Request Type:</span>
            <span class="val">{{ requestType }}</span>
          </li>
          <li>
            <span class="key">Expiry Date:</span>
            <span class="val">{{ formattedExpirationDate }}</span>
          </li>
          <li id="status">
            <v-icon v-if="nameRequestDetails.status === NameRequestStates.APPROVED ||
                          nameRequestDetails.status === NameRequestStates.CONDITIONAL"
              color="green" class="nr-status-icon">mdi-check</v-icon>
            <span class="key">Status:</span>
            <span class="val">{{ formattedStatus }}</span>
          </li>
          <li id="condition-consent">
            <v-icon v-if="conditionConsent === NOT_REQUIRED_STATE ||
                          conditionConsent === RECEIVED_STATE ||
                          conditionConsent === WAIVED_STATE"
              color="green" class="nr-status-icon">mdi-check</v-icon>
            <v-icon v-if="conditionConsent === NOT_RECEIVED_STATE" color="red"
              class="nr-status-icon">mdi-close</v-icon>
            <span class="key">Condition/Consent:</span>
            <span class="val">{{ conditionConsent }}</span>
          </li>
        </ul>
      </v-col>

      <v-col id="name-request-applicant-info" cols="6">
        <ul>
          <li>
            <label class="hdr">Name Request Applicant</label>
          </li>
          <li class="mt-4">
            <span class="key">Name:</span>
            <span class="val">{{ applicantName }}</span>
          </li>
          <li>
            <span class="key">Address:</span>
            <span class="val">{{ applicantAddress }}</span>
          </li>
          <li>
            <span class="key">Email:</span>
            <span class="val">{{ nameRequestApplicant.emailAddress }}</span>
          </li>
          <li>
            <span class="key">Phone:</span>
            <span class="val">{{ formattedPhoneNumber }}</span>
          </li>
        </ul>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { getName } from 'country-list'
import { capitalize, formatPhoneNumber } from '@/utils'
import { NameRequestStates } from '@/enums'
import { NameRequestIF, NameRequestDetailsIF, NameRequestApplicantIF } from '@/interfaces'
import { DateMixin, EnumMixin, NameRequestMixin } from '@/mixins'

@Component({
  mixins: [
    DateMixin,
    EnumMixin,
    NameRequestMixin
  ]
})
export default class NameRequestInfo extends Vue {
  @Prop() readonly nameRequest!: any

  @Getter isSoleProp!: boolean

  // For template
  readonly NameRequestStates = NameRequestStates
  readonly capitalize = capitalize

  // Constants
  readonly RECEIVED_STATE = 'Received'
  readonly NOT_RECEIVED_STATE= 'Not Received'
  readonly NOT_REQUIRED_STATE = 'Not Required'
  readonly WAIVED_STATE = 'Waived'

  private parsedNameRequest: NameRequestIF
  private nameRequestDetails: NameRequestDetailsIF
  private nameRequestApplicant: NameRequestApplicantIF

  /** Called when component is created. */
  protected created (): void {
    if (!this.nameRequest) return // safety check

    this.parsedNameRequest = this.parseNameRequest(this.nameRequest, null)
    this.nameRequestDetails = this.parsedNameRequest.details
    this.nameRequestApplicant = this.parsedNameRequest.applicant
  }

  /** The entity title  */
  get entityTypeDescription (): string {
    const corpTypeDescription = this.getCorpTypeDescription(this.parsedNameRequest.entityType)
    if (this.isSoleProp) {
      return `${corpTypeDescription} or Doing Business As (DBA)`
    }
    return corpTypeDescription
  }

  /** The request type */
  get requestType (): string {
    return 'New Business'
  }

  /** The formatted expiration date */
  get formattedExpirationDate (): string {
    return this.apiToPacificDateTime(this.nameRequestDetails.expirationDate, true)
  }

  /** The formatted status */
  get formattedStatus (): string {
    return capitalize(this.nameRequestDetails.status)
  }

  /** The condition/consent string */
  get conditionConsent (): string {
    if (this.nameRequestDetails.status === NameRequestStates.APPROVED) {
      return this.NOT_REQUIRED_STATE
    }
    if (this.nameRequestDetails.consentFlag === null) {
      return this.NOT_REQUIRED_STATE
    }
    if (this.nameRequestDetails.consentFlag === 'R') {
      return this.RECEIVED_STATE
    }
    if (this.nameRequestDetails.consentFlag === 'N') {
      return this.WAIVED_STATE
    }
    return this.NOT_RECEIVED_STATE
  }

  /** The formatted applicant name */
  get applicantName (): string {
    let name = this.nameRequestApplicant.firstName
    if (this.nameRequestApplicant.middleName) {
      name = `${name} ${this.nameRequestApplicant.middleName} ${this.nameRequestApplicant.lastName}`
    } else {
      name = `${name} ${this.nameRequestApplicant.lastName}`
    }
    return name
  }

  /** The formatted address string */
  get applicantAddress (): string {
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

  /** The formatted phone number */
  get formattedPhoneNumber (): string {
    return formatPhoneNumber(this.nameRequestApplicant.phoneNumber)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

ul {
  list-style-type: none;

  .hdr {
    font-size: $px-16;
    font-weight: bold;
    color: $gray9;
  }

  .key {
    font-size: $px-15;
    font-weight: bold;
    color: $gray9;
  }

  .val {
    padding-left: 4px;
    font-size: $px-15;
    color: $gray7;
  }
}

.nr-status-icon {
  margin-left: -28px;
  margin-right: 4px;
}
</style>
