import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { GetFeatureFlag } from '@/utils'
import { AllowableActions, CorpTypeCd, FilingSubTypes } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { AllowedActionsIF } from '@/interfaces'
import { useBusinessStore } from '@/stores'

@Component({})
export default class AllowableActionsMixin extends Vue {
  @Getter(useBusinessStore) getAllowedActions!: AllowedActionsIF
  @Getter(useBusinessStore) getLegalType!: CorpTypeCd
  @Getter(useBusinessStore) isEntityCoop!: boolean
  @Getter(useBusinessStore) isEntityFirm!: boolean
  @Getter(useBusinessStore) isEntitySoleProp!: boolean
  @Getter(useBusinessStore) isGoodStanding!: boolean

  /**
   * Returns True if the specified action is allowed, else False.
   * @param action the action to check
   */
  isAllowed (action: AllowableActions): boolean {
    const isBusiness = !!sessionStorage.getItem('BUSINESS_ID') // ie, not a temporary business

    switch (action) {
      case AllowableActions.ADDRESS_CHANGE: {
        if (this.isEntityFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.CHANGE_OF_ADDRESS)
      }

      case AllowableActions.ADMINISTRATIVE_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-dissolution-entities')?.includes(this.getLegalType)
        return (ff && this.isAllowedFiling(FilingTypes.DISSOLUTION, FilingSubTypes.DISSOLUTION_ADMINISTRATIVE))
      }

      case AllowableActions.AGM_EXTENSION: {
        return this.isAllowedFiling(FilingTypes.AGM_EXTENSION)
      }

      case AllowableActions.AGM_LOCATION_CHANGE: {
        return this.isAllowedFiling(FilingTypes.AGM_LOCATION_CHANGE)
      }

      case AllowableActions.AMALGAMATION: {
        return this.isAllowedFiling(FilingTypes.AMALGAMATION_APPLICATION)
      }

      case AllowableActions.AMALGAMATION_OUT: {
        return this.isAllowedFiling(FilingTypes.AMALGAMATION_OUT)
      }

      case AllowableActions.ANNUAL_REPORT: {
        return this.isAllowedFiling(FilingTypes.ANNUAL_REPORT)
      }

      case AllowableActions.BUSINESS_INFORMATION: {
        if (this.isEntityCoop) {
          // NB: this feature is targeted via LaunchDarkly
          const ff = !!GetFeatureFlag('special-resolution-ui-enabled')
          return (ff && this.isAllowedFiling(FilingTypes.SPECIAL_RESOLUTION))
        }
        if (this.isEntityFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.ALTERATION)
      }

      case AllowableActions.BUSINESS_SUMMARY: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-business-summary-entities')?.includes(this.getLegalType)
        return (ff && isBusiness)
      }

      case AllowableActions.CONSENT_AMALGAMATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONSENT_AMALGAMATION_OUT)
      }

      case AllowableActions.CONSENT_CONTINUATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONSENT_CONTINUATION_OUT)
      }

      case AllowableActions.CONTINUATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONTINUATION_OUT)
      }

      case AllowableActions.CORRECTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-correction-entities')?.includes(this.getLegalType)
        return (ff && this.isAllowedFiling(FilingTypes.CORRECTION))
      }

      case AllowableActions.COURT_ORDER: {
        return this.isAllowedFiling(FilingTypes.COURT_ORDER)
      }

      case AllowableActions.DIGITAL_CREDENTIALS: {
        // NB: this feature is targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('enable-digital-credentials')
        const isDigitalBusinessCardAllowed = this.getAllowedActions?.digitalBusinessCard
        return (ff && isDigitalBusinessCardAllowed)
      }

      case AllowableActions.DIRECTOR_CHANGE: {
        if (this.isEntityFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.CHANGE_OF_DIRECTORS)
      }

      case AllowableActions.FREEZE_UNFREEZE: {
        // this covers both Freeze and Unfreeze
        return this.isAllowedFiling(FilingTypes.ADMIN_FREEZE)
      }

      case AllowableActions.LIMITED_RESTORATION_EXTENSION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-restoration-entities')?.includes(this.getLegalType)
        return (ff && this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.LIMITED_RESTORATION_EXTENSION))
      }

      case AllowableActions.LIMITED_RESTORATION_TO_FULL: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-restoration-entities')?.includes(this.getLegalType)
        return (ff && this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.LIMITED_RESTORATION_TO_FULL))
      }

      case AllowableActions.PUT_BACK_ON: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-put-back-on-entities')?.includes(this.getLegalType)
        return (ff && this.isAllowedFiling(FilingTypes.PUT_BACK_ON))
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
        // NB: specific entities are targeted via LaunchDarkly
        // NB: this applies to full restoration or limited restoration
        // but not limited restoration extension or limited restoration to full
        const ff = !!GetFeatureFlag('supported-restoration-entities')?.includes(this.getLegalType)
        return (
          ff &&
          (
            this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.FULL_RESTORATION) ||
            this.isAllowedFiling(FilingTypes.RESTORATION, FilingSubTypes.LIMITED_RESTORATION)
          )
        )
      }

      case AllowableActions.TRANSITION: {
        return this.isAllowedFiling(FilingTypes.TRANSITION)
      }

      case AllowableActions.VOLUNTARY_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!GetFeatureFlag('supported-dissolution-entities')?.includes(this.getLegalType)
        return (ff && this.isAllowedFiling(FilingTypes.DISSOLUTION, FilingSubTypes.DISSOLUTION_VOLUNTARY))
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
  private isAllowedFiling (name: FilingTypes, type: FilingSubTypes = null): boolean {
    const filingTypes = this.getAllowedActions?.filing?.filingTypes || []
    return filingTypes.some(ft => {
      if (ft.name !== name) return false
      if (type && ft.type !== type) return false
      return true
    })
  }
}
