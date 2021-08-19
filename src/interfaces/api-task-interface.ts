import { AlterationIF, BusinessIF, ApiHeaderIF } from '@/interfaces'

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
