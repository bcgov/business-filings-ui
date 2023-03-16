<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="confirm-dissolution-dialog">
    <v-card class="pa-5">
      <v-card-subtitle class="pt-5" align="center">
        <v-icon color="error" large>mdi-information-outline</v-icon>
        <v-btn small text color="primary" class="close-btn" @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-subtitle>

      <v-card-text>
        <p class="warning-title" id="dialog-title">
          {{getModalTitle}}
        </p>
        <p class="warning-text" id="dialog-text">
          You are about to {{ dissolutionType }} <strong>{{ getLegalName || 'this company' }}</strong>;
          once this process is completed and the required documents are filed, the {{ entityTitle }} will be
          struck from the register and dissolved, ceasing to be {{ subEntityTitle }} under the
          {{ entityAct }} Act.
        </p>
        <p v-if=additionalLabel class="warning-text" id="dialog-text">
          <strong>{{ additionalLabel }}</strong>
        </p>
      </v-card-text>

      <v-card-actions>
        <v-row no-gutters justify="center">
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
            <span>{{getConfirmButtonText}}</span>
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">

import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DissolutionConfirmationResourceIF } from '@/interfaces'

@Component({})
export default class ConfirmDissolutionDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Global getters
  @Getter getLegalName!: string
  @Getter getLegalType!: string
  @Getter getDissolutionConfirmationResource!: DissolutionConfirmationResourceIF

  /** The entity title to display. */
  get entityTitle (): string {
    return this.getDissolutionConfirmationResource?.entityTitle
  }

  /** The entity title to display. */
  get subEntityTitle (): string {
    return this.getDissolutionConfirmationResource?.subTitle
  }

  /** The entity title to display. */
  get entityAct (): string {
    return this.getDissolutionConfirmationResource?.act
  }

  /** The entity title to display. */
  get getModalTitle (): string {
    return this.getDissolutionConfirmationResource?.modalTitle
  }

  /** The confirm button text to display. */
  get getConfirmButtonText (): string {
    return this.getDissolutionConfirmationResource?.confirmButtonText
  }

  /** The additional label to display. */
  get additionalLabel (): string {
    return this.getDissolutionConfirmationResource?.additionalLabel
  }

  /** The dissolution type to display. */
  get dissolutionType (): string {
    return this.getDissolutionConfirmationResource?.dissolutionType
  }

  // Pass click events to parent.
  @Emit() protected close () {}
  @Emit() protected proceed () {}
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
