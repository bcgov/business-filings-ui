<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="payment-error-dialog">
    <v-card>
      <v-card-title id="dialog-title">Unable to process payment</v-card-title>

      <v-card-text id="dialog-text">
        <!-- display common message -->
        <div class="genErr">
          <p>We are unable to process your payment at this time. This {{filingName}} has been saved
            as a DRAFT and you can retry your payment from the Business Dashboard at a later time.</p>
        </div>

        <!-- display generic message (no errors or warnings) -->
        <div class="genErr" v-if="!isRoleStaff && (numErrors + numWarnings) < 1">
          <p>PayBC is normally available:</p>
          <ul>
            <li>Monday to Friday: 6:00am to 9:00pm</li>
            <li>Saturday: 12:00am to 7:00pm</li>
            <li>Sunday: 12:00pm to 12:00am</li>
          </ul>
        </div>

        <!-- display errors -->
        <div class="genErr mb-4" v-if="numErrors > 0">
          <p>We were unable to process your payment due to the following errors:</p>
          <ul>
            <li v-for="(error, index) in errors" :key="index">{{ error.error }}</li>
          </ul>
        </div>

        <!-- display warnings-->
        <div class="genErr mb-4" v-if="numWarnings > 0">
          <p>Please note the following warnings:</p>
          <ul>
            <li v-for="(warning, index) in warnings" :key="index">{{ warning.warning }}</li>
          </ul>
        </div>

        <template v-if="!isRoleStaff">
          <p class="genErr">If this error persists, please contact us:</p>
          <contact-info />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">Back to My Dashboard</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { ContactInfo } from '@/components/common'
import { PaymentErrorIF } from '@/interfaces'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  components: { ContactInfo }
})
export default class PaymentErrorDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  /** Prop containing filing name. */
  @Prop({ default: 'Filing' }) private filingName: string

  /** Prop to display the dialog. */
  @Prop() private dialog: boolean

  /** Prop containing pay error object. */
  @Prop({ default: () => { return null } }) private payErrorObj: PaymentErrorIF

  /** Prop to provide attachment selector. */
  @Prop() private attach: string

  /** Prop containing error messages. */
  @Prop({ default: () => [] }) private errors: object[]

  /** Prop containing warning messages. */
  @Prop({ default: () => [] }) private warnings: object[]

  /** Pass click event to parent. */
  @Emit() private exit () { }

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
