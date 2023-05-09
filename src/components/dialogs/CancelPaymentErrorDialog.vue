<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="cancel-payment-error-dialog">
    <v-card>
      <v-card-title id="dialog-title" data-test-id="cancel-pay-dialog-title">
        Unable to Cancel Payment
      </v-card-title>

      <v-card-text id="dialog-text" data-test-id="cancel-pay-dialog-text">
        <p class="font-15" v-if="errors.length < 1">
          We were unable to cancel your payment.
        </p>
        <p class="font-15" v-else>
          We were unable to cancel your payment due to the following errors:
        </p>
        <p class="font-15" v-for="(error, index) in errors" :key="index">
          {{error.error || error.message}}
        </p>

        <template v-if="!isRoleStaff">
          <p class="font-15">If you need help, please contact us.</p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn id="dialog-ok-btn" color="primary" text @click="okay()"
          data-test-id="cancel-pay-dialog-ok-btn">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { mapState } from 'pinia'
import { ContactInfo } from '@/components/common'
import { useRootStore } from '@/stores/rootStore'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapState(useRootStore, ['isRoleStaff'])
  },
  components: { ContactInfo }
})
export default class CancelPaymentErrorDialog extends Vue {
  readonly isRoleStaff!: boolean

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop containing error messages.
  @Prop({ default: () => [] }) readonly errors!: any[]

  // Pass click event to parent.
  @Emit() protected okay () {}
}
</script>
