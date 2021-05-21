import { CorpTypeCd, FilingStatus, FilingTypes, EntityStatus } from '@/enums'

export default {
  /** The current year. */
  currentYear (state): number {
    return state.currentDate ? +state.currentDate.substring(0, 4) : 0
  },

  /** Is True if there is any pending tasks. */
  hasBlockerTask (state): boolean {
    return state.hasBlockerTask
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state): boolean {
    return (state.entityType === CorpTypeCd.BENEFIT_COMPANY)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state): boolean {
    return (state.entityType === CorpTypeCd.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state): boolean {
    return (state.entityType === CorpTypeCd.BC_CORPORATION)
  },

  /** Is True if entity is a BC Company. */
  isBcCompany (state): boolean {
    return (state.entityType === CorpTypeCd.BC_COMPANY)
  },

  /** Is True if entity is a BC ULC Company. */
  isUlc (state): boolean {
    return (state.entityType === CorpTypeCd.BC_ULC_COMPANY)
  },

  /** Is True if Staff role is set. */
  isRoleStaff (state): boolean {
    return state.keycloakRoles.includes('staff')
  },

  /** Is True if Edit role is set. */
  isRoleEdit (state): boolean {
    return state.authRoles.includes('edit')
  },

  /** Is True if View role is set. */
  isRoleView (state): boolean {
    return state.authRoles.includes('view')
  },

  /** Returns whether business is in good standing. */
  isInGoodStanding (state): boolean {
    return state.entityStatus === EntityStatus.GOOD_STANDING
  },

  nrNumber (state): string {
    // workaround for old or new property name
    return state.nameRequest?.nrNum || state.nameRequest?.nrNumber
  },

  isCurrentFilingEditable (state): boolean {
    return (state.currentFilingStatus === FilingStatus.NEW || state.currentFilingStatus === FilingStatus.DRAFT)
  },

  reportState (state): string {
    switch (state.currentFilingStatus) {
      case FilingStatus.NEW: return ''
      case FilingStatus.DRAFT: return 'Draft'
    }
    return state.currentFilingStatus
  },

  /** Returns date of last Change of Directors filing from list of past filings. */
  // FUTURE: this will break if we only retrieve a page of filings
  // FUTURE: the API should be giving us this date
  lastCODFilingDate (state): string {
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
  lastCOAFilingDate (state): string {
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
  lastFilingDate (state): string {
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
  isBusinessWithNoMaintenanceFilings (state): boolean {
    return (
      state.filings.length === 1 &&
      state.filings[0].filing.header.name === 'incorporationApplication' &&
      state.tasks.length === 0
    )
  },

  /** The Entity Number */
  entityIncNo (state): string {
    return state.entityIncNo
  }
}
