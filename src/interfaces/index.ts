// external interfaces
// NB: this is how to re-export a type in TS
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/
import type { CorpInfoIF } from '@bcrs-shared-components/corp-type-module'
import type { AlterationIF, ContactPointIF, NameRequestIF, NameTranslationIF, NameRequestDetailsIF,
  NameRequestApplicantIF, ShareStructureIF, CourtOrderIF, IncorporationApplicationIF, IncorporationAddressIf,
  ShareClassIF, CommentIF, ConfirmDialogType, StaffPaymentIF } from '@bcrs-shared-components/interfaces'
export type { CorpInfoIF }

export type { AlterationIF, ContactPointIF, NameRequestIF, NameTranslationIF, NameRequestDetailsIF,
  NameRequestApplicantIF, ShareStructureIF, CourtOrderIF, IncorporationApplicationIF, IncorporationAddressIf,
  ShareClassIF, CommentIF, ConfirmDialogType, StaffPaymentIF }

export * from './action-interface'
export * from './address-interfaces'
export * from './alert-message-interface'
export * from './api-documents-interface'
export * from './api-filing-interface'
export * from './api-task-interface'
export * from './breadcrumb-interface'
export * from './business-interface'
export * from './component-interface'
export * from './correction-filing-interface'
export * from './director-interface'
export * from './document-interface'
export * from './filing-data-interface'
export * from './dissolution-filing-interface'
export * from './form-interface'
export * from './history-item-interface'
export * from './officer-interface'
export * from './party-interface'
export * from './payment-error-interface'
export * from './role-interface'
export * from './state-interface'
export * from './todo-item-interface'
export * from './obligations-interface'
export * from './dissolution-confirmation-interface'
export * from './todo-list-interface'
