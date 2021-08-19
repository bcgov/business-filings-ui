export interface OfficerIF {
  firstName: string
  lastName: string
  middleInitial: string
  prevFirstName?: string
  prevLastName?: string
  prevMiddleInitial?: string
}

/** An empty officer object. Note: don't assign this - make a copy instead. */
export const EmptyOfficer: OfficerIF = {
  firstName: '',
  lastName: '',
  middleInitial: ''
}
