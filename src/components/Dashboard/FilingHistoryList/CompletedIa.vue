<template>
  <div class="completed-ia-details body-2">
    <h4>Incorporation Complete</h4>

    <p>{{entityName || 'A Numbered Benefit Company'}} has been successfully incorporated.</p>
    <p>Return to your Manage Businesses dashboard to access your business and file changes.</p>

    <div class="to-dashboard-container">
      <v-btn color="primary" @click.native.stop="returnToDashboard()">
        <span>Return to Dashboard</span>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: { ...mapState(['entityName']) }
})
export default class CompletedIa extends Vue {
  readonly entityName!: string

  private returnToDashboard (): void {
    const manageBusinessesUrl = sessionStorage.getItem('AUTH_URL') + 'business'
    window.location.assign(manageBusinessesUrl) // assume URL is always reachable
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
