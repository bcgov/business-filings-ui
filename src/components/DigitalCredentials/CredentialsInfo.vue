<template>
  <div id="credentials-info">
    <v-card>
      <v-card-title class="font-weight-bold word-break-normal">
        Where to use your Business Card
      </v-card-title>
      <v-card-text>
        <p>
          At present there are no places to use your Digital Business Card. In the near future you will be able to use
          your business card credential to obtain a business licence, a business bank account, business permits,
          and access services.
        </p>
      </v-card-text>
    </v-card>
    <v-card class="mt-3">
      <v-card-title class="font-weight-bold word-break-normal">
        How to use digital credentials
      </v-card-title>
      <v-card-text>
        <p>
          Websites will request proof of your Digital Business Card.
          Try the <a
            href="https://digital.gov.bc.ca/digital-trust/showcase"
            target="_blank"
          >BC Wallet Showcase<v-icon
            color="primary"
            small
          >mdi-open-in-new</v-icon></a> to learn more.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CredentialsInfo extends Vue { }
</script>
