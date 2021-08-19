// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import { CorpTypeCd, NameRequestStates, NrNameStates } from '@/enums'
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

    // If the NR is awaiting consent, it is not consumable.
    // null = consent not required
    // R = consent received
    // N = consent waived
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
    return nr.state // APPROVED or CONDITIONAL or EXPIRED or CONSUMED
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
      entityType: nr.legalType,
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
        approvedName: this.getApprovedName(nr) || '',
        consentFlag: nr.consentFlag,
        expirationDate: nr.expirationDate,
        status: nr.state
      }
    }
  }

  /**
   * Returns the Name Request's approved name (or undefined or null if not found).
   * @param nr the name request response payload
   */
  getApprovedName (nr: any): string {
    if (nr?.names?.length > 0) {
      return nr.names.find(name => [NrNameStates.APPROVED, NrNameStates.CONDITION].includes(name.state)).name
    }
    return null // should never happen
  }
}
