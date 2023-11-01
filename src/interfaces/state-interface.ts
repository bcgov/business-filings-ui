import { CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { ApiHeaderIF, ApiTaskIF, FilingDataIF, OfficeAddressIF, PartyIF } from '@/interfaces'

export interface StateFilingIF {
  business: any
  consentContinuationOut?: any
  header: ApiHeaderIF
  dissolution?: any
  restoration?: any
  putBackOn?: any
}

/** The state model interface. */
export interface StateIF {
  // tombstone data
  authRoles: Array<string>
  currentDate: string // 'today' as YYYY-MM-DD in Pacific timezone
  currentJsDate: Date // 'now' as of dashboard loading in UTC
  entityStatus: EntityStatus // for draft app only
  keycloakRoles: Array<string>
  stateFiling: StateFilingIF // the state filing object
  userFullName: string
  userKeycloakGuid: string

  // entity info from auth db
  businessEmail: string
  businessPhone: string
  businessPhoneExtension: string
  corpTypeCd: CorpTypeCd

  // set by Todo List
  ARFilingYear: number // YYYY
  arMaxDate: string // YYYY-MM-DD // COOPs only
  arMinDate: string // YYYY-MM-DD // COOPs only
  nextARDate: string // YYYY-MM-DD // BCOMPs only

  // other global data
  businessAddress: OfficeAddressIF
  configObject: any
  currentFilingStatus: FilingStatus
  fetchingDataSpinner: boolean
  filingData: Array<FilingDataIF>
  nameRequest: any
  parties: Array<PartyIF>
  recordsAddress: OfficeAddressIF
  registeredAddress: OfficeAddressIF
  tasks: Array<ApiTaskIF> // "tasks" data from API
}
