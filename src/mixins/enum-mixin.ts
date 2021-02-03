import { Component, Vue } from 'vue-property-decorator'
import { EntityTypes, EntityStatus, FilingNames, FilingStatus, FilingTypes, PaymentMethod } from '@/enums'

/**
 * Mixin that provides some useful enum-related utilities.
 */
@Component({})
export default class EnumMixin extends Vue {
  //
  // Filing Status helpers
  //

  /** Returns True if item status is Completed. */
  isStatusCompleted (item: any): boolean {
    return item.status === FilingStatus.COMPLETED
  }

  /** Returns True if item status is Draft. */
  isStatusDraft (item: any): boolean {
    return item.status === FilingStatus.DRAFT
  }

  /** Returns True if item status is Epoch. */
  isStatusEpoch (item: any): boolean {
    return item.status === FilingStatus.EPOCH
  }

  /** Returns True if item status is Error. */
  isStatusError (item: any): boolean {
    return item.status === FilingStatus.ERROR
  }

  /** Returns True if item status is New. */
  isStatusNew (item: any): boolean {
    return item.status === FilingStatus.NEW
  }

  /** Returns True if item status is Paid. */
  isStatusPaid (item: any): boolean {
    return item.status === FilingStatus.PAID
  }

  /** Returns True if item status is Pending. */
  isStatusPending (item: any): boolean {
    return item.status === FilingStatus.PENDING
  }

  /** Returns True if item status is Correction Pending. */
  isStatusCorrectionPending (item: any): boolean {
    return item.status === FilingStatus.PENDING_CORRECTION
  }

  /** Returns True if item status is Alteration Pending. */
  isStatusAlterationPending (item: any): boolean {
    return item.status === FilingStatus.PENDING_ALTERATION
  }

  //
  // Filing Type helpers
  //

  /** Returns True if task type is Alteration. */
  isTypeAlteration (item: any): boolean {
    return (item.filingType === FilingTypes.NOTICE_OF_ALTERATION)
  }

  /** Returns True if task type is Annual Report. */
  isTypeAnnualReport (item: any): boolean {
    return (item.filingType === FilingTypes.ANNUAL_REPORT)
  }

  /** Returns True if task type is Correction. */
  isTypeCorrection (item: any): boolean {
    return (item.filingType === FilingTypes.CORRECTION)
  }

  /** Returns True if task type is Name Incorporation Application. */
  isTypeIncorporationApplication (item: any): boolean {
    return (item.filingType === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** Returns True if task type is Name Request. */
  isTypeNameRequest (item: any): boolean {
    return (item.filingType === FilingTypes.NAME_REQUEST)
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
  // Conversion helpers
  //

  /**
   * Converts the entity type to a numbered corp description.
   * @param type the entity type to convert
   * @returns the numbered corp description
   */
  entityTypeToNumberedDescription (type: EntityTypes): string {
    switch (type) {
      case EntityTypes.BC_COMPANY: return 'Numbered Company'
      case EntityTypes.BC_CORPORATION: return 'Numbered Corporation'
      case EntityTypes.BC_ULC_COMPANY: return 'Numbered Unlimited Liability Company'
      case EntityTypes.BENEFIT_COMPANY: return 'Numbered Benefit Company'
      case EntityTypes.COOP: return 'Numbered Cooperative'
    }
    return '' // should never happen
  }

  /**
   * Converts the entity type to a corp description.
   * @param type the entity type to convert
   * @returns the corp description
   */
  entityTypeToDescription (type: EntityTypes): string {
    switch (type) {
      case EntityTypes.BC_COMPANY: return 'BC Company'
      case EntityTypes.BC_CORPORATION: return 'BC Corporation'
      case EntityTypes.BC_ULC_COMPANY: return 'BC Unlimited Liability Company'
      case EntityTypes.BENEFIT_COMPANY: return 'BC Benefit Company'
      case EntityTypes.COOP: return 'BC Cooperative'
    }
    return '' // should never happen
  }

  /**
   * Converts the entity status and type to a description.
   * @param status the entity status to convert
   * @param type the entity type to convert
   * @returns the description
   */
  entityStatusToDescription (status: EntityStatus, type: EntityTypes): string {
    switch (status) {
      case EntityStatus.NAME_REQUEST:
        return `${this.entityTypeToDescription(type)} Name Request`
      case EntityStatus.DRAFT_INCORP_APP:
      case EntityStatus.FILED_INCORP_APP:
        return `${this.entityTypeToDescription(type)} Incorporation Application`
    }
    return '' // should never happen
  }

  /**
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   */
  filingTypeToName (type: FilingTypes | string, agmYear: string = null): string {
    if (!type) return '' // safety check
    switch (type) {
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.CHANGE_OF_ADDRESS
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.CHANGE_OF_DIRECTORS
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.CHANGE_OF_NAME
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
      case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
      case FilingTypes.NAME_REQUEST: return FilingNames.NAME_REQUEST
      case FilingTypes.NOTICE_OF_ALTERATION: return FilingNames.NOTICE_OF_ALTERATION
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.VOLUNTARY_DISSOLUTION: return FilingNames.VOLUNTARY_DISSOLUTION
      case FilingTypes.TRANSITION_APPLICATION: return FilingNames.TRANSITION_APPLICATION
    }
    // fallback for unknown filings
    return type.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
  }
}
