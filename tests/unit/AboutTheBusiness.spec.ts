import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AboutTheBusiness from '@/components/AgmExtension/AboutTheBusiness.vue'
import { AgmExtEvalIF, EmptyAgmExtEval } from '@/interfaces'
import { DateUtilities } from '@/services'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('About The Business component', () => {
  it('handles empty data', async () => {
    const wrapper = mount(AboutTheBusiness, {
      vuetify,
      propsData: { data: EmptyAgmExtEval }
    })
    await Vue.nextTick()

    expect(wrapper.find('#entity-in-good-standing').text()).toBe('No')
    expect(wrapper.find('#entity-date-of-incorporation').text()).toBe('')
  })

  it('displays business info properly', async () => {
    const wrapper = mount(AboutTheBusiness, {
      vuetify,
      propsData: {
        data: {
          ...EmptyAgmExtEval,
          isGoodStanding: true,
          incorporationDate: new Date('2023-12-31T08:00:00.000Z')
        } as AgmExtEvalIF
      }
    })
    await Vue.nextTick()

    // verify displayed text
    expect(wrapper.find('#entity-in-good-standing').text()).toBe('Yes')
    expect(wrapper.find('#entity-date-of-incorporation').text())
      .toBe(DateUtilities.dateToPacificDate(
        new Date('2023-12-31T08:00:00.000Z'), true
      ))
  })
})
