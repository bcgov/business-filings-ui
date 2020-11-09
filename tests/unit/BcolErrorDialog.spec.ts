import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import { BcolErrorDialog } from '@/components/dialogs'

Vue.use(Vuetify)
const vuetify = new Vuetify({})
const store = getVuexStore()

describe('BcolErrorDialog - Verify parameters passed in are displayed correctly', () => {
  it('displays generic message for normal users', () => {
    const wrapper = shallowMount(BcolErrorDialog,
      {
        propsData: {
          filingType: 'annualReport',
          bcolObject: {
            title: 'Error',
            detail: 'A BCOL payment error has occurred'
          }
        },
        store,
        vuetify
      })

    expect(wrapper.find('#dialog-title').text()).toBe('Payment Incomplete - Error')
    expect(wrapper.find('#dialog-content').text())
      .toContain('A BCOL payment error has occurred')
    expect(wrapper.find('#dialog-header').text())
      .toBe('This Annual Report could not be filed for the following reason:')
    expect(wrapper.find('#dialog-retry-button')).toBeDefined()

    wrapper.destroy()
  })
})
