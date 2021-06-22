import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import FiledLabel from '@/components/Dashboard/FilingHistoryList/FiledLabel.vue'
import { DateTooltip } from '@/components/common'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Filed Label', () => {
  it('displays no content with a null filing', () => {
    const wrapper = mount(FiledLabel, {
      vuetify,
      propsData: { filing: null }
    })

    // verify content
    expect(wrapper.html()).toBeUndefined()

    wrapper.destroy()
  })

  it('displays expected content with a staff type filing', () => {
    const wrapper = mount(FiledLabel, {
      vuetify,
      propsData: {
        filing: {
          isTypeStaff: true,
          submitter: 'Submitter',
          submittedDate: new Date('2020-05-15 12:00:00 GMT')
        }
      }
    })

    // verify content
    expect(wrapper.find('.filed-label > span').text()).toBe('Filed by Submitter on May 15, 2020')
    expect(wrapper.findAll(DateTooltip).length).toBe(1)

    wrapper.destroy()
  })

  it('displays expected content with a non-staff type filing', () => {
    const wrapper = mount(FiledLabel, {
      vuetify,
      propsData: {
        filing: {
          isTypeStaff: false,
          submitter: 'Submitter',
          submittedDate: new Date('2020-05-15 12:00:00 GMT'),
          effectiveDate: new Date('2020-05-20 12:00:00 GMT')
        }
      }
    })

    // verify content
    const spans = wrapper.findAll('.filed-label > span')
    expect(spans.at(0).text()).toBe('(filed by Submitter on May 15, 2020)')
    expect(spans.at(1).text()).toBe('') // vert-pipe
    expect(spans.at(2).text()).toBe('EFFECTIVE as of May 20, 2020')
    expect(wrapper.findAll(DateTooltip).length).toBe(2)

    wrapper.destroy()
  })
})
