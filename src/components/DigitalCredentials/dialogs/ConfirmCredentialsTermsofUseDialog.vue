<template>
  <v-dialog
    id="confirm-credentials-terms-of-use-dialog"
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="confirm-credentials-terms-of-use-dialog"
  >
    <v-card class="pa-5">
      <v-card-text>
        <p
          id="dialog-title"
          class="warning-title"
        />
        <p
          id="dialog-text"
          class="warning-text"
        >
          <CredentialsTermsOfUse />
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
            Agree to Terms
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import CredentialsTermsOfUse from './CredentialsTermsOfUse.vue'

  @Component({
    components: {
      CredentialsTermsOfUse
    }
  })
export default class ConfirmCredentialsTermsOfUseDialog extends Vue {
    /** Prop to display the dialog. */
    @Prop({ default: false }) readonly dialog!: boolean

    /** Prop to provide attachment selector. */
    @Prop({ default: '' }) readonly attach!: string

    // Pass click events to parent.
    @Emit() close (): void {
      return undefined
    }
    @Emit() proceed (): void {
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
