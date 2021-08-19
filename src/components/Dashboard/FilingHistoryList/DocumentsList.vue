<template>
  <div class="document-list">
    <v-list class="py-0">
      <v-list-item v-for="(document, index) in filing.documents" :key="index">
        <v-btn v-if="document.type === DocumentTypes.REPORT"
          text color="primary"
          class="download-document-btn"
          @click="downloadDocument(document, index)"
          :disabled="loadingDocument || loadingReceipt || loadingAll"
          :loading="loadingDocument && (index === downloadingDocIndex)"
        >
          <v-icon>mdi-file-pdf-outline</v-icon>
          <span>{{document.title}}</span>
        </v-btn>

        <v-btn v-if="document.type === DocumentTypes.RECEIPT"
          text color="primary"
          class="download-receipt-btn"
          @click="downloadReceipt(document)"
          :disabled="loadingReceipt || loadingDocument || loadingAll"
          :loading="loadingReceipt"
        >
          <v-icon>mdi-file-pdf-outline</v-icon>
          <span>{{document.title}}</span>
        </v-btn>
      </v-list-item>

      <v-list-item v-if="filing.documents.length > 1">
        <v-btn text color="primary"
          class="download-all-btn"
          @click="downloadAll(filing)"
          :disabled="loadingAll || loadingDocument || loadingReceipt"
          :loading="loadingAll"
        >
          <v-icon>mdi-download</v-icon>
          <span>Download All</span>
        </v-btn>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { DocumentTypes } from '@/enums'

@Component({})
export default class DocumentsList extends Vue {
  /** The filing containing documents. */
  @Prop({ required: true }) readonly filing: any

  /** Whether a document is currently loading. */
  @Prop({ default: false }) readonly loadingDocument: boolean

  /** Whether a receipt is currently loading. */
  @Prop({ default: false }) readonly loadingReceipt: boolean

  /** Whether all are currently loading. */
  @Prop({ default: false }) readonly loadingAll: boolean

  /** The index of the currently-downloading doc. */
  @Prop({ default: -1 }) readonly downloadingDocIndex: boolean

  /** Emits an event to download the subject document. */
  @Emit('downloadDocument')
  private downloadDocument (document: any, index: number): void { }

  /** Emits an event to download the receipt. */
  @Emit('downloadReceipt')
  private downloadReceipt (document: any): void { }

  /** Emits an event to download all. */
  @Emit('downloadAll')
  private downloadAll (filing: any): void { }

  // enum for template
  readonly DocumentTypes = DocumentTypes
}
</script>

<style lang="scss" scoped>
.v-list-item {
  padding-left: 0;
  min-height: 1.5rem;
}
</style>
