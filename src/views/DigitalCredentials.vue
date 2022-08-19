<template>
  <v-container id="digital-credentials" class="mt-8">

    <!-- Digital Credentials Landing -->
    <CredentialsLanding v-if="isDigitalCredentialRoute" @addCredentials="addCredentials()" />

    <!-- Add Credentials -->
    <section v-else id="add-digital-credentials">

      <!-- Credentials Stepper -->
      <article id="digital-credentials-stepper">
        <v-row no-gutters>
          <v-col cols="12" lg="11">
            <Stepper :getSteps="getDigitalCredentialSteps"/>
          </v-col>
        </v-row>
      </article>

      <!-- Credentials component flow -->
      <article id="digital-credentials-component-view">
        <v-row no-gutters>
          <v-col cols="12" lg="11">
            <router-view />
          </v-col>
        </v-row>
      </article>
    </section>

  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { CredentialsLanding } from '@/components/DigitalCredentials'
import { Stepper } from '@/components/common'
import { Routes } from '@/enums'
import { StepsIF } from '@/interfaces'

@Component({
  components: {
    CredentialsLanding,
    Stepper
  }
})
export default class DigitalCredentials extends Vue {
  @Getter getDigitalCredentialSteps!: Array<StepsIF>

  private addCredentials (): void {
    this.$router.push({ path: `${Routes.DIGITAL_CREDENTIALS}/download-wallet` })
  }

  get isDigitalCredentialRoute (): boolean {
    return (this.$route.name === Routes.DIGITAL_CREDENTIALS)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
</style>
