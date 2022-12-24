/** Enum of page sizes. */
export enum PageSizes {
  LETTER_PORTRAIT = 'LETTER_PORTRAIT'
}

/** Type of page size dictionary. */
type PSD = Record<PageSizes, {
  pointsPerInch: number
  width: number
  height: number
  validationErrorMsg: string
}>

/** Dictionary of page sizes. */
export const PAGE_SIZE_DICT: PSD = {
  LETTER_PORTRAIT: {
    pointsPerInch: 72,
    width: 8.5,
    height: 11,
    validationErrorMsg: 'Document must be set to fit onto 8.5” x 11” letter-size paper'
  }
}
