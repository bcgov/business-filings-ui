import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { NameRequestStates } from '@/enums'
import { NrRequestActionCodes } from '@bcrs-shared-components/enums'

/**
 * Name request applicant interface.
 * Includes only the properties we care about.
 */
export interface NameRequestApplicantIF {
  addrLine1: string
  addrLine2: string
  addrLine3: string
  city: string
  countryTypeCd: string
  emailAddress: string
  firstName: string
  lastName: string
  middleName: string
  phoneNumber: string
  postalCd: string
  stateProvinceCd: string
}

/**
 * Name request name interaface.
 * Includes only the properties we care about.
 */
export interface NameRequestNameIF {
  name: string
  state: NameRequestStates
}

/**
 * Name request interface.
 * Includes only the properties we care about.
 */
export interface NameRequestIF {
  applicants: NameRequestApplicantIF
  consentFlag: string
  expirationDate: string // yyyy-mm-ddRhh:mm:ss+00:00
  legalType: CorpTypeCd
  names: Array<NameRequestNameIF>
  nrNum: string
  request_action_cd: NrRequestActionCodes // eslint-disable-line camelcase
  state: NameRequestStates
}
