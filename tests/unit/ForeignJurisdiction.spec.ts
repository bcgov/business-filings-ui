import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { ForeignJurisdiction } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('ForeignJurisdiction', () => {
  it('initializes correctly', () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    expect(vm.selectedCountryCode).toEqual('')
    expect(vm.selectedRegionName).toEqual('')
    expect(vm.getCountries().length).toEqual(249) // This number might change someday.
    // This number might change someday, including divider and pinned US/CA
    expect(vm.getCountriesList().length).toEqual(252)
    expect(wrapper.emitted('valid')).toBeFalsy()
    wrapper.destroy()
  })

  it('set correct country when selected via the country selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'LB'

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

    vm.selectedRegionName = 'Ontario'
    expect(vm.selectedCountryCode).toEqual('')
    expect(vm.selectedRegionName).toEqual('Ontario')
    wrapper.destroy()
  })

  it('no BC as a province when Canada is selected as the country', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'CA'
    vm.emitChangedCountry()
    vm.selectedRegionName = 'British Columnbia'
    vm.emitChangedRegion()

    expect(wrapper.emitted('update:region').pop()[0]).toBeUndefined()
    wrapper.destroy()
  })

  it('Federal exists as a province when Canada is selected as the country', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'CA'
    vm.emitChangedCountry()
    vm.selectedRegionName = 'Federal'
    vm.emitChangedRegion()

    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual('FEDERAL')
    wrapper.destroy()
  })

  it('set correct US state when selected via the region selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'US-1'
    vm.emitChangedCountry()
    vm.selectedRegionName = 'New York'
    vm.emitChangedRegion()

    expect(vm.selectedCountryCode).toEqual('US')
    expect(vm.selectedRegionName).toEqual('New York')
    wrapper.destroy()
  })

  it('emit correct events when country is selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'LB'
    vm.emitChangedCountry()

    expect(wrapper.emitted('update:country').pop()[0]).toEqual('LB')
    expect(wrapper.emitted('update:region').pop()[0]).toBeUndefined()
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })

  it('emit correct events when country is selected but region is not', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'CA'
    vm.emitChangedCountry()

    expect(vm.selectedRegionName).toEqual('')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toBeUndefined()
    expect(wrapper.emitted('valid').pop()[0]).toBe(false)
    wrapper.destroy()
  })

  it('emit correct events when country and region are selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    vm.selectedCountryCode = 'CA'
    vm.emitChangedCountry()
    vm.selectedRegionName = 'Ontario'
    vm.emitChangedRegion()

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

    expect(vm.selectedCountryCode).toEqual('LB')
    expect(vm.selectedRegionName).toEqual('')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('LB')
    expect(wrapper.emitted('update:region').pop()[0]).toBeUndefined()
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

    expect(vm.selectedCountryCode).toEqual('CA')
    expect(vm.selectedRegionName).toEqual('')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toBeUndefined()
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

    expect(vm.selectedCountryCode).toEqual('CA')
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

    expect(vm.selectedCountryCode).toEqual('CA')
    expect(vm.selectedRegionName).toBeUndefined()
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toBeUndefined()
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

    expect(vm.selectedCountryCode).toEqual('CA')
    expect(vm.selectedRegionName).toEqual('Federal')
    expect(wrapper.emitted('update:country').pop()[0]).toEqual('CA')
    expect(wrapper.emitted('update:region').pop()[0]).toEqual('FEDERAL')
    expect(wrapper.emitted('valid').pop()[0]).toBe(true)
    wrapper.destroy()
  })
})
