import { FilingCodes, EntityTypes } from '@/enums'

export interface FilingDataIF {
  filingTypeCode: FilingCodes;
  entityType: EntityTypes;
  waiveFees: boolean;
  priority: boolean;
  futureEffective?: boolean;
}
