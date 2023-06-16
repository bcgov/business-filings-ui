import { CorpTypeCd, FilingCodes } from '@/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'

export class Flow {
  feeCode: FilingCodes
  displayName: string
  certifyText: string
}

export class Business {
  entityType: CorpTypeCd
  displayName: string
  flows: Array<Flow>
}

// FUTURE: this object needs an interface or type
export const ConfigJson = [
  {
    entityType: CorpTypeCd.BENEFIT_COMPANY,
    displayName: 'Benefit Company',
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
  },
  {
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
  },
  {
    entityType: CorpTypeCd.SOLE_PROP,
    displayName: GetCorpFullDescription(CorpTypeCd.SOLE_PROP),
    flows: [
      {
        feeCode: null,
        displayName: 'Change Of Address',
        certifyText: ''
      },
      {
        feeCode: null,
        displayName: 'Annual Report',
        certifyText: ''
      },
      {
        feeCode: null,
        displayName: 'Change Of Directors',
        certifyText: ''
      }
    ],
    obligations: {
      title: 'Obligations:',
      subtitle: 'Changes include:',
      act: 'Partnership Act',
      obligationStatement: 'to keep the information about your firm up to date with the Registrar. Please update ' +
        'changes as they occur. ',
      detailInfoURL: 'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business/' +
        'permits-licences/businesses-incorporated-companies/proprietorships-partnerships',
      includedChanges: [
        {
          label: 'Business name changes',
          description: 'changing the name of your business will also require a new Name Request.'
        },
        {
          label: 'Business address changes',
          description: 'change the delivery address and mailing address of your business.'
        },
        {
          label: 'Proprietor/Partner address or legal name changes ',
          description: 'change the legal name or mailing and delivery addresses of an existing Proprietor or Partner.'
        },
        {
          label: 'Membership of Partnership changes ',
          description: 'change the partners of your General Partnership.'
        },
        {
          label: 'Nature of business changes',
          description: 'significant changes to the nature of your business.'
        },
        {
          label: 'Dissolving a Sole Proprietorship or Partnership ',
          description: 'when a business is no longer required it needs to be dissolved.'
        }
      ]
    },
    dissolutionConfirmation: {
      entityTitle: 'Sole Proprietorship',
      subTitle: 'a registered business',
      act: 'Partnership',
      modalTitle: 'Dissolution',
      confirmButtonText: 'Continue with Dissolution',
      additionalLabel: 'Make sure your business information is up to date before dissolving.',
      dissolutionType: 'dissolve'
    },
    todoList: {
      title: 'Dissolution'
    }
  },
  {
    entityType: CorpTypeCd.PARTNERSHIP,
    displayName: GetCorpFullDescription(CorpTypeCd.PARTNERSHIP),
    flows: [
      {
        feeCode: null,
        displayName: 'Change Of Address',
        certifyText: ''
      },
      {
        feeCode: null,
        displayName: 'Annual Report',
        certifyText: ''
      },
      {
        feeCode: null,
        displayName: 'Change Of Directors',
        certifyText: ''
      }
    ],
    obligations: {
      title: 'Obligations:',
      subtitle: 'Changes include:',
      act: 'Partnership Act',
      obligationStatement: 'to keep the information about your firm up to date with the Registrar. Please update ' +
        'changes as they occur. ',
      detailInfoURL: 'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business/' +
        'permits-licences/businesses-incorporated-companies/proprietorships-partnerships',
      includedChanges: [
        {
          label: 'Business name changes',
          description: 'changing the name of your business will also require a new Name Request.'
        },
        {
          label: 'Business address changes',
          description: 'change the delivery address and mailing address of your business.'
        },
        {
          label: 'Proprietor/Partner address or legal name changes ',
          description: 'change the legal name or mailing and delivery addresses of an existing Proprietor or Partner.'
        },
        {
          label: 'Membership of Partnership changes ',
          description: 'change the partners of your General Partnership.'
        },
        {
          label: 'Nature of business changes',
          description: 'significant changes to the nature of your business.'
        },
        {
          label: 'Dissolving a Sole Proprietorship or Partnership ',
          description: 'when a business is no longer required it needs to be dissolved.'
        }
      ]
    },
    dissolutionConfirmation: {
      entityTitle: 'General Partnership',
      subTitle: 'a registered business',
      act: 'Partnership',
      modalTitle: 'Dissolution',
      confirmButtonText: 'Continue with Dissolution',
      additionalLabel: 'Make sure your business information is up to date before dissolving.',
      dissolutionType: 'dissolve'
    },
    todoList: {
      title: 'Dissolution'
    }
  },
  {
    entityType: CorpTypeCd.BC_COMPANY,
    displayName: 'Limited Company',
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
  },
  {
    entityType: CorpTypeCd.BC_CCC,
    displayName: 'Community Contribution Company',
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
            count: 3,
            title: 'Three Directors Required',
            message: 'A minimum of three directors are required, to be in compliance with the ' +
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
  },
  {
    entityType: CorpTypeCd.BC_ULC_COMPANY,
    displayName: 'Unlimited Liability Company',
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
]
