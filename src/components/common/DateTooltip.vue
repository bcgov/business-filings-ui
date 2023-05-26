<template>
  <v-tooltip transition="fade-transition" right>
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on" class="date-tooltip d-inline cursor-default">
        <span class="dotted-underline">{{dateString}}</span>
      </div>
    </template>
    {{dateTimeString}}
  </v-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DateUtilities } from '@/services'

@Component({})
export default class DateTooltip extends Vue {
  @Prop({ default: null }) readonly date!: Date

  get dateString (): string {
    return (DateUtilities.dateToPacificDate(this.date) || '[unknown]')
  }

  get dateTimeString (): string {
    return (DateUtilities.dateToPacificDateTime(this.date) || '[unknown]')
  }
}
</script>
