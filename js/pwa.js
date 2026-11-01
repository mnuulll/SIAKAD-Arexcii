// ====================================================================
// PWA: daftarkan service worker (hanya di HTTPS atau localhost)
// ====================================================================
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((err) => {
            console.warn('Service worker gagal didaftarkan:', err);
        });
    });
}
