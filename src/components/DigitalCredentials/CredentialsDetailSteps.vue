<template>
  <div id="credentials-detail-steps">
    <h1>Steps to get your credential</h1>
    <v-card class="mt-6">
      <v-card-text class="d-flex">
        <span
          class="credentials-stepper-number ml-n4 my-n4 px-4
          font-weight-bold align-self-stretch d-flex rounded-l"
        >
          <div class="align-self-center">1</div>
        </span>
        <span class="ml-4">
          <v-row>
            <v-col
              cols="12"
              sm="12"
              lg="8"
            >
              <h3>Install the BC Wallet app on your phone</h3>
              <p class="mt-1">
                <a
                  href="https://www2.gov.bc.ca/gov/content/governments/government-id/bc-wallet#get"
                  target="_blank"
                >BC Wallet<v-icon
                  small
                  color="primary"
                >mdi-open-in-new</v-icon></a> is a digital identity wallet. It lets you receive, store and present
                digital credentials such as memberships, permits, and ID cards.
              </p>
              <div>
                <v-btn
                  color="primary"
                  href="https://www2.gov.bc.ca/gov/content/governments/government-id/bc-wallet#get"
                  target="_blank"
                >Get the BC Wallet app
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
              <p class="mt-4">
                <a
                  href="https://www2.gov.bc.ca/gov/content/governments/government-id/bc-wallet/help"
                  target="_blank"
                >Help topics about using the BC Wallet app<v-icon
                  small
                  color="primary"
                >mdi-open-in-new</v-icon></a>
              </p>
            </v-col>
            <v-col>
              <img
                width="100%"
                src="@/assets/images/bc_wallet_app_store.png"
                :alt="imageAltText1"
              >
            </v-col>
          </v-row>
        </span>
      </v-card-text>
    </v-card>
    <v-card class="mt-4">
      <v-card-text class="d-flex">
        <span
          class="credentials-stepper-number ml-n4 my-n4 px-4
                    font-weight-bold align-self-stretch d-flex rounded-l"
        >
          <div class="align-self-center">2</div>
        </span>
        <span class="ml-4">
          <h3>Get your Digital Business Card</h3>
          <v-row class="justify-center">
            <v-col
              cols="12"
              lg="8"
            >
              <img
                width="100%"
                src="@/assets/images/business_card_issuance_steps.png"
                :alt="imageAltText2"
              >
            </v-col>
            <v-col cols="12">
              <ol class="credentials-ordered-list">
                <li><p>Open the BC Wallet app on your mobile phone, tap the "Scan" button.</p></li>
                <li><p>Allow (if prompted) the app to access the camera as it is needed to scan the QR code.</p></li>
                <li><p>Point your camera towards the QR code on the website. Once the scan is successful,
                  you’ll receive a credential offer in BC Wallet over a secure connection from BC Registries.
                </p></li>
                <li><p>Open the credential offer and accept the credential.</p></li>
              </ol>
            </v-col>
          </v-row>
        </span>
      </v-card-text>
    </v-card>
    <v-btn
      id="hide-detail-steps-button"
      class="mt-6"
      color="primary"
      @click.prevent="handleHideDetailSteps()"
    >
      Return to Simple Steps
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator'

@Component({})
export default class CredentialsDetailSteps extends Vue {
  imageAltText1 = 'Two mobile phones side by side showing the BC Wallet App in the app store.'
  imageAltText2 = 'On the far left is a BC Wallet with a QR code sample and arrows between 3 mobile phones ' +
  'showing the steps below.'

  @Emit('onHideDetailSteps')
  handleHideDetailSteps (): void {
    return undefined
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.credentials-stepper-number {
  color: white;
  background-color: $app-blue;
}

.credentials-ordered-list {
    li::marker {
      font-weight: bold;
    }
    li {
      padding-left: $px-10;
    }
}
</style>
