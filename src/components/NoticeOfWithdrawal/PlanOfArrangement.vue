<template>
  <div id="withdrawal-poa">
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="3"
        class="pr-4"
      >
        <label
          id="court-order-label"
          :class="{'error-text': invalidSection}"
        >Court Order Number</label>
      </v-col>
      <v-col
        cols="12"
        :sm="9"
      >
        <p class="grey-text">
          Provide a court order number if this record is part of a court order or a plan of arrangement.
        </p>
        <v-form
          id="court-num-form"
          ref="courtNumRef"
          v-model="valid"
        >
          <v-text-field
            id="court-order-number-input"
            v-model="courtOrderNumber"
            label="Court Order Number"
            :rules="courtOrderNumRules"
            filled
          />
        </v-form>
      </v-col>
    </v-row>
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
        <p class="grey-text">
          If you want to withdraw a record that is part of a plan of arrangement,
          you must withdraw all records related to the arrangement.
          This must be done before any of the terms of the arrangement take effect.
        </p>
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
import { FormIF } from '@bcrs-shared-components/interfaces'

@Component({})
export default class PlanOfArrangement extends Vue {
  // Refs
  $refs!: Vue['$refs'] & {
    courtNumRef: FormIF
  }

  /** Draft court order number. */
  @Prop({ default: '' }) readonly draftCourtOrderNumber!: string

  /** Draft plan of arrangement. */
  @Prop({ default: false }) readonly hasDraftPlanOfArrangement!: boolean

  /** Draft come into effect. */
  @Prop({ default: false }) readonly hasDraftComeIntoEffect!: boolean

  /** Prompt Error. */
  @Prop({ default: false }) readonly invalidSection!: boolean

  // Local properties
  private courtOrderNumber = ''
  private courtOrderNumRules = []
  private planOfArrangement = false
  private comeIntoEffect = false
  private valid = false

  /** Called when component is mounted. */
  mounted (): void {
    // Set default draft values if they exist
    if (this.draftCourtOrderNumber) this.courtOrderNumber = this.draftCourtOrderNumber
    if (this.hasDraftPlanOfArrangement) this.planOfArrangement = this.hasDraftPlanOfArrangement
    if (this.hasDraftComeIntoEffect) this.comeIntoEffect = this.hasDraftComeIntoEffect
  }

  /** Clear rules and reset validations. */
  private clearValidations (): void {
    this.courtOrderNumRules = []
    this.$refs.courtNumRef.resetValidation()
  }

  /** Triggers the form validation. */
  public validate (): boolean {
    return this.$refs.courtNumRef.validate()
  }

  @Watch('planOfArrangement')
  @Watch('courtOrderNumber')
  @Watch('courtOrderNumberRequired')
  validateCourtNum (): void {
    // Apply TextField rules
    this.courtOrderNumRules = [
      (v: string) => (!v || !/^\s/g.test(v)) || 'Invalid spaces', // leading spaces
      (v: string) => (!v || !/\s$/g.test(v)) || 'Invalid spaces', // trailing spaces
      (v: string) => (!v || !(v.length < 5)) || 'Court order number is invalid', // too short
      (v: string) => (!v || !(v.length > 20)) || 'Court order number is invalid' // too long
    ]
    this.$refs.courtNumRef.validate()
  }

  @Watch('planOfArrangement')
  private onPlanOfArrangementChange (newVal: boolean): void {
    // If planOfArrangement is false, reset comeIntoEffect to false
    if (!newVal) {
      this.comeIntoEffect = false
    }
  }

  /** Emit court order number. */
  @Watch('courtOrderNumber')
  @Emit('courtNumber')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitCourtNumber (courtNumber: string): void {}

  /** Emit plan of arrangement. */
  @Watch('planOfArrangement')
  @Emit('planOfArrangement')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitPoa (planOfArrangement: boolean): void {}

  /** Emit come into effect. */
  @Watch('comeIntoEffect')
  @Emit('comeIntoEffect')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitEffect (planOfArrangement: boolean): void {}

  /** Emit valid. */
  @Watch('valid')
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitValid (valid: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#poa-label, #court-order-label {
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
