import { CorpTypeCd, DissolutionTypes, EffectOfOrderTypes, FilingStatus, FilingTypes } from '@/enums'
import { ApiDateTimeUtc, ChangeOfNameIF, FormattedDateTimeGmt, IsoDatePacific, SpecialResolutionIF } from '@/interfaces'

/**
 * A list item from the API "filings" call (ie, API object).
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

  // filing-specific data
  data: {
    applicationDate: ApiDateTimeUtc
    legalFilings: Array<string>

    // alteration filings only
    alteration?: {
      fromLegalType?: CorpTypeCd
      toLegalType?: CorpTypeCd
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

    changeOfName?: ChangeOfNameIF

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
      dissolutionType: DissolutionTypes
    }

    // IA filings only
    incorporationApplication?: any // some object

    // registrar's notation filings only
    registrarsNotation?: any // some object

    // registrar's order filings only
    registrarsOrder?: any // some object

    // special resolution filings only
    specialResolution?: SpecialResolutionIF

    // transition filings only
    transition?: any // some object
  }
}
