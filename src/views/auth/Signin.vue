<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { navigate } from '@/utils'

@Component({})
export default class Signin extends Vue {
  created () {
    // navigate to BC Registry login page then return to this app
    const loginUrl = sessionStorage.getItem('REGISTRY_HOME_URL') + 'login'
    const returnUrl = encodeURIComponent(sessionStorage.getItem('BASE_URL'))
    navigate(`${loginUrl}?return=${returnUrl}`)
  }
}
</script>
