import { Component, Vue } from 'vue-property-decorator'
import {
  CorpTypeCd,
  DissolutionNames,
  DissolutionTypes,
  EffectOfOrderTypes,
  EntityStatus,
  FilingNames,
  FilingStatus,
  FilingTypes,
  PaymentMethod
} from '@/enums'
import {
  GetCorpFullDescription,
  GetCorpInfoObject,
  GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'

/**
 * Mixin that provides some useful enum-related utilities.
 */
@Component({})
export default class EnumMixin extends Vue {
  //
  // Filing Status helpers
  //

  /** Returns True if item status is Cancelled. */
  isStatusCancelled (item: any): boolean {
    return (item.status === FilingStatus.CANCELLED)
  }

  /** Returns True if item status is Completed. */
  isStatusCompleted (item: any): boolean {
    return (item.status === FilingStatus.COMPLETED)
  }

  /** Returns True if item status is Corrected. */
  isStatusCorrected (item: any): boolean {
    return (item.status === FilingStatus.CORRECTED)
  }

  /** Returns True if item status is Deleted. */
  isStatusDeleted (item: any): boolean {
    return (item.status === FilingStatus.DELETED)
  }

  /** Returns True if item status is Draft. */
  isStatusDraft (item: any): boolean {
    return (item.status === FilingStatus.DRAFT)
  }

  /** Returns True if item status is Error. */
  isStatusError (item: any): boolean {
    return (item.status === FilingStatus.ERROR)
  }

  /** Returns True if item status is New. */
  isStatusNew (item: any): boolean {
    return (item.status === FilingStatus.NEW)
  }

  /** Returns True if item status is Paid. */
  isStatusPaid (item: any): boolean {
    return (item.status === FilingStatus.PAID)
  }

  /** Returns True if item status is Pending. */
  isStatusPending (item: any): boolean {
    return (item.status === FilingStatus.PENDING)
  }

  /** Returns True if item status is Withdrawn. */
  isStatusWithdrawn (item: any): boolean {
    return (item.status === FilingStatus.WITHDRAWN)
  }

  //
  // Filing Type helpers
  //

  /** Returns True if filing is an Alteration. */
  isTypeAlteration (item: any): boolean {
    return (item.name === FilingTypes.ALTERATION)
  }

  /** Returns True if filing is an Annual Report. */
  isTypeAnnualReport (item: any): boolean {
    return (item.name === FilingTypes.ANNUAL_REPORT)
  }

  /** Returns True if filing is a Change of Address. */
  isTypeChangeOfAddress (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_ADDRESS)
  }

  /** Returns True if filing is a Change of Directors. */
  isTypeChangeOfDirectors (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_DIRECTORS)
  }

  /** Returns True if filing is a Change of Name. */
  isTypeChangeOfName (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_NAME)
  }

  /** Returns True if filing is a Correction. */
  isTypeCorrection (item: any): boolean {
    return (item.name === FilingTypes.CORRECTION)
  }

  /** Returns True if filing is a Dissolution. */
  isTypeDissolution (item: any): boolean {
    return (item.name === FilingTypes.DISSOLUTION)
  }

  /** Returns True if filing is an Incorporation Application. */
  isTypeIncorporationApplication (item: any): boolean {
    return (item.name === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** Returns True if filing is a Transition. */
  isTypeTransition (item: any): boolean {
    return (item.name === FilingTypes.TRANSITION)
  }

  /** Returns True if filing is a Staff Only filing. */
  isTypeStaff (item: any): boolean {
    return [
      FilingTypes.REGISTRARS_NOTATION,
      FilingTypes.REGISTRARS_ORDER,
      FilingTypes.COURT_ORDER
    ].includes(item.name)
  }

  //
  // Payment Method helpers
  //

  /** Returns True if payment method is Credit Card. */
  isPayMethodCreditCard (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.CREDIT_CARD)
  }

  /** Returns True if payment method is Direct Pay. */
  isPayMethodDirectPay (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.DIRECT_PAY)
  }

  /** Returns True if payment method is Drawdown. */
  isPayMethodDrawdown (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.DRAWDOWN)
  }

  /** Returns True if payment method is Online Banking. */
  isPayMethodOnlineBanking (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.ONLINE_BANKING)
  }

  //
  // Effect of Order helpers
  //

  /** Returns True if effect of order is Plan of Arrangement. */
  isEffectOfOrderPlanOfArrangement (effectOfOrder: EffectOfOrderTypes): boolean {
    return (effectOfOrder === EffectOfOrderTypes.PLAN_OF_ARRANGEMENT)
  }

  //
  // Conversion helpers
  //

  // from external module
  getCorpTypeInfo = GetCorpInfoObject
  getCorpTypeDescription = GetCorpFullDescription
  getCorpTypeNumberedDescription = GetCorpNumberedDescription

  /**
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   * @param alterationRequired A boolean indicating a required business type change
   * @returns the filing name
   */
  filingTypeToName (type: FilingTypes, agmYear: string = null, alterationRequired: boolean = false): string {
    if (!type) return 'Unknown Type' // safety check
    switch (type) {
      case FilingTypes.ALTERATION:
        return alterationRequired ? FilingNames.ALTERATION : FilingNames.CHANGE_OF_COMPANY_INFO
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.CHANGE_OF_ADDRESS
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.CHANGE_OF_DIRECTORS
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.CHANGE_OF_NAME
      case FilingTypes.CONVERSION: return FilingNames.CONVERSION
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
      case FilingTypes.COURT_ORDER: return FilingNames.COURT_ORDER
      case FilingTypes.DISSOLUTION: return FilingNames.DISSOLUTION
      case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.TRANSITION: return FilingNames.TRANSITION_APPLICATION
      case FilingTypes.REGISTRARS_NOTATION: return FilingNames.REGISTRARS_NOTATION
      case FilingTypes.REGISTRARS_ORDER: return FilingNames.REGISTRARS_ORDER
    }
    // fallback for unknown filings
    return this.camelCaseToWords(type)
  }

  /**
   * Converts a string in "camelCase" (or "PascalCase") to separate, title-case words,
   * suitable for a title or proper name.
   * @param s the string to convert
   * @returns the converted string
   */
  camelCaseToWords (s: string): string {
    return s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  }

  /**
   * Converts a dissolution type to its name.
   * @param type the dissolution type to convert
   * @returns the dissolution name
   */
  dissolutionTypeToName (type: DissolutionTypes): string {
    return DissolutionNames[type as string]
  }
}
