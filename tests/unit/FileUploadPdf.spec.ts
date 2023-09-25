import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount, Wrapper } from '@vue/test-utils'
import FileUploadPdf from '@/components/common/FileUploadPdf.vue'
import { PageSizes } from '@/enums/PageSizes'
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
      propsData: { pdfPageSize: PageSizes.LETTER_PORTRAIT },
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
      propsData: { pdfPageSize: PageSizes.LETTER_PORTRAIT },
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
})
