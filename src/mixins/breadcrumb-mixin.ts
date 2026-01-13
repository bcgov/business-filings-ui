import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { BreadcrumbIF } from '@bcrs-shared-components/interfaces'
import { useBusinessStore, useConfigurationStore } from '@/stores'
import CommonMixin from './common-mixin'
import { GetCurrentAccount } from '@/utils'

/**
 * Mixin that provides some useful Name Request utilities.
 */
@Component({})
export default class BreadcrumbMixin extends Mixins(CommonMixin) {
  @Getter(useBusinessStore) getEntityName!: string
  // @Getter(useBusinessStore) getIdentifier!: string

  @Getter(useConfigurationStore) getAuthWebUrl!: string
  // @Getter(useConfigurationStore) getBusinessDashUrl!: string
  @Getter(useConfigurationStore) getBusinessRegistryUrl!: string
  @Getter(useConfigurationStore) getRegHomeUrl!: string

  /** Returns the breadcrumb to the BC Registries Dashboard. */
  getBcRegistriesDashboardBreadcrumb (): BreadcrumbIF {
    const accountId = GetCurrentAccount()?.id
    const params = accountId ? `?accountid=${accountId}` : ''
    return {
      text: 'BC Registries Dashboard',
      href: `${this.getRegHomeUrl}dashboard${params}`
    }
  }

  /** Returns the breadcrumb to the My Business Registry page. */
  getMyBusinessRegistryBreadcrumb (): BreadcrumbIF {
    const accountId = GetCurrentAccount()?.id
    const params = accountId ? `account/${accountId}` : ''
    return {
      text: 'My Business Registry',
      href: `${this.getBusinessRegistryUrl}${params}`
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
    const accountId = GetCurrentAccount()?.id
    const params = accountId ? `?accountid=${accountId}` : ''
    return {
      text: this.getEntityName || 'Unknown Name',
      href: `${this.getBusinessDashUrl}${this.getIdentifier}${params}`
    }
  }
}
