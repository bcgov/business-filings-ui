/**
 * Formats the given phone number string.
 * @example '+91-1234567890' -> '+91-1234567890'
 * @example '123' -> '123'
 * @example '1234567' -> '123-4567'
 * @example '1234567890' -> '(123) 456-7890'
 * @example '1234567890123' -> '1234567890123'
 */
export function formatPhoneNumber (s: string): string {
  if (!s) {
    return ''
  }
  // pre-formatted
  if (s.search(/\D/) >= 0) {
    return s
  }
  // 3 + 4 format
  if (s.length === 7) {
    return `${s.substring(0, 3)}-${s.substring(3)}`
  }
  // 3 + 3 + 4 format
  if (s.length === 10) {
    return `(${s.substring(0, 3)}) ${s.substring(3, 6)}-${s.substring(6)}`
  }
  // unknown format
  return s
}
