//
// These are validator functions used by CODDate.vue and EffectiveDate.vue.
//

/**
 * Whether "date" is not null.
 * @param date the date to check
 */
export function isNotNull (date: string): boolean {
  return !!date
}

/**
 * Whether date has a valid format.
 * @param date the date to check (eg, 2020/12/31)
 * @param separator the date component separator (eg, / or -)
 */
export function isValidFormat (date: string, separator: string): boolean {
  if (!date) return false
  // special handling because Vuelidate doesn't pass in separator
  separator = (typeof separator === 'string') ? separator : '/'
  // length
  if (date.length === 10) {
    // first slash
    if (date.indexOf(separator) === 4) {
      // second slash
      if (date.indexOf(separator, 5) === 7) {
        // third slash
        if (date.indexOf(separator, 8) === -1) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Whether the date is a valid COD date: month must be between min and max.
 * @param date the date to check
 * @param separator the date component separator (eg, / or -)
 */
export function isValidCodDate (date: string, separator: string): boolean {
  if (!date) return false
  // special handling because Vuelidate doesn't pass in separator
  separator = (typeof separator === 'string') ? separator : '/'
  const d1 = this.minDate == null ? 0 : this.minDate.split('-').join('')
  const d2 = this.maxDate.split('-').join('')
  const c = date.split(separator).join('')
  return c >= d1 && c <= d2
}

/**
 * Whether the date is a valid Effective date: month must be less than max.
 * @param date the date to check
 * @param separator the date component separator (eg, / or -)
 */
export function isValidEffectiveDate (date: string, separator: string): boolean {
  if (!date) return false
  // special handling because Vuelidate doesn't pass in separator
  separator = (typeof separator === 'string') ? separator : '/'
  const d2 = this.maxDate.split('-').join('')
  const c = date.split(separator).join('')
  return c <= d2
}
