<template>
  <VcardTemplate id="about-the-business">
    <template #icon>
      mdi-domain
    </template>

    <template #title>
      About the Business
    </template>

    <template #content>
      <v-row
        no-gutters
        class="px-6 py-7"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Business in Good Standing</strong>
        </v-col>
        <v-col
          id="entity-in-good-standing"
          cols="12"
          sm="9"
        >
          {{ data.isGoodStanding ? 'Yes' : 'No' }}
        </v-col>
      </v-row>

      <v-divider class="mx-4" />

      <v-row
        no-gutters
        class="px-6 py-7"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <strong>Date of Incorporation</strong>
        </v-col>
        <v-col
          id="entity-date-of-incorporation"
          cols="12"
          sm="9"
        >
          {{ DateUtilities.dateToPacificDate(data.incorporationDate, true) }}
        </v-col>
      </v-row>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { AgmExtEvalIF } from '@/interfaces'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DateUtilities } from '@/services'
import { VcardTemplate } from '@/components/common'

@Component({
  components: {
    VcardTemplate
  }
})
export default class AboutTheBusiness extends Vue {
  readonly DateUtilities = DateUtilities

  @Prop({ required: true }) readonly data!: AgmExtEvalIF
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.col-12 {
  font-size: $px-16;
}
</style>
