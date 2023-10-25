<template>
  <div id="credentials-info">
    <v-card>
      <v-card-title class="font-weight-bold word-break-normal">
        Where to use your Business Card
      </v-card-title>
      <v-card-text>
        <p>
          In the near future you will be able to use your business card credeptial to obtain a business licence,
          a business bank account and business permits. You can also get access to services like the forest client
          application.
        </p>
        <a
          class="text-decoration-none mt-2"
          href=""
          target="_blank"
        >Sign up to be part of the business licence credential
          pilot </a>
      </v-card-text>
    </v-card>
    <v-card class="mt-3">
      <v-card-title class="font-weight-bold word-break-normal">
        How to use your Business Card
      </v-card-title>
      <v-card-text>
        <p>
          Websites will request proof of your Business Card. To show proof of your Business Card, scan the QR
          code with your BC wallet and accept the request for proof.
        </p>
        <a
          class="text-decoration-none mt-2"
          href=""
          target="_blank"
        > View step by step instructions </a>
      </v-card-text>
    </v-card>
    <v-card class="mt-3">
      <v-card-title class="font-weight-bold word-break-normal">
        Need more help?
      </v-card-title>
      <v-card-text>
        <a
          class="text-decoration-none"
          href=""
          target="_blank"
        >Find solutions</a> to common issues people experience or
        contact us at
        <a
          class="text-decoration-none"
          href="mailto:BCRegistries@gov.bc.ca"
        >BCRegistries@gov.bc.ca</a>.
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CredentialsInfo extends Vue { }
</script>
