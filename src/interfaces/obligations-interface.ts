export interface ObligationsResourceIF {
  title: string
  subtitle: string
  act: string
  obligationStatement: string
  detailInfoURL: string
  includedChanges: Array<ObligationsCopyIF>
}

interface ObligationsCopyIF {
  label: string
  description: string
}
