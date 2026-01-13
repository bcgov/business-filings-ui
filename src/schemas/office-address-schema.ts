import { required, maxLength } from 'vuelidate/lib/validators'
import { noLeadingTrailingSpaces, requiredNoWhitespace, validatePostalCode } from './validators'

// The Address schema containing Vuelidate rules.
// NB: This should match the subject JSON schema.

export const officeAddressSchema = {
  streetAddress: {
    required,
    maxLength: maxLength(50),
    requiredNoWhitespace
  },
  streetAddressAdditional: {
    maxLength: maxLength(50),
    noLeadingTrailingSpaces
  },
  addressCity: {
    required,
    maxLength: maxLength(40),
    requiredNoWhitespace
  },
  addressCountry: {
    required,
    // FUTURE: create new validation function isCountry('CA')
    isCanada: (val) => (val === 'CA')
  },
  addressRegion: {
    maxLength: maxLength(2),
    // FUTURE: create new validation function isRegion('BC')
    isBC: (val) => (val === 'BC')
  },
  postalCode: {
    required,
    maxLength: maxLength(15),
    requiredNoWhitespace,
    validatePostalCode
  },
  deliveryInstructions: {
    maxLength: maxLength(80),
    noLeadingTrailingSpaces
  }
}
