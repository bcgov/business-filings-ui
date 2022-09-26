<template>
  <v-dialog v-model="dialog" width="50rem" persistent :attach="attach" content-class="save-error-dialog">
    <v-card>
      <!-- if there are errors, or neither errors nor warnings... -->
      <v-card-title id="dialog-title" v-if="numErrors > 0 || numWarnings < 1">
        Unable to Save {{filingName}}
      </v-card-title>

      <!-- otherwise there are only warnings... -->
      <v-card-title id="dialog-title" v-else>
        {{filingName}} Saved with Warnings
      </v-card-title>

      <v-card-text id="dialog-text">
        <!-- display generic message (no errors or warnings) -->
        <div class="font-15" v-if="(numErrors + numWarnings) < 1">
          <p>We were unable to save your {{filingName}}. You can continue to try to save this
          filing or you can exit without saving and re-create this filing at another time.</p>
          <p>If you exit this {{filingName}}, any changes you've made will not be saved.</p>
        </div>

        <!-- display errors -->
        <div class="font-15 mb-4" v-if="numErrors > 0">
          <p>We were unable to save your {{filingName}} due to the following errors:</p>
          <ul>
            <li v-for="(error, index) in errors" :key="index">
              {{error.error || error.message}}
            </li>
          </ul>
        </div>

        <!-- display warnings-->
        <div class="font-15 mb-4" v-if="numWarnings > 0">
          <p>Please note the following warnings:</p>
          <ul>
            <li v-for="(warning, index) in warnings" :key="index">
              {{warning.warning || warning.message}}
            </li>
          </ul>
        </div>

        <template v-if="!isRoleStaff">
          <p class="font-15">If this error persists, please contact us:</p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <!-- if there are errors, or neither errors nor warnings... -->
      <v-card-actions v-if="numErrors > 0 || numWarnings < 1">
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">Return to Filing</v-btn>
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
import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
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
  @Prop({ default: 'Filing' }) readonly filingName!: string

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** Prop to disable the Retry button. */
  @Prop({ default: false }) readonly disableRetry!: boolean

  /** Prop containing error messages. */
  @Prop({ default: () => [] }) readonly errors!: any[]

  /** Prop containing warning messages. */
  @Prop({ default: () => [] }) readonly warnings!: any[]

  // Pass click events to parent.
  @Emit() protected exit () {}
  @Emit() protected retry () {}
  @Emit() protected okay () {}

  /** The number of errors in the passed-in array. */
  get numErrors (): number {
    return this.errors?.length || 0
  }

  /** The number of warnings in the passed-in array. */
  get numWarnings (): number {
    return this.warnings?.length || 0
  }
}
</script>
