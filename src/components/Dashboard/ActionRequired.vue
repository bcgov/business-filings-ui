<template>
  <v-expansion-panels v-model="panel">
    <v-expansion-panel class="action-required-container d-flex justify-center mb-6">
      <v-card flat class="px-6 py-5">
        <h3>Action Required</h3>
        <p class="mt-1">
          BC Registries is missing information about your business (e.g., business start date, nature of business,
          business address etc.). Please contact BC Registries to input any missing business information. Missing
          information must be entered before you can file changes or dissolve this business.
          <v-btn class="details-btn pl-1" outlined color="primary"  :ripple="false" @click.stop="togglePanel">
            <v-icon left color="primary" class="mr-0">mdi-information-outline</v-icon>
            <span color="primary">{{ panel === 0 ? "Hide Details" : "View Details" }}</span>
          </v-btn>
        </p>
        <v-expansion-panel-content class="action-required-contact-info">
          <p>BC Registries Contact Information:</p>
          <ContactInfo class="mt-4" />
        </v-expansion-panel-content>
      </v-card>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: {
    ContactInfo
  }
})
export default class ActionRequired extends Vue {
  public panel: number = 1;

  public togglePanel (): void {
    this.panel = this.panel === 1 ? 0 : 1
  }
}
</script>

<style lang="scss">
@import "@/assets/styles/theme.scss";
.action-required-contact-info .v-expansion-panel-content__wrap {
  padding: 0 0 16px !important;
}
</style>

<style lang="scss" scoped>

.details-btn {
  border: none;
  margin-top: -6px;
}
</style>
