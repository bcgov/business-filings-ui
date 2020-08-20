import axios from 'axios'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

const instance = axios.create()

instance.interceptors.request.use(
  config => {
    config.headers.common['Authorization'] = `Bearer ${sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)}`
    return config
  },
  error => Promise.reject(error)
)

instance.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export default instance
