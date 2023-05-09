<template>
  <header id="entity-header">
    <template v-if="!!businessId">
      <!-- Title -->
      <div id="entity-legal-name" aria-label="Entity Legal Name">
        {{ getEntityName || 'Unknown Name' }}
      </div>

      <!-- Subtitle -->
      <div>
        <span id="business-description">{{ businessDescription }}</span>

        <span id="limited-restoration" class="ml-3" v-if="isInLimitedRestoration">
          <span class="ml-3">Active until {{ getLimitedRestorationActiveUntil || 'Unknown' }}</span>
          <v-chip class="primary mt-n1 ml-3 pointer-events-none font-weight-bold"
            small label text-color="white">LIMITED RESTORATION</v-chip>
        </span>

        <span id="authorized-to-continue-out" v-if="isCcoExpired">
          <v-chip class="primary mt-n1 ml-3 pointer-events-none font-weight-bold"
            small label text-color="white">AUTHORIZED TO CONTINUE OUT</v-chip>
        </span>
      </div>
    </template>

    <template v-if="!!tempRegNumber">
      <!-- Title -->
      <div id="ia-reg-name" aria-label="Incorporation Application or Registration Entity Name">
        {{ getEntityName || 'Unknown Name' }}
      </div>

      <!-- Subtitle -->
      <div id="ia-reg-description" aria-label="Incorporation Application or Registration Description">
        {{ iaRegDescription }}
      </div>
    </template>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import { FilingNames } from '@/enums'

@Component({})
export default class EntityHeader extends Vue {
  @Prop({ required: true }) readonly businessId!: string // may be null
  @Prop({ required: true }) readonly tempRegNumber!: string // may be null

  @Getter getEntityName!: string
  @Getter getLegalType!: CorpTypeCd
  @Getter getLimitedRestorationActiveUntil!: string
  @Getter isAuthorizedToContinueOut!: boolean
  @Getter isInLimitedRestoration!: boolean
  @Getter isSoleProp!: boolean
  @Getter isCcoExpired!: boolean

  /** The business description. */
  get businessDescription (): string {
    const corpFullDescription = GetCorpFullDescription(this.getLegalType)
    if (this.isSoleProp && !!this.tempRegNumber) {
      return `${corpFullDescription} / Doing Business As (DBA)`
    } else {
      return corpFullDescription
    }
  }

  /** The incorporation application or registration description. */
  get iaRegDescription (): string {
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
#ia-reg-name {
  display: inline-block;
  color: $gray9;
  letter-spacing: -0.01rem;
  font-size: 1.375rem;
  font-weight: 700;
  text-transform: uppercase;
}

#business-description,
#limited-restoration,
#ia-reg-description {
  font-size: $px-14;
  color: $gray7;
}

// vertical lines between items:
#limited-restoration {
  border-left: 1px solid $gray3;
}
</style>
