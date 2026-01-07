import { required, maxLength } from 'vuelidate/lib/validators'

// The Address schema containing Vuelidate rules.
// NB: This should match the subject JSON schema.

/** Validator for required fields to reject whitespace-only strings and leading/trailing spaces */
export const requiredNoWhitespace = (val) => {
  if (!val) return true
  const trimmed = val.trim()
  return trimmed.length > 0 && trimmed === val
}

/** Validator for optional fields to reject leading/trailing spaces */
export const noLeadingTrailingSpaces = (val) => {
  if (!val) return true
  return val.trim() === val
}

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
    requiredNoWhitespace
  },
  deliveryInstructions: {
    maxLength: maxLength(80),
    noLeadingTrailingSpaces
  }
}
