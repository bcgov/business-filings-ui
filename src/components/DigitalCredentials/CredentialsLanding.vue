<template>
  <div>
    <v-card>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col class="d-flex align-center">
              <v-img src="/src/assets/images/digital_credentials.svg" />
              <!-- FIXME: Path aliases don't seem to be working -->
              <!-- <v-img
                        src="@/assets/images/digital_credentials.svg"
                      /> -->
            </v-col>
            <v-col>
              <h1 class="mb-4">
                Business Card Credentials
              </h1>
              <p>
                A digital credential is the digital equivalent of paper-based credential like a drivers license.
                It works as proof of qualification used to get services such as opening a bank account, or
                getting your business license.
              </p>
              <p>
                Use your business information to generate the Business Card Credential. You save digital
                credentials on your phone using a digital wallet app. When a service provider asks for a digital
                credential, you use the digital wallet app to show it.
              </p>
              <div class="d-flex justify-center justify-sm-start">
                <v-btn id="add-credential-btn" color="primary" class="mt-4 font-weight-bold pa-6" large
                  @click="issueCredentials()">
                  <span>Get your Business Card Credential</span>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ImportantMessage } from '@/components/common'
import { Routes } from '@/enums'
import CredentialsTable from '@/components/DigitalCredentials/CredentialsTable.vue'

@Component({
  components: {
    CredentialsTable,
    ImportantMessage
  }
})
export default class CredentialsLanding extends Vue {
  issueCredentials(): void {
    this.$router.push({ name: Routes.ISSUE_CREDENTIAL })
  }
}
</script>
