import { EntityTypes } from '@/enums'

/** A filing's alteration object from the API. */
export interface AlterationIF {
  alterCorpType?: {
    corpType: EntityTypes;
  }
  alterResolutions?: any;
  alterCorpName?: any;
  alterNameTranslation?: any;
  alterShareStructure?: any;
}
