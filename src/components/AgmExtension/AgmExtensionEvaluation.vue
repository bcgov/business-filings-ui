<template>
  <VcardTemplate id="agm-extension-evaluation">
    <template #icon>
      mdi-calendar-range
    </template>

    <template #title>
      AGM Extension Evaluation
    </template>

    <template #content>
      <v-card
        v-if="!data.isEligible"
        outlined
        class="message-box rounded-0 mt-6 mx-6"
      >
        <p>
          <strong>Evaluation Result:</strong> Based on the information provided above,
          an extension cannot be granted.
        </p>
      </v-card>

      <v-row
        no-gutters
        class="px-6 pt-7"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>AGM Year</strong>
        </v-col>
        <v-col
          cols="12"
          sm="9"
        >
          {{ data.agmYear }}
        </v-col>
      </v-row>

      <v-row
        no-gutters
        class="px-6 py-4"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Duration of Extension</strong>
        </v-col>
        <v-col
          cols="12"
          sm="9"
        >
          <template v-if="!data.isEligible">
            <template v-if="data.alreadyExtended && !data.requestExpired">
              The business has reached maximum possible extension for this AGM.
            </template>
            <template v-else-if="!data.alreadyExtended && data.requestExpired">
              The business is outside of the time window to request an extension.
            </template>
            <template v-else-if="data.alreadyExtended && data.requestExpired">
              The AGM due date from the previous extension has passed.
            </template>
          </template>
          <template v-else>
            {{ data.extensionDuration }} months
          </template>
        </v-col>
      </v-row>

      <v-row
        no-gutters
        class="px-6 pb-7"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Due date for this AGM</strong>
        </v-col>
        <v-col
          cols="12"
          sm="9"
        >
          <template v-if="!data.isEligible">
            {{ dueDateString }}
          </template>
          <template v-else>
            {{ expDateString }}
          </template>
        </v-col>
      </v-row>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { VcardTemplate } from '@/components/common'
import { AgmExtEvalIF } from '@/interfaces'
import { DateUtilities } from '@/services'

@Component({
  components: {
    VcardTemplate
  }
})
export default class AgmExtensionEvaluation extends Vue {
  @Prop({ required: true }) readonly data!: AgmExtEvalIF

  get dueDateString (): string {
    const date = (DateUtilities.yyyyMmDdToDate(this.data.agmDueDate))
    const pacificDate = DateUtilities.dateToPacificDate(date, true)
    if (pacificDate) return `${pacificDate} at 11:59 pm Pacific time`
    return ''
  }
  get expDateString (): string {
    const date = (DateUtilities.yyyyMmDdToDate(this.data.prevExpiryDate))
    const pacificExpDate = DateUtilities.dateToPacificDate(date, true)
    if (pacificExpDate) return `${pacificExpDate} at 11:59 pm Pacific time`
    return ''
  }
}
</script>
