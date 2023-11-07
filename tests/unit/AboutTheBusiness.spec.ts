import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AboutTheBusiness from '@/components/AgmExtension/AboutTheBusiness.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('AboutTheBusiness', () => {
  it('displays normally', () => {
    const wrapper = mount(AboutTheBusiness, {
      propsData: {
        data: {
          isGoodStanding: true,
          incorporationDate: new Date('2023-12-31T08:00:00.000Z')
        }
      },
      vuetify
    })

    expect(wrapper.find('.v-card').attributes('id')).toBe('about-the-business')
    expect(wrapper.find('header i').attributes('class')).toContain('mdi-domain')
    expect(wrapper.find('header h2').text()).toBe('About the Business')

    const rows = wrapper.findAll('.content > .row')

    expect(rows.at(0).find('.col-sm-3').text()).toBe('Business in Good Standing')
    expect(rows.at(0).find('.col-sm-9').text()).toBe('Yes')

    expect(rows.at(1).find('.col-sm-3').text()).toBe('Date of Incorporation')
    expect(rows.at(1).find('.col-sm-9').text()).toBe('December 31, 2023')

    wrapper.destroy()
  })
})
