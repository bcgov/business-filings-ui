import { FilingTypes } from '@/enums'

/** A filing's header object from the API. */
export interface HeaderIF {
  date: string;
  filingId: number;
  name: FilingTypes;
  status: string;
  availableInColinOnly?: boolean;
  availableOnPaperOnly?: boolean;
  [propName: string]: any; // excess properties
}
