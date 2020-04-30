import { initialize, LDFlagSet } from 'launchdarkly-js-client-sdk'

const defaultFlagSet = { 'bcrs-create-ui-enabled': true }

class FeatureFlags {
    private static instance: FeatureFlags
    private flags: LDFlagSet

    private constructor () {
      this.flags = defaultFlagSet
    }

    /**
     * Gets the singleton instance of the class.
     */
    public static get Instance (): FeatureFlags {
      return this.instance || (this.instance = new this())
    }

    /**
     * Sets all flags available for the client id.
     *
     * @param allFlags all Flags.
     */
    public setFlags (allFlags: LDFlagSet): void {
      this.flags = allFlags
    }

    /**
     * Gets the value of a specified feature flag.
     *
     * @param flagName the name of the feature flag to get to status of.
     * @returns The flag value of any variant
     */
    public getFlag (flagName: string): any {
      return this.flags[flagName]
    }
}

/**
 * The method that initializes Launch Darkly using the LD client
 * stored in the local storage.
 */
export const initLDClient = () : Promise<any> => {
  var user = { 'anonymous': true }

  let ldClient = initialize(window['ldClientId'] || 'empty-key', user)

  return new Promise((resolve) => {
    ldClient.on('initialized', () => {
      featureFlags.setFlags(ldClient.allFlags())
      resolve()
    })
    ldClient.on('failed', () => {
      featureFlags.setFlags(defaultFlagSet)
      resolve()
    })
  })
}

/**
 * The singleton instance of the feature flags class.
 */
export const featureFlags = FeatureFlags.Instance
