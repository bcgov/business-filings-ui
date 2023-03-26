import axios from '@/axios-auth'

export default {
  /** Fetches the configuration from the web server and, if successful, triggers some mutations. */
  loadConfiguration (context): Promise<any> {
    // need to return a promise because action is called via dispatch
    return new Promise((resolve) => {
      context.commit('setConfiguration', process.env)
      context.commit('setSessionVariables', process.env)
      context.commit('setAxiosBaseUrl', context.getters.getLegalApiUrl)

      resolve(process.env)
    })
  }
}
