<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { navigate } from '@/utils'
import { mapGetters } from 'vuex'

@Component({
  computed: {
    ...mapGetters(['getLoginUrl'])
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
