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
          v-if="!data.isEligible"
          cols="12"
          sm="9"
        >
          {{ extensionDurationText }}
        </v-col>
        <v-col
          v-else
          cols="12"
          sm="9"
        >
          {{ data.extensionDuration }} months
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
          v-if="!data.isEligible"
          cols="12"
          sm="9"
        >
          {{ dueDateText }}
        </v-col>
        <v-col
          v-else
          cols="12"
          sm="9"
        >
          {{ dueDateString }}
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

  @Prop({ default: '' }) readonly extensionDurationText!: string

  @Prop({ default: '' }) readonly dueDateText!: string

  get dueDateString (): string {
    return (DateUtilities.formatYyyyMmDd(this.data.agmDueDate))
  }
}
</script>
