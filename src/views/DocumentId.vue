<template>
  <v-card
    id="document-id-card"
    :class="[cardPadding, { 'border-error-left': showBorderError }]"
    flat
  >
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="3"
      >
        <label
          class="title-label"
          :class="{ 'error-text': showBorderError }"
          for="doc-id-field"
        >
          Document Id
        </label>
      </v-col>
      <v-col
        cols="12"
        sm="9"
      >
        <v-text-field
          id="doc-id-field"
          v-model="documentId"
          filled
          color="primary"
          maxlength="8"
          label="Document ID Number"
          :disabled="generateDocumentId"
          :error="!isVerifiedDocId && validate && !generateDocumentId"
          :error-messages="docIdError"
          hint="Enter the 8-digit Document ID number, also referred to as the barcode number"
          :persistent-hint="true"
        >
          <template #append>
            <v-progress-circular
              v-if="isVerifyingDocId"
              indeterminate
              color="primary"
              class="my-0"
              :size="25"
              :width="3"
            />
            <v-icon
              v-if="!isVerifyingDocId && isVerifiedDocId && !generateDocumentId"
              color="green-darken-2"
            >
              mdi-check
            </v-icon>
          </template>
        </v-text-field>

        <v-checkbox
          v-model="generateDocumentId"
          color="primary"
          class=""
        >
          <template #label>
            <span class="copy-label">
              Generate a Document ID Number upon filing.
            </span>

            <v-tooltip
              top
              transition="fade-transition"
              content-class="top-tooltip"
            >
              <template #activator="{ on, attrs }">
                <v-icon
                  class="ml-1"
                  color="primary"
                  size="20"
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-information-outline
                </v-icon>
              </template>
              <div>
                Upon registration, a Document ID will be generated, and a corresponding document record will be
                created
              </div>
            </v-tooltip>
          </template>
        </v-checkbox>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

@Component({})
export default class DocumentId extends Vue {
  /** Document Services Api URL. */
  @Prop({ default: false }) readonly docApiUrl!: string

  /** Document Services Api Key. */
  @Prop({ default: false }) readonly docApiKey!: string

  /** Validation flag. */
  @Prop({ default: false }) readonly validate!: boolean

  /** Card padding overrides */
  @Prop({ default: ['pt-10 pl-4 pb-3 pr-4'] }) readonly cardPadding!: Array<string>

  // local variables
  documentId = ''
  isVerifyingDocId = false
  isVerifiedDocId = false
  generateDocumentId = false
  docIdError = []

  /** Getter for the Document ID error styling */
  get showBorderError (): boolean {
    return this.validate && !this.isValidDocumentId
  }

  /** Getter for the Document ID validation state */
  get isValidDocumentId (): boolean {
    return this.isVerifiedDocId || this.generateDocumentId
  }

  /**
   * Validates the Document ID by making an API call to the document services.
   * Constructs the URL and headers for the API call, including authorization and account information.
   * If the API call returns status 200, the Document ID is not unique.
   * If the API call returns status 400, the Document ID failed the checksum format.
   * If the API call returns status 404, the Document ID is unique and valid.
   * If the API call returns any other status, the document ID is not valid.
   * *
   * @returns {Promise<number>} - The status code of the API response.
   */
  async fetchDocumentIdStatus (): Promise<number> {
    // Construct the URL for the API call
    const url = `${this.docApiUrl}/documents/verify/${this.documentId}`

    // Set up the headers for the API call
    const config = { headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)}`,
      'x-apikey': this.docApiKey }
    }

    // Add the Account-Id header if the current account is available
    const currentAccount = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
    if (currentAccount) {
      const accountInfo = JSON.parse(currentAccount)
      config.headers['Account-Id'] = accountInfo.id
    }

    try {
      // Make the API call to validate the Document ID. If the call is successful(200), the Document ID is not unique
      const test = await axios.get(url, config)
      return test.status
    } catch (error: any) {
      // If the API call fails, return the status code
      if ([400, 404].includes(error.response.status)) {
        return error.response.status
      }
    }
  }

  /**
   * Validates the Document ID if its length is 8 characters.
   * Depending on the API response, it sets the appropriate error messages and verification status.
   * If the Document ID is verified, it emits the Document ID.
   */
  @Watch('documentId')
  async onDocumentIdComplete (): Promise<void> {
    // Validate the document id if the length is 8 characters
    if (this.documentId?.length === 8) {
      this.isVerifyingDocId = true
      // Validate the document ID
      const documentIdStatus = await this.fetchDocumentIdStatus()
      switch (documentIdStatus) {
        case 200:
          this.docIdError = ['Must be unique number']
          this.isVerifiedDocId = false
          break
        case 400:
          this.docIdError = ['Document ID is invalid']
          this.isVerifiedDocId = false
          break
        case 404:
          this.docIdError = null
          this.isVerifiedDocId = true
          break
        default:
          this.docIdError = ['Document ID request failed']
          this.isVerifiedDocId = false
      }

      // Emit the document ID if it is verified
      !!this.isVerifiedDocId && this.emitDocumentId(this.documentId)
    } else {
      // Reset verification status and error display if the document ID length is not 8
      this.isVerifiedDocId = false
      this.emitDocumentId('')
    }

    // Reset the verifying status
    this.isVerifyingDocId = false
  }

  /** Resets the documentId, isVerifyingDocId, and docIdError properties when `generateDocumentId` changes. */
  @Watch('generateDocumentId')
  onGenerateDocumentId (): void {
    this.documentId = ''
    this.isVerifyingDocId = false
    this.docIdError = null
  }

  /** Emits an event to confirm the validation state of the Document ID. */
  @Watch('isValidDocumentId')
  onValidationUpdate (): void {
    this.emitIsValidDocumentId(!!this.isValidDocumentId)
  }

  /**
   * Emits an event to update the Document ID.
   * @param docId - The Document ID to emit.
   */
  @Emit('updateDocId')
  emitDocumentId (docId: string): string { return docId }

  /**
   * Emits an event to update the validation state.
   * @param isValid - The validation value to emit.
   */
  @Emit('isValid')
  emitIsValidDocumentId (isValid: boolean): boolean { return isValid }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
.title-label {
  color: $gray9;
  font-weight: bold;
}
.copy-text, .copy-label {
  font-size: $px-14;
  color: black;
}
.border-error-left {
  border-left: 3px solid #d3272c;
}
.error-text {
  color: #d3272c;
}
</style>
