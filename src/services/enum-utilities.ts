import {
  EffectOfOrderTypes,
  FilingNames,
  FilingStatus,
  FilingSubTypes,
  FilingTypes,
  PaymentMethod
} from '@/enums'

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

  /** Returns True if filing is an AGM Extension. */
  static isTypeAgmExtension (item: any): boolean {
    return (item.name === FilingTypes.AGM_EXTENSION)
  }

  /** Returns True if filing is an AGM Location Change. */
  static isTypeAgmLocationChange (item: any): boolean {
    return (item.name === FilingTypes.AGM_LOCATION_CHANGE)
  }

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

  /** Returns True if filing is a Continuation Out. */
  static isTypeContinuationOut (item: any): boolean {
    return (item.name === FilingTypes.CONTINUATION_OUT)
  }

  /** Returns True if filing is a Conversion. */
  static isTypeConversion (item: any): boolean {
    return (item.name === FilingTypes.CONVERSION)
  }

  /** Returns True if filing is a Correction. */
  static isTypeCorrection (item: any): boolean {
    return (item.name === FilingTypes.CORRECTION)
  }

  /** Returns True if filing is an Amalgamation. */
  static isTypeAmalgamation (item: any): boolean {
    return (item.name === FilingTypes.AMALGAMATION_APPLICATION)
  }

  /** Returns True if filing is a Regular Amalgamation. */
  static isTypeAmalgamationRegular (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.AMALGAMATION_REGULAR ||
      // the property in a state filing:
      item.amalgamationApplication?.type === FilingSubTypes.AMALGAMATION_REGULAR
    )
  }

  /** Returns True if filing is a Horizontal Amalgamation. */
  static isTypeAmalgamationHorizontal (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.AMALGAMATION_HORIZONTAL ||
      // the property in a state filing:
      item.amalgamationApplication?.type === FilingSubTypes.AMALGAMATION_HORIZONTAL
    )
  }

  /** Returns True if filing is a Vertical Amalgamation. */
  static isTypeAmalgamationVertical (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.AMALGAMATION_VERTICAL ||
      // the property in a state filing:
      item.amalgamationApplication?.type === FilingSubTypes.AMALGAMATION_VERTICAL
    )
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
  static isTypeDissolutionAdministrative (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.DISSOLUTION_ADMINISTRATIVE ||
      // the property in a state filing:
      item.dissolution?.dissolutionType === FilingSubTypes.DISSOLUTION_ADMINISTRATIVE
    )
  }

  /** Returns True if filing is an Involuntary Dissolution. */
  static isTypeDissolutionInvoluntary (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.DISSOLUTION_INVOLUNTARY ||
      // the property in a state filing:
      item.dissolution?.dissolutionType === FilingSubTypes.DISSOLUTION_INVOLUNTARY
    )
  }

  /** Returns True if filing is a Voluntary Dissolution. */
  static isTypeDissolutionVoluntary (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.DISSOLUTION_VOLUNTARY ||
      // the property in a state filing:
      item.dissolution?.dissolutionType === FilingSubTypes.DISSOLUTION_VOLUNTARY
    )
  }

  /** Returns True if filing is a Registrar's Notation. */
  static isTypeRegistrarsNotation (item: any): boolean {
    return (item.name === FilingTypes.REGISTRARS_NOTATION)
  }

  /** Returns True if filing is a Registrar's Order. */
  static isTypeRegistarsOrder (item: any): boolean {
    return (item.name === FilingTypes.REGISTRARS_ORDER)
  }

  /** Returns True if filing is a Put Back On. */
  static isTypePutBackOn (item: any): boolean {
    return (item.name === FilingTypes.PUT_BACK_ON)
  }

  /** Return True if the filing is an Admin Freeze or Unfreeze. */
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

  /** Returns True if filing is a Full Restoration. */
  static isTypeRestorationFull (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.FULL_RESTORATION ||
      // the property in a state filing:
      item.restoration?.type === FilingSubTypes.FULL_RESTORATION
    )
  }

  /** Returns True if filing is a Limited Restoration. */
  static isTypeRestorationLimited (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.LIMITED_RESTORATION ||
      // the property in a state filing:
      item.restoration?.type === FilingSubTypes.LIMITED_RESTORATION
    )
  }

  /** Returns True if filing is a Limited Restoration Extension. */
  static isTypeRestorationLimitedExtension (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.LIMITED_RESTORATION_EXTENSION ||
      // the property in a state filing:
      item.restoration?.type === FilingSubTypes.LIMITED_RESTORATION_EXTENSION
    )
  }

  /** Returns True if filing is a Limited Restoration To Full. */
  static isTypeRestorationLimitedToFull (item: any): boolean {
    return (
      // the property in a todo item or filing item:
      item.filingSubType === FilingSubTypes.LIMITED_RESTORATION_TO_FULL ||
      // the property in a state filing:
      item.restoration?.type === FilingSubTypes.LIMITED_RESTORATION_TO_FULL
    )
  }

  /** Returns True if filing is a Staff filing. */
  static isTypeStaff (item: any): boolean {
    return (
      this.isTypeAdminFreeze(item) ||
      this.isTypeCourtOrder(item) ||
      this.isTypeDissolutionAdministrative(item) ||
      this.isTypePutBackOn(item) ||
      this.isTypeRegistarsOrder(item) ||
      this.isTypeRegistrarsNotation(item)
    )
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

  /**
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   * @param subType the filing subtype (optional)
   * @returns the filing name
   */
  static filingTypeToName (type: FilingTypes, agmYear = null as string, subType: FilingSubTypes = null): string {
    if (!type) return 'Unknown Type' // safety check
    switch (type) {
      case FilingTypes.ADMIN_FREEZE:
        // FUTURE: add freeze/unfreeze checks here
        return FilingNames.ADMIN_FREEZE
      case FilingTypes.AGM_EXTENSION: return FilingNames.AGM_EXTENSION
      case FilingTypes.AGM_LOCATION_CHANGE: return FilingNames.AGM_LOCATION_CHANGE
      case FilingTypes.ALTERATION: return FilingNames.ALTERATION
      case FilingTypes.AMALGAMATION_APPLICATION:
        if (subType === FilingSubTypes.AMALGAMATION_HORIZONTAL) return `${FilingNames.AMALGAMATION_APPLICATION} - Horizontal`
        if (subType === FilingSubTypes.AMALGAMATION_REGULAR) return `${FilingNames.AMALGAMATION_APPLICATION} - Regular`
        if (subType === FilingSubTypes.AMALGAMATION_VERTICAL) return `${FilingNames.AMALGAMATION_APPLICATION} - Vertical`
        return FilingNames.AMALGAMATION_APPLICATION
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.CHANGE_OF_ADDRESS
      case FilingTypes.CHANGE_OF_COMPANY_INFO: return FilingNames.CHANGE_OF_COMPANY_INFO
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.CHANGE_OF_DIRECTORS
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.CHANGE_OF_NAME
      case FilingTypes.CHANGE_OF_REGISTRATION: return FilingNames.CHANGE_OF_REGISTRATION
      case FilingTypes.CONVERSION: return FilingNames.CONVERSION
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
      case FilingTypes.COURT_ORDER: return FilingNames.COURT_ORDER
      case FilingTypes.DISSOLUTION:
        // FUTURE: move dissolution subtype checks here
        return FilingNames.DISSOLUTION
      case FilingTypes.DISSOLVED: return FilingNames.DISSOLVED
      case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
      case FilingTypes.REGISTRARS_NOTATION: return FilingNames.REGISTRARS_NOTATION
      case FilingTypes.REGISTRARS_ORDER: return FilingNames.REGISTRARS_ORDER
      case FilingTypes.REGISTRATION: return FilingNames.REGISTRATION
      case FilingTypes.RESTORATION:
        if (subType === FilingSubTypes.LIMITED_RESTORATION_TO_FULL) return FilingNames.RESTORATION_CONVERSION
        if (subType === FilingSubTypes.LIMITED_RESTORATION_EXTENSION) return FilingNames.RESTORATION_EXTENSION
        if (subType === FilingSubTypes.FULL_RESTORATION) return FilingNames.RESTORATION_FULL
        if (subType === FilingSubTypes.LIMITED_RESTORATION) return FilingNames.RESTORATION_LIMITED
        return FilingNames.RESTORATION_APPLICATION
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.TRANSITION: return FilingNames.TRANSITION_APPLICATION
      case FilingTypes.PUT_BACK_ON: return FilingNames.PUT_BACK_ON
    }
    // fallback for unknown filings
    return this.camelCaseToWords(type)
  }

  /**
   * Converts a string in "camelCase" (or "PascalCase") to a string of separate, title-case words,
   * suitable for a title or proper name.
   * @param s the string to convert
   * @returns the converted string
   */
  static camelCaseToWords (s: string): string {
    const words = s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
    // SPECIAL CASE: convert 'Agm' to uppercase
    return words.replace('Agm', 'AGM')
  }

  /**
   * Converts a dissolution subtype to a filing name.
   * @param isFirm whether this entity is a firm
   * @param subType the dissolution subtype
   * @returns the filing name
   */
  static dissolutionTypeToName (isFirm: boolean, subType: FilingSubTypes): string {
    switch (subType) {
      case FilingSubTypes.DISSOLUTION_ADMINISTRATIVE: return FilingNames.DISSOLUTION_ADMINISTRATIVE
      case FilingSubTypes.DISSOLUTION_INVOLUNTARY: return FilingNames.DISSOLUTION_INVOLUNTARY
      case FilingSubTypes.DISSOLUTION_VOLUNTARY: return (
        isFirm ? FilingNames.DISSOLUTION_FIRM : FilingNames.DISSOLUTION_VOLUNTARY
      )
    }
    return FilingNames.UNKNOWN
  }
}
