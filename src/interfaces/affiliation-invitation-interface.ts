export enum AffiliationInvitationType {
  EMAIL = 'EMAIL',
  REQUEST = 'REQUEST',
}

export enum AffiliationInvitationStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  ACCEPTED = 'ACCEPTED',
}

export interface AffiliationInvitationIF {
  id: number
  status: AffiliationInvitationStatus
  type: AffiliationInvitationType
  businessIdentifier: string,
  additionalMessage: string
  fromOrg: {
    name: string
    id: number
  },
  toOrg: {
    name: string
    id: number
  },
}
