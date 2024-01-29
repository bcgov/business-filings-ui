<template>
  <v-container id="digital-credentials">
    <router-view />
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { AllowableActions, Routes } from '@/enums'
import { AllowableActionsMixin } from '@/mixins'

@Component
export default class DigitalCredentials extends Mixins(AllowableActionsMixin) {
  mounted (): void {
    if (!this.isAllowed(AllowableActions.DIGITAL_CREDENTIALS)) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  }
}
</script>
