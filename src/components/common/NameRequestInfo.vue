<template>
  <div class="name-request-info">
    <v-row no-gutters>
      <v-col
        cols="6"
        class="pl-8"
      >
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
            <span class="val">{{ expirationDate }}</span>
          </li>
          <li id="status">
            <v-icon
              v-if="state === NameRequestStates.APPROVED ||
                state === NameRequestStates.CONDITIONAL"
              color="green"
              class="nr-status-icon"
            >
              mdi-check
            </v-icon>
            <span class="key">Status:</span>
            <span class="val">{{ capitalize(state) }}</span>
          </li>
          <li id="condition-consent">
            <v-icon
              v-if="conditionConsent === NOT_REQUIRED_STATE ||
                conditionConsent === RECEIVED_STATE ||
                conditionConsent === WAIVED_STATE"
              color="green"
              class="nr-status-icon"
            >
              mdi-check
            </v-icon>
            <v-icon
              v-if="conditionConsent === NOT_RECEIVED_STATE"
              color="red"
              class="nr-status-icon"
            >
              mdi-close
            </v-icon>
            <span class="key">Condition/Consent:</span>
            <span class="val">{{ conditionConsent }}</span>
          </li>
        </ul>
      </v-col>

      <v-col
        id="name-request-applicant-info"
        cols="6"
      >
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
            <span class="val">{{ emailAddress }}</span>
          </li>
          <li>
            <span class="key">Phone:</span>
            <span class="val">{{ phoneNumber }}</span>
          </li>
        </ul>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { getName } from 'country-list'
import { capitalize, formatPhoneNumber } from '@/utils'
import { NameRequestStates, NameRequestTypes } from '@/enums'
import { NameRequestIF, NameRequestApplicantIF } from '@/interfaces'
import { DateMixin, EnumMixin, NameRequestMixin } from '@/mixins'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import { useBusinessStore } from '@/stores'

@Component({})
export default class NameRequestInfo extends Mixins(DateMixin, EnumMixin, NameRequestMixin) {
  @Prop({ default: () => {} }) readonly nameRequest!: NameRequestIF

  @Getter(useBusinessStore) isSoleProp!: boolean

  // For template
  readonly NameRequestStates = NameRequestStates
  readonly capitalize = capitalize

  // Constants
  readonly RECEIVED_STATE = 'Received'
  readonly NOT_RECEIVED_STATE= 'Not Received'
  readonly NOT_REQUIRED_STATE = 'Not Required'
  readonly WAIVED_STATE = 'Waived'

  /** The entity type description. */
  get entityTypeDescription (): string {
    const corpFullDescription = GetCorpFullDescription(this.nameRequest.legalType)
    if (this.isSoleProp) {
      return `${corpFullDescription} or Doing Business As (DBA)`
    }
    return corpFullDescription
  }

  /** The request type. */
  get requestType (): string {
    if (this.nameRequest.request_action_cd === NameRequestTypes.AMALGAMATION) {
      return 'Amalgamation'
    }
    return 'New Business'
  }

  /** The expiration date. */
  get expirationDate (): string {
    return this.apiToPacificDateTime(this.nameRequest.expirationDate, true)
  }

  /** The state. */
  get state (): NameRequestStates {
    return this.nameRequest.state
  }

  /** The consent flag. */
  get consentFlag (): string {
    return this.nameRequest.consentFlag
  }

  /** The condition/consent string. */
  get conditionConsent (): string {
    if (this.state === NameRequestStates.APPROVED) {
      return this.NOT_REQUIRED_STATE
    }
    if (this.consentFlag === null) {
      return this.NOT_REQUIRED_STATE
    }
    if (this.consentFlag === 'R') {
      return this.RECEIVED_STATE
    }
    if (this.consentFlag === 'N') {
      return this.WAIVED_STATE
    }
    return this.NOT_RECEIVED_STATE
  }

  /** The applicant. */
  get applicant (): NameRequestApplicantIF {
    return this.nameRequest.applicants // not an array
  }

  /** The applicant's name. */
  get applicantName (): string {
    let name: string
    const firstName = this.applicant?.firstName ? this.applicant.firstName + ' ' : ''
    const middleName = this.applicant?.middleName ? this.applicant.middleName + ' ' : ''
    name = `${firstName}${middleName}${this.applicant?.lastName}`
    return name
  }

  /** The applicant's address. */
  get applicantAddress (): string {
    const city = this.applicant?.city
    const stateProvince = this.applicant?.stateProvinceCd
    const postal = this.applicant?.postalCd
    const country = this.applicant?.countryTypeCd ? getName(this.applicant?.countryTypeCd) : ''

    // Build address lines
    let address = this.applicant?.addrLine1
    if (this.applicant?.addrLine2) {
      address = `${address}, ${this.applicant?.addrLine2}`
    }
    if (this.applicant?.addrLine3) {
      address = `${address}, ${this.applicant?.addrLine3}`
    }

    return `${address}, ${city}, ${stateProvince}, ${postal}, ${country}`
  }

  /** The applicant's email address. */
  get emailAddress (): string {
    return this.applicant?.emailAddress
  }

  /** The applicant's phone number. */
  get phoneNumber (): string {
    return formatPhoneNumber(this.applicant?.phoneNumber)
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
