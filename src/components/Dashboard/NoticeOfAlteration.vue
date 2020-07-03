<template>
  <div class="completed-ia-body body-2">
    <p>Notice of Alteration documents are only available from BC Registry. If you would like to
      request copies, contact BC Registry Staff with the documents you require and the name and
      incorporation number of your company:</p>

    <contact-info class="pt-3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class NoticeOfAlteration extends Vue {}
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 0.5rem !important;
}
</style>
