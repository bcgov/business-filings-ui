import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { getFeatureFlag } from '@/utils'
import { AllowableActions, CorpTypeCd, Routes } from '@/enums'

@Component({})
export default class AllowableActionsMixin extends Vue {
  @Getter getEntityType!: CorpTypeCd
  @Getter hasBlocker!: boolean
  @Getter isBComp!: boolean
  @Getter isBcCompany!: boolean
  @Getter isUlc!: boolean
  @Getter isHistorical!: boolean
  @Getter isRoleStaff!: boolean
  @Getter isSoleProp!: boolean
  @Getter isPartnership!: boolean
  @Getter isFirm!: boolean
  @Getter isCoop!: boolean
  @Getter hasBlockerExceptStaffApproval!: boolean
  @Getter isGoodStanding!: boolean

  /**
   * Returns True if the specified action is allowed, else False.
   * @param action the action to check
   */
  isAllowed (action: AllowableActions): boolean {
    const businessId = sessionStorage.getItem('BUSINESS_ID')

    switch (action) {
      case AllowableActions.ADD_DETAIL_COMMENT: {
        return (!!businessId && this.isRoleStaff)
      }

      case AllowableActions.ADD_STAFF_COMMENT: {
        return this.isRoleStaff
      }

      case AllowableActions.DISSOLVE_COMPANY: {
        const isDissolveAllowed = (!this.isHistorical && !!businessId &&
          !!getFeatureFlag('supported-dissolution-entities')?.includes(this.getEntityType))
        // if its not SP/GP , then consider hasBlocker flag (existing)
        if (!this.isFirm) {
          return isDissolveAllowed && !this.hasBlocker
        }

        return isDissolveAllowed
      }

      case AllowableActions.DOWNLOAD_BUSINESS_SUMMARY: {
        return (!!businessId &&
          !!getFeatureFlag('supported-business-summary-entities')?.includes(this.getEntityType))
      }

      case AllowableActions.EDIT_BUSINESS_PROFILE: {
        return !!businessId
      }

      case AllowableActions.FILE_ADDRESS_CHANGE: {
        return (!this.isHistorical && !this.hasBlocker && !!businessId)
      }

      case AllowableActions.FILE_ANNUAL_REPORT: {
        return (!this.isHistorical && !this.hasBlocker && !!businessId)
      }

      case AllowableActions.FILE_CORRECTION: {
        return (!this.isHistorical && !this.hasBlocker && !!businessId && this.isRoleStaff)
      }

      case AllowableActions.FILE_DIRECTOR_CHANGE: {
        return (!this.isHistorical && !this.hasBlocker && !!businessId)
      }

      case AllowableActions.FILE_STAFF_NOTATION: {
        return (!this.isHistorical && !this.hasBlockerExceptStaffApproval && !!businessId && this.isRoleStaff)
      }

      case AllowableActions.VIEW_CHANGE_COMPANY_INFO: {
        const isCoopAllowed = (!!getFeatureFlag('special-resolution-ui-enabled') && this.isCoop)
        return (!this.isHistorical &&
          !!businessId &&
          (this.isBComp || this.isBcCompany || this.isUlc || this.isSoleProp || this.isPartnership || isCoopAllowed)
        )
      }

      case AllowableActions.VIEW_ADD_DIGITAL_CREDENTIALS: {
        // Pilot is targeting specific Benefit Companies: Handled on LD Server Side
        const isFeatureEnabled = !!getFeatureFlag('enable-digital-credentials')
        const isNotaDcRoute = !(this.$route.matched.some(route => route.name === Routes.DIGITAL_CREDENTIALS))

        return isFeatureEnabled && isNotaDcRoute && this.isGoodStanding && this.isBComp && !this.isRoleStaff
      }

      default: return null
    }
  }
}
