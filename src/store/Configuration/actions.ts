import axios from '@/axios-auth'

export default {
  /** Fetches the configuration from the API and, if successful, triggers some mutations. */
  fetchConfiguration (context, applicationUrl: string): Promise<any> {
    // fetch config from API
    // eg, http://localhost:8080/business/config/configuration.json
    // eg, https://dev.bcregistry.ca/business/config/configuration.json
    const url = `${applicationUrl}config/configuration.json`
    const headers = {
      'Accept': 'application/json',
      'ResponseType': 'application/json',
      'Cache-Control': 'no-store'
    }
    // need to return a promise because action is called via dispatch
    // needs more research to understand fully
    return new Promise((resolve, reject) => {
      axios.get(url, { headers })
        .then((response) => {
          if (!response.data) {
            reject(new Error('Invalid configuration.json'))
          } else {
            context.commit('setConfiguration', response.data)
            context.commit('setSessionVariables', response.data)
            context.commit('setAxiosBaseUrl', context.getters.getLegalApiUrl)
            resolve(response.data)
          }
        })
        .catch((error) => {
          reject(new Error('Error: ' + error))
        })
    })
  }
}
