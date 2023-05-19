<template>
  <section id="issue-credentials">

    <article id="issue-credentials-header">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <h3>Issue Credential to Digital Wallet</h3>
          <p class="mt-4 font-14">
            <span v-if="hasRegisteredWallet">
              Issue the business credentials to the registered digital wallet. You can choose to issue two kinds of
              Digital Credentials. Having both credentials will help with accessing services quicker. Credentials are
              issued by sending Credential Offers to the digital wallet app. Once the Credential Offers are sent, the
              digital wallet app on your phone will ask you to claim the Credential Offers. When the Credential Offers
              are claimed, the credential is stored on the app.
            </span>
            <span v-else>
              There are no digital wallets registered with this business. Please go back to the previous step and
              register a digital wallet.
            </span>
          </p>
        </v-col>
      </v-row>
    </article>

    <article v-if="hasRegisteredWallet">
      <v-row no-gutters>
        <v-col cols="12" lg="12">
          <v-card flat rounded class="px-2 mt-3">
            <v-card-text class="px-6 py-8">

              <!-- Credential Offer -->
              <v-row no-gutters>
                <v-col cols="12" lg="8" class="ma-auto">
                  <h4>Business Digital Credential</h4>
                </v-col>
                <v-col cols="12" lg="4" class="pr-2">
                  <v-btn
                    v-if="issuedCredentials.length === 0"
                    id="next-btn"
                    large color="primary"
                    class="font-weight-bold px-6 float-right"
                    :loading="isSendingOffer"
                    @click="sendCredentialOffer(DigitalCredentialTypes.BUSINESS)"
                  >Send Credential Offer</v-btn>

                  <div v-else-if="isPendingAcceptedOffer">
                    <v-icon class="pr-2 alert-text">mdi-wallet</v-icon>
                    <span class="font-weight-bold alert-text">Check Digital Wallet for Offer</span>
                  </div>

                  <div v-else>
                    <v-icon color="success" class="pr-2">mdi-check</v-icon>
                    <span class="success-text font-weight-bold">Credential Successfully Stored</span>
                  </div>
                </v-col>
              </v-row>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </article>

    <!-- Navigate back section when no selections made -->
    <article v-else id="no-credentials-msg" @click="back()">
      <v-card flat rounded class="pa-3">
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12">
              <span class="font-16">
                <v-icon class="pr-1" color="primary">mdi-arrow-left</v-icon>
                Go back to the previous step to register a digital wallet with this business.
              </span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </article>
  </section>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { DigitalCredentialTypes } from '@/enums'
import { DigitalCredentialsIF } from '@/interfaces'

@Component({})
export default class IssueCredentials extends Vue {
  @Prop({ default: false }) readonly hasRegisteredWallet!: boolean

  @Prop({ default: false }) readonly issuedCredentials!: Array<DigitalCredentialsIF>

  readonly DigitalCredentialTypes = DigitalCredentialTypes
  isSendingOffer = false

  get isPendingAcceptedOffer (): boolean {
    return !this.issuedCredentials[0]?.isIssued
  }

  @Emit() back (): void {}

  @Emit('sendCredentialOffer')
  sendCredentialOffer (credentialType: DigitalCredentialTypes) {
    this.isSendingOffer = true
    return credentialType
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#issue-credentials {
  p, span, i {
    color: $gray9;
  }
  #no-credentials-msg {
    &:hover {
      cursor: pointer;
    }
  }
  .alert-text {
    color: $app-alert;
  }
  .success-text {
    color: $app-green;
  }
}
</style>
