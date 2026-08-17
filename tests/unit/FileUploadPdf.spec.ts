import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount, Wrapper } from '@vue/test-utils'
import FileUploadPdf from '@/components/common/FileUploadPdf.vue'
import { BusinessServices } from '@/services'
import { DocumentTypes, PageSizes } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { waitForUpdate } from '../wait-for-update'
import { vi } from 'vitest'

const vuetify = new Vuetify({})

// Note: the following arrayBuffer code is needed as vitest does not provide arrayBuffer
//  and this is required to test the scenarios where the pdf.js library is used.
File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer as any
Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer as any

// mock the console.log function to hide PDF library warnings (due to invalid mocked PDF files)
console.log = vi.fn()

function myArrayBuffer () {
  // this: File or Blob
  return new Promise(resolve => {
    const fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result)
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fr.readAsArrayBuffer(this)
  })
}

describe('FileUploadPdf component', () => {
  // mock some large PDF files
  const oneMBFile = new File([new ArrayBuffer(1048576)], 'oneMBFile.pdf', { type: 'application/pdf' })
  const elevenMBFile = new File([new ArrayBuffer(1048576 * 11)], 'elevenMBFile.pdf', { type: 'application/pdf' })

  let inputValueGet
  let inputValueSet
  let inputValue = ''
  let inputFilesGet

  // Note: The DataTransfer object can be used to assign files to the file input but this isn't supported
  //  by JSDOM yet. The following(setFileInput and the code in beforeEach functions) code was required
  //  in order to set the file associated with the file input.
  function setupFileInput (fileInput: Wrapper<Vue>) {
    Object.defineProperty(fileInput.element, 'files', {
      get: inputFilesGet
    })
    Object.defineProperty(fileInput.element, 'value', {
      get: inputValueGet,
      set: inputValueSet
    })
  }

  beforeEach(() => {
    inputFilesGet = vi.fn()
    inputValueGet = vi.fn().mockReturnValue(inputValue)
    inputValueSet = vi.fn().mockImplementation(v => { inputValue = v })
  })

  it('displays file upload pdf component', async () => {
    const wrapper = mount(FileUploadPdf, {
      vuetify
    })

    expect(wrapper.find('.file-upload-pdf').exists()).toBe(true)

    wrapper.destroy()
  })

  it('accepts when file is not required and not provided', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: {
        inputFile: null,
        isRequired: false
      },
      vuetify
    })

    const fileInput = wrapper.find('.file-upload-pdf input[type="file"]')
    await fileInput.trigger('change')
    expect(wrapper.find('.error--text .v-messages__message').exists()).toBeFalsy()

    wrapper.destroy()
  })

  it('rejects when file is required and not provided', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: {
        inputFile: null,
        isRequired: true
      },
      vuetify
    })

    const fileInput = wrapper.find('.file-upload-pdf input[type="file"]')
    await fileInput.trigger('change')
    const messages = wrapper.findAll('.error--text .v-messages__message')
    expect(messages.length).toBe(1)
    expect(messages.at(0).text()).toBe('File is required')

    wrapper.destroy()
  })

  it('accepts when file size is below max size', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxSize: 10 * 1024 },
      vuetify
    })

    const fileInput = wrapper.find('input[type="file"]')
    setupFileInput(fileInput)
    inputValue = oneMBFile.name
    inputFilesGet.mockReturnValue([oneMBFile])
    await fileInput.trigger('change')
    const messages = wrapper.findAll('.v-messages__message')
    expect(messages.length).toBe(1)
    expect(messages.at(0).text()).toBe('Processing...')

    wrapper.destroy()
  })

  it('rejects when max file size is exceeded', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxSize: 10 * 1024 },
      vuetify
    })

    const fileInput = wrapper.find('input[type="file"]')
    setupFileInput(fileInput)
    inputValue = elevenMBFile.name
    inputFilesGet.mockReturnValue([elevenMBFile])
    await fileInput.trigger('change')
    await waitForUpdate(2)
    const messages = wrapper.findAll('.error--text .v-messages__message')
    expect(messages.length).toBe(1)
    expect(messages.at(0).text()).toBe('Invalid PDF')

    wrapper.destroy()
  })

  it('rejects encrypted files', async () => {
    const fs = require('fs')
    const data = fs.readFileSync('./tests/unit/test-data/encrypted.pdf', 'utf8')
    const encryptedPdf = new File([data], 'encrypted.pdf', { type: 'application/pdf' })
    const wrapper = mount(FileUploadPdf, {
      vuetify
    })

    const fileInput = wrapper.find('input[type="file"]')
    setupFileInput(fileInput)
    inputValue = encryptedPdf.name
    inputFilesGet.mockReturnValue([encryptedPdf])
    await fileInput.trigger('change')
    await waitForUpdate(2)
    const messages = wrapper.findAll('.error--text .v-messages__message')
    expect(messages.length).toBe(1)
    expect(messages.at(0).text()).toBe('File must be unencrypted')

    wrapper.destroy()
  })

  it('rejects copy, print and edit locked file', async () => {
    const fs = require('fs')
    const data = fs.readFileSync('./tests/unit/test-data/copyPrintEditContentLocked.pdf', 'utf8')
    const encryptedPdf =
      new File([data], 'copyPrintEditContentLocked.pdf', { type: 'application/pdf' })
    const wrapper = mount(FileUploadPdf, {
      vuetify
    })

    const fileInput = wrapper.find('input[type="file"]')
    setupFileInput(fileInput)
    inputValue = encryptedPdf.name
    inputFilesGet.mockReturnValue([encryptedPdf])
    await fileInput.trigger('change')
    await waitForUpdate(2)
    const messages = wrapper.findAll('.error--text .v-messages__message')
    expect(messages.length).toBe(1)
    expect(messages.at(0).text()).toBe('File content cannot be locked')

    wrapper.destroy()
  })

  it('update:file event emitted when file is selected', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxSize: 10 * 1024 },
      vuetify
    })

    const fileInput = wrapper.find('input[type="file"]')
    setupFileInput(fileInput)
    inputValue = oneMBFile.name
    inputFilesGet.mockReturnValue([oneMBFile])
    await fileInput.trigger('change')
    await waitForUpdate(1)
    expect(wrapper.emitted('update:file').pop()[0]).toEqual(oneMBFile)

    wrapper.destroy()
  })

  describe('isPageSize', () => {
    /**
     * Replaces the real pdf.js library with a small mock containing
     * the PDF document/pages needed for each isPageSize test.
     */
    function mockPdfDocument (vm: any, viewports: Array<{ width: number, height: number }>) {
      const getPage = vi.fn().mockImplementation(async (pageNum: number) => ({
        getViewport: vi.fn().mockReturnValue(viewports[pageNum - 1])
      }))

      const getDocument = vi.fn().mockReturnValue({
        promise: Promise.resolve({
          numPages: viewports.length,
          getPage
        })
      })

      vm.pdfjsLib = {
        getDocument
      }

      return {
        getDocument,
        getPage
      }
    }

    it('accepts a Letter-size portrait PDF', async () => {
      const wrapper = mount(FileUploadPdf, {
        vuetify
      })

      const vm: any = wrapper.vm

      const { getDocument, getPage } = mockPdfDocument(vm, [
        {
          width: 612,
          height: 792
        }
      ])

      const file = new File(
        [new ArrayBuffer(100)],
        'letter-portrait.pdf',
        { type: 'application/pdf' }
      )

      const result = await vm.isPageSize(file, PageSizes.LETTER_PORTRAIT)

      expect(result).toBe(true)
      expect(getDocument).toHaveBeenCalled()
      expect(getPage).toHaveBeenCalledWith(1)

      const page = await getPage.mock.results[0].value
      expect(page.getViewport).toHaveBeenCalledWith({ scale: 1 })

      wrapper.destroy()
    })

    it('accepts a Letter-size PDF whose MediaBox is landscape but is rotated to portrait', async () => {
      const wrapper = mount(FileUploadPdf, {
        vuetify
      })

      const vm: any = wrapper.vm

      // The PDF is stored with a 792 x 612 point MediaBox (landscape),
      // but /Rotate 270 makes the displayed page 612 x 792 (portrait).

      const getPage = vi.fn().mockResolvedValue({
        getViewport: vi.fn().mockReturnValue({
          width: 612,
          height: 792
        })
      })

      const getDocument = vi.fn().mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage
        })
      })

      vm.pdfjsLib = {
        getDocument
      }

      const file = new File(
        [new ArrayBuffer(100)],
        'letter-rotated.pdf',
        { type: 'application/pdf' }
      )

      const result = await vm.isPageSize(file, PageSizes.LETTER_PORTRAIT)

      expect(result).toBe(true)
      expect(getDocument).toHaveBeenCalled()
      expect(getPage).toHaveBeenCalledWith(1)

      const page = await getPage.mock.results[0].value
      expect(page.getViewport).toHaveBeenCalledWith({ scale: 1 })

      wrapper.destroy()
    })

    it('accepts minor page-size rounding differences', async () => {
      const wrapper = mount(FileUploadPdf, {
        vuetify
      })

      const vm: any = wrapper.vm

      const { getDocument } = mockPdfDocument(vm, [
        {
          // 612.5 / 72 = 8.5069 inches
          // 792.5 / 72 = 11.0069 inches
          // Both are within the 0.02-inch tolerance.
          width: 612.5,
          height: 792.5
        }
      ])

      const file = new File(
        [new ArrayBuffer(100)],
        'letter-rounded.pdf',
        { type: 'application/pdf' }
      )

      const result = await vm.isPageSize(file, PageSizes.LETTER_PORTRAIT)

      expect(result).toBe(true)
      expect(getDocument).toHaveBeenCalled()

      wrapper.destroy()
    })

    it('rejects a PDF with an incorrect page size', async () => {
      const wrapper = mount(FileUploadPdf, {
        vuetify
      })

      const vm: any = wrapper.vm

      mockPdfDocument(vm, [
        {
          width: 612,
          height: 720
        }
      ])

      const file = new File(
        [new ArrayBuffer(100)],
        'incorrect-size.pdf',
        { type: 'application/pdf' }
      )

      const result = await vm.isPageSize(file, PageSizes.LETTER_PORTRAIT)

      expect(result).toBe(false)

      wrapper.destroy()
    })

    it('rejects when any page has an incorrect page size', async () => {
      const wrapper = mount(FileUploadPdf, {
        vuetify
      })

      const vm: any = wrapper.vm

      const { getPage } = mockPdfDocument(vm, [
        {
          width: 612,
          height: 792
        },
        {
          width: 612,
          height: 720
        }
      ])

      const file = new File(
        [new ArrayBuffer(100)],
        'mixed-page-sizes.pdf',
        { type: 'application/pdf' }
      )

      const result = await vm.isPageSize(file, PageSizes.LETTER_PORTRAIT)

      expect(result).toBe(false)
      expect(getPage).toHaveBeenCalledTimes(2)

      wrapper.destroy()
    })
  })

  // --- multi-file mode (maxFiles > 1) ---

  it('renders the Add a Document button in multi-file mode', () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxFiles: 5, userId: 'user-1' },
      vuetify
    })

    // shows the multi-file UI, not the single-file input
    expect(wrapper.find('#add-document-button').exists()).toBe(true)
    expect(wrapper.find('.file-upload-pdf').exists()).toBe(false)

    wrapper.destroy()
  })

  it('validate() is invalid when required with no documents (multi-file)', () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxFiles: 5, isRequired: true, userId: 'user-1' },
      vuetify
    })
    const vm: any = wrapper.vm

    expect(vm.validate()).toBe(false)

    wrapper.destroy()
  })

  it('validate() is valid when optional with no documents (multi-file)', () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxFiles: 5, isRequired: false, userId: 'user-1' },
      vuetify
    })
    const vm: any = wrapper.vm

    expect(vm.validate()).toBe(true)

    wrapper.destroy()
  })

  it('adds an uploaded document to the list and emits files/fileKeys (multi-file)', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxFiles: 5, userId: 'user-1' },
      vuetify
    })
    const vm: any = wrapper.vm

    // bypass the PDF validation and upload (covered by single-file tests / services)
    vi.spyOn(vm, 'validateFile').mockResolvedValue(true)
    vi.spyOn(vm, 'uploadFile').mockResolvedValue('test-key')

    await vm.onAddFile(oneMBFile)

    expect(vm.documents.length).toBe(1)
    expect(wrapper.emitted('update:files').pop()[0]).toEqual([oneMBFile])
    expect(wrapper.emitted('update:fileKeys').pop()[0]).toEqual(['test-key'])

    wrapper.destroy()
  })

  it('does not add beyond maxFiles (multi-file)', async () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxFiles: 1, userId: 'user-1' },
      vuetify
    })
    const vm: any = wrapper.vm

    // NB: maxFiles=1 still renders single-file mode, so force multi-file state directly
    vm.documents = [{ fileName: 'a.pdf', file: oneMBFile, fileKey: 'k1' }]
    // attempt to add when already at the max
    await vm.onAddFile(oneMBFile)

    expect(vm.documents.length).toBe(1)
    expect(vm.errorMessages[0]).toBe('Maximum 1 files')

    wrapper.destroy()
  })

  it('removeFile removes a document and emits the updated arrays (multi-file)', () => {
    const wrapper = mount(FileUploadPdf, {
      propsData: { maxFiles: 5, userId: 'user-1' },
      vuetify
    })
    const vm: any = wrapper.vm

    vm.documents = [{ fileName: 'a.pdf', file: oneMBFile, fileKey: 'k1' }]
    vm.removeFile(0)

    expect(vm.documents.length).toBe(0)
    expect(wrapper.emitted('update:fileKeys').pop()[0]).toEqual([])
    expect(wrapper.emitted('update:files').pop()[0]).toEqual([])

    wrapper.destroy()
  })

  it('uploadFile calls uploadDocument with the document properties and returns the key', async () => {
    const uploadDocument = vi.spyOn(BusinessServices, 'uploadDocument').mockResolvedValue(
      { key: 'CORP-DS0100001003', documentServiceId: 'DS0100001003' }
    )

    const wrapper = mount(FileUploadPdf, {
      propsData: {
        userId: 'user-1',
        filingType: FilingTypes.COURT_ORDER,
        entityType: CorpTypeCd.BC_COMPANY,
        documentType: DocumentTypes.COURT_ORDER,
        businessIdentifier: 'BC1234567',
        filingId: 111
      },
      vuetify
    })
    const vm: any = wrapper.vm

    const key = await vm.uploadFile(oneMBFile)

    expect(uploadDocument).toHaveBeenCalledWith(oneMBFile, FilingTypes.COURT_ORDER,
      CorpTypeCd.BC_COMPANY, DocumentTypes.COURT_ORDER, 'user-1', 'BC1234567', 111)
    expect(key).toBe('CORP-DS0100001003')
    expect(vm.errorMessages.length).toBe(0)

    vi.restoreAllMocks()
    wrapper.destroy()
  })

  it('uploadFile sets an error message and returns null when the upload fails', async () => {
    vi.spyOn(BusinessServices, 'uploadDocument').mockRejectedValue(new Error('went wrong'))

    const wrapper = mount(FileUploadPdf, {
      propsData: { userId: 'user-1' },
      vuetify
    })
    const vm: any = wrapper.vm

    const key = await vm.uploadFile(oneMBFile)

    expect(key).toBeNull()
    expect(vm.errorMessages[0]).toBe('An error occurred while uploading. Please try again.')

    vi.restoreAllMocks()
    wrapper.destroy()
  })
})
