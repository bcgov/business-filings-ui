<template>
  <div class="completed-ia-details body-2">
    <h4>Registration Complete</h4>

    <p>{{getEntityName}} has been successfully registered.</p>

    <p>Return to My Business Registry to access your business and file changes.</p>

    <div class="to-dashboard-container text-center mt-6">
      <v-btn color="primary" @click.native.stop="returnToMyBusinessRegistry()">
        <span>Return to My Business Registry</span>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { navigate } from '@/utils'
import { mapGetters } from 'vuex'

@Component({
  computed: {
    ...mapGetters(['getEntityName', 'getMyBusinessRegistryUrl'])
  }
})
export default class CompletedIa extends Vue {
  @Getter readonly getEntityName!: string

  protected returnToMyBusinessRegistry (): void {
    navigate(this.getMyBusinessRegistryUrl)
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-top: 1rem !important;
}
</style>
