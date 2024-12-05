import { CorpTypeCd } from '@/enums'
import { FilingCodes } from '@bcrs-shared-components/enums'

// FUTURE: this object needs an interface or type
export const BusinessConfigCp = {
  entityType: CorpTypeCd.COOP,
  displayName: 'Cooperative',
  flows: [
    {
      feeCode: FilingCodes.ADDRESS_CHANGE_OT,
      displayName: 'Change Of Address',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See Section 27 of the Cooperative Association Act.'
    },
    {
      feeCode: FilingCodes.ANNUAL_REPORT_OT,
      displayName: 'Annual Report',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See Section 126 of the Cooperative Association Act.'
    },
    {
      feeCode: FilingCodes.DIRECTOR_CHANGE_OT,
      displayName: 'Change Of Directors',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See Section 78 of the Cooperative Association Act.',
      warnings: {
        minDirectors: {
          count: 3,
          title: 'Minimum Three Directors Required',
          message: 'A minimum of three directors are required, to be in compliance with the Cooperative ' +
            'Association Act (Section 72). You can continue your filing, but you must become compliant ' +
            'with the Cooperative Association Act as soon as possible.'
        },
        bcResident: {
          title: 'BC Resident Director Required',
          message: 'One of the directors of the association is required to be an ' +
            'individual ordinarily resident in British Columbia, to be in compliance ' +
            'with the Cooperative Association Act (Section 72). You can continue your filing, ' +
            'but you must become compliant with the Cooperative Association Act as soon as possible.'
        },
        canadianResident: {
          title: 'Canadian Resident Directors Required',
          message: 'A majority of the directors of the association are required to be individuals ordinarily ' +
            'resident in Canada, to be in compliance with the Cooperative Association Act (Section 72). ' +
            'You can continue your filing, but you must become compliant with the Cooperative ' +
            'Association Act as soon as possible.'
        },
        multiCompliance: {
        }
      }
    },
    {
      feeCode: FilingCodes.NOTICE_OF_WITHDRAWAL,
      displayName: 'Notice of Withdrawal',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See section 427 of the Business Corporations Act.'
    }
  ],
  dissolutionConfirmation: {
    entityTitle: 'Cooperative Association',
    subTitle: 'an incorporated cooperative',
    act: 'Cooperative Association',
    modalTitle: 'Voluntary Dissolution',
    confirmButtonText: 'Continue with Voluntary Dissolution',
    dissolutionType: 'voluntarily dissolve'
  },
  todoList: {
    title: 'Voluntary Dissolution'
  }
}
