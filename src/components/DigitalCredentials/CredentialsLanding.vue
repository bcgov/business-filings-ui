<template>
  <section id="credentials-landing">
    <article id="digital-credentials-header">
      <v-card>
        <v-container>
          <v-row>
            <v-col>TODO: Add picture here</v-col>
            <v-col>
              <h1>Business Card Credentials</h1>
              <p class="mt-4">
                A digital credential is the digital equivalent of paper-based credential like a drivers license. It
                works as proof of qualification used to get services such as opening a bank account, or getting your
                business license.
              </p>
              <p>
                Use your business information to generate the Business Card Credential. You save digital credentials on
                your phone using a digital wallet app. When a service provider asks for a digital credential, you use
                the digital wallet app to show it.
              </p>
              <v-btn
                id="add-credential-btn"
                color="primary"
                class="mt-4 font-weight-bold pa-6"
                large
                @click="addCredentials()"
              >
                <span>Get your Business Card Credential</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </article>

    <!-- Credentials Table -->
    <article id="digital-credentials-table">
      <v-row no-gutters>
        <v-col
          cols="12"
          lg="11"
        >
          <CredentialsTable :issuedCredentials="issuedCredentials" />
        </v-col>
      </v-row>
    </article>
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
  addCredentials () { }
}
</script>
