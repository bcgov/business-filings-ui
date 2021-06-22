import { DocumentTypes } from '@/enums'

/** A document from the API. */
export interface DocumentIF {
  filename: string // eg, "CP1234567 - Address Change - 2021-06-04.pdf"
  filingId: string
  reportType: string // may be null, "certificate", "noa", etc
  title: string // eg, "Address Change"
  type: DocumentTypes
}
