<template>
  <v-file-input
    id="file-upload-pdf"
    dense
    filled
    show-size
    color="primary"
    hide-details="auto"
    accept=".pdf"
    label="Select a file to upload"
    :value="file"
    :key="count"
    :error-messages="errorMessages"
    @change="onChange($event)"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import { AxiosResponse } from 'axios'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf'
import { PageSizes, PAGE_SIZE_DICT } from '@/enums'
import { PdfInfoIF, PresignedUrlIF } from '@/interfaces'

// set web worker
GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry')

@Component({})
export default class FileUploadPdf extends Vue {
  @Prop({ default: null }) readonly file!: File
  @Prop({ default: null }) readonly fileKey!: string
  @Prop({ default: true }) readonly isRequired!: boolean
  @Prop({ default: 0 }) readonly maxSize!: number // in MB
  @Prop({ default: null }) readonly pageSize!: PageSizes
  @Prop({ required: true }) readonly userId!: string

  // Network service functions
  @Prop({ required: true })
  readonly getPresignedUrl!: (fileName: string) => Promise<PresignedUrlIF>
  @Prop({ required: true })
  readonly uploadToUrl!: (url: string, file: File, key: string, userId: string) => Promise<AxiosResponse>

  /** Component key, used to force it to re-render. */
  protected count = 0

  /** Custom errors messages, use to put component into manual error mode. */
  protected errorMessages = [] as Array<string>

  /** Clears data and local state. */
  public reset (): void {
    // update parent
    this.updateFile(null)
    this.updateFileKey(null)

    // clear local state
    this.errorMessages = []

    // force re-render to clear file input
    this.count++
  }

  /** Resets input validation only. */
  public resetValidation (): void {
    this.errorMessages = []
  }

  /**
   * "Shallow validates" this component.
   * "Deep validation" is done when a file is selected.
   */
  public validate (): boolean {
    // force re-render to clear file input
    this.count++

    // Logic is as follows:
    // if (no file) and (required) => error
    // if (no file) and (not required) => valid
    // if (have file) and (have key) => valid
    // if (have file) and (no key) => error

    if (!this.file) {
      if (this.isRequired) {
        this.errorMessages = ['File is required']
        return false
      } else {
        this.errorMessages = []
        return true
      }
    }

    // if we have a file key then file is valid and was uploaded
    if (this.fileKey) return true

    return false
  }

  /** When file is selected or cleared, validates the file and uploads it. */
  protected async onChange (file: File): Promise<void> {
    // update parent for later reactivity
    this.updateFile(file)
    this.updateFileKey(null)

    // Logic is as follows:
    // if (no file) and (required) => error
    // if (no file) and (not required) => valid
    // if (have file) and (required) => depends on file validation
    // if (have file) and (not required) => depends on file validation

    if (!file) {
      if (this.isRequired) {
        this.errorMessages = ['File is required']
        return
      } else {
        this.errorMessages = []
        return
      }
    }

    // validate the file
    this.errorMessages = ['Processing...']
    const validFile = await this.validateFile(file)
    if (!validFile) return

    // upload the file
    this.errorMessages = ['Uploading...']
    const fileKey = await this.uploadFile(file)
    if (!fileKey) return

    // update parent
    this.updateFile(file)
    this.updateFileKey(fileKey)

    // if we get this far then everything succeeded
    this.errorMessages = []
  }

  /**
   * Validates the PDF file. Note that some of this is async.
   * @param file the file to validate
   * @returns whether file is valid
   */
  private async validateFile (file: File): Promise<boolean> {
    if (typeof file.arrayBuffer === 'undefined') return true

    // verify file size
    if (this.maxSize && (file?.size > (this.maxSize * 1024 * 1024))) {
      this.errorMessages = [`Exceeds maximum ${this.maxSize} MB file size`]
      return false
    }

    // try to retrieve file info
    const fileInfo = await this.retrieveFileInfo(file).catch(() => null as PdfInfoIF)
    if (fileInfo === null) {
      this.errorMessages = ['Invalid PDF']
      return false
    }

    // verify encryption
    if (fileInfo.isEncrypted) {
      this.errorMessages = ['File must be unencrypted']
      return false
    }

    // verify content lock
    if (fileInfo.isContentLocked) {
      this.errorMessages = ['File content cannot be locked']
      return false
    }

    // verify page sizes
    if (this.pageSize) {
      const valid = await this.isPageSize(file, this.pageSize).catch(() => null as boolean)
      if (valid === null) {
        this.errorMessages = ['Invalid PDF']
        return false
      }
      if (!valid) {
        this.errorMessages = [PAGE_SIZE_DICT[this.pageSize].validationErrorMsg]
        return false
      }
    }

    // if we get this far then file is valid
    return true
  }

  /**
   * Retrieves encryption and content lock info from PDF file.
   * Throws an exception on invalid PDF.
   * @param file the file to check
   * @return an object containing the file's info
   */
  private async retrieveFileInfo (file: File): Promise<PdfInfoIF> {
    try {
      const pdfBufferData = await file.arrayBuffer()
      const pdfData = new Uint8Array(pdfBufferData) // put it in a Uint8Array
      const pdf = await getDocument({ data: pdfData })
      const perms = await pdf.getPermissions()
      return { isEncrypted: false, isContentLocked: !!perms }
    } catch (err) {
      if (err.name === 'PasswordException') {
        return { isEncrypted: true, isContentLocked: true }
      }
      throw err // re-throw any other error
    }
  }

  /**
   * Checks whether PDF file is using specified page size by checking
   * width and height of all pages. Throws an exception on invalid PDF.
   * @param file the file to check
   * @param pageSize page size to check for
   * @return whether file is expected page size
   */
  private async isPageSize (file: File, pageSize: PageSizes): Promise<boolean> {
    const pageSizeInfo = PAGE_SIZE_DICT[pageSize]
    const pdfBufferData = await file.arrayBuffer()
    const pdfData = new Uint8Array(pdfBufferData) // put it in a Uint8Array
    const pdf = await getDocument({ data: pdfData })
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const p1 = await pdf.getPage(pageNum)
      const [x, y, w, h] = p1._pageInfo.view
      const width = w - x
      const height = h - y
      const isvalidPageSize =
        (width / pageSizeInfo.pointsPerInch === pageSizeInfo.width) &&
        (height / pageSizeInfo.pointsPerInch === pageSizeInfo.height)
      return isvalidPageSize
    }
    return true
  }

  /**
   * Uploads the file to a server.
   * @returns the file key on success, or null on failure
   */
  private async uploadFile (file: File): Promise<string> {
    try {
      // NB: will throw on API error
      const psu = await this.getPresignedUrl(file.name)

      // NB: will throw on API error
      const res = await this.uploadToUrl(psu.preSignedUrl, file, psu.key,
        this.userId)

      // check if successful
      if (res?.status === 200) {
        return psu.key
      }
      throw new Error()
    } catch (err) {
      this.errorMessages = ['An error occurred while uploading. Please try again.']
      return null
    }
  }

  @Emit('update:file')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateFile (file: File): void {}

  @Emit('update:fileKey')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateFileKey (fileKey: string): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

// more whitespace when file input is valid
.v-input {
  padding-bottom: 6px !important;
}

:deep(.v-file-input) {
  .v-input__append-outer {
    margin-top: 10px !important
  }

  .v-file-input__text {
    color: $app-blue !important;
  }

  .v-input__icon--prepend button {
    color: $app-blue !important;
  }

  .v-label {
    color: $gray7 !important;
  }

  // less whitespace when file input is invalid
  .v-text-field__details {
    margin-bottom: -2px !important;
  }
}
</style>
