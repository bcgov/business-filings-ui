import axios from 'axios'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { GetCurrentAccount } from '@/utils'

/**
 * This file exports an instance of Axios with some extra request headers,
 * which is used by the various services (Legal, Auth, etc).
 */

const authApiGwUrl = import.meta.env.VUE_APP_AUTH_API_GW_URL
const payApiGwUrl = import.meta.env.VUE_APP_PAY_API_GW_URL

const instance = axios.create()

// add request interceptor
instance.interceptors.request.use(
  request => {
    // don't add common headers for Minio endpoint
    if (request.url?.startsWith('https://minio')) {
      return request
    }

    const keycloakToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    request.headers.common['Authorization'] = `Bearer ${keycloakToken}`
    request.headers.common['App-Name'] = import.meta.env.APP_NAME

    // add these headers only if Vitest isn't running as it breaks some tests
    if (import.meta.env.VITEST === undefined) {
      request.headers.common['Account-Id'] = GetCurrentAccount()?.id || 0
      // add headers specific to various APIs
      switch (true) {
        case request.url?.startsWith(authApiGwUrl):
          request.headers.common['X-Apikey'] = import.meta.env.VUE_APP_AUTH_API_KEY
          break

        case request.url?.startsWith(payApiGwUrl):
          request.headers.common['X-Apikey'] = import.meta.env.VUE_APP_PAY_API_KEY
          break

        default:
          // used by Business API GW URL
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
