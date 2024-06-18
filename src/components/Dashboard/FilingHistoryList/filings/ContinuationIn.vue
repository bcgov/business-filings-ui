<template>
  <FilingTemplate
    class="continuation-in"
    :filing="filing"
    :index="index"
  >
    <template #subtitle>
      <FiledAndPendingPaid
        v-if="isFutureEffectivePending"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />

      <FutureEffectivePaid
        v-else-if="isFutureEffective"
        class="item-header-subtitle"
        :filing="filing"
        :index="index"
      />
    </template>

    <template #body>
      <FutureEffectivePending
        v-if="isFutureEffectivePending"
        :filing="filing"
      />

      <FutureEffective
        v-else-if="isFutureEffective"
        :filing="filing"
      />

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
import { Getter } from 'pinia-class'
import { ApiFilingIF } from '@/interfaces'
import { DateUtilities, EnumUtilities } from '@/services'
import FiledAndPendingPaid from '../subtitles/FiledAndPendingPaid.vue'
import FilingTemplate from '../FilingTemplate.vue'
import FutureEffective from '../bodies/FutureEffective.vue'
import FutureEffectivePaid from '../subtitles/FutureEffectivePaid.vue'
import FutureEffectivePending from '../bodies/FutureEffectivePending.vue'
import { useBusinessStore, useConfigurationStore } from '@/stores'

@Component({
  components: {
    FiledAndPendingPaid,
    FilingTemplate,
    FutureEffective,
    FutureEffectivePaid,
    FutureEffectivePending
  }
})
export default class ContinuationIn extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) getEntityName!: string
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getDashboardUrl!: string

  /** The Temporary Registration Number string (may be null). */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** Whether this filing is in Complete status. */
  get isStatusCompleted (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
  }

  /** Whether this filing is Future Effective Pending (overdue). */
  get isFutureEffectivePending (): boolean {
    return (
      EnumUtilities.isStatusPaid(this.filing) &&
      this.filing.isFutureEffective &&
      DateUtilities.isDatePast(this.filing.effectiveDate)
    )
  }

  /** Whether this filing is Future Effective (not yet completed). */
  get isFutureEffective (): boolean {
    return (
      EnumUtilities.isStatusPaid(this.filing) &&
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
</style>
