<template>
  <div id="reference-number-section">
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="3"
        class="pr-4"
      >
        <label
          id="reference-number-label"
        >Folio or Reference Number</label>
      </v-col>
      <v-col
        cols="12"
        :sm="9"
      >
        <v-form
          id="reference-num-form"
          ref="refNumRef"
          v-model="valid"
        >
          <v-text-field
            id="reference-number-input"
            v-model="referenceNumber"
            label="Folio or Reference Number (Optional)"
            :rules="referenceNumRules"
            filled
          />
        </v-form>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'
import { FormIF } from '@bcrs-shared-components/interfaces'

@Component({})
export default class ReferenceNumber extends Vue {
    // Refs
    $refs!: Vue['$refs'] & {
        refNumRef: FormIF
    }

    /** Prompt the validations. Used for global validations. */
    @Prop({ default: false }) readonly autoValidation!: boolean

    /** Draft court order number. */
    @Prop({ default: '' }) readonly draftReferenceNumber!: string

    // Local properties
    private referenceNumber = ''
    private referenceNumRules = []
    private valid = false

    /** Called when component is mounted. */
    mounted (): void {
      // Set default draft values if they exist
      if (this.draftReferenceNumber) this.referenceNumber = this.draftReferenceNumber
    }

    /** Clear rules and reset validations. */
    private clearValidations (): void {
      this.referenceNumRules = []
      this.$refs.refNumRef.resetValidation()
    }

    /** Triggers the form validation. */
    public validate (): boolean {
      return this.$refs.refNumRef.validate()
    }

    @Watch('autoValidation')
    @Watch('referenceNumber')
    validateReferenceNum (): void {
      if (this.autoValidation) {
        // Apply TextField rules
        this.referenceNumRules = [
          (v: string) => (!v || !/^\s/g.test(v)) || 'Invalid spaces', // leading spaces
          (v: string) => (!v || !/\s$/g.test(v)) || 'Invalid spaces', // trailing spaces
          (v: string) => (!v || !(v.length > 20)) || 'Folio or Reference number is invalid' // too long
        ]
        this.$refs.refNumRef.validate()
      } else this.clearValidations()
    }

    /** Emit reference number. */
    @Watch('referenceNumber')
    @Emit('referenceNumber')
    emitReferenceNumber (): void {}

    /** Emit valid. */
    @Watch('valid')
    @Emit('valid')
    emitValid (): void {}
}
</script>

  <style lang="scss" scoped>
  @import '@/assets/styles/theme.scss';

  #reference-number-label {
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
