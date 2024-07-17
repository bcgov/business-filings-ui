<template>
  <PendingTemplate
    class="continuation-in"
    :item="item"
    :index="index"
  >
    <template #body>
      <div class="body-2">
        <p class="mb-0">
          This {{ entityType }} Continuation Application is paid and awaiting staff review. We will
          notify you of the results by email. You can also come back here to check on the progress.
        </p>
      </div>
    </template>
  </PendingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import PendingTemplate from '../PendingTemplate.vue'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: {
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
