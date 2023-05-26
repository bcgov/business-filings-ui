<template>
  <v-card outlined id="important-message" class="rounded-md">
    <p class="px-3 ma-4"><strong>Important: </strong>{{ message }}</p>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class ImportantMessage extends Vue {
  @Prop({ default: '' }) readonly message!: string
}
</script>
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
#important-message {
  background-color: $BCgovGold0 !important;
  border-color: $BCgovGold5 !important;

  p {
    font-size: $px-14;
    color: $gray7;
  }
}
</style>
