import { StaffPaymentOptions } from '@/enums'

/** A filing's business object from the API. */
export interface StaffPaymentIF {
  option: StaffPaymentOptions
  routingSlipNumber: string
  bcolAccountNumber: string
  datNumber: string
  folioNumber: string
  isPriority: boolean
}

/** An empty staff payment object. Note: don't assign this - make a copy instead. */
export const EmptyStaffPayment: StaffPaymentIF = {
  option: StaffPaymentOptions.NONE,
  routingSlipNumber: null,
  bcolAccountNumber: null,
  datNumber: null,
  folioNumber: null,
  isPriority: false
}
