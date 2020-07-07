import { Component, Vue } from 'vue-property-decorator'
import { LegalTypes, LegalNames, FilingNames, FilingStatus, FilingTypes } from '@/enums'

/**
 * Mixin that provides some useful enum-related utilities.
 */
@Component({})
export default class EnumMixin extends Vue {
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

  /**
   * Converts the legal type to a numbered legal name.
   * @param type the legal type to convert
   */
  legalTypeToNumberedName (type: LegalTypes): string {
    switch (type) {
      case LegalTypes.BC_CORPORATION: return 'Numbered Corporation'
      case LegalTypes.BENEFIT_COMPANY: return 'Numbered Benefit Company'
      case LegalTypes.COOP: return 'Numbered Cooperative'
    }
    return 'Unknown' // should never happen
  }

  /**
   * Converts the legal type to a legal name.
   * @param type the legal type to convert
   */
  legalTypeToName (type: LegalTypes): string {
    switch (type) {
      case LegalTypes.BC_COMPANY: return LegalNames.BC_COMPANY
      case LegalTypes.BC_CORPORATION: return LegalNames.BC_CORPORATION
      case LegalTypes.BC_ULC_COMPANY: return LegalNames.BC_ULC_COMPANY
      case LegalTypes.BENEFIT_COMPANY: return LegalNames.BENEFIT_COMPANY
      case LegalTypes.COOP: return LegalNames.COOP
    }
    return 'Unknown' // should never happen
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
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.DIRECTOR_CHANGE
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.ADDRESS_CHANGE
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.LEGAL_NAME_CHANGE
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
      case FilingTypes.NAME_REQUEST: return FilingNames.NAME_REQUEST
      case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.VOLUNTARY_DISSOLUTION: return FilingNames.VOLUNTARY_DISSOLUTION
      case FilingTypes.NOTICE_OF_ALTERATION: return FilingNames.ALTERATION_NOTICE
    }
    // fallback for unknown filings
    return type.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
  }
}
