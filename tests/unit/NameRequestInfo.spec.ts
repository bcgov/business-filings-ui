import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import { NameRequestInfo } from '@/components/common/'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

const approvedCpNamerequest = {
  nrNum: 'NR 1234567',
  legalType: 'CP',
  filingId: 0,
  applicants: {
    // address info
    addrLine1: '1012 Douglas St',
    addrLine2: 'Suite 200',
    addrLine3: 'Second Floor',
    city: 'Victoria',
    stateProvinceCd: 'BC',
    postalCd: 'V8W 2C3',
    countryTypeCd: 'CA',
    // contact info
    emailAddress: 'email@example.com',
    phoneNumber: '1234567890',
    // name info
    firstName: 'First',
    middleName: 'Middle',
    lastName: 'Last'
  },
  names: [
    {
      state: 'APPROVED',
      name: 'Approved CP Namerequest'
    }
  ],
  consentFlag: null,
  expirationDate: '2022-07-05T06:59:00+00:00',
  state: 'APPROVED'
}

const conditionalSpNamerequest = {
  nrNum: 'NR 1234567',
  legalType: 'SP',
  filingId: 0,
  applicants: {
    // address info
    addrLine1: '1012 Douglas St',
    addrLine2: 'Suite 200',
    addrLine3: 'Second Floor',
    city: 'Victoria',
    stateProvinceCd: 'BC',
    postalCd: 'V8W 2C3',
    countryTypeCd: 'CA',
    // contact info
    emailAddress: 'email@example.com',
    phoneNumber: '1234567890',
    // name info
    firstName: 'First',
    middleName: 'Middle',
    lastName: 'Last'
  },
  names: [
    {
      state: 'CONDITION',
      name: 'Conditional SP Namerequest'
    }
  ],
  consentFlag: 'X',
  expirationDate: '2021-07-05T06:59:00+00:00',
  state: 'EXPIRED'
}

describe('NameRequestInfo component', () => {
  it('renders an approved coop namerequest correctly', async () => {
    businessStore.setLegalType(CorpTypeCd.COOP)
    const wrapper = mount(NameRequestInfo,
      {
        propsData: { nameRequest: approvedCpNamerequest },
        vuetify
      })
    await Vue.nextTick()

    // verify first column
    const firstCol = wrapper.findAll('.col').at(0)
    expect(firstCol.find('.hdr').text()).toBe('Name Request')

    let keys = firstCol.findAll('.key')
    expect(keys.at(0).text()).toBe('Entity Type:')
    expect(keys.at(1).text()).toBe('Request Type:')
    expect(keys.at(2).text()).toBe('Expiry Date:')
    expect(keys.at(3).text()).toBe('Status:')
    expect(keys.at(4).text()).toBe('Condition/Consent:')

    let vals = firstCol.findAll('.val')
    expect(vals.at(0).text()).toBe('BC Cooperative Association')
    expect(vals.at(1).text()).toBe('New Business')
    expect(vals.at(2).text()).toBe('July 4, 2022 at 11:59 pm Pacific time')
    expect(vals.at(3).text()).toBe('Approved')
    expect(vals.at(4).text()).toBe('Not Required')

    expect(firstCol.find('#status .nr-status-icon.mdi-check').exists()).toBe(true)
    expect(firstCol.find('#condition-consent .nr-status-icon.mdi-check').exists()).toBe(true)
    expect(firstCol.find('#condition-consent .nr-status-icon.mdi-close').exists()).toBe(false)

    // verify second column
    const secondCol = wrapper.findAll('.col').at(1)
    expect(secondCol.find('.hdr').text()).toBe('Name Request Applicant')

    keys = secondCol.findAll('.key')
    expect(keys.at(0).text()).toBe('Name:')
    expect(keys.at(1).text()).toBe('Address:')
    expect(keys.at(2).text()).toBe('Email:')
    expect(keys.at(3).text()).toBe('Phone:')

    vals = secondCol.findAll('.val')
    expect(vals.at(0).text()).toBe('First Middle Last')
    expect(vals.at(1).text()).toBe('1012 Douglas St, Suite 200, Second Floor, Victoria, BC, V8W 2C3, Canada')
    expect(vals.at(2).text()).toBe('email@example.com')
    expect(vals.at(3).text()).toBe('(123) 456-7890')

    wrapper.destroy()
  })

  it('renders a conditional sole prop namerequest correctly', async () => {
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP)
    const wrapper = mount(NameRequestInfo,
      {
        propsData: { nameRequest: conditionalSpNamerequest },
        vuetify
      })
    await Vue.nextTick()

    // verify first column
    const firstCol = wrapper.findAll('.col').at(0)
    expect(firstCol.find('.hdr').text()).toBe('Name Request')

    let keys = firstCol.findAll('.key')
    expect(keys.at(0).text()).toBe('Entity Type:')
    expect(keys.at(1).text()).toBe('Request Type:')
    expect(keys.at(2).text()).toBe('Expiry Date:')
    expect(keys.at(3).text()).toBe('Status:')
    expect(keys.at(4).text()).toBe('Condition/Consent:')

    let vals = firstCol.findAll('.val')
    expect(vals.at(0).text()).toBe('BC Sole Proprietorship or Doing Business As (DBA)')
    expect(vals.at(1).text()).toBe('New Business')
    expect(vals.at(2).text()).toBe('July 4, 2021 at 11:59 pm Pacific time')
    expect(vals.at(3).text()).toBe('Expired')
    expect(vals.at(4).text()).toBe('Not Received')

    expect(firstCol.find('#status .nr-status-icon.mdi-check').exists()).toBe(false)
    expect(firstCol.find('#condition-consent .nr-status-icon.mdi-check').exists()).toBe(false)
    expect(firstCol.find('#condition-consent .nr-status-icon.mdi-close').exists()).toBe(true)

    // verify second column
    const secondCol = wrapper.findAll('.col').at(1)
    expect(secondCol.find('.hdr').text()).toBe('Name Request Applicant')

    keys = secondCol.findAll('.key')
    expect(keys.at(0).text()).toBe('Name:')
    expect(keys.at(1).text()).toBe('Address:')
    expect(keys.at(2).text()).toBe('Email:')
    expect(keys.at(3).text()).toBe('Phone:')

    vals = secondCol.findAll('.val')
    expect(vals.at(0).text()).toBe('First Middle Last')
    expect(vals.at(1).text()).toBe('1012 Douglas St, Suite 200, Second Floor, Victoria, BC, V8W 2C3, Canada')
    expect(vals.at(2).text()).toBe('email@example.com')
    expect(vals.at(3).text()).toBe('(123) 456-7890')

    wrapper.destroy()
  })
})
