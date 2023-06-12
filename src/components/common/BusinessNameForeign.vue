<template>
  <v-card flat id="business-name-foreign-jurisdiction">
    <v-row no-gutters>
      <v-col cols="12" sm="3">
        <label class="title-label">Business Name in the Foreign Jurisdiction</label>
      </v-col>
      <v-col cols="12" sm="9">
        <v-text-field
          ref="textarea"
          id="business-name-text-field"
          filled
          label="Business Name in the Foreign Jurisdiction"
          :value="draftBusinessName"
          :rules="[ v => !!v || 'A Business Name in the Foreign Jurisdiction is required.']"
          @input="emitBusinessName($event)"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class BusinessNameForeign extends Vue {
  // Refs
  $refs!: {
    textarea: any
  }

  /** Draft Business Name. */
  @Prop({ default: '' }) readonly draftBusinessName!: string

  businessName = ''

  /** Called when component is mounted. */
  created (): void {
    this.businessName = this.draftBusinessName
    this.emitBusinessName(this.businessName)
    // inform parent of initial validity
    this.emitValid(!!this.trimmedBusinessName)
  }

  /** The trimmed Business Name string (may be ''). */
  get trimmedBusinessName (): string {
    // remove repeated inline whitespace, and leading/trailing whitespace
    return this.businessName?.replace(/\s+/g, ' ').trim()
  }

  /** Emits an event to update the business name. */
  @Emit('update:businessName')
  emitBusinessName (businessName: string): string {
    // remove repeated inline whitespace, and leading/trailing whitespace
    businessName = businessName?.replace(/\s+/g, ' ').trim()
    this.emitValid(!!businessName)
    return businessName
  }

  /** Emits an event indicating whether or not the business name is valid. */
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitValid (valid: boolean): void { /* no empty function */ }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
.title-label {
  color: $gray9;
  font-weight: bold;
}
</style>
