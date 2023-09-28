<template>
  <v-container id="digital-credentials">
    <router-view />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class DigitalCredentials extends Vue {}
</script>
