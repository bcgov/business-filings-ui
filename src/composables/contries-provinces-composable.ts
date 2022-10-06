/* eslint-disable @typescript-eslint/no-var-requires */

import { computed } from 'vue'

// import these and sort them only once globally
window['countries'] = window['countries'] || require('country-list/data.json')
  .sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0)

window['provinces'] = window['provinces'] || require('provinces/provinces.json')
  .sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0)

// global caching to improve performance when called multiple times
window['countryNameCache'] = {}
window['countryRegionsCache'] = {}

/**
 * Composable that allows VM access to useful country/province data and functions.
 * @link https://www.npmjs.com/package/country-list
 * @lint https://www.npmjs.com/package/provinces
 */
export const CountriesProvincesComposable = () => {
  /**
   * Helper function to return a list of countries.
   * @returns An array of country objects, sorted alphabetically.
   */
  const getCountries = (): Array<object> => { return window['countries'] }

  /**
   * Helper function to return a country's name.
   * @param code The short code of the country.
   * @returns The long name of the country.
   */
  const getCountryName = (code: string): string => {
    if (!code) return null
    if (window['countryNameCache'][code]) return window['countryNameCache'][code]
    const country = window['countries'].find(c => c.code === code)
    const result = country ? country.name : null
    window['countryNameCache'][code] = result
    return result
  }

  /**
   * Helper function to return a country's list of provinces.
   * @param code The short code of the country.
   * @returns An array of province objects, sorted alphabetically.
   */
  const getContryRegions = (code: string): Array<object> => {
    if (!code) return null
    if (window['countryRegionsCache'][code]) return window['countryRegionsCache'][code]
    const result = window['provinces']
      .filter(p => p.country === code)
      .map(p => ({
        name: p.english || p.name,
        short: (p.short && p.short.length <= 2) ? p.short : '--'
      }))
    window['countryRegionsCache'][code] = result
    return result
  }

  return {
    getCountries,
    getCountryName,
    getContryRegions
  }
}
