<template>
  <v-card flat class="ar-date-container" v-if="isBenBcCccUlc">
    <div class="timeline">
      <label>Annual Report Date</label>
      <span class="date ar-date">{{formatYyyyMmDd(nextARDate)}}</span>
      <label>Filing Date</label>
      <span class="date file-date">Today ({{formatYyyyMmDd(getCurrentDate)}})</span>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'

@Component({
  mixins: [DateMixin]
})
export default class ArDate extends Vue {
  @State nextARDate!: string
  @Getter isBenBcCccUlc!: boolean
  @Getter getCurrentDate!: string
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
