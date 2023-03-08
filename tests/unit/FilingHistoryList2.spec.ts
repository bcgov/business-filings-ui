import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import flushPromises from 'flush-promises'
import axios from '@/axios-auth'
import sinon from 'sinon'
import { filings } from './filings.json'

// Components and sub-components
import FilingHistoryList from '@/components/Dashboard/FilingHistoryList.vue'
import CompletedAlteration from '@/components/Dashboard/FilingHistoryList/CompletedAlteration.vue'
import CompletedIa from '@/components/Dashboard/FilingHistoryList/CompletedIa.vue'
import FutureEffective from '@/components/Dashboard/FilingHistoryList/FutureEffective.vue'
import FutureEffectivePending from '@/components/Dashboard/FilingHistoryList/FutureEffectivePending.vue'
import PaperFiling from '@/components/Dashboard/FilingHistoryList/PaperFiling.vue'
import PendingFiling from '@/components/Dashboard/FilingHistoryList/PendingFiling.vue'
import StaffFiling from '@/components/Dashboard/FilingHistoryList/StaffFiling.vue'

// must match entity in filings.json:
const ENTITY_INC_NO = 'CP0000840'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

// Helper functions
const itIf = (condition) => condition ? it : xit
const isPaperOnly = (filing) => filing.availableOnPaperOnly
const isCorrection = (filing) => !!filing.correctedFilingId
const isCorrected = (filing) => !!filing.correctionFilingId
const isIncorporationApplication = (filing) => (filing.name === 'incorporationApplication')
const isBcompCoa = (filing) => false // FUTURE: implement BComp tests
const isAlteration = (filing) => (filing.name === 'alteration')
const isConsentContinuationOut = (filing) => (filing.name === 'consentContinuationOut')
const isStaff = (filing) => (
  filing.name === 'registrarsNotation' ||
  filing.name === 'registrarsOrder' ||
  filing.name === 'courtOrder' ||
  filing.name === 'putBackOn' ||
  (filing.name === 'dissolution' && filing.displayName === 'Administrative Dissolution')
)

// Iterate over sample filings
filings.forEach((filing: any, index: number) => {
  describe(`Filing History List - item #${index} (${filing.name})`, () => {
    let wrapper, vm

    beforeAll(() => {
      store.commit('setIdentifier', ENTITY_INC_NO)
      store.state.filings = [filing]

      const get = sinon.stub(axios, 'get')

      // mock "get comments"
      get.withArgs(filing.commentsLink)
        .returns(new Promise(resolve => resolve({ data: { comments: [] } })))

      // mock "get documents"
      get.withArgs(filing.documentsLink)
        .returns(new Promise(resolve => resolve({ data: { documents: {} } })))

      // mount the component
      const $route = { query: {} }
      wrapper = mount(FilingHistoryList, {
        store, mocks: { $route }, propsData: { dissolutionType: filing?.data?.dissolution?.dissolutionType }, vuetify })
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
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.availableOnPaperOnly).toBe(true)
    })

    itIf(isCorrection(filing))('correction filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.correctedFilingId).toBe(filing.correctedFilingId)
      expect(item.correctedLink).toBe(filing.correctedLink)
    })

    itIf(isCorrected(filing))('corrected filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.correctionFilingId).toBe(filing.correctionFilingId)
      expect(item.correctionLink).toBe(filing.correctionLink)
    })

    itIf(isIncorporationApplication(filing))('incorporation application filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.isCompletedIa).toBeDefined() // FUTURE: test this more specifically
      expect(item.isFutureEffectiveIa).toBeDefined() // FUTURE: test this more specifically
      expect(item.isFutureEffectiveIaPending).toBeDefined() // FUTURE: test this more specifically
    })

    itIf(isBcompCoa(filing))('BCOMP change of address filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.isFutureEffectiveCoaPending).toBeDefined()
    })

    itIf(isAlteration(filing))('alteration filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.courtOrderNumber).toBeDefined() // FUTURE: test this more specifically
      expect(item.isArrangement).toBeDefined() // FUTURE: test this more specifically
      expect(item.isFutureEffectiveAlteration).toBeDefined() // FUTURE: test this more specifically
      expect(item.isFutureEffectiveAlterationPending).toBeDefined() // FUTURE: test this more specifically
      expect(item.toLegalType).toBeDefined() // FUTURE: test this more specifically
      expect(item.fromLegalType).toBeDefined() // FUTURE: test this more specifically
    })

    itIf(isConsentContinuationOut(filing))('consent to continuation out filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.details).toBeDefined() // FUTURE: test this more specifically
      expect(item.expiry).toBeDefined() // FUTURE: test this more specifically
    })

    itIf(isStaff(filing))('staff filing', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      expect(item.fileNumber).toBeDefined() // FUTURE: test this more specifically
      expect(item.isTypeStaff).toBe(true)
      // expect(item.details).toBeDefined() // FUTURE: test this more specifically
      expect(item.planOfArrangement).toBeDefined() // FUTURE: test this more specifically
    })

    //
    // the following tests verify the displayed item
    //
    it('title', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      expect(wrapper.find('.item-header__title').text()).toBe(filing.displayName)
    })

    it('subtitle', () => {
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      if (item.isTypeStaff) {
        if (item.putBackOnOrAdminDissolution) {
          expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED')
          expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
          expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
        } else {
          expect(wrapper.find('.item-header__subtitle').text()).toContain('Filed by Registry Staff on')
        }
      } else if (item.isFutureEffectiveCoaPending) {
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PENDING')
        expect(wrapper.find('.item-header__subtitle').text()).not.toContain('PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
        expect(wrapper.find('.pending-alert')).toBeDefined()
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
        expect(wrapper.find('.item-header__subtitle').text()).toContain('FILED AND PAID')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('(filed by Registry Staff on')
        expect(wrapper.find('.item-header__subtitle').text()).toContain('EFFECTIVE as of')
      }
    })

    it('expand button', async () => {
      expect(vm.historyItems.length).toBe(1) // sanity check

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
      expect(vm.historyItems.length).toBe(1) // sanity check
      const item = vm.historyItems[0]

      if (item.isTypeStaff) {
        expect(wrapper.findComponent(StaffFiling).exists()).toBe(true)
      } else if (item.isFutureEffectiveCoaPending) {
        // no details
      } else if (item.isCompletedIa) {
        expect(wrapper.findComponent(CompletedIa).exists()).toBe(true)
      } else if (item.isFutureEffectiveIaPending) {
        expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(true)
      } else if (item.isFutureEffectiveIa) {
        expect(wrapper.findComponent(FutureEffective).exists()).toBe(true)
      } else if (item.isFutureEffectiveAlterationPending) {
        expect(wrapper.findComponent(FutureEffectivePending).exists()).toBe(true)
      } else if (item.isFutureEffectiveAlteration) {
        expect(wrapper.ffindComponentind(FutureEffective).exists()).toBe(true)
      } else if (item.status === 'PAID') {
        expect(wrapper.findComponent(PendingFiling).exists()).toBe(true)
      } else if (item.name === 'alteration') {
        expect(wrapper.findComponent(CompletedAlteration).exists()).toBe(true)
      } else if (item.availableOnPaperOnly) {
        expect(wrapper.findComponent(PaperFiling).exists()).toBe(true)
      } else {
        // no details
      }
    })
  })
})
