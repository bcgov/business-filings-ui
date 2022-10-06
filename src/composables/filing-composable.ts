import { computed, reactive } from 'vue'
import { DateComposable } from '@/composables'
import { CommentIF, CorrectionFilingIF, DissolutionFilingIF, FilingDataIF, OfficeAddressIF } from '@/interfaces'
import { CorpTypeCd, CorrectionTypes, DissolutionTypes, FilingCodes, FilingTypes } from '@/enums'
import { useStore } from 'vuex'

const store = useStore()

const filingComp = reactive({
  filingData: [] as Array<FilingDataIF>,
  entityName: null as string
})

const { dateToApi } = DateComposable()

/**
 * Composable that provides some useful filing utilities.
 */
export const FilingComposable = () => {
  const getCurrentDate = computed(() => store.getters['getCurrentDate'] as string)
  const getEntityType = computed(() => store.getters['getEntityType'] as CorpTypeCd)
  const getIdentifier = computed(() => store.getters['getIdentifier'] as string)
  const getEntityFoundingDate = computed(() => store.getters['getEntityFoundingDate'] as Date)
  const getRegisteredOfficeAddress = computed(() => store.getters[''] as OfficeAddressIF)
  const getBusinessAddress = computed(() => store.getters['getBusinessAddress'] as OfficeAddressIF)

  const setFilingData = (filingData: Array<FilingDataIF>) => {
    filingComp.filingData = filingData
  }

  /**
   * Flattens and sorts an array of comments.
   * @param comments the array of comments to sort and deconstruct
   * @returns the sorted and flattened array of comments
   */
  const flattenAndSortComments = (comments: Array<CommentIF>): Array<CommentIF> => {
    if (comments && comments.length > 0) {
      // first use map to change comment.comment to comment
      const temp: Array<any> = comments.map(c => c.comment)
      // then sort newest to oldest
      // NB: these `new Date()` are safe because we're comparing like units
      temp.sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1)
      return temp
    }
    return []
  }

  /**
   * Adds/removes filing code and/or sets flags in the Filing Data object.
   * @param action whether to add or remove the specified code/flags
   * @param filingCode the Filing Type Code to add or remove (optional)
   * @param priority the Priority flag to set or clear (sometimes optional - see examples)
   * @param waiveFees the Waive Fees flag to set or clear (sometimes optional - see examples)
   * @example updateFilingData('add', 'CRCTN', true, true) // adds Correction code with both flags set
   * @example updateFilingData('add', 'CRCTN', false, false) // adds Correction code both flags unset
   * @example updateFilingData('remove', 'CRCTN') // removes Correction code
   * @example updateFilingData('add', undefined, undefined, true) // adds Waive Fees flag to all codes
   * @example updateFilingData('remove', undefined, true, undefined) // removes Priority flag from all codes
   */
  const updateFilingData = (
    action: 'add' | 'remove',
    filingCode: FilingCodes | undefined,
    priority: boolean | undefined,
    waiveFees: boolean | undefined
  ): void => {
    let myFilingData: Array<FilingDataIF> = [...filingComp.filingData]
    if (filingCode) {
      // always remove code if it already exists
      myFilingData = myFilingData.filter(el => el.filingTypeCode !== filingCode)

      // conditionally (re)add the code
      if (action === 'add') {
        myFilingData.push({
          filingTypeCode: filingCode,
          entityType: getEntityType.value,
          priority: priority,
          waiveFees: waiveFees
        })
      }
    } else {
      // conditionally add/remove the flags to/from all codes
      myFilingData.forEach(element => {
        if (priority !== undefined) element.priority = (action === 'add')
        if (waiveFees !== undefined) element.waiveFees = (action === 'add')
      })
    }
    setFilingData(myFilingData)
  }

  /**
   * Searches the Filing Data for a filing code.
   * @param filingCode the Filing Type Code to search for
   * @returns True if the filing code exists
   */
  const hasFilingCode = (filingCode: FilingCodes): boolean => {
    return !!filingComp.filingData.find(o => o.filingTypeCode === filingCode)
  }

  /**
   * Builds a Correction filing body.
   * @param correctedFiling the filing to correct
   * @param correctedType the correction type
   * @returns the filing body
   */
  const buildCorrectionFiling = (correctedFiling: any, correctionType: CorrectionTypes): CorrectionFilingIF => {
    const correctionFiling: CorrectionFilingIF = {
      header: {
        date: getCurrentDate.value,
        name: FilingTypes.CORRECTION
      },
      business: {
        identifier: getIdentifier.value,
        legalName: filingComp.entityName, // may be undefined
        legalType: getEntityType.value
      },
      correction: {
        comment: '',
        correctedFilingDate: correctedFiling.submittedDate,
        correctedFilingId: correctedFiling.filingId,
        correctedFilingType: correctedFiling.name,
        type: correctionType
      }
    }

    return correctionFiling
  }

  /**
   * Builds a Dissolution filing body. Used when creating a draft Dissolution filing.
   * @returns the filing body
   */
  const buildDissolutionFiling = (): DissolutionFilingIF => {
    const dissolutionFiling: DissolutionFilingIF = {
      header: {
        date: getCurrentDate.value,
        name: FilingTypes.DISSOLUTION
      },
      business: {
        foundingDate: dateToApi(getEntityFoundingDate.value),
        identifier: getIdentifier.value,
        legalName: filingComp.entityName,
        legalType: getEntityType.value
      },
      dissolution: {
        custodialOffice: getRegisteredOfficeAddress.value,
        dissolutionType: DissolutionTypes.VOLUNTARY // FUTURE: apply dynamically when we have dissolution variations
      }
    }

    // Conditionally add the entity-specific sections.
    switch (getEntityType.value) {
      case CorpTypeCd.SOLE_PROP:
      case CorpTypeCd.PARTNERSHIP:
        dissolutionFiling.dissolution = {
          ...dissolutionFiling.dissolution,
          custodialOffice: getBusinessAddress.value || null
        }
        break
    }

    return dissolutionFiling
  }
  return {
    filingComp,
    getCurrentDate,
    getEntityType,
    getIdentifier,
    getEntityFoundingDate,
    getRegisteredOfficeAddress,
    getBusinessAddress,
    setFilingData,
    flattenAndSortComments,
    updateFilingData,
    hasFilingCode,
    buildCorrectionFiling,
    buildDissolutionFiling
  }
}
