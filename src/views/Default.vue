<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useConfigurationStore } from '@/stores'

@Component({
})
export default class Default extends Vue {
  @Getter(useConfigurationStore) getBusinessDashUrl!: string
  @Getter(useConfigurationStore) getBusinessRegistryDashboardUrl!: string

  created () {
    // Get businessId from route params if present
    const businessId = sessionStorage.getItem('BUSINESS_ID')
    let url = ''

    if (businessId) {
      // If on there is a business id, but no further info, redirect to dashboard with businessId
      url = `${this.getBusinessDashUrl}${businessId}`
    } else {
      // If on root, redirect to BRD
      url = `${this.getBusinessRegistryDashboardUrl}`
    }

    window.location.replace(url || '/')
  }
}
</script>
