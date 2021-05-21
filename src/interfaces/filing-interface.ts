import { AlterationIF, BusinessIF, HeaderIF } from '@/interfaces'

/** A filing item (task or filing) from the API. */
export interface FilingIF {
  annualReport?: any;
  business: BusinessIF;
  changeOfAddress?: any;
  changeOfDirectors?: any;
  correction?: any;
  documents?: Array<any>;
  header: HeaderIF,
  incorporationApplication?: any;
  alteration?: AlterationIF;
  registrarsNotation?: any;
  registrarsOrder?: any;
  courtOrder?: any;
  [propName: string]: any; // excess properties
}
