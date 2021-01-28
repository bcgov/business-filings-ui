import { FilingTypes, PaymentMethod } from '@/enums'
import { PaymentErrorIF } from '@/interfaces'

/** A task item in the Todo List. */
export interface TaskItemIF {
  filingType: FilingTypes;
  id: number;
  title: string;
  draftTitle?: string;
  subtitle?: string;
  ARFilingYear: number; // for ARs only
  arMinDate?: string; // for COOP ARs only
  arMaxDate?: string; // for COOP ARs only
  status: string;
  enabled: boolean;
  order: number;
  paymentMethod?: PaymentMethod;
  paymentToken?: number;
  nextArDate?: string; // for BCOMP ARs only
  arDueDate?: string; // for BCOMP ARs only
  payErrorObj?: PaymentErrorIF;
  correctedFilingId?: number; // for Corrections only
  correctedFilingType?: string; // for Corrections only
  isEmptyFiling?: boolean; // for IAs only
  nameRequest?: any; // for IAs only
}
