import { FilingTypes } from '@/enums'

/** A history item in the Filing History List. */
export interface HistoryItemIF {
  comments: Array<any>;
  correctedFilingId?: number; // correction only
  correctedFilingType?: FilingTypes; // correction only
  documents?: Array<any>;
  effectiveDate?: string; // BCOMP COA only
  effectiveDateTime?: string;
  filingAuthor: string;
  filingDate: string;
  filingDateTime?: string;
  filingId: number;
  filingType: FilingTypes | 'unknown';
  filingYear?: string;
  isBcompCoaFutureEffective?: boolean;
  isColinFiling?: boolean;
  isCompleted?: boolean;
  isCorrected?: boolean;
  isCorrection?: boolean;
  isFutureEffectiveIa?: boolean;
  isFutureEffectiveIaPending?: boolean;
  isFutureEffectiveNoa?: boolean;
  isFutureEffectiveNoaPending?: boolean;
  isNoa?: boolean;
  isPaid: boolean;
  isPaperFiling?: boolean;
  status: string;
  isCorrectionPending?: boolean;
  subtitle?: string;
  title: string;
}
