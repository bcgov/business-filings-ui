<template>
  <v-menu
    v-model="expand"
    offset-y
    transition="slide-y-transition"
  >
    <template #activator="{ on }">
      <v-btn
        small
        text
        color="primary"
        class="menu-btn"
        v-on="on"
      >
        <span class="font-13 ml-1">Manage Credential</span>
        <v-icon
          v-if="expand"
          medium
        >
          mdi-menu-up
        </v-icon>
        <v-icon
          v-else
          medium
        >
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item-group color="primary">
        <v-tooltip
          right
          content-class="right-tooltip"
        >
          <template #activator="{ on }">
            <v-list-item
              v-on="on"
            >
              <v-list-item-title>
                <span class="app-blue">Reissue</span>
              </v-list-item-title>
            </v-list-item>
          </template>
          TODO
        </v-tooltip>
        <v-tooltip
          right
          content-class="right-tooltip"
        >
          <template #activator="{ on }">
            <v-list-item
              v-on="on"
            >
              <v-list-item-title>
                <span class="app-blue">Revoke</span>
              </v-list-item-title>
            </v-list-item>
          </template>
          TODO
        </v-tooltip>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CredentialsMenu extends Vue {
    expand = false
}
</script>
