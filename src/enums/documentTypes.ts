/**
 * Document types accepted by the Legal API client document (DRS) endpoint:
 * POST documents/client/{filingType}/{entityType}/{documentType}
 */
export enum DocumentTypes {
  CONTINUATION_OUT = 'continuation_out',
  COURT_ORDER = 'court_order'
}
