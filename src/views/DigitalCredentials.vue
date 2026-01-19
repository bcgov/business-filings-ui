<template>
  <v-container id="digital-credentials">
    <router-view />
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { AllowableActions, AuthorizedActions } from '@/enums'
import { AllowableActionsMixin, CommonMixin } from '@/mixins'
import { IsAuthorized } from '@/utils'

@Component
export default class DigitalCredentials extends Mixins(AllowableActionsMixin, CommonMixin) {
  mounted (): void {
    // if not allowed or not authorized, go back to dashboard
    if (
      !this.isAllowed(AllowableActions.DIGITAL_CREDENTIALS) ||
      !IsAuthorized(AuthorizedActions.DIGITAL_CREDENTIALS)
    ) {
      this.navigateToBusinessDashboard(this.getIdentifier)
    }
  }
}
</script>
