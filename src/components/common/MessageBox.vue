<template>
  <v-card
    outlined
    class="rounded-0 ma-0"
    :class="{
      'message-box-gold': color === 'gold',
      'message-box-red': color === 'red'
    }"
  >
    <div class="mx-7 my-5 pa-0">
      <slot />
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class MessageBox extends Vue {
    @Prop({ required: true }) readonly color!: 'gold' | 'red'
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-card {
div {
    font-size: $px-14;
    letter-spacing: 0.01rem;
    color: $gray7;
}
}

.message-box-gold {
background-color: $BCgovGold0 !important;
border-color: $BCgovGold5 !important;
}

.message-box-red {
background-color: $app-lt-red !important;
border-color: $app-red !important;
}
</style>
