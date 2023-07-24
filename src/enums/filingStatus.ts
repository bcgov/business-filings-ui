export enum FilingStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  CORRECTED = 'CORRECTED',
  DELETED = 'DELETED',
  DRAFT = 'DRAFT',
  EPOCH = 'EPOCH', // legacy, not used by UI
  ERROR = 'ERROR',
  NEW = 'NEW', // used for Todo List items only (ie, not yet a filing)
  PAID = 'PAID',
  PENDING = 'PENDING',
  PENDING_CORRECTION = 'PENDING_CORRECTION',
  WITHDRAWN = 'WITHDRAWN',
}
