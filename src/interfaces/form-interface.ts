/**
 * Vuetify interface for forms.
 * Ref: https://vuetifyjs.com/en/components/forms/
 */
export interface FormIF extends HTMLFormElement {
  /** Will clear all inputs and reset their validation errors */
  reset(): void

  /** Will only reset input validation and not alter their state. */
  resetValidation(): void

  /** Will validate all inputs and return if they are all valid or not. */
  validate(): boolean
}
