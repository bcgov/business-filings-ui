import { EntityStatus, CorpTypeCd, FilingStatus } from '@/enums'
import { DirectorIF, FilingDataIF, LedgerIF, OfficeAddressIF } from '@/interfaces'

export interface StateIF {
  // tombstone data
  keycloakRoles: Array<string>
  authRoles: Array<string>
  username: string
  currentDate: string // 'today' as YYYY-MM-DD

  // entity info
  entityName: string
  entityType: CorpTypeCd
  entityStatus: EntityStatus
  entityBusinessNo: string
  entityIncNo: string
  entityFoundingDate: string
  businessEmail: string
  businessPhone: string
  lastAnnualReportDate: string
  lastFilingDate: Date
  lastCoaFilingDate: Date
  lastCodFilingDate: Date
  businessPhoneExtension: string
  nextARDate: string
  nameRequest: any

  ARFilingYear: number // YYYY
  arMinDate: string // YYYY-MM-DD
  arMaxDate: string // YYYY-MM-DD

  tasks: Array<any> // tasks from API
  filings: Array<LedgerIF> // filings from API
  registeredAddress: OfficeAddressIF
  recordsAddress: OfficeAddressIF
  directors: Array<DirectorIF>

  currentFilingStatus: FilingStatus
  configObject: any
  filingData: Array<FilingDataIF>
  hasBlockerTask: boolean
}
