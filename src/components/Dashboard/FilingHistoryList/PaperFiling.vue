<template>
  <div class="paper-filing-details body-2">
    <p>This filing is available on paper only. To request copies of paper documents, contact BC Registry Staff:</p>

    <contact-info class="pt-3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class PaperFiling extends Vue {}
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 0.5rem !important;
}
</style>
