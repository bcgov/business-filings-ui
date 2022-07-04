import { FilingTypes, PaymentMethod, CorrectionTypes } from '@/enums'
import { PaymentErrorIF } from '@/interfaces'

/**
 * A Todo List item (ie, local object).
 * See also Api Task interface.
 */
export interface TodoItemIF {
  draftTitle: string
  enabled: boolean
  filingId: number
  name: FilingTypes
  order: number
  status: string
  title: string
  commentsLink: string

  // Todo ARs and Draft IAs only
  subtitle?: string

  // filings only
  paymentMethod?: PaymentMethod
  paymentToken?: number
  payErrorObj?: PaymentErrorIF

  // alterations and corrections only
  comments?: Array<any>

  // ARs only
  ARFilingYear?: number // YYYY

  // COOP ARs only
  arMinDate?: string // YYYY-MM-DD
  arMaxDate?: string // YYYY-MM-DD

  // BCOMP ARs only
  nextArDate?: string // YYYY-MM-DD
  arDueDate?: string // eg, "Apr 9, 2021"

  // corrections only
  correctedFilingId?: number
  correctedFilingType?: string
  type?: CorrectionTypes

  // IAs only
  isEmptyFiling?: boolean
  nameRequest?: any

  // alterations only
  legalType?: string
  goodStanding?: boolean
}
