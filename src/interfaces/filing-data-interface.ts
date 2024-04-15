import { CorpTypeCd } from '@/enums'
import { FilingCodes } from '@bcrs-shared-components/enums'

/** Filing data object passed to the SBC Fee Summary. */
export interface FilingDataIF {
  filingTypeCode: FilingCodes
  entityType: CorpTypeCd
  waiveFees: boolean
  priority: boolean
  futureEffective?: boolean
}
