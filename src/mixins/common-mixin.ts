import { Component, Vue } from 'vue-property-decorator'
import { omit, isEqual } from 'lodash'

/**
 * Mixin that provides some useful object utilities.
 */
@Component({})
export default class CommonMixin extends Vue {
  /**
   * Removes the specified properties from nested objects.
   * @param baseObj the base object
   * @param keys    the nested object keys which to omit properties from
   * @param prop    the properties to be removed
   */
  omitProps (baseObj: object, keys: Array<string>, prop: Array<string>): object {
    const parsedObj: object = {}
    Object.keys(baseObj).forEach(key => {
      parsedObj[key] = omit(baseObj[key], prop)
    })
    return parsedObj
  }

  /**
   * Compares two objects while omitting specified properties from the comparison.
   * @param addressA the first object to compare
   * @param addressB the second object to compare
   * @param prop     the property to omit during the comparison
   *
   * @returns a boolean indicating a match of objects
   */
  isSame (objA: {}, objB: {}, prop: string = null): boolean {
    return isEqual({ ...omit(objA, [prop]) }, { ...omit(objB, [prop]) })
  }
}
