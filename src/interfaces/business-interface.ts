import { FilingTypes } from '@/enums'

/** A filing's business object from the API. */
export interface BusinessIF {
  identifier: string,
  legalName: string,
  legalType?: FilingTypes,
  [propName: string]: any; // excess properties
}
