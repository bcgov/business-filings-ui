import { Component, Vue } from 'vue-property-decorator'
import { FilingStatus } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'

/**
 * Mixin that provides some useful enum-related utilities.
 */
@Component({})
export default class EnumMixin extends Vue {
  /** DEPRECATED Returns True if item status is Draft. */
  isStatusDraft (item: any): boolean {
    return (item.status === FilingStatus.DRAFT)
  }

  /** DEPRECATED Returns True if item status is Error. */
  isStatusError (item: any): boolean {
    return (item.status === FilingStatus.ERROR)
  }

  /** DEPRECATED Returns True if item status is New. */
  isStatusNew (item: any): boolean {
    return (item.status === FilingStatus.NEW)
  }

  /** DEPRECATED Returns True if item status is Paid. */
  isStatusPaid (item: any): boolean {
    return (item.status === FilingStatus.PAID)
  }

  /** DEPRECATED Returns True if item status is Pending. */
  isStatusPending (item: any): boolean {
    return (item.status === FilingStatus.PENDING)
  }

  /** DEPRECATED Returns True if item status is Pending-Correction. */
  isStatusPendingCorrection (item: any): boolean {
    return (item.status === FilingStatus.PENDING_CORRECTION)
  }

  //
  // Filing Type helpers
  //

  /** DEPRECATED Returns True if filing is an Alteration. */
  isTypeAlteration (item: any): boolean {
    return (item.name === FilingTypes.ALTERATION)
  }

  /** DEPRECATED Returns True if filing is an Amalgamation. */
  isTypeAmalgamation (item: any): boolean {
    return (item.name === FilingTypes.AMALGAMATION_APPLICATION)
  }

  /** DEPRECATED Returns True if filing is an Annual Report. */
  isTypeAnnualReport (item: any): boolean {
    return (item.name === FilingTypes.ANNUAL_REPORT)
  }

  /** DEPRECATED Returns True if filing is a Consent to Continuation Out. */
  isTypeConsentContinuationOut (item: any): boolean {
    return (item.name === FilingTypes.CONSENT_CONTINUATION_OUT)
  }

  /** DEPRECATED Returns True if filing is a Conversion. */
  isTypeConversion (item: any): boolean {
    return (item.name === FilingTypes.CONVERSION)
  }

  /** DEPRECATED Returns True if filing is a Correction. */
  isTypeCorrection (item: any): boolean {
    return (item.name === FilingTypes.CORRECTION)
  }

  /** DEPRECATED Returns True if filing is a Dissolution. */
  isTypeDissolution (item: any): boolean {
    return (item.name === FilingTypes.DISSOLUTION)
  }

  /** DEPRECATED Returns True if filing is an Incorporation Application. */
  isTypeIncorporationApplication (item: any): boolean {
    return (item.name === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** DEPRECATED Returns True if filing is a Registration. */
  isTypeRegistration (item: any): boolean {
    return (item.name === FilingTypes.REGISTRATION)
  }

  /** DEPRECATED Returns True if filing is a Special Resolution. */
  isTypeSpecialResolution (item: any): boolean {
    return (item.name === FilingTypes.SPECIAL_RESOLUTION)
  }
}
