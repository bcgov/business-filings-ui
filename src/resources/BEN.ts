import { CorpTypeCd } from '@/enums'
import { FilingCodes } from '@bcrs-shared-components/enums'

// FUTURE: this object needs an interface or type
export const BusinessConfigBen = {
  entityType: CorpTypeCd.BENEFIT_COMPANY,
  flows: [
    {
      feeCode: FilingCodes.ADDRESS_CHANGE_BC,
      displayName: 'Change Of Address',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See Sections 35 and 36 of the Business Corporations Act.'
    },
    {
      feeCode: FilingCodes.ANNUAL_REPORT_BC,
      displayName: 'Annual Report',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See Section 51 of the Business Corporations Act.'
    },
    {
      feeCode: FilingCodes.DIRECTOR_CHANGE_BC,
      displayName: 'Change Of Directors',
      certifyText: 'Note: It is an offence to make a false or misleading statement in ' +
          'respect of a material fact in a record submitted to the Corporate Registry for filing. ' +
          'See Section 127 of the Business Corporations Act.',
      warnings: {
        minDirectors: {
          count: 1,
          title: 'One Director Required',
          message: 'A minimum of one director is required, to be in compliance with the ' +
            'Business Corporations Act (Section 120). You can continue your filing, but you must ' +
            'become compliant with the Business Corporations Act as soon as possible.'
        }
      }
    },
    {
      feeCode: FilingCodes.CONTINUATION_OUT,
      displayName: 'Continuation Out',
      certifyText: 'Note: It is an offence to make or assist in making a false or' +
        ' misleading statement in a record filed under the Business Corporations Act.' +
        ' A person who commits this offence is subject to a maximum fine of $5,000.'
    },
    {
      feeCode: FilingCodes.AGM_EXTENSION,
      displayName: 'AGM Extension',
      certifyText: 'Note: It is an offence to make or assist in making a false or' +
        ' misleading statement in a record filed under the Business Corporations Act.' +
        ' A person who commits this offence is subject to a maximum fine of $5,000.'
    },
    {
      feeCode: FilingCodes.AGM_LOCATION_CHANGE,
      displayName: 'AGM Location Change',
      certifyText: 'Note: It is an offence to make or assist in making a false or' +
        ' misleading statement in a record filed under the Business Corporations Act.' +
        ' A person who commits this offence is subject to a maximum fine of $5,000.'
    }
  ],
  obligations: {
    title: 'Legal Obligations:',
    subtitle: 'The most common updates you are legally responsible to file include:',
    act: 'Business Corporations Act',
    obligationStatement: 'to keep the information about your corporation up to date with the Registrar: For ' +
      'example, you must file annual reports, director changes and address changes.',
    detailInfoURL: 'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business/' +
      'permits-licences/businesses-incorporated-companies/incorporated-companies#manage',
    includedChanges: [
      {
        label: 'Annual Reports',
        description: 'file an annual report each year within two months after each anniversary of the date on ' +
          'which the company was recognized. This ensures your company remains in good standing with the Registrar.'
      },
      {
        label: 'Director changes',
        description: 'update director information within 15 days of any change (appointing, ceasing or updating ' +
          'an existing director\'s name or address)'
      },
      {
        label: 'Company address changes',
        description: 'update any changes to a company\'s registered or records office addresses as they occur.'
      }
    ]
  },
  dissolutionConfirmation: {
    entityTitle: 'Company',
    subTitle: 'an incorporated company',
    act: 'Business Corporations',
    modalTitle: 'Voluntary Dissolution',
    confirmButtonText: 'Continue with Voluntary Dissolution',
    dissolutionType: 'voluntarily dissolve'
  },
  todoList: {
    title: 'Voluntary Dissolution'
  }
}
