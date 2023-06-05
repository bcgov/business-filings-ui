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

    expect(vm.selectedCountryName).toEqual('')
    expect(vm.selectedRegionName).toEqual('')
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
    await wrapper.findAll('.v-list-item').at(123).trigger('click')

    expect(vm.selectedCountryName).toEqual('Lebanon')
    expect(vm.selectedCountryCode).toEqual('LB')
    expect(vm.selectedRegionName).toEqual('')
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
    await region.setValue('Ontario')

    expect(vm.selectedCountryName).toEqual('Canada')
    expect(vm.selectedCountryCode).toEqual('CA')
    expect(vm.selectedRegionName).toEqual('Ontario')
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

    expect(provinces).toEqual(expect.not.arrayContaining([{ name: 'British Columbia', short: 'BC' }]))
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

    expect(provinces).toEqual(expect.arrayContaining([{ name: 'Federal', short: 'FEDERAL' }]))
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
    await region.setValue('New York')

    expect(vm.selectedCountryName).toEqual('United States of America')
    expect(vm.selectedRegionName).toEqual('New York')
    wrapper.destroy()
  })

  it('emit correct events when country is selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(123).trigger('click')

    expect(wrapper.emitted('update:country').pop()[0]).toEqual('LB')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual(undefined)
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when country is selected but region is not', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    await wrapper.find('#country-selector').trigger('click')
    await wrapper.findAll('.v-list-item').at(39).trigger('click')

    expect(vm.selectedRegionName).toEqual('')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual(undefined)
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
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
    await region.setValue('Ontario')

    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual('ON')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('draft country with no regions', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify,
        propsData: {
          draftCountry: 'LB'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountryName).toEqual('Lebanon')
    expect(vm.selectedRegionName).toEqual('')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('LB')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual(undefined)
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('draft country with regions but none is selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify,
        propsData: {
          draftCountry: 'CA'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountryName).toEqual('Canada')
    expect(vm.selectedRegionName).toEqual('')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual(undefined)
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('draft country with draft region', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify,
        propsData: {
          draftCountry: 'CA',
          draftRegion: 'ON'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountryName).toEqual('Canada')
    expect(vm.selectedRegionName).toEqual('Ontario')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual('ON')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('draft country with BC as region', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify,
        propsData: {
          draftCountry: 'CA',
          draftRegion: 'BC'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountryName).toEqual('Canada')
    expect(vm.selectedRegionName).toEqual(undefined)
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual(undefined)
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('draft country with federal as region', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify,
        propsData: {
          draftCountry: 'CA',
          draftRegion: 'FEDERAL'
        }
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountryName).toEqual('Canada')
    expect(vm.selectedRegionName).toEqual('Federal')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual('FEDERAL')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })
})
