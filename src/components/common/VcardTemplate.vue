<template>
  <v-card flat>
    <section class="mt-0">
      <header class="d-flex bg-color-blue rounded-t py-5 px-6">
        <v-icon color="appDkBlue">
          <slot name="icon" />
        </v-icon>

        <h2 class="font-16 font-weight-bold color-dk-text pl-2">
          <slot name="title" />
        </h2>
      </header>

      <div>
        <slot name="content" />
      </div>
    </section>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class VcardTemplate extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.v-icon {
  // move icon up to line up vertically with the title
  margin-top: -3px;
}
</style>
