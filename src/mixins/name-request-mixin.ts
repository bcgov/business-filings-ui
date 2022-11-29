import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { NameRequestStates, NameRequestTypes } from '@/enums'
import { NameRequestIF } from '@/interfaces'

/**
 * Mixin that provides some useful Name Request utilities.
 */
@Component({})
export default class NameRequestMixin extends Vue {
  /**
   * Returns True if the Name Request data is valid.
   * @param nr the name request response payload
   */
  isNrValid (nr: NameRequestIF): boolean {
    return Boolean(
      nr &&
      nr.applicants &&
      nr.expirationDate &&
      nr.legalType &&
      !!this.getNrApprovedName(nr) &&
      nr.nrNum &&
      (nr.request_action_cd === NameRequestTypes.NEW) &&
      nr.state &&
    )
  }

  /**
   * Returns the Name Request's state.
   * @param nr the name request response payload
   */
  getNrState (nr: NameRequestIF): NameRequestStates {
    // Ensure a NR payload is provided.
    if (!nr) {
      throw new Error('getNrState() : no NR provided')
    }

    // If the NR is awaiting consent, it is not consumable.
    // null = consent not required
    // R = consent received
    // N = consent waived
    // Y = consent required
    if (nr.state === NameRequestStates.CONDITIONAL &&
      nr.consentFlag !== null && nr.consentFlag !== 'R' && nr.consentFlag !== 'N') {
      return NameRequestStates.NEED_CONSENT
    }

    // If the NR's root state is not APPROVED / CONDITIONAL / EXPIRED / CONSUMED, it is not consumable.
    if (![NameRequestStates.APPROVED, NameRequestStates.CONDITIONAL,
      NameRequestStates.EXPIRED, NameRequestStates.CONSUMED].includes(nr.state)) {
      return NameRequestStates.NOT_APPROVED
    }

    // Otherwise, the NR is consumable.
    return nr.state // APPROVED or CONDITIONAL or CONSUMED or EXPIRED
  }

  /**
   * Returns the Name Request's approved name (or undefined or null if not found).
   * @param nr the name request response payload
   */
  getNrApprovedName (nr: NameRequestIF): string {
    if (nr?.names?.length > 0) {
      return nr.names
        .find(name => [NameRequestStates.APPROVED, NameRequestStates.CONDITION].includes(name.state))?.name
    }
    return null // should never happen
  }
}
