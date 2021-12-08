import { CorpTypeCd, DissolutionTypes, EntityStatus, FilingStatus } from '@/enums'
import { ApiFilingIF, ApiTaskIF, DirectorIF, FilingDataIF, OfficeAddressIF } from '@/interfaces'

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
  entityName: string
  entityType: CorpTypeCd
  entityStatus: EntityStatus
  entityBusinessNo: string
  entityIncNo: string
  entityFoundingDate: Date
  entityDissolutionDate: Date
  entityDissolutionType: DissolutionTypes
  lastAnnualReportDate: string // YYYY-MM-DD
  lastAddressChangeDate: string // YYYY-MM-DD
  lastDirectorChangeDate: string // YYYY-MM-DD
  isHistorical: boolean

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
  nameRequest: any

  currentFilingStatus: FilingStatus
  configObject: any
  filingData: Array<FilingDataIF>

  hasBlockerTask: boolean
  hasBlockerFiling: boolean
  isCoaPending: boolean
  coaEffectiveDate: Date
}
