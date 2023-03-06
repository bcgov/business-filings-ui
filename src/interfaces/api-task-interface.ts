import { AlterationIF, ApiBusinessIF, RestorationIF, SpecialResolutionIF } from '@/interfaces'
import { FilingStatus, FilingTypes } from '@/enums'

/** A filing's header object from the Legal API. */
export interface ApiHeaderIF {
  accountId?: number // NOT USED
  ARFilingYear?: number // ARs only
  arMaxDate?: string // ARs only
  arMinDate?: string // ARs only
  availableOnPaperOnly?: boolean // non-tasks only
  certifiedBy: string // FUTURE: is this obsolete?
  comments: any[]
  commentsCount: number
  commentsLink: string
  date: string // submitted date
  documentsLink: string
  effectiveDate: string // FUTURE: is this obsolete?
  email?: string // FUTURE: is this obsolete?
  filingId: number
  filingLink: string
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

/**
 * A task todo (or filing) object.
 * Note that only `business` and `header` are required.
 */
export interface TaskTodoIF {
  annualReport?: any
  business: ApiBusinessIF
  changeOfAddress?: any
  changeOfDirectors?: any
  correction?: any
  dissolution?: any
  documents?: Array<any>
  header: ApiHeaderIF
  incorporationApplication?: any
  alteration?: AlterationIF
  registrarsNotation?: any
  registrarsOrder?: any
  courtOrder?: any
  registration?: any
  changeOfRegistration?: any
  conversion?: any
  specialResolution?: SpecialResolutionIF
  restoration?: RestorationIF
}

/**
 * A task object from the Legal API ("tasks" call).
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
