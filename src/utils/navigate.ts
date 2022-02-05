/**
 * Navigates to the specified URL, including Account ID param if available.
 * This function may or may not return. The caller should account for this!
 */
export function navigate (url: string): boolean {
  try {
    // get account id and set in params
    const accountId = sessionStorage.getItem('ACCOUNT_ID')
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
