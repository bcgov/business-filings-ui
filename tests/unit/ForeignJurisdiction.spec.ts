import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { ForeignJurisdiction } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('ForeignJurisdiction', () => {
  it('initializes correctly', () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountry).toEqual({})
    expect(vm.selectedRegion).toEqual({})
    expect(vm.getCountries().length).toEqual(249) // This number might change someday.
    expect(wrapper.emitted('valid')).toBeFalsy()
    wrapper.destroy()
  })

  it('set correct country when selected via the country selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    await wrapper.find('#country-selector').trigger('click')
    wrapper.findAll('.v-list-item').at(123).trigger('click')

    expect(vm.selectedCountry).toEqual({code: 'LB', name: 'Lebanon'})
    expect(vm.selectedRegion).toEqual({})
    wrapper.destroy()
  })

  it('set correct Canadian province when selected via the region selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(39).trigger('click')

    const region = wrapper.find('#region-selector')
    await region.setValue(JSON.stringify({code: 'ON', name: 'Ontario'}))

    expect(vm.selectedCountry).toEqual({code: 'CA', name: 'Canada'})
    expect(vm.selectedRegion).toEqual(JSON.stringify({code: 'ON', name: 'Ontario'}))
    wrapper.destroy()
  })

  it('no BC as a province when Canada is selected as the country', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(39).trigger('click')

    const provinces = wrapper.findAll('.v-select').at(1).props('items')

    expect(!provinces.includes({'name': 'British Columbia', 'short': 'BC'}))
    wrapper.destroy()
  })

  it('Federal exists as a province when Canada is selected as the country', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(39).trigger('click')

    const provinces = wrapper.findAll('.v-select').at(1).props('items')

    expect(provinces.includes({'name': 'Federal', 'short': 'FD'}))
    wrapper.destroy()
  })

  it('set correct US state when selected via the region selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(235).trigger('click')

    const region = wrapper.find('#region-selector')
    await region.setValue(JSON.stringify({code: 'NY', name: 'New York'}))

    expect(vm.selectedCountry).toEqual({code: 'US', name: 'United States of America'})
    expect(vm.selectedRegion).toEqual(JSON.stringify({code: 'NY', name: 'New York'}))
    wrapper.destroy()
  })

  it('emit correct events when country is selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    await wrapper.find('#country-selector').trigger('click')
    wrapper.findAll('.v-list-item').at(123).trigger('click')

    expect(wrapper.emitted('update:country').pop()[0]).toEqual({code: 'LB', name: 'Lebanon'})
    expect(wrapper.emitted('valid')).toBeTruthy()
    wrapper.destroy()
  })

  it('emit correct events when country is selected but region is not', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    await wrapper.find('#country-selector').trigger('click')
    wrapper.findAll('.v-list-item').at(39).trigger('click')

    expect(vm.selectedRegion).toEqual({})
    expect(wrapper.emitted('update:country').pop()[0]).toEqual({code: 'CA', name: 'Canada'})
    expect(wrapper.emitted('valid').pop()[0]).toBeFalsy()
    wrapper.destroy()
  })

  it('emit correct events when country and region are selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(39).trigger('click')

    const region = wrapper.find('#region-selector')
    await region.setValue(JSON.stringify({short: 'ON', name: 'Ontario'}))

    expect(wrapper.emitted('update:country').pop()[0]).toEqual({code: 'CA', name: 'Canada'})
    expect(wrapper.emitted('update:region').pop()[0]).toEqual(JSON.stringify({short: 'ON', name: 'Ontario'}))
    wrapper.destroy()
  })
})
