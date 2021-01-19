import { FilingTypes, PaymentMethod } from '@/enums'
import { PaymentErrorIF } from '@/interfaces'

/** A task item in the Todo List. */
export interface TaskItemIF {
  filingType: FilingTypes;
  id: number;
  title: string;
  draftTitle?: string;
  subtitle?: string;
  ARFilingYear: number; // for AR only
  arMinDate?: string; // for COOP AR only
  arMaxDate?: string; // for COOP AR only
  status: string;
  enabled: boolean;
  order: number;
  paymentMethod?: PaymentMethod;
  paymentToken?: number;
  nextArDate?: string; // for AR Todo only
  payErrorObj?: PaymentErrorIF;
  correctedFilingId?: number; // for correction only
  correctedFilingType?: string; // for correction only
  isEmptyFiling?: boolean; // for IA only
  nameRequest?: any; // for IA only
}
