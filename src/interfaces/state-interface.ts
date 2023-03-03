import { CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { ApiFilingIF, ApiHeaderIF, ApiTaskIF, FilingDataIF, OfficeAddressIF, PartyIF }
  from '@/interfaces'

/** The state model interface. */
export interface StateIF {
  // tombstone data
  keycloakRoles: Array<string>
  userKeycloakGuid: string
  authRoles: Array<string>
  currentJsDate: Date // 'now' as of dashboard loading in UTC
  currentDate: string // 'today' as YYYY-MM-DD in Pacific timezone

  // *** TODO: store entire entity info object instead
  corpTypeCd: CorpTypeCd // from auth db (may be null)

  // entity info
  businessEmail: string
  businessPhone: string
  businessPhoneExtension: string
  entityStatus: EntityStatus

  // set by Todo List
  nextARDate: string // YYYY-MM-DD // BCOMPs only
  ARFilingYear: number // YYYY
  arMaxDate: string // YYYY-MM-DD // COOPs only
  arMinDate: string // YYYY-MM-DD // COOPs only

  // other global data
  tasks: Array<ApiTaskIF> // "tasks" data from API
  filings: Array<ApiFilingIF> // "filings" data from API
  registeredAddress: OfficeAddressIF
  recordsAddress: OfficeAddressIF
  businessAddress: OfficeAddressIF
  parties: Array<PartyIF>
  nameRequest: any

  currentFilingStatus: FilingStatus
  configObject: any
  filingData: Array<FilingDataIF>

  hasBlockerTask: boolean
  hasBlockerFiling: boolean
  isCoaPending: boolean
  coaEffectiveDate: Date,
  stateFiling: {
    business: any,
    header: ApiHeaderIF,
    dissolution?: any,
    restoration?: any
    putBackOn?: any
  }
}
