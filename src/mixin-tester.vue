<template>
  <div class="d-none" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import {
  AllowableActionsMixin, AuthApiMixin, DateMixin, EnumMixin, LegalApiMixin, PayApiMixin
} from '@/mixins'

@Component({
  mixins: [
    AllowableActionsMixin,
    AuthApiMixin,
    DateMixin,
    EnumMixin,
    LegalApiMixin,
    PayApiMixin
  ]
})
export default class MixinTester extends Vue {}
</script>

<style>
</style>
