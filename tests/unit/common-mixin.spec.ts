import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import MixinTester from '@/mixin-tester.vue'

describe('Common Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    // (this can be any component since we are not really using it,
    // but the component must import the subject mixin)
    const wrapper = shallowMount(MixinTester)
    vm = wrapper.vm
    await Vue.nextTick()
  })

  it('returns correct values for omitProps()', () => {
    const baseObj = {
      nested: {
        prop1: 'true',
        prop2: 123,
        prop3: []
      }
    }

    // verify no omitted props in nested object
    expect(vm.omitProps(baseObj, [], [])).toStrictEqual(baseObj)

    // verify that second param isn't used
    expect(vm.omitProps(baseObj, ['not_used'], [])).toStrictEqual(baseObj)

    // verify some omitted props in nested object
    expect(vm.omitProps(baseObj, [], ['prop1', 'prop2'])).toStrictEqual({ nested: { prop3: [] } })
  })

  it('returns correct values for isSame()', () => {
    const objA = {
      prop1: 'true',
      prop2: 123
    }
    const objB = {
      prop1: 'false',
      prop2: 123
    }
    const objC = {
      prop1: 'true',
      prop2: 456
    }
    const objD = {
      prop1: 'true',
      prop2: 123,
      prop3: []
    }
    const objE = {
      prop3: []
    }

    // verify normal object comparisons
    expect(vm.isSame(objA, objA)).toBe(true)
    expect(vm.isSame(objA, objB)).toBe(false)
    expect(vm.isSame(objA, objC)).toBe(false)
    expect(vm.isSame(objA, objD)).toBe(false)
    expect(vm.isSame(objA, objE)).toBe(false)

    // verify object comparisons with omitted property
    expect(vm.isSame(objA, objB, ['prop1'])).toBe(true)
    expect(vm.isSame(objA, objC, ['prop2'])).toBe(true)
    expect(vm.isSame(objA, objD, ['prop3'])).toBe(true)
  })
})
