import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'

// Components and sub-components
import DocumentsList from '@/components/Dashboard/FilingHistoryList/DocumentsList.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Documents List', () => {
  const SAMPLE_FILING = {
    availableOnPaperOnly: false,
    businessIdentifier: 'CP0001191',
    commentsCounts: 0,
    displayName: 'Annual Report (2019)',
    documentsLink: '',
    effectiveDate: '2019-12-13 00:00:00 GMT',
    filingId: 111,
    isFutureEffective: false,
    name: 'annualReport',
    status: 'COMPLETED',
    submittedDate: '2019-04-06 19:22:59.00 GMT',
    submitter: 'Cameron'
  }

  it('displays an empty documents list correctly', async () => {
    const filing = {
      ...SAMPLE_FILING,
      documents: []
    }

    const wrapper = mount(DocumentsList, { propsData: { filing }, store, vuetify })
    await Vue.nextTick()

    // verify the number of document buttons
    expect(wrapper.findAll('.download-one-btn').length).toBe(0)

    wrapper.destroy()
  })

  it('displays one document in the list correctly', async () => {
    const filing = {
      ...SAMPLE_FILING,
      documents: [
        { title: 'Document' }
      ]
    }

    const wrapper = mount(DocumentsList, { propsData: { filing }, store, vuetify })
    await Vue.nextTick()

    // verify the number of document buttons
    const documentBtns = wrapper.findAll('.download-one-btn')
    expect(documentBtns.length).toBe(1)

    // verify the individual document button
    expect(documentBtns.at(0).text()).toBe('Document')

    // verify that there is no Download All button
    expect(wrapper.find('.download-all-btn').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays multiple documents in the list correctly', async () => {
    const filing = {
      ...SAMPLE_FILING,
      documents: [
        { title: 'Document 1' },
        { title: 'Document 2' }
      ]
    }

    const wrapper = mount(DocumentsList, { propsData: { filing }, store, vuetify })
    await Vue.nextTick()

    // verify the number of document buttons
    const documentBtns = wrapper.findAll('.download-one-btn')
    expect(documentBtns.length).toBe(2)

    // verify the individual document buttons
    expect(documentBtns.at(0).text()).toBe('Document 1')
    expect(documentBtns.at(1).text()).toBe('Document 2')

    // verify the Download All button
    expect(wrapper.find('.download-all-btn').text()).toBe('Download All')

    wrapper.destroy()
  })

  it('sets the button properties when a document is loading', async () => {
    const filing = {
      ...SAMPLE_FILING,
      documents: [
        { title: 'Document 1' },
        { title: 'Document 2' }
      ]
    }

    const wrapper = mount(DocumentsList, { propsData: { filing }, store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const documentBtns = wrapper.findAll('.download-one-btn')

    // verify that all buttons are enabled and not loading
    expect(documentBtns.at(0).attributes('disabled')).toBeUndefined()
    expect(documentBtns.at(0).classes('v-btn--loading')).toBe(false)
    expect(documentBtns.at(1).attributes('disabled')).toBeUndefined()
    expect(documentBtns.at(1).classes('v-btn--loading')).toBe(false)
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.download-all-btn').classes('v-btn--loading')).toBe(false)

    // set the flags
    vm.mutateLoadingOne(true)
    vm.mutateLoadingOneIndex(1)
    await Vue.nextTick()

    // verify that all buttons are disabled and that only button 1 is loading
    expect(documentBtns.at(0).attributes('disabled')).toBe('disabled')
    expect(documentBtns.at(0).classes('v-btn--loading')).toBe(false)
    expect(documentBtns.at(1).attributes('disabled')).toBe('disabled')
    expect(documentBtns.at(1).classes('v-btn--loading')).toBe(true)
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.download-all-btn').classes('v-btn--loading')).toBe(false)

    vm.mutateLoadingOne(false)
    wrapper.destroy()
  })

  it('sets the button properties when all documents are loading', async () => {
    const filing = {
      ...SAMPLE_FILING,
      documents: [
        { title: 'Document 1' },
        { title: 'Document 2' }
      ]
    }

    const wrapper = mount(DocumentsList, { propsData: { filing }, store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    const documentBtns = wrapper.findAll('.download-one-btn')

    // verify that all buttons are enabled and not loading
    expect(documentBtns.at(0).attributes('disabled')).toBeUndefined()
    expect(documentBtns.at(0).classes('v-btn--loading')).toBe(false)
    expect(documentBtns.at(1).attributes('disabled')).toBeUndefined()
    expect(documentBtns.at(1).classes('v-btn--loading')).toBe(false)
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.download-all-btn').classes('v-btn--loading')).toBe(false)

    // set the flag
    vm.mutateLoadingAll(true)
    await Vue.nextTick()

    // verify that all buttons are disabled and that only button 1 is loading
    expect(documentBtns.at(0).attributes('disabled')).toBe('disabled')
    expect(documentBtns.at(0).classes('v-btn--loading')).toBe(false)
    expect(documentBtns.at(1).attributes('disabled')).toBe('disabled')
    expect(documentBtns.at(1).classes('v-btn--loading')).toBe(false)
    expect(wrapper.find('.download-all-btn').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.download-all-btn').classes('v-btn--loading')).toBe(true)

    vm.mutateLoadingAll(false)
    wrapper.destroy()
  })
})
