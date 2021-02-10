import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import {
  CorpTypeCd, GetCorpInfoObject, GetCorpFullDescription, GetCorpNumberedDescription
} from '@/modules/corp-type-module'

const Dummy = Vue.component('dummy', { template: '<div />' })

describe('Corp Type Util', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    // (this can be any component since we are not really using it)
    const wrapper = shallowMount(Dummy)
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('gets corp info object correctly', () => {
    const obj = GetCorpInfoObject(CorpTypeCd.BC_CORPORATION)

    expect(obj.corpTypeCd).toBe('CR')
    expect(obj.colinInd).toBe(true)
    expect(obj.corpClass).toBe('BC')
    expect(obj.shortDesc).toBe('BC CORPORATION')
    expect(obj.fullDesc).toBe('BC Corporation')
    expect(obj.numberedDesc).toBe('Numbered Corporation')
  })

  it('gets corp full description correctly', () => {
    expect(GetCorpFullDescription(CorpTypeCd.BC_COMPANY)).toBe('BC Limited Company')
    expect(GetCorpFullDescription(CorpTypeCd.BC_ULC_COMPANY)).toBe('BC Unlimited Liability Company')
    expect(GetCorpFullDescription(CorpTypeCd.BENEFIT_COMPANY)).toBe('Benefit Company')
    expect(GetCorpFullDescription(CorpTypeCd.COOP)).toBe('Cooperative Association')
    expect(GetCorpFullDescription(null)).toBe('')
  })

  it('gets corp numbered description correctly', () => {
    expect(GetCorpNumberedDescription(CorpTypeCd.BC_COMPANY)).toBe('Numbered Limited Company')
    expect(GetCorpNumberedDescription(CorpTypeCd.BC_ULC_COMPANY)).toBe('Numbered Unlimited Liability Company')
    expect(GetCorpNumberedDescription(CorpTypeCd.BENEFIT_COMPANY)).toBe('Numbered Benefit Company')
    expect(GetCorpNumberedDescription(CorpTypeCd.COOP)).toBe('Numbered Cooperative Association')
    expect(GetCorpNumberedDescription(null)).toBe('')
  })
})
