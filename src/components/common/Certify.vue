<template>
  <v-card flat>
    <v-row no-gutters class="pl-4 pr-4 pt-4">
      <v-col cols="12" sm="3">
        <label class="title-label">Legal Name</label>
      </v-col>
      <v-col cols="12" sm="9">
        <v-text-field
          ref="certifyTextfieldRef"
          filled
          persistent-hint
          id="certified-by-textfield"
          label="Person's legal name"
          hint="Legal name of authorized person"
          :value="certifiedBy"
          :rules="[ v => !!v || 'A person\'s legal name is required.']"
          @input="emitCertifiedBy($event)"
        />
        <v-checkbox
          :value="isCertified"
          @change="emitIsCertified($event)"
        >
          <template v-slot:label>
            <div class="certify-stmt">
              I, <strong>{{trimmedCertifiedBy || '[Legal Name]'}}</strong>, certify that I have relevant knowledge
              of the {{entityDisplay || 'association'}} and that I am authorized to make this filing.
            </div>
          </template>
        </v-checkbox>
        <p class="certify-clause"><strong>Date:</strong> {{getCurrentDate}}</p>
        <p class="certify-clause">{{message}}</p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { useRootStore } from '@/stores'

@Component({})
export default class Certify extends Vue {
  @Getter(useRootStore) getCurrentDate!: string

  /** Certified By prop. */
  @Prop({ default: '' }) readonly certifiedBy!: string

  /** Is Certified prop. */
  @Prop({ default: false }) readonly isCertified!: boolean

  /** Message prop. */
  @Prop({ default: '' }) readonly message!: string

  /** Entity Display prop. */
  @Prop({ default: '' }) readonly entityDisplay!: string

  /** Called when component is created. */
  protected created (): void {
    // inform parent of initial validity
    this.emitValid(!!this.trimmedCertifiedBy && this.isCertified)
  }

  /** The trimmed "Certified By" string (may be ''). */
  get trimmedCertifiedBy (): string {
    // remove repeated inline whitespace, and leading/trailing whitespace
    return this.certifiedBy && this.certifiedBy.replace(/\s+/g, ' ').trim()
  }

  /** Emits an event to update the Certified By prop. */
  @Emit('update:certifiedBy')
  private emitCertifiedBy (certifiedBy: string): string {
    // remove repeated inline whitespace, and leading/trailing whitespace
    certifiedBy = certifiedBy && certifiedBy.replace(/\s+/g, ' ').trim()
    this.emitValid(!!certifiedBy && this.isCertified)
    return certifiedBy
  }

  /** Emits an event to update the Is Certified prop. */
  @Emit('update:isCertified')
  private emitIsCertified (isCertified: boolean): boolean {
    this.emitValid(!!this.trimmedCertifiedBy && isCertified)
    return isCertified
  }

  /** Emits an event indicating whether or not the form is valid. */
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitValid (valid: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-card {
  margin-top: 1rem;
  padding-bottom: 0.5rem;
  padding-top: 1rem;
  line-height: 1.2rem;
  font-size: $px-14;
}

.certify-clause {
  padding-left: 2rem;
  color: black;
  font-size: $px-14;
}

.certify-stmt {
  display: inline;
  font-size: $px-14;
  color: black;
}

.title-label {
  color: $gray9;
  font-weight: bold;
}

.v-input--checkbox::v-deep {
  .v-icon {
    margin-top: -1.25rem;
  }
}
</style>
