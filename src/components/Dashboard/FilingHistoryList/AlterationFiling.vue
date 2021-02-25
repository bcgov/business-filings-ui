<template>
  <div class="completed-ia-body body-2">
    <p>Alteration documents are only available from the BC Registry as paper documents.</p>
    <p>To request copies of paper documents, contact BC Registry Staff with the incorporation number,
      the filing date, and the documents you require.</p>
    <p>If you have questions, please contact us.</p>

    <contact-info class="pt-3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class AlterationFiling extends Vue {}
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 0.5rem !important;
}
</style>
