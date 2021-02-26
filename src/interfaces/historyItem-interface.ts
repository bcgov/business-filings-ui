import { CorpTypeCd, FilingTypes } from '@/enums'

/** A history item in the Filing History List. */
export interface HistoryItemIF {
  comments: Array<any>;
  documents?: Array<any>;
  effectiveDateTime?: string;
  filingAuthor: string;
  filingDate: string;
  filingDateTime?: string;
  filingId: number;
  filingType: FilingTypes | 'unknown';
  filingYear?: string;
  isCompleted?: boolean;
  isCorrected?: boolean;
  isPaid: boolean;
  isColinFiling?: boolean;
  isPaperFiling?: boolean;
  status: string;
  subtitle?: string;
  title: string;

  // BCOMP COAs only
  effectiveDate?: string
  isBcompCoaFutureEffective?: boolean

  // corrections only
  isCorrectionPending?: boolean
  correctedFilingId?: number // corrections only
  correctedFilingType?: FilingTypes // corrections only

  // IAs only
  isFutureEffectiveIa?: boolean
  isFutureEffectiveIaPending?: boolean

  // alterations only
  isFutureEffectiveAlteration?: boolean
  isFutureEffectiveAlterationPending?: boolean
  oldLegalType?: CorpTypeCd
  newLegalType?: CorpTypeCd
  courtOrderNumber?: string
  isArrangement?: boolean
}
