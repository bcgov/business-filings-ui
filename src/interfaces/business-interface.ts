import { EntityState, CorpTypeCd } from '@/enums'
import { IsoDatePacific, ApiDateTimeUtc } from '@bcrs-shared-components/interfaces'

/** The Business Warning object. */
export interface BusinessWarningIF {
  code: string // FUTURE: use an enum
  filing?: string // not used
  message: string
  warningType: string // FUTURE: use an enum
}

/** The Business object from the API. */
export interface BusinessIF {
  adminFreeze: boolean
  arMaxDate: IsoDatePacific // not used
  arMinDate: IsoDatePacific // not used
  dissolutionDate: IsoDatePacific // not used
  fiscalYearEndDate: IsoDatePacific // not used
  foundingDate: ApiDateTimeUtc
  goodStanding: boolean
  hasCourtOrders: boolean
  hasRestrictions: boolean // FUTURE: is this obsolete???
  identifier: string
  lastAddressChangeDate: IsoDatePacific
  lastAnnualGeneralMeetingDate: IsoDatePacific // not used
  lastAnnualReportDate: IsoDatePacific
  lastDirectorChangeDate: IsoDatePacific
  lastLedgerTimestamp: ApiDateTimeUtc // not used
  lastModified: ApiDateTimeUtc // not used
  legalName: string
  legalType: CorpTypeCd
  nextAnnualReport: ApiDateTimeUtc // used for BCOMP only
  startDate: IsoDatePacific // not used
  state: EntityState
  stateFiling?: string
  submitter: string // not used
  taxId?: string // aka Business Number // may be undefined
  warnings?: Array<BusinessWarningIF>
}
