<template>
  <v-expansion-panel id="corporate-online-panel">
    <v-expansion-panel-header
      hide-actions
      class="d-flex justify-space-between px-6 py-5"
    >
      <h3>
        <v-icon
          left
          color="orange darken-2"
        >
          mdi-alert
        </v-icon>
        <span>This business must be managed in Corporate Online.</span>
      </h3>
      <v-btn
        text
        color="primary"
        class="details-btn my-n1"
        @click.stop="togglePanel()"
      >
        <span color="primary">{{ showPanel ? "Hide Details" : "View Details" }}</span>
        <v-icon
          right
          color="primary"
        >
          {{ showPanel ? "mdi-chevron-up" : "mdi-chevron-down" }}
        </v-icon>
      </v-btn>
    </v-expansion-panel-header>

    <v-expansion-panel-content eager>
      <p class="mb-0">
        This {{ corpFullDescription }} must be managed in
        <a
          :href="getCorporateOnlineUrl"
          target="_blank"
        >
          Corporate Online
        </a>
        .
      </p>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useBusinessStore, useConfigurationStore } from '@/stores'
import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

@Component({})
export default class CorporateOnline extends Vue {
  @Prop({ required: true }) readonly showPanel!: boolean

  @Getter(useConfigurationStore) getCorporateOnlineUrl!: string
  @Getter(useBusinessStore) getLegalType!: CorpTypeCd

  get corpFullDescription (): string {
    return GetCorpFullDescription(this.getLegalType)
  }

  @Emit('togglePanel')
  togglePanel (): void {}
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.v-expansion-panel-header {
  pointer-events: none; // disable whole-row expansion
}

h3 {
  .v-icon {
    margin-top: -2px;
    font-size: $px-20;
  }

  span {
    font-size: $px-14;
  }
}

.details-btn {
  pointer-events: auto; // enable detail button only
  max-width: fit-content;
  color: $app-blue;

  span {
    font-size: $px-13;
  }

  .v-icon {
    font-size: $px-24 !important;
  }
}

// override default expansion panel padding
:deep(.v-expansion-panel-content__wrap) {
  padding: 0 1.5rem 1.25rem 1.5rem;
}

p {
  font-size: $px-14;
}
</style>
