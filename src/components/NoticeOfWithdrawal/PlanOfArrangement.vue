<template>
  <div id="withdrawal-poa">
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="3"
        class="pr-4"
      >
        <label id="poa-label">Plan of Arrangement</label>
      </v-col>
      <v-col
        cols="12"
        :sm="9"
      >
        <v-checkbox
          id="plan-of-arrangement-checkbox"
          v-model="planOfArrangement"
          class="mt-0 pt-0"
          hide-details
          label="The record to be withdrawn was filed as part of an arrangement."
        />
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="pt-4"
    >
      <v-col
        cols="12"
        sm="3"
        class="pr-4"
      />
      <v-col
        cols="12"
        :sm="9"
      >
        <v-checkbox
          id="come-into-effect-checkbox"
          v-model="comeIntoEffect"
          class="mt-0 pt-0"
          hide-details
          label="One or more of the provisions of the arrangement have come into effect."
          :disabled="!planOfArrangement"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class PlanOfArrangement extends Vue {
  /** Draft plan of arrangement. */
  @Prop({ default: false }) readonly hasDraftPlanOfArrangement!: boolean

  /** Draft come into effect. */
  @Prop({ default: false }) readonly hasDraftComeIntoEffect!: boolean

  // Local properties
  private planOfArrangement = false
  private comeIntoEffect = false

  /** Called when component is mounted. */
  mounted (): void {
    // Set default draft values if they exist
    if (this.hasDraftPlanOfArrangement) this.planOfArrangement = this.hasDraftPlanOfArrangement
    if (this.hasDraftComeIntoEffect) this.comeIntoEffect = this.hasDraftComeIntoEffect
  }

  @Watch('planOfArrangement')
  private onPlanOfArrangementChange (newVal: boolean): void {
    // If planOfArrangement is false, reset comeIntoEffect to false
    if (!newVal) {
      this.comeIntoEffect = false
    }
  }

  /** Emit plan of arrangement. */
  @Watch('planOfArrangement')
  @Emit('planOfArrangement')
  emitPoa (): void {}

  /** Emit come into effect. */
  @Watch('comeIntoEffect')
  @Emit('comeIntoEffect')
  emitEffect (): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#poa-label {
  font-size: $px-16;
  font-weight: bold;
  color: $gray9;
}

:deep() {
  .v-card__actions {
    justify-content: flex-end;
  }

  .v-input .v-label {
    font-weight: normal;
    color: $gray7;
  }

  .theme--light.v-input input {
    font-weight: normal;
    color: $gray7;
  }
}
</style>
