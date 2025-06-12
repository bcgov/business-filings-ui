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
export default class Default extends Vue {
  @Getter(useConfigurationStore) getDashboardUrl!: string
  @Getter(useConfigurationStore) getBusinessRegistryDashboardUrl!: string
  @Getter(useConfigurationStore) getBusinessID
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useAuthenticationStore) getCurrentAccount!: CurrentAccountIF

  created () {
    // Get businessId from route params if present
    const businessId = sessionStorage.getItem('BUSINESS_ID')
    let url = ''

    if (businessId) {
      // If on there is a business id, but no further info, redirect to dashboard with businessId
      url = `${this.getDashboardUrl}${businessId}`
    } else {
      // If on root, redirect to BRD
      url = `${this.getBusinessRegistryDashboardUrl}`
    }

    window.location.replace(url || '/')
  }
}
</script>
