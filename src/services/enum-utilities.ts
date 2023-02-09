import {
  DissolutionNames,
  DissolutionTypes,
  EffectOfOrderTypes,
  FilingNames,
  FilingStatus,
  FilingTypes,
  PaymentMethod,
  RestorationTypes
} from '@/enums'
import {
  GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'

export default class EnumUtilities {
  /** Returns True if item status is Cancelled. */
  static isStatusCancelled (item: any): boolean {
    return (item.status === FilingStatus.CANCELLED)
  }

  /** Returns True if item status is Completed. */
  static isStatusCompleted (item: any): boolean {
    return (item.status === FilingStatus.COMPLETED)
  }

  /** Returns True if item status is Corrected. */
  static isStatusCorrected (item: any): boolean {
    return (item.status === FilingStatus.CORRECTED)
  }

  /** Returns True if item status is Deleted. */
  static isStatusDeleted (item: any): boolean {
    return (item.status === FilingStatus.DELETED)
  }

  /** Returns True if item status is Draft. */
  static isStatusDraft (item: any): boolean {
    return (item.status === FilingStatus.DRAFT)
  }

  /** Returns True if item status is Error. */
  static isStatusError (item: any): boolean {
    return (item.status === FilingStatus.ERROR)
  }

  /** Returns True if item status is New. */
  static isStatusNew (item: any): boolean {
    return (item.status === FilingStatus.NEW)
  }

  /** Returns True if item status is Paid. */
  static isStatusPaid (item: any): boolean {
    return (item.status === FilingStatus.PAID)
  }

  /** Returns True if item status is Pending. */
  static isStatusPending (item: any): boolean {
    return (item.status === FilingStatus.PENDING)
  }

  /** Returns True if item status is Pending-Correction. */
  static isStatusPendingCorrection (item: any): boolean {
    return (item.status === FilingStatus.PENDING_CORRECTION)
  }

  /** Returns True if item status is Withdrawn. */
  static isStatusWithdrawn (item: any): boolean {
    return (item.status === FilingStatus.WITHDRAWN)
  }

  //
  // Filing Type helpers
  //

  /** Returns True if filing is an Alteration. */
  static isTypeAlteration (item: any): boolean {
    return (item.name === FilingTypes.ALTERATION)
  }

  /** Returns True if filing is an Annual Report. */
  static isTypeAnnualReport (item: any): boolean {
    return (item.name === FilingTypes.ANNUAL_REPORT)
  }

  /** Returns True if filing is a Change of Address. */
  static isTypeChangeOfAddress (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_ADDRESS)
  }

  /** Returns True if filing is a Change of Directors. */
  static isTypeChangeOfDirectors (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_DIRECTORS)
  }

  /** Returns True if filing is a Change of Name. */
  static isTypeChangeOfName (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_NAME)
  }

  /** Returns True if filing is a Change of Registration. */
  static isTypeChangeOfRegistration (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_REGISTRATION)
  }

  /** Returns True if filing is a Consent to Continuation Out. */
  static isTypeConsentContinuationOut (item: any): boolean {
    return (item.name === FilingTypes.CONSENT_CONTINUATION_OUT)
  }

  /** Returns True if filing is a Conversion. */
  static isTypeConversion (item: any): boolean {
    return (item.name === FilingTypes.CONVERSION)
  }

  /** Returns True if filing is a Correction. */
  static isTypeCorrection (item: any): boolean {
    return (item.name === FilingTypes.CORRECTION)
  }

  /** Returns True if filing is an Incorporation Application. */
  static isTypeIncorporationApplication (item: any): boolean {
    return (item.name === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** Returns True if filing is a Registration. */
  static isTypeRegistration (item: any): boolean {
    return (item.name === FilingTypes.REGISTRATION)
  }

  /** Returns True if filing is a Restoration. */
  static isTypeRestoration (item: any): boolean {
    return (item.name === FilingTypes.RESTORATION)
  }

  /** Returns True if filing is a Transition. */
  static isTypeTransition (item: any): boolean {
    return (item.name === FilingTypes.TRANSITION)
  }

  /** Returns True if filing is an Administrative Dissolution. */
  static isTypeAdministrativeDissolution (item: any): boolean {
    return (item.name === FilingTypes.DISSOLUTION && item.dissolutionType === DissolutionTypes.ADMINISTRATIVE)
  }

  /** Returns True if filing is an Involuntary Dissolution. */
  static isTypeInvoluntaryDissolution (item: any): boolean {
    return (item.name === FilingTypes.DISSOLUTION && item.dissolutionType === DissolutionTypes.INVOLUNTARY)
  }

  /** Returns True if filing is a Voluntary Dissolution. */
  static isTypeVoluntaryDissolution (item: any): boolean {
    return (item.name === FilingTypes.DISSOLUTION && item.dissolutionType === DissolutionTypes.VOLUNTARY)
  }

  /** Returns True if filing is a Put Back On. */
  static isTypePutBackOn (item: any): boolean {
    return (item.name === FilingTypes.PUT_BACK_ON)
  }

  /** Return True if the filing is a Admin Freeze */
  static isTypeAdminFreeze (item: any): boolean {
    return (item.name === FilingTypes.ADMIN_FREEZE)
  }

  /** Returns True if filing is a Court Order. */
  static isTypeCourtOrder (item: any): boolean {
    return (item.name === FilingTypes.COURT_ORDER)
  }

  /** Returns True if filing is a Special Resolution. */
  static isTypeSpecialResolution (item: any): boolean {
    return (item.name === FilingTypes.SPECIAL_RESOLUTION)
  }

  /** Returns True if filing is a Limited Restoration. */
  static isTypeLimitedRestoration (item: any): boolean {
    return (item.name === FilingTypes.RESTORATION && item.data?.restoration?.type === RestorationTypes.LIMITED)
  }

  /** Returns True if filing is a Staff Only filing. */
  static isTypeStaff (item: any): boolean {
    const isStaffType = [
      FilingTypes.REGISTRARS_NOTATION,
      FilingTypes.REGISTRARS_ORDER,
      FilingTypes.COURT_ORDER,
      FilingTypes.PUT_BACK_ON,
      FilingTypes.ADMIN_FREEZE
    ].includes(item.name)
    const isAdminDissolution = (item?.data?.dissolution?.dissolutionType === DissolutionTypes.ADMINISTRATIVE)
    return (isStaffType || isAdminDissolution)
  }

  //
  // Payment Method helpers
  //

  /** Returns True if payment method is Credit Card. */
  static isPayMethodCreditCard (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.CREDIT_CARD)
  }

  /** Returns True if payment method is Direct Pay. */
  static isPayMethodDirectPay (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.DIRECT_PAY)
  }

  /** Returns True if payment method is Drawdown. */
  static isPayMethodDrawdown (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.DRAWDOWN)
  }

  /** Returns True if payment method is Online Banking. */
  static isPayMethodOnlineBanking (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.ONLINE_BANKING)
  }

  //
  // Effect of Order helpers
  //

  /** Returns True if effect of order is Plan of Arrangement. */
  static isEffectOfOrderPlanOfArrangement (effectOfOrder: EffectOfOrderTypes): boolean {
    return (effectOfOrder === EffectOfOrderTypes.PLAN_OF_ARRANGEMENT)
  }

  //
  // Conversion helpers
  //

  // from external module
  getCorpTypeNumberedDescription = GetCorpNumberedDescription

  /**
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   * @param subType
   * @returns the filing name
   */
  static filingTypeToName (type: FilingTypes, agmYear = null as string, subType = null as any): string {
    if (!type) return 'Unknown Type' // safety check
    switch (type) {
      case FilingTypes.ADMIN_FREEZE: return FilingNames.ADMIN_FREEZE
      case FilingTypes.ALTERATION: return FilingNames.ALTERATION
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.CHANGE_OF_ADDRESS
      case FilingTypes.CHANGE_OF_COMPANY_INFO: return FilingNames.CHANGE_OF_COMPANY_INFO
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.CHANGE_OF_DIRECTORS
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.CHANGE_OF_NAME
      case FilingTypes.CHANGE_OF_REGISTRATION: return FilingNames.CHANGE_OF_REGISTRATION
      case FilingTypes.CONVERSION: return FilingNames.CONVERSION
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
      case FilingTypes.COURT_ORDER: return FilingNames.COURT_ORDER
      case FilingTypes.DISSOLUTION: return FilingNames.DISSOLUTION
      case FilingTypes.DISSOLVED: return FilingNames.DISSOLVED
      case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
      case FilingTypes.REGISTRARS_NOTATION: return FilingNames.REGISTRARS_NOTATION
      case FilingTypes.REGISTRARS_ORDER: return FilingNames.REGISTRARS_ORDER
      case FilingTypes.REGISTRATION: return FilingNames.REGISTRATION
      case FilingTypes.RESTORATION: return (subType === RestorationTypes.FULL)
        ? FilingNames.RESTORATION_FULL
        : FilingNames.RESTORATION_LIMITED
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.TRANSITION: return FilingNames.TRANSITION_APPLICATION
      case FilingTypes.PUT_BACK_ON: return FilingNames.PUT_BACK_ON
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
  static camelCaseToWords (s: string): string {
    return s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  }

  /**
   * Converts a dissolution type to its name.
   * @param isFirm
   * @param type the dissolution type to convert
   * @returns the dissolution name
   */
  static dissolutionTypeToName (isFirm: boolean, type: DissolutionTypes): string {
    switch (type) {
      case DissolutionTypes.ADMINISTRATIVE: return DissolutionNames.ADMINISTRATIVE
      case DissolutionTypes.INVOLUNTARY: return DissolutionNames.INVOLUNTARY
      case DissolutionTypes.VOLUNTARY:
        return isFirm ? DissolutionNames.FIRM_DISSOLUTION : DissolutionNames.VOLUNTARY
    }
    // fallback for unknown filings
    return this.camelCaseToWords(type)
  }
}
