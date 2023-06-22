<template>
  <FilingTemplate
    class="limited-restoration-conversion"
    :filing="filing"
    :index="index"
  >
    <!-- just use all fallback slots -->
  </FilingTemplate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ApiFilingIF } from '@/interfaces'
import FilingTemplate from '../FilingTemplate.vue'

@Component({
  components: { FilingTemplate }
})
export default class LimitedRestorationConversion extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number
}
</script>
