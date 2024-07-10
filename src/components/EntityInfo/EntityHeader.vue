<template>
  <header id="entity-header">
    <template v-if="!!businessId">
      <!-- Title -->
      <div
        id="entity-legal-name"
        aria-label="Entity Legal Name"
      >
        {{ getEntityName || 'Unknown Name' }}
      </div>

      <!-- Subtitle -->
      <div>
        <span id="business-description">{{ businessDescription }}</span>
        <span
          v-if="isInLimitedRestoration"
          id="active-util"
          class="ml-3 pl-3"
        >
          Active until {{ getLimitedRestorationActiveUntil || 'Unknown' }}
        </span>
      </div>

      <div
        v-if="isHistorical"
        id="historical"
        class="mt-2"
      >
        <v-chip
          id="historical-chip"
          class="primary mt-n1 pointer-events-none"
          small
          label
          text-color="white"
        >
          HISTORICAL
        </v-chip>
        <span class="font-14 mx-3">{{ getReasonText || 'Unknown Reason' }}</span>
      </div>
      <div
        v-else
        id="multiple-badges"
        class="mt-2"
      >
        <span
          v-if="isInLimitedRestoration"
          id="limited-restoration"
        >
          <v-chip
            class="primary mt-n1 pointer-events-none"
            small
            label
            text-color="white"
          >LIMITED RESTORATION</v-chip>
        </span>

        <span
          v-if="isAuthorizedToContinueOut"
          id="authorized-to-continue-out"
        >
          <v-chip
            class="primary mt-n1 pointer-events-none"
            :class="{ 'ml-3': isInLimitedRestoration }"
            small
            label
            text-color="white"
          >AUTHORIZED TO CONTINUE OUT</v-chip>
        </span>
      </div>
    </template>

    <template v-if="!!tempRegNumber">
      <!-- Title -->
      <div
        id="app-name"
        aria-label="Application Name or Future Entity Name"
      >
        {{ getEntityName || 'Unknown Name' }}
      </div>

      <!-- Subtitle -->
      <div
        id="app-description"
        aria-label="Amalgamation, Continuation Application, Incorporation or Registration Description"
      >
        {{ appDescription }}
      </div>
    </template>
  </header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import { FilingNames } from '@bcrs-shared-components/enums'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'
import { ApiFilingIF, ApiTaskIF } from '@/interfaces'

@Component({})
export default class EntityHeader extends Vue {
  @Prop({ required: true }) readonly businessId!: string // may be null
  @Prop({ required: true }) readonly tempRegNumber!: string // may be null

  @Getter(useBusinessStore) getEntityName!: string
  @Getter(useBusinessStore) getLegalType!: CorpTypeCd
  @Getter(useBusinessStore) isEntitySoleProp!: boolean
  @Getter(useBusinessStore) isHistorical!: boolean

  @Getter(useFilingHistoryListStore) getFilings!: ApiFilingIF[]
  @Getter(useFilingHistoryListStore) isAuthorizedToContinueOut!: boolean

  @Getter(useRootStore) getLimitedRestorationActiveUntil!: string
  @Getter(useRootStore) getReasonText!: string
  @Getter(useRootStore) getTasks!: ApiTaskIF[]
  @Getter(useRootStore) isDraftAmalgamation!: boolean
  @Getter(useRootStore) isDraftContinuationIn!: boolean
  @Getter(useRootStore) isFiledAmalgamation!: boolean
  @Getter(useRootStore) isFiledContinuationIn!: boolean
  @Getter(useRootStore) isInLimitedRestoration!: boolean

  /** The business description. */
  get businessDescription (): string {
    const corpFullDescription = GetCorpFullDescription(this.getLegalType)
    if (this.isEntitySoleProp && !!this.tempRegNumber) {
      return `${corpFullDescription} / Doing Business As (DBA)`
    } else {
      return corpFullDescription
    }
  }

  /** The incorporation/registration/continuationIn/amalgamation application description. */
  get appDescription (): string {
    if (this.isDraftAmalgamation) {
      return this.getTasks[0]?.task.filing.displayName
    }
    if (this.isFiledAmalgamation) {
      return this.getFilings[0]?.displayName
    }

    if (this.isDraftContinuationIn) {
      return this.getTasks[0]?.task.filing.displayName
    }
    if (this.isFiledContinuationIn) {
      return this.getFilings[0]?.displayName
    }

    const filingName = [CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP].includes(this.getLegalType)
      ? FilingNames.REGISTRATION
      : FilingNames.INCORPORATION_APPLICATION

    return `${this.businessDescription} ${filingName}`
  }
}
</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#entity-legal-name,
#app-name {
  display: inline-block;
  color: $gray9;
  letter-spacing: -0.01rem;
  font-size: 1.375rem;
  font-weight: 700;
  text-transform: uppercase;
}

#business-description,
#limited-restoration,
#active-util,
#app-description {
  font-size: $px-14;
  color: $gray7;
}

// vertical lines between items:
#active-util {
  border-left: 1px solid $gray3;
}

// Style for badges
:deep(.v-chip.v-size--small) {
  height: 19px;
  font-size: $px-10;
}
</style>
