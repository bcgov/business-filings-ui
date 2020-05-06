export enum EntityStatus {
  GOOD_STANDING = 'GOODSTANDING',
  PENDING_DISSOLUTION = 'PENDINGDISSOLUTION',
  NOT_IN_COMPLIANCE = 'NOTINCOMPLIANCE',
  // overloaded values (used only before business exists):
  NAME_REQUEST = 'NAME_REQUEST',
  DRAFT_INCORP_APP = 'DRAFT_INCORP_APP',
  PENDING_INCORP_APP = 'PENDING_INCORP_APP',
}
