import { EntityTypes } from '@/enums'

// Name Request State interface
export interface NameRequestIF {
    nrNumber: string
    entityType: EntityTypes
    details: NameRequestDetailsIF
    applicant: NameRequestApplicantIF
    filingId: number | null
  }

// Name request response details interface
export interface NameRequestDetailsIF {
    approvedName: string
    status: string
    consentFlag: string
    expirationDate: string
  }

// Name request applicant details interface
export interface NameRequestApplicantIF {
    firstName: string
    middleName: string
    lastName: string
    emailAddress: string
    phoneNumber: string
    addressLine1: string
    addressLine2: string
    addressLine3: string
    city: string
    countryTypeCode: string
    postalCode: string
    stateProvinceCode: string
  }
