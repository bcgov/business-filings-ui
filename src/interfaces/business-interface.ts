import { EntityState, CorpTypeCd } from '@/enums'
import { IsoDatePacific, ApiDateTimeUtc } from '@bcrs-shared-components/interfaces'

/** The Allowable Action object from the Legal API. */
export interface AllowableActionIF {
  filing: {
    filingSubmissionLink: string
    filingTypes: [{
      displayName: string
      feeCode: string
      name: string
    }]
  }
}

/** The Business Warning object from the Legal API. */
export interface BusinessWarningIF {
  code: string // FUTURE: use an enum
  filing?: string // not used
  message: string
  warningType: string // FUTURE: use an enum
}

/** The Business object from the Legal API. */
// FUTURE: verify/indicate unused properties
export interface BusinessIF {
  adminFreeze: boolean
  allowableActions: Array<AllowableActionIF>
  arMaxDate?: IsoDatePacific // not used
  arMinDate?: IsoDatePacific // not used
  associationType: string // COOP only
  complianceWarnings?: Array<any> // not used
  dissolutionDate?: IsoDatePacific // not used
  fiscalYearEndDate?: IsoDatePacific // not used
  foundingDate: ApiDateTimeUtc
  goodStanding: boolean
  hasCorrections: boolean
  hasCourtOrders: boolean
  hasRestrictions: boolean
  identifier: string // eg, BC1234567
  lastAddressChangeDate: IsoDatePacific
  lastAnnualGeneralMeetingDate?: IsoDatePacific // not used
  lastAnnualReportDate: IsoDatePacific
  lastDirectorChangeDate: IsoDatePacific
  lastLedgerTimestamp?: ApiDateTimeUtc // not used
  lastModified?: ApiDateTimeUtc // not used
  legalName: string
  legalType: CorpTypeCd
  naicsCode: string // firm only
  naicsDescription: string // firm only
  naicsKey: string // firm only
  nextAnnualReport: ApiDateTimeUtc // BCOMP only
  state: EntityState
  stateFiling: string // the state filing URL
  submitter?: string // not used
  taxId?: string // aka Business Number // may be absent
  warnings: Array<BusinessWarningIF>
}
