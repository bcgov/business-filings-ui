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
        <CredentialsTermsOfUse />
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
import CredentialsTermsOfUse from '@/components/DigitalCredentials/CredentialsTermsOfUse.vue'

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

// Vuetify overrides
:deep(.v-dialog .v-card .v-card__text) {
  padding-top: 0 !important;
}
</style>
