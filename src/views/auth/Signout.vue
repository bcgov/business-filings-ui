<template>
  <SbcSignout :redirect-url="redirectUrl" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'
import {Getter} from "vuex-class";

@Component({
  components: { SbcSignout },
})
export default class Signout extends Vue {
  @Getter getLoginUrl!: string

  get redirectUrl (): string {
    // after signout, redirect to BC Registries login page
    return this.getLoginUrl
  }
}
</script>
