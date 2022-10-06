/**
 * Composable that provides some utilities for director data.
 */
export const DirectorComposable = () => {
  /**
   * Sorter function based on ES6 map reduce to sort the list of directors in the json.
   * @param fields the list of fields based on which director list needs to be sorted
   * @returns the sort function
   */
  const fieldSorter = (fields: Array<string>) => {
    return (a, b) => fields.map(o => {
      return a['officer'][o] > b['officer'][o] ? 1 : a['officer'][o] < b['officer'][o] ? -1 : 0
    }).reduce((p, n) => p || n, 0)
  }
  return {
    fieldSorter
  }
}
