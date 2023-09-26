<template>
  <section id="credentials-stepper">
    <v-container>
      <v-row>
        <v-col>
          <v-card>
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
                >Find solutions</a> to common issues people experience or contact us at
                <a
                  class="text-decoration-none"
                  href="mailto:BCRegistries@gov.bc.ca"
                >BCRegistries@gov.bc.ca</a>.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
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
                QR code isn't scanning?<a
                  class="text-decoration-none"
                  href=""
                  target="_blank"
                >&nbsp;Generate a new QR code.</a>
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script lang="ts">
import { DigitalCredentialTypes } from '@/enums'
import { LegalServices } from '@/services'
import { useBusinessStore } from '@/stores'
import { Getter } from 'pinia-class'
import { Component, Vue } from 'vue-property-decorator'
import QrcodeVue from 'qrcode.vue'

// Create a component that extends the Vue class called CredentialsStepper
@Component({ components: { QrcodeVue } })
export default class CredentialsStepper extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string;

  // TODO: Create the correct type for a Connection
  credentialConnection: any = null;
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
    // TODO:
    const { data: credentialIssued } = await LegalServices.sendCredentialOffer(this.getIdentifier, credentialType)
    console.log('credentialIssued', credentialIssued)
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
