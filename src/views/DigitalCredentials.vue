<template>
  <v-container id="digital-credentials">

    <!-- Digital Credentials Landing -->
    <CredentialsLanding v-if="isDigitalCredentialHome" class="py-8" @addCredentials="addCredentials()" />

    <!-- Add Credentials -->
    <section v-else id="add-digital-credentials">

      <!-- Add Credentials Header -->
      <article id="add-digital-credentials-header" class="pt-8">
        <v-row no-gutters>
          <v-col cols="12" lg="11">
            <h1>Generate Business Digital Credentials</h1>
          </v-col>
        </v-row>
      </article>

      <!-- Credentials Stepper -->
      <article id="digital-credentials-stepper" class="mt-8">
        <v-row no-gutters>
          <v-col cols="12" lg="9">
            <Stepper :getSteps="digitalCredentialSteps" />
          </v-col>
        </v-row>
      </article>

      <!-- Credentials component flow -->
      <article id="digital-credentials-component-view">
        <v-row no-gutters>
          <v-col cols="12" lg="9">
            <router-view />
          </v-col>
        </v-row>
      </article>

      <!-- Credentials Footer -->
      <CredentialsFooter
        :nextStepName="nextStepName"
        :currentStepIndex="currentStepIndex"
        :lastStepIndex="digitalCredentialSteps.length - 1"
        @back="back()"
        @next="next()"
        @cancel="cancel()"
      />
    </section>

  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
  ChooseCredentials,
  CredentialsLanding,
  CredentialsFooter,
  DigitalWalletDownload,
  ScanCredentials
} from '@/components/DigitalCredentials'
import { Stepper } from '@/components/common'
import { Routes } from '@/enums'
import { StepsIF } from '@/interfaces'

@Component({
  components: {
    CredentialsLanding,
    CredentialsFooter,
    Stepper
  }
})
export default class DigitalCredentials extends Vue {
  /** The steps for Business Digital Credentials. **/
  get digitalCredentialSteps (): Array<StepsIF> {
    return [
      {
        id: 'step-1-btn',
        step: 1,
        icon: 'mdi-cloud-download',
        text: 'Download\n Digital Wallet',
        to: `/digital-credentials/download-wallet`,
        component: DigitalWalletDownload
      },
      {
        id: 'step-2-btn',
        step: 2,
        icon: 'mdi-file-certificate-outline',
        text: 'Choose\n Digital Credentials',
        to: `/digital-credentials/choose-credentials`,
        component: ChooseCredentials
      },
      {
        id: 'step-3-btn',
        step: 3,
        icon: 'mdi-cellphone',
        text: 'Scan with\n Digital Wallet',
        to: `/digital-credentials/scan-credentials`,
        component: ScanCredentials
      }
    ]
  }

  get currentStepIndex (): number {
    return this.digitalCredentialSteps.map(step => { return step.to })
      .indexOf(`/${Routes.DIGITAL_CREDENTIALS}/${this.$route.name}`)
  }

  get isDigitalCredentialHome (): boolean {
    return (this.$route.name === Routes.DIGITAL_CREDENTIALS)
  }

  get nextStepName (): string {
    return this.digitalCredentialSteps[this.currentStepIndex + 1]?.text || 'Done'
  }

  addCredentials (): void {
    this.$router.push({ path: `${Routes.DIGITAL_CREDENTIALS}/${Routes.DOWNLOAD_WALLET}` })
  }

  back (): void {
    this.$router.push({ path: this.digitalCredentialSteps[this.currentStepIndex - 1].to })
  }

  next (): void {
    this.$router.push({
      path: this.digitalCredentialSteps[this.currentStepIndex + 1]?.to ||
      `/${Routes.DIGITAL_CREDENTIALS}`
    })
  }

  cancel (): void {
    this.$router.push({ path: `/${Routes.DIGITAL_CREDENTIALS}` })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
</style>
