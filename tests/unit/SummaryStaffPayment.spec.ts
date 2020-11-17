import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { SummaryStaffPayment } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('SummaryStaffPayment', () => {
  it('initializes correctly with no props', async () => {
    const wrapper = mount(SummaryStaffPayment, { vuetify })
    await Vue.nextTick()

    // verify properties
    const vm: any = wrapper.vm
    expect(vm.staffPaymentData.option).toBeNaN()
    expect(vm.staffPaymentData.routingSlipNumber).toBeNull()
    expect(vm.staffPaymentData.bcolAccountNumber).toBeNull()
    expect(vm.staffPaymentData.datNumber).toBeNull()
    expect(vm.staffPaymentData.folioNumber).toBeNull()
    expect(vm.staffPaymentData.isPriority).toBe(false)

    // verify displayed elements
    expect(wrapper.find('.payment-container label').text()).toBe('Payment')
    expect(wrapper.find('.value.fas').exists()).toBe(false)
    expect(wrapper.find('.value.bcol').exists()).toBe(false)
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    wrapper.destroy()
  })

  it('displays correctly with FAS option and no Priority', async () => {
    const wrapper = mount(SummaryStaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 1, // FAS
          routingSlipNumber: '123456789'
        }
      }
    })
    await Vue.nextTick()

    // verify displayed elements
    expect(wrapper.find('.value.fas').exists()).toBe(true)
    expect(wrapper.find('.value.bcol').exists()).toBe(false)
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    const paragraphs = wrapper.findAll('.value p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toBe('Cash or Cheque')
    expect(paragraphs.at(1).text()).toBe('Routing Slip Number: 123456789')
    expect(paragraphs.at(2).text()).toBe('Priority: No')

    wrapper.destroy()
  })

  it('displays correctly with FAS option and Priority', async () => {
    const wrapper = mount(SummaryStaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 1, // FAS
          routingSlipNumber: '123456789',
          isPriority: true
        }
      }
    })
    await Vue.nextTick()

    // verify displayed elements
    expect(wrapper.find('.value.fas').exists()).toBe(true)
    expect(wrapper.find('.value.bcol').exists()).toBe(false)
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    const paragraphs = wrapper.findAll('.value p')
    expect(paragraphs.length).toBe(3)
    expect(paragraphs.at(0).text()).toBe('Cash or Cheque')
    expect(paragraphs.at(1).text()).toBe('Routing Slip Number: 123456789')
    expect(paragraphs.at(2).text()).toBe('Priority: Yes')

    wrapper.destroy()
  })

  it('displays correctly with BCOL option, no Folio Number and no Priority', async () => {
    const wrapper = mount(SummaryStaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 2, // BCOL
          bcolAccountNumber: '123456',
          datNumber: 'C1234567'
        }
      }
    })
    await Vue.nextTick()

    // verify displayed elements
    expect(wrapper.find('.value.fas').exists()).toBe(false)
    expect(wrapper.find('.value.bcol').exists()).toBe(true)
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    const paragraphs = wrapper.findAll('.value p')
    expect(paragraphs.length).toBe(5)
    expect(paragraphs.at(0).text()).toBe('BC Online')
    expect(paragraphs.at(1).text()).toBe('BC Online Account Number: 123456')
    expect(paragraphs.at(2).text()).toBe('DAT Number: C1234567')
    expect(paragraphs.at(3).text()).toBe('Folio Number: Not Provided')
    expect(paragraphs.at(4).text()).toBe('Priority: No')

    wrapper.destroy()
  })

  it('displays correctly with BCOL option, Folio Number and Priority', async () => {
    const wrapper = mount(SummaryStaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 2, // BCOL
          bcolAccountNumber: '123456',
          datNumber: 'C1234567',
          folioNumber: '123ABCabc',
          isPriority: true
        }
      }
    })
    await Vue.nextTick()

    // verify displayed elements
    expect(wrapper.find('.value.fas').exists()).toBe(false)
    expect(wrapper.find('.value.bcol').exists()).toBe(true)
    expect(wrapper.find('.value.no-fee').exists()).toBe(false)

    const paragraphs = wrapper.findAll('.value p')
    expect(paragraphs.length).toBe(5)
    expect(paragraphs.at(0).text()).toBe('BC Online')
    expect(paragraphs.at(1).text()).toBe('BC Online Account Number: 123456')
    expect(paragraphs.at(2).text()).toBe('DAT Number: C1234567')
    expect(paragraphs.at(3).text()).toBe('Folio Number: 123ABCabc')
    expect(paragraphs.at(4).text()).toBe('Priority: Yes')

    wrapper.destroy()
  })

  it('displays correctly with No Fee option', async () => {
    const wrapper = mount(SummaryStaffPayment, {
      vuetify,
      propsData: {
        staffPaymentData: {
          option: 0 // NO_FEE
        }
      }
    })
    await Vue.nextTick()

    // verify displayed elements
    expect(wrapper.find('.value.fas').exists()).toBe(false)
    expect(wrapper.find('.value.bcol').exists()).toBe(false)
    expect(wrapper.find('.value.no-fee').exists()).toBe(true)

    const paragraphs = wrapper.findAll('.value p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs.at(0).text()).toBe('No Fee')
    expect(paragraphs.at(1).text()).toBe('Priority: Not Available')

    wrapper.destroy()
  })
})
