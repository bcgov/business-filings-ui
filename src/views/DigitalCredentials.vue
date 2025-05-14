<template>
  <v-container id="digital-credentials">
    <router-view />
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { AllowableActions, AuthorizedActions, Routes } from '@/enums'
import { AllowableActionsMixin } from '@/mixins'
import { IsAuthorized } from '@/utils'

@Component
export default class DigitalCredentials extends Mixins(AllowableActionsMixin) {
  mounted (): void {
    // if not allowed, go back to dashboard
    if (!this.isAllowed(AllowableActions.DIGITAL_CREDENTIALS) &&
      !IsAuthorized(AuthorizedActions.DIGITAL_CREDENTIALS)) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  }
}
</script>
