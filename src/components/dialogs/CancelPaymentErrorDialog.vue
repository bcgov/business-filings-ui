<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="cancel-payment-error-dialog"
  >
    <v-card>
      <v-card-title
        id="dialog-title"
        data-test-id="cancel-pay-dialog-title"
      >
        Unable to Cancel Payment
      </v-card-title>

      <v-card-text
        id="dialog-text"
        data-test-id="cancel-pay-dialog-text"
      >
        <p
          v-if="errors.length < 1"
          class="font-15"
        >
          We were unable to cancel your payment.
        </p>
        <p
          v-else
          class="font-15"
        >
          We were unable to cancel your payment due to the following errors:
        </p>
        <p
          v-for="(error, index) in errors"
          :key="index"
          class="font-15"
        >
          {{ error.error || error.message }}
        </p>

        <template v-if="!isRoleStaff">
          <p class="font-15">
            If you need help, please contact us.
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-spacer />
        <v-btn
          id="dialog-ok-btn"
          color="primary"
          text
          data-test-id="cancel-pay-dialog-ok-btn"
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
export default class CancelPaymentErrorDialog extends Vue {
  // Getter to check if logged in user is Staff.
  @Getter(useAuthenticationStore) isRoleStaff!: boolean

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop containing error messages.
  @Prop({ default: () => [] }) readonly errors!: any[]

  // Pass click event to parent.
  @Emit() okay () {}
}
</script>
