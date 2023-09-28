<template>
  <section id="credentials-stepper">
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <v-card class="pa-3">
            <v-card-text>
              <h1 class="mb-4">
                Steps to get your credentials:
              </h1>
              <v-card
                v-for="step in steps"
                :key="step.id"
                class="mb-2"
              >
                <v-card-text class="d-flex">
                  <span
                    class="credentials-stepper-number ml-n4 my-n4 px-8
                    font-weight-bold align-self-stretch d-flex rounded-l"
                  >
                    <div class="align-self-center">
                      {{ step.id }}
                    </div>
                  </span>
                  <span
                    class="ml-8"
                    v-html="step.html"
                  />
                </v-card-text>
              </v-card>
              <div class="mt-4">
                <p class="mb-0 font-weight-bold word-wrap">
                  Need more help?
                </p>
                <a
                  class="text-decoration-none"
                  href=""
                  target="_blank"
                >Find solutions</a>
                to common issues people experience or contact us at
                <a
                  class="text-decoration-none"
                  href="mailto:BCRegistries@gov.bc.ca"
                >BCRegistries@gov.bc.ca</a>.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card v-if="!credentialConnection?.isActive">
            <v-card-text class="d-flex flex-column">
              <p class="mt-4 mb-8 justify-center text-center font-weight-bold word-wrap">
                Scan this QR code with your BC Wallet app
              </p>
              <QrcodeVue
                class="d-flex justify-center"
                render-as="svg"
                size="200"
                :value="credentialConnection?.invitationUrl"
              />
              <p class="mt-8 justify-center text-center word-wrap">
                QR code isn't scanning?
                <a
                  class="text-decoration-none"
                  href=""
                  target="_blank"
                >Generate a new QR code</a>.
              </p>
            </v-card-text>
          </v-card>
          <v-card v-else>
            <v-card-text
              v-if="!issuedCredential"
              class="d-flex flex-column"
            >
              <div
                class="d-flex justify-self-center align-self-center justify-center align-center"
                style="width: 200px; height: 200px"
              >
                <v-progress-circular

                  color="primary"
                  indeterminate
                />
              </div>
              <p class="justify-center text-center font-weight-bold word-wrap">
                Accept the request in your wallet
              </p>
              <a
                class="text-decoration-none justify-center text-center word-wrap"
                href=""
                target="_blank"
              >
                I didn't receive anything
              </a>
            </v-card-text>
            <v-card-text
              v-else
              class="d-flex flex-column"
            >
              <div
                class="d-flex justify-self-center align-self-center justify-center align-center"
                style="width: 200px; height: 200px"
              >
                <v-icon
                  color="black"
                  size="xxx-large"
                >
                  mdi-check-circle-outline
                </v-icon>
              </div>
              <p class="justify-center text-center font-weight-bold word-wrap">
                Your Business Card is now ready to use
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <CredentialsWebSocket
      @onConnection="handleConnection"
      @onIssuedCredential="handleIssuedCredential"
    />
  </section>
</template>

<script lang="ts">
import { DigitalCredentialTypes, Routes } from '@/enums'
import { LegalServices } from '@/services'
import { useBusinessStore } from '@/stores'
import { Getter } from 'pinia-class'
import { Component, Vue } from 'vue-property-decorator'
import QrcodeVue from 'qrcode.vue'
import { DigitalCredentialIF, WalletConnectionIF } from '@/interfaces'
import CredentialsWebSocket from '@/components/DigitalCredentials/CredentialsWebSocket.vue'

Component.registerHooks([
  'beforeRouteEnter'
])

// Create a component that extends the Vue class called CredentialsStepper
@Component({ components: { QrcodeVue, CredentialsWebSocket } })
export default class CredentialsStepper extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string;

  credentialTypes = DigitalCredentialTypes;
  credentialConnection: WalletConnectionIF = null;
  issuedCredential: DigitalCredentialIF = null;
  steps = [
    {
      id: 1,
      html: `
        Have the <a class="text-decoration-none"
        href="https://www2.gov.bc.ca/gov/content/governments/government-id/bc-wallet" target="_blank">
        BC Wallet app</a> installed on your mobile phone.
    `
    },
    {
      id: 2,
      html: `
        Scan the QR code with your BC Wallet to get your Business Card Credential and accept in your BC Wallet app.
      `
    },
    {
      id: 3,
      html: `
        In your BC Wallet app, check your notifications. You should have one to get a Person Credential.
        Go through the process of accepting it into your wallet.
      `
    },
    {
      id: 4,
      html: `
        Check your Business Card credentials on the
        <router-link to="">Credential dashboard</router-link>.
      `
    }
  ];

  async beforeRouteEnter (to, from, next): Promise<void> {
    next(async (_this) => {
      const { data } = await LegalServices.fetchCredentials(_this.getIdentifier)
      const issuedCredentials = data?.issuedCredentials

      if (issuedCredentials?.length) {
        next({ name: Routes.DIGITAL_CREDENTIALS })
      } else {
        next()
      }
    })
  }

  async mounted (): Promise<void> {
    await this.getCredentialsConnection()
    if (!this.credentialConnection) {
      await this.addCredentialInvitation()
    }
  }

  async addCredentialInvitation (): Promise<void> {
    const { data: connection } = await LegalServices.createCredentialInvitation(this.getIdentifier)
    this.credentialConnection = connection
  }

  async getCredentialsConnection (): Promise<void> {
    const { data } = await LegalServices.fetchCredentialConnections(this.getIdentifier)
    this.credentialConnection = data?.connections?.[0]
  }

  async issueCredential (credentialType: DigitalCredentialTypes): Promise<void> {
    await LegalServices.sendCredentialOffer(this.getIdentifier, credentialType)
  }

  async handleConnection (connection: WalletConnectionIF) {
    this.credentialConnection = connection
    await this.issueCredential(this.credentialTypes.BUSINESS)
  }

  async handleIssuedCredential (issuedCredential: DigitalCredentialIF) {
    this.issuedCredential = issuedCredential
  }
}
</script>

<style lang="scss" scoped>
.credentials-stepper-number {
  color: rgb(255, 255, 255);
  background-color: rgb(22, 105, 187);
}
</style>

<style scoped lang="scss">
.word-wrap {
  word-break: normal;
}
</style>
