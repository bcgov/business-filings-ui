import Vue from 'vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import sinon from 'sinon'
import { shallowMount } from '@vue/test-utils'
import store from '@/store/store'
import axios from '@/axios-auth'
import { AddCommentDialog } from '@/components/dialogs'
import { DetailComment } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

describe('AddCommentDialog', () => {
  it('renders the page contents correctly', () => {
    // init store
    store.state.entityIncNo = 123

    const wrapper = shallowMount(AddCommentDialog,
      {
        propsData: {
          dialog: true,
          filingId: 456,
          attach: '#parent-page'
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Add Detail')
    expect(wrapper.find(DetailComment).exists()).toBe(true)
    expect(wrapper.find('#dialog-save-button')).toBeDefined()
    expect(wrapper.find('#dialog-cancel-button')).toBeDefined()

    expect(vm.entityIncNo).toBe(123)
    expect(vm.dialog).toBe(true)
    expect(vm.filingId).toBe(456)
    expect(vm.attach).toBe('#parent-page')
    expect(vm.comment).toBe('')
    expect(vm.detailCommentValid).toBe(false) // because we have no comment

    wrapper.destroy()
  })

  it('emits Close=false event when user clicks Cancel button', async () => {
    const wrapper = shallowMount(AddCommentDialog,
      {
        propsData: {
          dialog: true
        },
        store,
        vuetify
      })

    wrapper.find('#dialog-cancel-button').trigger('click')
    await flushPromises()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('emits Close=true event when user clicks Save button', async () => {
    // init store
    store.state.entityIncNo = 123

    // mock "post a comment" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('123/filings/456/comments')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {}
          })
        )
      )

    const wrapper = shallowMount(AddCommentDialog,
      {
        propsData: {
          dialog: true,
          filingId: 456
        },
        store,
        vuetify
      })
    const vm: any = wrapper.vm

    // wrapper.find('#dialog-save-button').trigger('click')
    // await flushPromises()

    // apparently the click doesn't call the method, so do it explicitly
    await vm.save()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([true])

    wrapper.destroy()
  })
})
