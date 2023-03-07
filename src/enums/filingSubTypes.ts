// FUTURE: move these to shared enum and import that instead
export enum FilingSubTypes {
  ADMIN_FREEZE = 'adminFreeze',
  ADMIN_UNFREEZE = 'adminUnfreeze',
  COURT_ORDERED_LIQUIDATION = 'courtOrderedLiquidation',
  DISSOLUTION_ADMINISTRATIVE = 'administrative',
  DISSOLUTION_INVOLUNTARY = 'involuntary',
  DISSOLUTION_VOLUNTARY = 'voluntary',
  RESTORATION_CONVERSION = 'limitedRestorationToFull',
  RESTORATION_EXTENSION = 'limitedRestorationExtension',
  RESTORATION_FULL = 'fullRestoration',
  RESTORATION_LIMITED = 'limitedRestoration',
  VOLUNTARY_LIQUIDATION = 'voluntaryLiquidation',

  // FUTURE: add these dissolution names as needed
  // DISS_D1A = 'DISS_1_ADMIN',
  // DISS_D1F = 'DISS_1_FILE',
  // DISS_D1T = 'DISS_1_TRANS',
  // DISS_D2A = 'DISS_2_ADMIN',
  // DISS_D2F = 'DISS_2_FILE',
  // DISS_D2T = 'DISS_2_TRANS',
  // DISS_HDA = 'DISS_ADMIN',
  // DISS_HDB = 'DISS_CONVERTED',
  // DISS_HDF = 'DISS_FAIL_FILE',
  // DISS_HDT = 'DISS_FAIL_TRANS',
  // DISS_HDP = 'DISS_LLP_REG',
  // DISS_HDO = 'DISS_OTHER',
  // DISS_HDV = 'DISS_VOLUNTARY',
}
