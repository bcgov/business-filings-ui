<template>
  <v-dialog
    v-model="dialog"
    width="50rem"
    persistent
    :attach="attach"
    content-class="save-error-dialog"
  >
    <v-card>
      <!-- if there are errors, or neither errors nor warnings... -->
      <v-card-title
        v-if="numErrors > 0 || numWarnings < 1"
        id="dialog-title"
      >
        Unable to Save {{ filingName }}
      </v-card-title>

      <!-- otherwise there are only warnings... -->
      <v-card-title
        v-else
        id="dialog-title"
      >
        {{ filingName }} Saved with Warnings
      </v-card-title>

      <v-card-text id="dialog-text">
        <!-- display generic message (no errors or warnings) -->
        <div
          v-if="(numErrors + numWarnings) < 1"
          class="font-15"
        >
          <p>
            We were unable to save your {{ filingName }}. You can continue to try to save this
            filing or you can exit without saving and re-create this filing at another time.
          </p>
          <p>If you exit this {{ filingName }}, any changes you've made will not be saved.</p>
        </div>

        <!-- display errors -->
        <div
          v-if="numErrors > 0"
          class="font-15 mb-4"
        >
          <p>We were unable to save your {{ filingName }} due to the following errors:</p>
          <ul>
            <li
              v-for="(error, index) in errors"
              :key="index"
            >
              {{ error.error || error.message }}
            </li>
          </ul>
        </div>

        <!-- display warnings-->
        <div
          v-if="numWarnings > 0"
          class="font-15 mb-4"
        >
          <p>Please note the following warnings:</p>
          <ul>
            <li
              v-for="(warning, index) in warnings"
              :key="index"
            >
              {{ warning.warning || warning.message }}
            </li>
          </ul>
        </div>

        <template v-if="!isRoleStaff">
          <p class="font-15">
            If this error persists, please contact us:
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0" />

      <!-- if there are errors, or neither errors nor warnings... -->
      <v-card-actions v-if="numErrors > 0 || numWarnings < 1">
        <v-btn
          id="dialog-exit-button"
          color="primary"
          text
          @click="exit()"
        >
          Return to Filing
        </v-btn>
        <v-spacer />
        <v-btn
          id="dialog-retry-button"
          color="primary"
          text
          :disabled="disableRetry"
          @click="retry()"
        >
          Retry
        </v-btn>
      </v-card-actions>

      <!-- otherwise there are only warnings... -->
      <v-card-actions v-else>
        <v-spacer />
        <v-btn
          id="dialog-ok-button"
          color="primary"
          text
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
import { Getter } from 'pinia-class'
import { ContactInfo } from '@/components/common'
import { useAuthenticationStore } from '@/stores'

@Component({
  components: { ContactInfo }
})
export default class SaveErrorDialog extends Vue {
  // Getter to check if logged in user is Staff.
  @Getter(useAuthenticationStore) isRoleStaff!: boolean

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
  @Emit() exit () {}
  @Emit() retry () {}
  @Emit() okay () {}

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
