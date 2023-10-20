<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="credential-revoked-dialog"
  >
    <v-card>
      <v-card-subtitle
        class="pt-5"
        align="center"
      />

      <v-card-text>
        <p
          id="dialog-title"
          class="warning-title"
        >
          The credential has now been revoked.
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
            Go Back to My Credentials
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component({})
export default class CredentialRevokedDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click events to parent.
  @Emit() close (): void {
    return undefined
  }
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
