/** A document attached to a filing. */
export interface DocumentIF {
  title: string // eg, "Certificate"
  filename: string // eg, "BC1230082 - Certificate - 2021-02-08.pdf"
  link: string // eg, "{LEGAL_API_URL}/{API_VERSION}/businesses/BC1230082/filings/111428/documents/Certificate"
}
