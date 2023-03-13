// external interfaces
// NB: this is how to re-export a type in TS
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/
import type { CorpInfoIF } from '@bcrs-shared-components/corp-type-module'
import type { AlterationIF, ContactPointIF, NameTranslationIF, ShareStructureIF, CourtOrderIF,
  IncorporationApplicationIF, IncorporationAddressIf, ShareClassIF, CommentIF, ConfirmDialogType, StaffPaymentIF,
  ApiDateTimeUtc, FormattedDateTimeGmt, IsoDatePacific, SpecialResolutionIF } from '@bcrs-shared-components/interfaces'
export type { CorpInfoIF }

export type { AlterationIF, ContactPointIF, NameTranslationIF, ShareStructureIF, CourtOrderIF,
  IncorporationApplicationIF, IncorporationAddressIf, ShareClassIF, CommentIF, ConfirmDialogType, StaffPaymentIF,
  ApiDateTimeUtc, FormattedDateTimeGmt, IsoDatePacific, SpecialResolutionIF }

export * from './action-interface'
export * from './address-interfaces'
export * from './alert-message-interface'
export * from './api-filing-interface'
export * from './api-task-interface'
export * from './breadcrumb-interface'
export * from './business-interfaces'
export * from './component-interface'
export * from './configuration-state-interface'
export * from './correction-filing-interface'
export * from './current-account-interface'
export * from './current-user-interface'
export * from './digitalCredentials-interface'
export * from './director-interface'
export * from './dissolution-confirmation-interface'
export * from './dissolution-interfaces'
export * from './document-interface'
export * from './fetch-documents-interfaces'
export * from './filing-data-interface'
export * from './form-interface'
export * from './history-item-interface'
export * from './key-value-interface'
export * from './name-request-interface'
export * from './obligations-interface'
export * from './officer-interface'
export * from './party-interface'
export * from './payment-error-interface'
export * from './pdf-info-interface'
export * from './presigned-url-interface'
export * from './restoration-interfaces'
export * from './role-interface'
export * from './root-state-interface'
export * from './state-interface'
export * from './steps-interface'
export * from './table-header-interface'
export * from './todo-item-interface'
export * from './todo-list-interface'
