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
    switch (action) {
      case AllowableActions.ADDRESS_CHANGE: {
        if (this.isEntityFirm) {
          return this.isAllowedFiling(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return this.isAllowedFiling(FilingTypes.CHANGE_OF_ADDRESS)
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

      case AllowableActions.CONSENT_AMALGAMATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONSENT_AMALGAMATION_OUT)
      }

      case AllowableActions.CONSENT_CONTINUATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONSENT_CONTINUATION_OUT)
      }

      case AllowableActions.CONTINUATION_OUT: {
        return this.isAllowedFiling(FilingTypes.CONTINUATION_OUT)
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
