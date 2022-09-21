<template>
  <div class="documents-list">
    <v-list class="py-0">
      <v-list-item v-for="(document, index) in filing.documents" :key="index">
        <v-btn text color="primary"
          class="download-one-btn"
          @click="downloadOne(document, index)"
          :disabled="loadingOne || loadingAll"
          :loading="loadingOne && (index === loadingOneIndex)"
        >
          <v-icon>mdi-file-pdf-outline</v-icon>
          <span>{{document.title}}</span>
        </v-btn>
      </v-list-item>

      <v-list-item v-if="filing.documents.length > 1">
        <v-btn text color="primary"
          class="download-all-btn"
          @click="downloadAll(filing)"
          :disabled="loadingOne || loadingAll"
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
import { DocumentIF } from '@/interfaces'

@Component({})
export default class DocumentsList extends Vue {
  /** The filing containing documents. */
  @Prop({ required: true }) readonly filing!: any

  /** Whether one document is currently loading. */
  @Prop({ default: false }) readonly loadingOne!: boolean

  /** Whether all documents are currently loading. */
  @Prop({ default: false }) readonly loadingAll!: boolean

  /** The index of the currently-downloading doc. */
  @Prop({ default: -1 }) readonly loadingOneIndex!: boolean

  /** Emits an event to download the subject document. */
  @Emit('downloadOne')
  protected downloadOne (document: DocumentIF, index: number): void {}

  /** Emits an event to download all. */
  @Emit('downloadAll')
  protected downloadAll (filing: any): void {}
}
</script>

<style lang="scss" scoped>
.v-list-item {
  padding-left: 0;
  min-height: 1.5rem;
}
</style>
