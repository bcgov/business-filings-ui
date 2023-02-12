import { ConfigurationStateIF } from '@/interfaces'
import { KCUserProfile } from 'sbc-common-components/src/models/KCUserProfile'

export default {
  setConfiguration (state: ConfigurationStateIF, data: any) {
    state.configuration = data
  }
}
