<template>
  <div class="d-none" />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { AllowableActionsMixin, CommonMixin, DateMixin, EnumMixin } from '@/mixins'

@Component({})
export default class MixinTester extends Mixins(AllowableActionsMixin, CommonMixin, DateMixin, EnumMixin) {}
</script>

<style>
</style>
