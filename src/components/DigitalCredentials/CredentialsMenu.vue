<template>
  <v-menu
    id="credentials-menu"
    v-model="expand"
    offset-y
    transition="slide-y-transition"
  >
    <template #activator="{ on }">
      <v-btn
        small
        text
        color="primary"
        class="menu-btn"
        v-on="on"
      >
        <span class="font-13 ml-1">Credential Options</span>
        <v-icon
          v-if="expand"
          medium
        >
          mdi-menu-up
        </v-icon>
        <v-icon
          v-else
          medium
        >
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item-group color="primary">
        <v-list-item
          :disabled="issuedCredential.isDeleted"
          @click="handleConfirmReplaceCredential()"
        >
          <v-list-item-title>
            <span class="app-blue">Replace Credential</span>
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          :disabled="!issuedCredential.isIssued || issuedCredential.isRevoked"
          @click="handleConfirmRevokeCredential()"
        >
          <v-list-item-title>
            <span class="app-blue">Revoke Credential</span>
          </v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { DigitalCredentialIF } from '@/interfaces'
import { Component, Vue, Emit, Prop } from 'vue-property-decorator'

@Component
export default class CredentialsMenu extends Vue {
  @Prop({ default: () => null }) issuedCredential!: DigitalCredentialIF

  expand = false

  /** Emits an event to confirm revoke credential. */
  @Emit('onConfirmRevokeCredential')
  handleConfirmRevokeCredential (): DigitalCredentialIF {
    return this.issuedCredential
  }

  /** Emits an event to confirm replace credential. */
  @Emit('onConfirmReplaceCredential')
  handleConfirmReplaceCredential (): DigitalCredentialIF {
    return this.issuedCredential
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

:deep(.theme--light.v-list-item--disabled) {
  opacity: 0.38 !important;
}
</style>
