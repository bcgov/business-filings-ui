<template>
  <sbc-signout :redirect-url="businessesUrl" />
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
  /** The Business Registry home page URL. */
  private get businessesUrl (): string {
    return sessionStorage.getItem('BUSINESSES_URL')
  }
}
</script>
