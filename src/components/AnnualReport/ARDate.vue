<template>
  <v-card
    v-if="isBaseCompany"
    flat
    class="ar-date-container"
  >
    <div class="timeline">
      <label>Annual Report Date</label>
      <span class="date ar-date">{{ formatYyyyMmDd(nextARDate) }}</span>
      <label>Filing Date</label>
      <span class="date file-date">Today ({{ formatYyyyMmDd(getCurrentDate) }})</span>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { DateMixin } from '@/mixins'
import { useBusinessStore, useRootStore } from '@/stores'

@Component({})
export default class ArDate extends Mixins(DateMixin) {
  // Getters
  @Getter(useBusinessStore) nextARDate!: string
  @Getter(useBusinessStore) isBaseCompany!: boolean
  @Getter(useRootStore) getCurrentDate!: string
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.ar-date-container {
  background: $BCgovInputBG;
  padding: 1.25rem;

  .timeline {
    display: flex;
    justify-content: space-between;

    label {
      font-weight: 700;
    }

    .date {
      margin-right: 4.5rem;
    }
  }
}
</style>
