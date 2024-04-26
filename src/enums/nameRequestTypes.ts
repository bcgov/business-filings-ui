/** Enum to help map name request type codes */
export enum NameRequestTypes {
  AMALGAMATION = 'AML',
  NEW = 'NEW',
  CHANGE_OF_NAME = 'CHG',
  CONVERSION = 'CNV',
  CONTINUATION_IN = 'MVE'
  // Expand types here as required. Add description in getNrRequestDesc via NameRequestMixin.
}
