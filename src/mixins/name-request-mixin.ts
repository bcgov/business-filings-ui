// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import { EntityTypes, NameRequestStates } from '@/enums'
import { NameRequestIF } from '@/interfaces'

// Mixins
import { DateMixin } from '@/mixins'

/**
 * Mixin that provides some useful Name Request utilities.
 */
@Component
export default class NameRequestMixin extends Mixins(DateMixin) {
  /**
   * Returns True if the Name Request data is valid.
   * @param nr the name request response payload
   */
  isNrValid (nr: any): boolean {
    return Boolean(nr &&
      nr.state &&
      nr.expirationDate &&
      nr.names?.length > 0 &&
      // workaround for old or new property name
      (nr.nrNum || nr.nrNumber) &&
      nr.requestTypeCd)
  }

  /**
   * Returns the Name Request's state.
   * @param nr the name request response payload
   */
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

    // If the NR is awaiting consent, it is not consumable.
    // null = consent not required
    // R = consent received
    // N = consent waived
    if (nr.state === NameRequestStates.CONDITIONAL &&
      nr.consentFlag !== null && nr.consentFlag !== 'R' && nr.consentFlag !== 'N') {
      return NameRequestStates.NEED_CONSENT
    }

    // If the NR's root state is not APPROVED or CONDITIONAL, it is not consumable.
    if (nr.state !== NameRequestStates.APPROVED && nr.state !== NameRequestStates.CONDITIONAL) {
      return NameRequestStates.NOT_APPROVED
    }

    // If the NR has already been consumed, it is not consumable.
    if (nr.names.some(name => name.consumptionDate)) {
      return NameRequestStates.CONSUMED
    }

    // Otherwise, the NR is consumable.
    return nr.state // APPROVED or CONDITIONAL
  }

  /**
   * Parses Name Request from namex response into our NR object.
   * @param nr the name request response payload
   * @param filingId the filing id
   */
  parseNameRequest (nr: any, filingId: number): NameRequestIF {
    return {
      // workaround for old or new property name
      nrNumber: nr.nrNum || nr.nrNumber,
      // FUTURE: Update entityType to use nr.requestTypeCd when namex supports our entity types
      entityType: EntityTypes.BENEFIT_COMPANY,
      filingId: filingId,
      applicant: {
        // Address Information
        addressLine1: nr.applicants.addrLine1,
        addressLine2: nr.applicants.addrLine2,
        addressLine3: nr.applicants.addrLine3,
        city: nr.applicants.city,
        countryTypeCode: nr.applicants.countryTypeCd,
        postalCode: nr.applicants.postalCd,
        stateProvinceCode: nr.applicants.stateProvinceCd,

        // Application contact information
        emailAddress: nr.applicants.emailAddress,
        phoneNumber: nr.applicants.phoneNumber,

        // Application name information
        firstName: nr.applicants.firstName,
        middleName: nr.applicants.middleName,
        lastName: nr.applicants.lastName
      },
      details: {
        approvedName: this.getApprovedName(nr),
        consentFlag: nr.consentFlag,
        expirationDate: nr.expirationDate,
        status: nr.state
      }
    }
  }

  /**
   * Returns the Name Request's approved name.
   * @param nr the name request response payload
   */
  getApprovedName (nr: any): string {
    if (nr.state === NameRequestStates.APPROVED) {
      return nr.names.find(name => name.state === NameRequestStates.APPROVED).name
    }
    if (nr.state === NameRequestStates.CONDITIONAL) {
      return nr.names.find(name => name.state === NameRequestStates.CONDITION).name
    }
    return '' // should never happen
  }
}
