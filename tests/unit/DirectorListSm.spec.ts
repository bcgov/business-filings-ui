import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount } from '@vue/test-utils'
import { getVuexStore } from '@/store'
import DirectorListSm from '@/components/Dashboard/DirectorListSm.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

describe('DirectorListSm', () => {
  it('handles empty data as a COOP', async () => {
    // init store
    store.state.directors = []
    store.state.entityType = 'CP'

    const wrapper = mount(DirectorListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.directors.length).toEqual(0)
    expect(vm.directors.mailingAddress).toBeUndefined()
    expect(vm.$el.querySelectorAll('.address-panel').length).toEqual(0)

    wrapper.destroy()
  })

  it('displays multiple directors as a COOP', async () => {
    // init store
    store.state.entityType = 'CP'
    store.state.directors = [
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

    const wrapper = mount(DirectorListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    expect(vm.directors.length).toEqual(2)
    expect(vm.directors[0].mailingAddress).toBeUndefined()
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

  it('displays multiple directors as a BCOMP', async () => {
    function click (id) {
      const button = vm.$el.querySelector(id)
      const window = button.ownerDocument.defaultView
      const click = new window.Event('click')
      button.dispatchEvent(click)
    }

    // init store
    store.state.entityType = 'BC'
    store.state.directors = [
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

    const wrapper = mount(DirectorListSm, { store, vuetify })
    const vm = wrapper.vm as any
    await Vue.nextTick()

    click('.address-panel-toggle')
    expect(vm.directors.length).toEqual(2)
    expect(vm.directors[0].mailingAddress).toBeDefined()
    expect(vm.$el.querySelectorAll('.address-panel').length).toEqual(2)
    expect(vm.$el.querySelector('.address-panel').textContent).toContain('Same as above')

    wrapper.destroy()
  })

  it('displays "complete your filing" message', async () => {
    // init store
    store.state.entityType = 'BC'

    const wrapper = mount(DirectorListSm,
      {
        store,
        vuetify,
        propsData: {
          showCompleteYourFilingMessage: true
        }
      })
    await Vue.nextTick()

    // verify that "complete your filing" message is displayed
    expect(wrapper.find('.complete-filing').text()).toBe('Complete your filing to display')

    wrapper.destroy()
  })

  it('displays "grayed out" mode', async () => {
    // init store
    store.state.entityType = 'BC'
    store.state.directors = [
      {
        'officer': {
          'firstName': 'Peter',
          'lastName': 'Griffin'
        }
      },
      {
        'officer': {
          'firstName': 'Joe',
          'lastName': 'Swanson'
        }
      }
    ]

    const wrapper = mount(DirectorListSm,
      {
        store,
        vuetify,
        propsData: {
          showGrayedOut: true
        }
      })
    await Vue.nextTick()

    // verify that component has "disabled" class
    expect(wrapper.classes()).toContain('disabled')

    // verify that expansion buttons aren't clickable
    expect(wrapper.findAll('.address-panel-toggle').at(0).attributes('tabindex')).toBe('-1')
    expect(wrapper.findAll('.address-panel-toggle').at(1).attributes('tabindex')).toBe('-1')

    // verify that expansion icons aren't displayed
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(0).isVisible()).toBe(false)
    expect(wrapper.findAll('.v-expansion-panel-header__icon').at(1).isVisible()).toBe(false)

    wrapper.destroy()
  })
})
