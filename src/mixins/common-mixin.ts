import { Component, Vue } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'
import { omit, isEqual } from 'lodash'
import { EntityTypes } from '@/enums'

/**
 * Mixin that provides some useful common utilities.
 */
@Component({
  computed: {
    ...mapState(['entityType', 'entityName']),
    ...mapGetters(['nrNumber'])
  }
})
export default class CommonMixin extends Vue {
  readonly entityType!: EntityTypes
  readonly entityName!: string
  readonly nrNumber!: string
  /** Returns True if entity is a Benefit Company. */
  isBComp (): boolean {
    return (this.entityType === EntityTypes.BCOMP)
  }

  /** Returns True if entity is a Cooperative. */
  isCoop (): boolean {
    return (this.entityType === EntityTypes.COOP)
  }

  /** Returns True if entity is a Corporation. */
  isCorp (): boolean {
    return (this.entityType === EntityTypes.CORP)
  }

  get corpDisplayName (): string {
    let name = this.entityName
    if (!this.entityName && !this.nrNumber) {
      switch (this.entityType) {
        case EntityTypes.COOP: name = 'Numbered Cooperative'
          break
        case EntityTypes.BCOMP: name = 'Numbered Benefit Company'
          break
        case EntityTypes.CORP: name = 'Numbered Corporation'
          break
      }
    }
    return name
  }

  /**
   * Removes the specified property from an object.
   * @param baseObj the base object
   * @param prop    the property to be removed
   */
  omitProp (baseObj: object, prop: Array<string>): object {
    return omit(baseObj, prop)
  }

  /**
   * Removes the specified properties from nested objects.
   * @param baseObj the base object
   * @param keys    the nested object keys which to omit properties from
   * @param prop    the properties to be removed
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
   * @param addressA the first object to compare
   * @param addressB the second object to compare
   * @param prop     the property to omit during the comparison
   *
   * @returns a boolean indicating a match of objects
   */
  isSame (objA: {}, objB: {}, prop: string = null): boolean {
    return isEqual({ ...this.omitProp(objA, [prop]) }, { ...this.omitProp(objB, [prop]) })
  }
}
