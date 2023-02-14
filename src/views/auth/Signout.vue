<template>
  <SbcSignout :redirect-url="redirectUrl" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'
import {mapGetters} from "vuex";

@Component({
  components: { SbcSignout },
  computed: {
    ...mapGetters(['getLoginUrl'])
  }
})
export default class Signout extends Vue {
  get redirectUrl (): string {
    // after signout, redirect to BC Registries login page
    return this.getLoginUrl
  }
}
</script>
