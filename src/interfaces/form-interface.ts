export interface FormIF extends HTMLFormElement {
  reset(): void
  resetValidation(): void
  validate(): boolean
}
