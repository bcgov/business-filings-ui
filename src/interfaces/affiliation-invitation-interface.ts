import { AffiliationInvitationStatus, AffiliationInvitationType } from '@/enums'

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
