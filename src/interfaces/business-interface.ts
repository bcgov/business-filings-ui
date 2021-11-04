import { CorpTypeCd } from '@/enums'

/** YYYY-MM-DD in Pacific timezone. */
type isoDatePacific = string

/** YYYY-MM-DDTHH:MM:SS[.MMMMMM]+00.00 in UTC. */
type apiDateTimeUtc = string

/** The Business object from the API. */
export interface BusinessIF {
  arMaxDate: isoDatePacific // not used
  arMinDate: isoDatePacific // not used
  dissolutionDate?: apiDateTimeUtc // may be undefined
  fiscalYearEndDate: isoDatePacific // not used
  foundingDate: apiDateTimeUtc
  goodStanding: boolean
  hasRestrictions: boolean
  identifier: string
  lastAddressChangeDate: isoDatePacific
  lastAnnualGeneralMeetingDate: isoDatePacific // not used
  lastAnnualReportDate: isoDatePacific
  lastDirectorChangeDate: isoDatePacific
  lastLedgerTimestamp: apiDateTimeUtc // not used
  lastModified: apiDateTimeUtc // not used
  legalName: string
  legalType: CorpTypeCd
  nextAnnualReport: apiDateTimeUtc // used for BCOMP only
  taxId?: string // may be undefined
}
