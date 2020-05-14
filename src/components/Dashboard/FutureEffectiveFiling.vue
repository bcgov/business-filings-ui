<template>
  <div class="future-effective-filing body-2">
    <h4>Future Effective Incorporation Date</h4>

    <p>The incorporation date and time for {{entityName || 'unknown'}}
      will be {{effectiveDateTime || 'unknown'}} Pacific Time.</p>
    <p>If you wish to change the information in this application you must
      contact Registry Staff to file a withdrawal. </p>
    <p>Withdrawing this Incorporation Application will remove this application
      and all associated information, and will incur a $20.00 fee. </p>

    <ErrorContact />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { ErrorContact } from '@/components/common'

@Component({
  computed: { ...mapState(['entityName']) },
  components: { ErrorContact }
})
export default class FutureEffectiveFiling extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

  /** The future effective datetime of the subject filing. */
  private get effectiveDateTime (): string {
    return this.filing?.effectiveDateTime
  }
}
</script>

<style lang="scss" scoped>
// @import "@/assets/styles/theme.scss";

h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}

p:first-of-type {
  padding-top: 0.75rem;
}

p {
  margin-bottom: 0.5rem !important;
}

.error-contact {
  padding-top: 0.75rem;
}
</style>
