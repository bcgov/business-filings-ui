import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { createPinia, setActivePinia } from 'pinia'
import { useRootStore } from '@/stores'
import { shallowMount } from '@vue/test-utils'
import DetailsList from '@/components/Dashboard/FilingHistoryList/DetailsList.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const rootStore = useRootStore()

describe('Details List', () => {
  const mockFilingNoComments = {
    type: 'annualReport',
    title: 'Annual Report (2018)',
    filingId: 63958,
    submitter: 'John Doe',
    submittedDate: 'Wed, 12 Dec 2018 12:00:00 GMT',
    paymentToken: null,
    isPaperOnly: true,
    comments: []
  }

  const mockFilingOneComment = {
    type: 'annualReport',
    title: 'Annual Report (2018)',
    filingId: 63958,
    submitter: 'John Doe',
    submittedDate: 'Wed, 12 Dec 2018 12:00:00 GMT',
    paymentToken: null,
    isPaperOnly: true,
    comments: [
      {
        comment: {
          comment: 'Correction for Annual Report (2018), filed on 2018-01-08.',
          filingId: 63958,
          id: 123,
          submitterDisplayName: 'cbIdIr1234',
          timestamp: '2020-03-02T20:26:31.697044+00:00'
        }
      }
    ]
  }

  const mockFilingManyComments = {
    type: 'annualReport',
    title: 'Annual Report (2018)',
    filingId: 63958,
    submitter: 'John Doe',
    submittedDate: 'Wed, 12 Dec 2018 12:00:00 GMT',
    paymentToken: null,
    isPaperOnly: true,
    comments: [
      {
        comment: {
          comment: 'Correction for Annual Report (2018), filed on 2018-01-08.',
          filingId: 63958,
          id: 111,
          submitterDisplayName: 'cbIdIr1234',
          timestamp: '2020-03-02T20:26:31.697044+00:00'
        }
      },
      {
        comment: {
          comment: 'Correction for director mailing delivery address, filed on 2018-01-08.',
          filingId: 63958,
          id: 222,
          submitterDisplayName: 'sevIdiR2020',
          timestamp: '2020-03-05T20:26:31.697044+00:00'
        }
      },
      {
        comment: {
          comment: 'Correction for office delivery address Change, filed on 2018-01-08.',
          filingId: 63958,
          id: 333,
          submitterDisplayName: 'cbIdIr1234',
          timestamp: '2020-03-06T20:26:33.697044+00:00'
        }
      }
    ]
  }

  it('Displays no details if filing contains no comments', () => {
    const wrapper = shallowMount(DetailsList, { propsData: { filing: mockFilingNoComments } })

    expect(wrapper.find('.detail-body').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays details if filing contains comments', () => {
    const wrapper = shallowMount(DetailsList, { propsData: { filing: mockFilingOneComment } })

    expect(wrapper.find('.detail-body').exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays the correct count in the title - single detail', () => {
    const wrapper = shallowMount(DetailsList, { propsData: { filing: mockFilingOneComment } })

    expect(wrapper.find('.title-bar').text()).toContain('Detail (1)')

    wrapper.destroy()
  })

  it('Displays the correct count in the title - multiple details', () => {
    const wrapper = shallowMount(DetailsList, { propsData: { filing: mockFilingManyComments } })

    expect(wrapper.find('.title-bar').text()).toContain('Details (3)')

    wrapper.destroy()
  })

  it('Displays the correct number of details in the list', () => {
    const wrapper = shallowMount(DetailsList, { propsData: { filing: mockFilingManyComments } })

    expect(wrapper.findAll('.detail-body').length).toEqual(3)

    wrapper.destroy()
  })

  it('Does NOT display the add detail btn when the user is NOT staff', () => {
    rootStore.keycloakRoles = ['user']

    const wrapper = shallowMount(DetailsList, {
      propsData: { filing: mockFilingOneComment }
    })

    expect(wrapper.find('.title-bar').text()).not.toContain('Add Detail')

    wrapper.destroy()
  })

  it('Displays the Add Detail button if staff user and NOT a task item', () => {
    rootStore.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      propsData: { filing: mockFilingOneComment }
    })

    expect(wrapper.find('.title-bar').text()).toContain('Add Detail')

    wrapper.destroy()
  })

  it('Displays the correct filing data if NOT staff user', () => {
    rootStore.keycloakRoles = ['user']

    const wrapper = shallowMount(DetailsList, {
      propsData: { filing: mockFilingOneComment }
    })

    expect(wrapper.find('.title-bar').text()).toContain('Detail (1)')
    expect(wrapper.find('.title-bar').text()).not.toContain('Add Detail')
    expect(wrapper.find('.body-2').text()).toContain('BC Registries Staff')
    expect(wrapper.find('.body-2 .pre-line').text())
      .toContain('Correction for Annual Report (2018), filed on 2018-01-08.')

    wrapper.destroy()
  })

  it('Displays the correct filing data if staff user', async () => {
    rootStore.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      vuetify,
      propsData: { filing: mockFilingManyComments }
    })
    await Vue.nextTick()

    expect(wrapper.find('.title-bar').text()).toContain('Details (3)')
    expect(wrapper.find('.title-bar').text()).toContain('Add Detail')

    const firstItem = wrapper.findAll('.body-2').at(1)
    const thirdItem = wrapper.findAll('.body-2').at(3)

    expect(firstItem.text()).toContain('cbIdIr1234')
    expect(firstItem.text()).toContain('2020-03-02T20:26:31.697044+00:00')
    expect(firstItem.find('.pre-line').text())
      .toContain('Correction for Annual Report (2018), filed on 2018-01-08.')

    expect(thirdItem.text()).toContain('sevIdiR2020')
    expect(thirdItem.text()).toContain('2020-03-05T20:26:31.697044+00:00')
    expect(thirdItem.find('.pre-line').text())
      .toContain('Correction for director mailing delivery address, filed on 2018-01-08.')

    wrapper.destroy()
  })
})
