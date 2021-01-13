<template>
  <div class="completed-ia-body body-2">
    <h4>Incorporation Complete</h4>

    <p>{{name}} has been successfully incorporated.</p>
    <p>Return to your Manage Businesses dashboard to access your business and file changes.</p>

    <div class="to-dashboard-container">
      <v-btn color="primary" @click.native.stop="returnToDashboard()">
        <span>Return to Dashboard</span>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  computed: {
    ...mapState(['entityName'])
  }
})
export default class CompletedIa extends Vue {
  readonly entityName!: string

  /** Determine the name for the entity.
   * Use the entity name if it is available, otherwise build name for numbered company.
   */
  private get name (): string {
    return this.entityName || 'A numbered benefit company'
  }

  private returnToDashboard (): void {
    const businessesUrl = sessionStorage.getItem('BUSINESSES_URL') + 'business'
    window.location.assign(businessesUrl)
  }
}
</script>

<style lang="scss" scoped>
.to-dashboard-container {
  text-align: center;
  padding: 1rem;
}

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

</style>
