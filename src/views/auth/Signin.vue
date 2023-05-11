<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue'
import { navigate } from '@/utils'
import { Getter } from 'pinia-class'
import { useConfigurationStore } from '@/stores'

export default class Signin extends Vue {
  @Getter(useConfigurationStore) getLoginUrl!: string

  /** Called when component is created. */
  protected created () {
    // navigate to BC Registry login page then return to this app
    const returnUrl = encodeURIComponent(sessionStorage.getItem('BASE_URL'))
    navigate(`${this.getLoginUrl}?return=${returnUrl}`)
  }
}
</script>
