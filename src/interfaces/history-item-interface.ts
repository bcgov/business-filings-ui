import { CorpTypeCd, FilingTypes } from '@/enums'
import { CommentIF, DocumentIF, IsoDatePacific } from '@/interfaces'

/**
 * A Filing History List item (ie, local object).
 * See also Api Filing interface.
 */
export interface HistoryItemIF {
  availableOnPaperOnly: boolean
  commentsCount: number
  displayName: string
  effectiveDate: Date
  filingId: number
  isFutureEffective: boolean
  name: FilingTypes
  status: string
  submittedDate: Date
  submitter: string

  commentsLink: string // URL to fetch this filing's comments
  documentsLink: string // URL to fetch this filing's documents
  filingLink: string // URL to fetch this filing

  comments: Array<CommentIF>
  documents: Array<DocumentIF>

  // correction filings only
  correctedFilingId?: string // ID of filing this filing corrects
  correctedLink?: string // URL to fetch filing this filing corrects

  // corrected filings only
  correctionFilingId?: string // ID of this filing's correction
  correctionLink?: string // URL to fetch this filing's correction

  // IAs only
  isCompletedIa?: boolean
  isFutureEffectiveIa?: boolean
  isFutureEffectiveIaPending?: boolean

  // registrations only
  isCompletedRegistration?: boolean

  // BEN/BC/CCC/ULC COAs only
  isFutureEffectiveCoaPending?: boolean

  // alterations only
  courtOrderNumber?: string
  isArrangement?: boolean
  isCompletedAlteration?: boolean
  isFutureEffectiveAlteration?: boolean
  isFutureEffectiveAlterationPending?: boolean
  toLegalType?: CorpTypeCd
  fromLegalType?: CorpTypeCd

  // dissolutions only
  dissolutionDate?: IsoDatePacific
  isCompletedDissolution?: boolean
  isFutureEffectiveDissolution?: boolean
  isFutureEffectiveDissolutionPending?: boolean

  // staff filings only
  fileNumber?: string
  isTypeStaff?: boolean
  details?: string // also used for consent to continuation out
  planOfArrangement?: string
  putBackOnOrAdminDissolution?: boolean

  // limited restorations only
  isTypeLimitedRestoration?: boolean
  isTypeLimitedRestorationExtension?: boolean
  expiry?: string // also used for consent to continuation out
  legalName?: string
}
