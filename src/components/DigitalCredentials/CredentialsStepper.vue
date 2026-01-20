<template>
  <div id="credentials-stepper">
    <!-- Dialogs -->
    <ConfirmCredentialsTermsOfUseDialog
      :dialog="confirmCredentialsTermsOfUseDialog"
      attach="#app"
      @close="goToCredentialsDashboard()"
      @proceed="hideConfirmCredentialsTermsOfUseDialog()"
    />

    <ConfirmPreconditionDialog
      v-for="(precondition, index) in preconditions"
      :key="index"
      :attest-name="attestName"
      :attest-business="attestBusiness"
      :dialog="pendingPreconditions[precondition]?.presented"
      :precondition="precondition"
      attach="#app"
      @close="hideConfirmPreconditionDialog(precondition, false)"
      @proceed="hideConfirmPreconditionDialog(precondition, true)"
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
                <a href="#" @click.prevent="handleGenerateNewQRCode()">Generate a new QR code</a>.
              </p>
            </v-card-text>
          </v-card>
          <v-card v-else class="pt-3 px-3">
            <v-card-text v-if="!issuedCredential?.isIssued" class="d-flex flex-column">
              <p class="justify-center text-center font-weight-bold word-break-normal">
                Accept the request in your wallet
              </p>
              <div
                class="d-flex justify-self-center align-self-center justify-center align-center pt-4"
                style="width: 200px; height: 200px"
              >
                <v-progress-circular color="primary" indeterminate />
              </div>
              <p class="justify-center text-center word-break-normal pt-8">
                <a href="#" @click.prevent="handleNoCredentialOfferReceived()"> I didn't receive anything </a>
              </p>
            </v-card-text>
            <v-card-text v-else class="d-flex flex-column">
              <p class="justify-center text-center font-weight-bold word-break-normal">
                Your Business Card is now ready to use
              </p>
              <div
                class="d-flex justify-self-center align-self-center justify-center align-center"
                style="width: 200px; height: 200px"
              >
                <v-icon color="black" size="xxx-large">
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
import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import QrcodeVue from 'qrcode.vue'
import { DigitalCredentialTypes, Routes } from '@/enums'
import { AllowedActionsIF, DigitalCredentialIF, WalletConnectionIF } from '@/interfaces'
import { CommonMixin } from '@/mixins'
import { BusinessServices } from '@/services'
import { useBusinessStore } from '@/stores'
import CredentialsWebSocket from '@/components/DigitalCredentials/CredentialsWebSocket.vue'
import ConfirmCredentialsTermsOfUseDialog
  from '@/components/DigitalCredentials/dialogs/ConfirmCredentialsTermsofUseDialog.vue'
import ConfirmPreconditionDialog from '@/components/DigitalCredentials/dialogs/ConfirmPreconditionDialog.vue'
import CredentialNotReceivedDialog from '@/components/DigitalCredentials/dialogs/CredentialNotReceivedDialog.vue'
import CredentialsSimpleSteps from '@/components/DigitalCredentials/CredentialsSimpleSteps.vue'
import CredentialsDetailSteps from '@/components/DigitalCredentials/CredentialsDetailSteps.vue'

Component.registerHooks(['beforeRouteEnter'])

type PendingPreconditions = Record<string, { presented: boolean; confirmed: boolean | null }>;

// Create a component that extends the Vue class called CredentialsStepper
@Component({
  components: {
    QrcodeVue,
    CredentialsWebSocket,
    ConfirmCredentialsTermsOfUseDialog,
    ConfirmPreconditionDialog,
    CredentialNotReceivedDialog,
    CredentialsSimpleSteps,
    CredentialsDetailSteps
  }
})
export default class CredentialsStepper extends Mixins(CommonMixin) {
  @Getter(useBusinessStore) getAllowedActions!: AllowedActionsIF;

  loadingMessage = 'Loading';
  showLoadingContainer = true;
  showDetailSteps = false;
  confirmCredentialsTermsOfUseDialog = false;
  credentialNotReceivedDialog = false;
  credentialTypes = DigitalCredentialTypes;
  connection: WalletConnectionIF = null;
  issuedCredential: DigitalCredentialIF = null;
  pendingPreconditions: PendingPreconditions = {};

  get attestBusiness (): string {
    return this.getAllowedActions?.digitalBusinessCardPreconditions?.attestBusiness || ''
  }

  get attestName (): string {
    return this.getAllowedActions?.digitalBusinessCardPreconditions?.attestName || ''
  }

  get preconditions (): string[] {
    return this.getAllowedActions?.digitalBusinessCardPreconditions?.attestRoles || []
  }

  async beforeRouteEnter (to, from, next): Promise<void> {
    next(async (_this) => {
      const { data } = await BusinessServices.fetchCredentials(_this.getIdentifier)
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

  async hideConfirmPreconditionDialog (precondition: string, preconditionsConfirmed: boolean): Promise<void> {
    this.pendingPreconditions[precondition].confirmed = preconditionsConfirmed
  }

  async handleGenerateNewQRCode (): Promise<void> {
    this.showLoadingContainer = true
    await BusinessServices.removeCredentialConnection(this.getIdentifier, this.connection.connectionId)
    await this.setupConnection()
  }

  async handleNoCredentialOfferReceived (): Promise<void> {
    this.credentialNotReceivedDialog = true
  }

  async addOutOfBandInvitation (): Promise<void> {
    const { data: connection } = await BusinessServices.createCredentialOutOfBandInvitation(this.getIdentifier)
    this.connection = connection || null
  }

  async getConnection (): Promise<void> {
    const { data } = await BusinessServices.fetchCredentialConnections(this.getIdentifier)
    this.connection = data?.connections?.[0] || null
  }

  private needsAttestation (): boolean {
    const { isActive, lastAttested, isAttested } = this.connection
    return isActive && !lastAttested && !isAttested
  }

  private hasAttestation (): boolean {
    const { isActive, lastAttested, isAttested } = this.connection
    return isActive && lastAttested && isAttested
  }

  async attestConnection (): Promise<void> {
    await BusinessServices.attestCredentialConnection(this.getIdentifier, this.connection.connectionId)
  }

  async conditionalIssueCredential (): Promise<void> {
    if (this.preconditions.length) {
      await this.handlePreconditions()
      await this.issueCredential({
        selfAttestedRoles: this.preconditions.filter(
          (precondition) => this.pendingPreconditions[precondition].confirmed
        )
      })
    } else {
      await this.issueCredential()
    }
  }

  async handlePreconditions (): Promise<void> {
    this.pendingPreconditions = this.processPreconditions()
    for (const precondition in this.pendingPreconditions) {
      await this.showPreconditionDialog(precondition)
    }
  }

  private processPreconditions (): PendingPreconditions {
    return this.preconditions.reduce(
      (acc, precondition) => ({
        ...acc,
        [precondition]: {
          presented: false,
          confirmed: null
        }
      }),
      {} as PendingPreconditions
    )
  }

  async showPreconditionDialog (precondition: string): Promise<void> {
    await new Promise((resolve) => {
      const pendingPrecondition = this.pendingPreconditions[precondition]
      pendingPrecondition.presented = true
      const unwatch = this.$watch(
        () => pendingPrecondition.confirmed,
        (confirmed) => {
          if (confirmed !== null) {
            unwatch()
            resolve(pendingPrecondition.presented = false)
          }
        }
      )
    })
  }

  async issueCredential (preconditionsResolved?: { selfAttestedRoles: string[] }): Promise<void> {
    const { data: issuedCredential } = await BusinessServices.sendCredentialOffer(
      this.getIdentifier,
      this.credentialTypes.BUSINESS,
      preconditionsResolved
    )
    this.issuedCredential = issuedCredential || null
  }

  async handleConnection (connection: WalletConnectionIF) {
    this.connection = connection
    if (this.needsAttestation()) {
      await this.attestConnection()
    }
  }

  async handleAttestation (connection: WalletConnectionIF): Promise<void> {
    this.connection = connection
    if (this.hasAttestation()) {
      await this.conditionalIssueCredential()
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
    if (this.needsAttestation()) {
      await this.attestConnection()
    } else if (this.hasAttestation()) {
      await this.conditionalIssueCredential()
    }
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
    await BusinessServices.removeCredential(identifier, credentialId)
    this.issuedCredential = null
  }

  async removeConnection (identifier: string, connectionId: string): Promise<void> {
    await BusinessServices.removeCredentialConnection(identifier, connectionId)
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
