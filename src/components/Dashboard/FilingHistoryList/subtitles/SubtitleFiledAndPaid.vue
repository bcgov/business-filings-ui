<template>
  <div class="subtitle-filed-and-paid">
    <span>FILED AND PAID <FiledLabel :filing="filing" /></span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ApiFilingIF } from '@/interfaces'
import FiledLabel from '../FiledLabel.vue'

@Component({
  components: { FiledLabel }
})
export default class SubtitleFiledAndPaid extends Vue {
  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.subtitle-filed-and-paid {
  color: $gray7;
}
</style>
