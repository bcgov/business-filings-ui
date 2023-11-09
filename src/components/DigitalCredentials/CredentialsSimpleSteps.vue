<template>
  <div>
    <v-card class="pa-3">
      <v-card-text>
        <h1>Steps to get your credential:</h1>
        <v-card class="mt-6">
          <v-card-text class="d-flex">
            <span
              class="credentials-stepper-number ml-n4 my-n4 px-8
                    font-weight-bold align-self-stretch d-flex rounded-l"
            >
              <div class="align-self-center">1</div>
            </span>
            <span class="ml-8">
              Have the
              <a
                href="https://www2.gov.bc.ca/gov/content/governments/government-id/bc-wallet"
                target="_blank"
              >
                BC Wallet app<v-icon
                  small
                  color="primary"
                >mdi-open-in-new</v-icon></a>
              installed on your mobile phone.
            </span>
          </v-card-text>
        </v-card>
        <v-card class="mt-2">
          <v-card-text class="d-flex">
            <span
              class="credentials-stepper-number ml-n4 my-n4 px-8
                    font-weight-bold align-self-stretch d-flex rounded-l"
            >
              <div class="align-self-center">2</div>
            </span>
            <span class="ml-8">
              Scan the QR code with your BC Wallet to get your Digital Business Card and accept it in your BC
              Wallet app.
            </span>
          </v-card-text>
        </v-card>
        <v-card class="mt-2">
          <v-card-text class="d-flex">
            <span
              class="credentials-stepper-number ml-n4 my-n4 px-8
                    font-weight-bold align-self-stretch d-flex rounded-l"
            >
              <div class="align-self-center">3</div>
            </span>
            <span class="ml-8">
              Check your Digital Business Cards on the
              <router-link to="/digital-credentials">credential dashboard</router-link>.
            </span>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-text class="mt-n2">
        <a
          href="#"
          @click.prevent="handleShowDetailSteps()"
        >Read detailed instructions</a>
      </v-card-text>
    </v-card>

    <v-btn
      id="return-to-company-dashboard-button"
      color="primary"
      class="mt-6"
      @click="handleGoToCredentialsDashboard()"
    >
      Return to Company Dashboard
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator'

@Component({})
export default class CredentialSimpleSteps extends Vue {
  @Emit('onGoToCredentialsDashboard')
  handleGoToCredentialsDashboard (): void {
    return undefined
  }

  @Emit('onShowDetailSteps')
  handleShowDetailSteps (): void {
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
</style>
