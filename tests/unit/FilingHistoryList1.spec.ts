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
// import CompletedAlteration from '@/components/Dashboard/FilingHistoryList/CompletedAlteration.vue'
// import CompletedIa from '@/components/Dashboard/FilingHistoryList/CompletedIa.vue'
import DetailsList from '@/components/Dashboard/FilingHistoryList/DetailsList.vue'
import DocumentsList from '@/components/Dashboard/FilingHistoryList/DocumentsList.vue'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/bodies/FutureEffective.vue'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/bodies/FutureEffectivePending.vue'
import PaperFiling from '@/components/Dashboard/FilingHistoryList/filings/PaperFiling.vue'
// import PendingFiling from '@/components/Dashboard/FilingHistoryList/PendingFiling.vue'
import StaffFiling from '@/components/Dashboard/FilingHistoryList/filings/StaffFiling.vue'
import LimitedRestoration from '@/components/Dashboard/FilingHistoryList/filings/LimitedRestoration.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

// Prevent the warning "[Vuetify] Unable to locate target #filing-history-list"
document.body.setAttribute('id', 'filing-history-list')

describe('Filing History List - misc functionality', () => {
  const SAMPLE_FILINGS = [
    {
      availableOnPaperOnly: false,
      businessIdentifier: 'CP0001191',
      commentsCount: 0,
      displayName: 'Annual Report',
      effectiveDate: '2019-06-02 19:22:59 GMT',
      filingId: 111,
      isFutureEffective: false,
      name: 'annualReport',
      status: 'COMPLETED',
      submittedDate: '2019-06-02 19:22:59 GMT',
      submitter: 'Submitter 1'
    },
    {
      availableOnPaperOnly: false,
      businessIdentifier: 'CP0001191',
      commentsCount: 2,
      displayName: 'Change of Address',
      // Effective Date is way in the future so it's always > now
      effectiveDate: '2099-12-13 08:00:00 GMT', // Dec 13, 2099 at 00:00:00 am Pacific
      filingId: 222,
      isFutureEffective: true,
      name: 'changeOfAddress',
      status: 'PAID',
      submittedDate: '2019-12-12 19:22:59 GMT', // Dec 12, 2019 at 11:22:59 am Pacific
      submitter: 'Submitter 2'
    }
  ]

  it('handles empty data', async () => {
    // init data
    sessionStorage.setItem('BUSINESS_ID', 'CP0001191')
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [])

    const wrapper = mount(FilingHistoryList, {
      store,
      propsData: { dissolutionType: 'administrative' },
      vuetify
    })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('You have no filing history')

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })

  xit('shows the filing date in the correct format "Mmm dd, yyyy"', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', SAMPLE_FILINGS)

    const wrapper = mount(FilingHistoryList, {
      store,
      propsData: { highlightId: 222 },
      vuetify
    })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(2)
    expect(wrapper.findAll('.filing-history-item').at(0).find('.item-header__subtitle').text()).toContain('Jun 2, 2019')

    wrapper.destroy()
  })

  xit('displays multiple filing items', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Annual Report',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 111,
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-07-02',
        submitter: 'Submitter 1'
      },
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Change of Directors',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 222,
        isFutureEffective: false,
        name: 'changeOfDirectors',
        status: 'COMPLETED',
        submittedDate: '2019-04-04',
        submitter: 'Submitter 2'
      },
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Change of Address',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 333,
        isFutureEffective: false,
        name: 'changeOfAddress',
        status: 'COMPLETED',
        submittedDate: '2019-05-06',
        submitter: 'Submitter 3'
      },
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Annual Report',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 444,
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-03-02',
        submitter: 'Submitter 4'
      },
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Change of Directors',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 555,
        isFutureEffective: false,
        name: 'changeOfDirectors',
        status: 'COMPLETED',
        submittedDate: '2019-02-04',
        submitter: 'Submitter 5'
      },
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Change of Address',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 666,
        isFutureEffective: false,
        name: 'changeOfAddress',
        status: 'COMPLETED',
        submittedDate: '2019-01-06',
        submitter: 'Submitter 6'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(6)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(6)
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    wrapper.destroy()
  })

  it('expands a paper-only filing', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Change of Directors',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 222,
        isFutureEffective: false,
        name: 'changeOfDirectors',
        status: 'COMPLETED',
        submittedDate: '2019-03-09',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // verify no row is expanded
    expect(vm.getPanel).toBeNull()

    // verify Request a Copy button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('Request a Copy')

    // expand details
    await button.trigger('click')
    await Vue.nextTick()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.getPanel).toBe(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(true)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })

  xit('expands a regular filing', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Annual Report',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 111,
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-06-02',
        submitter: 'Cameron',
        documentsLink: 'http://test'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    // verify no row is expanded
    expect(vm.getPanel).toBeNull()

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')
    await Vue.nextTick()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.getPanel).toBe(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    wrapper.destroy()
  })

  xit('expands a full restoration filing', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Full Restoration Application',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 111,
        isFutureEffective: false,
        name: 'restoration',
        status: 'COMPLETED',
        submittedDate: '2019-06-02',
        submitter: 'Cameron',
        documentsLink: 'http://test',
        data: {
          restoration: {
            date: '2021-01-01',
            type: 'fullRestoration'
          }
        }
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    expect(wrapper.find('.item-header__title').text()).toContain('Full Restoration Application')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on Jun 1, 2019)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Nov 20, 2019')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button is not shown
    expect(wrapper.find('.details-btn').exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')
    await Vue.nextTick()

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')
    wrapper.destroy()
  })

  xit('expands a limited restoration filing', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        commentsLink: null,
        data: {
          restoration: {
            date: '2021-01-01',
            type: 'limitedRestoration',
            expiry: '2021-04-01',
            legalName: 'BC1234567 LTD.'
          }
        },
        displayName: 'Limited Restoration Application',
        documentsLink: 'http://test',
        effectiveDate: '2019-11-20 22:17:54 GMT',
        filingId: 111,
        filingSubType: 'limitedRestoration',
        isFutureEffective: false,
        name: 'restoration',
        paymentStatusCode: 'COMPLETED',
        status: 'COMPLETED',
        submittedDate: '2019-06-02',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    expect(wrapper.find('.item-header__title').text()).toContain('Limited Restoration Application')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on Jun 1, 2019)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Nov 20, 2019')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')

    await detailsBtn.trigger('click')
    await Vue.nextTick()
    await flushPromises() // wait for expansion transition

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify row has been expanded
    expect(vm.getPanel).toEqual(0)
    expect(vm.getFilings.length).toEqual(1)
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
    expect(wrapper.findComponent(LimitedRestoration).exists()).toBe(true)
    expect(wrapper.find('.limited-restoration-filing p').text())
      .toContain('The Company BC1234567 LTD. was successfully')
    expect(wrapper.find('.limited-restoration-filing p').text())
      .toContain('until Apr 1, 2021. At the end of the')

    wrapper.destroy()
  })

  // FUTURE: show and verify the tooltip
  xit('displays the tooltip when the filing is a BCOMP Future Effective COA', async () => {
    // init store
    store.commit('setLegalType', 'BEN')
    store.commit('setIdentifier', 'BC0007291')
    store.commit('mutateFilings', SAMPLE_FILINGS)

    const wrapper = mount(FilingHistoryList, {
      store,
      propsData: { highlightId: 666 },
      vuetify
    })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(2)
    const item = wrapper.findAll('.filing-history-item').at(1)
    expect(item.text()).toContain('The updated office addresses will be legally effective on Dec 13, 2099')

    const subtitle = item.find('.item-header__subtitle').text()
    expect(subtitle).toContain('FILED AND PENDING')
    expect(subtitle).toContain('(filed by Cameron on Dec 12, 2019)')
    expect(subtitle).toContain('The updated office addresses will be legally effective')

    wrapper.destroy()
  })

  // it('returns correct values for the date comparison methods', async () => {
  //   // init store
  //   store.commit('setIdentifier', 'CP0001191')
  //   store.commit('mutateFilings', [])

  //   const wrapper = mount(FilingHistoryList, { store, vuetify })
  //   const vm = wrapper.vm as any
  //   await Vue.nextTick()

  //   store.state.currentJsDate = new Date()
  //   const past = new Date(store.state.currentJsDate.getTime() - 60 * 1000) // minus 1 minute
  //   const future = new Date(store.state.currentJsDate.getTime() + 60 * 1000) // plus 1 minute

  //   expect(vm.isEffectiveDatePast(past)).toBe(true)
  //   expect(vm.isEffectiveDatePast(future)).toBe(false)

  //   expect(vm.isEffectiveDateFuture(future)).toBe(true)
  //   expect(vm.isEffectiveDateFuture(past)).toBe(false)
  // })

  xit('disables corrections when "disable changes" prop is set', async () => {
    // init store
    store.commit('setIdentifier', 'CP0001191')
    store.commit('mutateFilings', [])

    const wrapper = mount(FilingHistoryList, {
      store,
      propsData: { disableChanges: true },
      vuetify
    })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.disableCorrection({})).toBe(true)
  })

  xit('returns correct values for disableCorrection()', async () => {
    store.commit('mutateFilings', [])

    const wrapper = mount(FilingHistoryList, {
      store,
      propsData: { disableChanges: false },
      vuetify
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

    //
    // Verify ALLOWED (disabled=false):
    //

    // no conditions
    jest.spyOn(vm, 'isAllowed').mockReturnValue(true)
    expect(vm.disableCorrection({ ...item })).toBe(false)

    // conditions[2]: FE filing that is Completed or Corrected
    for (const status of ['COMPLETED', 'CORRECTED']) {
      expect(vm.disableCorrection({ ...item, isFutureEffective: true, status })).toBe(false)
    }

    // conditions[3]: IA as a BEN/BC/CC/ULC
    for (const entityType of ['BEN', 'BC', 'CC', 'ULC']) {
      store.commit('setLegalType', entityType)
      expect(vm.disableCorrection({ ...item, name: 'incorporationApplication' })).toBe(false)
    }

    // conditions[4]: Change of Registration as a firm
    for (const entityType of ['SP', 'GP']) {
      store.commit('setLegalType', entityType)
      expect(vm.disableCorrection({ ...item, name: 'changeOfRegistration' })).toBe(false)
    }

    // conditions[5]: Correction as a firm or BEN/BC/CC/ULC
    for (const entityType of ['SP', 'GP', 'BEN', 'BC', 'CC', 'ULC']) {
      store.commit('setLegalType', entityType)
      expect(vm.disableCorrection({ ...item, name: 'correction' })).toBe(false)
    }

    // conditions[6]: Registration as a firm
    for (const entityType of ['SP', 'GP']) {
      store.commit('setLegalType', entityType)
      expect(vm.disableCorrection({ ...item, name: 'registration' })).toBe(false)
    }

    // Annual Report, Alteration, Change of Address, Change of Directors, Conversion
    const names = ['annualReport', 'alteration', 'changeOfAddress', 'changeOfDirectors', 'conversion']
    for (const name of names) {
      expect(vm.disableCorrection({ ...item, name })).toBe(false)
    }

    //
    // Verify NOT ALLOWED (disabled=true):
    //

    // only conditions[0]
    expect(vm.disableCorrection({ ...item, availableOnPaperOnly: true })).toBe(true)

    // only conditions[1]
    expect(vm.disableCorrection({ ...item, isTypeStaff: true })).toBe(true)

    // only conditions[2]
    for (const status of ['CANCELLED', 'DELETED', 'DRAFT', 'ERROR', 'NEW', 'PAID', 'PENDING', 'WITHDRAWN']) {
      expect(vm.disableCorrection({ ...item, isFutureEffective: true, status })).toBe(true)
    }

    // only conditions[3]: IA as not a BEN/BC/CC/ULC
    store.commit('setLegalType', 'CP')
    expect(vm.disableCorrection({ ...item, name: 'incorporationApplication' })).toBe(true)

    // only conditions[4]: Change of Registration as not a firm
    store.commit('setLegalType', 'CP')
    expect(vm.disableCorrection({ ...item, name: 'changeOfRegistration' })).toBe(true)

    // only conditions[5]: Correction as not a firm nor BEN/BC/CC/ULC
    store.commit('setLegalType', 'CP')
    expect(vm.disableCorrection({ ...item, name: 'correction' })).toBe(true)

    // only conditions[6]: Registration as not a firm
    store.commit('setLegalType', 'CP')
    expect(vm.disableCorrection({ ...item, name: 'registration' })).toBe(true)
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
          organizationName: '',
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
          organizationName: 'Xyz Inc.',
          partyType: 'organization'
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
            roleType: 'incorporator',
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
    store.commit('setTestConfiguration', { key: 'VUE_APP_BUSINESS_EDIT_URL', value: 'https://edit.url/' })
    const get = sinon.stub(axios, 'get')
    const post = sinon.stub(axios, 'post')

    // GET original IA
    get.withArgs('businesses/BC1234567/filings/85114')
      .returns(new Promise(resolve => resolve({
        data:
        {
          filing: {
            header: {
              availableOnPaperOnly: false,
              submitter: 'Cameron',
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
      .returns(new Promise(resolve => resolve({
        data:
          {
            filing: {
              header: {
                availableOnPaperOnly: false,
                submitter: 'Cameron',
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

  afterEach(() => {
    sinon.restore()
  })

  xit('redirects to Edit URL when filing an IA correction', async () => {
    // init data
    store.commit('setTestConfiguration', { key: 'VUE_APP_EDIT_URL', value: 'https://edit.url/' })
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    sessionStorage.setItem('CURRENT_ACCOUNT', '{ "id": "2288" }')
    store.commit('setLegalType', 'BEN')
    store.state.keycloakRoles = ['staff']
    store.commit('setIdentifier', 'BC1234567')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdenfier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Incorporation Application',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        filingLink: 'businesses/BC1234567/filings/85114',
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // sanity check
    expect(vm.getFilings.length).toEqual(1)

    // find and click the drop-down menu button
    const menuButton = wrapper.find('.menu-btn')
    expect(menuButton).toBeDefined()
    await menuButton.trigger('click')

    // find and click the "File a Correction" menu item
    const fileCorrectionItem = wrapper.find('.file-correction-item')
    expect(fileCorrectionItem.exists()).toBe(true)
    await fileCorrectionItem.trigger('click')

    // verify to display the correction dialog modal
    const fileCorrectionDialog = wrapper.find('.file-correction-dialog')
    expect(fileCorrectionDialog.exists()).toBe(true)

    // verify radio buttons for client and staff
    const clientRadioBtn = wrapper.find('#correct-client-radio')
    expect(clientRadioBtn.exists()).toBe(true)

    // click the staff radio button
    const staffRadioBtn = wrapper.find('#correct-staff-radio')
    expect(staffRadioBtn.exists()).toBe(true)
    await staffRadioBtn.trigger('click')

    // verify redirection
    const startCorrectionBtn = wrapper.find('#dialog-start-button')
    expect(startCorrectionBtn.exists()).toBe(true)
    await startCorrectionBtn.trigger('click')
    await Vue.nextTick()

    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    const editUrl = 'https://edit.url/BC1234567/correction/?correction-id=110514'
    expect(window.location.assign).toHaveBeenCalledWith(editUrl + '&accountid=' + accountId)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - incorporation applications', () => {
  xit('displays an "empty" IA filing', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.commit('mutateFilings', [])

    const wrapper = shallowMount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(0)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(0)
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').text()).toContain('Complete your filing to display')

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays actual title for a named company IA', async () => {
    // init store
    store.state.nameRequest = null
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'BC Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('BC Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on May 6, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays default title for a numbered company IA', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'BC Benefit Company Incorporation Application - Numbered Benefit Company',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('Numbered Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on May 6, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays a "future effective" IA filing', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'BC Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2099-12-31 23:59:59 GMT', // way in the future so it's always > now
        filingId: 85114,
        isFutureEffective: true,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('BC Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FUTURE EFFECTIVE INCORPORATION')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Cameron on Apr 28, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of Dec 31, 2099')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(true)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays a "future effective pending" IA filing', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNum: 'NR 1234567' }
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'BC Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        isFutureEffective: true,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('BC Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Cameron on Apr 28, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(true)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays a Paid IA (temp reg number mode)', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNum: 'NR 1234567' }
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Cameron on May 6, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(true)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays a Completed IA (temp reg number mode)', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2099-12-31 23:59:59 GMT', // way in the future so it's always > now
        filingId: 85114,
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on Apr 28, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Dec 31, 2099')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(true)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays a Paid IA (business mode)', async () => {
    // init store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T123456789')
    store.state.nameRequest = { nrNum: 'NR 1234567' }
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'T123456789',
        commentsCount: 0,
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'PAID',
        submittedDate: '2020-05-06 19:00:00 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Cameron on May 6, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify View Details button and and toggle panel
    const detailsBtn = wrapper.find('.details-btn')
    expect(detailsBtn.text()).toContain('View Details')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Hide Details button
    expect(wrapper.find('.details-btn').text()).toContain('Hide Details')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(true)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('TEMP_REG_NUMBER')
    wrapper.destroy()
  })

  xit('displays a Completed IA (business mode)', async () => {
    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.commit('setLegalType', 'BEN')
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Benefit Company Incorporation Application - ACME Benefit Inc',
        effectiveDate: '2020-05-06 19:00:00 GMT', // past date
        filingId: 85114,
        isFutureEffective: false,
        name: 'incorporationApplication',
        status: 'COMPLETED',
        submittedDate: '2020-04-28 19:14:45 GMT',
        submitter: 'Cameron',
        documentsLink: 'http://test'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    expect(vm.getFilings.length).toEqual(1)

    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Benefit Company Incorporation Application')
    expect(wrapper.find('.item-header__title').text()).toContain('ACME Benefit Inc')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on Apr 28, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of May 6, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify there is no Details button
    expect(wrapper.find('.details-btn').exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sessionStorage.removeItem('BUSINESS_ID')
    wrapper.destroy()
  })
})

describe('Filing History List - paper only and other filings', () => {
  let wrapper
  let vm

  beforeEach(() => {
    // init store
    sessionStorage.setItem('BUSINESS_ID', 'BC1234567')
    store.commit('setLegalType', 'BEN')
  })

  afterEach(() => {
    sessionStorage.removeItem('BUSINESS_ID')
    if (wrapper) wrapper.destroy()
  })

  xit('displays a "paper only" AR (other) filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: true,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Annual Report (2017)',
        effectiveDate: '2017-03-24 19:20:05 GMT',
        filingId: 85114,
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2017-03-24 19:20:05 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toBe('Annual Report (2017)')
    expect(wrapper.find('.item-header__subtitle span').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header__subtitle span').text()).toContain('(filed by Cameron on Mar 24, 2017)')
    expect(wrapper.find('.item-header__subtitle span').text()).toContain('EFFECTIVE as of Mar 24, 2017')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify expand button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('Request a Copy')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify updated expand button
    expect(wrapper.find('.expand-btn').text()).toContain('Close')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(true)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays an "empty" alteration filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Alteration - Change of Company Information',
        effectiveDate: '2020-03-24 19:20:05 GMT',
        filingId: 85114,
        isFutureEffective: false,
        name: 'alteration',
        status: 'COMPLETED',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Cameron',
        documentsLink: 'http://test',
        data: {
          order: {}
        }
      }
    ])

    wrapper = mount(FilingHistoryList, { store, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toBe('Alteration - Change of Company Information')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on Mar 24, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Mar 24, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    await detailsBtn.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(true)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays a "future effective" alteration filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Alteration from a BC Limited Company to a BC Benefit Company',
        effectiveDate: '2099-12-31 23:59:59 GMT', // way in the future so it's always > now
        filingId: 85114,
        isFutureEffective: true,
        name: 'alteration',
        status: 'PAID',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Cameron',
        documentsLink: 'http://test',
        data: {
          alteration: {
            fromLegalType: 'BC',
            toLegalType: 'BEN'
          }
        }
      }
    ])

    wrapper = mount(FilingHistoryList, { store, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Alteration from a BC Limited Company')
    expect(wrapper.find('.item-header__title').text()).toContain('to a BC Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FUTURE EFFECTIVE ALTERATION')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Cameron on Mar 24, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of Dec 31, 2099')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    await detailsBtn.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(true)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays a "future effective pending" alteration filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Alteration from a BC Limited Company to a BC Benefit Company',
        effectiveDate: '2020-04-24 19:20:05 GMT', // past date
        filingId: 85114,
        isFutureEffective: true,
        name: 'alteration',
        status: 'PAID',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Cameron',
        documentsLink: 'http://test',
        data: {
          alteration: {
            fromLegalType: 'BC',
            toLegalType: 'BEN'
          }
        }
      }
    ])

    wrapper = mount(FilingHistoryList, { store, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Alteration from a BC Limited Company')
    expect(wrapper.find('.item-header__title').text()).toContain('to a BC Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PENDING')
    expect(spans.at(2).text()).toContain('PAID')
    expect(spans.at(2).text()).toContain('(filed by Cameron on Mar 24, 2020)')
    expect(spans.at(2).text()).toContain('EFFECTIVE as of Apr 24, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    await detailsBtn.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(true)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays a "full" alteration filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Alteration from a BC Limited Company to a BC Benefit Company',
        effectiveDate: '2020-03-24 19:20:05 GMT',
        filingId: 85114,
        isFutureEffective: false,
        name: 'alteration',
        status: 'COMPLETED',
        submittedDate: '2020-03-24 19:20:05 GMT',
        submitter: 'Cameron',
        'documentsLink': 'http://test',
        data: {
          alteration: {
            fromLegalType: 'BC',
            toLegalType: 'BEN'
          }
        }
      }
    ])

    wrapper = mount(FilingHistoryList, { store, vuetify })
    vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('.item-header__title').text()).toContain('Alteration from a BC Limited Company')
    expect(wrapper.find('.item-header__title').text()).toContain('to a BC Benefit Company')

    const spans = wrapper.findAll('.item-header__subtitle span')
    expect(spans.at(0).text()).toContain('FILED AND PAID')
    expect(spans.at(0).text()).toContain('(filed by Cameron on Mar 24, 2020)')
    expect(spans.at(0).text()).toContain('EFFECTIVE as of Mar 24, 2020')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // jest.spyOn(vm, 'loadDocuments').mockImplementation(() => Promise.resolve([]))

    // verify View Documents button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View Documents')
    await detailsBtn.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify Hide Documents button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide Documents')

    // verify details
    expect(vm.getPanel).toEqual(0) // first row is expanded
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(true)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(false)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays a Registrar\'s Notation (staff only) filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Registrar\'s Notation',
        effectiveDate: '2021-05-05 20:37:44 GMT',
        filingId: 123,
        isFutureEffective: false,
        name: 'registrarsNotation',
        status: 'COMPLETED',
        submittedDate: '2021-05-05 20:37:44 GMT',
        submitter: 'Cameron',
        data: {
          order: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '#1234-5678/90',
            orderDetails: 'A note about order'
          }
        }
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('h3.item-header__title').text()).toBe('Registrar\'s Notation')
    expect(wrapper.find('.item-header__subtitle span').text()).toBe('Filed by Cameron on May 5, 2021')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.getPanel).toBe(0)
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(true)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays a Registrar\'s Order (staff only) filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Registrar\'s Order',
        effectiveDate: '2021-05-05 20:37:44 GMT',
        filingId: 123,
        isFutureEffective: false,
        name: 'registrarsOrder',
        status: 'COMPLETED',
        submittedDate: '2021-05-05 20:37:44 GMT',
        submitter: 'Cameron',
        data: {
          order: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '#1234-5678/90',
            orderDetails: 'A note about order'
          }
        }
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('h3.item-header__title').text()).toBe('Registrar\'s Order')
    expect(wrapper.find('.item-header__subtitle span').text()).toBe('Filed by Cameron on May 5, 2021')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.getPanel).toBe(0)
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(true)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })

  xit('displays a Court Order (staff only) filing', async () => {
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'BC1234567',
        commentsCount: 0,
        displayName: 'Court Order',
        effectiveDate: '2021-05-05 20:37:44 GMT',
        filingId: 123,
        isFutureEffective: false,
        name: 'courtOrder',
        status: 'COMPLETED',
        submittedDate: '2021-05-05 20:37:44 GMT',
        submitter: 'Cameron',
        data: {
          order: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '#1234-5678/90',
            orderDetails: 'A note about order'
          }
        }
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.getFilings.length).toEqual(1)
    expect(wrapper.findAll('.filing-history-item').length).toEqual(1)

    expect(wrapper.find('h3.item-header__title').text()).toBe('Court Order')
    expect(wrapper.find('.item-header__subtitle span').text()).toBe('Filed by Cameron on May 5, 2021')
    expect(vm.getPanel).toBeNull() // no row is expanded
    expect(wrapper.find('.no-results').exists()).toBe(false)

    // verify Request a Copy button and toggle panel
    const detailsBtn = wrapper.find('.expand-btn')
    expect(detailsBtn.text()).toContain('View')
    await detailsBtn.trigger('click')
    await Vue.nextTick()

    // verify Close button
    expect(wrapper.find('.expand-btn').text()).toContain('Hide')

    expect(vm.getPanel).toBe(0)
    // expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(false)
    // expect(wrapper.findComponent(CompletedIa).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffective).exists()).toBe(false)
    expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(false)
    expect(wrapper.findComponent(PaperFiling).exists()).toBe(false)
    // expect(wrapper.findComponent(PendingFiling).exists()).toBe(false)
    expect(wrapper.findComponent(StaffFiling).exists()).toBe(true)
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)
  })
})

describe('Filing History List - with Court Order documents', () => {
  const FILING_WITH_COURT_ORDER_DOCUMENTS_LINK = {
    availableOnPaperOnly: false,
    businessIdentifier: 'BC0871300',
    commentsCounts: 0,
    displayName: 'Court Order 17321728',
    documentsLink: 'businesses/BC0871300/filings/111/documents',
    effectiveDate: '2019-12-13 00:00:00 GMT',
    filingId: 111,
    isFutureEffective: false,
    name: 'uploadedCourtOrder',
    status: 'COMPLETED',
    submittedDate: '2022-04-06 19:22:59.00 GMT',
    submitter: 'Cameron'
  }

  it('does not display the documents list when no documents are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_COURT_ORDER_DOCUMENTS_LINK])

    // mock "get documents"
    sinon.stub(axios, 'get').withArgs('businesses/BC0871300/filings/111/documents')
      .returns(new Promise(resolve => resolve({
        data: {
          documents: {}
        }
      })))

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that Documents List component does not exist before the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')

    // verify that Documents List component is not displayed after the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    sinon.restore()
    wrapper.destroy()
  })

  xit('display the documents list when documents are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_COURT_ORDER_DOCUMENTS_LINK])

    // mock "get documents"
    sinon.stub(axios, 'get').withArgs('businesses/BC0871300/filings/111/documents')
      .returns(new Promise(resolve => resolve({
        data: {
          documents: {
            uploadedCourtOrder: 'businesses/BC0871300/filings/111/documents/uploadedCourtOrder'
          }
        }
      })))

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that Documents List component does not exist before the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify that Documents List component is displayed after the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(true)

    // verify the number of documents
    expect(wrapper.findAll('.documents-list .download-one-btn').length).toBe(1)

    sinon.restore()
    wrapper.destroy()
  })
})

describe('Filing History List - with documents', () => {
  const FILING_WITH_DOCUMENTS_LINK = {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCounts: 0,
    displayName: 'Annual Report (2019)',
    documentsLink: 'businesses/CP0001191/filings/111/documents',
    effectiveDate: '2019-12-13 00:00:00 GMT',
    filingId: 111,
    isFutureEffective: false,
    name: 'annualReport',
    status: 'COMPLETED',
    submittedDate: '2019-04-06 19:22:59.00 GMT',
    submitter: 'Cameron'
  }

  xit('does not display the documents list when no documents are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_DOCUMENTS_LINK])

    // mock "get documents"
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/111/documents')
      .returns(new Promise(resolve => resolve({
        data: {
          documents: {}
        }
      })))

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that Documents List component does not exist before the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')

    // verify that Documents List component is not displayed after the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    sinon.restore()
    wrapper.destroy()
  })

  xit('display the documents list when documents are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_DOCUMENTS_LINK])

    // mock "get documents"
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/111/documents')
      .returns(new Promise(resolve => resolve({
        data: {
          documents: {
            legalFilings: [
              { annualReport: 'businesses/CP0000840/filings/112758/documents/annualReport' }
            ],
            receipt: 'businesses/CP0000840/filings/112758/documents/receipt'
          }
        }
      })))

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that Documents List component does not exist before the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    // verify View Documents button
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toContain('View Documents')

    // expand details
    await button.trigger('click')
    await flushPromises() // wait for expansion transition

    // verify that Documents List component is displayed after the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(true)

    // verify the number of documents
    expect(wrapper.findAll('.documents-list .download-one-btn').length).toBe(2)

    sinon.restore()
    wrapper.destroy()
  })

  xit('computes proper document titles from the documents data', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_DOCUMENTS_LINK])

    // mock "get documents"
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/111/documents')
      .returns(new Promise(resolve => resolve({
        data: {
          documents: {
            legalFilings: [
              { annualReport: 'businesses/CP0000840/filings/112758/documents/annualReport' },
              { addressChange: 'businesses/CP0000840/filings/112758/documents/addressChange' },
              { directorChange: 'businesses/CP0000840/filings/112758/documents/directorChange' }
            ],
            receipt: 'businesses/CP0000840/filings/112758/documents/receipt'
          }
        }
      })))

    const wrapper = mount(FilingHistoryList, {
      store,
      propsData: { highlightId: 666 },
      vuetify
    })
    await Vue.nextTick()

    // expand details
    await wrapper.find('.expand-btn').trigger('click')
    await flushPromises() // wait for expansion transition

    // verify that Documents List component is displayed after the item is expanded
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(true)

    // verify document titles
    const downloadBtns = wrapper.findAll('.documents-list .download-one-btn')
    expect(downloadBtns.length).toBe(4)
    expect(downloadBtns.at(0).text()).toContain('Annual Report (2019)')
    expect(downloadBtns.at(1).text()).toContain('Address Change')
    expect(downloadBtns.at(2).text()).toContain('Director Change')
    expect(downloadBtns.at(3).text()).toContain('Receipt')

    sinon.restore()
    wrapper.destroy()
  })
})

describe('Filing History List - detail comments', () => {
  const FILING_WITH_COMMENTS_LINK = {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCount: 2,
    commentsLink: 'businesses/CP0001191/filings/111/comments',
    displayName: 'Annual Report',
    effectiveDate: '2019-06-02 19:22:59 GMT',
    filingId: 111,
    isFutureEffective: false,
    name: 'annualReport',
    status: 'COMPLETED',
    submittedDate: '2019-06-02 19:22:59 GMT',
    submitter: 'Cameron'
  }

  it('does not display the details count when count is zero', async () => {
    // init store
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 0,
        displayName: 'Annual Report',
        effectiveDate: '2019-06-02 19:22:59 GMT',
        filingId: 111,
        isFutureEffective: false,
        name: 'annualReport',
        status: 'COMPLETED',
        submittedDate: '2019-06-02 19:22:59 GMT',
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that detail comments button does not exist
    expect(wrapper.find('.comments-btn').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays the comments count when count is greater than zero', async () => {
    // init store
    store.commit('mutateFilings', [
      {
        availableOnPaperOnly: false,
        businessIdentifier: 'CP0001191',
        commentsCount: 2,
        displayName: 'Change of Address',
        // Effective Date is way in the future so it's always > now
        effectiveDate: '2099-12-13 08:00:00 GMT', // Dec 13, 2099 at 00:00:00 am Pacific
        filingId: 666,
        isFutureEffective: true,
        name: 'changeOfAddress',
        status: 'PAID',
        submittedDate: '2019-12-12 19:22:59 GMT', // Dec 12, 2019 at 11:22:59 am Pacific
        submitter: 'Cameron'
      }
    ])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify detail comments button
    expect(wrapper.find('.comments-btn').text()).toContain('Details (2)')

    wrapper.destroy()
  })

  xit('does not display the details list when no comments are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_COMMENTS_LINK])

    // mock "get comments"
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/111/comments')
      .returns(new Promise(resolve => resolve({
        data: {
          comments: []
        }
      })))

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that Details List component does not exist before the item is expanded
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    // expand the panel
    await wrapper.find('.expand-btn').trigger('click')

    // verify that Details List component is not displayed after the item is expanded
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    sinon.restore()
    wrapper.destroy()
  })

  xit('displays the details list when comments are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITH_COMMENTS_LINK])

    // mock "get comments"
    sinon.stub(axios, 'get').withArgs('businesses/CP0001191/filings/111/comments')
      .returns(new Promise(resolve => resolve({
        data: {
          comments: [
            {
              businessId: null,
              comment: 'Detail Comment 1',
              filingId: 111,
              id: 450851,
              submitterDisplayName: 'Submitter 1',
              timestamp: '2021-10-04T17:45:22.134351+00:00'
            },
            {
              businessId: null,
              comment: 'Details Comment 2',
              filingId: 111,
              id: 450852,
              submitterDisplayName: 'Submitter 2',
              timestamp: '2021-10-04T17:45:22.134351+00:00'
            }
          ]
        }
      })))

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that Details List component does not exist until the item is expanded
    expect(wrapper.findComponent(DetailsList).exists()).toBe(false)

    // expand the panel
    await wrapper.find('.expand-btn').trigger('click')
    await flushPromises() // wait for expansion transition

    // verify that Details List component is displayed after the item is expanded
    expect(wrapper.findComponent(DetailsList).exists()).toBe(true)

    // verify the number of comments
    expect(wrapper.findAll('.details-list .detail-body').length).toBe(2)

    sinon.restore()
    wrapper.destroy()
  })
})

describe('Filing History List - without documents', () => {
  const FILING_WITHOUT_DOCUMENTS_LINK = {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCounts: 0,
    displayName: 'Involuntary Dissolution',
    effectiveDate: '2019-12-13 00:00:00 GMT',
    filingId: 111,
    isFutureEffective: false,
    name: 'Involuntary Dissolution',
    status: 'COMPLETED',
    submittedDate: '2019-04-06 19:22:59.00 GMT',
    submitter: 'Cameron'
  }

  it('does not display the view documents button when no documents are present on a filing', async () => {
    // init store
    store.commit('mutateFilings', [FILING_WITHOUT_DOCUMENTS_LINK])

    const wrapper = mount(FilingHistoryList, { store, vuetify })
    await Vue.nextTick()

    // verify that View Documents Button is not rendered
    const button = wrapper.find('.expand-btn')
    expect(button.text()).toEqual('')

    wrapper.destroy()
  })
})
