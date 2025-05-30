<template>
  <div
    id="entity-info"
  >
    <v-container class="py-0">
      <v-row
        no-gutters
        class="py-7"
      >
        <v-col
          class="flex-column d-flex justify-space-between"
          cols="12"
          md="9"
        >
          <EntityHeader
            :businessId="businessId"
            :tempRegNumber="tempRegNumber"
          />
          <EntityMenu
            v-if="!(isInLocalFilingPage || isDCRoute)"
            class="mt-2 ml-n3"
            :businessId="businessId"
            @confirmDissolution="emitConfirmDissolution()"
            @downloadBusinessSummary="emitDownloadBusinessSummary()"
            @notInGoodStanding="emitNotInGoodStanding($event)"
            @viewAddDigitalCredentials="emitViewAddDigitalCredentials()"
          />
        </v-col>

        <v-col
          cols="12"
          md="3"
        >
          <EntityDefinitions
            :businessId="businessId"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator'
import { NigsMessage, AuthorizedActions } from '@/enums'
import EntityDefinitions from './EntityInfo/EntityDefinitions.vue'
import EntityHeader from './EntityInfo/EntityHeader.vue'
import EntityMenu from './EntityInfo/EntityMenu.vue'
import { Routes, DCRoutes } from '@/enums/routes'
import { IsAuthorized } from '@/utils/authorizations'

@Component({
  components: {
    EntityDefinitions,
    EntityHeader,
    EntityMenu
  }
})
export default class EntityInfo extends Vue {
  /** Whether to show the hover style. */
  showHoverStyle = false
  accessEntityMenu = IsAuthorized(AuthorizedActions.ADMIN_DISSOLUTION_FILING) &&
    IsAuthorized(AuthorizedActions.OVERRIDE_NIGS)
  /** The Business ID string (may be null). */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** Is True if this is on local filing pages. */
  get isInLocalFilingPage (): boolean {
    return (
      this.$route?.name === Routes.AGM_EXTENSION ||
      this.$route?.name === Routes.AGM_LOCATION_CHANGE ||
      this.$route?.name === Routes.AMALGAMATION_OUT ||
      this.$route?.name === Routes.ANNUAL_REPORT ||
      this.$route?.name === Routes.CONSENT_AMALGAMATION_OUT ||
      this.$route?.name === Routes.CONSENT_CONTINUATION_OUT ||
      this.$route?.name === Routes.COURT_ORDER ||
      this.$route?.name === Routes.CONTINUATION_OUT ||
      this.$route?.name === Routes.NOTICE_OF_WITHDRAWAL ||
      this.$route?.name === Routes.STANDALONE_ADDRESSES ||
      this.$route?.name === Routes.STANDALONE_DIRECTORS
    )
  }

  get isDCRoute (): boolean {
    return this.$route.matched.some(route => route.path.includes(DCRoutes.DIGITAL_CREDENTIALS))
  }

  /** The Temporary Registration Number string (may be null). */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** Emits an event to confirm dissolution. */
  @Emit('confirmDissolution')
  emitConfirmDissolution (): void {}

  /** Emits an event to download the business summary. */
  @Emit('downloadBusinessSummary')
  emitDownloadBusinessSummary (): void {}

  /** Emits an event to indicate business is not in good standing. */
  @Emit('notInGoodStanding')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitNotInGoodStanding (message: NigsMessage): void {}

  /** Emits an event to view / add digital credentials. */
  @Emit('viewAddDigitalCredentials')
  emitViewAddDigitalCredentials (): void {}
}

</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#entity-info {
  background: $BCgovInputBG;

  &.hover {
    background: $app-bg-lt-blue;
  }

  .v-chip--label {
    font-size: $px-11;
  }

}

// vertical lines between items:
menu > span + span {
  border-left: 1px solid $gray3;
}

// Disable btn and tooltip overrides
:deep(.v-btn.v-btn--disabled, .v-btn.v-btn--disabled .v-icon) {
  opacity: 0.4 !important;
  color: $app-blue !important;
}

:deep(.v-chip__content) {
  letter-spacing: 0.5px;
}
</style>
