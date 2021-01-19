<template>
  <sbc-signout :redirect-url="bcrosHomeUrl" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue } from 'vue-property-decorator'

// Components
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'

@Component({
  components: {
    SbcSignout
  }
})
export default class Signout extends Vue {
  /** The BCROS Home URL string. */
  get bcrosHomeUrl (): string {
    return sessionStorage.getItem('BUSINESSES_URL')
  }
}
</script>
