<template>
  <div v-if="filing" class="staff-filing-details body-2">
    <p class="info-text">{{filing.notationOrOrder}}</p>
    <p class="info-text my-0" v-if="filing.fileNumber">Court Order Number: {{filing.fileNumber}}</p>
    <p class="info-text my-0" v-if="filing.planOfArrangement">{{filing.planOfArrangement}}</p>
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
  margin-bottom: 0.5rem !important;
}
</style>
