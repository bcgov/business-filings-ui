<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useAuthenticationStore, useBusinessStore, useConfigurationStore } from '@/stores'
import { CurrentAccountIF } from '@/interfaces'

@Component({
})
export default class Dashboard extends Vue {
  @Getter(useConfigurationStore) getDashboardUrl!: string
  @Getter(useConfigurationStore) getBusinessRegDashUrl!: string
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useAuthenticationStore) getCurrentAccount!: CurrentAccountIF

  /** Called when component is created. */
  created () {
    // Get businessId from route params if present
    const businessId = this.$route.params.businessId
    let url = ''

    if (businessId) {
      // If on /:businessId/, redirect to dashboard with businessId
      console.log(businessId)
      console.log(this.$route.fullPath)
      url = `${this.getDashboardUrl}${businessId}`
    } else {
      // If on /, redirect to dashboard root
      url = `${this.getBusinessRegDashUrl}`
    }

    console.log('Redirecting to:', url)
    window.location.replace(url || '/')
  }
}
</script>
