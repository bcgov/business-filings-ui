<template>
  <v-card flat>
    <v-row
      no-gutters
      class="pl-4 pr-4 pt-4"
    >
      <v-col
        cols="12"
        sm="3"
      >
        <label class="title-label">Legal Name</label>
      </v-col>
      <v-col
        cols="12"
        sm="9"
      >
        <v-text-field
          id="certified-by-textfield"
          ref="certifyTextfieldRef"
          filled
          persistent-hint
          label="Person's legal name"
          :disabled="disableEdit"
          :value="certifiedBy"
          :rules="[ v => !!v || 'A person\'s legal name is required.']"
          @input="emitCertifiedBy($event)"
        />
        <v-checkbox
          ref="checkboxRef"
          :value="isCertified"
          @change="emitIsCertified($event)"
        >
          <template #label>
            <div
              v-if="IsAuthorized(AuthorizedActions.THIRD_PARTY_CERTIFY_STMT)"
              class="certify-stmt"
            >
              <strong>{{ trimmedCertifiedBy || "[Legal Name]" }}</strong> certifies that they have relevant
              knowledge of the {{ entityDisplay || "business" }} and are authorized to make this filing.
            </div>
            <div
              v-else
              class="certify-stmt"
            >
              I, <strong>{{ trimmedCertifiedBy || "[Legal Name]" }}</strong>, certify that I have relevant
              knowledge of the {{ entityDisplay || "business" }} and I am authorized to make this filing.
            </div>
          </template>
        </v-checkbox>
        <p class="certify-clause signature-date">
          <strong>Date:</strong> {{ formattedCurrentDate || '[unknown]' }}
        </p>
        <p class="certify-clause">
          <strong v-if="message">Note:</strong> {{ message }}
        </p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { DateUtilities } from '@/services'
import { useRootStore } from '@/stores'
import { AuthorizedActions } from '@/enums'
import { IsAuthorized } from '@/utils'
@Component({})
export default class Certify extends Vue {
  // for template
  readonly AuthorizedActions = AuthorizedActions
  readonly IsAuthorized = IsAuthorized

  // Refs
  $refs!: {
    certifyTextfieldRef: any,
    checkboxRef: any
  }

  @Getter(useRootStore) getCurrentDate!: string

  /** Certified By prop. */
  @Prop({ default: '' }) readonly certifiedBy!: string

  /** Is Certified prop. */
  @Prop({ default: false }) readonly isCertified!: boolean

  /** Message prop. */
  @Prop({ default: '' }) readonly message!: string

  /** Entity Display prop. */
  @Prop({ default: '' }) readonly entityDisplay!: string

  /** Prompt the validations. Used for global validations. */
  @Prop({ default: false }) readonly validateForm!: boolean

  /** Whether to disable the Certified By input field. */
  @Prop({ default: false }) readonly disableEdit!: boolean

  // local properties
  certifyName = ''
  checkboxState = false

  /** Called when component is created. */
  created (): void {
    // inform parent of initial validity
    this.emitValid(!!this.trimmedCertifiedBy && this.isCertified)
  }

  get formattedCurrentDate (): string {
    const date = DateUtilities.yyyyMmDdToDate(this.getCurrentDate)
    return DateUtilities.dateToPacificDate(date, true)
  }

  /** The trimmed "Certified By" string (may be ''). */
  get trimmedCertifiedBy (): string {
    // remove repeated inline whitespace, and leading/trailing whitespace
    return this.certifiedBy && this.certifiedBy.replace(/\s+/g, ' ').trim()
  }

  /** Validate business name field */
  @Watch('validateForm')
  validateBusinessName (): void {
    if (this.validateForm && !this.certifyName) {
      this.$refs.certifyTextfieldRef.validate()
      this.$refs.certifyTextfieldRef.error = true
    }

    if (this.validateForm && !this.checkboxState) {
      this.$refs.checkboxRef.validate()
      this.$refs.checkboxRef.error = true
    }
  }

  /** Emits an event to update the Certified By prop. */
  @Emit('update:certifiedBy')
  emitCertifiedBy (certifiedBy: string): string {
    // remove repeated inline whitespace, and leading/trailing whitespace
    certifiedBy = certifiedBy && certifiedBy.replace(/\s+/g, ' ').trim()
    this.emitValid(!!certifiedBy && this.isCertified)
    return certifiedBy
  }

  /** Emits an event to update the Is Certified prop. */
  @Emit('update:isCertified')
  emitIsCertified (isCertified: boolean): boolean {
    this.emitValid(!!this.trimmedCertifiedBy && isCertified)
    this.checkboxState = isCertified
    return isCertified
  }

  /** Emits an event indicating whether or not the form is valid. */
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitValid (valid: boolean): void {}
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

.signature-date {
  color: $gray7;
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

// vertically align the ripple circle with the check box
:deep() {
  .v-input--selection-controls__ripple {
    margin-top: -3px;
  }
}
</style>
