import { CorpTypeCd, EntityState, FilingSubTypes, WarningTypes } from '@/enums'
import { AmalgamationTypes, FilingTypes } from '@bcrs-shared-components/enums'
import { AlternateNameIF, ApiDateTimeUtc, IsoDatePacific } from '@bcrs-shared-components/interfaces'

export interface FilingTypeIF {
  displayName: string
  feeCode: string
  name: FilingTypes
  type?: FilingSubTypes
}

export interface AllowedActionsIF {
  digitalBusinessCard: boolean
  digitalBusinessCardPreconditions?: {
    attestRoles: string[]
  }
  filing: {
    filingSubmissionLink: string
    filingTypes: Array<FilingTypeIF>
  }
}

export interface AmalgamatedIntoIF {
  amalgamationDate: ApiDateTimeUtc
  amalgamationType: AmalgamationTypes
  identifier: string // eg, BC7654321
  legalName: string
}

export interface BusinessWarningIF {
  code: string // FUTURE: use an enum
  filing?: string // not used
  message: string
  warningType: WarningTypes
  data?: any // optional extra properties (eg, amalgamationDate)
}

/** The Business object from the Legal API. */
// FUTURE: verify/indicate unused properties
export interface ApiBusinessIF {
  adminFreeze: boolean
  allowedActions: AllowedActionsIF
  alternateNames?: Array<AlternateNameIF>
  amalgamatedInto?: AmalgamatedIntoIF
  arMaxDate: IsoDatePacific // COOP only
  arMinDate: IsoDatePacific // COOP only
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
  nextAnnualReport: ApiDateTimeUtc // BEN/BC/CC/ULC and CBEN/C/CCC/CUL only
  state: EntityState
  stateFiling: string // the state filing URL
  startDate: ApiDateTimeUtc
  submitter?: string // not used
  taxId?: string // aka Business Number // may be absent
  warnings: Array<BusinessWarningIF>
}

/** The state model interface for the Business Store. */
export interface BusinessStateIF {
  businessInfo: ApiBusinessIF
}
