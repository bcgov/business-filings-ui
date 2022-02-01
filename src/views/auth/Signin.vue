<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Signin extends Vue {
  created () {
    // redirect to BC Registry login page then return to this app
    const loginUrl = sessionStorage.getItem('REGISTRY_HOME_URL') + 'login'
    const returnUrl = encodeURIComponent(sessionStorage.getItem('BASE_URL'))
    window.location.assign(`${loginUrl}?return=${returnUrl}`)
  }
}
</script>
