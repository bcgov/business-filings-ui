import { DocumentTypes } from '@/enums'

/** A document from the API. */
export interface DocumentIF {
  filename: string // eg, "CP1234567 - Address Change - 2021-06-04.pdf"
  filingId?: number // non-receipt only
  reportType?: string // may be null, "certificate", "noa", etc
  title: string // eg, "Address Change"
  type: DocumentTypes // REPORT or RECEIPT

  link: string // *** TODO: get from API

  // receipt only
  corpName?: string // eg, "CP1234567"
  filingDateTime?: string // eg, "Jun 9, 2021"
  paymentToken?: string // eg, "10031"
}
