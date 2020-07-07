import { LegalTypes } from '@/enums'

export interface AlterCorpTypeIF {
  corpType: LegalTypes;
  [propName: string]: any; // excess properties
}

export interface AlterCorpNameIF {
  legalName: string;
  nrNumber: string;
  [propName: string]: any; // excess properties
}

export interface AlterNameTranslationsIF {
  modifiedTranslations: Array<any>;
  ceasedTranslations: Array<string>;
  [propName: string]: any; // excess properties
}

export interface AlterShareStructureIF {
  resolutionDates: Array<string>;
  shareClasses: Array<any>;
  [propName: string]: any; // excess properties
}

/** A filing's alteration object from the API. */
export interface AlterationIF {
  provisionsRemoved?: boolean;
  alterCorpType?: AlterCorpTypeIF
  alterCorpName?: AlterCorpNameIF
  alterNameTranslations?: AlterNameTranslationsIF
  alterShareStructure?: AlterShareStructureIF
}
