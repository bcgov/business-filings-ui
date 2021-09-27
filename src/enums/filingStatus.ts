export enum FilingStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  CORRECTED = 'CORRECTED',
  DELETED = 'DELETED',
  DRAFT = 'DRAFT',
  EPOCH = 'EPOCH', // *** TODO: remove if obsolete
  ERROR = 'ERROR', // *** TODO: remove if obsolete
  NEW = 'NEW', // used for Todo List items only (ie, not yet a filing)
  PAID = 'PAID',
  PENDING = 'PENDING',
  WITHDRAWN = 'WITHDRAWN',
}
