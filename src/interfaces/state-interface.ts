import { EntityState, CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { ApiFilingIF, ApiTaskIF, ComplianceWarning, DirectorIF, FilingDataIF, OfficeAddressIF, PartiesIF }
  from '@/interfaces'

/** The state model interface. */
export interface StateIF {
  // tombstone data
  keycloakRoles: Array<string>
  authRoles: Array<string>
  username: string
  currentJsDate: Date // 'now' as of dashboard loading in UTC
  currentDate: string // 'today' as YYYY-MM-DD in Pacific timezone

  // entity info
  businessEmail: string
  businessPhone: string
  businessPhoneExtension: string

  // business info
  adminFreeze: boolean
  identifier: string
  businessNumber: string
  complianceWarnings: Array<ComplianceWarning>
  entityFoundingDate: Date
  entityName: string
  entityState: EntityState
  entityStatus: EntityStatus
  entityType: CorpTypeCd
  goodStanding: boolean
  reasonText: string
  lastAnnualReportDate: string // YYYY-MM-DD
  lastAddressChangeDate: string // YYYY-MM-DD
  lastDirectorChangeDate: string // YYYY-MM-DD

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
  directors: Array<DirectorIF>
  custodians: Array<PartiesIF>
  nameRequest: any

  currentFilingStatus: FilingStatus
  configObject: any
  filingData: Array<FilingDataIF>

  hasBlockerTask: boolean
  hasBlockerFiling: boolean
  isCoaPending: boolean
  coaEffectiveDate: Date
}
