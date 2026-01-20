import { initialize, LDClient, LDContext, LDFlagSet, LDOptions } from 'launchdarkly-js-client-sdk'

// get rid of "element implicitly has an 'any' type..."
declare const window: any

/**
 * Default flag values when LD is not available.
 * NB: Uses "entity-ui" project (per LD client id in config).
 */
const defaultFlagSet: LDFlagSet = {
  'enable-backdated-cod': false,
  'banner-text': '', // by default, there is no banner text
  'businesses-to-manage-in-colin': [],
  'enable-digital-credentials': false,
  'enable-legal-name-fix': false,
  'supported-agm-extension-entities': [], // FUTURE: code should check this
  'supported-agm-location-chg-entities': [], // FUTURE: code should check this
  'supported-amalgamation-entities': [], // FUTURE: code should check this
  'supported-amalgamation-out-entities': [], // FUTURE: code should check this
  'supported-consent-amalgamation-out-entities': [], // FUTURE: code should check this
  'supported-consent-continuation-out-entities': [], // FUTURE: code should check this
  'supported-continuation-out-entities': [] // FUTURE: code should check this
}

/**
 * The Launch Darkly client instance.
 */
let ldClient: LDClient = null

/**
 * An async method that initializes the Launch Darkly client.
 */
export async function InitLdClient (): Promise<void> {
  const ldClientId: string = window['ldClientId']

  if (ldClientId) {
    // since we have no user or org data yet, start with an anonymous user context
    const context: LDContext = { kind: 'user', key: 'anonymous', anonymous: true }

    const options: LDOptions = {
      // fetch flags using REPORT request (to see user data as JSON)
      useReport: true,
      // opt out of sending diagnostics data
      diagnosticOptOut: true,
      // open streaming connection for live flag updates
      streaming: true
    }

    ldClient = initialize(ldClientId, context, options)

    try {
      // wait up to 5 seconds to initialize
      await ldClient.waitForInitialization(5)
    } catch {
      // shut down client -- `variation()` will return undefined values (see GetFeatureFlag)
      await ldClient.close()
      // NB: LD logs its own errors
    }
  }
}

/**
 * An async method that updates the Launch Darkly user and org properties.
 * @param user an optional user context object
 * @param org an optional organization context object
 */
export async function UpdateLdUser (user?: LDContext, org?: LDContext): Promise<void> {
  if (ldClient) {
    try {
      if (user && org) await ldClient.identify({ kind: 'multi', user, org })
      else if (user) await ldClient.identify(user)
      else if (org) await ldClient.identify(org)
    } catch {
      // do nothing -- LD logs its own errors
    }
  }
}

/**
 * A method that gets the value of the specified feature flag.
 * @param name the name of the feature flag
 * @returns the (untyped) flag value
 */
export function GetFeatureFlag (name: string): any {
  // try to return the current flag value (variation) from LD
  // else try to return the default flag value
  // else return undefined if FF is not found
  return ldClient ? ldClient.variation(name) : defaultFlagSet[name]
}
