import { CorpTypeCd, FilingStatus, FilingTypes, EntityStatus } from '@/enums'
import { StateIF } from '@/interfaces'

export default {
  /** The current year. */
  currentYear (state: StateIF): number {
    return state.currentDate ? +state.currentDate.substring(0, 4) : 0
  },

  /** Is True if there are any pending tasks or filings. */
  hasBlocker (state: StateIF): boolean {
    return (state.hasBlockerTask || state.hasBlockerFiling || state.isCoaPending)
  },

  /** Is True if a COA filing is pending. */
  isCoaPending (state: StateIF): boolean {
    return state.isCoaPending
  },

  /** The COA effective date (if a COA is pending). */
  coaEffectiveDate (state: StateIF): string {
    return state.coaEffectiveDate
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BENEFIT_COMPANY)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_CORPORATION)
  },

  /** Is True if entity is a BC Company. */
  isBcCompany (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_COMPANY)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (state: StateIF): boolean {
    return (state.entityType === CorpTypeCd.BC_ULC_COMPANY)
  },

  /** Is True if Staff role is set. */
  isRoleStaff (state: StateIF): boolean {
    return state.keycloakRoles.includes('staff')
  },

  /** Is True if Edit role is set. */
  isRoleEdit (state: StateIF): boolean {
    return state.authRoles.includes('edit')
  },

  /** Is True if View role is set. */
  isRoleView (state: StateIF): boolean {
    return state.authRoles.includes('view')
  },

  /** Returns whether business is in good standing. */
  isInGoodStanding (state: StateIF): boolean {
    return state.entityStatus === EntityStatus.GOOD_STANDING
  },

  nrNumber (state: StateIF): string {
    // workaround for old or new property name
    return state.nameRequest?.nrNum || state.nameRequest?.nrNumber
  },

  isCurrentFilingEditable (state: StateIF): boolean {
    return (state.currentFilingStatus === FilingStatus.NEW || state.currentFilingStatus === FilingStatus.DRAFT)
  },

  reportState (state: StateIF): string {
    switch (state.currentFilingStatus) {
      case FilingStatus.NEW: return ''
      case FilingStatus.DRAFT: return 'Draft'
    }
    return state.currentFilingStatus
  },

  /** Returns date of last Change of Directors filing from list of past filings. */
  // FUTURE: this will break if we only retrieve a page of filings
  // FUTURE: the API should be giving us this date
  lastCODFilingDate (state: StateIF): string {
    let lastCOD: string = null

    for (let i = 0; i < state.filings.length; i++) {
      let filing = state.filings[i].filing
      // NB: these dates are UTC
      let filingDate = filing.header.effectiveDate || filing.header.date
      filingDate = filingDate.slice(0, 10)
      if (filing.hasOwnProperty(FilingTypes.CHANGE_OF_DIRECTORS)) {
        if (lastCOD === null || filingDate.split('-').join('') > lastCOD.split('-').join('')) {
          lastCOD = filingDate
        }
      }
    }
    return lastCOD
  },

  /** Returns date of last Change of Address filing from list of past filings. */
  // FUTURE: this will break if we only retrieve a page of filings
  // FUTURE: the API should be giving us this date
  lastCOAFilingDate (state: StateIF): string {
    let lastCOA: string = null

    for (let i = 0; i < state.filings.length; i++) {
      let filing = state.filings[i].filing
      // NB: these dates are UTC
      let filingDate = filing.header.effectiveDate || filing.header.date
      filingDate = filingDate.slice(0, 10)
      if (filing.hasOwnProperty(FilingTypes.CHANGE_OF_ADDRESS)) {
        if (lastCOA === null || filingDate.split('-').join('') > lastCOA.split('-').join('')) {
          lastCOA = filingDate
        }
      }
    }
    return lastCOA
  },

  /** Returns date of last filing (of any type) from list of past filings. */
  // FUTURE: this will break if we only retrieve a page of filings
  // FUTURE: the API should be giving us this date
  lastFilingDate (state: StateIF): string {
    let lastFilingDate: string = null

    for (let i = 0; i < state.filings.length; i++) {
      let filing = state.filings[i].filing
      // NB: these dates are UTC
      let filingDate = filing.header.effectiveDate || filing.header.date
      filingDate = filingDate.slice(0, 10)
      if (lastFilingDate === null || filingDate.split('-').join('') > lastFilingDate.split('-').join('')) {
        lastFilingDate = filingDate
      }
    }
    return lastFilingDate
  },

  /**
   * This is used to show Legal Obligations only for a new business
   * that hasn't filed anything yet (except IA) and has no tasks.
   **/
  isBusinessWithNoMaintenanceFilings (state: StateIF): boolean {
    return (
      state.filings.length === 1 &&
      state.filings[0].filing.header.name === 'incorporationApplication' &&
      state.tasks.length === 0
    )
  },

  /** The Entity Number */
  entityIncNo (state: StateIF): string {
    return state.entityIncNo
  }
}
