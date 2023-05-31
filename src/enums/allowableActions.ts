/** Enum used internally to query allowable actions via mixin. */
export enum AllowableActions {
  ADDRESS_CHANGE = 1, // skip 0 which is falsy
  ADMINISTRATIVE_DISSOLUTION,
  ANNUAL_REPORT,
  BUSINESS_INFORMATION,
  BUSINESS_SUMMARY,
  CONSENT_CONTINUATION_OUT,
  CONTINUATION_OUT,
  CORRECTION,
  COURT_ORDER,
  DETAIL_COMMENT,
  DIGITAL_CREDENTIALS,
  DIRECTOR_CHANGE,
  FREEZE_UNFREEZE,
  LIMITED_RESTORATION_EXTENSION,
  LIMITED_RESTORATION_TO_FULL,
  PUT_BACK_ON,
  RECORD_CONVERSION,
  REGISTRARS_NOTATION,
  REGISTRARS_ORDER,
  RESTORATION,
  STAFF_COMMENT,
  TRANSITION,
  VOLUNTARY_DISSOLUTION,
}
