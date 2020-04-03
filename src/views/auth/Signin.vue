<template>
  <sbc-signin @keycloak-session-ready="onReady()" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue } from 'vue-property-decorator'

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
  /** Called when Keycloak session is ready. */
  private async onReady () {
    // navigate to dashboard
    this.$router.push({ name: DASHBOARD })
  }
}
</script>
