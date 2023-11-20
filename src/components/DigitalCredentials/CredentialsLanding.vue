<template>
  <div id="credentials-landing">
    <v-card>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col
              class="d-flex align-center align-content-center"
              cols="12"
              sm="4"
              md="5"
            >
              <img
                width="100%"
                src="@/assets/images/business_card_feature.png"
                :alt="imageAltText"
              >
            </v-col>
            <v-col
              cols="12"
              sm="8"
              md="7"
            >
              <h1>Business Card Credentials</h1>
              <p class="mt-4">
                Use your business information to generate the Digital Business Card. You save digital credentials on
                your phone using the BC Wallet app. When a service provider asks for a digital credential, you use the
                BC Wallet app to show it.
              </p>
              <p>
                A digital credential is the digital equivalent of a paper-based credential like a driver's licence. It
                works as proof of qualification used to get services such as opening a bank account, or getting your
                business licence.
              </p>
              <div class="d-flex justify-center justify-sm-start">
                <v-btn
                  id="add-credential-btn"
                  color="primary"
                  class="mt-4 font-weight-bold pa-6"
                  large
                  @click="issueCredentials()"
                >
                  <span>Get your Digital Business Card
                    <v-icon>mdi-chevron-right</v-icon>
                  </span>
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
  imageAltText = 'Two mobile phones one behind the other. The top left one is showing your business card ' +
  'credential details, the bottom right one is showing your business card. Both are in the BC Wallet app.'

  issueCredentials (): void {
    this.$router.push({ name: Routes.ISSUE_CREDENTIAL })
  }
}
</script>
