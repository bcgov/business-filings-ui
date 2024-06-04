<template>
  <div>
    <v-expansion-panels
      id="alerts-container"
      :value="panel"
    >
      <component
        :is="alert"
        v-for="(alert, index) in alerts"
        :key="index"
        :showPanel="(panel === index)"
        @togglePanel="togglePanel(index)"
      />
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useBusinessStore } from '@/stores'
import Amalgamation from '@/components/Dashboard/Alerts/Amalgamation.vue'
import CorporateOnline from '@/components/Dashboard/Alerts/CorporateOnline.vue'
import FrozenInformation from '@/components/Dashboard/Alerts/FrozenInformation.vue'
import InDissolution from '@/components/Dashboard/Alerts/InDissolution.vue'
import MissingInformation from '@/components/Dashboard/Alerts/MissingInformation.vue'
import NotInCompliance from '@/components/Dashboard/Alerts/NotInCompliance.vue'
import NotInGoodStanding from '@/components/Dashboard/Alerts/NotInGoodStanding.vue'

@Component({
  components: {
    Amalgamation,
    CorporateOnline,
    FrozenInformation,
    InDissolution,
    MissingInformation,
    NotInCompliance,
    NotInGoodStanding
  }
})
export default class Alerts extends Vue {
  // store references
  @Getter(useBusinessStore) isAmalgamationAlert!: boolean
  @Getter(useBusinessStore) isDisableNonBenCorps!: boolean
  @Getter(useBusinessStore) isFrozenInformationAlert!: boolean
  @Getter(useBusinessStore) isInDissolutionAlert!: boolean
  @Getter(useBusinessStore) isMissingInformationAlert!: boolean
  @Getter(useBusinessStore) isNotInComplianceAlert!: boolean
  @Getter(useBusinessStore) isNotInGoodStandingAlert!: boolean

  // local variables
  panel = NaN // currently expanded panel

  /** The list of alerts. */
  get alerts (): Array<any> {
    const alerts = []
    if (this.isInDissolutionAlert) alerts.push(InDissolution) // needs to be shown first (high priority)
    if (this.isAmalgamationAlert) alerts.push(Amalgamation)
    if (this.isDisableNonBenCorps) alerts.push(CorporateOnline)
    if (this.isFrozenInformationAlert) alerts.push(FrozenInformation)
    if (this.isMissingInformationAlert) alerts.push(MissingInformation)
    if (this.isNotInComplianceAlert) alerts.push(NotInCompliance)
    if (this.isNotInGoodStandingAlert) alerts.push(NotInGoodStanding)
    return alerts
  }

  /** Closes the open panel or opens a new panel. */
  togglePanel (index: number): void {
    this.panel = (this.panel === index ? NaN : index)
  }

  /** Emits the count of alerts.  */
  @Watch('alerts', { immediate: true })
  @Emit('count')
  private emitCount (): number {
    return this.alerts.length
  }
}
</script>
