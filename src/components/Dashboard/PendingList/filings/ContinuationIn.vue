<template>
  <PendingTemplate
    class="continuation-in"
    :item="item"
    :index="index"
    @toggle-panel="$emit('toggle-panel')"
  >
    <template #body>
      <div class="body-2">
        <v-divider class="mt-1 mb-4" />
        <p
          class="mb-0"
        >
          BC Registries will review your documents and contact you with the results within 5 business days.
        </p>
        <ContactInfo class="mt-4 contact-info-warning" />
      </div>
    </template>
  </PendingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import PendingTemplate from '../PendingTemplate.vue'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: {
    ContactInfo,
    PendingTemplate
  }
})
export default class ContinuationIn extends Vue {
  @Prop({ required: true }) readonly item!: any
  @Prop({ required: true }) readonly index!: number

  get entityType (): string {
    return GetCorpFullDescription(this.item.business.legalType)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p {
  color: $gray7;
  font-size: $px-15;
}
</style>
