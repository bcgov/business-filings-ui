//
// These are validator functions used by schemas.
//

/**
 * Canadian postal code regex (eg, accepts A1A 1A1 or A1A1A1).
 * Ref: https://en.wikipedia.org/wiki/Postal_codes_in_Canada
 */
const CanadaPostalCodeRegex = /^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z][ ]?[0-9][ABCEGHJ-NPRSTV-Z][0-9]$/i

/** Validator for Canadian postal codes */
export function validatePostalCode (value, parentVm): boolean {
  if (parentVm.addressCountry === 'CA') return CanadaPostalCodeRegex.test(value)
  return true
}

/** Validator for required fields to reject whitespace-only strings and leading/trailing spaces */
export function requiredNoWhitespace (val): boolean {
  if (!val) return true
  const trimmed = val.trim()
  return trimmed.length > 0 && trimmed === val
}

/** Validator for optional fields to reject leading/trailing spaces */
export function noLeadingTrailingSpaces (val): boolean {
  if (!val) return true
  return val.trim() === val
}
