<template>
  <v-dialog
    id="credential-not-received-dialog"
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="credential-not-received-dialog"
  >
    <v-card class="pa-5">
      <v-card-text>
        <p
          id="dialog-title"
          class="warning-title"
        >
          Didn't receive a credential offer?
        </p>
        <p
          id="dialog-text"
          class="warning-text"
        >
          Credential offers can take up to a minute, depending on your internet connection. Try the following:
          <ul>
            <li>
              <p>Check your internet connection</p>
            </li>
            <li>
              <p>Try using your mobile data if available</p>
            </li>
            <li>
              <p>Close the wallet on your phone and open it again</p>
            </li>
            <li>
              <p>
                <a
                  href="#"
                  @click.prevent="handleResendOffer()"
                >Send another credential offer</a>
              </p>
            </li>
            <li>
              <p>
                <a
                  href="#"
                  @click.prevent="handleResetOffer()"
                >Refresh the page</a> and scan the QR code again
              </p>
            </li>
          </ul>
        </p>
      </v-card-text>

      <v-card-actions>
        <v-row
          no-gutters
          justify="center"
        >
          <v-btn
            id="dialog-close-button"
            class="action-btn"
            color="primary"
            @click="close()"
          >
            Got it
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component({})
export default class CredentialNotReceivedDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click events to parent.
  @Emit() close (): void {
    return undefined
  }

  @Emit('onResendOffer')
  handleResendOffer (): void {
    return undefined
  }

  @Emit('onResetOffer')
  handleResetOffer (): void {
    return undefined
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.close-btn {
  position: absolute;
  right: $px-32;
}

.action-btn {
  min-height: 44px;
}

.warning-title {
  font-size: $px-24;
  font-weight: bold;
  color: $gray9;
  text-align: center;
  line-height: $px-34;
}

.warning-text {
  font-weight: normal;
  font-size: $px-16;
  color: $gray7;
  line-height: $px-24;
}

// Vuetify overrides
:deep(.v-dialog .v-card .v-card__text) {
  padding-top: 0 !important;
}
</style>
