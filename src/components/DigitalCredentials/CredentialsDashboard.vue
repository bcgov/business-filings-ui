<template>
  <div id="credentials-dashboard">
    <!-- Dialogs -->
    <ConfirmRevokeCredentialDialog
      :dialog="confirmRevokeCredentialDialog"
      attach="#app"
      @close="hideConfirmRevokeCredentialDialog()"
      @proceed="revokeCredential()"
    />

    <ConfirmReplaceCredentialDialog
      :dialog="confirmReplaceCredentialDialog"
      attach="#app"
      @close="hideConfirmReplaceCredentialDialog()"
      @proceed="replaceCredential()"
    />

    <CredentialRevokedDialog
      :dialog="credentialRevokedDialog"
      attach="#app"
      @close="credentialRevokedDialog = false"
    />

    <RevokeCredentialErrorDialog
      :dialog="revokeCredentialErrorDialog"
      attach="#app"
      @close="revokeCredentialErrorDialog = false"
    />

    <ReplaceCredentialErrorDialog
      :dialog="replaceCredentialErrorDialog"
      attach="#app"
      @close="replaceCredentialErrorDialog = false"
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
      <CredentialsTable
        v-if="issuedCredentials?.length"
        :issuedCredentials="issuedCredentials"
        @onPromptConfirmRevokeCredential="displayConfirmRevokeCredentialDialog($event)"
        @onPromptConfirmReplaceCredential="displayConfirmReplaceCredentialDialog($event)"
      />
      <v-row v-else>
        <v-col
          cols="12"
          md="8"
        >
          <CredentialsLanding />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <CredentialsInfo />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { useBusinessStore } from '@/stores'
import { Getter } from 'pinia-class'
import { DigitalCredentialIF } from '@/interfaces'
import { LegalServices } from '@/services'
import CredentialsInfo from '@/components/DigitalCredentials/CredentialsInfo.vue'
import CredentialsLanding from '@/components/DigitalCredentials/CredentialsLanding.vue'
import CredentialsTable from '@/components/DigitalCredentials/CredentialsTable.vue'
import ConfirmReplaceCredentialDialog from '@/components/DigitalCredentials/dialogs/ConfirmReplaceCredentialDialog.vue'
import ConfirmRevokeCredentialDialog from '@/components/DigitalCredentials/dialogs/ConfirmRevokeCredentialDialog.vue'
import CredentialRevokedDialog from '@/components/DigitalCredentials/dialogs/CredentialRevokedDialog.vue'
import ReplaceCredentialErrorDialog from '@/components/DigitalCredentials/dialogs/ReplaceCredentialErrorDialog.vue'
import RevokeCredentialErrorDialog from '@/components/DigitalCredentials/dialogs/RevokeCredentialErrorDialog.vue'
import { Routes } from '@/enums'

@Component({
  components: {
    CredentialsInfo,
    CredentialsLanding,
    CredentialsTable,
    ConfirmRevokeCredentialDialog,
    ConfirmReplaceCredentialDialog,
    CredentialRevokedDialog,
    ReplaceCredentialErrorDialog,
    RevokeCredentialErrorDialog
  }
})
export default class CredentialsDashboard extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string

  loadingMessage = 'Loading'
  showLoadingContainer = true
  confirmRevokeCredentialDialog = false
  confirmReplaceCredentialDialog = false
  credentialRevokedDialog = false
  replaceCredentialErrorDialog = false
  revokeCredentialErrorDialog = false
  issuedCredential: DigitalCredentialIF = null
  issuedCredentials: Array<DigitalCredentialIF> = []

  async mounted (): Promise<void> {
    await this.getCredentials().catch(() => {}) // ignore errors
    this.showLoadingContainer = false
  }

  async getCredentials (): Promise<void> {
    const { data } = await LegalServices.fetchCredentials(this.getIdentifier)
    this.issuedCredentials = data?.issuedCredentials || []
  }

  displayConfirmRevokeCredentialDialog (issuedCredential: DigitalCredentialIF): void {
    this.issuedCredential = issuedCredential
    this.confirmRevokeCredentialDialog = true
  }

  hideConfirmRevokeCredentialDialog (): void {
    this.issuedCredential = null
    this.confirmRevokeCredentialDialog = false
  }

  displayConfirmReplaceCredentialDialog (issuedCredential: DigitalCredentialIF): void {
    this.issuedCredential = issuedCredential
    this.confirmReplaceCredentialDialog = true
  }

  hideConfirmReplaceCredentialDialog (): void {
    this.issuedCredential = null
    this.confirmReplaceCredentialDialog = false
  }

  async revokeCredential (): Promise<void> {
    this.showLoadingContainer = true
    let revokeCredential = this.issuedCredential.isRevoked ? {} : null
    if (this.issuedCredential.isIssued && !this.issuedCredential.isRevoked) {
      revokeCredential = await LegalServices.revokeCredential(this.getIdentifier, this.issuedCredential.credentialId)
    }

    this.hideConfirmRevokeCredentialDialog()
    if (!revokeCredential) {
      this.revokeCredentialErrorDialog = true
    } else {
      this.credentialRevokedDialog = true
      await this.getCredentials().catch(() => {}) // ignore errors
    }
    this.showLoadingContainer = false
  }

  async replaceCredential (): Promise<void> {
    this.showLoadingContainer = true
    let revokedCredential = !this.issuedCredential.isIssued || this.issuedCredential.isRevoked ? {} : null
    if (this.issuedCredential.isIssued && !this.issuedCredential.isRevoked) {
      revokedCredential =
        await LegalServices.revokeCredential(this.getIdentifier, this.issuedCredential.credentialId, true)
    }
    const removedCredential =
      await LegalServices.removeCredential(this.getIdentifier, this.issuedCredential.credentialId)
    const removedConnection =
      await LegalServices.removeActiveCredentialConnection(this.getIdentifier)

    this.hideConfirmReplaceCredentialDialog()
    if (!(revokedCredential && removedCredential && removedConnection)) {
      this.replaceCredentialErrorDialog = true
    } else {
      this.$router.push({ name: Routes.ISSUE_CREDENTIAL })
    }
    this.showLoadingContainer = false
  }
}
</script>

<style lang="scss">
.loading-container {
  z-index: 1;
}
</style>
