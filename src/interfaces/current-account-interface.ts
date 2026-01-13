// import { AccountTypes } from '@bcrs-shared-components/enums'
import { Account } from 'sbc-common-components/src/util/constants'

/**
 * The Current Account interface.
 * @example See CURRENT_ACCOUNT in session storage.
 */
export interface CurrentAccountIF {
  accountStatus: string
  accountType: Account
  additionalLabel?: string
  id: number
  label: string
  productSettings?: string
  type: string
  urlorigin?: string
  urlpath?: string
}
