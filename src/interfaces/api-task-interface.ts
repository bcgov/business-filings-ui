import { AlterationIF, BusinessIF } from '@/interfaces'
import { FilingStatus, FilingTypes } from '@/enums'

/**
 * A list item from the API "tasks" call (ie, API object).
 * See also Todo Item interface.
 */
export interface ApiTaskIF {
  enabled: boolean
  order: number
  task: {
    // content is either a filing or a todo object
    filing?: TaskTodoIF
    todo?: TaskTodoIF
  }
}

/**
 * A task todo (or filing) object from the API.
 * Note that only `business` and `header` are required.
 */
export interface TaskTodoIF {
  annualReport?: any
  business: BusinessIF
  changeOfAddress?: any
  changeOfDirectors?: any
  correction?: any
  documents?: Array<any>
  header: ApiHeaderIF
  incorporationApplication?: any
  alteration?: AlterationIF
  registrarsNotation?: any
  registrarsOrder?: any
  courtOrder?: any
}

/** A filing's header object from the API. */
export interface ApiHeaderIF {
  accountId?: number // NOT USED
  ARFilingYear?: number // ARs only
  arMaxDate?: string // ARs only
  arMinDate?: string // ARs only
  availableOnPaperOnly?: boolean // non-tasks only
  certifiedBy: string // FUTURE: is this obsolete?
  comments: any[]
  date: string // submitted date
  effectiveDate: string // FUTURE: is this obsolete?
  email?: string // FUTURE: is this obsolete?
  filingId: number
  inColinOnly?: boolean // FUTURE: is this obsolete?
  isCorrected: boolean
  isCorrectionPending: boolean
  isFutureEffective: boolean // FUTURE: is this obsolete?
  name: FilingTypes
  paymentMethod?: any
  paymentStatusCode?: string
  paymentToken?: any // NB: may be UUID in future
  priority?: boolean // alterations and corrections only
  status: FilingStatus
  submitter: string // FUTURE: is this obsolete?
}
