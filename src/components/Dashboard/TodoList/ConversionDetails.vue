<template>
  <div id="conversion-details" class="body-2">
    <p class="mb-2">
      BC Registries is missing information about this business.
    </p>
    <ul v-if="warnings.length > 0">
      <li v-for="(item, index) in warnings" :key="index" class="pl-2">
        {{item}}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { TodoItemIF } from '@/interfaces'

@Component({})
export default class ConversionDetails extends Vue {
  /** The subject filing. */
  @Prop({ required: true }) readonly filing!: TodoItemIF

  get warnings (): Array<string> {
    return this.filing?.warnings || []
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

p, li {
  color: $gray7;
}
</style>
