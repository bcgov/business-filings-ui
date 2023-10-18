import { DigitalCredentialTypes } from '@/enums'

export interface DigitalCredentialIF {
  legalName: string
  credentialType: DigitalCredentialTypes
  credentialId: string
  isIssued: boolean
  dateOfIssue: string
  isRevoked: boolean
}

export interface WalletConnectionIF {
  businessId: string
  connectionId: string
  invitationUrl: string
  isActive: boolean
  connectionState: string
}
