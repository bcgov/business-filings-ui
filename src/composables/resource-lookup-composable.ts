import { computed, reactive } from 'vue'
import { AlertMessageIF, ObligationsResourceIF } from '@/interfaces'
import { FilingCodes } from '@/enums'
import { useStore } from 'vuex'

const store = useStore()

const configObjectComp = reactive({
  configObject: null as any
})

/**
 * Composable for components to retrieve text/settings from JSON resource.
 */
export const ResourceLookupComposable = () => {
  /** The obligations content for the current entity type. */
  const getObligations = computed(() => configObjectComp.configObject?.obligations as ObligationsResourceIF)
  const isBComp = computed(() => store.getters['isBComp'] as boolean)

  /**
   * Returns certify message using the configuration lookup object.
   * @param entity the entity type of the component
   * @returns the appropriate message for the certify component for the current filing flow
   */
  const certifyText = (feeCode: string): string => {
    const flow = configObjectComp.configObject?.flows?.find(x => x.feeCode === feeCode)
    if (flow?.certifyText) {
      return flow.certifyText
    }
    return ''
  }

  /**
   * Returns the current entity's full display name.
   * @returns the entity display name (if the configuration has been loaded)
   */
  const displayName = (): string => {
    return configObjectComp.configObject?.displayName || ''
  }

  /**
   * Validates directors on edit/cease and return any warning messages.
   * @returns the compliance message or null (if the configuration has been loaded)
   */
  const directorWarning = (directors: Array<any>): AlertMessageIF => {
    const filingCode = isBComp.value ? FilingCodes.DIRECTOR_CHANGE_BC : FilingCodes.DIRECTOR_CHANGE_OT
    // FUTURE: Too much code for this. Can be condensed and made more reusable.
    if (directors?.length) {
      const warnings = configObjectComp.configObject?.flows?.find(x => x.feeCode === filingCode)?.warnings
      const errors = []
      // If this entity has a BC Residency requirement for directors, one of the
      // directors specified needs to have both their mailing and delivery address within British Columbia
      if (warnings?.bcResident) {
        if (directors.filter(x => (x.deliveryAddress.addressRegion !== 'BC' ||
                                  (x.mailingAddress &&
                                    x.mailingAddress.addressRegion !== 'BC'))).length === directors.length) {
          // If no directors reside in BC, retrieve the appropriate alert message
          errors.push({
            'title': warnings.bcResident.title,
            'msg': warnings.bcResident.message
          })
        }
      }
      // If this entity has a Canadian Residency requirement for directors, the majority
      // of directors need to have both their mailing and delivery address within Canada
      if (warnings?.canadianResident) {
        const count = directors.length
        const notCanadian = directors.filter(x => (x.deliveryAddress.addressCountry !== 'CA' ||
                                                  (x.mailingAddress &&
                                                    x.mailingAddress.addressCountry !== 'CA'))).length
        // If the majority of the directors do not reside in Canada, retrieve the appropriate alert message
        if (notCanadian / count > 0.5) {
          errors.push({
            'title': warnings.canadianResident.title,
            'msg': warnings.canadianResident.message
          })
        }
      }
      // Check if this entity has the minimum number of directors
      if (warnings?.minDirectors) {
        const min = warnings.minDirectors.count
        if (directors.filter(x => x.actions.indexOf('ceased') < 0).length < min) {
          errors.push({
            'title': warnings.minDirectors.title,
            'msg': warnings.minDirectors.message
          })
        }
      }

      if (errors.length > 0) {
        return errors[0]
      }
    }
    return null
  }
  return {
    configObjectComp,
    getObligations,
    isBComp,
    certifyText,
    displayName,
    directorWarning
  }
}
