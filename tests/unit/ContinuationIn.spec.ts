/* eslint-disable max-len */
import Vue from 'vue'
import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import mockRouter from './mockRouter'
import VueRouter from 'vue-router'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import { DateUtilities, LegalServices } from '@/services'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import TodoList from '@/components/Dashboard/TodoList.vue'
import PendingList from '@/components/Dashboard/PendingList.vue'
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import DocumentsList from '@/components/Dashboard/FilingHistoryList/DocumentsList.vue'
import { ContactInfo } from '@/components/common'
import { FilingStatus } from '@/enums'

const vuetify = new Vuetify()
const localVue = createLocalVue()
const router = mockRouter.mock()

Vue.use(Vuetify)
localVue.use(VueRouter)

setActivePinia(createPinia())
const businessStore = useBusinessStore()
const filingHistoryStore = useFilingHistoryListStore()
const rootStore = useRootStore()

describe('Continuation In - in To Do list', () => {
  it('displays a draft continuation application (with NR)', async () => {
    // init session storage + store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T1234567')
    rootStore.setCurrentJsDate(new Date('2024-07-24T06:59:00.000Z'))
    rootStore.setTasks([
      {
        enabled: true,
        order: 1,
        task: {
          filing: {
            continuationIn: {
              authorization: {}
            },
            displayName: 'BC Limited Company Continuation Application',
            header: {
              name: FilingTypes.CONTINUATION_IN,
              status: FilingStatus.DRAFT
            },
            nameRequest: {
              legalType: CorpTypeCd.CONTINUE_IN
            }
          }
        }
      } as any
    ])
    rootStore.setNameRequest({
      expirationDate: '2024-08-01T06:59:00.000000+00:00' // 8 days past current JS date above
    })

    const wrapper = mount(TodoList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.list-item__title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.expand-btn').text()).toBe('View Details')
    expect(wrapper.find('.list-item__subtitle').text()).toBe('Name Request APPROVED - Expires in 8 days')
    expect(wrapper.find('.list-item__actions .btn-draft-resume').text()).toBe('Resume')

    // cleanup
    wrapper.destroy()
    sessionStorage.removeItem('TEMP_REG_NUMBER')
  })

  it('displays a continuation application needing changes', async () => {
    // init session storage + store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T1234567')
    rootStore.setTasks([
      {
        enabled: true,
        order: 1,
        task: {
          filing: {
            continuationIn: {
              authorization: {}
            },
            displayName: 'BC Limited Company Continuation Application',
            header: {
              date: '2024-07-24T00:00:00.000000+00:00',
              latestReviewComment: 'Authorization document is not legible.',
              name: FilingTypes.CONTINUATION_IN,
              status: FilingStatus.CHANGE_REQUESTED,
              submitter: 'Joe Smith'
            }
          }
        }
      } as any
    ])

    const wrapper = mount(TodoList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.list-item__title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.expand-btn').text()).toBe('Hide Details')
    expect(wrapper.find('.list-item__subtitle').text()).toContain('CHANGE REQUESTED')
    expect(wrapper.find('.list-item__subtitle').text()).toContain('Submitted by Joe Smith on')
    expect(wrapper.find('.list-item__subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.list-item__actions .btn-draft-resume').text()).toBe('Make Changes')

    // verify expansion panel content
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Please make the following updates to your')
    expect((wrapper.find('textarea').element as any)._value).toBe('Authorization document is not legible.')

    // cleanup
    wrapper.destroy()
    sessionStorage.removeItem('TEMP_REG_NUMBER')
  })
})

describe('Continuation In - in Pending list', () => {
  it('displays a pending continuation application', async () => {
    // init store
    rootStore.setPendingsList([
      {
        business: {
          legalType: CorpTypeCd.CONTINUE_IN
        },
        displayName: 'BC Limited Company Continuation Application',
        header: {
          date: '2024-07-24T00:00:00.000000+00:00',
          name: FilingTypes.CONTINUATION_IN,
          submitter: 'Joe Smith'
        }
      }
    ])

    const wrapper = mount(PendingList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.expand-btn').text()).toBe('Hide Details') // open by default
    expect(wrapper.find('.item-header-subtitle').text()).toContain('PENDING STAFF REVIEW')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Submitted by Joe Smith')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')

    // verify expansion panel content
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('BC Registries will review your documents')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('and contact you with the results within 5 business days.')

    // cleanup
    wrapper.destroy()
  })

  it('displays a pending continuation application - 2', async () => {
    // init store
    rootStore.setPendingsList([
      {
        business: {
          legalType: CorpTypeCd.CONTINUE_IN
        },
        displayName: 'BC Limited Company Continuation Application',
        header: {
          date: '2024-07-24T00:00:00.000000+00:00',
          isFutureEffective: true,
          name: FilingTypes.CONTINUATION_IN,
          submitter: 'Joe Smith'
        }
      }
    ])

    const wrapper = mount(PendingList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.expand-btn').text()).toBe('Hide Details') // open by default
    expect(wrapper.find('.item-header-subtitle').text()).toContain('PENDING STAFF REVIEW')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Submitted by Joe Smith')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')

    // verify expansion panel content
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('BC Registries will review your documents')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('and contact you with the results within 5 business days.')

    // cleanup
    wrapper.destroy()
    vi.resetAllMocks()
  })

  it('displays a pending continuation application', async () => {
    // init store
    rootStore.setPendingsList([
      {
        business: {
          legalType: CorpTypeCd.CONTINUE_IN
        },
        displayName: 'BC Limited Company Continuation Application',
        header: {
          date: '2024-07-24T00:00:00.000000+00:00',
          name: FilingTypes.CONTINUATION_IN,
          submitter: 'Joe Smith'
        }
      }
    ])

    // mock date utilities to make effective date seem like a past date
    vi.spyOn((DateUtilities as any), 'isDatePast').mockImplementation(() => true)
    vi.spyOn((DateUtilities as any), 'isDateFuture').mockImplementation(() => false)

    const wrapper = mount(PendingList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.expand-btn').text()).toBe('Hide Details') // open by default
    expect(wrapper.find('.item-header-subtitle').text()).toContain('PENDING STAFF REVIEW')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Submitted')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')

    // verify expansion panel content
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('BC Registries will review your documents')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('and contact you with the results within 5 business days.')

    // cleanup
    wrapper.destroy()
    vi.resetAllMocks()
  })
})

describe('Continuation In - in Recent Filing History list', () => {
  it('displays a rejected continuation application', async () => {
    // init store
    filingHistoryStore.setFilings([
      {
        displayName: 'BC Limited Company Continuation Application',
        effectiveDate: '2024-07-24T00:00:00.000000+00:00', // any date
        name: FilingTypes.CONTINUATION_IN,
        paymentStatusCode: 'COMPLETED',
        status: FilingStatus.REJECTED,
        submittedDate: '2024-07-24T00:00:00.000000+00:00',
        submitter: 'Joe Smith',
        latestReviewComment: 'Authorization is invalid.'
      } as any
    ])

    const wrapper = mount(FilingHistoryList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('REJECTED')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(submitted by Joe Smith on')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.expand-btn').text()).toBe('')

    // verify expansion panel content
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('This BC Limited Company Continuation Application is')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('rejected for the following reasons:')
    expect((wrapper.find('textarea').element as any)._value).toBe('Authorization is invalid.')

    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('You will receive a refund within 10 business days.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Please submit a new application if you would like to')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('continue your business into B.C.')

    // cleanup
    wrapper.destroy()
  })

  it('displays an approved continuation application', async () => {
    // init store
    filingHistoryStore.setFilings([
      {
        displayName: 'BC Limited Company Continuation Application',
        effectiveDate: '2024-07-24T00:00:00.000000+00:00', // any date
        name: FilingTypes.CONTINUATION_IN,
        status: FilingStatus.APPROVED,
        submittedDate: '2024-07-24T00:00:00.000000+00:00',
        submitter: 'Joe Smith'
      } as any
    ])

    const wrapper = mount(FilingHistoryList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Joe Smith on')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.expand-btn').text()).toBe('')

    // verify expansion panel content
    expect(wrapper.find('h4').text()).toBe('Filing Pending')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('This BC Limited Company Continuation Application is paid,')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('but the filing has not been completed by the Business Registry yet.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Some filings may take longer than expected.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Refresh this screen in a few minutes or you can come back later to')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('check on the progress. If this issue persists, please contact us.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    // cleanup
    wrapper.destroy()
  })

  it('displays an approved continuation application - future effective', async () => {
    // init store
    filingHistoryStore.setFilings([
      {
        displayName: 'BC Limited Company Continuation Application',
        effectiveDate: '2024-07-24T00:00:00.000000+00:00', // any date
        isFutureEffective: true,
        name: FilingTypes.CONTINUATION_IN,
        status: FilingStatus.APPROVED,
        submittedDate: '2024-07-24T00:00:00.000000+00:00',
        submitter: 'Joe Smith'
      } as any
    ])

    // mock date utilities to make effective date seem like a future date
    vi.spyOn((DateUtilities as any), 'isDatePast').mockImplementation(() => false)
    vi.spyOn((DateUtilities as any), 'isDateFuture').mockImplementation(() => true)

    const wrapper = mount(FilingHistoryList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FUTURE EFFECTIVE')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Joe Smith on')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.details-btn .view-details').text()).toBe('View Details')
    expect(wrapper.find('.details-btn .hide-details').text()).toBe('Hide Details')

    // verify expansion panel content
    expect(wrapper.find('h4').text()).toBe('Future Effective Continuation Date')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('The filing date and time for this company will be')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('July 23, 2024 at 5:00 pm Pacific time')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('If you wish to change the information in this filing,')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('you must contact BC Registries staff to file a withdrawal.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Withdrawing this Continuation Application will remove this filing')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('and all associated information, and will incur a $20.00 fee.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('BC Registries Contact Information:')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    // cleanup
    wrapper.destroy()
  })

  it('displays an approved continuation application - future effective pending', async () => {
    // init store
    filingHistoryStore.setFilings([
      {
        displayName: 'BC Limited Company Continuation Application',
        effectiveDate: '2024-07-24T00:00:00.000000+00:00', // any date
        isFutureEffective: true,
        name: FilingTypes.CONTINUATION_IN,
        status: FilingStatus.APPROVED,
        submittedDate: '2024-07-24T00:00:00.000000+00:00',
        submitter: 'Joe Smith'
      } as any
    ])

    // mock date utilities to make effective date seem like a future date
    vi.spyOn((DateUtilities as any), 'isDatePast').mockImplementation(() => true)
    vi.spyOn((DateUtilities as any), 'isDateFuture').mockImplementation(() => false)

    const wrapper = mount(FilingHistoryList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PENDING')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Joe Smith on')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.expand-btn').text()).toBe('')

    // verify expansion panel content
    expect(wrapper.find('h4').text()).toBe('Continuation Pending')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('The filing date and time for this company has been recorded as')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('July 23, 2024 at 5:00 pm Pacific time')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('It may take up to one hour to process this filing.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('If this issue persists, please contact us.')
    expect(wrapper.findComponent(ContactInfo).exists()).toBe(true)

    // cleanup
    wrapper.destroy()
  })

  it('displays a completed continuation application', async () => {
    // init session storage + store
    sessionStorage.setItem('TEMP_REG_NUMBER', 'T1234567')
    businessStore.setLegalName('My C Company')
    filingHistoryStore.setFilings([
      {
        displayName: 'BC Limited Company Continuation Application',
        effectiveDate: '2024-07-24T00:00:00.000000+00:00', // any date
        name: FilingTypes.CONTINUATION_IN,
        status: FilingStatus.COMPLETED,
        submittedDate: '2024-07-24T00:00:00.000000+00:00',
        submitter: 'Joe Smith'
      } as any
    ])

    const wrapper = mount(FilingHistoryList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Joe Smith on')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.expand-btn').text()).toBe('')

    // verify expansion panel content
    expect(wrapper.find('h4').text()).toBe('Incorporation Complete')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('My C Company has been successfully continued in.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('The system has completed processing your filing.')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('You can now retrieve the business information.')
    expect(wrapper.find('.reload-business-container').exists()).toBe(true)
    expect(wrapper.find('.reload-business-container .v-btn').text()).toBe('Retrieve Business Information')
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(false)

    // cleanup
    wrapper.destroy()
    sessionStorage.removeItem('TEMP_REG_NUMBER')
  })

  it('displays a new continued in business', async () => {
    // init session storage + store
    sessionStorage.setItem('BUSINESS_ID', 'C1234567')
    businessStore.setIdentifier('C1234567')
    rootStore.setAuthRoles(['staff'])
    filingHistoryStore.setPanel(null)
    filingHistoryStore.setFilings([
      {
        displayName: 'BC Limited Company Continuation Application',
        documentsLink: 'https://documents-link', // any link
        effectiveDate: '2024-07-24T00:00:00.000000+00:00', // any date
        name: FilingTypes.CONTINUATION_IN,
        status: FilingStatus.COMPLETED,
        submittedDate: '2024-07-24T00:00:00.000000+00:00',
        submitter: 'Joe Smith',
        data: {
          order: {
            effectOfOrder: 'planOfArrangement',
            fileNumber: '123456'
          }
        }
      } as any
    ])

    // mock date utilities to make effective date seem like a future date
    vi.spyOn((LegalServices as any), 'fetchDocuments').mockImplementation(() => ({
      certificateOfContinuation: 'https://certificate-of-continuation',
      legalFilings: [{ continuationIn: 'https://continuation-in' }],
      noticeOfArticles: 'https://notice-of-articles',
      receipt: 'https://receipt',
      staticDocuments: [
        { name: 'Director Affidavit', url: 'https://director-affidavit' },
        { name: 'authorization.pdf', url: 'https://authorization' }
      ]
    }))

    const wrapper = mount(FilingHistoryList, { localVue, router, vuetify })
    await Vue.nextTick()

    // verify expansion panel header
    expect(wrapper.find('.item-header-title').text()).toContain('BC Limited Company Continuation Application')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Joe Smith on')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of')
    expect(wrapper.find('.item-header-subtitle').text()).toContain('Jul 23, 2024')
    expect(wrapper.find('.expand-btn .view-details').text()).toBe('View Documents')
    expect(wrapper.find('.expand-btn .hide-details').text()).toBe('Hide Documents')

    // toggle expansion panel to load documents
    await filingHistoryStore.toggleFilingHistoryItem(0)

    // verify expansion panel content + documents
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Court Order Number: 123456')
    expect(wrapper.find('.v-expansion-panel-content').text()).toContain('Pursuant to a Plan of Arrangement')
    expect(wrapper.findComponent(DocumentsList).exists()).toBe(true)
    const documents = wrapper.findAll('.download-one-btn')
    expect(documents.at(0).text()).toBe('Certificate Of Continuation')
    expect(documents.at(1).text()).toBe('BC Limited Company Continuation Application')
    expect(documents.at(2).text()).toBe('Notice Of Articles')
    expect(documents.at(3).text()).toBe('Receipt')
    expect(documents.at(4).text()).toBe('Director Affidavit')
    expect(documents.at(5).text()).toBe('authorization.pdf')
    expect(wrapper.find('.download-all-btn').text()).toBe('Download All')

    // cleanup
    wrapper.destroy()
    vi.resetAllMocks()
    rootStore.setAuthRoles([])
    sessionStorage.removeItem('BUSINESS_ID')
  })
})
