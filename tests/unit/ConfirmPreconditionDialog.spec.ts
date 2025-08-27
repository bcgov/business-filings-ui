import Vue from 'vue'
import Vuetify from 'vuetify'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useBusinessStore, useRootStore } from '@/stores'
import ConfirmPreconditionDialog from '@/components/DigitalCredentials/dialogs/ConfirmPreconditionDialog.vue'
import { BusinessConfigBen } from '@/resources/BEN'
import { BusinessConfigGp } from '@/resources/GP'
import { BusinessConfigSp } from '@/resources/SP'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const businessStore = useBusinessStore()
const rootStore = useRootStore()

const BIZ_NAME = 'A test business'
const ATTEST_NAME = 'Test Name'
const PRECONDITION = 'proprietor'

describe('Confirm Preconditions Dialog - Displays Confirmation messages', () => {
  it('displays confirmation modal to users for Sole Proprietorship', () => {
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP)
    rootStore.setConfigObject(BusinessConfigSp)

    const wrapper = shallowMount(ConfirmPreconditionDialog, {
      propsData: {
        dialog: true,
        attestBusiness: BIZ_NAME,
        attestName: ATTEST_NAME,
        precondition: PRECONDITION
      },
      vuetify
    })

    expect(wrapper.find('#dialog-title').text()).toBe(`Are you ${ATTEST_NAME}, a ${PRECONDITION} with ${BIZ_NAME}?`)
    expect(wrapper.find('#dialog-confirm-button')).toBeDefined()
    expect(wrapper.find('#dialog-confirm-button').text()).toContain("Yes, it's me")
    expect(wrapper.find('#dialog-deny-button')).toBeDefined()

    wrapper.destroy()
  })

  it('handles missing values without crashing', () => {
    businessStore.setLegalType(CorpTypeCd.SOLE_PROP)
    rootStore.setConfigObject(BusinessConfigSp)

    const wrapper = shallowMount(ConfirmPreconditionDialog, {
      propsData: {
        dialog: true,
        precondition: PRECONDITION
      },
      vuetify
    })

    expect(wrapper.find('#dialog-title').text()).toBe(`Are you , a ${PRECONDITION} with ?`)
    expect(wrapper.find('#dialog-confirm-button')).toBeDefined()
    expect(wrapper.find('#dialog-confirm-button').text()).toContain("Yes, it's me")
    expect(wrapper.find('#dialog-deny-button')).toBeDefined()

    wrapper.destroy()
  })
})
