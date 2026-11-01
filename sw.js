// ====================================================================
// SERVICE WORKER SIAKAD
// - File aplikasi (HTML/CSS/JS): ambil dari internet dulu (supaya update langsung
//   terpakai), kalau offline pakai salinan tersimpan.
// - Library CDN (Tailwind, Lucide, Supabase JS, SheetJS): stale-while-revalidate.
// - Request ke Supabase TIDAK PERNAH disentuh/disimpan: data siswa, token sesi,
//   dan tabungan selalu diambil langsung dari server dan tidak masuk cache.
// Naikkan CACHE_VERSION setiap kali ingin memaksa semua perangkat membuang cache lama.
// ====================================================================
const CACHE_VERSION = 'v2';
const SHELL_CACHE = 'siakad-shell-' + CACHE_VERSION;
const CDN_CACHE = 'siakad-cdn-' + CACHE_VERSION;

const SHELL_FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/tailwind-config.js',
  'js/config.js',
  'js/app.js',
  'js/auth.js',
  'js/utbk.js',
  'js/pwa.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-64.png'
];

const CDN_HOSTS = ['cdn.tailwindcss.com', 'unpkg.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // allSettled: kalau satu file gagal, instalasi tidak ikut gagal
    await Promise.allSettled(SHELL_FILES.map((f) => cache.add(f)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, CDN_CACHE];
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('siakad-') && !keep.includes(n)).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const shell = await cache.match('index.html') || await cache.match('./');
      if (shell) return shell;
    }
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  // Supabase (API data & login): jangan disentuh sama sekali
  if (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in')) return;

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
  }
});
