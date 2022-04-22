<template>
  <v-dialog v-model="dialog" width="50rem" persistent :attach="attach" content-class="payment-error-dialog">
    <v-card>
      <v-card-title id="dialog-title">Unable to Process Payment</v-card-title>

      <v-card-text id="dialog-text">
        <!-- display common message -->
        <div class="font-15" v-if="!isRoleStaff">
          <p>We are unable to process your payment at this time. This {{filingName}} has been saved
            as a DRAFT and you can retry your payment from the Business Dashboard at a later time.</p>
        </div>

        <!-- display generic message (no errors or warnings) -->
        <template v-if="(numErrors + numWarnings) < 1">
          <div class="font-15" v-if="!isRoleStaff">
            <p>PayBC is normally available:</p>
            <ul>
              <li>Monday to Friday: 6:00am to 9:00pm</li>
              <li>Saturday: 12:00am to 7:00pm</li>
              <li>Sunday: 12:00pm to 12:00am</li>
            </ul>
          </div>
          <div class="font-15" v-else>
            <p>We are unable to process your payment at this time.</p>
          </div>
        </template>

        <!-- display errors -->
        <div class="font-15 mb-4" v-if="numErrors > 0">
          <p>We were unable to process your payment due to the following errors:</p>
          <ul>
            <li v-for="(error, index) in errors[0].message.split('<br/>')" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>

        <!-- display warnings-->
        <div class="font-15 mb-4" v-if="numWarnings > 0">
          <p>Please note the following warnings:</p>
          <ul>
            <li v-for="(warning, index) in warnings" :key="index">
              {{warning.message}}
            </li>
          </ul>
        </div>

        <template v-if="!isRoleStaff">
          <p class="font-15">If this error persists, please contact us:</p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">
          {{!isRoleStaff ? 'Back to My Dashboard' : 'OK'}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class PaymentErrorDialog extends Vue {
  @Getter isRoleStaff!: boolean

  /** Prop containing filing name. */
  @Prop({ default: 'Filing' }) readonly filingName: string

  /** Prop to display the dialog. */
  @Prop() readonly dialog: boolean

  /** Prop to provide attachment selector. */
  @Prop() readonly attach: string

  /** Prop containing error messages. */
  @Prop({ default: () => [] }) readonly errors: any[]

  /** Prop containing warning messages. */
  @Prop({ default: () => [] }) readonly warnings: any[]

  /** Pass click event to parent. */
  @Emit() exit () { }

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
