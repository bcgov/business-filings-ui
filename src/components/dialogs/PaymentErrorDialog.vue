<template>
  <v-dialog
    v-model="dialog"
    width="50rem"
    persistent
    :attach="attach"
    content-class="payment-error-dialog"
  >
    <v-card>
      <v-card-title id="dialog-title">
        Unable to Process Payment
      </v-card-title>

      <v-card-text id="dialog-text">
        <!-- display common message -->
        <div class="font-15">
          <p>
            We are unable to process your payment at this time. This {{ filingName }} has been saved
            as a DRAFT and you can retry your payment from the Business Dashboard at a later time.
          </p>
        </div>

        <!-- display generic message (no errors or warnings) -->
        <template v-if="(numErrors + numWarnings) < 1">
          <div
            v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)"
            class="font-15"
          >
            <p>PayBC is normally available:</p>
            <ul>
              <li>Monday to Friday: 6:00am to 9:00pm</li>
              <li>Saturday: 12:00am to 7:00pm</li>
              <li>Sunday: 12:00pm to 12:00am</li>
            </ul>
          </div>
          <div
            v-else
            class="font-15"
          >
            <p>We are unable to process your payment at this time.</p>
          </div>
        </template>

        <!-- display errors -->
        <div
          v-if="numErrors > 0"
          class="font-15 mb-4"
        >
          <p>We were unable to process your payment due to the following errors:</p>
          <div
            v-for="(error, index) in errors"
            :key="index"
            class="d-flex"
          >
            <span class="flex-shrink-0"><v-icon>mdi-circle-medium</v-icon></span>
            <span
              class="flex-grow-1"
              v-html="error.message"
            />
          </div>
        </div>

        <!-- display warnings-->
        <div
          v-if="numWarnings > 0"
          class="font-15 mb-4"
        >
          <p>Please note the following warnings:</p>
          <div
            v-for="(warning, index) in warnings"
            :key="index"
            class="d-flex"
          >
            <span class="flex-shrink-0"><v-icon>mdi-circle-medium</v-icon></span>
            <span
              class="flex-grow-1"
              v-html="warning.message"
            />
          </div>
        </div>

        <template v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)">
          <p class="font-15">
            If this error persists, please contact us:
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-spacer />
        <v-btn
          id="dialog-exit-button"
          color="primary"
          text
          @click="exit()"
        >
          Back to My Dashboard
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'
import { AuthorizedActions } from '@/enums'
import { ContactInfo } from '@/components/common'
import { IsAuthorized } from '@/utils'

@Component({
  components: { ContactInfo }
})
export default class PaymentErrorDialog extends Vue {
  // For Template Contact Info or message
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** Prop containing filing name. */
  @Prop({ default: 'Filing' }) readonly filingName!: string

  /** Prop containing error messages. */
  @Prop({ default: () => [] }) readonly errors!: any[]

  /** Prop containing warning messages. */
  @Prop({ default: () => [] }) readonly warnings!: any[]

  /** Pass click event to parent. */
  @Emit() exit () {}

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
