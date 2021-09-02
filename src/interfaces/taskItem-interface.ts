import { FilingTypes, PaymentMethod } from '@/enums'
import { PaymentErrorIF } from '@/interfaces'

/** A task item in the Todo List. */
export interface TaskItemIF {
  filingType: FilingTypes;
  id: number;
  title: string;
  draftTitle?: string;
  subtitle?: string;
  ARFilingYear?: number; // YYYY // ARs only
  arMaxDate?: string; // YYYY-MM-DD // COOP ARs only
  arMinDate?: string; // YYYY-MM-DD // COOP ARs only
  status: string;
  enabled: boolean;
  order: number;
  paymentMethod?: PaymentMethod;
  paymentToken?: number;
  nextArDate?: string; // YYYY-MM-DD // BCOMP ARs only
  arDueDate?: string; // eg, "Apr 9, 2021" // BCOMP ARs only
  payErrorObj?: PaymentErrorIF;
  correctedFilingId?: number; // Corrections only
  correctedFilingType?: string; // Corrections only
  isEmptyFiling?: boolean; // IAs only
  nameRequest?: any; // IAs only
}
