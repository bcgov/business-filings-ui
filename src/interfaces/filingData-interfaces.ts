import { FilingCodes, EntityTypes } from '@/enums'

export interface FilingData {
  filingTypeCode: FilingCodes
  entityType: EntityTypes
  waiveFees: boolean
  priority: boolean
  futureEffective?: boolean
}
