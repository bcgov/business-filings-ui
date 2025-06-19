<template>
  <div
    id="transactional-folio-number"
  >
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

  // Props
  @Prop({ default: null }) readonly accountFolioNumber!: string
  @Prop({ default: null }) readonly transactionalFolioNumber!: string
  @Prop({ default: false }) readonly doValidate!: boolean

  // Local properties
  localFolioNumber = ''

  /** Called when component is mounted. */
  mounted (): void {
    // restore transactional FN if it exists, otherwise use account FN
    this.localFolioNumber = this.transactionalFolioNumber || this.accountFolioNumber
  }

  @Watch('transactionalFolioNumber')
  onTransactionalFolioNumberPropChanged (val: string) {
    this.localFolioNumber = val
  }

  @Watch('localFolioNumber')
  onLocalFolioNumberChanged (val: string): void {
    this.emitTransactionalFolioNumber(val)
  }

  @Emit('update:transactionalFolioNumber')
  emitTransactionalFolioNumber (val: string): string {
    return val
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

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
