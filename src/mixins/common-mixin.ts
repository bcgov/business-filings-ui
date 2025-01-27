import { Component, Vue } from 'vue-property-decorator'
import { isEqual, omit } from 'lodash'
import { Getter } from 'pinia-class'
import { RawLocation } from 'vue-router'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import { navigate } from '@/utils'
import { Routes } from '@/enums'

/**
 * Mixin that provides some useful common utilities.
 */
@Component({})
export default class CommonMixin extends Vue {
  @Getter(useConfigurationStore) getBusinessDashUrl!: string
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useRootStore) isNoRedirect!: boolean

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
   * @param identifier the identifier to include in the dashboard URL (optional)
   * @param filingId the filing ID to include in the dashboard URL (optional)
   */
  protected navigateToBusinessDashboard (identifier = this.getIdentifier, filingId = NaN): void {
    if (!this.isNoRedirect) {
      // redirect to the new Business Dashboard
      let dashboardUrl = `${this.getBusinessDashUrl}/${identifier}`
      if (!isNaN(filingId)) {
        dashboardUrl += `?filing_id=${filingId.toString()}`
      }
      navigate(dashboardUrl)
    } else {
      // stay in this UI
      const route: RawLocation = { name: Routes.DASHBOARD }
      if (!isNaN(filingId)) {
        route.query = { filing_id: filingId.toString() }
      }
      this.$router.push(route).catch(() => {}) // ignore potential navigation abort errors
    }
  }
}
