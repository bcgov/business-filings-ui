import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import flushPromises from 'flush-promises'
import axios from '@/axios-auth'
import sinon from 'sinon'

// Components and sub-components
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import CompletedAlteration from '@/components/Dashboard/FilingHistoryList/CompletedAlteration.vue'
import CompletedIa from '@/components/Dashboard/FilingHistoryList/CompletedIa.vue'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/FutureEffective.vue'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/FutureEffectivePending.vue'
import PaperFiling from '@/components/Dashboard/FilingHistoryList/PaperFiling.vue'
import PendingFiling from '@/components/Dashboard/FilingHistoryList/PendingFiling.vue'
import StaffFiling from '@/components/Dashboard/FilingHistoryList/StaffFiling.vue'
import { DetailsList } from '@/components/common'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app: HTMLDivElement = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

const sampleFilings = [
  {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCount: 2,
    commentsLink: '',
    displayName: 'Annual Report',
    documentsLink: '',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 321,
    filingLink: '',
    isFutureEffective: false,
    name: 'annualReport',
    status: 'COMPLETED',
    submittedDate: '2019-06-02 19:22:59 GMT',
    submitter: 'Joe Submitter 1'
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Change of Directors',
    documentsLink: '',
    effectiveDate: '2019-03-09 19:22:59 GMT',
    filingId: 654,
    filingLink: '',
    isFutureEffective: false,
    name: 'changeOfDirectors',
    status: 'COMPLETED',
    submittedDate: '2019-03-09 19:22:59 GMT',
    submitter: 'Joe Submitter 2'
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Change of Address',
    documentsLink: '',
    effectiveDate: '2019-05-06 19:22:59 GMT',
    filingId: 987,
    filingLink: '',
    isFutureEffective: false,
    name: 'changeOfAddress',
    status: 'COMPLETED',
    submittedDate: '2019-05-06 19:22:59 GMT',
    submitter: 'Joe Submitter 3'
  },
  {
    availableOnPaperOnly: true,
    businessIdentifier: 'CP0001191',
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Annual Report',
    documentsLink: '',
    effectiveDate: '2019-03-02 19:22:59 GMT',
    filingId: 3212,
    filingLink: '',
    isFutureEffective: false,
    name: 'annualReport',
    status: 'COMPLETED',
    submittedDate: '2019-03-02 19:22:59 GMT',
    submitter: 'Joe Submitter 4'
  },
  {
    availableOnPaperOnly: true,
    businessIdentifier: 'CP0001191',
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Change of Directors',
    documentsLink: '',
    effectiveDate: '2019-02-04 19:22:59 GMT',
    filingId: 6541,
    filingLink: '',
    isFutureEffective: false,
    name: 'changeOfDirectors',
    status: 'COMPLETED',
    submittedDate: '2019-02-04 19:22:59 GMT',
    submitter: 'Joe Submitter 5'
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Change of Address',
    documentsLink: '',
    // Effective Date is way in the future so it's always > now
    effectiveDate: '2099-12-13 08:00:00 GMT', // Dec 13, 2099 at 00:00:00 am Pacific
    filingId: 9873,
    filingLink: '',
    isFutureEffective: true,
    name: 'changeOfAddress',
    status: 'PAID',
    submittedDate: '2019-12-12 19:22:59 GMT', // Dec 12, 2019 at 11:22:59 am Pacific
    submitter: 'Cameron'
  },
  {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCount: 0,
    commentsLink: '',
    displayName: 'Correction - Annual Report (2019)',
    documentsLink: '',
    effectiveDate: '2019-12-13 00:00:00 GMT',
    filingId: 9873,
    filingLink: '',
    isFutureEffective: false,
    name: 'correction',
    status: 'COMPLETED',
    submittedDate: '2019-04-06 19:22:59 GMT',
    submitter: 'Cameron'
  }
]

describe('Filing History List - misc functionality', () => {
  it('handles empty data', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(wrapper.emitted('history-count')).toEqual([[0]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('You have no filing history')

    wrapper.destroy()
  })

  it('shows the filing date in the correct format "Mmm dd, yyyy"', async () => {
    const $route = { query: { filing_id: '654' } }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = sampleFilings

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(7)
    expect(wrapper.findAll('.filing-history-item').at(0).find('.item-header__subtitle').text()).toContain('Jun 2, 2019')

    wrapper.destroy()
  })

  it('displays multiple filing items', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Annual Report',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 321,
        filingLink: '',
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-07-02',
        submitter: 'Joe Submitter 1'
      },
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Change of Directors',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 654,
        filingLink: '',
        isFutureEffective: false,
        name: 'changeOfDirectors',
        status: 'COMPLETED',
        submittedDate: '2019-04-04',
        submitter: 'Joe Submitter 2'
      },
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Change of Address',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 987,
        filingLink: '',
        isFutureEffective: false,
        name: 'changeOfAddress',
        status: 'COMPLETED',
        submittedDate: '2019-05-06',
        submitter: 'Joe Submitter 3'
      },
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Annual Report',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 3212,
        filingLink: '',
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-03-02',
        submitter: 'Joe Submitter 4'
      },
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Change of Directors',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 6541,
        filingLink: '',
        isFutureEffective: false,
        name: 'changeOfDirectors',
        status: 'COMPLETED',
        submittedDate: '2019-02-04',
        submitter: 'Joe Submitter 5'
      },
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Change of Address',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 9871,
        filingLink: '',
        isFutureEffective: false,
        name: 'changeOfAddress',
        status: 'COMPLETED',
        submittedDate: '2019-01-06',
        submitter: 'Joe Submitter 6'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(6)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(6)
    expect(wrapper.emitted('history-count')).toEqual([[6]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    wrapper.destroy()
  })

  it('expands a paper-only filing', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = [
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Change of Directors',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 654,
        filingLink: '',
        isFutureEffective: false,
        name: 'changeOfDirectors',
        status: 'COMPLETED',
        submittedDate: '2019-03-09',
        submitter: 'Joe Submitter 2'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify no row is expanded
    expect(vm.panel).toBeNull()

    // verify Request a Copy button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('Request a Copy')

    // expand details
    button.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toBe(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(true)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })

  it('expands a regular filing', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Annual Report',
        documentsLink: '',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 321,
        filingLink: '',
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-06-02',
        submitter: 'Joe Submitter 2'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify no row is expanded
    expect(vm.panel).toBeNull()

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    button.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toBe(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })

  // FUTURE: show and verify the tooltip
  xit('displays the tooltip when the filing is a BCOMP Future Effective COA', async () => {
    const $route = { query: { filing_id: '9873' } }

    // init store
    store.state.entityType = 'BEN'
    store.state.entityIncNo = 'BC0007291'
    store.state.filings = sampleFilings

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(7)
    const item = wrapper.findAll('.filing-history-item').at(5)
    expect(item.text()).toContain('The updated office addresses will be legally effective on Dec 13, 2099')

    const subtitle = item.find('.item-header__subtitle').text()
    expect(subtitle).toContain('FILED AND PENDING')
    expect(subtitle).toContain('(filed by Cameron on Dec 12, 2019)')
    expect(subtitle).toContain('The updated office addresses will be legally effective')

    wrapper.destroy()
  })

  it('returns correct values for the date comparison methods', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const now = new Date()
    const past = new Date(now.getTime() - 60 * 1000) // minus 1 minute
    const future = new Date(now.getTime() + 60 * 1000) // plus 1 minute

    expect(vm.isEffectiveDatePast(past)).toBe(true)
    expect(vm.isEffectiveDatePast(future)).toBe(false)

    expect(vm.isEffectiveDateFuture(future)).toBe(true)
    expect(vm.isEffectiveDateFuture(past)).toBe(false)
  })

  it('disables corrections when "disable changes" prop is set', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = mount(FilingHistoryList, {
      store,
      mocks: { $route },
      propsData: { disableChanges: true }
    })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.disableCorrection({})).toBe(true)
  })

  it('returns correct values for misc helper methods', async () => {
    const $route = { query: {} }

    // init store
    store.state.entityIncNo = 'CP0001191'
    store.state.filings = []

    const wrapper = mount(FilingHistoryList, {
      store,
      mocks: { $route },
      propsData: { disableChanges: false }
    })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const item = {
      availableOnPaperOnly: false,
      isTypeStaff: false,
      isFutureEffectiveIa: false,
      status: null,
      name: null
    }

    expect(vm.disableCorrection({ ...item })).toBe(false)
    expect(vm.disableCorrection({ ...item, availableOnPaperOnly: true })).toBe(true)
    expect(vm.disableCorrection({ ...item, isTypeStaff: true })).toBe(true)
    expect(vm.disableCorrection({ ...item, isFutureEffective: true })).toBe(true)
    expect(vm.disableCorrection({ ...item, status: 'CORRECTED' })).toBe(true)
    expect(vm.disableCorrection({ ...item, name: 'alteration' })).toBe(true)
    expect(vm.disableCorrection({ ...item, name: 'correction' })).toBe(true)
    expect(vm.disableCorrection({ ...item, name: 'transition' })).toBe(true)
  })
})

describe('Filing History List - redirections', () => {
  const business = {
    identifier: 'BC1234567',
    legalName: 'legal name - BC1234567',
    legalType: 'BEN'
  }
  const incorporationApplication = {
    nameRequest: {
      legalType: 'BEN'
    },
    nameTranslations: { new: ['ABC Ltd.', 'Financière de l’Odet', 'Société Générale'] },
    offices: {
      registeredOffice: {
        deliveryAddress: {
          streetAddress: 'delivery_address - address line one',
          addressCity: 'delivery_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        mailingAddress: {
          streetAddress: 'mailing_address - address line one',
          addressCity: 'mailing_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        }
      },
      recordsOffice: {
        deliveryAddress: {
          streetAddress: 'delivery_address - address line one',
          addressCity: 'delivery_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        mailingAddress: {
          streetAddress: 'mailing_address - address line one',
          addressCity: 'mailing_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        }
      }
    },
    parties: [
      {
        officer: {
          id: 1,
          firstName: 'Joe',
          lastName: 'Swanson',
          middleName: 'P',
          email: 'joe@email.com',
          orgName: '',
          partyType: 'person'
        },
        mailingAddress: {
          streetAddress: 'mailing_address - address line one',
          streetAddressAdditional: '',
          addressCity: 'mailing_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        deliveryAddress: {
          streetAddress: 'delivery_address - address line one',
          streetAddressAdditional: '',
          addressCity: 'delivery_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        roles: [
          {
            roleType: 'Completing Party',
            appointmentDate: '2018-01-01'

          },
          {
            roleType: 'Director',
            appointmentDate: '2018-01-01'

          }
        ]
      },
      {
        officer: {
          id: 2,
          firstName: '',
          lastName: '',
          middleName: '',
          orgName: 'Xyz Inc.',
          partyType: 'org'
        },
        mailingAddress: {
          streetAddress: 'mailing_address - address line one',
          streetAddressAdditional: '',
          addressCity: 'mailing_address city',
          addressCountry: 'CA',
          postalCode: 'H0H0H0',
          addressRegion: 'BC'
        },
        roles: [
          {
            roleType: 'Incorporator',
            appointmentDate: '2018-01-01'
          }
        ]
      }
    ],
    shareStructure: {
      shareClasses: [
        {
          id: 1,
          name: 'Share Class 1',
          priority: 1,
          hasMaximumShares: true,
          maxNumberOfShares: 100,
          hasParValue: true,
          parValue: 10,
          currency: 'CAD',
          hasRightsOrRestrictions: true,
          series: [
            {
              id: 1,
              name: 'Share Series 1',
              priority: 1,
              hasMaximumShares: true,
              maxNumberOfShares: 50,
              hasRightsOrRestrictions: true
            },
            {
              id: 2,
              name: 'Share Series 2',
              priority: 2,
              hasMaximumShares: true,
              maxNumberOfShares: 100,
              hasRightsOrRestrictions: true
            }
          ]
        },
        {
          id: 2,
          name: 'Share Class 2',
          priority: 1,
          hasMaximumShares: true,
          maxNumberOfShares: null,
          hasParValue: true,
          parValue: null,
          currency: null,
          hasRightsOrRestrictions: true,
          series: []
        }
      ]
    },
    contactPoint: {
      email: 'no_one@never.get',
      phone: '123-456-7890'
    },
    incorporationAgreement: {
      agreementType: 'sample'
    }
  }
  const { assign } = window.location

  beforeAll(() => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any

    sessionStorage.setItem('KEYCLOAK_TOKEN', 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3F' +
      'QbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiI0MmMzOWQzYi1iMTZkLTRiYWMtOWU1Ny1hNDYyZjQ3NWY0M2UiLCJleHAiO' +
      'jE1NzUwNzI4MTEsIm5iZiI6MCwiaWF0IjoxNTc1MDQ0MDExLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV' +
      '0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwiYWNjb3VudCJdLCJzdWIiOiI4ZTVkZDYzNS01OGRkLTQ5YzUtYmViM' +
      'S00NmE1ZDVhMTYzNWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzYmMtYXV0aC13ZWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI' +
      '5OGQ3Y2Y2Zi0xYTQ1LTQzMzUtYWU0OC02YzBiNTdlMGYwNTAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly8xOTIuMTY4L' +
      'jAuMTM6ODA4MC8iLCIxOTIuMTY4LjAuMTMiLCIqIiwiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI' +
      '6WyJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3Vud' +
      'CI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiIiLCJ' +
      'yb2xlcyI6WyJlZGl0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImJhc2ljIl0sInByZWZlcnJlZF91c2VybmFtZSI6I' +
      'mJjMDAwNzI5MSIsImxvZ2luU291cmNlIjoiUEFTU0NPREUiLCJ1c2VybmFtZSI6ImJjMDAwNzI5MSJ9.GYKmp5SQxZYTEkltSgaM3LMNcmuo_n' +
      'b88wrYb6LbRk1BtCC0wU6Uu5zij_6mwXKyJ3dQ0L2EWR0eEqDuKzjWKVkIvQujXKzc8H9PPYPhgRqwdDr2qOglJrT2lJTkGZvPPqI217J2iiVW' +
      'OutPePeAmozIQhmf5jlZBW_J8qSzx9GmkQvT41hxpNLkaMPjPYVM2Iy6vL4Pnu0Xma-wCN1GCPwvJGQXCuh3IsR_iTMoig8qcFS0a0lUTx_cCj' +
      'G-zf_goG4vDTeKn6Mk50FToRtYGXkzWdfQn1T_yeS_2zrL8Ifg1QhJe74U_w40v4ikAFl-BofYnIRjopP57H-5g9_SGg')
  })

  afterAll(() => {
    window.location.assign = assign
  })

  beforeEach(() => {
    const get = sinon.stub(axios, 'get')
    const post = sinon.stub(axios, 'post')

    // GET original IA
    get.withArgs('businesses/BC1234567/filings/85114')
      .returns(new Promise((resolve) => resolve({
        data:
        {
          filing: {
            header: {
              availableOnPaperOnly: false,
              submitter: 'Joe Submitter',
              date: '2020-04-28 19:14:45 GMT',
              effectiveDate: '2020-05-06 19:00:00 GMT', // past date
              filingId: 85114,
              name: 'incorporationApplication',
              status: 'COMPLETED'
            },
            business,
            incorporationApplication
          }
        }
      })))

    post.withArgs('businesses/BC1234567/filings?draft=true')
      .returns(new Promise((resolve) => resolve({
        data:
          {
            filing: {
              header: {
                availableOnPaperOnly: false,
                submitter: 'Joe Submitter',
                date: '2020-04-28 19:14:45 GMT',
                effectiveDate: '2020-04-28 19:14:45 GMT',
                filingId: 110514,
                name: 'correction',
                status: 'DRAFT'
              },
              business,
              correction: {
                correctedFilingId: 85114,
                correctedFilingType: 'incorporationApplication',
                correctedFilingDate: '2020-05-07',
                comment: null
              },
              incorporationApplication
            }
          }
      })))
  })

  it('redirects to Edit URL when filing an IA correction', async () => {
    // init data
    sessionStorage.setItem('EDIT_URL', `${process.env.VUE_APP_PATH}/edit/`)
    store.state.keycloakRoles = ['staff']
    store.state.entityIncNo = 'BC1234567'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdenfier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Incorporation Application',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: 'businesses/BC1234567/filings/85114',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const $route = { query: {} }
    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // sanity check
    expect(vm.historyItems.length).toEqual(1)

    // find and click the drop-down menu button
    const menuButton = wrapper.find('.menu-btn')
    expect(menuButton).toBeDefined()
    menuButton.trigger('click')
    await flushPromises()

    // find and click the "File a Correction" menu item
    const fileCorrectionItem = wrapper.find('.file-correction-item')
    expect(fileCorrectionItem).toBeDefined()
    fileCorrectionItem.trigger('click')
    await flushPromises()

    // verify redirection
    const createUrl = 'business/edit/BC1234567/correction?correction-id=110514'
    expect(window.location.assign).toHaveBeenCalledWith(createUrl)

    wrapper.destroy()
  })
})

describe('Filing History List - incorporation applications', () => {
  const $route = { query: {} }

  it('displays an "empty" IA filing', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.filings = []

    const wrapper = shallowMount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(wrapper.emitted('history-count')).toEqual([[0]])
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('Complete your filing to display')

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays actual title for a named company IA', async () => {
    // init store
    store.state.nameRequest = null
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'BC Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('BC Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Joe Submitter on May 6, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays default title for a numbered company IA', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'BC Benefit Company Incorporation Application - Numbered Benefit Company',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('Numbered Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Joe Submitter on May 6, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a "future effective" IA filing', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'BC Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2099-12-31 23:59:59 GMT', // way in the future so it's always > now
        filingId: 85114,
        filingLink: '',
        isFutureEffective: true,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('BC Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FUTURE EFFECTIVE INCORPORATION')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Joe Submitter on Apr 28, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of Dec 31, 2099')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(true)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a "future effective pending" IA filing', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'BC Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: true,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('BC Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Joe Submitter on Apr 28, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(true)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Paid IA (incorp app mode)', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Joe Submitter on May 6, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(true)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Completed IA (incorp app mode)', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2099-12-31 23:59:59 GMT', // way in the future so it's always > now
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Joe Submitter on Apr 28, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Dec 31, 2099')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(true)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Paid IA (business mode)', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNumber: 'NR 1234567' }
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Joe Submitter on May 6, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(true)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  it('displays a Completed IA (business mode)', async () => {
    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        documentsLink: '',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Joe Submitter on Apr 28, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify there is no Details button
    expect(wrapper.find('.details-btn').exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    button.trigger('click')
    await flushPromises()

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - paper only and other filings', () => {
  const $route = { query: {} }
  let wrapper
  let vm

  beforeEach(() => {
    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.state.entityType = 'BEN'
  })

  afterEach(() => {
    sessionStorage.removeItem('BUSINESS_ID')
    if (wrapper) wrapper.destroy()
  })

  it('displays a "paper only" AR (other) filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Annual Report (2017)',
        documentsLink: '',
        effectiveDate: '2017-03-24 19:20:05 GMT',
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2017-03-24 19:20:05 GMT',
        submitter: 'Joe Submitter'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toBe('Annual Report (2017)')
    expect(wrapper.find('.item-header__subtitle span').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header__subtitle span').text()).toContain('(filed by Joe Submitter on Mar 24, 2017)')
    expect(wrapper.find('.item-header__subtitle span').text()).toContain('EFFECTIVE as of Mar 24, 2017')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify expand button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify updated expand button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(true)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays an "empty" alteration filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Alteration - Change of Company Information',
        documentsLink: '',
        effectiveDate: '2020-03-24 19:20:05 GMT',
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'alteration',
        status: 'COMPLETED',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Joe Submitter',
        data: {
          courtOrder: {}
        }
      }
    ]

    wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toBe('Alteration - Change of Company Information')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Joe Submitter on Mar 24, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Mar 24, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(true)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays a "future effective" alteration filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Alteration from a BC Limited Company to a BC Benefit Company',
        documentsLink: '',
        effectiveDate: '2099-12-31 23:59:59 GMT', // way in the future so it's always > now
        filingId: 85114,
        filingLink: '',
        isFutureEffective: true,
        name: 'alteration',
        status: 'PAID',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Joe Submitter',
        data: {
          alteration: {
            fromLegalType: 'BC',
            toLegalType: 'BEN'
          }
        }
      }
    ]

    wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Alteration from a BC Limited Company')
    expect(wrapper.find('.item-header__title').text()).toContain('to a BC Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FUTURE EFFECTIVE ALTERATION')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Joe Submitter on Mar 24, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of Dec 31, 2099')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(true)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays a "future effective pending" alteration filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Alteration from a BC Limited Company to a BC Benefit Company',
        documentsLink: '',
        effectiveDate: '2020-04-24 19:20:05 GMT', // past date
        filingId: 85114,
        filingLink: '',
        isFutureEffective: true,
        name: 'alteration',
        status: 'PAID',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Joe Submitter',
        data: {
          alteration: {
            fromLegalType: 'BC',
            toLegalType: 'BEN'
          }
        }
      }
    ]

    wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Alteration from a BC Limited Company')
    expect(wrapper.find('.item-header__title').text()).toContain('to a BC Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Joe Submitter on Mar 24, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of Apr 24, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(true)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays a "full" alteration filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Alteration from a BC Limited Company to a BC Benefit Company',
        documentsLink: '',
        effectiveDate: '2020-03-24 19:20:05 GMT',
        filingId: 85114,
        filingLink: '',
        isFutureEffective: false,
        name: 'alteration',
        status: 'COMPLETED',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Joe Submitter',
        data: {
          alteration: {
            fromLegalType: 'BC',
            toLegalType: 'BEN'
          }
        }
      }
    ]

    wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('.item-header__title').text()).toContain('Alteration from a BC Limited Company')
    expect(wrapper.find('.item-header__title').text()).toContain('to a BC Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Joe Submitter on Mar 24, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Mar 24, 2020')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.panel).toEqual(0) // first row is expanded
    expect(wrapper.find(CompletedAlteration).exists()).toBe(true)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(false)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays a Registrar\'s Notation (staff only) filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Registrar\'s Notation',
        documentsLink: '',
        effectiveDate: '2021-05-05 20:37:44 GMT',
        filingId: 123,
        filingLink: '',
        isFutureEffective: false,
        name: 'registrarsNotation',
        status: 'COMPLETED',
        submittedDate: '2021-05-05 20:37:44 GMT',
        submitter: 'Cameron',
        data: {
          courtOrder: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '#1234-5678/90',
            notationOrOrder: 'A note about order'
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.item-header__title').text()).toBe('Registrar\'s Notation')
    expect(wrapper.find('.item-header__subtitle span').text()).toBe('Filed by Cameron on May 5, 2021')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(true)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays a Registrar\'s Order (staff only) filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Registrar\'s Order',
        documentsLink: '',
        effectiveDate: '2021-05-05 20:37:44 GMT',
        filingId: 123,
        filingLink: '',
        isFutureEffective: false,
        name: 'registrarsOrder',
        status: 'COMPLETED',
        submittedDate: '2021-05-05 20:37:44 GMT',
        submitter: 'Cameron',
        data: {
          courtOrder: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '#1234-5678/90',
            notationOrOrder: 'A note about order'
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.item-header__title').text()).toBe('Registrar\'s Order')
    expect(wrapper.find('.item-header__subtitle span').text()).toBe('Filed by Cameron on May 5, 2021')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(true)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })

  it('displays a Court Order (staff only) filing', async () => {
    store.state.filings = [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        commentsLink: '',
        displayName: 'Court Order',
        documentsLink: '',
        effectiveDate: '2021-05-05 20:37:44 GMT',
        filingId: 123,
        filingLink: '',
        isFutureEffective: false,
        name: 'courtOrder',
        status: 'COMPLETED',
        submittedDate: '2021-05-05 20:37:44 GMT',
        submitter: 'Cameron',
        data: {
          courtOrder: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '#1234-5678/90',
            notationOrOrder: 'A note about order'
          }
        }
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.historyItems.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)
    expect(wrapper.emitted('history-count')).toEqual([[1]])

    expect(wrapper.find('h3.item-header__title').text()).toBe('Court Order')
    expect(wrapper.find('.item-header__subtitle span').text()).toBe('Filed by Cameron on May 5, 2021')
    expect(vm.panel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    detailsBtn.trigger('click')
    await flushPromises()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.panel).toBe(0)
    expect(wrapper.find(CompletedAlteration).exists()).toBe(false)
    expect(wrapper.find(CompletedIa).exists()).toBe(false)
    expect(wrapper.find(FutureEffective).exists()).toBe(false)
    expect(wrapper.find(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.find(PaperFiling).exists()).toBe(false)
    expect(wrapper.find(PendingFiling).exists()).toBe(false)
    expect(wrapper.find(StaffFiling).exists()).toBe(true)
    expect(wrapper.find(DetailsList).exists()).toBe(false)
  })
})

describe('Filing History List - documents', () => {
  // *** TODO: implement document fetch, etc
  // - verify list of documents (main document + receipt)
  // - verify Download One and Download All buttons
  xit('display the documents present on a filing', async () => {
    const $route = { query: { filing_id: '9873' } }

    // init store
    store.state.filings = [
      {
        name: 'correction',
        displayName: 'Correction - Annual Report (2019)',
        submittedDate: '2019-04-06 19:22:59.00 GMT',
        submitter: 'Cameron',
        filingId: 9873,
        availableOnPaperOnly: false,
        effectiveDate: '2019-12-13 00:00:00 GMT',
        status: 'COMPLETED'
      }
    ]

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    button.trigger('click')
    await flushPromises()

    // verify Annual Report button
    const documentBtns = wrapper.findAll('.download-document-btn')
    expect(documentBtns.at(0).text()).toBe('Annual Report (Corrected)')
    expect(documentBtns.at(0).attributes('disabled')).toBeUndefined()

    // verify Receipt button
    expect(wrapper.find('.download-receipt-btn').text()).toContain('Receipt')
    expect(wrapper.find('.download-receipt-btn').attributes('disabled')).toBeUndefined()

    // verify Download All button
    expect(wrapper.find('.download-all-btn').text()).toContain('Download All')
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })
})

describe('Filing History List - detail comments', () => {
  it('displays the details count when comments are present on a filing', async () => {
    const $route = { query: {} }

    // init store
    store.state.filings = [sampleFilings[0]] // first filing only

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify detail comments button
    expect(wrapper.find('.comments-btn').text()).toContain('Details (2)')

    wrapper.destroy()
  })

  it('does not display the details count when no comments are present on a filing', async () => {
    const $route = { query: {} }

    // init store
    store.state.filings = [sampleFilings[1]] // second filing only

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify that detail comments button does not exist
    expect(wrapper.find('.comments-btn').exists()).toBe(false)

    wrapper.destroy()
  })

  // *** TODO: implement comment fetch, etc
  xit('displays details list when comments are present on a filing', async () => {
    const $route = { query: {} }

    // init store
    store.state.filings = [sampleFilings[0]] // first filing only

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify that Details List component does not exist until the item is expanded
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // expand the panel
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // verify that Details List component is displayed after the item is expanded
    expect(wrapper.find(DetailsList).exists()).toBe(true)

    wrapper.destroy()
  })

  // *** TODO: implement comment fetch, etc
  xit('does not display details list when no comments are present on a filing', async () => {
    const $route = { query: {} }

    // init store
    store.state.filings = [sampleFilings[1]] // second filing only

    const wrapper = mount(FilingHistoryList, { store, mocks: { $route }, vuetify })
    await Vue.nextTick()

    // verify that Details List component does not exist until the item is expanded
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    // expand the panel
    wrapper.find('.expand-btn').trigger('click')
    await flushPromises()

    // verify that Details List component is not displayed after the item is expanded
    expect(wrapper.find(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })
})
