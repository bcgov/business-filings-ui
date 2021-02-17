// from external module
// NB: this is how to re-export a type in TS
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/
import type { CorpInfoIF } from '@bcrs-shared-components/corp-type-module'
export type { CorpInfoIF }

export * from './address-interfaces'
export * from './alertMessage-interface'
export * from './alteration-interface'
export * from './breadcrumb-interface'
export * from './business-interface'
export * from './comment-interface'
export * from './component-interface'
export * from './correctionFiling-interface'
export * from './director-interface'
export * from './filing-interface'
export * from './filingData-interface'
export * from './form-interface'
export * from './header-interface'
export * from './historyItem-interface'
export * from './nameRequest-interfaces'
export * from './officer-interface'
export * from './paymentError-interface'
export * from './staffPayment-interface'
export * from './taskItem-interface'
