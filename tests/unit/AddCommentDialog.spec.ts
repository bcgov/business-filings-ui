import Vue from 'vue'
import Vuetify from 'vuetify'
import sinon from 'sinon'
import { shallowMount } from '@vue/test-utils'
import axios from '@/axios-auth'
import { AddCommentDialog } from '@/components/dialogs'
import { DetailComment } from '@/components/common'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

const propsData = {
  dialog: true,
  filing: {
    filingId: 456,
    commentsLink: 'businesses/123/filings/456/comments'
  },
  attach: '#parent-page'
}

describe('AddCommentDialog', () => {
  it('renders the page contents correctly', () => {
    const wrapper = shallowMount(AddCommentDialog,
      {
        propsData,
        vuetify
      })
    const vm: any = wrapper.vm

    expect(wrapper.find('#dialog-title').text()).toBe('Add Detail')
    expect(wrapper.findComponent(DetailComment).exists()).toBe(true)
    expect(wrapper.find('#dialog-save-button')).toBeDefined()
    expect(wrapper.find('#dialog-cancel-button')).toBeDefined()

    expect(vm.dialog).toBe(true)
    expect(vm.filing.filingId).toBe(456)
    expect(vm.attach).toBe('#parent-page')
    expect(vm.comment).toBe('')
    expect(vm.detailCommentValid).toBe(false) // because we have no comment

    wrapper.destroy()
  })

  it('emits Close=false event when user clicks Cancel button', async () => {
    const wrapper = shallowMount(AddCommentDialog,
      {
        propsData,
        vuetify
      })

    // click the Cancel button
    await wrapper.find('#dialog-cancel-button').trigger('click')

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([false])

    wrapper.destroy()
  })

  it('emits Close=true event when user clicks Save button', async () => {
    // mock "post a comment" endpoint
    sinon
      .stub(axios, 'post')
      .withArgs('businesses/123/filings/456/comments')
      .returns(
        new Promise(resolve =>
          resolve({
            data: {}
          })
        )
      )

    const wrapper = shallowMount(AddCommentDialog,
      {
        propsData,
        vuetify
      })
    const vm: any = wrapper.vm

    // click the Save button
    // await wrapper.find('#dialog-save-button').trigger('click')

    // work-around because click trigger isn't working
    await vm.save()

    // verify Close event
    expect(wrapper.emitted('close').pop()).toEqual([true])

    wrapper.destroy()
  })
})
