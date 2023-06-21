<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="coa-warning-dialog"
  >
    <v-card>
      <v-card-title>Address Change Effective 12:01 am</v-card-title>

      <v-card-text>
        <p class="font-15">
          Address changes take effect at 12:01 am Pacific time.
          No other filings can be performed until an Address Change has taken effect.
        </p>
        <p class="font-15">
          If you need to perform other filings today, file them prior to
          your Address Change filing.
        </p>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-btn
          id="dialog-toggle-button"
          color="primary"
          text
          @click="toggle()"
        >
          Return to dashboard
        </v-btn>
        <v-spacer />
        <v-btn
          id="dialog-proceed-button"
          color="primary"
          text
          @click="proceed()"
        >
          Continue to Change of Address
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'

@Component({})
export default class CoaWarningDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click events to parent.
  @Emit() toggle () {}
  @Emit() proceed () {}
}
</script>
