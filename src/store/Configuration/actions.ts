import axios from "@/axios-auth";


export default {
  /** Fetches stateFiling from the API and, if successful, triggers mutation. */
  async fetchConfiguration (context, applicationUrl: string): Promise<any> {
    // fetch config from API
    // eg, http://localhost:8080/business/config/configuration.json
    // eg, https://dev.bcregistry.ca/business/config/configuration.json
    const url = `${applicationUrl}config/configuration.json`
    const headers = {
      'Accept': 'application/json',
      'ResponseType': 'application/json',
      'Cache-Control': 'no-store'
    }
    await axios.get(url, { headers })
      .then((response) => {
        if (!response?.data) {
          return Promise.reject(new Error('Invalid configuration.json'))
        } else {
          return Promise.resolve(response.data)
        }
      })
      .catch(() => {
        return Promise.reject(new Error('Could not fetch configuration.json'))
      })
    return Promise.reject(new Error('No response from API: ' + url))
  }
}
