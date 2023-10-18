<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="confirm-revoke-credential-dialog"
  >
    <v-card class="pa-5">
      <v-card-subtitle
        class="pt-5"
        align="center"
      >
        <v-icon
          color="error"
          large
        >
          mdi-information-outline
        </v-icon>
        <v-btn
          small
          text
          color="primary"
          class="close-btn"
          @click="close()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-subtitle>

      <v-card-text>
        <p
          id="dialog-title"
          class="warning-title"
        >
          Are you sure?
        </p>
        <p
          id="dialog-text"
          class="warning-text"
        >
          This will revoke the credential from a BC Wallet. It cannot be reversed. Do you still want to continue?
        </p>
      </v-card-text>

      <v-card-actions>
        <v-row
          no-gutters
          justify="center"
        >
          <v-btn
            id="dialog-close-button"
            class="mr-4 action-btn"
            color="primary"
            outlined
            @click="close()"
          >
            <span>Cancel</span>
          </v-btn>
          <v-btn
            id="dialog-proceed-button"
            class="action-btn"
            color="primary"
            @click="proceed()"
          >
            Continue with Credential Revocation
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component({})
export default class ConfirmRevokeCredentialDialog extends Vue {
    /** Prop to display the dialog. */
    @Prop({ default: false }) readonly dialog!: boolean

    /** Prop to provide attachment selector. */
    @Prop({ default: '' }) readonly attach!: string

    // Pass click events to parent.
    @Emit() close () { }
    @Emit() proceed () { }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.close-btn {
    position: absolute;
    right: 2rem;
}

.action-btn {
    min-height: 44px;
}

.warning-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: $gray9;
    text-align: center;
    line-height: 2.125rem;
}

.warning-text {
    font-weight: normal;
    font-size: $px-16;
    color: $gray7;
    line-height: 1.5rem;
}

// Vuetify overrides
:deep(.v-dialog .v-card .v-card__text) {
    padding-top: 0 !important;
}
</style>
