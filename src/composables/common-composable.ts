import { computed } from 'vue'
import { omit, isEqual } from 'lodash'

/**
 * Composable that provides some useful common utilities.
 */
export const CommonComposable = () => {
  /** True if Jest is running the code. */
  const isJestRunning = computed(() => process.env.JEST_WORKER_ID !== undefined as boolean)

  /**
   * Removes the specified properties from nested objects.
   * @param baseObj the base object
   * @param keys    the nested object keys which to omit properties from
   * @param prop    the properties to be removed
   */
  const omitProps = (baseObj: any, keys: Array<string>, prop: Array<string>): any => {
    const parsedObj: any = {}
    Object.keys(baseObj).forEach(key => {
      parsedObj[key] = omit(baseObj[key], prop)
    })
    return parsedObj
  }

  /**
   * Compares two objects while omitting specified properties from the comparison.
   * @param objA the first object to compare
   * @param objB the second object to compare
   * @param props an optional array of properties to omit during the comparison
   * @returns a boolean indicating a match of objects
   */
  const isSame = (objA: object, objB: object, props: string[] = []): boolean => {
    return isEqual({ ...omit(objA, props) }, { ...omit(objB, props) })
  }

  return {
    isJestRunning,
    omitProps,
    isSame
  }
}
