import { Component, Vue } from 'vue-property-decorator'
import { isEqual } from 'lodash'
import omit from 'lodash.omit'
import { Getter } from 'pinia-class'
import { useConfigurationStore } from '@/stores'
import { GetFeatureFlag, navigate } from '@/utils'
import { Routes } from '@/enums'

/**
 * Mixin that provides some useful common utilities.
 */
@Component({})
export default class CommonMixin extends Vue {
  @Getter(useConfigurationStore) getBusinessDashUrl!: string

  /** True if Vitest is running the code. */
  get isVitestRunning (): boolean {
    return (import.meta.env.VITEST !== undefined)
  }

  /**
   * Removes the specified properties from nested objects.
   * @param baseObj the base object
   * @param keys the nested object keys which to omit properties from
   * @param prop the properties to be removed
   */
  omitProps (baseObj: any, keys: Array<string>, prop: Array<string>): any {
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
  isSame (objA: object, objB: object, props: string[] = []): boolean {
    return isEqual({ ...omit(objA, props) }, { ...omit(objB, props) })
  }

  /**
   * Scrolls the window to the top of the specified element.
   * @param element the element to scroll to the top of
   */
  async scrollToTop (element: any): Promise<void> {
    // don't call window.scrollTo during Vitest tests because jsdom doesn't implement it
    if (element && !this.isVitestRunning) {
      await element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /**
   * Identifies the first invalid flag and scrolls to the component.
   * @param validFlags list of current component validity flags
   * @param components list of current component IDs
   * @return whether all components are valid
   */
  async validateAndScroll (validFlags: object, components: object): Promise<boolean> {
    // Create an array of the _ordered_ validity flags
    const validFlagArray = Object.keys(validFlags).map(key => validFlags[key])

    // Find the _first_ corresponding component that is invalid
    const component = document.getElementById(components[validFlagArray.findIndex(f => !f)])

    // If there is an invalid component, scroll to it
    if (component) {
      await this.scrollToTop(component)
      return false
    }
    return true
  }

  /**
   * Navigates to the dashboard page, optionally with a filing ID.
   * @param identifier The identifier to include in the dashboard URL
   * @param filingId The filing ID to include in the dashboard URL (optional, defaults to null)
   */
  protected navigateToDashboard (identifier: string, filingId: number | null = null): void {
    if (GetFeatureFlag('use-business-dashboard')) {
      // Disable 'beforeunload' event
      window.onbeforeunload = null
      let dashboardUrl = `${this.getBusinessDashUrl}/${identifier}`
      if (filingId !== null) {
        dashboardUrl += `?filing_id=${filingId.toString()}`
      }
      navigate(dashboardUrl)
    } else {
      const route: any = { name: Routes.DASHBOARD }
      if (filingId !== null) {
        route.query = { filing_id: filingId.toString() }
      }
      this.$router.push(route).catch(() => {}) // Ignore potential navigation abort errors
    }
  }
}
