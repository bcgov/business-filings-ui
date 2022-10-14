<template>
  <v-expansion-panels v-model="panel" id="missing-information-container">
    <v-expansion-panel class="mb-6">
      <v-expansion-panel-header hide-actions class="d-flex justify-space-between px-6 py-5">
        <h3>
          <v-icon left color="orange darken-2">mdi-alert</v-icon>
          <span>Missing information</span>
        </h3>
        <v-btn text color="primary" class="details-btn my-n1" @click.stop="togglePanel()">
          <span color="primary">{{ panel === 0 ? "Hide Details" : "View Details" }}</span>
          <v-icon right color="primary">
            {{ panel === 0 ? "mdi-chevron-up" : "mdi-chevron-down" }}
          </v-icon>
        </v-btn>
      </v-expansion-panel-header>

      <v-expansion-panel-content>
        <p class="mb-0">
          BC Registries is missing information about your business (e.g., business start date,
          nature of business, business address, etc.). Please contact BC Registries to input
          any missing business information. Missing information must be entered before you can
          file changes or dissolve this business.
        </p>
        <p class="mb-0 pt-5">
          If further action is required, please contact BC Registries staff:
        </p>
        <ContactInfo class="pt-5" />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class MissingInformation extends Vue {
  protected panel = 1

  protected togglePanel (): void {
    this.panel = (this.panel === 1 ? 0 : 1)
  }
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

// override contact info sizes
:deep(.contact-info .contact-container) {
  .v-icon {
    font-size: $px-16 !important;
  }
  span {
    font-size: $px-14 !important;
  }
}
</style>
