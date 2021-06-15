import { FilingTypes } from '@/enums'

/** A Filing History List item. */
export interface HistoryItemIF {
  availableOnPaperOnly?: boolean
  displayName: string
  effectiveDate: Date
  filingId: number
  isFutureEffective: boolean
  name: FilingTypes
  status: string
  submittedDate: Date
  submitter: string

  commentsLink?: string // URL to fetch this filing's comments
  correctedLink?: string // URL to fetch this corrections's original filing (corrections only)
  correctionLink?: string // URL to fetch this filing's correction
  documentsLink?: string // URL to fetch this filing's documents
  filingLink?: string // URL to fetch this filing

  comments?: Array<any> // NB: undefined until loaded
  documents?: Array<any> // NB: undefined until loaded

  receipt?: any // receipt meta (for adding to documents)

  // IAs only
  isCompletedIa?: boolean
  isFutureEffectiveIa?: boolean
  isFutureEffectiveIaPending?: boolean

  // BCOMP COAs only
  isFutureEffectiveBcompCoaPending?: boolean

  // alterations only
  courtOrderNumber?: string
  isArrangement?: boolean
  isFutureEffectiveAlteration?: boolean
  isFutureEffectiveAlterationPending?: boolean
  newLegalType?: string
  oldLegalType?: string

  // staff filings only
  fileNumber?: string
  isTypeStaff?: boolean
  notationOrOrder?: string
  planOfArrangement?: string
}
