import { AmalgamationTypes, CorpTypeCd, EffectOfOrderTypes, FilingStatus, FilingSubTypes, FilingTypes } from '@/enums'
import { ApiDateTimeUtc, CommentIF, DocumentIF, FormattedDateTimeGmt, IsoDatePacific, SpecialResolutionIF }
  from '@/interfaces'

/**
 * A filing object from the Legal API ("filings" call).
 * See also History Item interface.
 */
export interface ApiFilingIF {
  availableOnPaperOnly: boolean
  businessIdentifier: string
  commentsCount: number
  commentsLink: string // URL to fetch this filing's comments
  displayName: string
  documentsLink: string // URL to fetch this filing's documents
  effectiveDate: FormattedDateTimeGmt
  filingId: number
  filingLink: string // URL to fetch this filing
  filingSubType: FilingSubTypes
  isFutureEffective: boolean
  name: FilingTypes
  status: FilingStatus
  submittedDate: FormattedDateTimeGmt
  submitter: string

  // correction filings only
  correctedFilingId?: string // ID of filing this filing corrects
  correctedLink?: string // URL to fetch filing this filing corrects

  // corrected filings only
  correctionFilingId?: string // ID of this filing's correction
  correctionLink?: string // URL to fetch this filing's correction

  // filing-specific data (not always present)
  data?: {
    applicationDate: ApiDateTimeUtc
    legalFilings: Array<string>

    // admin freeze filings only
    adminFreeze?: {
      freeze: boolean
    }

    agmExtension?: {
      year: string // YYYY-MM-DD
      isFirstAgm: boolean
      prevAgmRefDate: string // YYYY-MM-DD
      extReqForAgmYear: boolean
      expireDateCurrExt: string // YYYY-MM-DD
      intendedAgmDate: string // YYYY-MM-DD
      totalApprovedExt: number // in months
      extensionDuration: number // in months
      expireDateApprovedExt: string // YYYY-MM-DD
    }

    agmLocationChange?: {
      year: string
      reason: string
      agmLocation: string
    }

    // alteration filings only
    alteration?: {
      fromLegalType?: CorpTypeCd
      toLegalType?: CorpTypeCd
    }

    amalgamationApplication?: {
      type: AmalgamationTypes
    }

    // AR filings only
    annualReport?: {
      annualGeneralMeetingDate: IsoDatePacific
      annualReportDate: IsoDatePacific
      annualReportFilingYear?: number
    }

    // COA filings only
    changeOfAddress?: any // some object

    // COD filings only
    changeOfDirectors?: any // some object

    // consent to continuation out filings only
    consentContinuationOut?: {
      expiry: IsoDatePacific
      orderDetails: string
      foreignJurisdiction: {
        country: string
        region?: string
      }
    }

    // continuation out filings only
    continuationOut?: {
      continuationOutDate: IsoDatePacific
      courtOrder?: any
      details: string
      foreignJurisdiction: {
        country: string
        region?: string
      }
      legalName: string
    }

    // conversion filings only
    conversion?: any // some object

    // staff filings only
    order?: {
      effectOfOrder: EffectOfOrderTypes
      fileNumber: string
      orderDate?: string // FUTURE: use date type here
      orderDetails: string
    }

    // dissolution filings only
    dissolution?: {
      custodialOffice?: any // FUTURE: use a proper address type here
      dissolutionDate: IsoDatePacific
      dissolutionType: FilingSubTypes
    }

    // IA filings only
    incorporationApplication?: any // some object

    // registrar's notation filings only
    registrarsNotation?: any // some object

    // registrar's order filings only
    registrarsOrder?: any // some object

    // restorations filings only
    restoration?: {
      expiry: IsoDatePacific,
      toLegalName: string
    }

    // special resolution filings only
    specialResolution?: SpecialResolutionIF

    // transition filings only
    transition?: any // some object
  }

  // properties added by the UI
  comments?: Array<CommentIF>
  documents?: Array<DocumentIF>
}
