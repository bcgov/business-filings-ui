import { Component, Vue } from 'vue-property-decorator'
import { mapActions, mapState } from 'vuex'
import { FilingData } from '@/interfaces'
import { EntityTypes, FilingCodes, FilingTypes, FilingNames } from '@/enums'

/**
 * Mixin that provides some useful filing utilities.
 */
@Component({
  computed: {
    ...mapState(['filingData', 'entityType'])
  },
  methods: {
    ...mapActions(['setFilingData'])
  }
})
export default class FilingMixin extends Vue {
  // store actions
  readonly setFilingData!: (x: any) => void

  // store getters
  readonly filingData!: Array<FilingData>
  readonly entityType!: EntityTypes

  /**
   * Flattens and sorts an array of comments.
   * @param comments the array of comments to sort and deconstruct
   * @return the sorted and flattened array of comments
   */
  flattenAndSortComments (comments: Array<any>): Array<any> {
    if (comments && comments.length > 0) {
      // first use map to change comment.comment to comment
      const temp: Array<any> = comments.map(c => c.comment)
      // then sort newest to oldest
      temp.sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1)
      return temp
    }
    return []
  }

  /**
   * Converts the filing type to a filing name.
   * @param type the filing type converted
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   */
  typeToTitle (type: FilingTypes | string, agmYear: string = null): string {
    if (!type) return '' // safety check
    switch (type) {
      case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
      case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.DIRECTOR_CHANGE
      case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.ADDRESS_CHANGE
      case FilingTypes.CHANGE_OF_NAME: return FilingNames.LEGAL_NAME_CHANGE
      case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
      case FilingTypes.VOLUNTARY_DISSOLUTION: return FilingNames.VOLUNTARY_DISSOLUTION
      case FilingTypes.CORRECTION: return FilingNames.CORRECTION
    }
    // fallback for unknown filings
    return type.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
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
    let myFilingData: Array<FilingData> = this.filingData
    if (filingCode) {
      // always remove code if it already exists
      myFilingData = myFilingData.filter(el => el.filingTypeCode !== filingCode)

      // conditionally (re)add the code
      if (action === 'add') {
        myFilingData.push({
          filingTypeCode: filingCode,
          entityType: this.entityType,
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
   * @return True if the filing code exists, else False
   */
  hasFilingCode (filingCode: FilingCodes): boolean {
    return !!this.filingData.find(o => o.filingTypeCode === filingCode)
  }
}
