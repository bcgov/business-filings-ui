import { required, maxLength } from 'vuelidate/lib/validators'
import { validatePostalCode } from './validators'

// The Address schema containing Vuelidate rules.
// NB: This should match the subject JSON schema.

export const directorAddressSchema = {
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
      required
    },
    addressRegion: {
      maxLength: maxLength(2)
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
