<template>
  <div id="entity-info" :class=" { 'staff': isRoleStaff, 'hover': showHoverStyle }">
    <v-container class="pt-0 pb-0">
      <v-row no-gutters class="pt-3 pb-4">
        <v-col class="flex-column d-flex justify-space-between" cols="12" md="9">
          <EntityHeader
            :businessId="businessId"
            :tempRegNumber="tempRegNumber"
          />
          <EntityMenu
            class="mt-4 ml-n4"
            :businessId="businessId"
            @confirmDissolution="emitConfirmDissolution()"
            @downloadBusinessSummary="emitDownloadBusinessSummary()"
            @notInGoodStanding="emitNotInGoodStanding($event)"
            @viewAddDigitalCredentials="emitViewAddDigitalCredentials()"
          />
        </v-col>

        <v-col cols="12" md="3">
          <EntityDefinitions
            :businessId="businessId"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { NigsMessage } from '@/enums'
import EntityDefinitions from './EntityInfo/EntityDefinitions.vue'
import EntityHeader from './EntityInfo/EntityHeader.vue'
import EntityMenu from './EntityInfo/EntityMenu.vue'
import { useRootStore } from '@/stores'

@Component({
  components: {
    EntityDefinitions,
    EntityHeader,
    EntityMenu
  }
})
export default class EntityInfo extends Vue {
  @Getter(useRootStore) isRoleStaff!: boolean

  /** Whether to show the hover style. */
  protected showHoverStyle = false

  /** The Business ID string (may be null). */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Temporary Registration Number string (may be null). */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  /** Emits an event to confirm dissolution. */
  @Emit('confirmDissolution')
  private emitConfirmDissolution (): void {}

  /** Emits an event to download the business summary. */
  @Emit('downloadBusinessSummary')
  private emitDownloadBusinessSummary (): void {}

  /** Emits an event to indicate business is not in good standing. */
  @Emit('notInGoodStanding')
  private emitNotInGoodStanding (message: NigsMessage): void {}

  /** Emits an event to view / add digital credentials. */
  @Emit('viewAddDigitalCredentials')
  private emitViewAddDigitalCredentials (): void {}
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

  // ENABLE THIS TO GET STAFF-SPECIFIC BACKGROUND IMAGE
  // &.staff {
  //   background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='100'><text x='0' y='105' font-size='30' transform='rotate(-45 10,40)' opacity='0.1'>STAFF</text></svg>");
  //   background-repeat: repeat-x;
  // }
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

:deep(#staff-comments .v-btn) {
  margin-top: -4px; // for vertical alignment
}

#company-information-button,
#dissolution-button,
#download-summary-button {
  margin-top: -4px; // for vertical alignment
}

:deep(.v-chip__content) {
  letter-spacing: 0.5px;
}
</style>
