import { AuthorizationRoles, CorpTypeCd, FilingStatus } from '@/enums'
import { ApiHeaderIF, ApiTaskIF, FilingDataIF, OfficeAddressIF, PartyIF } from '@/interfaces'
import { FilingTypes } from '@bcrs-shared-components/enums'

/** Interface for the state filing object. */
export interface StateFilingIF {
  business: any
  consentContinuationOut?: any
  header: ApiHeaderIF
  dissolution?: any
  restoration?: any
  putBackOn?: any
}

/** The state model interface for the Root Store. */
export interface RootStateIF {
  // tombstone data
  authRoles: Array<AuthorizationRoles>
  currentDate: string // 'today' as YYYY-MM-DD in Pacific timezone
  currentJsDate: Date // 'now' as of dashboard loading in UTC
  stateFiling: StateFilingIF
  userKeycloakGuid: string

  // bootstrap filing properties
  // (amalgamations/incorp applications/registrations/continuation ins only)
  bootstrapFilingStatus: FilingStatus
  bootstrapFilingType: FilingTypes

  // entity info from auth db
  businessEmail: string
  businessPhone: string
  businessPhoneExtension: string
  corpTypeCd: CorpTypeCd

  // other global data
  businessAddress: OfficeAddressIF
  configObject: any
  fetchingDataSpinner: boolean
  startingAmalgamationSpinner: boolean
  filingData: Array<FilingDataIF>
  nameRequest: any
  parties: Array<PartyIF>
  recordsAddress: OfficeAddressIF
  registeredAddress: OfficeAddressIF
  // *** FUTURE: declare a type for pendingsList
  pendingsList: Array<any> // pendings list from bootstrap filing
  tasks: Array<ApiTaskIF> // "tasks" list from API (or bootstrap filing)
  userInfo: any // from auth db
}
