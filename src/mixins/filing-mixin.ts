import { Component } from 'vue-property-decorator'
import DateMixin from './date-mixin'
import { Action, Getter } from 'pinia-class'
import { FilingDataIF } from '@/interfaces'
import { CorpTypeCd } from '@/enums'
import { FilingCodes } from '@bcrs-shared-components/enums'
import { useBusinessStore, useRootStore } from '@/stores'

/**
 * Mixin that provides some useful filing utilities.
 */
@Component({})
export default class FilingMixin extends DateMixin {
  @Action(useRootStore) setFilingData!: (x: any) => void

  @Getter(useRootStore) filingData!: Array<FilingDataIF>
  @Getter(useBusinessStore) getLegalType!: CorpTypeCd

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
}
