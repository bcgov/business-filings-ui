<template>
  <SbcSignout :redirect-url="redirectUrl" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'

@Component({
  components: {
    SbcSignout
  }
})
export default class Signout extends Vue {
  get redirectUrl (): string {
    // after signout, redirect to BC Registries login page
    return sessionStorage.getItem('REGISTRY_HOME_URL') + 'login'
  }
}
</script>
