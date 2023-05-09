<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { navigate } from '@/utils'
import { mapState } from 'pinia'
import { useConfigurationStore } from '@/stores/configurationStore'

@Component({
  computed: {
    ...mapState(useConfigurationStore, ['getLoginUrl'])
  }
})
export default class Signin extends Vue {
  /** Called when component is created. */
  protected created () {
    // navigate to BC Registry login page then return to this app
    const returnUrl = encodeURIComponent(sessionStorage.getItem('BASE_URL'))
    navigate(`${this.getLoginUrl}?return=${returnUrl}`)
  }
}
</script>
