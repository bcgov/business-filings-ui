import Vue from 'vue'

export interface FilingData extends Vue {
  filingTypeCode: string
  entityType: string
  waiveFees: boolean
  priority: boolean
  futureEffective: boolean
}
