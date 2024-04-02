<template>
  <FilingTemplate
    class="registration-filing"
    :filing="filing"
    :index="index"
  >
    <template #body>
      <div
        v-if="!!tempRegNumber && isStatusCompleted"
        class="completed-registration-details"
      >
        <h4>Registration Complete</h4>

        <p>
          {{ getLegalName || 'This company' }} has been successfully registered.
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
import { EnumUtilities } from '@/services'
import FilingTemplate from '../FilingTemplate.vue'
import { useBusinessStore, useConfigurationStore } from '@/stores'

@Component({
  components: {
    FilingTemplate
  }
})
export default class RegistrationFiling extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useConfigurationStore) getDashboardUrl!: string

  /** The Temporary Registration Number string (may be null). */
  get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }

  get isStatusCompleted (): boolean {
    return EnumUtilities.isStatusCompleted(this.filing)
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

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
