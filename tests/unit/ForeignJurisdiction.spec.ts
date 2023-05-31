import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { ForeignJurisdiction } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('ForeignJurisdiction', () => {
  it('initializes correctly', () => {
    const wrapper = shallowMount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountry).toBe('')
    expect(vm.selectedRegion).toBe('')
    wrapper.destroy()
  })
})
