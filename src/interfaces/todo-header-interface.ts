import { FilingStatus } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'

/** A todo's header object from the API, ie, `todo.header`. */
export interface TodoHeaderIF {
  ARFilingYear: number // eg, 2021
  arMaxDate: string // eg, "2021-09-02"
  arMinDate: string // eg, "2021-01-01"
  name: FilingTypes
  status: FilingStatus // ie, "NEW"
}
