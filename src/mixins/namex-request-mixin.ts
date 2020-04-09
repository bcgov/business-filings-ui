// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import { NameRequestStates } from '@/enums'

// Mixins
import { DateMixin } from '@/mixins'

/**
 * Mixin that provides some useful Name Request utilities.
 */
@Component
export default class NamexRequestMixin extends Mixins(DateMixin) {
  /**
   * Returns True if the Name Request data is valid.
   * @param nr the name request response payload
   */
  isNrValid (nr: any): boolean {
    return Boolean(nr &&
      nr.state &&
      nr.expirationDate &&
      nr.names?.length > 0 &&
      nr.nrNum &&
      nr.requestTypeCd)
  }

  /** Returns the Name Request's state. */
  getNrState (nr: any): NameRequestStates {
    // Ensure a NR payload is provided.
    if (!nr) {
      throw new Error('getNrState() : no NR provided')
    }

    // If the NR is expired, it is not consumable.
    const expireDays = this.daysFromToday(nr.expirationDate)
    if (isNaN(expireDays) || expireDays < 1) {
      return NameRequestStates.EXPIRED
    }

    // If the NR's root state is not APPROVED, it is not consumable.
    if (nr.state !== NameRequestStates.APPROVED) {
      return NameRequestStates.NOT_APPROVED
    }

    // NB: from here down, the NR is APPROVED

    // If the NR has already been consumed, it is not consumable.
    if (nr.names.some(name => name.consumptionDate)) {
      return NameRequestStates.CONSUMED
    }

    // If the NR is awaiting consent, it is not consumable.
    if (nr.consentFlag === false) {
      return NameRequestStates.NEED_CONSENT
    }

    // Otherwise, the NR is consumable.
    return NameRequestStates.APPROVED
  }
}
