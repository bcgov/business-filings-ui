import { EntityTypes, FilingStatus, FilingTypes } from '@/enums'

export default {
  /** Get the Current Date */
  getCurrentDate (state): string {
    return state.currentDate
  },

  /** Get Entity Incorporation Number */
  getEntityIncNo (state): string {
    return state.entityIncNo
  },

  /** Is True if entity is a Benefit Company. */
  isBComp (state): boolean {
    return (state.entityType === EntityTypes.BENEFIT_COMPANY)
  },

  /** Is True if entity is a Cooperative. */
  isCoop (state): boolean {
    return (state.entityType === EntityTypes.COOP)
  },

  /** Is True if entity is a BC Corporation. */
  isCorp (state): boolean {
    return (state.entityType === EntityTypes.BC_CORPORATION)
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

  nrNumber (state): string {
    // workaround for old or new property name
    return state.nameRequest?.nrNum || state.nameRequest?.nrNumber
  },

  isAnnualReportEditable (state): boolean {
    return (state.currentFilingStatus === FilingStatus.NEW || state.currentFilingStatus === FilingStatus.DRAFT)
  },

  reportState (state): string {
    switch (state.currentFilingStatus) {
      case FilingStatus.NEW: return ''
      case FilingStatus.DRAFT: return 'Draft'
    }
    return state.currentFilingStatus
  },

  // get last Change of Directors filing from list of past filings
  lastCODFilingDate (state): string {
    let lastCOD: string = null

    for (let i = 0; i < state.filings.length; i++) {
      let filing = state.filings[i].filing
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

  // get last Change of Address filing from list of past filings
  lastCOAFilingDate (state): string {
    let lastCOA: string = null

    for (let i = 0; i < state.filings.length; i++) {
      let filing = state.filings[i].filing
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

  // get last filing (of any type) from list of past filings
  lastFilingDate (state): string {
    let lastFilingDate: string = null

    for (let i = 0; i < state.filings.length; i++) {
      let filing = state.filings[i].filing
      let filingDate = filing.header.effectiveDate || filing.header.date
      filingDate = filingDate.slice(0, 10)
      if (lastFilingDate === null || filingDate.split('-').join('') > lastFilingDate.split('-').join('')) {
        lastFilingDate = filingDate
      }
    }
    return lastFilingDate
  },

  // To show Legal Obligations only for a new business that hasn't filed anything else yet and has no tasks
  isBusinessWithNoMaintenanceFilings (state): boolean {
    if (state.filings && state.filings.length === 1 &&
      state.filings[0].filing.header.name === 'incorporationApplication' &&
      state.tasks.length === 0) {
      return true
    } else {
      return false
    }
  }
}
