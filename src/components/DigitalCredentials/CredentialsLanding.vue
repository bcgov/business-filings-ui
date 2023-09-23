<template>
  <section id="credentials-landing">
    <article id="digital-credentials-header">
      <v-container>
        <v-row>
          <v-col>
            <v-card>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col class="d-flex align-center">
                      <v-img
                        src="/src/assets/images/digital_credentials.svg"
                      />
                      <!-- FIXME: Path aliases don't seem to be working -->
                      <!-- <v-img
                        src="@/assets/images/digital_credentials.svg"
                      /> -->
                    </v-col>
                    <v-col>
                      <h1>Business Card Credentials</h1>
                      <p class="mt-4">
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
                        <v-btn
                          id="add-credential-btn"
                          color="primary"
                          class="mt-4 font-weight-bold pa-6"
                          large
                          @click="addCredentials()"
                        >
                          <span>Get your Business Card Credential</span>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <v-card class="mb-3">
              <v-card-title
                class="font-weight-bold word-wrap"
              >
                Where to use your Business Card
              </v-card-title>
              <v-card-text>
                <p class="mb-2">
                  In the near future you will be able to use your business card credeptial to obtain a business licence,
                  business bank account, business permits. You can also get access to services like the forest client
                  application.
                </p>
                <a
                  class="text-decoration-none"
                  href=""
                  target="_blank"
                >Signup to be part of the business licence credential pilot </a>
              </v-card-text>
            </v-card>
            <v-card class="mb-3">
              <v-card-title class="font-weight-bold word-wrap">
                How to use your Business Card
              </v-card-title>
              <v-card-text>
                <p class="mb-2">
                  Websites will request proof of your Business Card. To show proof of your Business Card, scan the QR
                  code with your BC wallet and accept the request for proof.
                </p>
                <a
                  class="text-decoration-none"

                  href=""
                  target="_blank"
                > View step by step instructions </a>
              </v-card-text>
            </v-card>
            <v-card class="mb-3">
              <v-container>
                <v-card-title class="font-weight-bold word-wrap">
                  Need more help?
                </v-card-title>
                <v-card-text>
                  <a
                    class="text-decoration-none"

                    href=""
                    target="_blank"
                  >Find solutions</a> to common issues people experience or contact us at
                  <a
                    class="text-decoration-none"
                    href="mailto:BCRegistries@gov.bc.ca"
                  >BCRegistries@gov.bc.ca</a>.
                </v-card-text>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </article>

    <!-- Credentials Table -->
    <!-- <article id="digital-credentials-table">
      <v-row no-gutters>
        <v-col
          cols="12"
          lg="11"
        >
          <CredentialsTable :issuedCredentials="issuedCredentials" />
        </v-col>
      </v-row>
    </article> -->
  </section>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import CredentialsTable from '@/components/DigitalCredentials/CredentialsTable.vue'
import { ImportantMessage } from '@/components/common'
import { DigitalCredentialsIF } from '@/interfaces'

@Component({
  components: {
    CredentialsTable,
    ImportantMessage
  }
})
export default class CredentialsLanding extends Vue {
  @Prop({ default: () => [] }) readonly issuedCredentials!: Array<DigitalCredentialsIF>;

  // Pass add event to parent.
  @Emit('addCredentials')
  addCredentials () {}
}
</script>

<style scoped lang="scss">
  .word-wrap {
    word-break: normal;
  }
</style>
