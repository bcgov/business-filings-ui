<template>
  <sbc-signin @keycloak-session-ready="onReady()" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue } from 'vue-property-decorator'
import TokenService from 'sbc-common-components/src/services/token.services'

// Components
import SbcSignin from 'sbc-common-components/src/components/SbcSignin.vue'

// Constants
import { DASHBOARD } from '@/constants'

@Component({
  components: {
    SbcSignin
  }
})
export default class Signin extends Vue {
  private tokenService = new TokenService()

  /** Called when Keycloak session is ready. */
  private async onReady () {
    // start token service to refresh KC token periodically
    console.info('Starting token refresh service...') // eslint-disable-line no-console
    await this.tokenService.init()
    this.tokenService.scheduleRefreshTimer()

    // navigate to dashboard
    this.$router.push({ name: DASHBOARD })
  }
}
</script>
