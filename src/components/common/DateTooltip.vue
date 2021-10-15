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
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { DateMixin } from '@/mixins'

@Component({})
export default class DateTooltip extends Mixins(DateMixin) {
  @Prop({ default: null })
  readonly date: Date

  get dateString (): string {
    return (this.dateToPacificDate(this.date) || 'Unknown')
  }

  get dateTimeString (): string {
    return (this.dateToPacificDateTime(this.date) || 'Unknown')
  }
}
</script>
