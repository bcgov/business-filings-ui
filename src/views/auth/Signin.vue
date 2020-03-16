<template>
  <sbc-signin @sync-user-profile-ready="redirectOnLogin()" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue } from 'vue-property-decorator'

// Components
import SbcSignin from 'sbc-common-components/src/components/SbcSignin.vue'
import { Route } from 'vue-router/types'

@Component({
  components: {
    SbcSignin
  }
})
export default class Signin extends Vue {
  /* Called when signin has succeeded. **/
  private redirectOnLogin () {
    // re-route to dashboard
    this.$router.push({ name: 'dashboard' })
  }
}
</script>
