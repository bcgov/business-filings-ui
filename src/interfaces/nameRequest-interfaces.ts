import { LegalTypes } from '@/enums'

/**
 * Name Request State interface.
 * (Used by our UI/API - not the same as namex response object.)
 */
export interface NameRequestIF {
    nrNumber: string;
    entityType: LegalTypes;
    details: NameRequestDetailsIF;
    applicant: NameRequestApplicantIF;
    filingId: number | null;
  }

/** Name request response details interface. */
export interface NameRequestDetailsIF {
    approvedName: string;
    status: string;
    consentFlag: string;
    expirationDate: string;
  }

/** Name request applicant details interface. */
export interface NameRequestApplicantIF {
    firstName: string;
    middleName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    countryTypeCode: string;
    postalCode: string;
    stateProvinceCode: string;
  }
