import { Component, Vue } from 'vue-property-decorator'
import { EntityNames, EntityTypes, FilingNames, FilingStatus, FilingTypes } from '@/enums'

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
   * Converts the entity type to an entity name.
   * @param type the entity type to convert
   */
  entityTypeToName (type: EntityTypes): string {
    switch (type) {
      case EntityTypes.COOP: return EntityNames.COOP
      case EntityTypes.BCOMP: return EntityNames.BCOMP
      case EntityTypes.CORP: return EntityNames.CORP
    }
    return null // should never happen
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
    }
    // fallback for unknown filings
    return type.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
  }
}
