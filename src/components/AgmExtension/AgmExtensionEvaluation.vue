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
          {{ data.agmYear || '' }}
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
          {{ data.extensionDuration || 'Unknown' }}
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
          {{ data.agmDueDate || 'Unknown' }}
        </v-col>
      </v-row>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { VcardTemplate } from '@/components/common'
import { AgmExtEvalIF } from '@/interfaces'

@Component({
  components: {
    VcardTemplate
  }
})
export default class AgmExtensionEvaluation extends Vue {
  @Prop({ required: true }) readonly data!: AgmExtEvalIF
}
</script>
