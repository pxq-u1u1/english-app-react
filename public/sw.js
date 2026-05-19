const CACHE = 'english-app-v1'
const ASSETS = [
  '/english-app-react/',
  '/english-app-react/index.html',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
