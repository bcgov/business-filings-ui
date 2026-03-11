import axios from 'axios'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { GetCurrentAccount } from '@/utils'

/**
 * This file exports an instance of Axios with some extra request headers,
 * which is used by the various services (Legal, Auth, etc).
 */

// create a new, independent instance of Axios
const instance = axios.create()

// add request interceptor
instance.interceptors.request.use(
  request => {
    const authApiUrl = import.meta.env.VUE_APP_AUTH_API_URL
    const payApiUrl = import.meta.env.VUE_APP_PAY_API_URL

    // don't add common headers for Minio endpoint
    if (request.url?.startsWith('https://minio')) {
      return request
    }

    // add headers only if Vitest isn't running as it breaks some tests
    if (import.meta.env.VITEST === undefined) {
      // add  headers common to all APIs
      const kcToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      request.headers.common['Authorization'] = `Bearer ${kcToken}`
      request.headers.common['App-Name'] = import.meta.env.APP_NAME
      request.headers.common['Account-Id'] = GetCurrentAccount()?.id || 0

      // add headers specific to various APIs
      switch (true) {
        case request.url?.startsWith(authApiUrl):
          request.headers.common['X-Apikey'] = import.meta.env.VUE_APP_AUTH_API_KEY
          break

        case request.url?.startsWith(payApiUrl):
          request.headers.common['X-Apikey'] = import.meta.env.VUE_APP_PAY_API_KEY
          break

        default:
          // used by Business API URL
          request.headers.common['X-Apikey'] = import.meta.env.VUE_APP_BUSINESS_API_KEY
          break
      }
    }

    return request
  },
  error => Promise.reject(error)
)

// add response interceptor
instance.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export default instance
