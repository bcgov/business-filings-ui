import { CorpTypeCd } from '@/enums'
import { FilingCodes } from '@bcrs-shared-components/enums'
import { BusinessConfigBc } from './BC'
import { BusinessConfigBen } from './BEN'
import { BusinessConfigC } from './C'
import { BusinessConfigCben } from './CBEN'
import { BusinessConfigCc } from './CC'
import { BusinessConfigCcc } from './CCC'
import { BusinessConfigCp } from './CP'
import { BusinessConfigCul } from './CUL'
import { BusinessConfigGp } from './GP'
import { BusinessConfigSp } from './SP'
import { BusinessConfigUlc } from './ULC'

export class Flow {
  feeCode: FilingCodes
  displayName: string
  certifyText: string
}

export class Business {
  entityType: CorpTypeCd
  displayName: string
  flows: Array<Flow>
}

export const ConfigJson = [
  BusinessConfigBc,
  BusinessConfigBen,
  BusinessConfigC,
  BusinessConfigCben,
  BusinessConfigCc,
  BusinessConfigCcc,
  BusinessConfigCp,
  BusinessConfigCul,
  BusinessConfigGp,
  BusinessConfigSp,
  BusinessConfigUlc
]
