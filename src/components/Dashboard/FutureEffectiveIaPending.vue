<template>
  <div class="future-effective-ia-pending-body body-2">
    <h4>Incorporation Pending</h4>

    <p>The incorporation date and time for {{entityName || 'this Numbered Benefit Company'}}
      has been recorded as {{effectiveDateTime || 'unknown'}} Pacific Time.</p>
    <p>It may take up to one hour to process this filing.</p>
    <p>If this issue persists, please contact us.</p>

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
export default class FutureEffectiveIaPending extends Vue {
  /** The subject filing. */
  @Prop() private filing: any

  /** The future effective datetime of the subject filing. */
  private get effectiveDateTime (): string {
    return this.filing?.effectiveDateTime
  }
}
</script>

<style lang="scss" scoped>
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
