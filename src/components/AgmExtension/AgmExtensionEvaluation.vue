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
        v-if="evaluateResult && !data.isEligible"
        outlined
        class="message-box rounded-0 mt-6 mx-6"
      >
        <p>
          <strong>Evaluation Result:</strong> Based on the information provided above,
          an extension cannot be granted.
        </p>
      </v-card>
      <div
        v-else-if="!evaluateResult"
        style="overflow: auto;"
      >
        <v-card
          outlined
          class="message-box rounded-0 my-6 mx-6"
        >
          <p>
            Fill out the extension request details above to display.
          </p>
        </v-card>
      </div>

      <template v-if="evaluateResult">
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
            <template v-else-if="!!data.extensionDuration">
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
            <template v-if="data.isEligible">
              {{ formattedDate(data.agmDueDate) }}
            </template>
            <template v-else>
              {{ formattedDate(data.prevExpiryDate) }}
            </template>
          </v-col>
        </v-row>
      </template>
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
  @Prop({ default: false }) readonly evaluateResult!: boolean

  formattedDate (val: string): string {
    const date = (DateUtilities.yyyyMmDdToDate(val))
    const pacificDate = DateUtilities.dateToPacificDate(date, true)
    if (pacificDate) return pacificDate
    return ''
  }
}
</script>
