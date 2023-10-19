<template>
  <div>
    <h1 class="mb-4">
      My Credential Dashboard
    </h1>

    <header class="credentials-table-header">
      <label class="font-weight-bold pl-2">Your Digital Credentials</label>
    </header>

    <v-card flat>
      <v-data-table
        id="credential-records-table"
        fixed
        disable-sort
        hide-default-footer
        :items="issuedCredentials"
        :headers="credentialsTableHeaders"
        no-data-text="All digital credentials associated with this business will appear here."
      >
        <template #[`item.credentialType`]="{ item }">
          {{ formatCredentialType(item.credentialType) }}
        </template>
        <template #[`item.isIssued`]="{ item }">
          {{ item.isRevoked ? "Revoked" : item.isIssued ? "Issued" : "Pending" }}
        </template>
        <template #[`item.dateOfIssue`]="{ item }">
          {{ apiToPacificDate(item.dateOfIssue) || "-" }}
        </template>
        <template #[`item.action`]="{ item }">
          <CredentialsMenu
            :issuedCredential="item"
            @onConfirmRevokeCredential="promptConfirmRevokeCredential"
            @onConfirmReplaceCredential="promptConfirmReplaceCredential"
          />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Emit } from 'vue-property-decorator'
import { DigitalCredentialIF, TableHeaderIF } from '@/interfaces'
import { DigitalCredentialTypes } from '@/enums'
import { DateMixin } from '@/mixins'
import CredentialsMenu from '@/components/DigitalCredentials/CredentialsMenu.vue'

@Component({
  components: {
    CredentialsMenu
  }
})
export default class CredentialsTable extends Mixins(DateMixin) {
  @Prop({ default: () => [] }) readonly issuedCredentials!: Array<DigitalCredentialIF>;

  get credentialsTableHeaders (): Array<TableHeaderIF> {
    // Do not display headers if there is table data
    if (this.issuedCredentials.length === 0) return []
    return [
      {
        class: 'column-lg',
        text: 'Business Name',
        value: 'legalName'
      },
      {
        class: 'column-lg',
        text: 'Type',
        value: 'credentialType'
      },
      {
        class: 'column-lg',
        text: 'Status',
        value: 'isIssued'
      },
      {
        class: 'column-lg',
        text: 'Date of Issue',
        value: 'dateOfIssue'
      },
      {
        class: 'column-lg',
        text: '',
        value: 'action'
      }
    ]
  }

  formatCredentialType (credentialType: DigitalCredentialTypes): string {
    // Safety check
    if (!credentialType) {
      return 'Unknown'
    }
    return credentialType.charAt(0).toUpperCase() + credentialType.slice(1) + ' Credential'
  }

  /** Emits an event to prompt confirmation to revoke credential. */
  @Emit('onPromptConfirmRevokeCredential')
  promptConfirmRevokeCredential (issuedCredential: DigitalCredentialIF): DigitalCredentialIF {
    return issuedCredential
  }

  /** Emits an event to prompt confirmation to replace credential. */
  @Emit('onPromptConfirmReplaceCredential')
  promptConfirmReplaceCredential (issuedCredential: DigitalCredentialIF): DigitalCredentialIF {
    return issuedCredential
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.credentials-table-header {
  background-color: $BCgovBlue5O;
  padding: 1.25rem;
  color: $gray9;
}

// Vuetify overrides for Table Headers and Cells
:deep() {
  .v-data-table>.v-data-table__wrapper>table>thead>tr>th,
  td {
    color: $gray7;
    font-size: 0.875rem;
  }

  .column-lg {
    width: 15rem !important;
  }
}
</style>
