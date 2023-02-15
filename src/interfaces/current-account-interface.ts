/** The current account interface.
 * A logged-in user can select between multiple accounts */
export interface CurrentAccountIF {
  accountStatus: string
  accountType: string
  additionalLabel: string
  id: number
  label: string
  productSettings: string
  type: string
  urlorigin: string
  urlpath: string
}
