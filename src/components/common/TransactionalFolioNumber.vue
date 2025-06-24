<template>
  <div id="transactional-folio-number">
    <header>
      <h2>
        Folio or Reference Number (Optional)
      </h2>
      <p>
        This is meant for your own tracking purposes and will appear on your receipt.
      </p>
    </header>

    <v-card flat>
      <v-row
        no-gutters
        class="pl-4 pr-4 pt-4"
      >
        <v-col
          cols="12"
          sm="3"
        >
          <label class="title-label">Folio or Reference Number</label>
        </v-col>
        <v-col
          cols="12"
          sm="9"
        >
          <v-text-field
            id="folio-number-input"
            ref="folioNumberInput"
            v-model.trim="localFolioNumber"
            filled
            persistent-hint
            autocomplete="chrome-off"
            label="Folio or Reference Number (Optional)"
            :name="Math.random()"
            :rules="[ v => (!v || v.trim().length <= 50) || 'Cannot exceed 50 characters']"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Watch, Vue } from 'vue-property-decorator'

@Component({})
export default class TransactionalFolioNumber extends Vue {
  // Refs
  $refs!: {
    folioNumberInput: any
  }

  /** Account Folio Number prop. */
  @Prop({ default: null }) readonly accountFolioNumber!: string

  /** Transactional Folio Number prop. */
  @Prop({ default: null }) readonly transactionalFolioNumber!: string

  // Local properties
  localFolioNumber = ''

  /** Called when component is mounted. */
  mounted (): void {
    // restore transactional FN from draft if it exists, otherwise leave field empty
    this.localFolioNumber = this.transactionalFolioNumber || ''
    // Emit initial validity
    this.emitValid(this.isValid)
  }

  /** Whether the folio number is valid. */
  get isValid (): boolean {
    return (!this.$refs.folioNumberInput || this.$refs.folioNumberInput.valid)
  }

  @Watch('transactionalFolioNumber')
  onTransactionalFolioNumberPropChanged (val: string) {
    this.localFolioNumber = val
    this.emitValid(this.isValid)
  }

  @Watch('localFolioNumber')
  onLocalFolioNumberChanged (val: string): void {
    this.$refs.folioNumberInput?.validate()
    this.emitChange(val)
    this.emitValid(this.isValid)
  }

  /** Emits an event to change the transactional folio number. */
  @Emit('change')
  emitChange (val: string): string {
    return val
  }

  /** Emits an event indicating whether or not the form is valid. */
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitValid (valid: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
h2 {
  margin-bottom: 0.25rem;
  margin-top: 3rem;
  font-size: 1.125rem;
}

#transactional-folio-number {
  font-size: $px-16;
  color: $gray7;
}

.v-card {
  margin-top: 1rem;
  padding-bottom: 1.25rem;
  padding-top: 1rem;
  line-height: 1.2rem;
  font-size: $px-14;
}

.title-label {
  font-weight: bold;
  color: $gray9;
}

.v-input {
  margin-bottom: -8px;
}

.v-input:not(.error--text) {
  margin-bottom: -30px;
}
</style>
