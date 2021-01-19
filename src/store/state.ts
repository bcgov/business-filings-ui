import { EntityStatus, EntityTypes, FilingStatus } from '@/enums'
import { FilingDataIF } from '@/interfaces'

export default {
  // tombstone data
  keycloakRoles: [] as Array<string>,
  authRoles: [] as Array<string>,
  username: null as string,
  currentDate: null as string, // 'today' as YYYY-MM-DD

  // entity info
  entityName: null as string,
  entityType: null as EntityTypes,
  entityStatus: null as EntityStatus,
  entityBusinessNo: null as string,
  entityIncNo: null as string,
  entityFoundingDate: null as string,
  businessEmail: null as string,
  businessPhone: null as string,
  lastAnnualReportDate: null as string,
  businessPhoneExtension: null as string,
  nextARDate: null as string,
  nameRequest: null as object,

  ARFilingYear: null as number, // YYYY
  arMinDate: null as string, // YYYY-MM-DD
  arMaxDate: null as string, // YYYY-MM-DD

  tasks: [] as Array<object>,
  filings: [] as Array<object>,
  registeredAddress: null as object,
  recordsAddress: null as object,
  directors: [] as Array<object>,

  currentFilingStatus: null as FilingStatus,
  configObject: null as object,
  filingData: [] as Array<FilingDataIF>
}
