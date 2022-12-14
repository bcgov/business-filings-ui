<template>
  <div class="d-none" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { AllowableActionsMixin, DateMixin, EnumMixin } from '@/mixins'

@Component({
  mixins: [
    AllowableActionsMixin,
    DateMixin,
    EnumMixin
  ]
})
export default class MixinTester extends Vue {}
</script>

<style>
</style>
