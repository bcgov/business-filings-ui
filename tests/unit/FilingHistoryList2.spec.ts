import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useFilingHistoryListStore } from '@/stores'
import flushPromises from 'flush-promises'
import axios from '@/axios-auth'
import sinon from 'sinon'
import { filings } from './filings.json'
import { FilingStatus, FilingSubTypes } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'

// Components and sub-components
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
// import CompletedAlteration from '@/components/Dashboard/FilingHistoryList/CompletedAlteration.vue'
// import CompletedIa from '@/components/Dashboard/FilingHistoryList/CompletedIa.vue'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/bodies/FutureEffective.vue'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/bodies/FutureEffectivePending.vue'
import PaperFiling from '@/components/Dashboard/FilingHistoryList/filings/PaperFiling.vue'
// import PendingFiling from '@/components/Dashboard/FilingHistoryList/PendingFiling.vue'
import StaffFiling from '@/components/Dashboard/FilingHistoryList/filings/StaffFiling.vue'

// must match entity in filings.json:
const ENTITY_INC_NO = 'CP0000840'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const filingHistoryListStore = useFilingHistoryListStore()

// Helper functions
const itIf = (condition) => condition ? it : it.skip
const isPaperOnly = (filing) => filing.availableOnPaperOnly
const isCorrection = (filing) => !!filing.correctedFilingId
const isCorrected = (filing) => !!filing.correctionFilingId
const isIncorporationApplication = (filing) => (filing.name === FilingTypes.INCORPORATION_APPLICATION)
// const isBcompCoa = (filing) => false FUTURE: implement BComp tests
const isAlteration = (filing) => (filing.name === FilingTypes.ALTERATION)
const isRegularAmalgamation = (filing) => (filing.name === FilingTypes.AMALGAMATION_APPLICATION &&
  filing.filingSubType === FilingSubTypes.AMALGAMATION_REGULAR)
const isHorizontalAmalgamation = (filing) => (filing.name === FilingTypes.AMALGAMATION_APPLICATION &&
  filing.filingSubType === FilingSubTypes.AMALGAMATION_HORIZONTAL)
const isVerticalAmalgamation = (filing) => (filing.name === FilingTypes.AMALGAMATION_APPLICATION &&
  filing.filingSubType === FilingSubTypes.AMALGAMATION_VERTICAL)
const isConsentContinuationOut = (filing) => (filing.name === FilingTypes.CONSENT_CONTINUATION_OUT)
const isStaff = (filing) => (
  filing.name === FilingTypes.REGISTRARS_NOTATION ||
  filing.name === FilingTypes.REGISTRARS_ORDER ||
  filing.name === FilingTypes.COURT_ORDER ||
  filing.name === FilingTypes.PUT_BACK_ON ||
  (filing.name === FilingTypes.DISSOLUTION && filing.displayName === 'Administrative Dissolution')
)

// Iterate over sample filings
filings.forEach((filing: any, index: number) => {
  describe(`Filing History List - item #${index} (${filing.name})`, () => {
    let wrapper, vm

    beforeAll(() => {
      businessStore.setIdentifier(ENTITY_INC_NO)
      filingHistoryListStore.setFilings([filing])

      const get = sinon.stub(axios, 'get')

      // mock "get comments"
      get.withArgs(filing.commentsLink)
        .returns(new Promise(resolve => resolve({ data: { comments: [] } })))

      // mock "get documents"
      get.withArgs(filing.documentsLink)
        .returns(new Promise(resolve => resolve({ data: { documents: {} } })))

      // mount the component
      wrapper = mount(FilingHistoryList, { vuetify })
      vm = wrapper.vm
    })

    afterAll(() => {
      sinon.restore()
      wrapper.destroy()
    })

    //
    // the following tests verify the item fields that get set
    //
    itIf(isPaperOnly(filing))('available on paper only', () => {
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]

      expect(item.availableOnPaperOnly).toBe(true)
    })

    itIf(isCorrection(filing))('correction filing', () => {
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]

      expect(item.correctedFilingId).toBe(filing.correctedFilingId)
    })

    itIf(isCorrected(filing))('corrected filing', () => {
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]

      expect(item.correctionFilingId).toBe(filing.correctionFilingId)
    })

    itIf(isIncorporationApplication(filing))('incorporation application filing', () => {
      // expect(vm.getFilings.length).toBe(1) // sanity check
      // const item = vm.getFilings[0]

      // expect(item.isCompletedIa).toBeDefined() // FUTURE: test this more specifically
      // expect(item.isFutureEffectiveIa).toBeDefined() // FUTURE: test this more specifically
      // expect(item.isFutureEffectiveIaPending).toBeDefined() // FUTURE: test this more specifically
    })

    // itIf(isBcompCoa(filing))('BCOMP change of address filing', () => {
    //   expect(vm.getFilings.length).toBe(1) // sanity check
    //   expect(item.isFutureEffectiveCoaPending).toBeDefined()
    // })

    itIf(isAlteration(filing))('alteration filing', () => {
      // expect(vm.getFilings.length).toBe(1) // sanity check
      // const item = vm.getFilings[0]

      // expect(item.courtOrderNumber).toBeDefined() // FUTURE: test this more specifically
      // expect(item.isArrangement).toBeDefined() // FUTURE: test this more specifically
      // expect(item.isFutureEffectiveAlteration).toBeDefined() // FUTURE: test this more specifically
      // expect(item.isFutureEffectiveAlterationPending).toBeDefined() // FUTURE: test this more specifically
      // expect(item.toLegalType).toBeDefined() // FUTURE: test this more specifically
      // expect(item.fromLegalType).toBeDefined() // FUTURE: test this more specifically
    })

    itIf(isRegularAmalgamation(filing))('regular amalgamation filing', () => {
      // verify data
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]
      expect(item.businessIdentifier).toBe('BC1234567')
      expect(item.data.amalgamationApplication.type).toBe(FilingSubTypes.AMALGAMATION_REGULAR)
      expect(item.displayName).toBe('Amalgamation Application - Regular')
      expect(item.name).toBe(FilingTypes.AMALGAMATION_APPLICATION)
      expect(item.status).toBe(FilingStatus.COMPLETED)

      // verify display
      expect(wrapper.find('.item-header-title').text()).toBe('Amalgamation Application - Regular')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Registry Staff on Feb 3, 2023)')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of Feb 3, 2023')
      expect(wrapper.find('.view-details').text()).toBe('View Documents')
      expect(wrapper.find('.hide-details').text()).toBe('Hide Documents')
    })

    itIf(isHorizontalAmalgamation(filing))('horizontal amalgamation filing', async () => {
      // verify data
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]
      expect(item.businessIdentifier).toBe('BC1234567')
      expect(item.data.amalgamationApplication.type).toBe(FilingSubTypes.AMALGAMATION_HORIZONTAL)
      expect(item.displayName).toBe('Amalgamation Application - Horizontal')
      expect(item.name).toBe(FilingTypes.AMALGAMATION_APPLICATION)
      expect(item.status).toBe(FilingStatus.COMPLETED)

      // verify display
      expect(wrapper.find('.item-header-title').text()).toBe('Amalgamation Application - Horizontal')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Registry Staff on Feb 3, 2023)')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of Feb 3, 2023')
      expect(wrapper.find('.view-details').text()).toBe('View Documents')
      expect(wrapper.find('.hide-details').text()).toBe('Hide Documents')
    })

    itIf(isVerticalAmalgamation(filing))('vertical amalgamation filing', () => {
      // verify data
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]
      expect(item.businessIdentifier).toBe('BC1234567')
      expect(item.data.amalgamationApplication.type).toBe(FilingSubTypes.AMALGAMATION_VERTICAL)
      expect(item.displayName).toBe('Amalgamation Application - Vertical')
      expect(item.name).toBe(FilingTypes.AMALGAMATION_APPLICATION)
      expect(item.status).toBe(FilingStatus.COMPLETED)

      // verify display
      expect(wrapper.find('.item-header-title').text()).toBe('Amalgamation Application - Vertical')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('FILED AND PAID')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('(filed by Registry Staff on Feb 3, 2023)')
      expect(wrapper.find('.item-header-subtitle').text()).toContain('EFFECTIVE as of Feb 3, 2023')
      expect(wrapper.find('.view-details').text()).toBe('View Documents')
      expect(wrapper.find('.hide-details').text()).toBe('Hide Documents')
    })

    itIf(isConsentContinuationOut(filing))('consent to continuation out filing', () => {
      // expect(vm.getFilings.length).toBe(1) // sanity check
      // const item = vm.getFilings[0]

      // expect(item.details).toBeDefined() // FUTURE: test this more specifically
      // expect(item.expiry).toBeDefined() // FUTURE: test this more specifically
    })

    itIf(isStaff(filing))('staff filing', () => {
      // expect(vm.getFilings.length).toBe(1) // sanity check
      // const item = vm.getFilings[0]

      // expect(item.fileNumber).toBeDefined() // FUTURE: test this more specifically
      // expect(item.isTypeStaff).toBe(true)
      // // expect(item.details).toBeDefined() // FUTURE: test this more specifically
      // expect(item.planOfArrangement).toBeDefined() // FUTURE: test this more specifically
    })

    //
    // the following tests verify the displayed item
    //
    it('title', () => {
      // expect(vm.getFilings.length).toBe(1) // sanity check
      // expect(wrapper.find('.item-header__title').text()).toBe(filing.displayName)
    })

    it('subtitle', () => {
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]

      if (item.isTypeStaff) {
        if (item.putBackOnOrAdminDissolution) {
          expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED')
          expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
          expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
        } else {
          expect(wrapper.find('.item-header__subtitle').text()).toContain('Filed by Registry Staff on')
        }
      } else if (item.isFutureEffectiveCoaPending) {
        // expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PENDING')
        // expect(wrapper.find('.item-header__subtitle').text()).not.toContain('PAID')
        // expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        // expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
        // expect(wrapper.find('.pending-alert')).toBeDefined()
      } else if (item.isCompletedIa) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else if (item.isFutureEffectiveIaPending) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PENDING')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else if (item.isFutureEffectiveIa) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FUTURE EFFECTIVE INCORPORATION')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else if (item.isFutureEffectiveAlterationPending) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PENDING')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else if (item.isFutureEffectiveAlteration) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FUTURE EFFECTIVE ALTERATION')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else if (item.status === 'PAID') {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PENDING')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else if (item.putBackOnOrAdminDissolution) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      } else {
        // expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PAID')
        // expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        // expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      }
    })

    it('expand button', async () => {
      expect(vm.getFilings.length).toBe(1) // sanity check

      // verify initial button label
      const expandBtn = wrapper.find('.expand-btn')
      if (isPaperOnly(filing)) {
        expect(expandBtn.text()).toContain('Request a Copy')
      } else if (isStaff(filing)) {
        expect(expandBtn.text()).toContain('View')
      } else {
        expect(expandBtn.text()).toContain('View Documents')
      }

      // click button and verify updated label
      await expandBtn.trigger('click')
      await flushPromises() // wait for expansion transition

      if (isPaperOnly(filing)) {
        expect(expandBtn.text()).toContain('Close')
      } else if (isStaff(filing)) {
        expect(expandBtn.text()).toContain('Hide')
      } else {
        expect(expandBtn.text()).toContain('Hide Documents')
      }
    })

    it('expansion panel', async () => {
      expect(vm.getFilings.length).toBe(1) // sanity check
      const item = vm.getFilings[0]

      if (item.isTypeStaff) {
        expect(wrapper.findComponent(StaffFiling).exists()).toBe(true)
      // } else if (item.isFutureEffectiveCoaPending) {
      //   // no details
      // } else if (item.isCompletedIa) {
      //   expect(wrapper.findComponent(CompletedIa).exists()).toBe(true)
      } else if (item.isFutureEffectiveIaPending) {
        expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(true)
      } else if (item.isFutureEffectiveIa) {
        expect(wrapper.findComponent(FutureEffective).exists()).toBe(true)
      } else if (item.isFutureEffectiveAlterationPending) {
        expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(true)
      } else if (item.isFutureEffectiveAlteration) {
        expect(wrapper.findComponent(FutureEffective).exists()).toBe(true)
      // } else if (item.status === 'PAID') {
      //   expect(wrapper.findComponent(PendingFiling).exists()).toBe(true)
      // } else if (item.name === 'alteration') {
      //   expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(true)
      } else if (item.availableOnPaperOnly) {
        expect(wrapper.findComponent(PaperFiling).exists()).toBe(true)
      } else {
        // no details
      }
    })
  })
})
