import { AlterationIF, AmalgamationApplicationIF,
  ApiBusinessIF, RestorationIF, SpecialResolutionIF } from '@/interfaces'
import { FilingStatus } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'

/**
 * The header object from the Legal API when the filing contains separate business /
 * documents / header / filing objects. This is the older response from the "filings"
 * call but is still used for fetching draft apps or tasks.
 */
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
 * The object for a draft application (or registration or amalgamation) filing or todo task.
 * Note that only `business` and `header` are required.
 */
export interface TaskTodoIF {
  agmExtension?: any
  agmLocationChange?: any
  alteration?: AlterationIF
  amalgamationApplication?: AmalgamationApplicationIF
  annualReport?: any
  business: ApiBusinessIF
  changeOfAddress?: any
  changeOfDirectors?: any
  changeOfRegistration?: any
  consentContinuationOut?: any
  continuationIn?:any
  continuationOut?: any
  conversion?: any
  correction?: any
  courtOrder?: any
  displayName?: string // for app tasks only
  dissolution?: any
  documents?: Array<any>
  header: ApiHeaderIF
  incorporationApplication?: any
  registrarsNotation?: any
  registrarsOrder?: any
  registration?: any
  restoration?: RestorationIF
  specialResolution?: SpecialResolutionIF
}

/**
 * A task object from the Legal API ("tasks" call), which contains a draft filing or a todo item.
 * See also TodoItemIF.
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
