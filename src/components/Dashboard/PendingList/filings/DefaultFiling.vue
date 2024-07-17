<template>
  <PendingTemplate
    class="default-filing"
    :item="item"
    :index="index"
  >
    <!-- just use all fallback slots (see PendingTemplate.vue) -->
  </PendingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import PendingTemplate from '../PendingTemplate.vue'

@Component({
  components: { PendingTemplate }
})
export default class DefaultFiling extends Vue {
  @Prop({ required: true }) readonly item!: any
  @Prop({ required: true }) readonly index!: number
}
</script>
