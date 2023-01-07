import { RestorationTypes } from '@/enums'

/**
 * A filing's restoration object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/restoration.json
 */
export interface RestorationIF {
  date: string // *** TODO: format?
  type: RestorationTypes
  expiry?: string // *** TODO: format?
}
