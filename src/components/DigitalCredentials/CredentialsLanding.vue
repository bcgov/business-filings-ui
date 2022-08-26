<template>
  <!-- Digital Credentials Landing -->
  <section id="credentials-landing">

    <!-- Credentials Header -->
    <article id="digital-credentials-header">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <h1>Business Digital Credentials</h1>
          <p class="mt-4">A digital credential is the digital equivalent of paper-based credential like a driver's
            license. It works as proof of qualification used to get services such as opening a bank account. Use your
            business information to generate the digital credentials. You save digital credentials on your phone using
            a digital wallet app. When a service provider asks for a digital credential, you use the digital wallet
            app to show it.</p>
        </v-col>
      </v-row>
    </article>

    <!-- Add Credentials -->
    <article id="add-digital-credentials">
      <v-row no-gutters>
        <v-col cols="12" lg="11">

          <!-- Important Message: To verify BCSC -->
          <ImportantMessage
            :message="'You must be logged in with BC Services Card to generate a Business Digital Credentials.'"
          />

          <v-btn
            id="add-credential-btn"
            color="primary"
            class="mt-4 font-weight-bold pa-6" large
            @click="addCredentials()"
          >
            <span>Generate a Business Digital Credential</span>
          </v-btn>
        </v-col>
      </v-row>
    </article>

    <!-- Credentials Table -->
    <article id="digital-credentials-table">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <CredentialsTable />
        </v-col>
      </v-row>
    </article>
  </section>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator'
import CredentialsTable from '@/components/DigitalCredentials/CredentialsTable.vue'
import { ImportantMessage } from '@/components/common'

@Component({
  components: {
    CredentialsTable,
    ImportantMessage
  }
})
export default class CredentialsLanding extends Vue {
  // Pass add event to parent.
  @Emit('addCredentials')
  private addCredentials () {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
</style>
