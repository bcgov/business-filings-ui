import axios from 'axios'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

const instance = axios.create()

instance.interceptors.request.use(
  config => {
    const kcToken = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    config.headers.common['Authorization'] = `Bearer ${kcToken}`
    return config
  },
  error => Promise.reject(error)
)

instance.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export default instance
