<template>
  <div class="comment-block">
    <h3 class="list-item__title">
      <v-icon>mdi-comment-text</v-icon>
      Detail (1)
    </h3>
      <p class="list-item__title inner-block">{{filing.certifiedBy}} - ({{filing.date}})</p>
      <p class="list-item__subtitle inner-block">Correction for {{filing.correctedFilingType}}.
        Filed on {{filing.date}}.<br />
        {{filing.comment}}
      </p>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class CorrectionComment extends Vue {
  /**
   * Filing Passed from parent container correction information
   */
  @Prop({ default: '' })
  private filing
}

</script>
<style lang="scss" scoped>
  @import "@/assets/styles/theme.scss";

.comment-block {
  margin: .5rem 0;

  .inner-block {
    margin: .5rem 0;
  }
}
</style>
