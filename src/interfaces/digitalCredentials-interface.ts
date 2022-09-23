import { DigitalCredentialTypes } from '@/enums'

export interface DigitalCredentialsIF {
  legalName: string
  credentialType: DigitalCredentialTypes
  isIssued: boolean
  dateOfIssue: string
  isRevoked: boolean
}
