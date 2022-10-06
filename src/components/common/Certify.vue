<template>
  <v-card flat>
    <div class="certify-container">
      <div class="certifiedby-container">
        <label>Legal Name</label>
        <div class="value certifiedby">
          <v-text-field
            filled
            persistent-hint
            id="certified-by-textfield"
            label="Person's legal name"
            hint="Legal name of authorized person"
            :value="certifiedBy"
            :rules="[ v => !!v || 'A person\'s legal name is required.']"
            @input="emitCertifiedBy($event)"
          />
        </div>
      </div>
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
      <p class="certify-clause">Date: {{getCurrentDate}}</p>
      <p class="certify-clause">{{message}}</p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  /** Certified By prop. */
  certifiedBy: { type: String, default: '' },
  /** Is Certified prop. */
  isCertified: { type: Boolean, default: false },
  /** Message prop. */
  message: { type: string, default: '' },
  /** Entity Display prop. */
  entityDisplay: { type: string, default: '' }
})

const emits = defineEmits<{
  (e: 'update:certifiedBy', value: boolean)
  (e: 'update:iscertified', value: boolean)
  (e: 'valid', value: boolean)
}>()

function emitCertifiedBy (certifiedBy: string): string {
  // remove repeated inline whitespace, and leading/trailing whitespace
  certifiedBy = certifiedBy && certifiedBy.replace(/\s+/g, ' ').trim()
  emitValid(!!certifiedBy && props.isCertified)
  return certifiedBy
}

function emitIsCertified (isCertified: boolean): boolean {
  emitValid(!!props.trimmedCertifiedBy && isCertified)
  return isCertified
}

const getCurrentDate = computed(() => store.getters['getCurrentDate'] as string)
/** The trimmed "Certified By" string (may be ''). */
const trimmedCertifiedBy = computed(() => props.certifiedBy && props.certifiedBy.replace(/\+/g, ' ').trim())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emitValid (valid: boolean): void {}

// the work done by created is now not required in compo api
// inform parent of initial validity
emitValid(!!trimmedCertifiedBy && props.isCertified)
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

.certify-container {
  padding: 1.25rem;
}

.certifiedby-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  > label:first-child {
    font-weight: 700;
    margin-bottom: 2rem;
  }
}

@media (min-width: 768px) {
  .certifiedby-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      padding-right: 2rem;
      width: 12rem;
    }
  }
}

.value.certifiedby {
  width: 100%;
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
</style>
