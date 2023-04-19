import { Component } from 'vue-property-decorator'
import { DateMixin } from '@/mixins'
import { Action, Getter, State } from 'vuex-class'
import {
  CorrectionFilingIF,
  DissolutionFilingIF,
  FilingDataIF,
  OfficeAddressIF,
  RestorationFilingIF
} from '@/interfaces'
import {
  CorpTypeCd,
  CorrectionTypes,
  FilingCodes,
  FilingSubTypes,
  FilingTypes
} from '@/enums'

/**
 * Mixin that provides some useful filing utilities.
 */
@Component({})
export default class FilingMixin extends DateMixin {
  @Action setFilingData!: (x: any) => void

  // FUTURE: change these to getters
  @State filingData!: Array<FilingDataIF>
  @State entityName!: string

  @Getter getBusinessAddress!: OfficeAddressIF
  @Getter getCurrentDate!: string
  @Getter getFoundingDate!: Date
  @Getter getIdentifier!: string
  @Getter getLegalType!: CorpTypeCd
  @Getter getRegisteredOfficeAddress!: OfficeAddressIF

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
          entityType: this.getLegalType,
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
        legalType: this.getLegalType
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
        foundingDate: this.dateToApi(this.getFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.entityName,
        legalType: this.getLegalType
      },
      dissolution: {
        custodialOffice: this.getRegisteredOfficeAddress,
        // FUTURE: apply type dynamically when we have dissolution variations
        dissolutionType: FilingSubTypes.DISSOLUTION_VOLUNTARY
      }
    }

    // Conditionally add the entity-specific sections.
    switch (this.getLegalType) {
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
  buildRestorationFiling (restorationType = FilingSubTypes.FULL_RESTORATION): RestorationFilingIF {
    const restoration: RestorationFilingIF = {
      header: {
        date: this.getCurrentDate,
        name: FilingTypes.RESTORATION
      },
      business: {
        foundingDate: this.dateToApi(this.getFoundingDate),
        identifier: this.getIdentifier,
        legalName: this.entityName,
        legalType: this.getLegalType
      },
      restoration: {
        type: restorationType
      }
    }
    return restoration
  }
}
