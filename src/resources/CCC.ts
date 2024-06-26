import { CorpTypeCd } from '@/enums'
import { BusinessConfigCc } from './CC'

// FUTURE: this object needs an interface or type
export const BusinessConfigCcc = {
  ...BusinessConfigCc,
  entityType: CorpTypeCd.CCC_CONTINUE_IN
}
