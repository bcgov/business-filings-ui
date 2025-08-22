import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { BreadcrumbIF } from '@bcrs-shared-components/interfaces'
import { CurrentAccountIF } from '@/interfaces'
import { useAuthenticationStore, useBusinessStore, useConfigurationStore } from '@/stores'

/**
 * Mixin that provides some useful Name Request utilities.
 */
@Component({})
export default class BreadcrumbMixin extends Vue {
  @Getter(useAuthenticationStore) getCurrentAccount!: CurrentAccountIF

  @Getter(useBusinessStore) getEntityName!: string
  @Getter(useBusinessStore) getIdentifier!: string

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useConfigurationStore) getBusinessDashUrl!: string
  @Getter(useConfigurationStore) getBusinessRegistryUrl!: string
  @Getter(useConfigurationStore) getRegHomeUrl!: string

  /** Returns the breadcrumb to the BC Registries Dashboard. */
  getBcRegistriesDashboardBreadcrumb (): BreadcrumbIF {
    const accountId = this.getCurrentAccount?.id || 0
    const params = accountId ? `?accountid=${accountId}` : ''
    return {
      text: 'BC Registries Dashboard',
      href: `${this.getRegHomeUrl}dashboard/${params}`
    }
  }

  /** Returns the breadcrumb to the My Business Registry page. */
  getMyBusinessRegistryBreadcrumb (): BreadcrumbIF {
    const accountId = this.getCurrentAccount?.id || 0
    return {
      text: 'My Business Registry',
      href: `${this.getBusinessRegistryUrl}account/${accountId}`
    }
  }

  /** Returns the breadcrumb to the Staff Dashboard. */
  getStaffDashboardBreadcrumb (): BreadcrumbIF {
    return {
      text: 'Staff Dashboard',
      href: `${this.getAuthWebUrl}staff/dashboard/active`
    }
  }

  /** Returns the breadcrumb to the Business Dashboard. */
  getDashboardBreadcrumb (): BreadcrumbIF {
    const accountId = this.getCurrentAccount?.id || 0
    const params = accountId ? `?accountid=${accountId}` : ''
    // redirect to new Business Dashboard
    return {
      text: this.getEntityName || 'Unknown Name',
      href: `${this.getBusinessDashUrl}${this.getIdentifier}${params}`
    }
  }
}
