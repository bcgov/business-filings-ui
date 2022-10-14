<template>
  <v-expansion-panels v-model="panel" id="missing-information-container">
    <v-expansion-panel class="mb-6">
      <v-expansion-panel-header hide-actions class="d-flex justify-space-between py-6">
        <h3>
          <v-icon left color="orange darken-2" class="mt-n1">mdi-alert</v-icon>
          Missing information
        </h3>
        <v-btn text color="primary" class="details-btn mt-n1" @click.stop="togglePanel()">
          <span color="primary">{{ panel === 0 ? "Hide Details" : "View Details" }}</span>
          <v-icon right color="primary" size="24px">
            {{ panel === 0 ? "mdi-chevron-up" : "mdi-chevron-down" }}
          </v-icon>
        </v-btn>
      </v-expansion-panel-header>

      <v-expansion-panel-content>
        <p>
          BC Registries is missing information about your business (e.g., business start date,
          nature of business, business address, etc.). Please contact BC Registries to input
          any missing business information. Missing information must be entered before you can
          file changes or dissolve this business.
        </p>
        <p>
          If further action is required, please contact BC Registries staff:
        </p>
        <ContactInfo class="my-4" />
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

.details-btn {
  pointer-events: auto; // enable detail button only
  max-width: fit-content;
  font-size: $px-14;
  color: $app-blue;
}

p {
  font-size: $px-15;
}
</style>
