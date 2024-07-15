<template>
  <div class="d-none" />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { AllowableActionsMixin, CommonMixin, DateMixin } from '@/mixins'

@Component({})
export default class MixinTester extends Mixins(AllowableActionsMixin, CommonMixin, DateMixin) {}
</script>

<style>
</style>
