import { FilingCodes, LegalTypes } from '@/enums'

/** Filing data object passed to the SBC Fee Summary. */
export interface FilingDataIF {
  filingTypeCode: FilingCodes;
  entityType: LegalTypes;
  waiveFees: boolean;
  priority: boolean;
  futureEffective?: boolean;
}
