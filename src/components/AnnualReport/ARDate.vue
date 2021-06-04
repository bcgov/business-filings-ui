<template>
  <v-card flat class="ar-date-container" v-if="isBComp">
    <div class="timeline">
      <label>Annual Report Date</label>
      <span class="date ar-date">{{formatDateString(nextARDate)}}</span>
      <label>Filing Date</label>
      <span class="date file-date">Today ({{formatDateString(currentDate)}})</span>
    </div>
  </v-card>
</template>

<script lang="ts">
// Libraries
import { Component, Mixins } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'

// Mixins
import { DateMixin } from '@/mixins'

@Component({
  computed: {
    ...mapState(['nextARDate', 'currentDate']),
    ...mapGetters(['isBComp'])
  }
})
export default class ArDate extends Mixins(DateMixin) {
  readonly nextARDate!: string
  readonly currentDate!: string
  readonly isBComp!: boolean
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
