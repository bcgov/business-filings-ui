import axios from 'axios'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthenticationStore } from '@/stores'

setActivePinia(createPinia())
const authenticationStore = useAuthenticationStore()

const instance = axios.create()

instance.interceptors.request.use(
  request => {
    if (request.url?.startsWith('https://minio')) {
      return request
    }

    const kcToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    request.headers.common['Authorization'] = `Bearer ${kcToken}`
    request.headers.common['App-Name'] = import.meta.env.APP_NAME
    request.headers.common['Account-Id'] = authenticationStore.getAccountId
    request.headers.common['X-Apikey'] = import.meta.env.VUE_APP_BUSINESS_API_KEY
    return request
  },
  error => Promise.reject(error)
)

instance.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export default instance
