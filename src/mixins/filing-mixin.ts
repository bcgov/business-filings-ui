import { Component, Mixins } from 'vue-property-decorator'
import { DateMixin } from '@/mixins'
import { Action, State, Getter } from 'vuex-class'
import { CommentIF, CorrectionFilingIF, DissolutionFilingIF, FilingDataIF, OfficeAddressIF } from '@/interfaces'
import { CorpTypeCd, DissolutionTypes, FilingCodes, FilingTypes } from '@/enums'

/**
 * Mixin that provides some useful filing utilities.
 */
@Component({})
export default class FilingMixin extends Mixins(DateMixin) {
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
   * Builds an Incorporation Application Correction filing body from IA filing.
   * Used when creating an IA Correction.
   * @returns the IA Correction filing body
   */
  buildIaCorrectionFiling (iaFiling: any): CorrectionFilingIF {
    const correctionFiling: CorrectionFilingIF = {
      header: {
        name: FilingTypes.CORRECTION,
        certifiedBy: iaFiling.header.certifiedBy,
        date: this.getCurrentDate
      },
      business: {
        legalType: iaFiling.business.legalType,
        identifier: iaFiling.business.identifier,
        legalName: iaFiling.business.legalName
      },
      correction: {
        correctedFilingId: iaFiling.header.filingId,
        correctedFilingType: FilingTypes.INCORPORATION_APPLICATION,
        correctedFilingDate: iaFiling.header.date,
        comment: ''
      },
      incorporationApplication: iaFiling.incorporationApplication
    }

    return correctionFiling
  }

  /**
   * Builds a Firm Correction filing body from a Change of Registration filing
   * or Registration filing. Used when creating a Firm Correction.
   * @returns the Firm Correction filing body
   */
  buildFmCorrectionFiling (regFiling: any): CorrectionFilingIF {
    const correctionFiling: CorrectionFilingIF = {
      header: {
        name: FilingTypes.CORRECTION,
        certifiedBy: regFiling.header.certifiedBy,
        date: this.getCurrentDate
      },
      business: {
        legalType: regFiling.business.legalType,
        identifier: regFiling.business.identifier,
        legalName: regFiling.business.legalName
      },
      correction: {
        correctedFilingId: regFiling.header.filingId,
        correctedFilingType: FilingTypes.REGISTRATION,
        correctedFilingDate: regFiling.header.date,
        comment: ''
      },
      // FUTURE: update this when schema and API are updated
      // changeOfRegistration: regFiling.changeOfRegistration ? regFiling : undefined, // uncomment this
      // registration: regFiling.registration ? regFiling : undefined, // uncomment this
      incorporationApplication: {} // remove this
    }

    return correctionFiling
  }

  /**
   * Builds an Dissolution filing body to intialize a draft.
   * Used when creating a draft Dissolution filing.
   * @returns the Dissolution filing body
   */
  buildDissolutionFiling (): DissolutionFilingIF {
    const dissolutionFiling: DissolutionFilingIF = {
      header: {
        name: FilingTypes.DISSOLUTION,
        date: this.getCurrentDate
      },
      business: {
        legalType: this.getEntityType,
        identifier: this.getIdentifier,
        legalName: this.entityName,
        foundingDate: this.dateToApi(this.getEntityFoundingDate)
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
        dissolutionFiling.dissolution = { ...dissolutionFiling.dissolution,
          custodialOffice: this.getBusinessAddress || null

        }
        break
    }

    return dissolutionFiling
  }
}
