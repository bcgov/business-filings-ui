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

    wrapper.find('#country-selector').trigger('click')
    await Vue.nextTick()
    wrapper.find('.menuable__content__active').findAll('.v-list-item').at(123).trigger('click')

    expect(vm.selectedCountry).toEqual({code: 'LB', name: 'Lebanon'})
    expect(vm.selectedRegion).toEqual({})
    wrapper.destroy()
  })

  xit('set correct region when selected via the region selector', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    wrapper.find('#country-selector').trigger('click')
    await Vue.nextTick()
    wrapper.findAll('.v-list-item').at(39).trigger('click')
    expect(vm.selectedCountry).toEqual({code: 'CA', name: 'Canada'})

    await Vue.nextTick()
    wrapper.find('#region-selector').trigger('click')
    wrapper.find('.menuable__content__active').findAll('.v-list-item').at(7).trigger('click')
    await Vue.nextTick()
    expect(vm.selectedRegion).toEqual({name: 'Ontario', short: 'ON'})
    wrapper.destroy()
  })

  xit('emit correct validation when country is selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Lebanon')

    vm.emitChangedCountry()

    expect(wrapper.emitted('valid')).toBeTruthy()
    wrapper.destroy()
  })

  xit('emit correct validation when country is selected but region is not', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Canada')

    expect(wrapper.emitted('valid')).toBeFalsy()
    wrapper.destroy()
  })

  xit('emit correct validation when country and region are selected', async () => {
    const wrapper = mount(ForeignJurisdiction,
      {
        vuetify
      })
    const vm: any = wrapper.vm

    const countriesSelector = wrapper.find('#country-selector')
    await countriesSelector.setValue('Canada')
    const regionsSelector = wrapper.find('#region-selector')
    await regionsSelector.setValue('Ontario')

    vm.emitChangedCountry()
    vm.emitChangedRegion()

    expect(wrapper.emitted('valid')).toBeTruthy()
    wrapper.destroy()
  })
})
