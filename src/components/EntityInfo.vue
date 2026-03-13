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
import { Component, Vue } from 'vue-property-decorator'
import EntityDefinitions from './EntityInfo/EntityDefinitions.vue'
import EntityHeader from './EntityInfo/EntityHeader.vue'

@Component({
  components: {
    EntityDefinitions,
    EntityHeader
  }
})
export default class EntityInfo extends Vue {
  /** The Business ID string (may be null). */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The Temporary Registration Number string (may be null). */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }
}

</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#entity-info {
  background: $BCgovInputBG;

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
