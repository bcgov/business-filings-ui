<template>
  <div />
</template>

<script lang="ts">
import { Navigate } from '@/utils'
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useConfigurationStore } from '@/stores'

@Component({
})
export default class Signin extends Vue {
  @Getter(useConfigurationStore) getLoginUrl!: string

  /** Called when component is created. */
  created () {
    // navigate to BC Registry login page then return to this app
    const returnUrl = encodeURIComponent(sessionStorage.getItem('BASE_URL'))
    Navigate(`${this.getLoginUrl}?return=${returnUrl}`)
  }
}
</script>
