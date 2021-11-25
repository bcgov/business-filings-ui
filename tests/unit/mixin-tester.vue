<template>
  <div class="d-none" />
</template>

<script lang="ts">
// Libraries
import { Component, Mixins } from 'vue-property-decorator'

// Mixins
import { AuthApiMixin, DateMixin, EnumMixin, LegalApiMixin, PayApiMixin } from '@/mixins'

@Component({})
export default class MixinTester extends Mixins(
  AuthApiMixin,
  DateMixin,
  EnumMixin,
  LegalApiMixin,
  PayApiMixin
) {}
</script>

<style>
</style>
