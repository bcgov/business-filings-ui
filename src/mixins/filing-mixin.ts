import {Component} from 'vue-property-decorator'
import {DateMixin} from '@/mixins'
import {Action, Getter, State} from 'vuex-class'
import {
  CommentIF,
  CorrectionFilingIF,
  DissolutionFilingIF,
  FilingDataIF,
  OfficeAddressIF,
  RestorationFilingIF
} from '@/interfaces'
import {CorpTypeCd, CorrectionTypes, DissolutionTypes, FilingCodes, FilingTypes, RestorationTypes} from '@/enums'

/**
 * Mixin that provides some useful filing utilities.
 */
@Component({})
export default class FilingMixin extends DateMixin {
  @Action setFilingData!: (x: any) => void

  @State filingData!: Array<FilingDataIF>
  @State entityName!: string

  @Getter getCurrentDate!: string
  @Getter getEntityType!: CorpTypeCd
  @Getter getIdentifier!: string
  @Getter getEntityFoundingDate!: Date
  @Getter getRegisteredOfficeAddress!: OfficeAddressIF
  @Getter getBusinessAddress!: OfficeAddressIF

  /**
   * Flattens and sorts an array of comments.
   * @param comments the array of comments to sort and deconstruct
   * @returns the sorted and flattened array of comments
   */
  flattenAndSortComments (comments: Array<CommentIF>): Array<CommentIF> {
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
  updateFilingData (
    action: 'add' | 'remove',
    filingCode: FilingCodes | undefined,
    priority: boolean | undefined,
    waiveFees: boolean | undefined
  ): void {
    let myFilingData: Array<FilingDataIF> = [...this.filingData]
    if (filingCode) {
      // always remove code if it already exists
      myFilingData = myFilingData.filter(el => el.filingTypeCode !== filingCode)

      // conditionally (re)add the code
      if (action === 'add') {
        myFilingData.push({
          filingTypeCode: filingCode,
          entityType: this.getEntityType,
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
    this.setFilingData(myFilingData)
  }

  /**
   * Searches the Filing Data for a filing code.
   * @param filingCode the Filing Type Code to search for
   * @returns True if the filing code exists
   */
  hasFilingCode (filingCode: FilingCodes): boolean {
    return !!this.filingData.find(o => o.filingTypeCode === filingCode)
  }

  /**
   * Builds a Correction filing body.
   * @param correctedFiling the filing to correct
   * @param correctedType the correction type
   * @returns the filing body
   */
  buildCorrectionFiling (correctedFiling: any, correctionType: CorrectionTypes): CorrectionFilingIF {
    const correctionFiling: CorrectionFilingIF = {
      header: {
        date: this.getCurrentDate,
        name: FilingTypes.CORRECTION
      },
      business: {
        identifier: this.getIdentifier,
        legalName: this.entityName, // may be undefined
        legalType: this.getEntityType
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
   * Builds a Dissolution filing body.
   * @returns the filing body
   */
  buildDissolutionFiling (): DissolutionFilingIF {
    const dissolutionFiling: DissolutionFilingIF = {
      header: {
        date: this.getCurrentDate,
        name: FilingTypes.DISSOLUTION
      },
      business: {
        foundingDate: this.dateToApi(this.getEntityFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.entityName,
        legalType: this.getEntityType
      },
      dissolution: {
        custodialOffice: this.getRegisteredOfficeAddress,
        dissolutionType: DissolutionTypes.VOLUNTARY // FUTURE: apply dynamically when we have dissolution variations
      }
    }

    // Conditionally add the entity-specific sections.
    switch (this.getEntityType) {
      case CorpTypeCd.SOLE_PROP:
      case CorpTypeCd.PARTNERSHIP:
        dissolutionFiling.dissolution = {
          ...dissolutionFiling.dissolution,
          custodialOffice: this.getBusinessAddress || null
        }
        break
    }

    return dissolutionFiling
  }

  /**
   * Builds a Restoration filing body.
   * @returns the filing body
   */
  buildRestorationFiling (restorationType = RestorationTypes.FULL): RestorationFilingIF {
    return {
      header: {
        date: this.getCurrentDate,
        name: FilingTypes.RESTORATION
      },
      business: {
        foundingDate: this.dateToApi(this.getEntityFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.entityName,
        legalType: this.getEntityType
      },
      restoration: {
        type: restorationType
      }
    }
  }
}
