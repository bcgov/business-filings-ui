<template>
  <div class="payment-paid-details body-2 pa-4">
    <h4>Paid</h4>

    <p class="pt-3 mb-2">
      This filing is paid but the filing is not yet complete. Please check again later.
    </p>

    <template v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)">
      <p>
        If this error persists, please contact us.
      </p>
      <ContactInfo class="mt-5" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { AuthorizedActions } from '@/enums'
import { ContactInfo } from '@/components/common'
import { IsAuthorized } from '@/utils'

@Component({
  components: { ContactInfo }
})
export default class PaymentPaid extends Vue {
  /* For Template Contact Info message */
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions
}
</script>
