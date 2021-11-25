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
            <span class="val">{{ entityTypeDescription() }}</span>
          </li>
          <li>
            <span class="key">Request Type:</span>
            <span class="val">{{ requestType() }}</span>
          </li>
          <li>
            <span class="key">Expiry Date:</span>
            <span class="val">{{ formattedExpirationDate() }}</span>
          </li>
          <li>
            <v-icon v-if="nameRequestDetails.status === NameRequestStates.APPROVED ||
                          nameRequestDetails.status === NameRequestStates.CONDITIONAL"
              color="green" class="nr-status-icon">mdi-check</v-icon>
            <span class="key">Status:</span>
            <span class="val">{{ nameRequestDetails.status | capitalize }}</span>
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
            <span class="val">{{ applicantName() }}</span>
          </li>
          <li>
            <span class="key">Address:</span>
            <span class="val">{{ applicantAddress() }}</span>
          </li>
          <li>
            <span class="key">Email:</span>
            <span class="val">{{ nameRequestApplicant.emailAddress }}</span>
          </li>
          <li>
            <span class="key">Phone:</span>
            <span class="val">{{ nameRequestApplicant.phoneNumber | VMask("(###) ###-####") }}</span>
          </li>
        </ul>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { getName } from 'country-list'
import { VueMaskFilter } from 'v-mask'

// Enums
import { CorpTypeCd, NameRequestStates } from '@/enums'

// Interfaces
import { NameRequestIF, NameRequestDetailsIF, NameRequestApplicantIF } from '@/interfaces'

// Mixins
import { DateMixin, EnumMixin, NameRequestMixin } from '@/mixins'

@Component({
  filters: { 'VMask': VueMaskFilter }
})
export default class NameRequestInfo extends Mixins(DateMixin, EnumMixin, NameRequestMixin) {
  // Enum for template
  readonly NameRequestStates = NameRequestStates

  // Constants
  readonly RECEIVED_STATE = 'Received'
  readonly NOT_RECEIVED_STATE= 'Not Received'
  readonly NOT_REQUIRED_STATE = 'Not Required'
  readonly WAIVED_STATE = 'Waived'

  @Prop() readonly nameRequest: any

  private parsedNameRequest: NameRequestIF
  private nameRequestDetails: NameRequestDetailsIF
  private nameRequestApplicant: NameRequestApplicantIF

  created (): void {
    if (!this.nameRequest) return // safety check

    this.parsedNameRequest = this.parseNameRequest(this.nameRequest, null)
    this.nameRequestDetails = this.parsedNameRequest.details
    this.nameRequestApplicant = this.parsedNameRequest.applicant
  }

  /** The entity title  */
  private entityTypeDescription (): string {
    return this.getCorpTypeDescription(this.parsedNameRequest.entityType as CorpTypeCd)
  }

  /** The request type */
  private requestType (): string {
    return 'New Business'
  }

  /** Return formatted expiration date */
  private formattedExpirationDate (): string {
    const date = new Date(this.nameRequestDetails.expirationDate)
    return this.dateToPacificDateTime(date)
  }

  /** Return condition/consent string */
  private get conditionConsent (): string {
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
