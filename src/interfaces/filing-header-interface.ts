import { FilingStatus } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'

/** A filing's header object from the API, ie, `filing.header`. */
export interface FilingHeaderIF {
  ARFilingYear?: number // ARs only
  arMaxDate?: string // ARs only
  arMinDate?: string // ARs only
  availableInColinOnly?: boolean // replaced by inColinOnly
  availableOnPaperOnly?: boolean // non-tasks only
  certifiedBy: string
  colinIds: any[]
  comments: any[]
  date: string
  effectiveDate: string
  email: string
  filingId: number
  inColinOnly?: boolean // replaces availableInColinOnly
  isCorrected: boolean
  isCorrectionPending: boolean
  isFutureEffective?: boolean
  name: FilingTypes
  paymentMethod: string
  paymentStatusCode: string
  paymentToken: string
  priority?: boolean // alterations and corrections only
  status: FilingStatus
  submitter: string
}
