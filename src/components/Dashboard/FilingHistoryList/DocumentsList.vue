<template>
  <div class="documents-list">
    <v-list class="py-0">
      <v-list-item v-for="(document, index) in filing.documents" :key="index">
        <v-btn text color="primary"
          class="download-one-btn"
          @click="downloadOne(document, index)"
          :disabled="isLoadingOne || isLoadingAll"
          :loading="isLoadingOne && (index === getLoadingOneIndex)"
        >
          <v-icon>mdi-file-pdf-outline</v-icon>
          <span>{{document.title}}</span>
        </v-btn>
      </v-list-item>

      <v-list-item v-if="filing.documents.length > 1">
        <v-btn text color="primary"
          class="download-all-btn"
          @click="downloadAll(filing)"
          :disabled="isLoadingOne || isLoadingAll"
          :loading="isLoadingAll"
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { ApiFilingIF, DocumentIF } from '@/interfaces'
import { LegalServices } from '@/services'
import { useFilingHistoryListStore } from '@/stores'

@Component({})
export default class DocumentsList extends Vue {
  /** The filing containing documents. */
  @Prop({ required: true }) readonly filing!: ApiFilingIF

  @Getter(useFilingHistoryListStore) getLoadingOneIndex!: number
  @Getter(useFilingHistoryListStore) isLoadingAll!: boolean
  @Getter(useFilingHistoryListStore) isLoadingOne!: boolean

  @Action(useFilingHistoryListStore) setDownloadErrorDialog!: (x: boolean) => void
  @Action(useFilingHistoryListStore) setLoadingAll!: (x: boolean) => void
  @Action(useFilingHistoryListStore) setLoadingOne!: (x: boolean) => void
  @Action(useFilingHistoryListStore) setLoadingOneIndex!: (x: number) => void

  async downloadOne (document: DocumentIF, index: number): Promise<void> {
    if (document && index >= 0) { // safety check
      this.setLoadingOne(true)
      this.setLoadingOneIndex(index)

      await LegalServices.fetchDocument(document).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchDocument() error =', error)
        this.setDownloadErrorDialog(true)
      })

      this.setLoadingOne(false)
      this.setLoadingOneIndex(-1)
    }
  }

  async downloadAll (filing: ApiFilingIF): Promise<void> {
    if (filing?.documents) { // safety check
      this.setLoadingAll(true)

      for (const document of filing.documents) {
        await LegalServices.fetchDocument(document).catch(error => {
          // eslint-disable-next-line no-console
          console.log('fetchDocument() error =', error)
          this.setDownloadErrorDialog(true)
        })
      }

      this.setLoadingAll(false)
    }
  }
}
</script>

<style lang="scss" scoped>
.v-list-item {
  padding-left: 0;
  min-height: 1.5rem;
}
</style>
