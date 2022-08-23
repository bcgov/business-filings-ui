// Interface describing available v-data-table header properties
export interface TableHeaderIF {
  text: string
  value: string
  class?: string
  sortable?: boolean
  width?: string
  fixed?: boolean
  display?: boolean
}
