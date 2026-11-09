// ====================================================================
// BOTTOM NAVIGATION: Home, [fitur role], UTBK, Mini Games, Peringkat, Profil
//   - "Fitur role" hanya muncul untuk Sekretaris (Absensi) dan Bendahara
//     (Villa / Tabungan / Yearbook / Kas); label & ikon mengikuti role.
//   - UTBK hanya tampil untuk akun kelas UTBK (termasuk semua akun Umum).
//   - Mini Games dan Peringkat disembunyikan untuk Wali Kelas.
//   - Peringkat (js/peringkat.js): tab Mini Games, plus tab UTBK untuk akun yang punya UTBK Corner.
//   - Akun Umum: Home (ringkasan UTBK), UTBK, Mini Games, Profil. Tidak ada fitur role.
//   - Tombol yang aktif ditandai lingkaran yang terangkat (lihat css/style.css).
//   - Bar disembunyikan otomatis saat game sedang berjalan.
// ====================================================================
const NAV_TAB = ['home', 'fitur', 'utbk', 'minigames', 'peringkat', 'profil'];
// Halaman -> tab yang disorot
const NAV_HALAMAN = {
    home: 'home', homeumum: 'home', fitur: 'fitur', info: 'home', log: 'home', role: 'home',
    utbk: 'utbk',
    minigames: 'minigames', matdas: 'minigames', inggris: 'minigames',
    peringkat: 'peringkat',
    profil: 'profil'
};

function setupBottomNav() {
    if (!activeUser) return;
    const umum = typeof isAkunUmum === 'function' && isAkunUmum();
    const adaUtbk = typeof utbkIsEligible === 'function' && utbkIsEligible();
    const adaGames = activeUser.role !== 'wali_kelas';
    const fitur = (!umum && typeof FEATURE_ROLE_CONFIG !== 'undefined') ? FEATURE_ROLE_CONFIG[activeUser.role] : null;

    const home = document.getElementById('nav-home');
    const tombolFitur = document.getElementById('nav-fitur');
    const utbk = document.getElementById('nav-utbk');
    const games = document.getElementById('nav-minigames');
    const peringkat = document.getElementById('nav-peringkat');

    if (home) home.hidden = false;
    if (utbk) utbk.hidden = !adaUtbk;
    if (games) games.hidden = !adaGames;
    if (peringkat) peringkat.hidden = !adaGames;   // sama seperti Mini Games: tidak untuk Wali Kelas

    if (tombolFitur) {
        tombolFitur.hidden = !fitur;
        if (fitur) {
            // Ganti ikon & label sesuai role (ikon dibuat ulang karena lucide mengganti <i> menjadi <svg>)
            const ikon = tombolFitur.querySelector('.bnav-ikon');
            if (ikon) ikon.innerHTML = `<i data-lucide="${fitur.icon}"></i>`;
            const label = document.getElementById('nav-fitur-label');
            if (label) label.textContent = fitur.label;
        }
    }

    document.body.classList.add('nav-aktif');
    if (!umum) navAktifkan('home');   // akun Umum: tab disorot oleh halaman yang dibuka
    lucide.createIcons();
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
    if (tab === 'home') {
        if (isAkunUmum()) openUtbkHome();
        else {
            showDashPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (typeof utbkMuatHomeArexcii === 'function') utbkMuatHomeArexcii();
        }
    }
    else if (tab === 'fitur') openFiturRole();
    else if (tab === 'utbk') openUtbkPage();
    else if (tab === 'minigames') openMiniGames();
    else if (tab === 'peringkat') openPeringkatPage();
    else if (tab === 'profil') openProfilPage();
}
