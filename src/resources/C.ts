import { CorpTypeCd } from '@/enums'
import { BusinessConfigBc } from './BC'

// FUTURE: this object needs an interface or type
export const BusinessConfigC = {
  ...BusinessConfigBc,
  entityType: CorpTypeCd.CONTINUE_IN
}
