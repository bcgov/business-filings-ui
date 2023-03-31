<template>
  <FilingTemplate class="paper-filing" :filing="filing" :index="index">
    <template #body>
      <p>
        This filing is available on paper only. To request copies of paper documents,
        contact BC Registries staff:
      </p>

      <ContactInfo class="mt-4" />
    </template>
  </FilingTemplate>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'
import FilingTemplate from '../FilingTemplate.vue'

@Component({
  components: {
    ContactInfo,
    FilingTemplate
  }
})
export default class PaperFiling extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
}
</style>
