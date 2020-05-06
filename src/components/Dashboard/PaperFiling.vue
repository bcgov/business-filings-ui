<template>
  <div class="paper-filing body-2">
    <p>Filings completed <strong>before March 10, 2019</strong> are only available from the BC Registry
      as paper documents.</p>
    <p>To request copies of paper documents, contact BC Registry Staff with the document you require and
      the name and incorporation number of your association:</p>

    <ErrorContact class="pt-3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ErrorContact } from '@/components/common'

@Component({
  components: { ErrorContact }
})
export default class PaperFiling extends Vue {}
</script>

<style lang="scss" scoped>
// @import "@/assets/styles/theme.scss";

p {
  margin-bottom: 0.5rem !important;
}

</style>
