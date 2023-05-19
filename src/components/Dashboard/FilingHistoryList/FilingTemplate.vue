<template>
  <v-expansion-panel class="filing-template">
    <v-expansion-panel-header>
      <div class="item-header d-flex justify-space-between">
        <div>
          <h3 class="item-header-title">
            <slot name="title">
              <span>{{filing.displayName}}</span>
            </slot>
          </h3>

          <slot name="subtitle">
            <FiledAndPendingPaid v-if="isStatusPaid"
              class="item-header-subtitle"
              :filing="filing"
              :index="index"
            />
            <FiledAndPaid v-else
              class="item-header-subtitle"
              :filing="filing"
              :index="index"
            />
          </slot>

          <slot name="details-button">
            <v-btn
              v-if="filing.commentsCount > 0"
              class="comments-btn mt-1"
              outlined
              color="primary"
              :ripple=false
              @click.stop="toggleFilingHistoryItem(index, filing)"
            >
              <v-icon small style="padding-top: 2px">mdi-message-reply</v-icon>
              <span>Detail{{filing.commentsCount > 1 ? "s" : ""}} ({{filing.commentsCount}})</span>
            </v-btn>
          </slot>
        </div>

        <slot name="actions">
          <HeaderActions
            :filing="filing"
            :index="index"
          />
        </slot>
      </div>
    </v-expansion-panel-header>

    <v-expansion-panel-content>
      <slot name="body">
        <!-- is this a generic paid (not yet completed) filing? -->
        <div v-if="isStatusPaid" class="body-2">
          <h4 class="mt-4">Filing Pending</h4>

          <p class="mt-4">
            This {{ title }} is paid, but the filing has not been completed by the Business Registry
            yet. Some filings may take longer than expected.
          </p>

          <p v-if="fileNumber" class="mt-4">
            Court Order Number: {{ fileNumber }}
          </p>

          <p v-if="hasEffectOfOrder" class="mt-4">
            Pursuant to a Plan of Arrangement
          </p>

          <p class="mt-4">
            Refresh this screen in a few minutes or you can come back later to check on the progress.
            If this issue persists, please contact us.
          </p>

          <ContactInfo class="mt-4" />
        </div>
      </slot>

      <slot name="documents">
        <!-- if we have documents, show them -->
        <!-- NB: staff filings don't have documents - see StaffFiling.vue for any exceptions -->
        <template v-if="!isTypeStaff && filing.documents && filing.documents.length > 0">
          <v-divider class="my-6" />
          <DocumentsList :filing=filing />
        </template>
      </slot>

      <slot name="detail-comments">
        <!-- if we have detail comments, show them -->
        <div v-if="filing.comments && filing.commentsCount > 0" class="mb-n2">
          <v-divider class="my-6" />
          <DetailsList :filing=filing />
        </div>
      </slot>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'pinia-class'
import { ActionBindingIF, ApiFilingIF } from '@/interfaces'
import { EnumUtilities } from '@/services'
import { FilingNames } from '@/enums'
import { ContactInfo } from '@/components/common'
import DetailsList from './DetailsList.vue'
import DocumentsList from './DocumentsList.vue'
import FiledAndPaid from './subtitles/FiledAndPaid.vue'
import FiledAndPendingPaid from './subtitles/FiledAndPendingPaid.vue'
import HeaderActions from './HeaderActions.vue'
import { useFilingHistoryListStore } from '@/stores'

@Component({
  components: {
    ContactInfo,
    DetailsList,
    DocumentsList,
    FiledAndPaid,
    FiledAndPendingPaid,
    HeaderActions
  }
})
export default class FilingTemplate extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: ActionBindingIF

  /** Whether this filing is in Paid status. */
  get isStatusPaid (): boolean {
    return EnumUtilities.isStatusPaid(this.filing)
  }

  /** The title of this filing. */
  get title (): string {
    if (EnumUtilities.isTypeAlteration(this.filing)) return FilingNames.ALTERATION
    if (this.filing.displayName) return this.filing.displayName
    return 'Filing'
  }

  /** The court order file number. */
  get fileNumber (): string {
    return this.filing.data?.order?.fileNumber
  }

  /** Whether the court order has an effect of order. */
  get hasEffectOfOrder (): boolean {
    return Boolean(this.filing.data?.order?.effectOfOrder)
  }

  /** Whether this is a staff filing. */
  get isTypeStaff (): boolean {
    return EnumUtilities.isTypeStaff(this.filing)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.v-expansion-panel {
  padding: 1.25rem 1.5rem;
  pointer-events: none; // disable expansion generally
}

.item-header {
  line-height: 1.25rem;
}

.item-header-title {
  font-weight: bold;
}

.item-header-subtitle {
  color: $gray6;
  margin-top: 0.5rem;
}

.comments-btn {
  border: none;
}

p {
  color: $gray7;
  font-size: $px-15;
  margin-bottom: 0 !important;
}
</style>
