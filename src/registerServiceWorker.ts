/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    updated () {
      console.log('New content is available; please refresh.')
      // remove older cached content
      // ref: https://santhoshkumarravi.medium.com/vue-pwa-disable-5463e44b1f7f
      caches.keys().then(names => {
        for (const name of names) caches.delete(name)
      })
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.log('Error during service worker registration:', error)
    }
  })

  let refreshing
  // safety check for IE11
  if (navigator && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      window.location.reload()
      refreshing = true
    })
  }
}
