<template>
  <section id="register-wallet" class="py-8">

    <article id="register-wallet-header">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <h3>Register Digital Wallet</h3>
          <p class="mt-4 font-14">Register the digital wallet on your phone with this business by scanning the QR code
            below with the digital wallet app.</p>
        </v-col>
      </v-row>
    </article>

    <article v-if="!hasRegisteredWallet">
      <v-card flat rounded class="pa-3 mt-3">
        <v-card-text>
          <v-row no-gutters>
            <!-- Successfully Generated QR Code -->
            <v-col cols="12" lg="3" class="px-2">
              <!-- Placeholder Url -->
              <QrcodeVue
                size="160"
                :value="credentialInvitationUrl"
              />
            </v-col>

            <v-col cols="12" lg="9">
              <p>Open the digital wallet app on your phone and scan this QR code to register the wallet with this
                business. When you're done, proceed to the next step.</p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </article>

    <article v-else class="text-center">
      <v-card flat rounded class="pa-3 mt-3">
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12">
              <v-icon color="success" x-large>mdi-check-circle</v-icon>
            </v-col>
            <v-col cols="12" class="mt-2">
              <span>Successfully Registered Wallet</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </article>

  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import QrcodeVue from 'qrcode.vue'

@Component({
  components: {
    QrcodeVue
  }
})
export default class RegisterWallet extends Vue {
  @Prop({ default: false })
  readonly credentialInvitationUrl: boolean

  @Prop({ default: false })
  readonly hasRegisteredWallet: boolean
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
#register-wallet {
  p, span {
    color: $gray9
  }
}
</style>
