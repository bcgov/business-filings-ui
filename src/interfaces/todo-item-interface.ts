import { FilingSubTypes, PaymentMethod } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { PaymentErrorIF } from '@/interfaces'

/**
 * A Todo List item (ie, local object).
 * See also ApiTaskIF.
 */
export interface TodoItemIF {
  draftTitle: string
  enabled: boolean
  filingId: number
  name: FilingTypes
  order: number
  status: string
  title: string
  comments?: Array<any> // always [] and never used
  isDefaultTask?: boolean // for generic fallback handling

  // Todo ARs and Draft IAs only
  subtitle?: string

  // filings only
  paymentMethod?: PaymentMethod
  paymentToken?: number
  payErrorObj?: PaymentErrorIF
  isPayCompleted?: boolean

  // ARs only
  ARFilingYear?: number // YYYY

  // COOP ARs only
  arMinDate?: string // YYYY-MM-DD
  arMaxDate?: string // YYYY-MM-DD

  // BCOMP ARs only
  nextArDate?: string // YYYY-MM-DD
  arDueDate?: string // eg, "Apr 9, 2021"

  // corrections only
  comment?: string
  correctedFilingId?: number
  correctedFilingType?: string

  // conversions only
  warnings?: Array<string>

  // IAs and registrations only
  isEmptyFiling?: boolean
  nameRequest?: any

  // alterations only
  legalType?: string
  isAlteringToBen?: boolean

  // dissolutions and restorations only
  filingSubType?: FilingSubTypes

  // affiliation invitations only
  affiliationInvitationDetails?: {
    id: number
    fromOrgName: string
    additionalMessage?: string
  }

  // continuation ins only
  submitter?: string
  submittedDate?: Date
  latestReviewComment?: string
}
