import { PartyTypes } from '@/enums'

// Ref:
// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/party.json

export interface OfficerIF {
  firstName?: string // required for party type = PERSON
  lastName?: string // required for party type = PERSON
  middleInitial?: string
  prevFirstName?: string
  prevLastName?: string
  prevMiddleInitial?: string
  organizationName?: string // required for party type = ORGANIZATION
  partyType?: PartyTypes
  email?: string
  taxId?: string
}

/** An empty officer object. Note: don't assign this - make a copy instead. */
export const EmptyOfficer: OfficerIF = {
  firstName: '',
  lastName: '',
  middleInitial: ''
}
