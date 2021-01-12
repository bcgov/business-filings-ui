<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="save-error-dialog">
    <v-card>
      <!-- if there are errors, or neither errors nor warnings... -->
      <v-card-title id="dialog-title" v-if="numErrors > 0 || numWarnings < 1">
        Unable to save {{filingName}}
      </v-card-title>

      <!-- otherwise there are only warnings... -->
      <v-card-title id="dialog-title" v-else>
        {{filingName}} saved with warnings
      </v-card-title>

      <v-card-text id="dialog-text">
        <!-- display generic message (no errors or warnings) -->
        <div class="genErr" v-if="(numErrors + numWarnings) < 1">
          <p>We were unable to save your {{filingName}}. You can continue to try to save this
          filing or you can exit without saving and re-create this filing at another time.</p>
          <p>If you exit this {{filingName}}, any changes you've made will not be saved.</p>
        </div>

        <!-- display errors -->
        <div class="genErr mb-4" v-if="numErrors > 0">
          <p>We were unable to save your {{filingName}} due to the following errors:</p>
          <ul>
            <li v-for="(error, index) in errors" :key="index">{{error.error}}</li>
          </ul>
        </div>

        <!-- display warnings-->
        <div class="genErr mb-4" v-if="numWarnings > 0">
          <p>Please note the following warnings:</p>
          <ul>
            <li v-for="(warning, index) in warnings" :key="index">{{warning.warning}}</li>
          </ul>
        </div>

        <template v-if="!isRoleStaff">
          <p class="genErr">If this error persists, please contact us:</p>
          <contact-info />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <!-- if there are errors, or neither errors nor warnings... -->
      <v-card-actions v-if="numErrors > 0 || numWarnings < 1">
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">Exit without saving</v-btn>
        <v-spacer></v-spacer>
        <v-btn id="dialog-retry-button" color="primary" text @click="retry()" :disabled="disableRetry">Retry</v-btn>
      </v-card-actions>

      <!-- otherwise there are only warnings... -->
      <v-card-actions v-else>
        <v-spacer></v-spacer>
        <v-btn id="dialog-ok-button" color="primary" text @click="okay()">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { ContactInfo } from '@/components/common'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  components: { ContactInfo }
})
export default class SaveErrorDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  /** Prop containing filing name. */
  @Prop({ default: 'Filing' }) private filingName: string

  /** Prop to display the dialog. */
  @Prop() private dialog: boolean

  /** Prop to provide attachment selector. */
  @Prop() private attach: string

  /** Prop to disable the Retry button. */
  @Prop() private disableRetry: boolean

  /** Prop containing error messages. */
  @Prop({ default: () => [] }) private errors: object[]

  /** Prop containing warning messages. */
  @Prop({ default: () => [] }) private warnings: object[]

  // Pass click events to parent.
  @Emit() private exit () { }
  @Emit() private retry () { }
  @Emit() private okay () { }

  /** The number of errors in the passed-in array. */
  private get numErrors (): number {
    return this.errors?.length || 0
  }

  /** The number of warnings in the passed-in array. */
  private get numWarnings (): number {
    return this.warnings?.length || 0
  }
}
</script>
