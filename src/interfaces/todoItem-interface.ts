import { FilingTypes, PaymentMethod } from '@/enums'
import { PaymentErrorIF } from '@/interfaces'

/** A Todo List item. */
export interface TodoItemIF {
  draftTitle: string
  enabled: boolean
  id: number
  name: FilingTypes
  order: number
  payErrorObj?: PaymentErrorIF
  paymentMethod?: PaymentMethod
  paymentToken?: number
  status: string
  subtitle?: string
  title: string

  // alterations and corrections only
  comments?: Array<any>

  // ARs only
  ARFilingYear?: number

  // COOP ARs only
  arMinDate?: string
  arMaxDate?: string

  // BCOMP ARs only
  nextArDate?: string
  arDueDate?: string

  // corrections only
  correctedFilingId?: number
  correctedFilingType?: string

  // IAs only
  isEmptyFiling?: boolean
  nameRequest?: any

  // alterations only
  legalType?: string
  goodStanding?: boolean
}
