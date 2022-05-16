import { EntityState, CorpTypeCd } from '@/enums'
import { IsoDatePacific, ApiDateTimeUtc } from '@bcrs-shared-components/interfaces'

/** The Compliance Warning object. */
export interface ComplianceWarning {
  code: string // FUTURE: use an enum
  message: string
  filing: string
}

/** The Business object from the API. */
export interface BusinessIF {
  adminFreeze: boolean
  arMaxDate: IsoDatePacific // not used
  arMinDate: IsoDatePacific // not used
  dissolutionDate: ApiDateTimeUtc // not used
  complianceWarnings?: Array<ComplianceWarning>
  fiscalYearEndDate: IsoDatePacific // not used
  foundingDate: ApiDateTimeUtc
  goodStanding: boolean
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
  taxId?: string // aka Business Number // may be undefined
  state: EntityState
  stateFiling?: string
  submitter: string // not used
}
