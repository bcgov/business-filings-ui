//
// These are validator functions used by schemas.
//

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
