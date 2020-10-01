import { EntityTypes, FilingCodes } from '@/enums'

/** Filing data object passed to the SBC Fee Summary. */
export interface FilingDataIF {
  filingTypeCode: FilingCodes;
  entityType: EntityTypes;
  waiveFees: boolean;
  priority: boolean;
  futureEffective?: boolean;
}
