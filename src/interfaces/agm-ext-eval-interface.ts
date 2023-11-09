/** Object that stores AGM Extension evaluation fields. */
export interface AgmExtEvalIF {
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
  isEligible: boolean
}

/** An empty AGM Extension Evaluation object. Note: don't assign this - make a copy instead. */
export const EmptyAgmExtEval: AgmExtEvalIF = {
  isGoodStanding: null,
  incorporationDate: null,
  isFirstAgm: null,
  agmYear: null,
  extensionDuration: NaN,
  agmDueDate: null,
  isEligible: null
}
