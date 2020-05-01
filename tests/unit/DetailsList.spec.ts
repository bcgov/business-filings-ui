import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { getVuexStore } from '@/store'
import { shallowMount } from '@vue/test-utils'
import { DetailsList } from '@/components/common'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

describe('Details List', () => {
  const mockNoCommentsFiling = {
    'type': 'annualReport',
    'title': 'Annual Report (2018)',
    'filingId': 63958,
    'filingAuthor': 'John Doe',
    'filingDate': '2018-12-12',
    'filingYear': '2018',
    'paymentToken': null,
    'paperOnly': true,
    'isCorrected': false,
    'isCorrectionPending': false,
    'comments': []
  }

  const mockFiling = {
    'type': 'annualReport',
    'title': 'Annual Report (2018)',
    'filingId': 63958,
    'filingAuthor': 'John Doe',
    'filingDate': '2018-12-12',
    'filingYear': '2018',
    'paymentToken': null,
    'paperOnly': true,
    'isCorrected': false,
    'isCorrectionPending': false,
    'comments': [
      {
        'comment': {
          'comment': 'Correction for Annual Report (2018). Filed on 2018-01-08.',
          'filingId': 63958,
          'id': 123,
          'submitterDisplayName': 'cbIdIr1234',
          'timestamp': '2020-03-02T20:26:31.697044+00:00'
        }
      }
    ]
  }

  const mockManyCommentsFiling = {
    'type': 'annualReport',
    'title': 'Annual Report (2018)',
    'filingId': 63958,
    'filingAuthor': 'John Doe',
    'filingDate': '2018-12-12',
    'filingYear': '2018',
    'paymentToken': null,
    'paperOnly': true,
    'isCorrected': false,
    'isCorrectionPending': false,
    'comments': [
      {
        'comment': {
          'comment': 'Correction for Annual Report (2018). Filed on 2018-01-08.',
          'filingId': 63958,
          'id': 111,
          'submitterDisplayName': 'cbIdIr1234',
          'timestamp': '2020-03-02T20:26:31.697044+00:00'
        }
      },
      {
        'comment': {
          'comment': 'Correction for director mailing delivery address. Filed on 2018-01-08.',
          'filingId': 63958,
          'id': 222,
          'submitterDisplayName': 'sevIdiR2020',
          'timestamp': '2020-03-05T20:26:31.697044+00:00'
        }
      },
      {
        'comment': {
          'comment': 'Correction for office delivery address Change. Filed on 2018-01-08.',
          'filingId': 63958,
          'id': 333,
          'submitterDisplayName': 'cbIdIr1234',
          'timestamp': '2020-03-06T20:26:33.697044+00:00'
        }
      }
    ]
  }

  it('Displays no details if filing contains no comments', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockNoCommentsFiling } })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.detail-body')).toBeNull()

    wrapper.destroy()
  })

  it('Displays details if filing contains comments', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFiling } })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.detail-body')).not.toBeNull()

    wrapper.destroy()
  })

  it('Displays the correct count in the title - single detail', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFiling } })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.title-bar').textContent).toContain('Detail (1)')

    wrapper.destroy()
  })

  it('Displays the correct count in the title - multiple details', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockManyCommentsFiling } })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.title-bar').textContent).toContain('Details (3)')

    wrapper.destroy()
  })

  it('Displays the correct number of details in the list', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockManyCommentsFiling } })
    const vm: any = wrapper.vm

    const detailsCount = vm.$el.querySelectorAll('.detail-body').length
    expect(detailsCount).toEqual(3)

    wrapper.destroy()
  })

  it('Does NOT display the add detail btn when the user is NOT staff', () => {
    store.state.keycloakRoles = ['user']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFiling,
        isTask: false
      }
    })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.title-bar').textContent).not.toContain('Add Detail')

    wrapper.destroy()
  })

  it('Does NOT display the add detail btn when the item is a task', () => {
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFiling,
        isTask: true
      }
    })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.title-bar').textContent).not.toContain('Add Detail')

    wrapper.destroy()
  })

  it('Displays the Add Detail button if staff user and NOT a task item', () => {
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFiling,
        isTask: false
      }
    })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.title-bar').textContent).toContain('Add Detail')

    wrapper.destroy()
  })

  it('Displays the correct filing data if NOT staff user', () => {
    store.state.keycloakRoles = ['user']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFiling,
        isTask: false
      }
    })
    const vm: any = wrapper.vm

    expect(vm.$el.querySelector('.title-bar').textContent).toContain('Detail (1)')
    expect(vm.$el.querySelector('.title-bar').textContent).not.toContain('Add Detail')
    expect(vm.$el.querySelector('.body-2').textContent).toContain('Registry Staff')
    expect(vm.$el.querySelector('.body-2 .pre-line').textContent)
      .toContain('Correction for Annual Report (2018). Filed on 2018-01-08.')

    wrapper.destroy()
  })

  it('Displays the correct filing data if staff user', async () => {
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      store,
      vuetify,
      propsData: {
        filing: mockManyCommentsFiling,
        isTask: false
      }
    })
    const vm: any = wrapper.vm
    await Vue.nextTick()

    expect(vm.$el.querySelector('.title-bar').textContent).toContain('Details (3)')
    expect(vm.$el.querySelector('.title-bar').textContent).toContain('Add Detail')

    const firstItem = vm.$el.querySelectorAll('.body-2')[1]
    const thirdItem = vm.$el.querySelectorAll('.body-2')[3]

    expect(firstItem.textContent).toContain('cbIdIr1234')
    expect(firstItem.textContent).toContain('2020-03-02T20:26:31.697044+00:00')
    expect(firstItem.querySelector('.pre-line').textContent)
      .toContain('Correction for Annual Report (2018). Filed on 2018-01-08.')

    expect(thirdItem.textContent).toContain('sevIdiR2020')
    expect(thirdItem.textContent).toContain('2020-03-05T20:26:31.697044+00:00')
    expect(thirdItem.querySelector('.pre-line').textContent)
      .toContain('Correction for director mailing delivery address. Filed on 2018-01-08.')

    wrapper.destroy()
  })
})
