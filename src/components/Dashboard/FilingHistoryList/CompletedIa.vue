<template>
  <div class="completed-ia-details body-2">
    <h4>Incorporation Complete</h4>

    <p>{{getEntityName || 'A Numbered Benefit Company'}} has been successfully incorporated.</p>

    <p>Return to your Manage Businesses dashboard to access your business and file changes.</p>

    <div class="to-dashboard-container text-center mt-6">
      <v-btn color="primary" @click.native.stop="returnToDashboard()">
        <span>Return to Dashboard</span>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component({})
export default class CompletedIa extends Vue {
  @Getter getEntityName!: string

  private returnToDashboard (): void {
    const manageBusinessesUrl = sessionStorage.getItem('AUTH_WEB_URL') + 'business'
    window.location.assign(manageBusinessesUrl) // assume URL is always reachable
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
