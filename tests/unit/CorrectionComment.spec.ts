import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import CorrectionComment from '@/components/Dashboard/TodoList/CorrectionComment.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('DetailComment', () => {
  it('initializes correctly with no comment prop', () => {
    const wrapper = mount(CorrectionComment, {
      propsData: {},
      vuetify
    })

    expect(wrapper.find(CorrectionComment).exists()).toBe(true)
    expect(wrapper.find('.correction-comment').exists()).toBe(false)

    wrapper.destroy()
  })

  it('initializes correctly with comment prop', () => {
    const wrapper = mount(CorrectionComment, {
      propsData: { comment: 'A test comment' },
      vuetify
    })

    expect(wrapper.find(CorrectionComment).exists()).toBe(true)
    expect(wrapper.find('h4 span').text()).toBe('Detail')
    expect(wrapper.find('p').text()).toBe('A test comment')

    wrapper.destroy()
  })
})
