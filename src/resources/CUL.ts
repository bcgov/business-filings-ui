import { CorpTypeCd } from '@/enums'
import { BusinessConfigUlc } from './ULC'

// FUTURE: this object needs an interface or type
export const BusinessConfigCul = {
  ...BusinessConfigUlc,
  entityType: CorpTypeCd.ULC_CONTINUE_IN
}
