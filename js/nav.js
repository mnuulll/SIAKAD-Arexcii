// ====================================================================
// BOTTOM NAVIGATION: Home, UTBK, Mini Games, Profil
//   - UTBK hanya tampil untuk siswa kelas UTBK.
//   - Mini Games dan UTBK disembunyikan untuk Wali Kelas.
//   - Tombol yang aktif ditandai lingkaran yang terangkat (lihat css/style.css).
//   - Bar disembunyikan otomatis saat game sedang berjalan.
// ====================================================================
const NAV_TAB = ['home', 'utbk', 'minigames', 'profil'];
// Halaman -> tab yang disorot
const NAV_HALAMAN = {
    home: 'home', info: 'home', log: 'home', role: 'home',
    utbk: 'utbk',
    minigames: 'minigames', matdas: 'minigames', inggris: 'minigames',
    profil: 'profil'
};

function setupBottomNav() {
    if (!activeUser) return;
    const adaUtbk = typeof utbkIsEligible === 'function' && utbkIsEligible();
    const adaGames = activeUser.role !== 'wali_kelas';
    const utbk = document.getElementById('nav-utbk');
    const games = document.getElementById('nav-minigames');
    if (utbk) utbk.hidden = !adaUtbk;
    if (games) games.hidden = !adaGames;
    document.body.classList.add('nav-aktif');
    navAktifkan('home');
}

function navSembunyikan() {
    document.body.classList.remove('nav-aktif');
    document.body.classList.remove('game-berjalan');
}

function navAktifkan(tab) {
    NAV_TAB.forEach(t => {
        const el = document.getElementById('nav-' + t);
        if (!el) return;
        const aktif = t === tab;
        el.classList.toggle('aktif', aktif);
        el.setAttribute('aria-current', aktif ? 'page' : 'false');
    });
}

// Dipanggil showDashPage() setiap kali halaman berganti
function navSinkron(halaman) {
    const tab = NAV_HALAMAN[halaman];
    if (tab) navAktifkan(tab);
}

function navKe(tab) {
    if (!activeUser) return;
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* abaikan */ }
    if (tab === 'home') { showDashPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (tab === 'utbk') openUtbkPage();
    else if (tab === 'minigames') openMiniGames();
    else if (tab === 'profil') openProfilPage();
}
