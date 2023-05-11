import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore } from '@/stores'
import CustodianListSm from '@/components/Dashboard/CustodianListSm.vue'
import { click } from '../click'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()

describe('CustodianListSm', () => {
  it('handles empty data as a COOP', async () => {
    // init store
    businessStore.setLegalType(CorpTypeCd.COOP)

    const wrapper = mount(CustodianListSm, { vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.custodians.length).toEqual(0)
    expect(vm.custodians.mailingAddress).toBeUndefined()
    expect(vm.$el.querySelectorAll('.address-panel').length).toEqual(0)

    wrapper.destroy()
  })

  it('displays multiple custodians as a COOP', async () => {
    // init store
    businessStore.setLegalType(CorpTypeCd.COOP)
    const custodians = [
      {
        'officer': {
          'firstName': 'Peter',
          'lastName': 'Griffin'
        },
        'deliveryAddress': {
          'streetAddress': '1012 Douglas St',
          'addressCity': 'Victoria',
          'addressRegion': 'BC',
          'postalCode': 'V8W 2C3',
          'addressCountry': 'CA'
        }
      },
      {
        'officer': {
          'firstName': 'Joe',
          'lastName': 'Swanson'
        },
        'deliveryAddress': {
          'streetAddress': '220 Buchanan St',
          'addressCity': 'Glasgow',
          'addressRegion': 'Scotland',
          'postalCode': 'G1 2FFF',
          'addressCountry': 'UK'
        }
      }
    ]

    const wrapper = mount(CustodianListSm, { vuetify, propsData: { custodians } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.custodians.length).toEqual(2)
    expect(vm.custodians[0].mailingAddress).toBeUndefined()
    expect(vm.$el.querySelectorAll('.address-panel').length).toEqual(2)

    // verify that "complete your filing" message isn't displayed
    expect(wrapper.find('.complete-filing').exists()).toBe(false)

    // verify that component doesn't have "disabled" class
    expect(wrapper.classes()).not.toContain('disabled')

    // verify that expansion buttons are clickable
    expect(wrapper.findAll('.address-panel-toggle').at(0).attributes('tabindex')).toBeUndefined()
    expect(wrapper.findAll('.address-panel-toggle').at(1).attributes('tabindex')).toBeUndefined()

    // verify that expansion icons are displayed
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(0).isVisible()).toBe(true)
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(1).isVisible()).toBe(true)

    wrapper.destroy()
  })

  it('displays multiple custodians as a BCOMP', async () => {
    // init store
    businessStore.setLegalType(CorpTypeCd.BENEFIT_COMPANY)
    const custodians = [
      {
        'officer': {
          'firstName': 'Peter',
          'lastName': 'Griffin'
        },
        'deliveryAddress': {
          'streetAddress': '1012 Douglas St',
          'addressCity': 'Victoria',
          'addressRegion': 'BC',
          'postalCode': 'V8W 2C3',
          'addressCountry': 'CA'
        },
        'mailingAddress': {
          'streetAddress': '1012 Douglas St',
          'addressCity': 'Victoria',
          'addressRegion': 'BC',
          'postalCode': 'V8W 2C3',
          'addressCountry': 'CA'
        }
      },
      {
        'officer': {
          'firstName': 'Joe',
          'lastName': 'Swanson'
        },
        'deliveryAddress': {
          'streetAddress': '220 Buchanan St',
          'addressCity': 'Glasgow',
          'addressRegion': 'Scotland',
          'postalCode': 'G1 2FFF',
          'addressCountry': 'UK'
        },
        'mailingAddress': {
          'streetAddress': '1012 Douglas St',
          'addressCity': 'Victoria',
          'addressRegion': 'BC',
          'postalCode': 'V8W 2C3',
          'addressCountry': 'CA'
        }
      }
    ]

    const wrapper = mount(CustodianListSm, { vuetify, propsData: { custodians } })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    await click(vm, '.address-panel-toggle')
    expect(vm.custodians.length).toEqual(2)
    expect(vm.custodians[0].mailingAddress).toBeDefined()
    expect(vm.$el.querySelectorAll('.address-panel').length).toEqual(2)
    expect(vm.$el.querySelector('.address-panel').textContent).toContain('Same as above')

    wrapper.destroy()
  })
})
