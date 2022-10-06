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

<script setup lang="ts">
import { DateComposable } from '@/composables'

// Composables
const { dateToPacificDate, dateToPacificDateTime } = DateComposable()

const prop = defineProps({ date: { type: Date, default: null } })

const dateString = computed(() => dateToPacificDate(props.date) || 'Unknown')
const dateTimeString = computed(() => dateToPacificDateTime(props.date) || 'Unknown')
</script>
