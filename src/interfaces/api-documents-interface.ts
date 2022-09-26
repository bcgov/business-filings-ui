/** A legal filing object from the API. */
export interface LegalFilingIF {
  // contains one arbitrarily-named legal filing output
  // whose name is the filing type
  // eg, alteration, annualReport, etc
  [name: string]: string // link to fetch it
}

/** A documents object from the API. */
export interface ApiDocumentsIF {
  // contains any number of arbitrarily-named submission level outputs
  // or an array named "legalFilings"
  // eg, certificate, noticeOfArticles, receipt, etc
  [name: string]: string | LegalFilingIF[] // link to fetch it, or array
}
