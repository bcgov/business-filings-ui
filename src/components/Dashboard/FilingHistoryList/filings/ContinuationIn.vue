<template>
  <FilingTemplate
    class="continuation-in"
    :filing="filing"
    :index="index"
  >
    <template #subtitle>
      <SubtitleFiledAndPendingPaid
        v-if="isFutureEffectivePending"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />

      <SubtitleFutureEffectivePaid
        v-else-if="isFutureEffective"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />

      <SubtitleRejected
        v-else-if="isStatusRejected"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />
    </template>

    <template #body>
      <BodyFutureEffectivePending
        v-if="isFutureEffectivePending"
        :filing="filing"
      />

      <BodyFutureEffective
        v-else-if="isFutureEffective"
        :filing="filing"
      />

      <!-- rejected bootstrap filing -->
      <div
        v-else-if="isStatusRejected"
        class="rejected-continuation-in-details"
      >
        <p class="mt-0">
          This {{ filing.displayName }} is rejected for the following reasons:
        </p>
        <textarea
          v-if="isShowTextarea"
          v-auto-resize
          class="grey-background px-5 py-3"
          readonly
          rows="1"
          :value="filing.latestReviewComment || '[undefined staff change request message]'"
        />

        <p>
          You will receive a refund within 10 business days. Please submit a new application if you would
          like to continue your business into B.C.
        </p>
      </div>

      <!-- completed bootstrap filing -->
      <div
        v-else-if="!!tempRegNumber && isStatusCompleted"
        class="completed-continuation-in-details"
      >
        <h4>Incorporation Complete</h4>

        <p>
          {{ companyName }} has been successfully continued in.
        </p>

        <p>
          The system has completed processing your filing. You can now retrieve the business information.
        </p>

        <div class="reload-business-container text-center mt-6">
          <v-btn
            color="primary"
            @click.stop="reloadWithBusinessId()"
          >
            <span>Retrieve Business Information</span>
          </v-btn>
        </div>
      </div>
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import SubtitleFiledAndPendingPaid from '../subtitles/SubtitleFiledAndPendingPaid.vue'
import FilingTemplate from '../FilingTemplate.vue'
import BodyFutureEffective from '../bodies/BodyFutureEffective.vue'
import SubtitleFutureEffectivePaid from '../subtitles/SubtitleFutureEffectivePaid.vue'
import BodyFutureEffectivePending from '../bodies/BodyFutureEffectivePending.vue'
import { useBusinessStore, useConfigurationStore, useFilingHistoryListStore } from '@/stores'
import SubtitleRejected from '../subtitles/SubtitleRejected.vue'
import AutoResize from 'vue-auto-resize'

@Component({
  components: {
    BodyFutureEffective,
    BodyFutureEffectivePending,
    FilingTemplate,
    SubtitleFiledAndPendingPaid,
    SubtitleFutureEffectivePaid,
    SubtitleRejected
  },
  directives: {
    AutoResize
  }
})
export default class ContinuationIn extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) getEntityName!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getDashboardUrl!: string

  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: (x: number) => Promise<void>

  // local variable(s)
  isShowTextarea = false

  /** The Temporary Registration Number string (may be null). */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** Whether this filing is in Rejected status. */
  get isStatusRejected (): boolean {
    return EnumUtilities.isStatusRejected(this.filing)
  }

  /** Whether this filing is in Complete status. */
  get isStatusCompleted (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
  }

  /** Whether this filing is Future Effective Pending (overdue). */
  get isFutureEffectivePending (): boolean {
    return (
      (
        EnumUtilities.isStatusApproved(this.filing) ||
        EnumUtilities.isStatusPaid(this.filing)
      ) &&
      this.filing.isFutureEffective &&
      DateUtilities.isDatePast(this.filing.effectiveDate)
    )
  }

  /** Whether this filing is Future Effective (not yet completed). */
  get isFutureEffective (): boolean {
    return (
      (
        EnumUtilities.isStatusApproved(this.filing) ||
        EnumUtilities.isStatusPaid(this.filing)
      ) &&
      this.filing.isFutureEffective &&
      DateUtilities.isDateFuture(this.filing.effectiveDate)
    )
  }

  /** The legal name or numbered description of the new company. */
  get companyName (): string {
    if (this.getLegalName) return this.getLegalName
    if (this.getEntityName) return `A ${this.getEntityName}`
    return 'Unknown Name'
  }

  async mounted (): Promise<void> {
    if (this.tempRegNumber) {
      // auto-expand bootstrap filing
      // assumes this the only filing in the Filing History list (which it should be)
      await this.toggleFilingHistoryItem(0)
    }

    // work-around because textarea sometimes doesn't initially auto-resize
    this.isShowTextarea = true
  }

  /** Reloads Filings UI using business id instead of temporary registration number. */
  reloadWithBusinessId (): void {
    // build the URL to the business dashboard with the business id and any URL parameters
    const url = this.getDashboardUrl + this.filing.businessIdentifier + this.$route.fullPath
    window.location.assign(url)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.item-header-subtitle {
  color: $gray7;
  margin-top: 0.5rem;
}

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}

textarea {
  color: $gray7;
  width: 100%;
  resize: none;
  // FUTURE: use field-sizing instead of "v-auto-resize" directive
  // ref: https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
  // field-sizing: content;
}

.grey-background {
  background-color: $gray1;
}
</style>
