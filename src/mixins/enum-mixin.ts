import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import {
  DissolutionTypes,
  EffectOfOrderTypes,
  FilingStatus,
  FilingTypes,
  PaymentMethod
} from '@/enums'
import {
  GetCorpFullDescription,
  GetCorpInfoObject,
  GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'
import EnumUtilities from '@/services/enum-utilities'
import { Getter } from 'vuex-class'

/**
 * Mixin that provides some useful enum-related utilities.
 */
@Component({})
export default class EnumMixin extends Vue {
  //
  // Filing Status helpers
  //
  @Getter isFirm!: boolean

  /** DEPRECATED Returns True if item status is Cancelled. */
  isStatusCancelled (item: any): boolean {
    return (item.status === FilingStatus.CANCELLED)
  }

  /** DEPRECATED Returns True if item status is Completed. */
  isStatusCompleted (item: any): boolean {
    return (item.status === FilingStatus.COMPLETED)
  }

  /** DEPRECATED Returns True if item status is Corrected. */
  isStatusCorrected (item: any): boolean {
    return (item.status === FilingStatus.CORRECTED)
  }

  /** DEPRECATED Returns True if item status is Deleted. */
  isStatusDeleted (item: any): boolean {
    return (item.status === FilingStatus.DELETED)
  }

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

  /** DEPRECATED Returns True if item status is Withdrawn. */
  isStatusWithdrawn (item: any): boolean {
    return (item.status === FilingStatus.WITHDRAWN)
  }

  //
  // Filing Type helpers
  //

  /** DEPRECATED Returns True if filing is an Alteration. */
  isTypeAlteration (item: any): boolean {
    return (item.name === FilingTypes.ALTERATION)
  }

  /** DEPRECATED Returns True if filing is an Annual Report. */
  isTypeAnnualReport (item: any): boolean {
    return (item.name === FilingTypes.ANNUAL_REPORT)
  }

  /** DEPRECATED Returns True if filing is a Change of Address. */
  isTypeChangeOfAddress (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_ADDRESS)
  }

  /** DEPRECATED Returns True if filing is a Change of Directors. */
  isTypeChangeOfDirectors (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_DIRECTORS)
  }

  /** DEPRECATED Returns True if filing is a Change of Name. */
  isTypeChangeOfName (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_NAME)
  }

  /** DEPRECATED Returns True if filing is a Change of Registration. */
  isTypeChangeOfRegistration (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_REGISTRATION)
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

  /** DEPRECATED Returns True if filing is an Incorporation Application. */
  isTypeIncorporationApplication (item: any): boolean {
    return (item.name === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** DEPRECATED Returns True if filing is a Registration. */
  isTypeRegistration (item: any): boolean {
    return (item.name === FilingTypes.REGISTRATION)
  }

  /** DEPRECATED Returns True if filing is a Restoration. */
  isTypeRestoration (item: any): boolean {
    return (item.name === FilingTypes.RESTORATION)
  }

  /** DEPRECATED Returns True if filing is a Transition. */
  isTypeTransition (item: any): boolean {
    return (item.name === FilingTypes.TRANSITION)
  }

  /** DEPRECATED Returns True if filing is an Administrative Dissolution. */
  isTypeAdministrativeDissolution (item: any): boolean {
    return EnumUtilities.isTypeAdministrativeDissolution(item)
  }

  /** DEPRECATED Returns True if filing is an Involuntary Dissolution. */
  isTypeInvoluntaryDissolution (item: any): boolean {
    return EnumUtilities.isTypeInvoluntaryDissolution(item)
  }

  /** DEPRECATED Returns True if filing is a Voluntary Dissolution. */
  isTypeVoluntaryDissolution (item: any): boolean {
    return EnumUtilities.isTypeVoluntaryDissolution(item)
  }

  /** DEPRECATED Returns True if filing is a Put Back On. */
  isTypePutBackOn (item: any): boolean {
    return (item.name === FilingTypes.PUT_BACK_ON)
  }

  /** DEPRECATED Return True if the filing is a Admin Freeze */
  isTypeAdminFreeze (item: any): boolean {
    return (item.name === FilingTypes.ADMIN_FREEZE)
  }

  /** DEPRECATED Returns True if filing is a Court Order. */
  isTypeCourtOrder (item: any): boolean {
    return (item.name === FilingTypes.COURT_ORDER)
  }

  /** DEPRECATED Returns True if filing is a Special Resolution. */
  isTypeSpecialResolution (item: any): boolean {
    return (item.name === FilingTypes.SPECIAL_RESOLUTION)
  }

  /** DEPRECATED Returns True if filing is a Limited Restoration. */
  isTypeLimitedRestoration (item: any): boolean {
    return EnumUtilities.isTypeLimitedRestoration(item)
  }

  /** DEPRECATED Returns True if filing is a Staff Only filing. */
  isTypeStaff (item: any): boolean {
    return EnumUtilities.isTypeStaff(item)
  }

  //
  // Payment Method helpers
  //

  /** DEPRECATED Returns True if payment method is Credit Card. */
  isPayMethodCreditCard (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.CREDIT_CARD)
  }

  /** DEPRECATED Returns True if payment method is Direct Pay. */
  isPayMethodDirectPay (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.DIRECT_PAY)
  }

  /** DEPRECATED Returns True if payment method is Drawdown. */
  isPayMethodDrawdown (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.DRAWDOWN)
  }

  /** DEPRECATED Returns True if payment method is Online Banking. */
  isPayMethodOnlineBanking (item: any): boolean {
    return (item.paymentMethod === PaymentMethod.ONLINE_BANKING)
  }

  //
  // Effect of Order helpers
  //

  /** DEPRECATED Returns True if effect of order is Plan of Arrangement. */
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
   * DEPRECATED - use enum-utilities instead
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   * @param subType
   * @returns the filing name
   */
  filingTypeToName (type: FilingTypes, agmYear = null as string, subType = null as any): string {
    return EnumUtilities.filingTypeToName(type, agmYear, subType)
  }

  /**
   * DEPRECATED - use enum-utilities instead
   * Converts a string in "camelCase" (or "PascalCase") to separate, title-case words,
   * suitable for a title or proper name.
   * @param s the string to convert
   * @returns the converted string
   */
  camelCaseToWords (s: string): string {
    return EnumUtilities.camelCaseToWords(s)
  }

  /**
   * DEPRECATED - use enum-utilities instead
   * Converts a dissolution type to its name.
   * @param type the dissolution type to convert
   * @returns the dissolution name
   */
  dissolutionTypeToName (type: DissolutionTypes): string {
    return EnumUtilities.dissolutionTypeToName(this.isFirm, type)
  }
}
