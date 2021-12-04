import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register('service-worker.js', {
    updated () {
      // remove older cached content
      // ref: https://santhoshkumarravi.medium.com/vue-pwa-disable-5463e44b1f7f
      caches.keys().then(names => {
        for (let name of names) caches.delete(name)
      })
    }
  })

  let refreshing
  // safety check for IE11
  if (navigator && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', e => {
      if (refreshing) return
      window.location.reload()
      refreshing = true
    })
  }
}
