import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { getFeatureFlag } from '@/utils'
import { AllowableActions, CorpTypeCd, FilingSubTypes, FilingTypes, Routes } from '@/enums'
import { AllowedActionsIF } from '@/interfaces'

@Component({})
export default class AllowableActionsMixin extends Vue {
  @Getter getAllowedActions!: AllowedActionsIF
  @Getter getLegalType!: CorpTypeCd
  @Getter isBComp!: boolean
  @Getter isCoop!: boolean
  @Getter isFirm!: boolean
  @Getter isGoodStanding!: boolean
  @Getter isRoleStaff!: boolean

  /**
   * Returns True if the specified action is allowed, else False.
   * @param action the action to check
   */
  isAllowed (action: AllowableActions): boolean {
    const isBusiness = !!sessionStorage.getItem('BUSINESS_ID') // ie, not a temporary business

    switch (action) {
      case AllowableActions.ADDRESS_CHANGE: {
        if (this.isFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.CHANGE_OF_ADDRESS)
      }

      case AllowableActions.ADMINISTRATIVE_DISSOLUTION: {
        // FUTURE: check dissolution type
        return this.isAllowedFiling(FilingTypes.DISSOLUTION)
      }

      case AllowableActions.ANNUAL_REPORT: {
        return this.isAllowedFiling(FilingTypes.ANNUAL_REPORT)
      }

      case AllowableActions.BUSINESS_INFORMATION: {
        if (this.isCoop) {
          // NB: this feature is targeted via LaunchDarkly
          const ff = !!getFeatureFlag('special-resolution-ui-enabled')
          return (ff && this.isAllowedFiling(FilingTypes.SPECIAL_RESOLUTION))
        }
        if (this.isFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.ALTERATION)
      }

      case AllowableActions.BUSINESS_SUMMARY: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-business-summary-entities')?.includes(this.getLegalType)
        return (ff && isBusiness)
      }

      case AllowableActions.CONSENT_CONTINUATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONSENT_CONTINUATION_OUT)
      }

      case AllowableActions.CORRECTION: {
        return this.isAllowedFiling(FilingTypes.CORRECTION)
      }

      case AllowableActions.COURT_ORDER: {
        return this.isAllowedFiling(FilingTypes.COURT_ORDER)
      }

      case AllowableActions.DETAIL_COMMENT: {
        return (isBusiness && this.isRoleStaff)
      }

      case AllowableActions.DIGITAL_CREDENTIALS: {
        // NB: specific Benefit Companies are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('enable-digital-credentials')
        const isNotaDcRoute = !(this.$route.matched.some(route => route.name === Routes.DIGITAL_CREDENTIALS))

        return (ff && isNotaDcRoute && this.isGoodStanding && this.isBComp && !this.isRoleStaff)
      }

      case AllowableActions.DIRECTOR_CHANGE: {
        if (this.isFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.CHANGE_OF_DIRECTORS)
      }

      case AllowableActions.FREEZE_UNFREEZE: {
        // this covers both Freeze and Unfreeze
        return this.isAllowedFiling(FilingTypes.ADMIN_FREEZE)
      }

      case AllowableActions.LIMITED_RESTO_CONVERT: {
        return this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.RESTORATION_CONVERSION)
      }

      case AllowableActions.LIMITED_RESTO_EXTEND: {
        return this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.RESTORATION_EXTENSION)
      }

      case AllowableActions.PUT_BACK_ON: {
        return this.isAllowedFiling(FilingTypes.PUT_BACK_ON)
      }

      case AllowableActions.RECORD_CONVERSION: {
        return this.isAllowedFiling(FilingTypes.CONVERSION)
      }

      case AllowableActions.REGISTRARS_NOTATION: {
        return this.isAllowedFiling(FilingTypes.REGISTRARS_NOTATION)
      }

      case AllowableActions.REGISTRARS_ORDER: {
        return this.isAllowedFiling(FilingTypes.REGISTRARS_ORDER)
      }

      case AllowableActions.RESTORATION: {
        return (
          this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.RESTORATION_FULL) ||
          this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.RESTORATION_LIMITED)
        )
      }

      case AllowableActions.STAFF_COMMENT: {
        return (isBusiness && this.isRoleStaff)
      }

      case AllowableActions.TRANSITION: {
        return this.isAllowedFiling(FilingTypes.TRANSITION)
      }

      case AllowableActions.VOLUNTARY_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-dissolution-entities')?.includes(this.getLegalType)
        // FUTURE: check dissolution type
        return (ff && this.isAllowedFiling(FilingTypes.DISSOLUTION))
      }

      default: return false // should never happen
    }
  }

  /**
   * Checks is specified filing is allowed.
   * @param name the filing type to check
   * @param type the filing subtype to check (optional)
   * @returns True if the specified filing is allowed, else False
   */
  private isAllowedFiling (name: FilingTypes, type = ''): boolean {
    const filingTypes = this.getAllowedActions?.filing?.filingTypes || []
    return filingTypes.some(ft => {
      if (ft.name !== name) return false
      if (type && ft.type !== type) return false
      return true
    })
  }
}
