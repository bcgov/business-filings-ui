import { EntityState, CorpTypeCd } from '@/enums'
import { BusinessWarningIF } from '@/interfaces'

/** The state model for the business store module. */
export interface BusinessStateIF {
  adminFreeze: boolean
  businessNumber: string
  businessWarnings: Array<BusinessWarningIF>
  entityFoundingDate: Date
  entityName: string
  entityState: EntityState
  entityType: CorpTypeCd
  goodStanding: boolean
  hasCourtOrders: boolean
  identifier: string
  lastAnnualReportDate: string // YYYY-MM-DD
  lastAddressChangeDate: string // YYYY-MM-DD
  lastDirectorChangeDate: string // YYYY-MM-DD
}
