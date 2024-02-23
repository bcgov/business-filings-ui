import { AccountTypes } from '@bcrs-shared-components/enums'

/**
 * The current account interface.
 * (Each Keycloak user (login) can have several accounts.)
 */
export interface CurrentAccountIF {
  accountStatus: string
  accountType: AccountTypes
  additionalLabel: string
  id: number
  label: string
  productSettings: string
  type: string
  urlorigin: string
  urlpath: string
}
