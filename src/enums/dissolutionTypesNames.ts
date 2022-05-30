// FUTURE: update these as designs evolve
export enum DissolutionTypes {
  // ADMINISTRATIVE = 'administrative',
  // COURT_ORDER_LIQUIDATION = 'courtOrderedLiquidation',
  // INVOLUNTARY = 'involuntary',
  VOLUNTARY = 'voluntary',
  // VOLUNTARY_LIQUIDATION = 'voluntaryLiquidation',

  // D1F = 'DISS_1_FILE',
  // D1A = 'DISS_1_ADMIN',
  // D2F = 'DISS_2_FILE',
  // D2A = 'DISS_2_ADMIN',
  // HDO = 'DISS_OTHER',
  // HDV = 'DISS_VOLUNTARY',
  // HDF = 'DISS_FAIL_FILE',
  // HDA = 'DISS_ADMIN',
  // D1T = 'DISS_1_TRANS',
  // D2T = 'DISS_2_TRANS',
  // HDT = 'DISS_FAIL_TRANS',
  // HDP = 'DISS_LLP_REG',
  // HDB = 'DISS_CONVERTED',

  UNKNOWN = 'unknown' // for fallback
}

export enum DissolutionNames {
  // ADMINISTRATIVE = 'Administrative Dissolution',
  // COURT_ORDER_LIQUIDATION = 'Court Ordered Liquidation',
  // INVOLUNTARY = 'Involuntary Dissolution',
  VOLUNTARY = 'Voluntary Dissolution',
  FIRM_DISSOLUTION = 'Dissolution',
  // VOLUNTARY_LIQUIDATION = 'Voluntary Liquidation',

  // DISS_1_FILE = 'Dissolution 1 - Fail to file',
  // DISS_1_ADMIN = 'Dissolution 1 - Admin',
  // DISS_2_FILE = 'Dissolution 2 - Fail to file',
  // DISS_2_ADMIN = 'Dissolution 2 - Admin',
  // DISS_OTHER = 'Dissolved for Other Reason',
  // DISS_VOLUNTARY = 'Voluntary Dissolution',
  // DISS_FAIL_FILE = 'Dissolved for Failure to File',
  // DISS_ADMIN = 'Administrative Dissolution',
  // DISS_1_TRANS = 'Dissolution 1 - Fail to Transition',
  // DISS_2_TRANS = 'Dissolution 2 - Fail to Transition',
  // DISS_FAIL_TRANS = 'Dissolved for Failure to Transition',
  // DISS_LLP_REG = 'Dissolved from LL Partnership Reg',
  // DISS_CONVERTED = 'Converted to BC Company'
}
