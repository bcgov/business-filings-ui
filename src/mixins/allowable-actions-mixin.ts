import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { getFeatureFlag } from '@/utils'
import { AllowableActions, CorpTypeCd, Routes } from '@/enums'

@Component({})
export default class AllowableActionsMixin extends Vue {
  @Getter getEntityType!: CorpTypeCd
  @Getter hasBlocker!: boolean
  @Getter hasBlockerExceptStaffApproval!: boolean
  @Getter isBComp!: boolean
  @Getter isBenBcCccUlc!: boolean
  @Getter isCoop!: boolean
  @Getter isGoodStanding!: boolean
  @Getter isHistorical!: boolean
  @Getter isPartnership!: boolean
  @Getter isRoleStaff!: boolean
  @Getter isSoleProp!: boolean

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
        const isDissolveAllowed = (
          !this.isHistorical &&
          !!businessId &&
          !!getFeatureFlag('supported-dissolution-entities')?.includes(this.getEntityType)
        )

        // if it's not SP/GP then consider hasBlocker flag
        if (!this.isSoleProp && !this.isPartnership) {
          return isDissolveAllowed && !this.hasBlocker
        }

        return isDissolveAllowed
      }

      case AllowableActions.DOWNLOAD_BUSINESS_SUMMARY: {
        return (!!businessId &&
          !!getFeatureFlag('supported-business-summary-entities')?.includes(this.getEntityType))
      }

      case AllowableActions.EDIT_BUSINESS_PROFILE: {
        return !!businessId // FUTURE: disable for staff? see #14314
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
        const isAllowedEntityType = (
          this.isBenBcCccUlc ||
          (this.isCoop && !!getFeatureFlag('special-resolution-ui-enabled')) ||
          this.isPartnership ||
          this.isSoleProp
        )
        return (!this.isHistorical && !!businessId && isAllowedEntityType)
      }

      case AllowableActions.VIEW_ADD_DIGITAL_CREDENTIALS: {
        // Pilot is targeting specific Benefit Companies: Handled on LD Server Side
        const isFeatureEnabled = !!getFeatureFlag('enable-digital-credentials')
        const isNotaDcRoute = !(this.$route.matched.some(route => route.name === Routes.DIGITAL_CREDENTIALS))

        return (isFeatureEnabled && isNotaDcRoute && this.isGoodStanding && this.isBComp && !this.isRoleStaff)
      }

      default: return null
    }
  }
}
