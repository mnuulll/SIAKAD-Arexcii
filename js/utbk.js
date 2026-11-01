// ====================================================================
// FITUR UTBK (khusus siswa kelas UTBK)
//   Ringkasan | Try Out | Analisis | Target kampus | Info UTBK & kampus
// Data try out & target disimpan di tabel utbk_tryout / utbk_target (RLS: hanya
// pemilik data, dan hanya siswa kelas UTBK). Semua teks dari pengguna di-escape
// dengan escapeHtml() (app.js) sebelum masuk ke innerHTML.
// ====================================================================

// ---------- Data statis: informasi UTBK ----------
// Diperbarui terakhir 31 Oktober 2026. Sumber: portal SNPMB (snpmb.id) dan
// pemberitaan ketentuan UTBK-SNBT 2026. Ketentuan 2027 belum diumumkan resmi:
// ganti nilai di bawah ini setelah panitia SNPMB merilis jadwal (biasanya Desember-Januari).
const UTBK_INFO_DIPERBARUI = '31 Oktober 2026';

const UTBK_SUBTES = [
    { key: 'pu',  nama: 'Penalaran Umum',                singkat: 'PU',  grup: 'Tes Potensi Skolastik', soal: '30',    menit: 30,   isi: 'Penalaran induktif, deduktif, dan kuantitatif (masing-masing 10 soal).', tips: 'Latih pola induktif, silogisme, dan soal kuantitatif secara rutin dengan timer sekitar 1 menit per soal.' },
    { key: 'ppu', nama: 'Pengetahuan & Pemahaman Umum',  singkat: 'PPU', grup: 'Tes Potensi Skolastik', soal: '20',    menit: 15,   isi: 'Memahami konteks bacaan dan pengetahuan umum.', tips: 'Perbanyak membaca artikel dan biasakan merangkum ide pokoknya.' },
    { key: 'pbm', nama: 'Pemahaman Bacaan & Menulis',    singkat: 'PBM', grup: 'Tes Potensi Skolastik', soal: '20',    menit: 25,   isi: 'Kaidah kebahasaan, menyunting, dan menyusun teks.', tips: 'Pelajari ejaan, kalimat efektif, dan kohesi paragraf, lalu latih menyunting teks.' },
    { key: 'pk',  nama: 'Pengetahuan Kuantitatif',       singkat: 'PK',  grup: 'Tes Potensi Skolastik', soal: '15–20', menit: 20,   isi: 'Aljabar, matematika dasar, dan logika angka.', tips: 'Perkuat aritmetika dan aljabar dasar, dan hafalkan rumus inti.' },
    { key: 'lbi', nama: 'Literasi Bahasa Indonesia',     singkat: 'LBI', grup: 'Tes Literasi',          soal: '30',    menit: 42.5, isi: 'Literasi membaca: teks panjang, ide pokok, tujuan penulis, simpulan.', tips: 'Latih membaca teks panjang dengan cepat: cari ide pokok dulu, baru detail.' },
    { key: 'lbe', nama: 'Literasi Bahasa Inggris',       singkat: 'LBE', grup: 'Tes Literasi',          soal: '20',    menit: 20,   isi: 'Reading literacy pada teks bahasa Inggris.', tips: 'Baca teks akademik berbahasa Inggris, perkaya kosakata, dan latih skimming.' },
    { key: 'pm',  nama: 'Penalaran Matematika',          singkat: 'PM',  grup: 'Tes Literasi',          soal: '20',    menit: 42.5, isi: 'Masalah matematika dalam berbagai konteks, mirip AKM.', tips: 'Latih soal kontekstual (data, grafik, geometri, peluang): tulis model matematikanya dulu.' }
];
const UTBK_SKOR_KEYS = UTBK_SUBTES.map(s => 'skor_' + s.key);

const UTBK_JADWAL = {
    ujianMulaiPerkiraan: '2027-04-21',
    baris: [
        ['Registrasi akun SNPMB siswa', '12 Jan – 7 Apr 2026', 'Mulai sekitar pertengahan Jan 2027'],
        ['Pendaftaran UTBK-SNBT',       '25 Mar – 7 Apr 2026', 'Sekitar akhir Mar – awal Apr 2027'],
        ['Pembayaran biaya UTBK',       '25 Mar – 8 Apr 2026', 'Mengikuti pendaftaran'],
        ['Pelaksanaan UTBK',            '21 – 30 Apr 2026',    'Sekitar akhir Apr 2027'],
        ['Pengumuman hasil SNBT',       '25 Mei 2026',         'Sekitar akhir Mei 2027'],
        ['Unduh sertifikat UTBK',       '2 Jun – 31 Jul 2026', 'Sekitar Jun – Jul 2027']
    ]
};

const UTBK_ATURAN = [
    'Peserta hanya boleh mengikuti UTBK satu kali dalam satu tahun seleksi, dan hasilnya hanya berlaku untuk tahun itu.',
    'Pada seleksi 2026, siswa yang lolos SNBP tidak boleh mengikuti UTBK-SNBT maupun seleksi mandiri PTN. Cek apakah aturan ini sama di 2027.',
    'Pilihan program studi maksimal 4, dengan aturan kombinasi jenjang sarjana dan vokasi. Baca panduan resmi sebelum mengunci pilihan.',
    'Penilaian memakai IRT: soal sulit yang dijawab benar bernilai lebih besar, dan tidak ada nilai minus. Jangan biarkan soal kosong.',
    'Skor tinggi belum tentu lolos. Hasil juga ditentukan daya tampung, jumlah peminat, dan pembobotan subtes tiap program studi.',
    'Sebagian PTN juga membuka seleksi mandiri yang memakai skor UTBK. Cek jalur tersebut di situs PMB masing-masing kampus.'
];

const UTBK_PTN = [
    { s: 'UI',      n: 'Universitas Indonesia',                   k: 'Depok',              u: 'ui.ac.id' },
    { s: 'ITB',     n: 'Institut Teknologi Bandung',              k: 'Bandung',            u: 'itb.ac.id' },
    { s: 'UGM',     n: 'Universitas Gadjah Mada',                 k: 'Yogyakarta',         u: 'ugm.ac.id' },
    { s: 'IPB',     n: 'IPB University',                          k: 'Bogor',              u: 'ipb.ac.id' },
    { s: 'ITS',     n: 'Institut Teknologi Sepuluh Nopember',     k: 'Surabaya',           u: 'its.ac.id' },
    { s: 'UNAIR',   n: 'Universitas Airlangga',                   k: 'Surabaya',           u: 'unair.ac.id' },
    { s: 'UNPAD',   n: 'Universitas Padjadjaran',                 k: 'Jatinangor',         u: 'unpad.ac.id' },
    { s: 'UNDIP',   n: 'Universitas Diponegoro',                  k: 'Semarang',           u: 'undip.ac.id' },
    { s: 'UB',      n: 'Universitas Brawijaya',                   k: 'Malang',             u: 'ub.ac.id' },
    { s: 'UNS',     n: 'Universitas Sebelas Maret',               k: 'Surakarta',          u: 'uns.ac.id' },
    { s: 'UPI',     n: 'Universitas Pendidikan Indonesia',        k: 'Bandung',            u: 'upi.edu' },
    { s: 'UNJ',     n: 'Universitas Negeri Jakarta',              k: 'Jakarta',            u: 'unj.ac.id' },
    { s: 'UNY',     n: 'Universitas Negeri Yogyakarta',           k: 'Yogyakarta',         u: 'uny.ac.id' },
    { s: 'UNNES',   n: 'Universitas Negeri Semarang',             k: 'Semarang',           u: 'unnes.ac.id' },
    { s: 'UNESA',   n: 'Universitas Negeri Surabaya',             k: 'Surabaya',           u: 'unesa.ac.id' },
    { s: 'UM',      n: 'Universitas Negeri Malang',               k: 'Malang',             u: 'um.ac.id' },
    { s: 'UNSOED',  n: 'Universitas Jenderal Soedirman',          k: 'Purwokerto',         u: 'unsoed.ac.id' },
    { s: 'UNTIRTA', n: 'Universitas Sultan Ageng Tirtayasa',      k: 'Serang',             u: 'untirta.ac.id' },
    { s: 'UNEJ',    n: 'Universitas Jember',                      k: 'Jember',             u: 'unej.ac.id' },
    { s: 'USU',     n: 'Universitas Sumatera Utara',              k: 'Medan',              u: 'usu.ac.id' },
    { s: 'UNAND',   n: 'Universitas Andalas',                     k: 'Padang',             u: 'unand.ac.id' },
    { s: 'UNSRI',   n: 'Universitas Sriwijaya',                   k: 'Palembang',          u: 'unsri.ac.id' },
    { s: 'UNILA',   n: 'Universitas Lampung',                     k: 'Bandar Lampung',     u: 'unila.ac.id' },
    { s: 'USK',     n: 'Universitas Syiah Kuala',                 k: 'Banda Aceh',         u: 'usk.ac.id' },
    { s: 'UNRI',    n: 'Universitas Riau',                        k: 'Pekanbaru',          u: 'unri.ac.id' },
    { s: 'UNHAS',   n: 'Universitas Hasanuddin',                  k: 'Makassar',           u: 'unhas.ac.id' },
    { s: 'UNUD',    n: 'Universitas Udayana',                     k: 'Denpasar',           u: 'unud.ac.id' },
    { s: 'ULM',     n: 'Universitas Lambung Mangkurat',           k: 'Banjarmasin',        u: 'ulm.ac.id' },
    { s: 'UNMUL',   n: 'Universitas Mulawarman',                  k: 'Samarinda',          u: 'unmul.ac.id' },
    { s: 'UNSRAT',  n: 'Universitas Sam Ratulangi',               k: 'Manado',             u: 'unsrat.ac.id' },
    { s: 'UNRAM',   n: 'Universitas Mataram',                     k: 'Mataram',            u: 'unram.ac.id' },
    { s: 'POLBAN',  n: 'Politeknik Negeri Bandung',               k: 'Bandung',            u: 'polban.ac.id' },
    { s: 'PNJ',     n: 'Politeknik Negeri Jakarta',               k: 'Depok',              u: 'pnj.ac.id' },
    { s: 'PENS',    n: 'Politeknik Elektronika Negeri Surabaya',  k: 'Surabaya',           u: 'pens.ac.id' },
    { s: 'POLINES', n: 'Politeknik Negeri Semarang',              k: 'Semarang',           u: 'polines.ac.id' },
    { s: 'POLINEMA',n: 'Politeknik Negeri Malang',                k: 'Malang',             u: 'polinema.ac.id' },
    { s: 'POLSRI',  n: 'Politeknik Negeri Sriwijaya',             k: 'Palembang',          u: 'polsri.ac.id' }
];

// Warna grafik (selaras palet aplikasi)
const UTBK_WARNA = { garis: '#0284c7', rata: '#7dd3fc', target: '#d97706', grid: '#e2e8f0', teks: '#64748b' };

// ---------- State ----------
const utbkState = {
    loading: false, loaded: false, error: null,
    tryouts: [], targets: [],
    tab: 'ringkasan', editingId: null, editingSlot: null,
    chartSubtes: 'avg', ptnFilter: ''
};

function resetUtbkState() {
    Object.assign(utbkState, {
        loading: false, loaded: false, error: null, tryouts: [], targets: [],
        tab: 'ringkasan', editingId: null, editingSlot: null, chartSubtes: 'avg', ptnFilter: ''
    });
    const root = document.getElementById('utbk-root');
    if (root) root.innerHTML = '';
}

// ---------- Helper umum ----------
function utbkIsEligible() {
    return !!activeUser && getKelasKey(activeUser) === 'utbk' && activeUser.role !== 'wali_kelas';
}
function utbkNum(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isFinite(n) ? n : null;
}
function utbkFmt(n, d = 1) {
    return (n === null || n === undefined || isNaN(n)) ? '–' : Number(n).toLocaleString('id-ID', { maximumFractionDigits: d });
}
function utbkTgl(iso) {
    const [y, m, d] = String(iso).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function utbkTglPendek(iso) {
    const [y, m, d] = String(iso).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
function utbkHariIni() { return new Date().toLocaleDateString('en-CA'); }   // YYYY-MM-DD (waktu lokal)
function utbkMean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
function utbkStd(arr) {
    if (arr.length < 2) return null;
    const m = utbkMean(arr);
    return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}
function utbkAvgTO(t) {
    const vals = UTBK_SKOR_KEYS.map(k => utbkNum(t[k])).filter(v => v !== null);
    return vals.length ? utbkMean(vals) : null;
}
function utbkJumlahSubtes(t) { return UTBK_SKOR_KEYS.filter(k => utbkNum(t[k]) !== null).length; }
function utbkRataTerkini(n = 3) {
    const avgs = utbkState.tryouts.map(utbkAvgTO).filter(v => v !== null);
    return avgs.length ? utbkMean(avgs.slice(-n)) : null;
}
function utbkTargetUtama() {
    const dgSkor = utbkState.targets.filter(t => utbkNum(t.target_skor) !== null);
    return dgSkor.find(t => t.urutan === 1) || dgSkor[0] || null;
}
function utbkHariMenujuUjian() {
    const [y, m, d] = UTBK_JADWAL.ujianMulaiPerkiraan.split('-').map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((new Date(y, m - 1, d) - today) / 86400000);
}
function utbkDeltaChip(delta, satuan = '') {
    if (delta === null || delta === undefined || isNaN(delta)) return '';
    const bulat = Math.round(delta * 10) / 10;
    if (bulat === 0) return `<span class="text-xs font-semibold text-slate-400">tidak berubah</span>`;
    const naik = bulat > 0;
    return `<span class="text-xs font-semibold ${naik ? 'text-emerald-600' : 'text-rose-600'}">${naik ? '+' : '−'}${utbkFmt(Math.abs(bulat))}${satuan}</span>`;
}
function utbkToast(msg) {
    let el = document.getElementById('utbk-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'utbk-toast';
        el.className = 'fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-opacity duration-200';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(utbkToast._t);
    utbkToast._t = setTimeout(() => { el.style.opacity = '0'; }, 2400);
}

// ---------- Tombol masuk di dashboard ----------
function setupUtbkLauncher() {
    const el = document.getElementById('utbk-launcher');
    if (!el) return;
    const ok = utbkIsEligible();
    el.classList.toggle('hidden', !ok);
    if (!ok) return;
    const hari = utbkHariMenujuUjian();
    document.getElementById('utbk-launcher-sub').innerText = hari > 0
        ? `Sekitar ${hari} hari lagi menuju UTBK 2027 (perkiraan). Catat try out, lihat grafik, dan cari info kampus.`
        : 'Catat try out, lihat grafik, dan cari info kampus.';
}

async function openUtbkPage(tab) {
    if (!utbkIsEligible()) return;
    if (tab) utbkState.tab = tab;
    showDashPage('utbk');
    utbkRender();
    await utbkLoadData();
    utbkRender();
}

async function utbkLoadData() {
    utbkState.loading = true;
    utbkState.error = null;
    try {
        const [to, tg] = await Promise.all([
            supabaseClient.from('utbk_tryout').select('*').order('tanggal', { ascending: true }).order('created_at', { ascending: true }),
            supabaseClient.from('utbk_target').select('*').order('urutan', { ascending: true })
        ]);
        if (to.error) throw to.error;
        if (tg.error) throw tg.error;
        utbkState.tryouts = to.data || [];
        utbkState.targets = tg.data || [];
        utbkState.loaded = true;
    } catch (err) {
        console.error('Gagal memuat data UTBK:', err);
        utbkState.error = 'Data UTBK belum bisa dimuat. Periksa koneksi internet, lalu coba lagi.';
    } finally {
        utbkState.loading = false;
    }
}

function utbkSwitchTab(tab) {
    utbkState.tab = tab;
    if (tab !== 'tryout') utbkState.editingId = null;
    if (tab !== 'target') utbkState.editingSlot = null;
    utbkRender();
    window.scrollTo({ top: 0 });
}

// ---------- Render utama ----------
function utbkRender() {
    const root = document.getElementById('utbk-root');
    if (!root) return;

    const tabs = [
        ['ringkasan', 'Ringkasan', 'layout-dashboard'],
        ['tryout', 'Try out', 'clipboard-list'],
        ['analisis', 'Analisis', 'trending-up'],
        ['target', 'Target kampus', 'target'],
        ['info', 'Info UTBK', 'info']
    ];
    const tabBar = tabs.map(([key, label, icon]) => {
        const aktif = utbkState.tab === key;
        return `<button type="button" onclick="utbkSwitchTab('${key}')" ${aktif ? 'aria-current="page"' : ''}
            class="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${aktif ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:border-primary-300'}">
            <i data-lucide="${icon}" class="w-4 h-4"></i>${label}
        </button>`;
    }).join('');

    let body;
    if (utbkState.error) {
        body = `<div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p class="font-semibold">${escapeHtml(utbkState.error)}</p>
            <button type="button" onclick="openUtbkPage()" class="mt-3 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Coba lagi</button>
        </div>`;
    } else if (utbkState.tab !== 'info' && !utbkState.loaded) {
        body = `<div class="py-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i> Memuat data UTBK...
        </div>`;
    } else {
        body = ({
            ringkasan: utbkViewRingkasan,
            tryout: utbkViewTryout,
            analisis: utbkViewAnalisis,
            target: utbkViewTarget,
            info: utbkViewInfo
        }[utbkState.tab] || utbkViewRingkasan)();
    }

    root.innerHTML = `
        <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4" role="navigation" aria-label="Menu UTBK">${tabBar}</div>
        <div>${body}</div>`;
    lucide.createIcons();
}

function utbkEmpty(judul, teks, aksiLabel, aksiTab) {
    return `<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
        <p class="font-semibold text-slate-700">${judul}</p>
        <p class="text-sm text-slate-400 mt-1 max-w-sm mx-auto">${teks}</p>
        ${aksiLabel ? `<button type="button" onclick="utbkSwitchTab('${aksiTab}')" class="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">${aksiLabel}</button>` : ''}
    </div>`;
}

// ====================================================================
// TAB: RINGKASAN
// ====================================================================
function utbkViewRingkasan() {
    const hari = utbkHariMenujuUjian();
    const tos = utbkState.tryouts;
    const avgs = tos.map(utbkAvgTO).filter(v => v !== null);
    const last = avgs.length ? avgs[avgs.length - 1] : null;
    const prev = avgs.length > 1 ? avgs[avgs.length - 2] : null;
    const terbaik = avgs.length ? Math.max(...avgs) : null;
    const terkini = utbkRataTerkini(3);
    const target = utbkTargetUtama();

    const hitung = `
        <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-5">
            ${hari > 0 ? `
                <p class="text-sm text-primary-100">Menuju UTBK 2027 (perkiraan)</p>
                <p class="mt-1 flex items-baseline gap-2"><span class="text-5xl font-extrabold tracking-tight leading-none">${hari}</span><span class="text-lg font-semibold">hari lagi</span></p>
                <p class="text-xs text-primary-200 mt-3 leading-relaxed">Perkiraan mengikuti pola 2026 (ujian sekitar 21–30 April). Jadwal resmi 2027 belum diumumkan; pantau snpmb.id.</p>
            ` : `
                <p class="text-lg font-bold">Pantau jadwal resmi di snpmb.id</p>
                <p class="text-xs text-primary-200 mt-2">Perkiraan tanggal UTBK 2027 sudah terlewati. Cek pengumuman resmi panitia SNPMB.</p>
            `}
        </div>`;

    const tile = (label, nilai, ekstra = '') => `
        <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <p class="text-xs text-slate-500">${label}</p>
            <p class="text-xl font-bold text-slate-800 mt-0.5">${nilai}</p>
            <div class="mt-0.5 min-h-[1rem]">${ekstra}</div>
        </div>`;

    const tiles = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${tile('Try out tercatat', tos.length)}
            ${tile('Rata-rata try out terakhir', utbkFmt(last), prev !== null ? utbkDeltaChip(last - prev) + '<span class="text-xs text-slate-400"> dari sebelumnya</span>' : '')}
            ${tile('Skor rata-rata tertinggi', utbkFmt(terbaik))}
            ${tile('Rata-rata 3 try out terakhir', utbkFmt(terkini))}
        </div>`;

    let targetBox = '';
    if (target) {
        const t = utbkNum(target.target_skor);
        if (terkini !== null && t !== null) {
            const gap = t - terkini;
            const pct = Math.max(0, Math.min(100, (terkini / t) * 100));
            targetBox = `
            <div class="rounded-xl border border-slate-100 p-4">
                <p class="text-xs text-slate-500">Target pilihan ${target.urutan}</p>
                <p class="font-semibold text-slate-800 mt-0.5">${escapeHtml(target.prodi)} (${escapeHtml(target.ptn)})</p>
                <div class="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full bg-primary-600" style="width:${pct}%"></div></div>
                <p class="text-sm mt-2 ${gap > 0 ? 'text-slate-600' : 'text-emerald-600 font-semibold'}">
                    ${gap > 0 ? `Rata-rata terkini ${utbkFmt(terkini)} dari target ${utbkFmt(t)}. Kurang ${utbkFmt(gap)} poin.` : `Rata-rata terkini ${utbkFmt(terkini)} sudah di atas target ${utbkFmt(t)}.`}
                </p>
            </div>`;
        }
    } else {
        targetBox = `<div class="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 flex items-center justify-between gap-3">
            <span>Belum ada target kampus dan prodi.</span>
            <button type="button" onclick="utbkSwitchTab('target')" class="shrink-0 text-primary-700 font-semibold hover:underline">Atur target</button>
        </div>`;
    }

    let terakhir = '';
    if (tos.length) {
        const t = tos[tos.length - 1];
        terakhir = `
        <div class="rounded-xl border border-slate-100 p-4">
            <div class="flex items-start justify-between gap-3 mb-3">
                <div class="min-w-0">
                    <p class="text-xs text-slate-500">Try out terakhir, ${utbkTgl(t.tanggal)}</p>
                    <p class="font-semibold text-slate-800 truncate">${escapeHtml(t.nama)}</p>
                </div>
                <button type="button" onclick="utbkSwitchTab('analisis')" class="shrink-0 text-sm text-primary-700 font-semibold hover:underline">Lihat analisis</button>
            </div>
            ${utbkSubtesRows(t)}
        </div>`;
    } else {
        terakhir = utbkEmpty('Belum ada try out', 'Catat skor try out pertamamu untuk mulai melihat tren dan analisis.', 'Catat try out', 'tryout');
    }

    return `<div class="flex flex-col gap-4">${hitung}${tiles}${targetBox}${terakhir}</div>`;
}

// Baris batang untuk satu try out
function utbkSubtesRows(t) {
    return `<div class="space-y-2">` + UTBK_SUBTES.map(s => {
        const v = utbkNum(t['skor_' + s.key]);
        return `<div class="flex items-center gap-3">
            <span class="w-10 shrink-0 text-xs font-semibold text-slate-500" title="${escapeHtml(s.nama)}">${s.singkat}</span>
            <div class="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full bg-primary-600" style="width:${v === null ? 0 : Math.min(100, v / 10)}%"></div></div>
            <span class="w-12 shrink-0 text-right text-xs font-semibold ${v === null ? 'text-slate-300' : 'text-slate-700'}">${utbkFmt(v)}</span>
        </div>`;
    }).join('') + `</div>`;
}

// ====================================================================
// TAB: TRY OUT (form + riwayat)
// ====================================================================
function utbkViewTryout() {
    const ed = utbkState.editingId ? utbkState.tryouts.find(t => t.id === utbkState.editingId) : null;
    const val = (k) => (ed && utbkNum(ed[k]) !== null) ? utbkNum(ed[k]) : '';

    const inputs = UTBK_SUBTES.map(s => `
        <div>
            <label for="to-${s.key}" class="block text-xs font-semibold text-slate-600 mb-1">${escapeHtml(s.nama)} <span class="text-slate-400 font-normal">(${s.singkat})</span></label>
            <input type="number" id="to-${s.key}" inputmode="decimal" min="0" max="1000" step="0.01" placeholder="0–1000" value="${val('skor_' + s.key)}"
                class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        </div>`).join('');

    const form = `
    <form id="utbk-form-to" onsubmit="utbkSubmitTryout(event)" class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
        <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-800">${ed ? 'Ubah try out' : 'Catat try out'}</h4>
            ${ed ? `<button type="button" onclick="utbkSwitchTab('tryout')" class="text-sm text-slate-500 hover:text-slate-700 font-semibold">Batal ubah</button>` : ''}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
                <label for="to-nama" class="block text-xs font-semibold text-slate-600 mb-1">Nama try out</label>
                <input type="text" id="to-nama" maxlength="80" required placeholder="Contoh: TO mandiri minggu 3" value="${ed ? escapeHtml(ed.nama) : ''}"
                    class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
            <div>
                <label for="to-tanggal" class="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                <input type="date" id="to-tanggal" required max="${utbkHariIni()}" value="${ed ? escapeHtml(ed.tanggal) : utbkHariIni()}"
                    class="w-full bg-white border border-slate-200 py-[7px] px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
        </div>
        <div>
            <p class="text-xs text-slate-500 mb-2">Isi skor tiap subtes (0–1000). Subtes yang tidak diuji boleh dikosongkan, tapi isi minimal satu.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${inputs}</div>
        </div>
        <div>
            <label for="to-catatan" class="block text-xs font-semibold text-slate-600 mb-1">Catatan evaluasi (opsional)</label>
            <textarea id="to-catatan" rows="2" maxlength="500" placeholder="Misalnya: waktu PM habis, topik peluang masih lemah"
                class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">${ed ? escapeHtml(ed.catatan || '') : ''}</textarea>
        </div>
        <div class="flex justify-end">
            <button type="submit" id="to-simpan" class="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> ${ed ? 'Simpan perubahan' : 'Simpan try out'}
            </button>
        </div>
    </form>`;

    const daftar = [...utbkState.tryouts].reverse();
    const riwayat = daftar.length ? `
        <div class="space-y-3">
            <h4 class="font-bold text-slate-800">Riwayat try out</h4>
            ${daftar.map(t => {
                const avg = utbkAvgTO(t);
                const n = utbkJumlahSubtes(t);
                const chips = UTBK_SUBTES.filter(s => utbkNum(t['skor_' + s.key]) !== null)
                    .map(s => `<span class="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-0.5">${s.singkat} <b>${utbkFmt(utbkNum(t['skor_' + s.key]))}</b></span>`).join('');
                return `<div class="rounded-xl border border-slate-100 bg-white p-4">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="font-semibold text-slate-800 truncate">${escapeHtml(t.nama)}</p>
                            <p class="text-xs text-slate-400">${utbkTgl(t.tanggal)}${n < 7 ? `, ${n} dari 7 subtes` : ''}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-lg font-bold text-primary-700 leading-none">${utbkFmt(avg)}</p>
                            <p class="text-[11px] text-slate-400 mt-1">rata-rata</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-1.5 mt-3">${chips}</div>
                    ${t.catatan ? `<p class="text-sm text-slate-600 mt-3 whitespace-pre-line">${escapeHtml(t.catatan)}</p>` : ''}
                    <div class="flex gap-4 mt-3 pt-3 border-t border-slate-50 text-sm font-semibold">
                        <button type="button" onclick="utbkStartEdit('${escapeHtml(t.id)}')" class="text-primary-700 hover:underline flex items-center gap-1"><i data-lucide="pencil" class="w-3.5 h-3.5"></i> Ubah</button>
                        <button type="button" onclick="utbkDeleteTryout('${escapeHtml(t.id)}')" class="text-rose-600 hover:underline flex items-center gap-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus</button>
                    </div>
                </div>`;
            }).join('')}
        </div>` : '';

    return `<div class="flex flex-col gap-5">${form}${riwayat}</div>`;
}

function utbkStartEdit(id) {
    utbkState.editingId = id;
    utbkState.tab = 'tryout';
    utbkRender();
    window.scrollTo({ top: 0 });
}

async function utbkSubmitTryout(e) {
    e.preventDefault();
    const btn = document.getElementById('to-simpan');
    const nama = document.getElementById('to-nama').value.trim();
    const tanggal = document.getElementById('to-tanggal').value;
    const catatan = document.getElementById('to-catatan').value.trim();

    if (!nama) return alert('Nama try out wajib diisi.');
    if (!tanggal) return alert('Tanggal wajib diisi.');
    if (tanggal > utbkHariIni()) return alert('Tanggal try out tidak boleh di masa depan.');

    const row = { nama, tanggal, catatan: catatan || null };
    let terisi = 0;
    for (const s of UTBK_SUBTES) {
        const raw = document.getElementById('to-' + s.key).value.trim().replace(',', '.');
        if (raw === '') { row['skor_' + s.key] = null; continue; }
        const v = Number(raw);
        if (!isFinite(v) || v < 0 || v > 1000) return alert(`Skor ${s.nama} harus berupa angka 0 sampai 1000.`);
        row['skor_' + s.key] = Math.round(v * 100) / 100;
        terisi++;
    }
    if (!terisi) return alert('Isi skor minimal satu subtes.');

    btn.disabled = true;
    try {
        const editing = utbkState.editingId;
        const { error } = editing
            ? await supabaseClient.from('utbk_tryout').update(row).eq('id', editing)
            : await supabaseClient.from('utbk_tryout').insert({ ...row, siswa_id: activeUser.id });
        if (error) throw error;

        utbkState.editingId = null;
        await utbkLoadData();
        utbkRender();
        utbkToast(editing ? 'Perubahan tersimpan.' : 'Try out tersimpan.');
    } catch (err) {
        console.error('Gagal menyimpan try out:', err);
        alert('Try out belum tersimpan. Periksa koneksi internet, lalu coba lagi.');
        btn.disabled = false;
    }
}

async function utbkDeleteTryout(id) {
    const t = utbkState.tryouts.find(x => x.id === id);
    if (!t || !confirm(`Hapus try out "${t.nama}" (${utbkTgl(t.tanggal)})? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
        const { error } = await supabaseClient.from('utbk_tryout').delete().eq('id', id);
        if (error) throw error;
        await utbkLoadData();
        utbkRender();
        utbkToast('Try out dihapus.');
    } catch (err) {
        console.error('Gagal menghapus try out:', err);
        alert('Try out belum terhapus. Coba lagi.');
    }
}

// ====================================================================
// TAB: ANALISIS (grafik + wawasan)
// ====================================================================
function utbkSubtesStats() {
    return UTBK_SUBTES.map(s => {
        const all = utbkState.tryouts.map(t => utbkNum(t['skor_' + s.key])).filter(v => v !== null);
        return {
            ...s, n: all.length,
            avg: utbkMean(all),
            last: all.length ? all[all.length - 1] : null,
            recent: utbkMean(all.slice(-3)),
            prevAvg: all.length > 1 ? utbkMean(all.slice(0, -1)) : null
        };
    });
}

// Grafik garis SVG. points: [{label, value}]
function utbkLineChart(points, targetVal) {
    const W = 640, H = 270, L = 46, R = 18, T = 20, B = 40;
    const vals = points.map(p => p.value);
    const semua = targetVal !== null ? [...vals, targetVal] : vals;
    let lo = Math.max(0, Math.floor((Math.min(...semua) - 50) / 100) * 100);
    let hi = Math.min(1000, Math.ceil((Math.max(...semua) + 50) / 100) * 100);
    if (hi - lo < 200) { hi = Math.min(1000, lo + 200); lo = Math.max(0, hi - 200); }
    const step = (hi - lo) <= 300 ? 50 : 100;
    const x = (i) => points.length === 1 ? (L + (W - L - R) / 2) : L + (i * (W - L - R)) / (points.length - 1);
    const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

    let grid = '';
    for (let v = lo; v <= hi; v += step) {
        grid += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${UTBK_WARNA.grid}" stroke-width="1"/>
                 <text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="${UTBK_WARNA.teks}">${v}</text>`;
    }
    const skipLabel = Math.ceil(points.length / 7);
    const xLabels = points.map((p, i) => (i % skipLabel === 0 || i === points.length - 1)
        ? `<text x="${x(i)}" y="${H - 14}" text-anchor="middle" font-size="11" fill="${UTBK_WARNA.teks}">${escapeHtml(p.label)}</text>` : '').join('');
    const garis = points.length > 1
        ? `<polyline points="${points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}" fill="none" stroke="${UTBK_WARNA.garis}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` : '';
    const titik = points.map((p, i) => {
        const tampil = points.length <= 8 || i === points.length - 1;
        return `<circle cx="${x(i)}" cy="${y(p.value)}" r="4.5" fill="#fff" stroke="${UTBK_WARNA.garis}" stroke-width="2.5"/>
                ${tampil ? `<text x="${x(i)}" y="${y(p.value) - 11}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">${utbkFmt(p.value, 0)}</text>` : ''}`;
    }).join('');
    const tgt = targetVal !== null
        ? `<line x1="${L}" x2="${W - R}" y1="${y(targetVal)}" y2="${y(targetVal)}" stroke="${UTBK_WARNA.target}" stroke-width="1.8" stroke-dasharray="6 5"/>
           <text x="${W - R}" y="${y(targetVal) - 6}" text-anchor="end" font-size="11" font-weight="700" fill="${UTBK_WARNA.target}">Target ${utbkFmt(targetVal, 0)}</text>` : '';

    return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Grafik tren skor try out">${grid}${tgt}${garis}${titik}${xLabels}</svg>`;
}

function utbkViewAnalisis() {
    const tos = utbkState.tryouts;
    if (!tos.length) {
        return utbkEmpty('Belum ada data untuk dianalisis', 'Catat minimal satu try out. Analisis tren paling berguna setelah tiga try out atau lebih.', 'Catat try out', 'tryout');
    }

    const mode = utbkState.chartSubtes;
    const subtes = UTBK_SUBTES.find(s => s.key === mode);
    const points = tos
        .map(t => ({ label: utbkTglPendek(t.tanggal), value: subtes ? utbkNum(t['skor_' + subtes.key]) : utbkAvgTO(t) }))
        .filter(p => p.value !== null);
    const target = utbkTargetUtama();
    const targetVal = (!subtes && target) ? utbkNum(target.target_skor) : null;

    const pilihan = `<option value="avg" ${!subtes ? 'selected' : ''}>Rata-rata semua subtes</option>` +
        UTBK_SUBTES.map(s => `<option value="${s.key}" ${mode === s.key ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join('');

    const grafik = `
    <div class="rounded-2xl border border-slate-100 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h4 class="font-bold text-slate-800">Tren skor</h4>
            <select onchange="utbkSetChartSubtes(this.value)" aria-label="Pilih subtes untuk grafik"
                class="bg-white border border-slate-200 text-sm py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">${pilihan}</select>
        </div>
        ${points.length ? utbkLineChart(points, targetVal) : `<p class="text-sm text-slate-400 py-8 text-center">Belum ada skor untuk subtes ini.</p>`}
        ${points.length === 1 ? `<p class="text-xs text-slate-400 mt-1">Tambahkan satu try out lagi agar garis tren muncul.</p>` : ''}
        ${targetVal !== null ? `<p class="text-xs text-slate-400 mt-1">Garis putus-putus adalah target pilihan ${target.urutan}: ${escapeHtml(target.prodi)} (${escapeHtml(target.ptn)}).</p>` : ''}
    </div>`;

    const stats = utbkSubtesStats().filter(s => s.n > 0);
    const batang = `
    <div class="rounded-2xl border border-slate-100 p-4">
        <h4 class="font-bold text-slate-800">Per subtes</h4>
        <div class="flex items-center gap-4 text-xs text-slate-500 mt-1 mb-3">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" style="background:${UTBK_WARNA.rata}"></span>Rata-rata semua try out</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-primary-600"></span>Try out terakhir</span>
        </div>
        <div class="space-y-3">
            ${stats.map(s => `
            <div class="flex items-center gap-3">
                <span class="w-10 shrink-0 text-xs font-semibold text-slate-500" title="${escapeHtml(s.nama)}">${s.singkat}</span>
                <div class="flex-1 space-y-1">
                    <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full" style="width:${Math.min(100, s.avg / 10)}%;background:${UTBK_WARNA.rata}"></div></div>
                    <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full bg-primary-600" style="width:${Math.min(100, s.last / 10)}%"></div></div>
                </div>
                <div class="w-20 shrink-0 text-right leading-tight">
                    <p class="text-[11px] text-slate-400">${utbkFmt(s.avg)}</p>
                    <p class="text-sm font-bold text-slate-700">${utbkFmt(s.last)}</p>
                </div>
            </div>`).join('')}
        </div>
    </div>`;

    return `<div class="flex flex-col gap-4">${grafik}${batang}${utbkViewWawasan(stats)}
        <p class="text-xs text-slate-400">Skala dan tingkat kesulitan setiap penyelenggara try out berbeda dengan UTBK asli, jadi perhatikan arah tren dan subtes terlemah, bukan angkanya saja.</p></div>`;
}

function utbkSetChartSubtes(v) { utbkState.chartSubtes = v; utbkRender(); }

function utbkViewWawasan(stats) {
    const tos = utbkState.tryouts;
    const avgs = tos.map(utbkAvgTO).filter(v => v !== null);
    const item = (ikon, warna, teks) => `<li class="flex gap-3"><span class="mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${warna}"><i data-lucide="${ikon}" class="w-3.5 h-3.5"></i></span><span class="text-sm text-slate-700 leading-relaxed">${teks}</span></li>`;
    const butir = [];

    // Arah tren
    if (avgs.length >= 2) {
        const delta = avgs[avgs.length - 1] - avgs[avgs.length - 2];
        const total = avgs[avgs.length - 1] - avgs[0];
        butir.push(item(delta >= 0 ? 'trending-up' : 'trending-down', delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
            `Rata-rata try out terakhir ${delta >= 0 ? 'naik' : 'turun'} <b>${utbkFmt(Math.abs(delta))}</b> poin dari try out sebelumnya. Sejak try out pertama, perubahannya ${total >= 0 ? '+' : '−'}${utbkFmt(Math.abs(total))} poin.`));
    } else {
        butir.push(item('info', 'bg-slate-100 text-slate-500', 'Baru satu try out tercatat. Arah tren akan terlihat setelah ada minimal dua.'));
    }

    // Konsistensi
    if (avgs.length >= 3) {
        const sd = utbkStd(avgs);
        const label = sd < 25 ? 'stabil' : sd < 50 ? 'cukup stabil' : 'naik-turun cukup besar';
        butir.push(item('activity', 'bg-sky-50 text-sky-600', `Skor kamu ${label} (simpangan sekitar ${utbkFmt(sd, 0)} poin antar try out).`));
    }

    // Subtes terkuat dan terlemah
    const urut = [...stats].sort((a, b) => b.recent - a.recent);
    if (urut.length >= 2) {
        const kuat = urut.slice(0, urut.length >= 4 ? 2 : 1);
        const lemah = urut.slice(-(urut.length >= 4 ? 2 : 1)).reverse();
        butir.push(item('award', 'bg-emerald-50 text-emerald-600',
            `Terkuat: ${kuat.map(s => `<b>${escapeHtml(s.nama)}</b> (${utbkFmt(s.recent, 0)})`).join(', ')}. Angka ini rata-rata sampai 3 try out terakhir.`));
        const terlemah = lemah[0];
        butir.push(item('target', 'bg-amber-50 text-amber-600',
            `Perlu perhatian: ${lemah.map(s => `<b>${escapeHtml(s.nama)}</b> (${utbkFmt(s.recent, 0)})`).join(', ')}. Selisihnya ${utbkFmt(urut[0].recent - terlemah.recent, 0)} poin dari subtes terkuat. ${escapeHtml(terlemah.tips)}`));
    }

    // Subtes yang menurun di try out terakhir
    const menurun = stats.filter(s => s.n >= 2 && s.last - s.prevAvg <= -25);
    if (menurun.length) {
        butir.push(item('trending-down', 'bg-rose-50 text-rose-600',
            `Turun di try out terakhir dibanding rata-rata sebelumnya: ${menurun.map(s => `<b>${s.singkat}</b> (${utbkFmt(s.last - s.prevAvg, 0)})`).join(', ')}.`));
    }

    // Jarak ke target
    const target = utbkTargetUtama();
    const terkini = utbkRataTerkini(3);
    if (target && terkini !== null) {
        const gap = utbkNum(target.target_skor) - terkini;
        butir.push(item('flag', gap > 0 ? 'bg-primary-50 text-primary-700' : 'bg-emerald-50 text-emerald-600',
            gap > 0
                ? `Untuk target <b>${escapeHtml(target.prodi)} (${escapeHtml(target.ptn)})</b>, rata-rata 3 try out terakhir masih kurang <b>${utbkFmt(gap, 0)}</b> poin dari ${utbkFmt(utbkNum(target.target_skor), 0)}.`
                : `Rata-rata 3 try out terakhir sudah di atas target <b>${escapeHtml(target.prodi)} (${escapeHtml(target.ptn)})</b>. Pertahankan, dan pertimbangkan menaikkan target.`));
    }

    return `<div class="rounded-2xl border border-slate-100 p-4">
        <h4 class="font-bold text-slate-800 mb-3">Yang bisa kamu simpulkan</h4>
        <ul class="space-y-3">${butir.join('')}</ul>
    </div>`;
}

// ====================================================================
// TAB: TARGET KAMPUS
// ====================================================================
function utbkViewTarget() {
    const terkini = utbkRataTerkini(3);
    const opsiPtn = UTBK_PTN.map(p => `<option value="${escapeHtml(p.n)}">${escapeHtml(p.s)}</option>`).join('');

    const slot = (n) => {
        const t = utbkState.targets.find(x => x.urutan === n);
        if (utbkState.editingSlot === n) {
            return `
            <form onsubmit="utbkSimpanTarget(event, ${n})" class="rounded-xl border border-primary-200 bg-primary-50/30 p-4 space-y-3">
                <p class="font-semibold text-slate-800">Pilihan ${n}</p>
                <div>
                    <label for="tg-ptn" class="block text-xs font-semibold text-slate-600 mb-1">Perguruan tinggi</label>
                    <input type="text" id="tg-ptn" list="utbk-ptn-datalist" required maxlength="80" placeholder="Ketik atau pilih dari daftar" value="${t ? escapeHtml(t.ptn) : ''}"
                        class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                    <label for="tg-prodi" class="block text-xs font-semibold text-slate-600 mb-1">Program studi</label>
                    <input type="text" id="tg-prodi" required maxlength="80" placeholder="Contoh: Teknik Informatika" value="${t ? escapeHtml(t.prodi) : ''}"
                        class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="tg-jenjang" class="block text-xs font-semibold text-slate-600 mb-1">Jenjang</label>
                        <select id="tg-jenjang" class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            ${[['S1', 'Sarjana (S1)'], ['D4', 'Sarjana Terapan (D4)'], ['D3', 'Diploma 3 (D3)']].map(([v, l]) => `<option value="${v}" ${t && t.jenjang === v ? 'selected' : ''}>${l}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="tg-skor" class="block text-xs font-semibold text-slate-600 mb-1">Target skor (opsional)</label>
                        <input type="number" id="tg-skor" inputmode="decimal" min="0" max="1000" step="0.01" placeholder="0–1000" value="${t && utbkNum(t.target_skor) !== null ? utbkNum(t.target_skor) : ''}"
                            class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="utbkBatalTarget()" class="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white">Batal</button>
                    <button type="submit" id="tg-simpan" class="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold">Simpan pilihan ${n}</button>
                </div>
            </form>`;
        }
        if (!t) {
            return `<div class="rounded-xl border border-dashed border-slate-200 p-4 flex items-center justify-between gap-3">
                <div><p class="text-sm font-semibold text-slate-500">Pilihan ${n}</p><p class="text-xs text-slate-400">Belum diisi</p></div>
                <button type="button" onclick="utbkEditTarget(${n})" class="shrink-0 text-sm font-semibold text-primary-700 hover:underline">Isi pilihan ${n}</button>
            </div>`;
        }
        const skor = utbkNum(t.target_skor);
        let status = '';
        if (skor !== null && terkini !== null) {
            const gap = skor - terkini;
            status = gap > 0
                ? `<p class="text-xs text-slate-500 mt-2">Rata-rata 3 try out terakhir ${utbkFmt(terkini, 0)}, kurang <b>${utbkFmt(gap, 0)}</b> poin.</p>`
                : `<p class="text-xs text-emerald-600 font-semibold mt-2">Rata-rata 3 try out terakhir ${utbkFmt(terkini, 0)} sudah di atas target.</p>`;
        }
        return `<div class="rounded-xl border border-slate-100 bg-white p-4">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <p class="text-xs text-slate-400">Pilihan ${n}, ${escapeHtml(t.jenjang)}</p>
                    <p class="font-semibold text-slate-800">${escapeHtml(t.prodi)}</p>
                    <p class="text-sm text-slate-500">${escapeHtml(t.ptn)}</p>
                </div>
                <div class="text-right shrink-0">
                    <p class="text-lg font-bold text-primary-700 leading-none">${utbkFmt(skor, 0)}</p>
                    <p class="text-[11px] text-slate-400 mt-1">target skor</p>
                </div>
            </div>
            ${status}
            <div class="flex gap-4 mt-3 pt-3 border-t border-slate-50 text-sm font-semibold">
                <button type="button" onclick="utbkEditTarget(${n})" class="text-primary-700 hover:underline flex items-center gap-1"><i data-lucide="pencil" class="w-3.5 h-3.5"></i> Ubah</button>
                <button type="button" onclick="utbkHapusTarget('${escapeHtml(t.id)}')" class="text-rose-600 hover:underline flex items-center gap-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus</button>
            </div>
        </div>`;
    };

    return `<div class="flex flex-col gap-3">
        <datalist id="utbk-ptn-datalist">${opsiPtn}</datalist>
        <p class="text-sm text-slate-600 leading-relaxed">Susun sampai 4 pilihan kampus dan program studi. Pilihan 1 dipakai sebagai garis target di grafik analisis.
        Skor target adalah angka yang kamu tetapkan sendiri; cari acuannya dari data skor tahun lalu di situs PMB kampus.</p>
        ${[1, 2, 3, 4].map(slot).join('')}
    </div>`;
}

function utbkEditTarget(n) { utbkState.editingSlot = n; utbkRender(); }
function utbkBatalTarget() { utbkState.editingSlot = null; utbkRender(); }

async function utbkSimpanTarget(e, urutan) {
    e.preventDefault();
    const ptn = document.getElementById('tg-ptn').value.trim();
    const prodi = document.getElementById('tg-prodi').value.trim();
    const jenjang = document.getElementById('tg-jenjang').value;
    const mentah = document.getElementById('tg-skor').value.trim().replace(',', '.');
    if (!ptn || !prodi) return alert('Perguruan tinggi dan program studi wajib diisi.');
    let skor = null;
    if (mentah !== '') {
        skor = Number(mentah);
        if (!isFinite(skor) || skor < 0 || skor > 1000) return alert('Target skor harus berupa angka 0 sampai 1000.');
        skor = Math.round(skor * 100) / 100;
    }
    const btn = document.getElementById('tg-simpan');
    btn.disabled = true;
    try {
        const { error } = await supabaseClient.from('utbk_target')
            .upsert({ siswa_id: activeUser.id, urutan, ptn, prodi, jenjang, target_skor: skor }, { onConflict: 'siswa_id,urutan' });
        if (error) throw error;
        utbkState.editingSlot = null;
        await utbkLoadData();
        utbkRender();
        utbkToast(`Pilihan ${urutan} tersimpan.`);
    } catch (err) {
        console.error('Gagal menyimpan target:', err);
        alert('Target belum tersimpan. Periksa koneksi internet, lalu coba lagi.');
        btn.disabled = false;
    }
}

async function utbkHapusTarget(id) {
    const t = utbkState.targets.find(x => x.id === id);
    if (!t || !confirm(`Hapus pilihan ${t.urutan}: ${t.prodi} (${t.ptn})?`)) return;
    try {
        const { error } = await supabaseClient.from('utbk_target').delete().eq('id', id);
        if (error) throw error;
        await utbkLoadData();
        utbkRender();
        utbkToast('Pilihan dihapus.');
    } catch (err) {
        console.error('Gagal menghapus target:', err);
        alert('Pilihan belum terhapus. Coba lagi.');
    }
}

// ====================================================================
// TAB: INFO UTBK & KAMPUS
// ====================================================================
function utbkPtnListHtml() {
    const q = utbkState.ptnFilter.trim().toLowerCase();
    const hasil = UTBK_PTN.filter(p => !q || (p.s + ' ' + p.n + ' ' + p.k).toLowerCase().includes(q));
    if (!hasil.length) return `<p class="text-sm text-slate-400 py-4 text-center">Tidak ada kampus yang cocok. Daftar ini hanya sebagian; daftar lengkap ada di portal SNPMB.</p>`;
    return `<ul class="divide-y divide-slate-100">` + hasil.map(p => `
        <li class="py-2.5 flex items-center justify-between gap-3">
            <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-800">${escapeHtml(p.n)} <span class="text-slate-400 font-normal">(${escapeHtml(p.s)})</span></p>
                <p class="text-xs text-slate-400">${escapeHtml(p.k)}</p>
            </div>
            <a href="https://${escapeHtml(p.u)}" target="_blank" rel="noopener noreferrer" class="shrink-0 text-sm font-semibold text-primary-700 hover:underline flex items-center gap-1">Situs <i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>
        </li>`).join('') + `</ul>`;
}

function utbkFilterPtn(v) {
    utbkState.ptnFilter = v;
    const wrap = document.getElementById('utbk-ptn-wrap');
    if (wrap) { wrap.innerHTML = utbkPtnListHtml(); lucide.createIcons(); }
}

function utbkViewInfo() {
    const bagian = (judul, isi, buka = false) => `
        <details ${buka ? 'open' : ''} class="group rounded-2xl border border-slate-100 bg-white">
            <summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 p-4 font-bold text-slate-800">
                ${judul}<i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 shrink-0 transition-transform group-open:rotate-180"></i>
            </summary>
            <div class="px-4 pb-4">${isi}</div>
        </details>`;

    const jadwal = `
        <div class="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800 mb-3 leading-relaxed">
            Jadwal resmi UTBK-SNBT 2027 belum diumumkan panitia SNPMB (biasanya terbit sekitar Desember sampai Januari). Kolom 2027 hanyalah perkiraan berdasarkan pola 2026.
        </div>
        <div class="overflow-x-auto"><table class="w-full text-sm">
            <thead><tr class="text-left text-xs text-slate-500 border-b border-slate-100">
                <th class="py-2 pr-3 font-semibold">Tahap</th><th class="py-2 pr-3 font-semibold">Resmi 2026</th><th class="py-2 font-semibold">Perkiraan 2027</th></tr></thead>
            <tbody>${UTBK_JADWAL.baris.map(r => `<tr class="border-b border-slate-50 align-top">
                <td class="py-2 pr-3 font-medium text-slate-700">${r[0]}</td><td class="py-2 pr-3 text-slate-600 whitespace-nowrap">${r[1]}</td><td class="py-2 text-slate-500">${r[2]}</td></tr>`).join('')}</tbody>
        </table></div>`;

    const struktur = `
        <p class="text-sm text-slate-600 mb-3 leading-relaxed">UTBK-SNBT 2026 terdiri dari 7 subtes dengan sekitar 160 soal dan waktu total 195 menit. Rincian soal dan menit bisa disesuaikan panitia, jadi cocokkan dengan panduan resmi 2027.</p>
        <div class="overflow-x-auto"><table class="w-full text-sm">
            <thead><tr class="text-left text-xs text-slate-500 border-b border-slate-100">
                <th class="py-2 pr-3 font-semibold">Subtes</th><th class="py-2 pr-3 font-semibold">Soal</th><th class="py-2 font-semibold">Menit</th></tr></thead>
            <tbody>${UTBK_SUBTES.map(s => `<tr class="border-b border-slate-50 align-top">
                <td class="py-2 pr-3"><p class="font-medium text-slate-700">${escapeHtml(s.nama)} (${s.singkat})</p><p class="text-xs text-slate-400">${escapeHtml(s.isi)}</p></td>
                <td class="py-2 pr-3 text-slate-600 whitespace-nowrap">${s.soal}</td><td class="py-2 text-slate-600 whitespace-nowrap">${utbkFmt(s.menit)}</td></tr>`).join('')}</tbody>
        </table></div>
        <p class="text-xs text-slate-400 mt-3">Tes Potensi Skolastik: PU, PPU, PBM, PK. Tes Literasi: LBI, LBE, PM.</p>`;

    const aturan = `<ul class="space-y-2.5">${UTBK_ATURAN.map(a => `<li class="flex gap-2.5 text-sm text-slate-600 leading-relaxed"><i data-lucide="check" class="w-4 h-4 text-primary-600 shrink-0 mt-0.5"></i><span>${escapeHtml(a)}</span></li>`).join('')}</ul>`;

    const kampus = `
        <p class="text-sm text-slate-600 mb-3 leading-relaxed">Sebagian PTN dan politeknik negeri. Passing grade tiap prodi tidak dirilis resmi dan berubah tiap tahun, jadi gunakan data skor tahun lalu di situs PMB kampus sebagai acuan, bukan kepastian.</p>
        <input type="search" oninput="utbkFilterPtn(this.value)" value="${escapeHtml(utbkState.ptnFilter)}" placeholder="Cari nama kampus atau kota" aria-label="Cari kampus"
            class="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
        <div id="utbk-ptn-wrap">${utbkPtnListHtml()}</div>`;

    const tips = `<ul class="space-y-2.5">
        ${[
            'Mulai dari try out lengkap tujuh subtes untuk tahu posisi awal, lalu fokus ke dua subtes terlemah.',
            'Biasakan mengerjakan dengan timer, karena yang membedakan sering kali manajemen waktu, bukan hanya penguasaan materi.',
            'Karena tidak ada nilai minus, selalu isi semua jawaban sebelum waktu habis.',
            'Setelah try out, catat penyebab salah (konsep, waktu, atau ceroboh) di kolom catatan agar evaluasimu spesifik.',
            'Daftar akun SNPMB lebih awal dan periksa data pribadi, jangan menunggu hari terakhir pendaftaran.'
        ].map(t => `<li class="flex gap-2.5 text-sm text-slate-600 leading-relaxed"><i data-lucide="check" class="w-4 h-4 text-primary-600 shrink-0 mt-0.5"></i><span>${t}</span></li>`).join('')}
    </ul>`;

    const tautan = `<ul class="space-y-2 text-sm">
        <li><a class="text-primary-700 font-semibold hover:underline" href="https://snpmb.id" target="_blank" rel="noopener noreferrer">snpmb.id</a> <span class="text-slate-500">untuk pengumuman, panduan, dan jadwal resmi.</span></li>
        <li><a class="text-primary-700 font-semibold hover:underline" href="https://portal.snpmb.id" target="_blank" rel="noopener noreferrer">portal.snpmb.id</a> <span class="text-slate-500">untuk registrasi akun dan pendaftaran.</span></li>
    </ul>`;

    return `<div class="flex flex-col gap-3">
        <p class="text-xs text-slate-400">Informasi diperbarui ${UTBK_INFO_DIPERBARUI}. Selalu cocokkan dengan pengumuman resmi di snpmb.id.</p>
        ${bagian('Jadwal UTBK-SNBT', jadwal, true)}
        ${bagian('Struktur tes', struktur)}
        ${bagian('Hal penting yang perlu diketahui', aturan)}
        ${bagian('Kampus tujuan', kampus)}
        ${bagian('Tips persiapan', tips)}
        ${bagian('Tautan resmi', tautan)}
    </div>`;
}
