<template>
  <div v-if="filing" class="staff-filing-details body-2">
    <p>{{filing.notationOrOrder}}</p>

    <template v-if="filing.documents && filing.documents.length > 0">
      <DocumentsList
        :filing=filing
        :loadingOne=loadingOne
        :loadingAll=loadingAll
        :loadingOneIndex=loadingOneIndex
        @downloadOne="downloadOne(...arguments)"
        @downloadAll="downloadAll($event)"
      />
   </template>

    <p class="mb-0" v-if="filing.fileNumber">Court Order Number: {{filing.fileNumber}}</p>

    <p class="mt-0" v-if="filing.planOfArrangement">{{filing.planOfArrangement}}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { HistoryItemIF } from '@/interfaces'
import { Getter } from 'vuex-class'
import DocumentsList from '@/components/Dashboard/FilingHistoryList/DocumentsList.vue'

@Component({
  components: {
    DocumentsList
  }
})
export default class StaffFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  @Prop({ default: false }) readonly loadingOne!: boolean

  @Prop({ default: false }) readonly loadingAll!: boolean

  @Prop({ default: -1 }) readonly loadingOneIndex!: number

  @Getter isRoleStaff!: boolean

  @Emit('downloadOne')
  protected downloadOne (document: DocumentIF, index: number): void {}

  @Emit('downloadAll')
  protected downloadAll (item: HistoryItemIF) : void {}
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
