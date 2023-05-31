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

    expect(vm.selectedCountry).toBe('')
    expect(vm.selectedRegion).toBe('')
    expect(vm.countryNames.length).toBe(249)
    expect(wrapper.emitted('valid')).toBeFalsy()
    wrapper.destroy()
  })

  it('set correct country when selected via the country selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Lebanon')

    expect(vm.selectedCountry).toBe('Lebanon')
    expect(vm.selectedRegion).toBe('')
    wrapper.destroy()
  })

  it('set correct region when selected via the region selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Canada')
    const regionsSelector = wrapper.find('#region-selector')
    await regionsSelector.setValue('Ontario')

    expect(vm.selectedCountry).toBe('Canada')
    expect(vm.selectedRegion).toBe('Ontario')
    wrapper.destroy()
  })

  it('emit correct validation when country is selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Lebanon')

    expect(vm.emitChangedCountry())
    expect(wrapper.emitted('valid')).toBeTruthy()
    wrapper.destroy()
  })

  it('emit correct validation when country is selected but region is not', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Canada')

    expect(wrapper.emitted('valid')).toBeFalsy()
    wrapper.destroy()
  })

  it('emit correct validation when country and region are selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Canada')
    const regionsSelector = wrapper.find('#region-selector')
    await regionsSelector.setValue('Ontario')

    expect(vm.emitChangedCountry())
    expect(vm.emitChangedRegion())
    expect(wrapper.emitted('valid')).toBeTruthy()
    wrapper.destroy()
  })
})
