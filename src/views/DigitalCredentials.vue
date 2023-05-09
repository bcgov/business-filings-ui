<template>
  <v-container id="digital-credentials">

    <!-- Digital Credentials Landing -->
    <CredentialsLanding
      v-if="isDigitalCredentialHome"
      class="py-8"
      :issuedCredentials="issuedCredentials"
      @addCredentials="addCredentials()"
    />

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
            <router-view
              class="py-8"
              :credentialInvitationUrl="credentialInvitationUrl"
              :hasRegisteredWallet="hasRegisteredWallet"
              :issuedCredentials="issuedCredentials"
              @back="back()"
              @sendCredentialOffer="issueCredential($event)"
            />
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
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import {
  RegisterWallet,
  CredentialsLanding,
  CredentialsFooter,
  DigitalWalletDownload,
  IssueCredentials
} from '@/components/DigitalCredentials'
import { Stepper } from '@/components/common'
import { DigitalCredentialTypes, Routes } from '@/enums'
import { DigitalCredentialsIF, StepsIF } from '@/interfaces'
import { LegalServices } from '@/services/'
import { useBusinessStore } from '@/stores/businessStore'

@Component({
  components: {
    CredentialsLanding,
    CredentialsFooter,
    Stepper
  }
})
export default class DigitalCredentials extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string

  private issuedCredentials: Array<DigitalCredentialsIF> = []
  private credentialInvitationUrl = ''
  private hasRegisteredWallet = false

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
        icon: 'mdi-cellphone',
        text: 'Register\n Digital Wallet',
        to: `/digital-credentials/register-wallet`,
        component: RegisterWallet
      },
      {
        id: 'step-3-btn',
        step: 3,
        icon: 'mdi-file-certificate-outline',
        text: 'Issue Credential to\n Digital Wallet',
        to: `/digital-credentials/issue-credentials`,
        component: IssueCredentials
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

  protected addCredentials (): void {
    this.$router.push({ path: `${Routes.DIGITAL_CREDENTIALS}/${Routes.DOWNLOAD_WALLET}` })
  }

  protected back (): void {
    this.$router.push({ path: this.digitalCredentialSteps[this.currentStepIndex - 1].to })
  }

  protected next (): void {
    this.$router.push({
      path: this.digitalCredentialSteps[this.currentStepIndex + 1]?.to ||
      `/${Routes.DIGITAL_CREDENTIALS}`
    })
  }

  protected cancel (): void {
    this.$router.push({ path: `/${Routes.DIGITAL_CREDENTIALS}` })
  }

  private async getCredentials (): Promise<void> {
    const { data } = await LegalServices.fetchCredentials(this.getIdentifier)
    if (data?.issuedCredentials) {
      this.issuedCredentials = data.issuedCredentials
    }
  }

  private async addCredentialInvitation (): Promise<void> {
    const { data } = await LegalServices.createCredentialInvitation(this.getIdentifier)
    if (data?.invitationUrl) {
      this.credentialInvitationUrl = data.invitationUrl
    }
  }

  private async getCredentialsConnection (): Promise<void> {
    const connection = await LegalServices.fetchCredentialConnection(this.getIdentifier)
    if (connection) {
      this.hasRegisteredWallet = true
    }
  }

  protected async issueCredential (credentialType: DigitalCredentialTypes): Promise<void> {
    const credentialIssued = await LegalServices.issueCredentialOffer(this.getIdentifier, credentialType)
    if (credentialIssued) {
      await this.getCredentials()
    }
  }

  // Keep credential data in sync when navigating between routes.
  // This is required due to the nature of external interactions between mobile device and api
  @Watch('$route', { immediate: true })
  private async syncCredentials (): Promise<void> {
    await this.getCredentials()

    // Check for connections on step 2 when there is no registered wallet
    if (this.issuedCredentials.length > 0) { this.hasRegisteredWallet = true }
    if (!this.hasRegisteredWallet && this.currentStepIndex === 1) { await this.getCredentialsConnection() }

    // Generate an Invitation URL once only if the user has not registered
    if (!this.hasRegisteredWallet && !this.credentialInvitationUrl) {
      await this.addCredentialInvitation()
    }
  }
}
</script>
