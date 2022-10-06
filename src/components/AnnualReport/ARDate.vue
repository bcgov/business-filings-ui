<template>
  <v-card flat class="ar-date-container" v-if="isBComp">
    <div class="timeline">
      <label>Annual Report Date</label>
      <span class="date ar-date">{{formatYyyyMmDd(nextARDate)}}</span>
      <label>Filing Date</label>
      <span class="date file-date">Today ({{formatYyyyMmDd(getCurrentDate)}})</span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { DateComposable, AllowableActionsComposable, FilingComposable } from '@/composables'

const { formatYyyyMmDd } = DateComposable()
const { isBComp } = AllowableActionsComposable() // probably can pull from state getters
const { getCurrentDate } = FilingComposable()
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
