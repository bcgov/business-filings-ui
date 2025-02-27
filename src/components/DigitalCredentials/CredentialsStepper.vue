<template>
  <div id="credentials-stepper">
    <!-- Dialogs -->
    <ConfirmCredentialsTermsOfUseDialog
      :dialog="confirmCredentialsTermsOfUseDialog"
      attach="#app"
      @close="goToCredentialsDashboard()"
      @proceed="hideConfirmCredentialsTermsOfUseDialog()"
    />

    <CredentialNotReceivedDialog
      :dialog="credentialNotReceivedDialog"
      attach="#app"
      @close="credentialNotReceivedDialog = false"
      @onResendOffer="resendOffer()"
      @onResetOffer="resetOffer()"
    />

    <!-- Initial Page Load Transition -->
    <v-fade-transition>
      <div
        v-show="showLoadingContainer"
        class="loading-container"
      >
        <div class="loading__content">
          <v-progress-circular
            color="primary"
            :size="50"
            indeterminate
          />
          <div class="loading-msg">
            {{ loadingMessage }}
          </div>
        </div>
      </div>
    </v-fade-transition>

    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <CredentialsDetailSteps
            v-if="showDetailSteps"
            @onHideDetailSteps="showDetailSteps = false"
          />
          <CredentialsSimpleSteps
            v-else
            @onShowDetailSteps="showDetailSteps = true"
            @onGoToCompanyDashboard="goToCompanyDashboard()"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            v-if="!connection?.isActive"
            class="pt-3 px-3"
          >
            <v-card-text class="d-flex flex-column">
              <p class="justify-center text-center font-weight-bold word-break-normal">
                Scan this QR code with your BC Wallet app
              </p>
              <QrcodeVue
                class="d-flex justify-center mt-4"
                render-as="svg"
                size="200"
                :value="connection?.invitationUrl"
              />
              <p class="mt-8 justify-center text-center word-break-normal">
                QR code isn't scanning?
                <!-- eslint-disable vue/max-attributes-per-line -->
                <a href="#" @click.prevent="handleGenegerateNewQRCode()">Generate a new QR code</a>.
              </p>
            </v-card-text>
          </v-card>
          <v-card
            v-else
            class="pt-3 px-3"
          >
            <v-card-text
              v-if="!issuedCredential?.isIssued"
              class="d-flex flex-column"
            >
              <p class="justify-center text-center font-weight-bold word-break-normal">
                Accept the request in your wallet
              </p>
              <div
                class="d-flex justify-self-center align-self-center justify-center align-center pt-4"
                style="width: 200px; height: 200px"
              >
                <v-progress-circular
                  color="primary"
                  indeterminate
                />
              </div>
              <p class="justify-center text-center word-break-normal pt-8">
                <a
                  href="#"
                  @click.prevent="handleNoCredentialOfferReceived()"
                >
                  I didn't receive anything
                </a>
              </p>
            </v-card-text>
            <v-card-text
              v-else
              class="d-flex flex-column"
            >
              <p class="justify-center text-center font-weight-bold word-break-normal">
                Your Business Card is now ready to use
              </p>
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
              <p class="justify-center text-center word-break-normal pt-8">
                Go to your
                <!-- eslint-disable vue/singleline-html-element-content-newline -->
                <router-link to="/digital-credentials">credential dashboard</router-link>
                to see details and make changes.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <CredentialsWebSocket
      :connection="connection"
      :issuedCredential="issuedCredential"
      @onConnection="handleConnection($event)"
      @onAttestation="handleAttestation($event)"
      @onIssuedCredential="handleIssuedCredential($event)"
    />
  </div>
</template>

<script lang="ts">
import { DigitalCredentialTypes, Routes } from '@/enums'
import { LegalServices } from '@/services'
import { CommonMixin } from '@/mixins'
import { Component, Mixins } from 'vue-property-decorator'
import QrcodeVue from 'qrcode.vue'
import { DigitalCredentialIF, WalletConnectionIF } from '@/interfaces'
import CredentialsWebSocket from '@/components/DigitalCredentials/CredentialsWebSocket.vue'
import ConfirmCredentialsTermsOfUseDialog
  from '@/components/DigitalCredentials/dialogs/ConfirmCredentialsTermsofUseDialog.vue'
import CredentialNotReceivedDialog from './dialogs/CredentialNotReceivedDialog.vue'
import CredentialsSimpleSteps from '@/components/DigitalCredentials/CredentialsSimpleSteps.vue'
import CredentialsDetailSteps from '@/components/DigitalCredentials/CredentialsDetailSteps.vue'

Component.registerHooks(['beforeRouteEnter'])

// Create a component that extends the Vue class called CredentialsStepper
@Component({
  components: {
    QrcodeVue,
    CredentialsWebSocket,
    ConfirmCredentialsTermsOfUseDialog,
    CredentialNotReceivedDialog,
    CredentialsSimpleSteps,
    CredentialsDetailSteps
  }
})
export default class CredentialsStepper extends Mixins(CommonMixin) {
  // @Getter(useBusinessStore) getIdentifier!: string

  loadingMessage = 'Loading'
  showLoadingContainer = true
  showDetailSteps = false
  confirmCredentialsTermsOfUseDialog = false
  credentialNotReceivedDialog = false
  credentialTypes = DigitalCredentialTypes
  connection: WalletConnectionIF = null
  issuedCredential: DigitalCredentialIF = null

  async beforeRouteEnter (to, from, next): Promise<void> {
    next(async (_this) => {
      const { data } = await LegalServices.fetchCredentials(_this.getIdentifier)
      const issuedCredentials = data?.issuedCredentials

      if (issuedCredentials?.length) {
        next({ name: Routes.DIGITAL_CREDENTIALS })
      } else {
        _this.confirmCredentialsTermsOfUseDialog = true
        next()
      }
    })
  }

  async setupConnection (): Promise<void> {
    await this.getConnection()
    if (!this.connection) {
      await this.addOutOfBandInvitation()
    }
    this.showLoadingContainer = false
  }

  async hideConfirmCredentialsTermsOfUseDialog (): Promise<void> {
    this.confirmCredentialsTermsOfUseDialog = false
    await this.setupConnection()
  }

  async handleGenegerateNewQRCode (): Promise<void> {
    this.showLoadingContainer = true
    await LegalServices.removeCredentialConnection(this.getIdentifier, this.connection.connectionId)
    await this.setupConnection()
  }

  async handleNoCredentialOfferReceived (): Promise<void> {
    this.credentialNotReceivedDialog = true
  }

  async addOutOfBandInvitation (): Promise<void> {
    const { data: connection } = await LegalServices.createCredentialOutOfBandInvitation(this.getIdentifier)
    this.connection = connection || null
  }

  async getConnection (): Promise<void> {
    const { data } = await LegalServices.fetchCredentialConnections(this.getIdentifier)
    this.connection = data?.connections?.[0] || null
  }

  async attestConnection (): Promise<void> {
    await LegalServices.attestCredentialConnection(this.getIdentifier, this.connection.connectionId)
  }

  async issueCredential (credentialType: DigitalCredentialTypes): Promise<void> {
    const { data: issuedCredential } = await LegalServices.sendCredentialOffer(this.getIdentifier, credentialType)
    this.issuedCredential = issuedCredential || null
  }

  async handleConnection (connection: WalletConnectionIF) {
    this.connection = connection
    if (this.connection?.isActive && !this.connection?.lastAttested && !this.connection?.isAttested) {
      await this.attestConnection()
    }
  }

  async handleAttestation (connection: WalletConnectionIF): Promise<void> {
    this.connection = connection
    if (this.connection?.isActive && this.connection?.lastAttested && this.connection?.isAttested) {
      await this.issueCredential(this.credentialTypes.BUSINESS)
    }
  }

  async handleIssuedCredential (issuedCredential: DigitalCredentialIF): Promise<void> {
    this.issuedCredential = issuedCredential
  }

  async resendOffer (): Promise<void> {
    this.credentialNotReceivedDialog = false
    this.showLoadingContainer = true
    if (this.issuedCredential) {
      await this.removeCredential(this.getIdentifier, this.issuedCredential.credentialId)
    }
    await this.issueCredential(this.credentialTypes.BUSINESS)
    this.showLoadingContainer = false
  }

  async resetOffer (): Promise<void> {
    this.credentialNotReceivedDialog = false
    this.showLoadingContainer = true
    if (this.issuedCredential) {
      await this.removeCredential(this.getIdentifier, this.issuedCredential.credentialId)
    }
    if (this.connection) {
      await this.removeConnection(this.getIdentifier, this.connection.connectionId)
    }
    await this.setupConnection()
  }

  async removeCredential (identifier: string, credentialId: string): Promise<void> {
    await LegalServices.removeCredential(identifier, credentialId)
    this.issuedCredential = null
  }

  async removeConnection (identifier: string, connectionId: string): Promise<void> {
    await LegalServices.removeCredentialConnection(identifier, connectionId)
    this.connection = null
  }

  goToCredentialsDashboard (): void {
    this.$router.push({ name: Routes.DIGITAL_CREDENTIALS })
  }

  goToCompanyDashboard (): void {
    this.navigateToBusinessDashboard()
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  z-index: 1;
}
</style>
