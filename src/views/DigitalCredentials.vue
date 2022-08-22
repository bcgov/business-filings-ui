<template>
  <v-container id="digital-credentials" class="mt-8">

    <!-- Digital Credentials Landing -->
    <CredentialsLanding v-if="isDigitalCredentialRoute" @addCredentials="addCredentials()" />

    <!-- Add Credentials -->
    <section v-else id="add-digital-credentials">

      <!-- Credentials Stepper -->
      <article id="digital-credentials-stepper">
        <v-row no-gutters>
          <v-col cols="12" lg="11">
            <Stepper :getSteps="digitalCredentialSteps" />
          </v-col>
        </v-row>
      </article>

      <!-- Credentials component flow -->
      <article id="digital-credentials-component-view">
        <v-row no-gutters>
          <v-col cols="12" lg="11">
            <router-view />
          </v-col>
        </v-row>
      </article>
    </section>

  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
  ChooseCredentials,
  CredentialsLanding,
  DigitalWalletDownload,
  ScanCredentials
} from '@/components/DigitalCredentials'
import { Stepper } from '@/components/common'
import { Routes } from '@/enums'
import { StepsIF } from '@/interfaces'

@Component({
  components: {
    CredentialsLanding,
    Stepper
  }
})
export default class DigitalCredentials extends Vue {
  private addCredentials (): void {
    this.$router.push({ path: `${Routes.DIGITAL_CREDENTIALS}/download-wallet` })
  }

  get isDigitalCredentialRoute (): boolean {
    return (this.$route.name === Routes.DIGITAL_CREDENTIALS)
  }

  /** The steps for Business Digital Credentials pilot. **/
  get digitalCredentialSteps (): Array<StepsIF> {
    return [
      {
        id: 'step-1-btn',
        step: 1,
        icon: 'mdi-domain',
        text: 'Download\n Digital Wallet',
        to: `/digital-credentials/download-wallet`,
        component: DigitalWalletDownload
      },
      {
        id: 'step-2-btn',
        step: 2,
        icon: 'mdi-domain',
        text: 'Choose\n Digital Credentials',
        to: `/digital-credentials/choose-credentials`,
        component: ChooseCredentials
      },
      {
        id: 'step-3-btn',
        step: 3,
        icon: 'mdi-domain',
        text: 'Scan with\n Digital Wallet',
        to: `/digital-credentials/scan-credentials`,
        component: ScanCredentials
      }
    ]
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
</style>
