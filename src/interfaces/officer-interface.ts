export interface OfficerIF {
  firstName: string
  lastName: string
  middleInitial: string
  [propName: string]: any // excess properties
}

export const EmptyOfficer: OfficerIF = {
  firstName: '',
  lastName: '',
  middleInitial: ''
}
