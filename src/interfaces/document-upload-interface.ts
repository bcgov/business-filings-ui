/** Response object from BusinessServices.uploadDocument(). */
export interface DocumentUploadIF {
  /** The file key to store in the filing, eg "CORP-DS0100001003" (or a Minio key on the legacy flow). */
  key: string
  /** The DRS document service id, eg "DS0100001003" (absent on the legacy flow). */
  documentServiceId?: string
}
