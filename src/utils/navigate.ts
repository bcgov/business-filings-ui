import { ApplicationTypes } from '@/enums'

/**
 * Navigates to the specified URL, including Account ID param if available.
 * This function may or may not return. The caller should account for this!
 */
export function navigate (url: string): boolean {
  try {
    // get account id and set in params
    const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
    if (accountId) {
      if (url.includes('?')) {
        url += `&accountid=${accountId}`
      } else {
        url += `?accountid=${accountId}`
      }
    }
    // assume URL is always reachable
    window.location.assign(url)

    return true
  } catch (error) {
    console.log('Error navigating =', error) // eslint-disable-line no-console

    return false
  }
}

export function buildRestorationUrl (
  applicationName:string, restorationType: string, id: number,
  businessIdentifier: string, createUrlDomain: string, editUrlDomain: string):string {
  let url: string
  if (applicationName === ApplicationTypes.CREATE_UI) {
    // navigate to Create UI
    url = createUrlDomain + `?id=` + businessIdentifier
  }
  if (applicationName === ApplicationTypes.EDIT_UI) {
    url = editUrlDomain + businessIdentifier + `/` + restorationType + `?restoration-id=` + id
  }
  return url
}
