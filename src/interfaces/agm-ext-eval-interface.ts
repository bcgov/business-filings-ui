/** Object that stores AGM Extension evaluation fields. */
export interface AgmExtEvalIF {
  isEligible: boolean
  alreadyExtended: boolean
  requestExpired: boolean
  isGoodStanding: boolean
  incorporationDate: Date
  isFirstAgm: boolean
  agmYear: string // YYYY
  prevAgmDate?: string // YYYY-MM-DD
  isPrevExtension?: boolean
  prevExpiryDate?: string // YYYY-MM-DD
  intendedAgmDate?: string // YYYY-MM-DD
  extensionDuration: number // in months
  agmDueDate: string // YYYY-MM-DD
}

/** An empty AGM Extension Evaluation object. Note: don't assign this - make a copy instead. */
export const EmptyAgmExtEval: AgmExtEvalIF = {
  isEligible: null,
  alreadyExtended: null,
  requestExpired: null,
  isGoodStanding: null,
  incorporationDate: null,
  isFirstAgm: null,
  agmYear: null,
  extensionDuration: null,
  agmDueDate: null
}
