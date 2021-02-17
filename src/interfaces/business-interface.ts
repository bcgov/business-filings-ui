import { CorpTypeCd } from '@/enums'

/** A filing's business object from the API. */
export interface BusinessIF {
  identifier: string
  legalName: string
  legalType?: CorpTypeCd
  [propName: string]: any // excess properties
}
