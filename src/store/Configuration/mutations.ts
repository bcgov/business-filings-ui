import {ConfigurationStateIF} from "@/interfaces";
import {KCUserProfile} from "sbc-common-components/src/models/KCUserProfile";

export default {
  setConfiguration (state: ConfigurationStateIF, data: any) {
    state.configuration = data
  },
  /** This method will be REMOVED in the future.
   * Use getters from the Configuration store going
   * forward -- not session getItem()
   */
  saveConfigurationToSession (state: ConfigurationStateIF, data: any) {

  }
}
