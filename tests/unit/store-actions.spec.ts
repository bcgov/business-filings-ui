import LegalServices from '@/services/legal-services'
import { getVuexStore } from '@/store'

describe('testing actions', () => {
  const store = getVuexStore() as any // remove typings for unit tests

  it('fetches state filing', async () => {
    // arrange
    const sampleStateFiling = {
      'business': {
        'foundingDate': '2022-12-06T19:13:16.000+00:00',
        'identifier': 'BC0871273',
        'legalName': 'AC BEN 2022.DEC.6 18.14 TEST CORP.',
        'legalType': 'BEN'
      },
      'dissolution': {
        'affidavitConfirmed': true,
        'custodialOffice': {
          'deliveryAddress': {
            'addressCity': 'Langley',
            'addressCountry': 'CA',
            'addressRegion': 'BC',
            'deliveryInstructions': '',
            'id': 2625814,
            'postalCode': 'V2Z 1M3',
            'streetAddress': '22233 47 Ave',
            'streetAddressAdditional': ''
          },
          'mailingAddress': {
            'addressCity': 'Squamish',
            'addressCountry': 'CA',
            'addressRegion': 'BC',
            'deliveryInstructions': '',
            'id': 2625813,
            'postalCode': 'V8B 1A6',
            'streetAddress': '39393 Cardinal Dr',
            'streetAddressAdditional': ''
          }
        },
        'dissolutionDate': '2023-01-13',
        'dissolutionType': 'voluntary',
        'parties':
          {
            'deliveryAddress': {
              'addressCity': 'Langley',
              'addressCountry': 'CA',
              'addressRegion': 'BC',
              'deliveryInstructions': '',
              'postalCode': 'V2Z 2X9',
              'streetAddress': '23434 6 Ave',
              'streetAddressAdditional': ''
            },
            'inheritMailingAddress': true,
            'mailingAddress': {
              'addressCity': 'Langley',
              'addressCountry': 'CA',
              'addressRegion': 'BC',
              'deliveryInstructions': '',
              'postalCode': 'V2Z 2X9',
              'streetAddress': '23434 6 Ave',
              'streetAddressAdditional': ''
            },
            'officer': {
              'email': 'argus@highwaythreesolutions.com',
              'firstName': 'jane',
              'id': null,
              'lastName': 'doe',
              'middleName': '',
              'organizationName': '',
              'partyType': 'person'
            },
            'roles': [
              {
                'appointmentDate': '2023-01-13',
                'roleType': 'Custodian'
              }
            ]
          },
        'resolution': {
          'resolutionConfirmed': true
        }
      },
      'header': {
        'affectedFilings': [],
        'availableOnPaperOnly': false,
        'certifiedBy': 'BCREGTEST Delphia EIGHTEEN',
        'colinIds': [9179235],
        'comments': [],
        'date': '2023-01-14T01:07:00.445972+00:00',
        'deletionLocked': false,
        'effectiveDate': '2023-01-14T01:07:12.136444+00:00',
        'filingId': 139770,
        'inColinOnly': false,
        'isCorrected': false,
        'isCorrectionPending': false,
        'isFutureEffective': false,
        'name': 'dissolution',
        'paymentStatusCode': 'CREATED',
        'paymentToken': '25332',
        'status': 'COMPLETED',
        'submitter': 'bcsc/x5levvougen54gnvtvcyh7nrelqcyt4t'
      }
    }
    // act
    jest.spyOn(LegalServices, 'fetchFiling').mockImplementation(
      (): Promise<any> => {
        return Promise.resolve(sampleStateFiling)
      }
    )
    await store.dispatch('retrieveStateFiling', 'http://localhost/')
      .then(() => {
        expect(LegalServices.fetchFiling).toHaveBeenCalled()
        expect(store.state.stateFiling).toHaveProperty('business')
        expect(store.state.stateFiling).toHaveProperty('dissolution')
        expect(store.state.stateFiling).toHaveProperty('header')
      })
  })
})
