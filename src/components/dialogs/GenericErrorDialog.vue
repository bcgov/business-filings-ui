<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
  >
    <v-card>
      <v-card-title id="generic-error-dialog-title">
        <slot name="errorTitle">
          <v-icon
            large
            color="error"
          >
            mdi-alert-circle-outline
          </v-icon>
          <span class="ml-3">Error happened!</span>
        </slot>
      </v-card-title>

      <v-card-text id="generic-error-dialog-text">
        <slot name="errorMessage">
          Generic error happened. Please try again later.
        </slot>
      </v-card-text>
      <v-divider class="my-0" />
      <v-card-actions class="justify-center">
        <v-btn
          id="dialog-ok-btn"
          color="primary"
          @click="okay()"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class GenericErrorDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click event to parent.
  @Emit() okay () {
  }
}
</script>
