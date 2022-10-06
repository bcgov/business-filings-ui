import { computed } from 'vue'
import { getFeatureFlag } from '@/utils'
import { AllowableActions, CorpTypeCd, Routes } from '@/enums'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()

export const AllowableActionsComposable = () => {
  const getEntityType = computed(() => store.getters['getEntityType'] as CorpTypeCd)
  const hasBlocker = computed(() => store.getters['hasBlocker'] as boolean)
  const isBComp = computed(() => store.getters['isBComp'] as boolean)
  const isBcCompany = computed(() => store.getters['isBcCompany'] as boolean)
  const isUlc = computed(() => store.getters['isUlc'] as boolean)
  const isHistorical = computed(() => store.getters['isHistorical'] as boolean)
  const isRoleStaff = computed(() => store.getters['isRoleStaff'] as boolean)
  const isSoleProp = computed(() => store.getters['isSoleProp'] as boolean)
  const isPartnership = computed(() => store.getters['isPartnership'] as boolean)
  const isFirm = computed(() => store.getters['isFirm'] as boolean)
  const isCoop = computed(() => store.getters['isCoop'] as boolean)
  const hasBlockerExceptStaffApproval = computed(() => store.getters['hasBlockerExceptStaffApproval'] as boolean)
  const isGoodStanding = computed(() => store.getters[''] as boolean)

  /**
   * Returns True if the specified action is allowed, else False.
   * @param action the action to check
   */
  const isAllowed = (action: AllowableActions): boolean => {
    const businessId = sessionStorage.getItem('BUSINESS_ID')

    switch (action) {
      case AllowableActions.ADD_DETAIL_COMMENT: {
        return (!!businessId && isRoleStaff.value)
      }

      case AllowableActions.ADD_STAFF_COMMENT: {
        return isRoleStaff.value
      }

      case AllowableActions.DISSOLVE_COMPANY: {
        const isDissolveAllowed = (!isHistorical.value && !!businessId &&
          !!getFeatureFlag('supported-dissolution-entities')?.includes(getEntityType.value))
        // if its not SP/GP , then consider hasBlocker flag (existing)
        if (!isFirm.value) {
          return isDissolveAllowed && !hasBlocker.value
        }

        return isDissolveAllowed
      }

      case AllowableActions.DOWNLOAD_BUSINESS_SUMMARY: {
        return (!!businessId &&
          !!getFeatureFlag('supported-business-summary-entities')?.includes(getEntityType.value))
      }

      case AllowableActions.EDIT_BUSINESS_PROFILE: {
        return !!businessId
      }

      case AllowableActions.FILE_ADDRESS_CHANGE: {
        return (!isHistorical.value && !hasBlocker.value && !!businessId)
      }

      case AllowableActions.FILE_ANNUAL_REPORT: {
        return (!isHistorical.value && !hasBlocker.value && !!businessId)
      }

      case AllowableActions.FILE_CORRECTION: {
        return (!isHistorical.value && !hasBlocker.value && !!businessId && isRoleStaff.value)
      }

      case AllowableActions.FILE_DIRECTOR_CHANGE: {
        return (!isHistorical.value && !hasBlocker.value && !!businessId)
      }

      case AllowableActions.FILE_STAFF_NOTATION: {
        return (!isHistorical.value && !hasBlockerExceptStaffApproval.value && !!businessId && isRoleStaff.value)
      }

      case AllowableActions.VIEW_CHANGE_COMPANY_INFO: {
        const isCoopAllowed = (!!getFeatureFlag('special-resolution-ui-enabled') && isCoop.value)
        return (!isHistorical.value &&
          !!businessId && (
          isBComp.value ||
          isBcCompany.value ||
          isUlc.value ||
          isSoleProp.value ||
          isPartnership.value ||
          isCoopAllowed)
        )
      }

      case AllowableActions.VIEW_ADD_DIGITAL_CREDENTIALS: {
        // Pilot is targeting specific Benefit Companies: Handled on LD Server Side
        const route = useRoute()
        const isFeatureEnabled = !!getFeatureFlag('enable-digital-credentials')
        const isNotaDcRoute = !(route.matched.some(route => route.name === Routes.DIGITAL_CREDENTIALS))

        return (isFeatureEnabled && isNotaDcRoute && isGoodStanding.value && isBComp.value && !isRoleStaff.value)
      }

      default: return null
    }
  }

  return {
    getEntityType,
    hasBlocker,
    isBComp,
    isBcCompany,
    isUlc,
    isHistorical,
    isRoleStaff,
    isSoleProp,
    isPartnership,
    isFirm,
    isCoop,
    hasBlockerExceptStaffApproval,
    isGoodStanding,
    isAllowed
  }
}
