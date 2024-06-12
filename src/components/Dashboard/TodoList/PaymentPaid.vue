<template>
  <div class="payment-paid-details body-2 pa-4">
    <h4>Paid</h4>

    <p class="pt-3 mb-2">
      This filing is paid but the filing is not yet complete. Please check again later.
    </p>

    <template v-if="!isRoleStaff">
      <p>
        If this error persists, please contact us.
      </p>
      <ContactInfo class="mt-5" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { ContactInfo } from '@/components/common'
import { useRootStore } from '@/stores'

@Component({
  components: { ContactInfo }
})
export default class PaymentPaid extends Vue {
  // Getter to check if logged in user is Staff.
  @Getter(useRootStore) isRoleStaff!: boolean
}
</script>
