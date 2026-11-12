// ====================================================================
// LOGIKA APLIKASI SIAKAD (dashboard, absensi, tabungan, pengumuman, admin)
// Login/logout/sesi ada di auth.js; kunci Supabase ada di config.js.
// ====================================================================

// Escape teks dari database sebelum dimasukkan ke innerHTML (cegah XSS)
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ====================================================================
// MODAL TABUNGAN: Tombol Tabungan -> Informasi Tabungan -> Log Tabungan
// ====================================================================
// Akun "Umum" (jenis = 'umum') hanya punya UTBK Corner, Mini Games, dan Profil.
function isAkunUmum() {
    return !!activeUser && activeUser.jenis === 'umum';
}

function showDashPage(name, fromPop = false) {
    // Akun Umum: "Home" adalah ringkasan UTBK (page-home-umum); halaman tabungan/panel tidak ada
    const umum = isAkunUmum();
    if (umum && ['home', 'info', 'log', 'role'].includes(name)) name = 'homeumum';

    // Sesi latihan yang sedang berjalan dibatalkan jika pengguna berpindah halaman (js/matdas.js)
    if (name !== 'matdas' && typeof matdasOnLeave === 'function') matdasOnLeave();
    if (name !== 'inggris' && typeof inggrisOnLeave === 'function') inggrisOnLeave();
    if (name !== 'sinonim' && typeof sinonimOnLeave === 'function') sinonimOnLeave();
    if (name !== 'sosial' && typeof sosialOnLeave === 'function') sosialOnLeave();
    tutupSemuaFitur();                                          // halaman fitur sekretaris/bendahara ditutup
    if (typeof navSinkron === 'function') navSinkron(name);   // sorot tab navigasi bawah yang sesuai (js/nav.js)
    const cfgFitur = (!umum && activeUser) ? FEATURE_ROLE_CONFIG[activeUser.role] : null;
    const pages = { fitur: cfgFitur ? cfgFitur.panelId : '__none__', home: 'dash-home', homeumum: 'page-home-umum', info: 'page-tabungan-info', log: 'page-tabungan-log', role: 'page-role', utbk: 'page-utbk', matdas: 'page-matdas', inggris: 'page-inggris', sinonim: 'page-sinonim', minigames: 'page-minigames', peringkat: 'page-peringkat', sosial: 'page-sosial', profil: 'page-profil' };
    Object.entries(pages).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', key !== name);
    });
    window.scrollTo({ top: 0 });
    lucide.createIcons();

    // Tombol Back di HP/browser ikut berfungsi sebagai "kembali ke dashboard"
    // (maksimal 1 entri riwayat: pindah antar halaman memakai replaceState).
    // Akun Umum tidak punya Home, jadi tidak memakai riwayat ini.
    if (!fromPop && !umum) {
        if (name !== 'home') {
            if (history.state && history.state.dashPage) history.replaceState({ dashPage: name }, '');
            else history.pushState({ dashPage: name }, '');
        } else if (history.state && history.state.dashPage) {
            history.back();
        }
    }
}

window.addEventListener('popstate', (e) => {
    if (isAkunUmum()) return;
    showDashPage(e.state && e.state.dashPage ? e.state.dashPage : 'home', true);
});

function openTabunganInfo() { showDashPage('info'); }
function openTabunganLog() { showDashPage('log'); }
function closeTabunganPages() { showDashPage('home'); }

// ====================================================================
// KELAS (NON / UTBK) & SERAGAM HARI INI
// ====================================================================
// Jadwal seragam per kelas. Kunci hari mengikuti Date.getDay(): 0=Minggu, 1=Senin, ... 6=Sabtu.
// GANTI isinya sesuai jadwal seragam sekolah kalian yang sebenarnya.
const SERAGAM_JADWAL = {
    non: {
        1: { nama: 'PSAS', ket: 'Seragam upacara lengkap (topi & dasi)', tema: 'bg-slate-700 border-slate-900' },
        2: { nama: 'Batik', ket: '', tema: 'bg-amber-700 border-amber-900' },
        3: { nama: 'Pramuka', ket: '', tema: 'bg-red-800 border-red-950' },
        4: { nama: 'Pangsi / Adat', ket: '', tema: 'bg-zinc-900 border-black' },
        5: { nama: 'Koko / Muslim', ket: '', tema: 'bg-emerald-700 border-emerald-900' }
    },
    utbk: {
        1: { nama: 'PSAS', ket: 'Seragam upacara lengkap (topi & dasi)', tema: 'bg-slate-700 border-slate-900' },
        2: { nama: 'Batik', ket: '', tema: 'bg-amber-700 border-amber-900' },
        3: { nama: 'Pramuka', ket: '', tema: 'bg-red-800 border-red-950' },
        4: { nama: 'Pangsi / Adat', ket: '', tema: 'bg-zinc-900 border-black' },
        5: { nama: 'Koko / Muslim', ket: '', tema: 'bg-emerald-700 border-emerald-900' }
    }
};

function getKelasKey(user) {
    if (!user) return '';
    return (user.kelas_tipe === 'utbk' || user.kelas_tipe === 'non') ? user.kelas_tipe : '';
}

function getKelasLabel(key) {
    if (key === 'utbk') return 'UTBK';
    if (key === 'non') return 'NON';
    return 'Belum diatur';
}

function renderSeragamHariIni() {
    const kelasKey = getKelasKey(activeUser);
    const sekarang = new Date();
    const dayIdx = wibHari(sekarang);   // hari menurut WIB, bukan zona waktu perangkat
    // Kelas belum diatur -> pakai jadwal NON sebagai cadangan
    const info = (SERAGAM_JADWAL[kelasKey || 'non'] || {})[dayIdx];

    const kartu = document.getElementById('base-seragam-section');
    if (kartu) {
        // Warna kartu mengikuti seragam hari ini (teks putih di atas warna pekat = kontras tinggi)
        const wasHidden = kartu.classList.contains('hidden');
        kartu.className = 'rounded-2xl shadow-md p-5 text-white border-2 ' + (info ? info.tema : 'bg-slate-600 border-slate-800') + (wasHidden ? ' hidden' : '');
    }
    document.getElementById('seragam-hari').innerText =
        '(' + fmtTgl(sekarang, { weekday: 'long' }) + ')';
    document.getElementById('seragam-nama').innerText = info ? info.nama : 'Libur / tidak ada seragam';
    document.getElementById('seragam-ket').innerText = info ? (info.ket || '') : '';
    document.getElementById('seragam-kelas-badge').innerText = getKelasLabel(kelasKey);
}

// Helper: daftar siswa "murni" tanpa akun Wali Kelas.
// Dipakai di manapun yang seharusnya cuma menampilkan siswa (absensi, bendahara, dsb),
// supaya akun Wali Kelas tidak nyempil di daftar-daftar itu.
function getSiswaOnly() {
    return siswaListGlobal.filter(s => s.role !== 'wali_kelas');
}

// 2.2 Populate Dropdowns
function populateLoginDropdown(siswaList) {
    const selectEl = document.getElementById('login-siswa');
    selectEl.innerHTML = '<option value="" disabled selected>Pilih nama kamu...</option>';

    // Akun Wali Kelas ditaruh paling atas biar tidak perlu discroll,
    // sisanya (siswa) tetap urut seperti biasa.
    const sorted = siswaList.slice().sort((a, b) => {
        const aIsWali = a.role === 'wali_kelas' ? 0 : 1;
        const bIsWali = b.role === 'wali_kelas' ? 0 : 1;
        return aIsWali - bIsWali;
    });

    sorted.forEach(siswa => {
        const opt = document.createElement('option');
        opt.value = siswa.id;
        opt.textContent = siswa.nama;
        selectEl.appendChild(opt);
    });
}

function populateRoleDropdowns(siswaListRaw) {
    const siswaList = siswaListRaw.filter(s => s.role !== 'wali_kelas');

    // Populate dropdown untuk panel Sekretaris
    const sekrSelect = document.getElementById('sekr-siswa');
    if (sekrSelect) {
        sekrSelect.innerHTML = '<option value="" disabled selected>Pilih Siswa...</option>';
        siswaList.forEach(siswa => {
            const opt = document.createElement('option');
            opt.value = siswa.id;
            opt.textContent = siswa.nama;
            sekrSelect.appendChild(opt);
        });
    }

    // Populate dropdown untuk panel Bendahara Tabungan
    const tabSelect = document.getElementById('tab-siswa');
    if (tabSelect) {
        tabSelect.innerHTML = '<option value="" disabled selected>Pilih Siswa...</option>';
        siswaList.forEach(siswa => {
            const opt = document.createElement('option');
            opt.value = siswa.id;
            opt.textContent = siswa.nama;
            tabSelect.appendChild(opt);
        });
    }

    // Populate dropdown untuk panel Bendahara Tabungan Villa
    const villaSelect = document.getElementById('villa-siswa');
    if (villaSelect) {
        villaSelect.innerHTML = '<option value="" disabled selected>Pilih Siswa...</option>';
        siswaList.forEach(siswa => {
            const opt = document.createElement('option');
            opt.value = siswa.id;
            opt.textContent = siswa.nama;
            villaSelect.appendChild(opt);
        });
    }

    // Populate dropdown untuk panel Bendahara Tabungan Yearbook
    const yearbookSelect = document.getElementById('yearbook-siswa');
    if (yearbookSelect) {
        yearbookSelect.innerHTML = '<option value="" disabled selected>Pilih Siswa...</option>';
        siswaList.forEach(siswa => {
            const opt = document.createElement('option');
            opt.value = siswa.id;
            opt.textContent = siswa.nama;
            yearbookSelect.appendChild(opt);
        });
    }

    // Populate dropdown untuk panel Bendahara Tabungan Kas
    const kasSelect = document.getElementById('kas-siswa');
    if (kasSelect) {
        kasSelect.innerHTML = '<option value="" disabled selected>Pilih Siswa...</option>';
        siswaList.forEach(siswa => {
            const opt = document.createElement('option');
            opt.value = siswa.id;
            opt.textContent = siswa.nama;
            kasSelect.appendChild(opt);
        });
    }
}



// ====================================================================
// 4. VIEW RENDERING ENGINE (THEMING & RENDERING CARD)
// ====================================================================
// Konfigurasi fitur untuk tiap role sekretaris/bendahara (tampil sebagai tab di navigasi bawah).
// prefix -> dipakai untuk cari panel halaman (feature-page) & fungsi loadnya.
const FEATURE_ROLE_CONFIG = {
    'sekretaris': { label: 'Absensi', prefix: 'sekretaris', panelId: 'panel-sekretaris', icon: 'clipboard-signature', color: '#0284c7', loadFn: () => loadSekretarisPanel() },
    'bendahara_tabungan_villa': { label: 'Villa', prefix: 'villa', panelId: 'panel-bendahara-villa', icon: 'palmtree', color: '#f59e0b', loadFn: () => loadBendaharaVillaPanel() },
    'bendahara_tabungan': { label: 'Tabungan', prefix: 'tabungan', panelId: 'panel-bendahara-tabungan', icon: 'piggy-bank', color: '#0ea5e9', loadFn: () => loadBendaharaTabunganPanel() },
    'bendahara_tabungan_yearbook': { label: 'Yearbook', prefix: 'yearbook', panelId: 'panel-bendahara-yearbook', icon: 'book-image', color: '#a855f7', loadFn: () => loadBendaharaYearbookPanel() },
    'bendahara_tabungan_kas': { label: 'Kas', prefix: 'kas', panelId: 'panel-bendahara-kas', icon: 'wallet', color: '#10b981', loadFn: () => loadBendaharaKasPanel() },
};

async function showDashboard() {
    // Sembunyikan form login, tampilkan dashboard
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');

    // Set Header Profiles
    document.getElementById('user-display-name').innerText = activeUser.nama;
    const isUmum = isAkunUmum();
    document.getElementById('user-display-role').innerText = getRoleLabelUser(activeUser);
    const kelasBadge = document.getElementById('user-display-kelas');
    if (kelasBadge) {
        kelasBadge.innerText = getKelasLabel(getKelasKey(activeUser));
        kelasBadge.classList.toggle('hidden', activeUser.role === 'wali_kelas' || isUmum);
    }
    const gantiLabel = document.getElementById('header-ganti-pin-label');
    if (gantiLabel) gantiLabel.innerText = isUmum ? 'Ganti Sandi' : 'Ganti PIN';
    document.getElementById('user-avatar-text').innerText = activeUser.nama.substring(0, 2).toUpperCase();

    // Akun Umum: tidak ada absensi, tabungan, pengumuman, maupun panel apa pun.
    // Isinya: Home (ringkasan UTBK), UTBK Corner, Mini Games, dan Profil (lewat navigasi bawah).
    if (isUmum) {
        hideAllRolePanels();
        document.getElementById('dash-home').classList.add('hidden');
        if (typeof setupBottomNav === 'function') setupBottomNav();
        lucide.createIcons();
        await openUtbkHome();
        return;
    }
    document.getElementById('dash-home').classList.remove('hidden');

    // Wali Kelas: dashboard-nya berbeda sendiri, tidak menampilkan papan pengumuman,
    // stats pribadi, absen subuh pribadi, maupun riwayat tabungan/kalender pribadi.
    const isWaliKelas = activeUser.role === 'wali_kelas';
    const baseSectionIds = ['base-seragam-section', 'base-pengumuman-section', 'base-stats-section', 'base-subuh-section', 'base-historical-section'];
    baseSectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', isWaliKelas);
    });

    if (!isWaliKelas) {
        renderSeragamHariIni();
        // Load Data Base (Untuk Anggota)
        await loadBaseDashboardStats();
        await loadSiswaNabungRiwayat();
        renderSiswaAttendanceCalendar();
        await loadPengumumanBoard();
        await loadMySubuhStatus();
        startSubuhClock();
    }

    // Render Panel Spesifik Berdasarkan Role
    const rolePanel = document.getElementById('role-panel');
    hideAllRolePanels();

    const isKetuaAtauAdmin = ['ketua', 'wakil ketua', 'admin'].includes(activeUser.role);

    if (isKetuaAtauAdmin) {
        // Ketua / Wakil Ketua / Admin: panel jadi tombol. Menekan tombol membuka halaman panelnya.
        rolePanel.classList.add('hidden');

        document.getElementById('role-launcher').classList.remove('hidden');
        document.getElementById('launch-ketua').classList.remove('hidden');
        document.getElementById('launch-ketua-title').innerText = getJudulPanelKetua(activeUser.role);
        document.getElementById('launch-siswa').classList.toggle('hidden', activeUser.role !== 'admin');
    } else if (activeUser.role === 'wali_kelas') {
        // Wali Kelas: tetap tampil inline di dashboard (hanya monitoring ringkas)
        rolePanel.classList.remove('hidden');

        document.getElementById('role-panel-title').innerText = "Panel Monitor Wali Kelas";
        document.getElementById('role-panel-icon').setAttribute('data-lucide', 'user-check');
        document.getElementById('role-panel-badge').innerText = activeUser.role.toUpperCase().replace(/_/g, ' ');
        document.getElementById('panel-wali-kelas').classList.remove('hidden');
        await loadWaliKelasPanel();
        await loadWaliKelasSubuhRekap();
    } else {
        // Anggota biasa, Sekretaris, dan Bendahara: tidak ada panel inline di Home.
        // (Sekretaris & Bendahara membuka fiturnya lewat tab di navigasi bawah.)
        rolePanel.classList.add('hidden');
    }

    // Navigasi bawah: Home, [fitur role], UTBK, Mini Games, Profil (js/nav.js)
    if (typeof setupBottomNav === 'function') setupBottomNav();

    // Ringkasan UTBK di Home (akun Arexcii kelas UTBK)
    if (typeof utbkMuatHomeArexcii === 'function') utbkMuatHomeArexcii();

    lucide.createIcons();
}

function getJudulPanelKetua(role) {
    if (role === 'admin') return 'Panel Monitor Kelas';
    return role === 'wakil ketua' ? 'Panel Monitor Wakil Ketua Kelas' : 'Panel Monitor Ketua Kelas';
}

// Membuka halaman panel (Ketua / Wakil / Admin). Data dimuat saat halaman dibuka.
async function openRolePage(which) {
    if (!activeUser) return;
    const isKetuaAtauAdmin = ['ketua', 'wakil ketua', 'admin'].includes(activeUser.role);
    if (!isKetuaAtauAdmin) return;
    if (which === 'siswa' && activeUser.role !== 'admin') return;   // (penjagaan sebenarnya ada di RLS database)

    const isKetuaPage = which !== 'siswa';
    document.getElementById('panel-ketua').classList.toggle('hidden', !isKetuaPage);
    document.getElementById('panel-admin-siswa').classList.toggle('hidden', isKetuaPage);

    const title = isKetuaPage ? getJudulPanelKetua(activeUser.role) : 'Kelola Data Siswa';
    document.getElementById('page-role-title').innerText = title;
    document.getElementById('page-role-badge').innerText = activeUser.role.toUpperCase().replace(/_/g, ' ');
    document.getElementById('page-role-icon-wrap').innerHTML =
        `<i data-lucide="${isKetuaPage ? 'shield-check' : 'users-round'}" class="w-5 h-5 text-primary-600"></i>`;

    showDashPage('role');

    if (isKetuaPage) {
        await loadKetuaPanel();
        await loadKetuaPengumumanList();
        await loadKetuaSubuhRekap();
    } else {
        await loadAdminSiswaPanel();
    }
    lucide.createIcons();
}

function hideAllRolePanels() {
    document.getElementById('panel-ketua').classList.add('hidden');
    document.getElementById('panel-wali-kelas').classList.add('hidden');
    document.getElementById('panel-admin-siswa').classList.add('hidden');
    const launcher = document.getElementById('role-launcher');
    if (launcher) launcher.classList.add('hidden');
    ['launch-ketua', 'launch-siswa'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Semua "halaman fitur" (sekretaris & bendahara) ditutup kembali ke dashboard
    tutupSemuaFitur();
}

// Tutup semua halaman fitur (sekretaris & bendahara) yang sedang terbuka.
function tutupSemuaFitur() {
    Object.values(FEATURE_ROLE_CONFIG).forEach(config => {
        const page = document.getElementById(config.panelId);
        if (page) page.classList.add('hidden');
    });
}

// Dipanggil saat tab fitur di navigasi bawah ditekan (Absensi / Villa / Tabungan / Yearbook / Kas).
// Halaman fitur terbuka sebagai halaman penuh; navigasi bawah tetap terlihat.
async function openFiturRole() {
    if (!activeUser || isAkunUmum()) return;
    const config = FEATURE_ROLE_CONFIG[activeUser.role];
    if (!config) return;

    showDashPage('fitur');   // halaman biasa seperti UTBK / Mini Games; kembali lewat navigasi bawah
    await config.loadFn();

    if (REKAP_TABUNGAN[config.prefix]) {
        const sampaiIn = document.getElementById('rekap-bln-sampai-' + config.prefix);
        if (sampaiIn && !sampaiIn.value) sampaiIn.value = rekapBulanIni();
        const dariIn = document.getElementById('rekap-bln-' + config.prefix);
        if (dariIn && !dariIn.value) dariIn.value = rekapBulanIni();
        previewRekapTabungan(config.prefix);
    }

    if (config.prefix === 'sekretaris') {
        const rekapBulanInput = document.getElementById('rekap-bulan');
        if (rekapBulanInput && !rekapBulanInput.value) {
            rekapBulanInput.value = wibBulanIni(); // "YYYY-MM" (WIB)
        }
    }
}

// Label role untuk ditampilkan: akun Umum selalu tampil sebagai "Umum"
function getRoleLabelUser(user) {
    if (user && user.jenis === 'umum') return 'Umum';
    return getReadableRole(user ? user.role : '');
}

function getReadableRole(role) {
    switch(role) {
        case 'ketua': return 'Ketua Kelas';
        case 'wakil ketua': return 'Wakil Ketua Kelas';
        case 'sekretaris': return 'Sekretaris';
        case 'bendahara_tabungan_villa': return 'Bendahara Tabungan Villa';
        case 'bendahara_tabungan': return 'Bendahara Tabungan';
        case 'bendahara_tabungan_yearbook': return 'Bendahara Tabungan Yearbook';
        case 'bendahara_tabungan_kas': return 'Bendahara Tabungan Kas';
        case 'wali_kelas': return 'Wali Kelas';
        case 'admin': return 'Admin';
        default: return 'Siswa / Anggota';
    }
}

// Format Rupiah Helper
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

// ====================================================================
// 5. BASE REKAP DATA SAYA (FOR ALL siswa)
// ====================================================================
async function loadBaseDashboardStats() {
    if (!supabaseClient) return;

    // 5.1 Absensi Hari Ini
    const todayStr = wibTanggalIso();
    const { data: absenData } = await supabaseClient
        .from('absensi')
        .select('status')
        .eq('siswa_id', activeUser.id)
        .eq('tanggal', todayStr)
        .maybeSingle();
    
    const statAbsen = document.getElementById('stat-absen-hari-ini');
    if (absenData) {
        statAbsen.innerText = absenData.status;
        statAbsen.className = `text-base font-bold mt-0.5 ${getAbsenColorClass(absenData.status)}`;
    } else {
        statAbsen.innerText = "Belum Diabsen";
        statAbsen.className = "text-base font-bold mt-0.5 text-slate-400";
    }

    // 5.2 Total Tabungan Reguler: nominalnya sengaja tidak ditampilkan di sini lagi.
    // Kartu "Total Tabungan Reguler" tetap menampilkan teks statis "Lihat di Aplikasi AIO Neges"
    // (lihat HTML), jadi tidak perlu di-fetch/di-overwrite di sini.

    // 5.3 Kehadiran Bulan Ini (dari tanggal 1 bulan berjalan s.d. hari ini, reset tiap awal bulan)
    const firstDayOfMonthStr = `${wibBulanIni()}-01`;

    const { count: hadirCount } = await supabaseClient
        .from('absensi')
        .select('*', { count: 'exact', head: true })
        .eq('siswa_id', activeUser.id)
        .eq('status', 'Hadir')
        .gte('tanggal', firstDayOfMonthStr);
        
    document.getElementById('stat-total-hadir-bulan').innerText = `${hadirCount || 0} Kali`;

    // 5.4 Total Tabungan Villa Saya
    const { data: villaData } = await supabaseClient
        .from('tabungan_villa')
        .select('nominal, jenis')
        .eq('siswa_id', activeUser.id);

    let totalVilla = 0;
    if (villaData) {
        villaData.forEach(v => {
            if (v.jenis === 'setor') totalVilla += v.nominal;
            else if (v.jenis === 'tarik') totalVilla -= v.nominal;
        });
    }
    document.getElementById('stat-villa-saya').innerText = formatRupiah(totalVilla);

    // 5.5 Total Tabungan Yearbook Saya
    const { data: yearbookData } = await supabaseClient
        .from('tabungan_yearbook')
        .select('nominal, jenis')
        .eq('siswa_id', activeUser.id);

    let totalYearbook = 0;
    if (yearbookData) {
        yearbookData.forEach(y => {
            if (y.jenis === 'setor') totalYearbook += y.nominal;
            else if (y.jenis === 'tarik') totalYearbook -= y.nominal;
        });
    }
    document.getElementById('stat-yearbook-saya').innerText = formatRupiah(totalYearbook);
}

// 5.5 Render Tabungan Riwayat Saya
let logTabunganData = { Villa: [], Yearbook: [] };
let logTabunganSumber = 'Villa';

async function loadSiswaNabungRiwayat() {
    if (!supabaseClient) return;

    // Log hanya untuk Villa dan Yearbook (tabungan Reguler tidak ditampilkan di sini)
    const [resVilla, resYearbook] = await Promise.all([
        supabaseClient.from('tabungan_villa').select('*').eq('siswa_id', activeUser.id),
        supabaseClient.from('tabungan_yearbook').select('*').eq('siswa_id', activeUser.id)
    ]);

    const byDateDesc = (a, b) => waktuParse(b.tanggal) - waktuParse(a.tanggal);
    logTabunganData = {
        Villa: (resVilla.data || []).slice().sort(byDateDesc),
        Yearbook: (resYearbook.data || []).slice().sort(byDateDesc)
    };
    renderLogTabungan();
}

// Pilih sumber log: 'Villa' atau 'Yearbook'
function setLogTabunganSumber(sumber) {
    logTabunganSumber = sumber;
    renderLogTabungan();
}

function renderLogTabungan() {
    const tBody = document.getElementById('siswa-tabungan-riwayat-body');
    if (!tBody) return;
    tBody.innerHTML = '';

    // Style tab aktif/nonaktif
    const activeCls = {
        Villa: 'bg-amber-500 text-white border-amber-500',
        Yearbook: 'bg-purple-600 text-white border-purple-600'
    };
    const idleCls = 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50';
    ['Villa', 'Yearbook'].forEach(name => {
        const btn = document.getElementById('log-tab-' + name.toLowerCase());
        if (!btn) return;
        btn.className = 'flex-1 sm:flex-none px-5 py-2 rounded-lg border text-sm font-semibold transition ' +
            (logTabunganSumber === name ? activeCls[name] : idleCls);
    });

    const rows = logTabunganData[logTabunganSumber] || [];
    if (rows.length === 0) {
        tBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-400 font-medium">Belum ada riwayat tabungan ${logTabunganSumber}.</td></tr>`;
        return;
    }

    rows.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";

        const formattedDate = fmtWaktu(item.tanggal, {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const badgeBg = item.jenis === 'setor' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        const sign = item.jenis === 'setor' ? '+' : '-';
        const nominalColor = item.jenis === 'setor' ? 'text-emerald-600' : 'text-amber-600';

        tr.innerHTML = `
            <td class="p-3 font-medium text-slate-600">${formattedDate}</td>
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeBg}">${item.jenis}</span>
            </td>
            <td class="p-3 text-right font-bold ${nominalColor}">${sign} ${formatRupiah(item.nominal)}</td>
            <td class="p-3 text-slate-500">${escapeHtml(item.keterangan || '-')}</td>
        `;
        tBody.appendChild(tr);
    });
}

// Helper Absen status color
function getAbsenColorClass(status) {
    switch(status) {
        case 'Hadir': return 'text-emerald-600';
        case 'Ijin': return 'text-yellow-600';
        case 'Sakit': return 'text-sky-600';
        case 'Dispen': return 'text-purple-600';
        case 'Alpha': return 'text-rose-600';
        default: return 'text-slate-400';
    }
}

// 5.6 Render Grid Kalender Absensi Saya (Mocked 30 days grid)
async function renderSiswaAttendanceCalendar() {
    if (!supabaseClient) return;

    const calendarView = document.getElementById('calendar-view');
    calendarView.innerHTML = '';

    // Render Header Hari (Sen-Min)
    const headers = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    headers.forEach(h => {
        const d = document.createElement('div');
        d.className = "text-[10px] font-bold text-slate-400 py-1 uppercase";
        d.innerText = h;
        calendarView.appendChild(d);
    });

    // Tarik seluruh absensi bulan berjalan
    const { data: absenList } = await supabaseClient
        .from('absensi')
        .select('tanggal, status')
        .eq('siswa_id', activeUser.id);

    const statusMapping = {};
    if (absenList) {
        absenList.forEach(a => {
            statusMapping[a.tanggal] = a.status;
        });
    }

    // Kalender bulan berjalan (otomatis mengikuti bulan & tahun saat ini)
    const [bulanIniStr0, bulanIniStr1] = wibBulanIni().split('-').map(Number);
    const year = bulanIniStr0;
    const month = bulanIniStr1 - 1; // 0-indexed (bulan berjalan menurut WIB)
    const pad = (n) => n < 10 ? '0' + n : n;

    // Hari pertama bulan ini, dikonversi supaya Senin = 0 ... Minggu = 6
    const firstDayJs = new Date(year, month, 1).getDay(); // Minggu=0 ... Sabtu=6
    const daysOffset = (firstDayJs + 6) % 7;
    for (let i = 0; i < daysOffset; i++) {
        const empty = document.createElement('div');
        calendarView.appendChild(empty);
    }

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= totalDaysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = "aspect-square rounded-lg flex items-center justify-center text-xs font-semibold relative transition border border-slate-100";
        
        // Construct Date YYYY-MM-DD
        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
        const status = statusMapping[dateStr];

        if (status) {
            if (status === 'Hadir') cell.className += " bg-emerald-500 text-white border-emerald-600";
            else if (status === 'Ijin') cell.className += " bg-yellow-500 text-white border-yellow-600";
            else if (status === 'Sakit') cell.className += " bg-sky-500 text-white border-sky-600";
            else if (status === 'Dispen') cell.className += " bg-purple-500 text-white border-purple-600";
            else if (status === 'Alpha') cell.className += " bg-rose-500 text-white border-rose-600";
        } else {
            cell.className += " bg-slate-50 text-slate-400";
        }

        cell.innerText = day;
        calendarView.appendChild(cell);
    }
}


// ====================================================================
// 6. ROLE PANEL: KETUA / WAKIL
// ====================================================================
async function loadKetuaPanel() {
    if (!supabaseClient) return;

    // Total Kehadiran Hari ini (Hadir / Tidak)
    const todayStr = wibTanggalIso();
    
    const { data: listAbsen } = await supabaseClient
        .from('absensi')
        .select('*, siswa:siswa_id(nama)');
        
    const filterToday = listAbsen ? listAbsen.filter(a => a.tanggal === todayStr) : [];
    const absenMap = {};
    filterToday.forEach(a => {
        absenMap[a.siswa_id] = a;
    });

    const listEl = document.getElementById('ketua-absen-list');
    listEl.innerHTML = '';

    getSiswaOnly().forEach(siswa => {
        const userAbsen = absenMap[siswa.id];
        const statusName = userAbsen ? userAbsen.status : 'Belum Absen';
        
        let badgeClass = 'bg-slate-100 text-slate-400';
        if (statusName === 'Hadir') badgeClass = 'bg-emerald-100 text-emerald-800';
        else if (statusName === 'Ijin') badgeClass = 'bg-yellow-100 text-yellow-800';
        else if (statusName === 'Sakit') badgeClass = 'bg-sky-100 text-sky-800';
        else if (statusName === 'Dispen') badgeClass = 'bg-purple-100 text-purple-800';
        else if (statusName === 'Alpha') badgeClass = 'bg-rose-100 text-rose-800';

        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition";
        div.innerHTML = `
            <span class="font-medium text-slate-700">${escapeHtml(siswa.nama)}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}">${statusName}</span>
        `;
        listEl.appendChild(div);
    });

    // Tabungan Villa Total
    const { data: sumVilla } = await supabaseClient.from('tabungan_villa').select('nominal, jenis');
    let totalVillaVal = 0;
    if (sumVilla) {
        sumVilla.forEach(v => {
            if (v.jenis === 'setor') totalVillaVal += v.nominal;
            else if (v.jenis === 'tarik') totalVillaVal -= v.nominal;
        });
    }
    document.getElementById('ketua-total-villa').innerText = formatRupiah(totalVillaVal);

    // Tabungan Yearbook Total
    const { data: sumYearbook } = await supabaseClient.from('tabungan_yearbook').select('nominal, jenis');
    let totalYearbookVal = 0;
    if (sumYearbook) {
        sumYearbook.forEach(t => {
            if (t.jenis === 'setor') totalYearbookVal += t.nominal;
            else if (t.jenis === 'tarik') totalYearbookVal -= t.nominal;
        });
    }
    document.getElementById('ketua-total-yearbook').innerText = formatRupiah(totalYearbookVal);

    // Tabungan Kas Total
    const { data: sumKas } = await supabaseClient.from('tabungan_kas').select('nominal, jenis');
    let totalKasVal = 0;
    if (sumKas) {
        sumKas.forEach(t => {
            if (t.jenis === 'setor') totalKasVal += t.nominal;
            else if (t.jenis === 'tarik') totalKasVal -= t.nominal;
        });
    }
    document.getElementById('ketua-total-kas').innerText = formatRupiah(totalKasVal);
}

// ====================================================================
// PANEL WALI KELAS: rekap absen harian + total uang kas saja
// ====================================================================
async function loadWaliKelasPanel() {
    if (!supabaseClient) return;

    // Rekap Absensi Hari Ini
    const todayStr = wibTanggalIso();

    const { data: listAbsen } = await supabaseClient
        .from('absensi')
        .select('*, siswa:siswa_id(nama)');

    const filterToday = listAbsen ? listAbsen.filter(a => a.tanggal === todayStr) : [];
    const absenMap = {};
    filterToday.forEach(a => {
        absenMap[a.siswa_id] = a;
    });

    const listEl = document.getElementById('walikelas-absen-list');
    listEl.innerHTML = '';

    getSiswaOnly().forEach(siswa => {
        const userAbsen = absenMap[siswa.id];
        const statusName = userAbsen ? userAbsen.status : 'Belum Absen';

        let badgeClass = 'bg-slate-100 text-slate-400';
        if (statusName === 'Hadir') badgeClass = 'bg-emerald-100 text-emerald-800';
        else if (statusName === 'Ijin') badgeClass = 'bg-yellow-100 text-yellow-800';
        else if (statusName === 'Sakit') badgeClass = 'bg-sky-100 text-sky-800';
        else if (statusName === 'Dispen') badgeClass = 'bg-purple-100 text-purple-800';
        else if (statusName === 'Alpha') badgeClass = 'bg-rose-100 text-rose-800';

        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition";
        div.innerHTML = `
            <span class="font-medium text-slate-700">${escapeHtml(siswa.nama)}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}">${statusName}</span>
        `;
        listEl.appendChild(div);
    });

    // Total Uang Kas
    const { data: sumKas } = await supabaseClient.from('tabungan_kas').select('nominal, jenis');
    let totalKasVal = 0;
    if (sumKas) {
        sumKas.forEach(t => {
            if (t.jenis === 'setor') totalKasVal += t.nominal;
            else if (t.jenis === 'tarik') totalKasVal -= t.nominal;
        });
    }
    document.getElementById('walikelas-total-kas').innerText = formatRupiah(totalKasVal);
}

async function loadWaliKelasSubuhRekap() {
    if (!supabaseClient) return;

    const tglInput = document.getElementById('walikelas-subuh-tanggal');
    if (tglInput && !tglInput.value) tglInput.value = todayDateStr();
    const tanggal = tglInput ? tglInput.value : todayDateStr();

    const { data: listSubuh } = await supabaseClient
        .from('absensi_subuh')
        .select('*')
        .eq('tanggal', tanggal);

    const subuhMap = {};
    (listSubuh || []).forEach(a => { subuhMap[a.siswa_id] = a; });

    const listEl = document.getElementById('walikelas-subuh-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    getSiswaOnly().slice().sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
        const rec = subuhMap[siswa.id];
        const nilai = rec ? rec.nilai : null;
        const jamStr = rec ? fmtJam(rec.jam_absen) : '-';

        let badgeClass = 'bg-slate-100 text-slate-400';
        if (nilai === 'A') badgeClass = 'bg-emerald-100 text-emerald-800';
        else if (nilai === 'B') badgeClass = 'bg-amber-100 text-amber-800';
        else if (nilai === 'C') badgeClass = 'bg-rose-100 text-rose-800';

        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition";
        div.innerHTML = `
            <span class="font-medium text-slate-700">${escapeHtml(siswa.nama)}</span>
            <span class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">${jamStr}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}">${nilai || 'Belum Absen'}</span>
            </span>
        `;
        listEl.appendChild(div);
    });
}

// ====================================================================
// ABSEN SHOLAT SUBUH (SEMUA SISWA) - dibuka 03.30-05.00
// A: 03.30-04.00 | B: 04.00-04.30 | C: 04.30-05.00
// ====================================================================
const SUBUH_WINDOW_START = 3 * 60 + 30;  // 210 menit
const SUBUH_BATAS_A = 4 * 60;            // 240 menit
const SUBUH_BATAS_B = 4 * 60 + 30;       // 270 menit
const SUBUH_WINDOW_END = 5 * 60;         // 300 menit

function getSubuhMenit(date) {
    return wibMenitHari(date);   // jendela absen subuh dihitung dalam WIB
}

// Mengembalikan 'A' / 'B' / 'C' jika sedang dalam jendela absen, atau null jika sudah/belum dibuka
function getSubuhNilaiSaatIni(date) {
    const menit = getSubuhMenit(date);
    if (menit < SUBUH_WINDOW_START || menit >= SUBUH_WINDOW_END) return null;
    if (menit < SUBUH_BATAS_A) return 'A';
    if (menit < SUBUH_BATAS_B) return 'B';
    return 'C';
}

function todayDateStr() {
    return wibTanggalIso();
}

let subuhClockInterval = null;
let subuhSudahAbsenHariIni = false;

// Dipanggil sekali saat dashboard dibuka, lalu jalan tiap beberapa detik untuk
// menyalakan/mematikan tombol otomatis sesuai jam saat ini.
function startSubuhClock() {
    if (subuhClockInterval) clearInterval(subuhClockInterval);
    refreshSubuhButtonUI();
    subuhClockInterval = setInterval(refreshSubuhButtonUI, 15000);
}

function refreshSubuhButtonUI() {
    const btn = document.getElementById('btn-absen-subuh');
    const label = document.getElementById('btn-absen-subuh-label');
    const info = document.getElementById('subuh-window-info');
    if (!btn || !label || !info) return;

    if (subuhSudahAbsenHariIni) {
        btn.disabled = true;
        label.innerText = "Sudah Absen";
        return;
    }

    const nilai = getSubuhNilaiSaatIni(new Date());
    if (nilai) {
        btn.disabled = false;
        label.innerText = "Absen Sekarang";
        info.innerText = "Absen dibuka 03.30 - 05.00 (sedang berlangsung)";
    } else {
        btn.disabled = true;
        label.innerText = "Absen Ditutup";
        info.innerText = "Absen dibuka 03.30 - 05.00";
    }
}

// Ambil status absen subuh milik siswa yang sedang login untuk hari ini
async function loadMySubuhStatus() {
    if (!supabaseClient || !activeUser) return;

    const { data } = await supabaseClient
        .from('absensi_subuh')
        .select('*')
        .eq('siswa_id', activeUser.id)
        .eq('tanggal', todayDateStr())
        .maybeSingle();

    const statusText = document.getElementById('subuh-status-text');
    subuhSudahAbsenHariIni = !!data;

    if (data) {
        const jamStr = fmtJam(data.jam_absen);
        statusText.innerText = `Nilai ${data.nilai} (${jamStr})`;
        statusText.className = "text-lg font-bold mt-0.5 " + (data.nilai === 'A' ? 'text-emerald-700' : data.nilai === 'B' ? 'text-amber-700' : 'text-rose-700');
    } else {
        statusText.innerText = "Belum Absen";
        statusText.className = "text-lg font-bold mt-0.5 text-indigo-900";
    }

    refreshSubuhButtonUI();
}

// Dipanggil saat siswa memencet tombol "Absen Sekarang"
async function absenSubuh() {
    if (!supabaseClient || !activeUser) return;
    if (subuhSudahAbsenHariIni) return;

    const now = new Date();
    const nilai = getSubuhNilaiSaatIni(now);
    if (!nilai) {
        alert("Absen sholat subuh hanya dibuka pukul 03.30 - 05.00.");
        refreshSubuhButtonUI();
        return;
    }

    const btn = document.getElementById('btn-absen-subuh');
    btn.disabled = true;
    document.getElementById('btn-absen-subuh-label').innerText = "Menyimpan...";

    const { error } = await supabaseClient
        .from('absensi_subuh')
        .insert({
            siswa_id: activeUser.id,
            tanggal: todayDateStr(),
            jam_absen: now.toISOString(),
            nilai: nilai
        });

    if (error) {
        alert("Gagal menyimpan absen: " + error.message);
        await loadMySubuhStatus();
        return;
    }

    await loadMySubuhStatus();
}

// ---- Rekap untuk Ketua / Wakil Ketua / Admin ----
async function loadKetuaSubuhRekap() {
    if (!supabaseClient) return;

    const tglInput = document.getElementById('subuh-rekap-tanggal');
    if (tglInput && !tglInput.value) tglInput.value = todayDateStr();
    const tanggal = tglInput ? tglInput.value : todayDateStr();

    const { data: listSubuh } = await supabaseClient
        .from('absensi_subuh')
        .select('*')
        .eq('tanggal', tanggal);

    const subuhMap = {};
    (listSubuh || []).forEach(a => { subuhMap[a.siswa_id] = a; });

    const listEl = document.getElementById('ketua-subuh-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    getSiswaOnly().slice().sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
        const rec = subuhMap[siswa.id];
        const nilai = rec ? rec.nilai : null;
        const jamStr = rec ? fmtJam(rec.jam_absen) : '-';

        let badgeClass = 'bg-slate-100 text-slate-400';
        if (nilai === 'A') badgeClass = 'bg-emerald-100 text-emerald-800';
        else if (nilai === 'B') badgeClass = 'bg-amber-100 text-amber-800';
        else if (nilai === 'C') badgeClass = 'bg-rose-100 text-rose-800';

        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition";
        div.innerHTML = `
            <span class="font-medium text-slate-700">${escapeHtml(siswa.nama)}</span>
            <span class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">${jamStr}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}">${nilai || 'Belum Absen'}</span>
            </span>
        `;
        listEl.appendChild(div);
    });
}

// ====================================================================
// REKAP HARIAN RENTANG BULAN (dipakai rekap absensi & rekap absen subuh)
// Satu sheet per bulan (kolom = tanggal 1..akhir bulan) + sheet "Ringkasan" bila lebih dari 1 bulan.
// ====================================================================
function rekapBangunWorkbookHarian({ daftar, siswa, petaPerBulan, kodeList, tanpaLabel, namaSheetRingkasan }) {
    const wb = XLSX.utils.book_new();
    const ringkas = {};   // siswaId -> { kode: n, tanpa: n }
    siswa.forEach(s => { ringkas[s.id] = { tanpa: 0 }; kodeList.forEach(k => { ringkas[s.id][k] = 0; }); });

    daftar.forEach(bulanStr => {
        const [tahun, bulan] = bulanStr.split('-').map(Number);
        const jumlahHari = new Date(tahun, bulan, 0).getDate();
        const header = ['Nama Siswa', ...Array.from({ length: jumlahHari }, (_, i) => i + 1), ...kodeList.map(k => 'Total ' + k), ...(tanpaLabel ? [tanpaLabel] : [])];
        const rows = [header];
        siswa.forEach(s => {
            const peta = (petaPerBulan[bulanStr] || {})[s.id] || {};
            const kolomHari = Array.from({ length: jumlahHari }, (_, i) => peta[i + 1] || '-');
            const total = {}; kodeList.forEach(k => { total[k] = 0; });
            let tanpa = 0;
            kolomHari.forEach(k => { if (total[k] !== undefined) total[k]++; else tanpa++; });
            kodeList.forEach(k => { ringkas[s.id][k] += total[k]; });
            ringkas[s.id].tanpa += tanpa;
            rows.push([s.nama, ...kolomHari, ...kodeList.map(k => total[k]), ...(tanpaLabel ? [tanpa] : [])]);
        });
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, ...Array.from({ length: jumlahHari }, () => ({ wch: 4 })), ...kodeList.map(() => ({ wch: 9 })), ...(tanpaLabel ? [{ wch: 14 }] : [])];
        XLSX.utils.book_append_sheet(wb, ws, waktuLabelBulan(bulanStr));
    });

    if (daftar.length > 1) {
        const rows = [['Nama Siswa', ...kodeList.map(k => 'Total ' + k), ...(tanpaLabel ? [tanpaLabel] : [])]];
        siswa.forEach(s => rows.push([s.nama, ...kodeList.map(k => ringkas[s.id][k]), ...(tanpaLabel ? [ringkas[s.id].tanpa] : [])]));
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, ...kodeList.map(() => ({ wch: 9 })), ...(tanpaLabel ? [{ wch: 18 }] : [])];
        XLSX.utils.book_append_sheet(wb, ws, namaSheetRingkasan);
    }
    return wb;
}

function rekapNamaFileRentang(awalNama, daftar) {
    return daftar.length > 1 ? `${awalNama}_${daftar[0]}_sd_${daftar[daftar.length - 1]}.xlsx` : `${awalNama}_${daftar[0]}.xlsx`;
}
function rekapRentangTanggal(daftar) {
    const [t, b] = daftar[daftar.length - 1].split('-').map(Number);
    return { awal: `${daftar[0]}-01`, akhir: `${daftar[daftar.length - 1]}-${String(new Date(t, b, 0).getDate()).padStart(2, '0')}` };
}

// Download rekap absen subuh untuk satu bulan atau rentang bulan (.xlsx) - hanya tombolnya muncul
// di panel Ketua/Wakil Ketua/Admin, jadi otomatis role lain tidak bisa mengaksesnya.
async function downloadRekapSubuh() {
    if (!supabaseClient) return;
    const rentang = rekapBacaRentang('subuh-rekap-bulan', 'subuh-rekap-bulan-sampai');
    if (rentang.galat) { alert(rentang.galat); return; }
    const { daftar } = rentang;
    const { awal, akhir } = rekapRentangTanggal(daftar);

    let data;
    try {
        data = await rekapAmbilBanyak(() => supabaseClient
            .from('absensi_subuh')
            .select('siswa_id, tanggal, jam_absen, nilai')
            .gte('tanggal', awal).lte('tanggal', akhir)
            .order('tanggal', { ascending: true }).order('siswa_id', { ascending: true }));
    } catch (error) {
        alert("Gagal mengambil data rekap: " + (error.message || error));
        return;
    }

    const petaPerBulan = {};   // { 'YYYY-MM': { siswaId: { hari: 'A'|'B'|'C' } } }
    data.forEach(item => {
        const bln = String(item.tanggal).slice(0, 7);
        const hari = Number(String(item.tanggal).slice(8, 10));
        const bulanMap = petaPerBulan[bln] || (petaPerBulan[bln] = {});
        if (!bulanMap[item.siswa_id]) bulanMap[item.siswa_id] = {};
        bulanMap[item.siswa_id][hari] = item.nilai;
    });

    const siswa = getSiswaOnly().slice().sort((a, b) => a.nama.localeCompare(b.nama));
    const wb = rekapBangunWorkbookHarian({ daftar, siswa, petaPerBulan, kodeList: ['A', 'B', 'C'], tanpaLabel: 'Total Tanpa Absen', namaSheetRingkasan: 'Ringkasan Subuh' });
    XLSX.writeFile(wb, rekapNamaFileRentang('Rekap_Absen_Subuh', daftar));
}

// ====================================================================
// PAPAN PENGUMUMAN & TUGAS
// ====================================================================

// Tampilan publik: dilihat oleh SEMUA role (anggota, ketua, sekretaris, bendahara)
async function loadPengumumanBoard() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('pengumuman')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

    const listEl = document.getElementById('pengumuman-board-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (error || !data || data.length === 0) {
        listEl.innerHTML = '<p class="text-center text-slate-400 italic text-xs py-3">Belum ada pengumuman atau tugas.</p>';
        return;
    }

    data.forEach(item => {
        const isTugas = item.jenis === 'Tugas';
        const badgeClass = isTugas ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800';
        const borderClass = isTugas ? 'border-amber-100' : 'border-sky-100';
        const deadlineHtml = (isTugas && item.deadline)
            ? `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1"><i data-lucide="clock" class="w-3 h-3"></i> Deadline: ${fmtTgl(item.deadline, { day: 'numeric', month: 'long', year: 'numeric' })}</span>`
            : '';
        const tanggalDibuat = fmtTgl(item.created_at, { day: 'numeric', month: 'short', year: 'numeric' });

        const div = document.createElement('div');
        div.className = `border ${borderClass} rounded-xl p-3`;
        div.innerHTML = `
            <div class="flex items-center justify-between gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}">${item.jenis}</span>
                <span class="text-[10px] text-slate-400">${tanggalDibuat}</span>
            </div>
            <h5 class="font-semibold text-sm text-slate-800">${escapeHtml(item.judul)}</h5>
            <p class="text-xs text-slate-500 mt-0.5 whitespace-pre-line">${escapeHtml(item.isi)}</p>
            ${deadlineHtml}
        `;
        listEl.appendChild(div);
    });

    lucide.createIcons();
}

// Tampilkan/sembunyikan kolom Deadline sesuai jenis yang dipilih di form Ketua
function toggleDeadlineField() {
    const jenis = document.getElementById('peng-jenis').value;
    const wrapper = document.getElementById('peng-deadline-wrapper');
    wrapper.classList.toggle('hidden', jenis !== 'Tugas');
}

// Kelola (khusus panel Ketua): daftar lengkap + tombol hapus
async function loadKetuaPengumumanList() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('pengumuman')
        .select('*')
        .order('created_at', { ascending: false });

    const listEl = document.getElementById('ketua-pengumuman-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (error || !data || data.length === 0) {
        listEl.innerHTML = '<p class="text-center text-slate-400 italic text-xs py-3">Belum ada pengumuman atau tugas.</p>';
        return;
    }

    data.forEach(item => {
        const isTugas = item.jenis === 'Tugas';
        const badgeClass = isTugas ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800';

        const div = document.createElement('div');
        div.className = "flex items-start justify-between gap-2 bg-white border border-slate-100 rounded-lg p-2.5";
        div.innerHTML = `
            <div class="min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}">${item.jenis}</span>
                    <span class="font-semibold text-xs text-slate-700 truncate">${escapeHtml(item.judul)}</span>
                </div>
                <p class="text-[11px] text-slate-400 truncate">${escapeHtml(item.isi)}</p>
            </div>
            <button onclick="deletePengumuman('${item.id}')" class="text-rose-400 hover:text-rose-600 transition shrink-0 p-1">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        listEl.appendChild(div);
    });

    lucide.createIcons();
}

async function submitPengumuman(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const jenis = document.getElementById('peng-jenis').value;
    const judul = document.getElementById('peng-judul').value;
    const isi = document.getElementById('peng-isi').value;
    const deadline = document.getElementById('peng-deadline').value || null;

    try {
        const { error } = await supabaseClient
            .from('pengumuman')
            .insert({
                jenis: jenis,
                judul: judul,
                isi: isi,
                deadline: jenis === 'Tugas' ? deadline : null,
                dibuat_oleh: activeUser?.nama || 'Ketua Kelas'
            });

        if (error) throw error;

        // Reset form
        document.getElementById('form-pengumuman').reset();
        document.getElementById('peng-deadline-wrapper').classList.add('hidden');

        // Refresh kedua tampilan (kelola + papan publik)
        await loadKetuaPengumumanList();
        await loadPengumumanBoard();
    } catch (err) {
        console.error("Gagal menambah pengumuman:", err);
        alert("Error menambah pengumuman: " + err.message);
    }
}

async function deletePengumuman(id) {
    if (!supabaseClient) return;
    if (!confirm("Yakin ingin menghapus pengumuman/tugas ini?")) return;

    try {
        const { error } = await supabaseClient.from('pengumuman').delete().eq('id', id);
        if (error) throw error;

        await loadKetuaPengumumanList();
        await loadPengumumanBoard();
    } catch (err) {
        console.error("Gagal menghapus pengumuman:", err);
        alert("Error menghapus pengumuman: " + err.message);
    }
}


// ====================================================================
// 7. ROLE PANEL: SEKRETARIS
// ====================================================================
// Kode singkat -> nama status lengkap yang dipakai di database
const ABSEN_STATUS_MAP = { H: 'Hadir', I: 'Ijin', S: 'Sakit', D: 'Dispen', A: 'Alpha' };
const ABSEN_BTN_COLOR = {
    H: 'bg-emerald-500 hover:bg-emerald-600',
    I: 'bg-yellow-500 hover:bg-yellow-600',
    S: 'bg-sky-500 hover:bg-sky-600',
    D: 'bg-purple-500 hover:bg-purple-600',
    A: 'bg-rose-500 hover:bg-rose-600'
};

function getSekrTanggalTerpilih() {
    const input = document.getElementById('sekr-tanggal');
    // Default ke hari ini kalau belum pernah dipilih
    if (!input.value) {
        input.value = wibTanggalIso();
    }
    return input.value;
}

async function loadSekretarisPanel() {
    if (!supabaseClient) return;

    const tanggalTerpilih = getSekrTanggalTerpilih();

    // Ambil absensi yang SUDAH tercatat untuk tanggal terpilih
    const { data, error } = await supabaseClient
        .from('absensi')
        .select('*')
        .eq('tanggal', tanggalTerpilih);

    const absenMap = {};
    if (data) {
        data.forEach(item => { absenMap[item.siswa_id] = item; });
    }

    const tBody = document.getElementById('sekr-absen-table-body');
    tBody.innerHTML = '';

    if (!siswaListGlobal || siswaListGlobal.length === 0) {
        tBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-slate-400 italic">Belum ada data siswa.</td></tr>';
        return;
    }

    // Tampilkan SEMUA siswa (bukan cuma yang sudah diabsen) supaya sekretaris tinggal tap
    getSiswaOnly().forEach(siswa => {
        const existing = absenMap[siswa.id];
        const currentStatus = existing ? existing.status : null;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";

        const buttonsHtml = Object.keys(ABSEN_STATUS_MAP).map(kode => {
            const isActive = existing && currentStatus === ABSEN_STATUS_MAP[kode];
            const activeClasses = isActive ? `${ABSEN_BTN_COLOR[kode]} text-white shadow` : 'bg-slate-100 text-slate-500 hover:bg-slate-200';
            return `<button type="button" onclick="toggleAbsensiStatus('${siswa.id}', '${kode}')" class="w-8 h-8 rounded-lg font-bold text-xs transition ${activeClasses}">${kode}</button>`;
        }).join('');

        tr.innerHTML = `
            <td class="p-3 font-semibold text-slate-700 whitespace-nowrap">${escapeHtml(siswa.nama)}</td>
            <td class="p-3">
                <div class="flex items-center justify-center gap-1.5">${buttonsHtml}</div>
            </td>
            <td class="p-3">
                <input type="text" value="${escapeHtml(existing?.keterangan || '')}" placeholder="Opsional..."
                    onchange="updateAbsensiKeterangan('${siswa.id}', this.value)"
                    class="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-primary-500 focus:border-primary-500">
            </td>
        `;
        tBody.appendChild(tr);
    });
}

// Tap salah satu huruf H/I/S/D/A -> langsung tersimpan (upsert) ke Supabase
async function toggleAbsensiStatus(siswaId, kode) {
    if (!supabaseClient) return;

    const tanggalTerpilih = getSekrTanggalTerpilih();
    const status = ABSEN_STATUS_MAP[kode];

    // Ambil keterangan yang sudah diketik di baris ini (kalau ada) supaya tidak hilang
    const ketInput = document.querySelector(`#sekr-absen-table-body input[onchange*="'${siswaId}'"]`);
    const keterangan = ketInput ? ketInput.value : '';

    try {
        const { error } = await supabaseClient
            .from('absensi')
            .upsert({
                siswa_id: siswaId,
                tanggal: tanggalTerpilih,
                status: status,
                keterangan: keterangan
            }, { onConflict: 'siswa_id,tanggal' });

        if (error) throw error;

        await loadSekretarisPanel();

        // Kalau yang diabsen tanggal hari ini, refresh juga statistik & kalender
        const todayStr = wibTanggalIso();
        if (tanggalTerpilih === todayStr) {
            await loadBaseDashboardStats();
            renderSiswaAttendanceCalendar();
        }
    } catch (err) {
        console.error("Gagal mengirim absensi:", err);
        alert("Error menyimpan absen: " + err.message);
    }
}

// Update keterangan tanpa mengubah status (misal nambah alasan setelah pilih status)
async function updateAbsensiKeterangan(siswaId, keterangan) {
    if (!supabaseClient) return;

    const tanggalTerpilih = getSekrTanggalTerpilih();

    const { data: existing } = await supabaseClient
        .from('absensi')
        .select('id')
        .eq('siswa_id', siswaId)
        .eq('tanggal', tanggalTerpilih)
        .maybeSingle();

    if (!existing) {
        alert("Pilih dulu status kehadirannya (H/I/S/D/A) sebelum mengisi keterangan.");
        await loadSekretarisPanel();
        return;
    }

    const { error } = await supabaseClient
        .from('absensi')
        .update({ keterangan })
        .eq('id', existing.id);

    if (error) {
        console.error("Gagal memperbarui keterangan:", error);
        alert("Error menyimpan keterangan: " + error.message);
    }
}

// ====================================================================
// 7B. DOWNLOAD REKAP ABSENSI BULANAN (CSV, bisa dibuka di Excel)
// ====================================================================
async function downloadRekapAbsensi() {
    if (!supabaseClient) return;
    const rentang = rekapBacaRentang('rekap-bulan', 'rekap-bulan-sampai');
    if (rentang.galat) { alert(rentang.galat); return; }
    const { daftar } = rentang;
    const { awal, akhir } = rekapRentangTanggal(daftar);

    let data;
    try {
        data = await rekapAmbilBanyak(() => supabaseClient
            .from('absensi')
            .select('siswa_id, tanggal, status')
            .gte('tanggal', awal).lte('tanggal', akhir)
            .order('tanggal', { ascending: true }).order('siswa_id', { ascending: true }));
    } catch (error) {
        alert("Gagal mengambil data rekap: " + (error.message || error));
        return;
    }

    // Susun data per bulan -> siswa -> tanggal -> huruf status
    const petaPerBulan = {};
    data.forEach(item => {
        const bln = String(item.tanggal).slice(0, 7);
        const hari = Number(String(item.tanggal).slice(8, 10));
        const kode = Object.keys(ABSEN_STATUS_MAP).find(k => ABSEN_STATUS_MAP[k] === item.status) || '-';
        const bulanMap = petaPerBulan[bln] || (petaPerBulan[bln] = {});
        if (!bulanMap[item.siswa_id]) bulanMap[item.siswa_id] = {};
        bulanMap[item.siswa_id][hari] = kode;
    });

    const siswa = getSiswaOnly().slice().sort((a, b) => a.nama.localeCompare(b.nama));
    // Worksheet Excel asli (bukan CSV) supaya tidak tergantung setting regional
    const wb = rekapBangunWorkbookHarian({ daftar, siswa, petaPerBulan, kodeList: ['H', 'I', 'S', 'D', 'A'], tanpaLabel: null, namaSheetRingkasan: 'Ringkasan Absensi' });
    XLSX.writeFile(wb, rekapNamaFileRentang('Rekap_Absensi', daftar));
}


// ====================================================================
// 8. ROLE PANEL: BENDAHARA TABUNGAN VILLA
// ====================================================================
// Fungsi generik: render total tabungan bersih (setor-tarik) per siswa untuk tabel tabungan manapun
// ====================================================================
// REKAP TABUNGAN BULANAN (Bendahara): ringkasan di layar + unduh Excel
// ====================================================================
const REKAP_TABUNGAN = {
    villa:    { tabel: 'tabungan_villa',    judul: 'Tabungan Villa' },
    tabungan: { tabel: 'tabungan',          judul: 'Tabungan Reguler' },
    yearbook: { tabel: 'tabungan_yearbook', judul: 'Tabungan Yearbook' },
    kas:      { tabel: 'tabungan_kas',      judul: 'Tabungan Kas' }
};

// Bulan berjalan memakai waktu lokal (bukan UTC) supaya tidak meleset di pergantian bulan
function rekapBulanIni() { return wibBulanIni(); }

// Ambil semua baris sebuah query (dipecah per 1000 baris karena batas bawaan Supabase)
async function rekapAmbilBanyak(buatQuery) {
    const semua = [];
    for (let dari = 0; ; dari += 1000) {
        const { data, error } = await buatQuery().range(dari, dari + 999);
        if (error) throw error;
        semua.push(...(data || []));
        if (!data || data.length < 1000) break;
    }
    return semua;
}

// Membaca rentang bulan dari dua input ("Dari" wajib, "Sampai" kosong = sama dengan "Dari")
function rekapBacaRentang(idDari, idSampai) {
    const dari = document.getElementById(idDari)?.value;
    const sampai = document.getElementById(idSampai)?.value || dari;
    if (!dari) return { galat: 'Silakan pilih bulan rekap terlebih dahulu.' };
    const daftar = waktuDaftarBulan(dari, sampai);
    if (!daftar) return { galat: 'Rentang bulan tidak valid: "Sampai" harus sama dengan atau sesudah "Dari" (maksimal 24 bulan).' };
    return { dari, sampai, daftar };
}

// Hitung rekap rentang bulan (WIB): saldo awal, setor, tarik, saldo akhir per siswa + rincian per bulan
async function rekapHitungTabungan(prefix, daftarBulan) {
    const cfg = REKAP_TABUNGAN[prefix];
    const awal = wibAwalBulanMs(daftarBulan[0]);
    const akhir = wibAwalBulanBerikutMs(daftarBulan[daftarBulan.length - 1]);
    const semua = await rekapAmbilBanyak(() => supabaseClient
        .from(cfg.tabel)
        .select('siswa_id, nominal, jenis, tanggal, keterangan')
        .order('tanggal', { ascending: true })
        .order('siswa_id', { ascending: true }));
    const nilai = t => t.jenis === 'setor' ? t.nominal : -t.nominal;

    const per = {};
    const ambil = id => per[id] || (per[id] = { awal: 0, setor: 0, tarik: 0, jumlah: 0, bulan: {} });
    const transaksiRentang = [];
    semua.forEach(t => {
        if (!t.siswa_id) return;
        const waktu = waktuParse(t.tanggal).getTime();
        const r = ambil(t.siswa_id);
        if (waktu < awal) r.awal += nilai(t);
        else if (waktu < akhir) {
            const bln = wibTanggalIso(t.tanggal).slice(0, 7);
            const b = r.bulan[bln] || (r.bulan[bln] = { setor: 0, tarik: 0 });
            if (t.jenis === 'setor') { r.setor += t.nominal; b.setor += t.nominal; }
            else { r.tarik += t.nominal; b.tarik += t.nominal; }
            r.jumlah++;
            transaksiRentang.push(t);
        }
    });
    let totSetor = 0, totTarik = 0, totAwal = 0;
    Object.values(per).forEach(r => { totSetor += r.setor; totTarik += r.tarik; totAwal += r.awal; });
    return { per, transaksiRentang, totSetor, totTarik, totAwal, totAkhir: totAwal + totSetor - totTarik };
}

async function previewRekapTabungan(prefix) {
    const input = document.getElementById('rekap-bln-' + prefix);
    const box = document.getElementById('rekap-ringkas-' + prefix);
    if (!input || !box || !supabaseClient) return;
    if (!input.value) input.value = rekapBulanIni();
    const kunci = input.value + '|' + (document.getElementById('rekap-bln-sampai-' + prefix)?.value || '');
    const rentang = rekapBacaRentang('rekap-bln-' + prefix, 'rekap-bln-sampai-' + prefix);
    if (rentang.galat) { box.innerHTML = `<p class="col-span-3 text-xs text-rose-600 py-1">${escapeHtml(rentang.galat)}</p>`; return; }
    box.innerHTML = '<p class="col-span-3 text-xs text-slate-500 py-1">Menghitung rekap...</p>';
    try {
        const r = await rekapHitungTabungan(prefix, rentang.daftar);
        const kunciSekarang = document.getElementById('rekap-bln-' + prefix).value + '|' + (document.getElementById('rekap-bln-sampai-' + prefix)?.value || '');
        if (kunciSekarang !== kunci) return;   // pengguna sudah ganti rentang; abaikan hasil lama
        const kotak = (label, angka, warna) => `<div class="bg-white rounded-lg border border-slate-200 py-2 px-1">
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">${label}</p>
            <p class="text-xs sm:text-sm font-bold ${warna}">${formatRupiah(angka)}</p></div>`;
        box.innerHTML = kotak('Setor', r.totSetor, 'text-emerald-700')
            + kotak('Tarik', r.totTarik, 'text-amber-700')
            + kotak('Saldo akhir', r.totAkhir, 'text-slate-900');
    } catch (err) {
        console.error('Gagal menghitung rekap tabungan:', err);
        box.innerHTML = '<p class="col-span-3 text-xs text-rose-600 py-1">Rekap belum bisa dihitung. Periksa koneksi lalu coba lagi.</p>';
    }
}

async function downloadRekapTabungan(prefix) {
    if (!supabaseClient) return;
    const cfg = REKAP_TABUNGAN[prefix];
    const rentang = rekapBacaRentang('rekap-bln-' + prefix, 'rekap-bln-sampai-' + prefix);
    if (rentang.galat) { alert(rentang.galat); return; }
    const { daftar } = rentang;

    let r;
    try { r = await rekapHitungTabungan(prefix, daftar); }
    catch (err) { alert('Gagal mengambil data rekap: ' + (err.message || err)); return; }

    const judulRentang = daftar.length > 1
        ? `${waktuLabelBulan(daftar[0])} - ${waktuLabelBulan(daftar[daftar.length - 1])}`
        : waktuLabelBulan(daftar[0]);
    const siswa = getSiswaOnly().slice().sort((a, b) => a.nama.localeCompare(b.nama));
    const namaById = Object.fromEntries(siswa.map(x => [x.id, x.nama]));
    const kosong = { awal: 0, setor: 0, tarik: 0, jumlah: 0, bulan: {} };

    // Sheet 1: rekap seluruh rentang per siswa
    const rekap = [
        [`Rekap ${cfg.judul} - ${judulRentang}`], [],
        ['No', 'Nama Siswa', 'Saldo Awal', 'Total Setor', 'Total Tarik', 'Saldo Akhir', 'Jumlah Transaksi']
    ];
    siswa.forEach((x, i) => {
        const v = r.per[x.id] || kosong;
        rekap.push([i + 1, x.nama, v.awal, v.setor, v.tarik, v.awal + v.setor - v.tarik, v.jumlah]);
    });
    rekap.push(['', 'TOTAL', r.totAwal, r.totSetor, r.totTarik, r.totAkhir, r.transaksiRentang.length]);
    const ws1 = XLSX.utils.aoa_to_sheet(rekap);
    ws1['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Rekap per Siswa');

    // Sheet 2 (hanya jika lebih dari satu bulan): setor & tarik tiap bulan
    if (daftar.length > 1) {
        const kepala = ['No', 'Nama Siswa'];
        daftar.forEach(b => { kepala.push(`${waktuLabelBulan(b)} Setor`, `${waktuLabelBulan(b)} Tarik`); });
        const perBulan = [kepala];
        const total = daftar.flatMap(() => [0, 0]);
        siswa.forEach((x, i) => {
            const v = r.per[x.id] || kosong;
            const baris = [i + 1, x.nama];
            daftar.forEach((b, k) => {
                const m = v.bulan[b] || { setor: 0, tarik: 0 };
                baris.push(m.setor, m.tarik);
                total[k * 2] += m.setor; total[k * 2 + 1] += m.tarik;
            });
            perBulan.push(baris);
        });
        perBulan.push(['', 'TOTAL', ...total]);
        const ws2 = XLSX.utils.aoa_to_sheet(perBulan);
        ws2['!cols'] = [{ wch: 5 }, { wch: 30 }, ...daftar.flatMap(() => [{ wch: 18 }, { wch: 18 }])];
        XLSX.utils.book_append_sheet(wb, ws2, 'Per Bulan');
    }

    // Sheet terakhir: seluruh transaksi di rentang itu (tanggal & jam WIB)
    const detail = [['Tanggal', 'Jam (WIB)', 'Nama Siswa', 'Jenis', 'Nominal', 'Keterangan']];
    r.transaksiRentang.forEach(t => {
        detail.push([
            fmtTgl(t.tanggal, { day: 'numeric', month: 'short', year: 'numeric' }),
            fmtJam(t.tanggal),
            namaById[t.siswa_id] || 'Unknown',
            t.jenis === 'setor' ? 'Setor' : 'Tarik',
            t.nominal,
            t.keterangan || ''
        ]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(detail);
    ws3['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 8 }, { wch: 14 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Transaksi');

    const sufiks = daftar.length > 1 ? `${daftar[0]}_sd_${daftar[daftar.length - 1]}` : daftar[0];
    XLSX.writeFile(wb, `Rekap_${cfg.judul.replace(/\s+/g, '_')}_${sufiks}.xlsx`);
}

async function loadTotalTabunganPerSiswa(tableName, containerId) {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient.from(tableName).select('siswa_id, nominal, jenis');
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (error) {
        container.innerHTML = '<p class="text-center text-slate-400 italic text-xs py-3 col-span-2">Gagal memuat total tabungan.</p>';
        return;
    }

    const totalMap = {};
    (data || []).forEach(item => {
        if (!item.siswa_id) return;
        if (!totalMap[item.siswa_id]) totalMap[item.siswa_id] = 0;
        if (item.jenis === 'setor') totalMap[item.siswa_id] += item.nominal;
        else if (item.jenis === 'tarik') totalMap[item.siswa_id] -= item.nominal;
    });

    const daftarSiswa = getSiswaOnly().slice().sort((a, b) => a.nama.localeCompare(b.nama));
    if (daftarSiswa.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-400 italic text-xs py-3 col-span-2">Belum ada data siswa.</p>';
        return;
    }

    daftarSiswa.forEach(siswa => {
        const total = totalMap[siswa.id] || 0;
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100";
        div.innerHTML = `
            <span class="font-medium text-slate-700 text-xs truncate pr-2">${escapeHtml(siswa.nama)}</span>
            <span class="font-bold text-xs shrink-0 ${total > 0 ? 'text-emerald-600' : 'text-slate-400'}">${formatRupiah(total)}</span>
        `;
        container.appendChild(div);
    });
}

// Fungsi generik: hitung & tampilkan TOTAL KESELURUHAN (semua siswa dijumlah) untuk satu jenis tabungan
async function loadTotalKeseluruhanTabungan(tableName, elementId) {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient.from(tableName).select('nominal, jenis');
    const el = document.getElementById(elementId);
    if (!el) return;

    if (error) {
        el.innerText = 'Gagal memuat';
        return;
    }

    let total = 0;
    (data || []).forEach(item => {
        if (item.jenis === 'setor') total += item.nominal;
        else if (item.jenis === 'tarik') total -= item.nominal;
    });

    el.innerText = formatRupiah(total);
}

async function loadBendaharaVillaPanel() {
    if (!supabaseClient) return;
    if (document.getElementById('rekap-bln-villa')?.value) previewRekapTabungan('villa');   // segarkan ringkasan rekap

    await loadTotalKeseluruhanTabungan('tabungan_villa', 'villa-grand-total');
    await loadTotalTabunganPerSiswa('tabungan_villa', 'villa-total-siswa-list');

    const { data, error } = await supabaseClient
        .from('tabungan_villa')
        .select('*, siswa:siswa_id(nama)')
        .order('tanggal', { ascending: false })
        .limit(20); // Ambil 20 transaksi terakhir

    const tBody = document.getElementById('villa-table-body');
    tBody.innerHTML = '';

    if (error || !data || data.length === 0) {
        tBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Belum ada transaksi tabungan villa.</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";

        const formattedDate = fmtWaktu(item.tanggal, {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const badgeBg = item.jenis === 'setor' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        const sign = item.jenis === 'setor' ? '+' : '-';
        const nominalColor = item.jenis === 'setor' ? 'text-emerald-600' : 'text-amber-600';

        tr.innerHTML = `
            <td class="p-3 font-semibold text-slate-700">${escapeHtml(item.siswa?.nama || 'Unknown')}</td>
            <td class="p-3 text-slate-500">${formattedDate}</td>
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeBg}">${item.jenis}</span>
            </td>
            <td class="p-3 text-right font-bold ${nominalColor}">${sign} ${formatRupiah(item.nominal)}</td>
            <td class="p-3 text-slate-500">${escapeHtml(item.keterangan || '-')}</td>
        `;
        tBody.appendChild(tr);
    });
}

async function submitVilla(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const siswaId = document.getElementById('villa-siswa').value;
    const nominal = parseInt(document.getElementById('villa-nominal').value);
    const jenis = document.querySelector('input[name="villa-jenis"]:checked')?.value;
    const keterangan = document.getElementById('villa-ket').value;

    if (!siswaId || !nominal || !jenis) {
        alert("Harap lengkapi formulir transaksi tabungan villa!");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('tabungan_villa')
            .insert({
                siswa_id: siswaId,
                nominal: nominal,
                jenis: jenis,
                keterangan: keterangan
            });

        if (error) throw error;

        // Reset Form
        document.getElementById('villa-siswa').value = '';
        document.getElementById('villa-nominal').value = '';
        document.getElementById('villa-ket').value = '';

        // Refresh Panels
        await loadBendaharaVillaPanel();
        await loadBaseDashboardStats();
        await loadSiswaNabungRiwayat();

        alert(`Transaksi tabungan villa ${jenis} sebesar ${formatRupiah(nominal)} berhasil dicatat!`);
    } catch (err) {
        console.error("Gagal mencatat transaksi tabungan villa:", err);
        alert("Error mencatatkan tabungan villa: " + err.message);
    }
}


// ====================================================================
// 9. ROLE PANEL: BENDAHARA TABUNGAN
// ====================================================================
async function loadBendaharaTabunganPanel() {
    if (!supabaseClient) return;
    if (document.getElementById('rekap-bln-tabungan')?.value) previewRekapTabungan('tabungan');   // segarkan ringkasan rekap

    await loadTotalTabunganPerSiswa('tabungan', 'tab-total-siswa-list');

    const { data, error } = await supabaseClient
        .from('tabungan')
        .select('*, siswa:siswa_id(nama)')
        .order('tanggal', { ascending: false })
        .limit(20); // Ambil 20 transaksi terakhir

    const tBody = document.getElementById('tab-table-body');
    tBody.innerHTML = '';

    if (error || !data || data.length === 0) {
        tBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Belum ada transaksi tabungan.</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";

        const formattedDate = fmtWaktu(item.tanggal, {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const badgeBg = item.jenis === 'setor' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        const sign = item.jenis === 'setor' ? '+' : '-';
        const nominalColor = item.jenis === 'setor' ? 'text-emerald-600' : 'text-amber-600';

        tr.innerHTML = `
            <td class="p-3 font-semibold text-slate-700">${escapeHtml(item.siswa?.nama || 'Unknown')}</td>
            <td class="p-3 text-slate-500">${formattedDate}</td>
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeBg}">${item.jenis}</span>
            </td>
            <td class="p-3 text-right font-bold ${nominalColor}">${sign} ${formatRupiah(item.nominal)}</td>
            <td class="p-3 text-slate-500">${escapeHtml(item.keterangan || '-')}</td>
        `;
        tBody.appendChild(tr);
    });
}

async function submitTabungan(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const siswaId = document.getElementById('tab-siswa').value;
    const nominal = parseInt(document.getElementById('tab-nominal').value);
    const jenis = document.querySelector('input[name="tab-jenis"]:checked')?.value;
    const keterangan = document.getElementById('tab-ket').value;

    if (!siswaId || !nominal || !jenis) {
        alert("Harap lengkapi formulir transaksi tabungan!");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('tabungan')
            .insert({
                siswa_id: siswaId,
                nominal: nominal,
                jenis: jenis,
                keterangan: keterangan
            });

        if (error) throw error;

        // Reset Form
        document.getElementById('tab-siswa').value = '';
        document.getElementById('tab-nominal').value = '';
        document.getElementById('tab-ket').value = '';

        // Refresh Panels
        await loadBendaharaTabunganPanel();
        await loadBaseDashboardStats();
        await loadSiswaNabungRiwayat();
        
        alert(`Transaksi tabungan ${jenis} sebesar ${formatRupiah(nominal)} berhasil dicatat!`);
    } catch (err) {
        console.error("Gagal mencatat transaksi tabungan:", err);
        alert("Error mencatatkan tabungan: " + err.message);
    }
}

// ====================================================================
// ROLE PANEL: BENDAHARA TABUNGAN YEARBOOK
// ====================================================================
async function loadBendaharaYearbookPanel() {
    if (!supabaseClient) return;
    if (document.getElementById('rekap-bln-yearbook')?.value) previewRekapTabungan('yearbook');   // segarkan ringkasan rekap

    await loadTotalKeseluruhanTabungan('tabungan_yearbook', 'yearbook-grand-total');
    await loadTotalTabunganPerSiswa('tabungan_yearbook', 'yearbook-total-siswa-list');

    const { data, error } = await supabaseClient
        .from('tabungan_yearbook')
        .select('*, siswa:siswa_id(nama)')
        .order('tanggal', { ascending: false })
        .limit(20); // Ambil 20 transaksi terakhir

    const tBody = document.getElementById('yearbook-table-body');
    tBody.innerHTML = '';

    if (error || !data || data.length === 0) {
        tBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Belum ada transaksi tabungan yearbook.</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";

        const formattedDate = fmtWaktu(item.tanggal, {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const badgeBg = item.jenis === 'setor' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        const sign = item.jenis === 'setor' ? '+' : '-';
        const nominalColor = item.jenis === 'setor' ? 'text-emerald-600' : 'text-amber-600';

        tr.innerHTML = `
            <td class="p-3 font-semibold text-slate-700">${escapeHtml(item.siswa?.nama || 'Unknown')}</td>
            <td class="p-3 text-slate-500">${formattedDate}</td>
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeBg}">${item.jenis}</span>
            </td>
            <td class="p-3 text-right font-bold ${nominalColor}">${sign} ${formatRupiah(item.nominal)}</td>
            <td class="p-3 text-slate-500">${escapeHtml(item.keterangan || '-')}</td>
        `;
        tBody.appendChild(tr);
    });
}

async function submitYearbook(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const siswaId = document.getElementById('yearbook-siswa').value;
    const nominal = parseInt(document.getElementById('yearbook-nominal').value);
    const jenis = document.querySelector('input[name="yearbook-jenis"]:checked')?.value;
    const keterangan = document.getElementById('yearbook-ket').value;

    if (!siswaId || !nominal || !jenis) {
        alert("Harap lengkapi formulir transaksi tabungan yearbook!");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('tabungan_yearbook')
            .insert({
                siswa_id: siswaId,
                nominal: nominal,
                jenis: jenis,
                keterangan: keterangan
            });

        if (error) throw error;

        // Reset Form
        document.getElementById('yearbook-siswa').value = '';
        document.getElementById('yearbook-nominal').value = '';
        document.getElementById('yearbook-ket').value = '';

        // Refresh Panels
        await loadBendaharaYearbookPanel();
        await loadBaseDashboardStats();
        await loadSiswaNabungRiwayat();

        alert(`Transaksi tabungan yearbook ${jenis} sebesar ${formatRupiah(nominal)} berhasil dicatat!`);
    } catch (err) {
        console.error("Gagal mencatat transaksi tabungan yearbook:", err);
        alert("Error mencatatkan tabungan yearbook: " + err.message);
    }
}

// ====================================================================
// ROLE PANEL: BENDAHARA TABUNGAN KAS
// ====================================================================
async function loadBendaharaKasPanel() {
    if (!supabaseClient) return;
    if (document.getElementById('rekap-bln-kas')?.value) previewRekapTabungan('kas');   // segarkan ringkasan rekap

    await loadTotalKeseluruhanTabungan('tabungan_kas', 'kas-grand-total');
    await loadTotalTabunganPerSiswa('tabungan_kas', 'kas-total-siswa-list');

    const { data, error } = await supabaseClient
        .from('tabungan_kas')
        .select('*, siswa:siswa_id(nama)')
        .order('tanggal', { ascending: false })
        .limit(20); // Ambil 20 transaksi terakhir

    const tBody = document.getElementById('kas-table-body');
    tBody.innerHTML = '';

    if (error || !data || data.length === 0) {
        tBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Belum ada transaksi tabungan kas.</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";

        const formattedDate = fmtWaktu(item.tanggal, {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const badgeBg = item.jenis === 'setor' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        const sign = item.jenis === 'setor' ? '+' : '-';
        const nominalColor = item.jenis === 'setor' ? 'text-emerald-600' : 'text-amber-600';

        tr.innerHTML = `
            <td class="p-3 font-semibold text-slate-700">${escapeHtml(item.siswa?.nama || 'Unknown')}</td>
            <td class="p-3 text-slate-500">${formattedDate}</td>
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeBg}">${item.jenis}</span>
            </td>
            <td class="p-3 text-right font-bold ${nominalColor}">${sign} ${formatRupiah(item.nominal)}</td>
            <td class="p-3 text-slate-500">${escapeHtml(item.keterangan || '-')}</td>
        `;
        tBody.appendChild(tr);
    });
}

async function submitKas(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const siswaId = document.getElementById('kas-siswa').value;
    const nominal = parseInt(document.getElementById('kas-nominal').value);
    const jenis = document.querySelector('input[name="kas-jenis"]:checked')?.value;
    const keterangan = document.getElementById('kas-ket').value;

    if (!siswaId || !nominal || !jenis) {
        alert("Harap lengkapi formulir transaksi tabungan kas!");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('tabungan_kas')
            .insert({
                siswa_id: siswaId,
                nominal: nominal,
                jenis: jenis,
                keterangan: keterangan
            });

        if (error) throw error;

        // Reset Form
        document.getElementById('kas-siswa').value = '';
        document.getElementById('kas-nominal').value = '';
        document.getElementById('kas-ket').value = '';

        // Refresh Panels
        await loadBendaharaKasPanel();
        await loadBaseDashboardStats();

        alert(`Transaksi tabungan kas ${jenis} sebesar ${formatRupiah(nominal)} berhasil dicatat!`);
    } catch (err) {
        console.error("Gagal mencatat transaksi tabungan kas:", err);
        alert("Error mencatatkan tabungan kas: " + err.message);
    }
}

// ====================================================================
// ROLE PANEL: ADMIN - KELOLA DATA SISWA
// ====================================================================
const ALL_ROLES = [
    { value: 'anggota', label: 'Anggota' },
    { value: 'ketua', label: 'Ketua' },
    { value: 'wakil ketua', label: 'Wakil Ketua' },
    { value: 'sekretaris', label: 'Sekretaris' },
    { value: 'bendahara_tabungan_villa', label: 'Bendahara Tabungan Villa' },
    { value: 'bendahara_tabungan', label: 'Bendahara Tabungan' },
    { value: 'bendahara_tabungan_yearbook', label: 'Bendahara Tabungan Yearbook' },
    { value: 'bendahara_tabungan_kas', label: 'Bendahara Tabungan Kas' },
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'admin', label: 'Admin' }
];

// Isi dropdown "Pilih Siswa" di panel Kelola Data Siswa
async function loadAdminSiswaPanel() {
    const selectEl = document.getElementById('admin-pilih-siswa');
    if (!selectEl) return;

    selectEl.innerHTML = '<option value="" disabled selected>Pilih nama siswa...</option>';
    siswaListGlobal.slice().sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
        const opt = document.createElement('option');
        opt.value = siswa.id;
        opt.textContent = siswa.nama;
        selectEl.appendChild(opt);
    });

    // Sembunyikan editor sampai ada nama yang dipilih lagi
    document.getElementById('admin-siswa-editor').classList.add('hidden');
}

// Setelah nama dipilih -> tampilkan role saat ini di bawahnya
function loadSelectedSiswaEditor() {
    const siswaId = document.getElementById('admin-pilih-siswa').value;
    const editor = document.getElementById('admin-siswa-editor');
    if (!siswaId) {
        editor.classList.add('hidden');
        return;
    }

    const siswa = siswaListGlobal.find(s => s.id === siswaId);
    if (!siswa) return;

    document.getElementById('admin-edit-role').value = siswa.role;
    document.getElementById('admin-edit-kelas').value = getKelasKey(siswa);
    editor.classList.remove('hidden');
}

async function simpanRoleSiswa() {
    if (!supabaseClient) return;

    const siswaId = document.getElementById('admin-pilih-siswa').value;
    const newRole = document.getElementById('admin-edit-role').value;
    const newKelas = document.getElementById('admin-edit-kelas').value;
    if (!siswaId) return;

    try {
        const { error } = await supabaseClient.from('siswa').update({ role: newRole, kelas_tipe: newKelas || null }).eq('id', siswaId);
        if (error) throw error;
        await fetchSiswaList();
        await loadAdminSiswaPanel();
        alert("Role & kelas berhasil diperbarui.");
    } catch (err) {
        console.error("Gagal mengubah role siswa:", err);
        alert("Error mengubah role: " + err.message);
    }
}

async function resetSiswaPin() {
    if (!supabaseClient) return;

    const siswaId = document.getElementById('admin-pilih-siswa').value;
    if (!siswaId) return;
    const siswa = siswaListGlobal.find(s => s.id === siswaId);
    const nama = siswa ? siswa.nama : 'siswa ini';

    if (!confirm(`Reset PIN untuk ${nama}? PIN lama akan diganti PIN acak yang baru.`)) return;

    const newPin = String(Math.floor(100000 + Math.random() * 900000));

    try {
        const { error } = await supabaseClient.rpc('admin_reset_pin', { p_siswa_id: siswaId, p_pin: newPin });
        if (error) throw error;
        alert(`PIN baru untuk ${nama}: ${newPin}\n\nCatat dan sampaikan langsung ke siswa yang bersangkutan.`);
    } catch (err) {
        console.error("Gagal reset PIN:", err);
        alert("Error reset PIN: " + err.message);
    }
}

