<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <CredentialsTable
          v-if="issuedCredentials?.length"
          :issuedCredentials="issuedCredentials"
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

@Component({
  components: {
    CredentialsInfo,
    CredentialsLanding,
    CredentialsTable
  }
})
export default class CredentialsDashboard extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string;

  issuedCredentials: Array<DigitalCredentialIF> = [];

  async mounted (): Promise<void> {
    await this.getCredentials()
  }

  async getCredentials (): Promise<void> {
    const { data } = await LegalServices.fetchCredentials(this.getIdentifier)
    this.issuedCredentials = data?.issuedCredentials
  }
}
</script>
