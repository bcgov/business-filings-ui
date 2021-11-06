<template>
  <div v-if="filing" class="staff-filing-details body-2">
    <p>{{filing.notationOrOrder}}</p>

    <p class="mb-0" v-if="filing.fileNumber">Court Order Number: {{filing.fileNumber}}</p>

    <p class="mt-0" v-if="filing.planOfArrangement">{{filing.planOfArrangement}}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { HistoryItemIF } from '@/interfaces'

@Component({})
export default class StaffFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true })
  readonly filing: HistoryItemIF
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
