<template>
  <div>
    <!-- Dialogs -->
    <ConfirmRevokeCredentialDialog
      :dialog="confirmRevokeCredentialDialog"
      attach="#app"
      @close="hideConfirmRevokeCredentialDialog"
      @proceed="revokeCredential(issuedCredential)"
    />

    <CredentialRevokedDialog
      :dialog="credentialRevokedDialog"
      attach="#app"
      @close="credentialRevokedDialog = false"
    />

    <RevokeCredentialErrorDialog
      :dialog="revokeCredentialErrorDialog"
      attach="#app"
      @close="revokeCredentialErrorDialog=false"
    />

    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <CredentialsTable
            v-if="issuedCredentials?.length"
            :issuedCredentials="issuedCredentials"
            @onPromptConfirmRevokeCredential="displayConfirmRevokeCredentialDialog"
          />
          <CredentialsLanding v-else />
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
import ConfirmRevokeCredentialDialog from '@/components/dialogs/ConfirmRevokeCredentialDialog.vue'
import CredentialRevokedDialog from '@/components/dialogs/CredentialRevokedDialog.vue'
import RevokeCredentialErrorDialog from '@/components/dialogs/RevokeCredentialErrorDialog.vue'

@Component({
  components: {
    CredentialsInfo,
    CredentialsLanding,
    CredentialsTable,
    ConfirmRevokeCredentialDialog,
    CredentialRevokedDialog,
    RevokeCredentialErrorDialog
  }
})
export default class CredentialsDashboard extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string;

  confirmRevokeCredentialDialog = false;
  credentialRevokedDialog = false;
  revokeCredentialErrorDialog = false;
  issuedCredential: DigitalCredentialIF = null;
  issuedCredentials: Array<DigitalCredentialIF> = [];

  async mounted (): Promise<void> {
    await this.getCredentials()
  }

  async getCredentials (): Promise<void> {
    const { data } = await LegalServices.fetchCredentials(this.getIdentifier)
    this.issuedCredentials = data?.issuedCredentials
  }

  displayConfirmRevokeCredentialDialog (issuedCredential: DigitalCredentialIF): void {
    this.issuedCredential = issuedCredential
    this.confirmRevokeCredentialDialog = true
  }

  hideConfirmRevokeCredentialDialog (): void {
    this.issuedCredential = null
    this.confirmRevokeCredentialDialog = false
  }

  async revokeCredential (issuedCredential: DigitalCredentialIF): Promise<void> {
    const revoked = await LegalServices.revokeCredential(this.getIdentifier, issuedCredential.credentialId)
      .finally(() => {
        this.hideConfirmRevokeCredentialDialog()
      })

    if (!revoked) {
      this.revokeCredentialErrorDialog = true
    } else {
      this.credentialRevokedDialog = true
      await this.getCredentials()
    }
  }
}
</script>
