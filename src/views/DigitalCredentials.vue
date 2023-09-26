<template>
  <v-container id="digital-credentials">
    <router-view />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import {
  CredentialsLanding,
  CredentialsStepper
} from '@/components/DigitalCredentials'
import { Routes } from '@/enums'
import { DigitalCredentialsIF } from '@/interfaces'
import { LegalServices } from '@/services/'
import { useBusinessStore } from '@/stores'

@Component({
  components: {
    CredentialsLanding,
    CredentialsStepper
  }
})
export default class DigitalCredentials extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string;

  issuedCredentials: Array<DigitalCredentialsIF> = [];

  async mounted (): Promise<void> {
    await this.getCredentials()
    if (!this.issuedCredentials?.length && !this.isDigitalCredentialHome) {
      this.goToDigitalCredentialHome()
    }
  }

  get isDigitalCredentialHome (): boolean {
    return this.$route.name === Routes.DIGITAL_CREDENTIALS
  }

  goToDigitalCredentialHome (): void {
    this.$router.push({ name: Routes.DIGITAL_CREDENTIALS })
  }

  async getCredentials (): Promise<void> {
    const { data } = await LegalServices.fetchCredentials(this.getIdentifier)
    this.issuedCredentials = data?.issuedCredentials
  }
}
</script>
