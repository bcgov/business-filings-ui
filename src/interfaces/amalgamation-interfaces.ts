import { AmalgamationTypes, CorpTypeCd, FilingTypes } from '@/enums'
import { CorrectNameOptions } from '@bcrs-shared-components/enums'
import { CompletingPartyIF, ContactPointIF, CourtOrderIF,
  NameTranslationIF, ShareClassIF } from '@bcrs-shared-components/interfaces'
import { OfficeAddressIF } from './address-interfaces'

/**
 * A filing's amalgamation application object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/amalgamation_application.json
 */
export interface RegisteredRecordsAddressesIF {
  registeredOffice: OfficeAddressIF
  recordsOffice?: OfficeAddressIF
}

export interface NameRequestFilingIF {
  legalType: CorpTypeCd
  legalName?: string
  nrNumber?: string
  correctNameOption?: CorrectNameOptions
}

export interface AmalgamationApplicationIF {
  amalgamatingBusinesses: any[]
  courtApproval: boolean
  type: AmalgamationTypes
  nameRequest: NameRequestFilingIF
  nameTranslations: NameTranslationIF[]
  offices: RegisteredRecordsAddressesIF | object
  contactPoint: ContactPointIF
  parties: CompletingPartyIF[]

  // BEN / CC / BC / ULC only:
  shareStructure?: {
    shareClasses: ShareClassIF[]
  }
  incorporationAgreement?: {
    agreementType: string
  }
  // ULC only:
  courtOrder?: CourtOrderIF
}

/** Restoration filing interface. */
export interface AmalgamationApplicationFilingIF {
  header: {
    name: FilingTypes
    certifiedBy: string
    date: string
    effectiveDate?: string
    filingId?: number
    folioNumber?: string
    isFutureEffective: boolean

    // staff payment properties:
    routingSlipNumber?: string
    bcolAccountNumber?: string
    datNumber?: string
    waiveFees?: boolean
    priority?: boolean
  }
  business: {
    legalType: CorpTypeCd
    identifier: string
  }
  amalgamationApplication: AmalgamationApplicationIF
}
