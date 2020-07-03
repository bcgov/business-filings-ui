import { FilingTypes } from '@/enums'
import { AlterationIF } from '@/interfaces'

/** A filing item (task or filing) from the API. */
export interface FilingIF {
  annualReport?: any;
  business?: any;
  changeOfAddress?: any;
  changeOfDirectors?: any;
  correction?: any;
  documents?: Array<any>;
  header: {
    name: FilingTypes;
    status: string;
    filingId: number;
    date: string;
    [propName: string]: any; // excess properties
  },
  incorporationApplication?: any;
  alteration?: AlterationIF;
}
