import { required, maxLength } from 'vuelidate/lib/validators'
import { validatePostalCode } from '@/validators'

// The Address schema containing Vuelidate rules.
// NB: This should match the subject JSON schema.

export const officeAddressSchema = {
  streetAddress: {
    required,
    maxLength: maxLength(50)
  },
  streetAddressAdditional: {
    maxLength: maxLength(50)
  },
  addressCity: {
    required,
    maxLength: maxLength(40)
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
    validatePostalCode
  },
  deliveryInstructions: {
    maxLength: maxLength(80)
  }
}
