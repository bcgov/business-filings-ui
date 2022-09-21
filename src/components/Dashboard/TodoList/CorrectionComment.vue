<template>
  <div class="correction-comment" v-if="comment">
    <h4>
      <v-icon small>mdi-message-reply</v-icon>
      <span class="ml-1">Detail</span>
    </h4>

    <p class="body-2 detail-body pre-line pt-4 mb-0">
      {{ comment }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class CorrectionComment extends Vue {
  /** The correction detail comment. */
  @Prop({ default: null }) readonly comment!: string
}
</script>
