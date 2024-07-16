import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import PendingList from '@/components/Dashboard/PendingList.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

// *** TODO: implement this
describe.skip('PendingList component', () => {
  it('handles empty data', () => {
    const wrapper = mount(PendingList, { vuetify })

    expect(wrapper.find('#entity-in-good-standing').text()).toBe('No')
    expect(wrapper.find('#entity-date-of-incorporation').text()).toBe('')

    wrapper.destroy()
  })

  it('displays business info properly', () => {
    const wrapper = mount(PendingList, {
      propsData: {
        highlightId: null
      },
      vuetify
    })

    // verify component displays properly
    expect(wrapper.find('.v-card').attributes('id')).toBe('about-the-business')
    expect(wrapper.find('header i').attributes('class')).toContain('mdi-domain')
    expect(wrapper.find('header h2').text()).toBe('About the Business')

    const rows = wrapper.findAll('.content > .row')
    expect(rows.at(0).find('.col-sm-3').text()).toBe('Business in Good Standing')
    expect(rows.at(1).find('.col-sm-3').text()).toBe('Date of Incorporation')

    // verify displayed text
    expect(wrapper.find('#entity-in-good-standing').text()).toBe('Yes')
    expect(wrapper.find('#entity-date-of-incorporation').text()).toBe('December 31, 2023')

    wrapper.destroy()
  })
})
