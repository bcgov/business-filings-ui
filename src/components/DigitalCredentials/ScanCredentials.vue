<template>
  <section id="scan-credentials" class="py-8">

    <article id="choose-credentials-header">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <h3>Scan with Digital Wallet</h3>
          <p class="mt-4 font-14">Open the digital wallet app on your phone and scan the QR code below. If you chose to
            include both kinds of digital credentials, you can both credentials with the single QR code.</p>
        </v-col>
      </v-row>
    </article>

    <article v-if="hasBusinessCred || hasBusinessRelationshipCred" id="has-credentials-info">
      <v-card flat rounded class="pa-3">
        <v-card-text>
          <v-row no-gutters align="center">
            <!-- Successfully Generated QR Code -->
            <v-col cols="12" lg="3" class="px-2">
              <!-- Placeholder Url -->
              <QrcodeVue
                size="160"
                :value="appleUrl"
              />
            </v-col>

            <!-- Credential Type Indicators -->
            <v-col cols="12" lg="9">
              <!-- Business Credential Info -->
              <template v-if="hasBusinessCred">
                <v-row no-gutters>
                  <v-progress-circular
                    v-if="true"
                    indeterminate
                    color="primary"
                    class="my-0"
                    :size="25"
                    :width="3" />
                  <v-icon v-else color="success">mdi-check</v-icon>
                  <h4 class="pl-3">Business Digital Credential</h4>
                </v-row>
                <v-row no-gutters>
                  <p class="pt-2 pl-9">Successfully saved to your digital wallet app.</p>
                </v-row>
              </template>

              <!-- Business Relationship Credential Info -->
              <template v-if="hasBusinessRelationshipCred">
                <v-row no-gutters class="mt-8">
                  <v-progress-circular
                    v-if="true"
                    indeterminate
                    color="primary"
                    class="my-0"
                    :size="25"
                    :width="3" />
                  <v-icon v-else color="success">mdi-check</v-icon>
                  <h4 class="pl-3">Business Relationship Digital Credential</h4>
                </v-row>
                <v-row no-gutters>
                  <p class="pt-2 pl-9">Successfully saved to your digital wallet app.</p>
                </v-row>
              </template>

            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </article>

    <!-- Navigate back section when no selections made -->
    <article v-else id="no-credentials-msg" @click="back()">
      <v-card flat rounded class="pa-3">
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12">
              <span class="font-16">
                <v-icon class="pr-1" color="primary">mdi-arrow-left</v-icon>
                Please select a digital credential you wish to generate in the previous step.
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
import QrcodeVue from 'qrcode.vue'

@Component({
  components: {
    QrcodeVue
  }
})
export default class ScanCredentials extends Vue {
  @Prop({ default: false })
  readonly hasBusinessCred: boolean

  @Prop({ default: false })
  readonly hasBusinessRelationshipCred: boolean

  readonly appleUrl = 'https://apps.apple.com/us/app/trinsic-wallet/id1475160728'

  @Emit() back (): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
#scan-credentials {
  p, span {
    color: $gray9
  }
  #no-credentials-msg {
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
