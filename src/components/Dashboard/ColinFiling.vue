<template>
  <div class="colin-filing-body body-2">
    <p>Documents for this filing are available on <a :href="colinUrl" rel="noopener noreferrer"
      target="_blank">Corporate Online</a> or <a :href="bcolUrl" rel="noopener noreferrer"
      target="_blank">BC Online</a>.</p>
    <p>If you do not have access to Corporate Online or BC Online and would like to request copies
      of paper documents, contact BC Registry Staff with the document you require and the name and
      incorporation number of your company:</p>

    <contact-info class="pt-3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class ColinFiling extends Vue {
  private readonly colinUrl =
    'https://www.corporateonline.gov.bc.ca/corporateonline/colin/static/colin/html/index.html'
  private readonly bcolUrl =
    'https://www.bconline.gov.bc.ca/'
}
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 0.5rem !important;
}
</style>
