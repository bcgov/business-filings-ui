import { FilingStatus, FilingTypes } from '@/enums'

/** A filing's header object from the API. */
export interface ApiHeaderIF {
  ARFilingYear?: number // ARs only
  arMaxDate?: string // ARs only
  arMinDate?: string // ARs only
  availableOnPaperOnly?: boolean // non-tasks only
  certifiedBy: string // *** TODO: remove if obsolete
  comments: any[] // *** TODO: remove if obsolete
  date: string
  effectiveDate: string // *** TODO: remove if obsolete
  email: string // *** TODO: remove if obsolete
  filingId: number
  isFutureEffective: boolean // *** TODO: remove if obsolete
  name: FilingTypes
  paymentMethod: any
  paymentStatusCode: string
  paymentToken: any // NB: may be UUID in future
  priority?: boolean // alterations and corrections only
  status: FilingStatus
  submitter: string // *** TODO: remove if obsolete
}
