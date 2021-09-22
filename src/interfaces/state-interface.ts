import { CorpTypeCd, EntityStatus, FilingStatus } from '@/enums'
import { FilingDataIF } from '@/interfaces'

/** The state model interface. */
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
  businessPhoneExtension: string
  nextARDate: string // YYYY-MM-DD // BCOMPs only
  nameRequest: any

  // other global data
  ARFilingYear: number // YYYY
  arMinDate: string // YYYY-MM-DD // COOPs only
  arMaxDate: string // YYYY-MM-DD // COOPs only

  tasks: Array<any>
  filings: Array<any>,
  registeredAddress: any
  recordsAddress: any
  directors: Array<any>

  currentFilingStatus: FilingStatus
  configObject: any
  filingData: Array<FilingDataIF>

  hasBlockerTask: boolean
  hasBlockerFiling: boolean
  isCoaPending: boolean
  coaEffectiveDate: string
}
