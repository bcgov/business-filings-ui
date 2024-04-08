/** Object that stores AGM Extension evaluation fields. */
export interface AgmExtEvalIF {
  currentDate: string // YYYY-MM-DD
  alreadyExtended: boolean
  requestExpired: boolean
  isGoodStanding: boolean
  incorporationDate: Date
  isFirstAgm: boolean
  agmYear: string // YYYY
  prevAgmDate: string // YYYY-MM-DD
  isPrevExtension: boolean
  prevExpiryDate: string // YYYY-MM-DD
  extensionDuration: number // in months
  agmDueDate: string // YYYY-MM-DD
  isEligible: boolean
}

/** An empty AGM Extension Evaluation object. Note: don't assign this - make a copy instead. */
export const EmptyAgmExtEval: AgmExtEvalIF = {
  currentDate: null,
  alreadyExtended: null,
  requestExpired: null,
  isGoodStanding: null,
  incorporationDate: null,
  isFirstAgm: null,
  agmYear: null,
  prevAgmDate: null,
  isPrevExtension: null,
  prevExpiryDate: null,
  extensionDuration: NaN,
  agmDueDate: null,
  isEligible: null
}
