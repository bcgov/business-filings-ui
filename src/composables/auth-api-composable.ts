import { computed } from 'vue'
import axios from '@/axios-auth'

/**
 * Composable that provides integration with the Auth API.
 */
export const AuthApiComposable = () => {
  const authApiUrl = computed(() => sessionStorage.getItem('AUTH_API_URL') || '' as string)

  /**
   * Fetches authorizations.
   * @param businessId the business identifier (aka entity inc no)
   */
  const fetchAuthorizations = async (businessId: string): Promise<any> => {
    const url = `${authApiUrl.value}entities/${businessId}/authorizations`
    return axios.get(url)
  }

  /**
   * Fetches user info for the current user.
   */
  const fetchUserInfo = async (): Promise<any> => {
    const url = `${authApiUrl.value}users/@me`
    return axios.get(url).then(response => response?.data)
  }

  /**
   * Fetches entity info.
   * @param businessId the business identifier (aka entity inc no)
   */
  const fetchEntityInfo = async (businessId: string): Promise<any> => {
    const url = `${authApiUrl.value}entities/${businessId}`
    return axios.get(url)
  }

  return {
    authApiUrl,
    fetchAuthorizations,
    fetchUserInfo,
    fetchEntityInfo
  }
}
