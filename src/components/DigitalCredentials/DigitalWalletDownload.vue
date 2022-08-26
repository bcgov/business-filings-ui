<template>
  <section id="digital-wallet-download" class="py-8">

    <article id="digital-wallet-header">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <h3>Download Digital Wallet</h3>
          <p class="mt-4 font-14">Digital Wallets are apps you download on your phone to securely store your digital
            credentials. Below are download links to currently supported digital wallets. You can have multiple digital
            wallets on your phone. If you already have one of these wallet apps on your phone, continue to next step:
            Choose Digital Credentials.</p>
        </v-col>
      </v-row>

      <!-- Important Message: Unsupported wallets -->
      <ImportantMessage
        :message="'Wallet app by Google and Apple Wallet are not currently supported.'"
      />
    </article>

    <article id="wallet-download">
      <v-row no-gutters>
        <v-col cols="12">
          <h3 class="py-8">Download Trinsic Wallet on your phone</h3>

          <v-card flat class="pa-3">
            <v-card-text>
              <!-- Download Steps -->
              <v-row no-gutters>
                <v-col>
                  <p class="font-16">Trinsic is a digital wallet app that is compatible with BC Gov production and proof
                    of concept applications.</p>
                </v-col>
              </v-row>
              <v-row no-gutters class="pt-3">
                <v-col cols="12" lg="9">
                  <p>1.  Scan the QR code on your phone or select the appropriate app store icon below for your phone.
                    Depending on your phone model, you may need to
                    <v-tooltip top content-class="top-tooltip" transition="fade-transition">
                      <template v-slot:activator="{ on }">
                        <span v-on="on" class="dotted-underline">download a QR scanner app</span>
                      </template>
                      Newer smartphones can use the camera app to scan QR codes. Older smartphones need a separate app
                      to scan QR codes.
                    </v-tooltip>
                    to scan the QR code.
                  </p>

                  <!-- App Store Downloads -->
                  <v-row no-gutters class="my-3">
                    <v-col cols="6" lg="3" class="ml-n6">
                      <a href="https://apps.apple.com/" target="_blank" rel="noopener">
                        <v-img
                          contain
                          height="44"
                          class="app-download-image"
                          src="@/assets/images/appleDownload.png"
                          alt="App Store"
                        />
                      </a>
                    </v-col>
                    <v-col cols="6" lg="3" class="ml-n6">
                      <a href="https://play.google.com/store/" target="_blank" rel="noopener">
                        <v-img
                          contain
                          height="44"
                          class="app-download-image"
                          src="@/assets/images/googleDownload.png"
                          alt="Google Play"
                        />
                      </a>
                    </v-col>
                  </v-row>

                  <p>2. Open the Trinsic Wallet and tap on the menu icon on the top left corner.</p>
                  <p>3. Tap on Network and select "Sovrin Staging"</p>
                </v-col>

                <!-- Download Wallet QR Code -->
                <v-col cols="12" lg="3">
                  <QrcodeVue
                    class="float-lg-right"
                    size="160"
                    :value="appleUrl"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </article>

  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ImportantMessage } from '@/components/common'
import QrcodeVue from 'qrcode.vue'

@Component({
  components: {
    ImportantMessage,
    QrcodeVue
  }
})
export default class DigitalWalletDownload extends Vue {
  // Further design required in order to display both QR codes
  readonly appleUrl = 'https://apps.apple.com/us/app/trinsic-wallet/id1475160728'
  readonly googleUrl = 'https://play.google.com/store/apps/details?id=id.streetcred.apps.mobile&hl=en_US'
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
#digital-wallet-download {
  p {
    color: $gray9;
  }
  .app-download-image {
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
