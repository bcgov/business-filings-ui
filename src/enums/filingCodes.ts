// FUTURE: add these to shared enum and import that instead
export enum FilingCodes {
  ANNUAL_REPORT_BC = 'BCANN', // BCOMP - Annual Report
  ANNUAL_REPORT_OT = 'OTANN', // Others - Annual Report
  ADDRESS_CHANGE_BC = 'BCADD', // BCOMP - Change of Address
  ADDRESS_CHANGE_OT = 'OTADD', // Others - Change of Address
  CONSENT_CONTINUATION_OUT = 'CONTO', // All entity types
  CORRECTION = 'CRCTN', // Correction - for both BCOMP and Others
  DIRECTOR_CHANGE_BC = 'BCCDR', // BCOMP - Change of Directors
  DIRECTOR_CHANGE_OT = 'OTCDR', // Others - Change of Directors
  FREE_DIRECTOR_CHANGE_OT = 'OTFDR', // Others - Free Change of Directors
  FREE_DIRECTOR_CHANGE_BC = 'BCFDR', // bCOMP - Free Change of Directors
}
