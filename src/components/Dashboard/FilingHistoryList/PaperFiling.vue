<template>
  <div class="paper-filing-details body-2">
    <p>
      This filing is available on paper only. To request copies of paper documents,
      contact BC Registries staff:
    </p>

    <ContactInfo class="mt-4" />
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
  margin-top: 1rem !important;
}
</style>
