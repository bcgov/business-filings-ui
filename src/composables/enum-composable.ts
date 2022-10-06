import { computed } from 'vue'
import {
  DissolutionNames,
  DissolutionTypes,
  EffectOfOrderTypes,
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
import { useStore } from 'vuex'

const store = useStore()

/**
 * Composable that provides some useful enum-related utilities.
 */
export const EnumComposable = () => {
  /** Filing Status helper */
  const isFirm = computed(() => store.getters['isFirm'] as boolean)

  /** Returns True if item status is Cancelled. */
  const isStatusCancelled = (item: any): boolean => {
    return (item.status === FilingStatus.CANCELLED)
  }

  /** Returns True if item status is Completed. */
  const isStatusCompleted = (item: any): boolean => {
    return (item.status === FilingStatus.COMPLETED)
  }

  /** Returns True if item status is Corrected. */
  const isStatusCorrected = (item: any): boolean => {
    return (item.status === FilingStatus.CORRECTED)
  }

  /** Returns True if item status is Deleted. */
  const isStatusDeleted = (item: any): boolean => {
    return (item.status === FilingStatus.DELETED)
  }

  /** Returns True if item status is Draft. */
  const isStatusDraft = (item: any): boolean => {
    return (item.status === FilingStatus.DRAFT)
  }

  /** Returns True if item status is Error. */
  const isStatusError = (item: any): boolean => {
    return (item.status === FilingStatus.ERROR)
  }

  /** Returns True if item status is New. */
  const isStatusNew = (item: any): boolean => {
    return (item.status === FilingStatus.NEW)
  }

  /** Returns True if item status is Paid. */
  const isStatusPaid = (item: any): boolean => {
    return (item.status === FilingStatus.PAID)
  }

  /** Returns True if item status is Pending. */
  const isStatusPending = (item: any): boolean => {
    return (item.status === FilingStatus.PENDING)
  }

  /** Returns True if item status is Withdrawn. */
  const isStatusWithdrawn = (item: any): boolean => {
    return (item.status === FilingStatus.WITHDRAWN)
  }

  /** Filing Type helpers */

  /** Returns True if filing is an Alteration. */
  const isTypeAlteration = (item: any): boolean => {
    return (item.name === FilingTypes.ALTERATION)
  }

  /** Returns True if filing is an Annual Report. */
  const isTypeAnnualReport = (item: any): boolean => {
    return (item.name === FilingTypes.ANNUAL_REPORT)
  }

  /** Returns True if filing is a Change of Address. */
  const isTypeChangeOfAddress = (item: any): boolean => {
    return (item.name === FilingTypes.CHANGE_OF_ADDRESS)
  }

  /** Returns True if filing is a Change of Directors. */
  const isTypeChangeOfDirectors = (item: any): boolean => {
    return (item.name === FilingTypes.CHANGE_OF_DIRECTORS)
  }

  /** Returns True if filing is a Change of Name. */
  const isTypeChangeOfName = (item: any): boolean => {
    return (item.name === FilingTypes.CHANGE_OF_NAME)
  }

  /** Returns True if filing is a Change of Registration. */
  const isTypeChangeOfRegistration = (item: any): boolean => {
    return (item.name === FilingTypes.CHANGE_OF_REGISTRATION)
  }

  /** Returns True if filing is a Conversion. */
  const isTypeConversion = (item: any): boolean => {
    return (item.name === FilingTypes.CONVERSION)
  }

  /** Returns True if filing is a Correction. */
  const isTypeCorrection = (item: any): boolean => {
    return (item.name === FilingTypes.CORRECTION)
  }

  /** Returns True if filing is a Dissolution. */
  const isTypeDissolution = (item: any): boolean => {
    return (item.name === FilingTypes.DISSOLUTION)
  }

  /** Returns True if filing is an Incorporation Application. */
  const isTypeIncorporationApplication = (item: any): boolean => {
    return (item.name === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** Returns True if filing is a Registration. */
  const isTypeRegistration = (item: any): boolean => {
    return (item.name === FilingTypes.REGISTRATION)
  }

  /** Returns True if filing is a Transition. */
  const isTypeTransition = (item: any): boolean => {
    return (item.name === FilingTypes.TRANSITION)
  }

  /** Returns True if filing is an Administrative Dissolution. */
  const isTypeAdministrativeDissolution = (item: any): boolean => {
    return (item.name === FilingTypes.DISSOLUTION && item.dissolutionType === DissolutionTypes.ADMINISTRATIVE)
  }

  /** Returns True if filing is a Put Back On. */
  const isTypePutBackOn = (item: any): boolean => {
    return (item.name === FilingTypes.PUT_BACK_ON)
  }

  /** Returns True if filing is a Special Resolution. */
  const isTypeSpecialResolution = (item: any): boolean => {
    return (item.name === FilingTypes.SPECIAL_RESOLUTION)
  }

  /** Returns True if filing is a Staff Only filing. */
  const isTypeStaff = (item: any): boolean => {
    const staffType = [
      FilingTypes.REGISTRARS_NOTATION,
      FilingTypes.REGISTRARS_ORDER,
      FilingTypes.COURT_ORDER,
      FilingTypes.PUT_BACK_ON
    ].includes(item.name)
    const adminDissolution = [
      DissolutionTypes.ADMINISTRATIVE
    ].includes(item?.data?.dissolution?.dissolutionType)
    return staffType || adminDissolution
  }

  /** Payment Method helpers */

  /** Returns True if payment method is Credit Card. */
  const isPayMethodCreditCard = (item: any): boolean => {
    return (item.paymentMethod === PaymentMethod.CREDIT_CARD)
  }

  /** Returns True if payment method is Direct Pay. */
  const isPayMethodDirectPay = (item: any): boolean => {
    return (item.paymentMethod === PaymentMethod.DIRECT_PAY)
  }

  /** Returns True if payment method is Drawdown. */
  const isPayMethodDrawdown = (item: any): boolean => {
    return (item.paymentMethod === PaymentMethod.DRAWDOWN)
  }

  /** Returns True if payment method is Online Banking. */
  const isPayMethodOnlineBanking = (item: any): boolean => {
    return (item.paymentMethod === PaymentMethod.ONLINE_BANKING)
  }

  /** Effect of Order helpers */

  /** Returns True if effect of order is Plan of Arrangement. */
  const isEffectOfOrderPlanOfArrangement = (effectOfOrder: EffectOfOrderTypes): boolean => {
    return (effectOfOrder === EffectOfOrderTypes.PLAN_OF_ARRANGEMENT)
  }

  /** Conversion helpers */

  /** from external module THESE THREE MAY NOT BE NEEDED!!!! */
  const getCorpTypeInfo = GetCorpInfoObject
  const getCorpTypeDescription = GetCorpFullDescription
  const getCorpTypeNumberedDescription = GetCorpNumberedDescription

  /**
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   * @param alterationRequired A boolean indicating a required business type change
   * @returns the filing name
   */
  const filingTypeToName = (type: FilingTypes, agmYear = null as string, alterationRequired = false): string => {
    if (!type) return 'Unknown Type' // safety check
    switch (type) {
      case FilingTypes.ALTERATION:
        return alterationRequired ? FilingNames.ALTERATION : FilingNames.CHANGE_OF_COMPANY_INFO
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.CHANGE_OF_ADDRESS
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.CHANGE_OF_DIRECTORS
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.CHANGE_OF_NAME
      case FilingTypes.CHANGE_OF_REGISTRATION: return FilingNames.CHANGE_OF_REGISTRATION
      case FilingTypes.CONVERSION: return FilingNames.CONVERSION
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
      case FilingTypes.COURT_ORDER: return FilingNames.COURT_ORDER
      case FilingTypes.DISSOLUTION: return FilingNames.DISSOLUTION
      case FilingTypes.DISSOLVED: return FilingNames.DISSOLVED
      case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
      case FilingTypes.INVOLUNTARY_DISSOLUTION: return FilingNames.INVOLUNTARY_DISSOLUTION
      case FilingTypes.REGISTRARS_NOTATION: return FilingNames.REGISTRARS_NOTATION
      case FilingTypes.REGISTRARS_ORDER: return FilingNames.REGISTRARS_ORDER
      case FilingTypes.REGISTRATION: return FilingNames.REGISTRATION
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.TRANSITION: return FilingNames.TRANSITION_APPLICATION
      case FilingTypes.VOLUNTARY_DISSOLUTION: return FilingNames.VOLUNTARY_DISSOLUTION
      case FilingTypes.PUT_BACK_ON: return FilingNames.PUT_BACK_ON
    }
    // fallback for unknown filings
    return camelCaseToWords(type)
  }

  /**
   * Converts a string in "camelCase" (or "PascalCase") to separate, title-case words,
   * suitable for a title or proper name.
   * @param s the string to convert
   * @returns the converted string
   */
  const camelCaseToWords = (s: string): string => {
    return s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  }

  /**
   * Converts a dissolution type to its name.
   * @param type the dissolution type to convert
   * @returns the dissolution name
   */
  const dissolutionTypeToName = (type: DissolutionTypes): string => {
    switch (type) {
      case DissolutionTypes.VOLUNTARY:
        return isFirm.value ? DissolutionNames.FIRM_DISSOLUTION : DissolutionNames.VOLUNTARY
      case DissolutionTypes.ADMINISTRATIVE:
        return DissolutionNames.ADMINISTRATIVE
    }
    // fallback for unknown filings
    return camelCaseToWords(type)
  }
  return {
    isFirm,
    isStatusCancelled,
    isStatusCompleted,
    isStatusCorrected,
    isStatusDeleted,
    isStatusDraft,
    isStatusError,
    isStatusNew,
    isStatusPaid,
    isStatusPending,
    isStatusWithdrawn,
    isTypeAlteration,
    isTypeAnnualReport,
    isTypeChangeOfAddress,
    isTypeChangeOfDirectors,
    isTypeChangeOfName,
    isTypeChangeOfRegistration,
    isTypeConversion,
    isTypeCorrection,
    isTypeDissolution,
    isTypeIncorporationApplication,
    isTypeRegistration,
    isTypeTransition,
    isTypeAdministrativeDissolution,
    isTypePutBackOn,
    isTypeSpecialResolution,
    isTypeStaff,
    isPayMethodCreditCard,
    isPayMethodDirectPay,
    isPayMethodDrawdown,
    isPayMethodOnlineBanking,
    isEffectOfOrderPlanOfArrangement,
    getCorpTypeInfo,
    getCorpTypeDescription,
    getCorpTypeNumberedDescription,
    filingTypeToName,
    dissolutionTypeToName
  }
}
