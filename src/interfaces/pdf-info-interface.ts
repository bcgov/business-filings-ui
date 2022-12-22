export interface PdfInfoIF {
  isEncrypted: boolean
  // content is locked when copying, editing or printing of document is restricted
  isContentLocked: boolean
}
