import { Component, Vue } from 'vue-property-decorator'
import { omit, isEqual } from 'lodash'
import { FilingTypes, FilingNames } from '@/enums'

/**
 * Mixin that provides some useful common utilities.
 */
@Component({})
export default class CommonMixin extends Vue {
  /**
   * Removes the specified property from an object.
   *
   * @param baseObj The base object.
   * @param prop The property to be removed.
   */
  omitProp (baseObj: object, prop: Array<string>): object {
    return omit(baseObj, prop)
  }

  /**
   * Removes the specified properties from nested objects.
   *
   * @param baseObj The base object.
   * @param keys The nested object keys which to omit properties from.
   * @param prop The properties to be removed.
   */
  omitProps (baseObj: object, keys: Array<string>, prop: Array<string>): object {
    let parsedObj = {}
    Object.keys(baseObj).forEach(keys => {
      parsedObj[keys] = omit(baseObj[keys], prop)
    })
    return parsedObj
  }

  /**
   * Compares two objects while omitting specified properties from the comparison.
   *
   * @param addressA The first object to compare
   * @param addressB The second object to compare
   * @param prop The property to omit during the comparison
   *
   * @return boolean A boolean indicating a match of objects
   */
  isSame (objA: {}, objB: {}, prop: string = null): boolean {
    return isEqual({ ...this.omitProp(objA, [prop]) }, { ...this.omitProp(objB, [prop]) })
  }

  /**
   * Flattens and sorts an array of comments
   *
   * @param comments The array of comments to sort and deconstruct
   * @return The sorted and flattened array of comments
   */
  flattenAndSortComments (comments: Array<any>): Array<any> {
    if (comments && comments.length > 0) {
      // first use map to change comment.comment to comment
      const flattened: Array<any> = comments.map(c => c.comment)
      // then sort newest to oldest
      const sorted = flattened.sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1)
      return sorted
    }
    return []
  }

  /**
   * Format the incoming filing type string for better display.
   *
   * @param type The filing type string to be formatted
   * @param agmYear OPTIONAL: The agmYear string to be appended to the formatted filing type string.
   */
  typeToTitle (type: string, agmYear: string = null): string {
    if (!type) return '' // safety check
    switch (type) {
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.DIRECTOR_CHANGE
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.ADDRESS_CHANGE
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.LEGAL_NAME_CHANGE
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.VOLUNTARY_DISSOLUTION: return FilingNames.VOLUNTARY_DISSOLUTION
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
    }
    // fallback for unknown filings
    return type.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
  }
}
