<template>
  <div v-if="filing" class="staff-filing-details body-2">
    <p v-if="filing.details" class="mt-4">{{filing.details}}</p>

    <!-- Documents list may be displayed here or in Filing History List. -->
    <DocumentsList
      v-if="showDocumentsList && filing.documents && filing.documents.length > 0"
      :filing=filing
      @downloadOne="downloadOne(...arguments)"
      @downloadAll="downloadAll($event)"
    />

    <p v-if="filing.fileNumber" class="mt-4 mb-0">Court Order Number: {{filing.fileNumber}}</p>

    <p v-if="filing.planOfArrangement" class="mt-0">{{filing.planOfArrangement}}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { DocumentIF, HistoryItemIF } from '@/interfaces'
import DocumentsList from './DocumentsList.vue'

@Component({
  components: {
    DocumentsList
  }
})
export default class StaffFiling extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: HistoryItemIF

  @Prop({ default: false }) readonly showDocumentsList!: boolean

  @Emit('downloadOne')
  protected downloadOne (document: DocumentIF, index: number): void {}

  @Emit('downloadAll')
  protected downloadAll (item: HistoryItemIF) : void {}
}
</script>
