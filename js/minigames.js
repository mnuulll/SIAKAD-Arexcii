// ====================================================================
// MINI GAMES: hub, level, dan fungsi bersama untuk semua game
//   (Peringkat Mini Games & UTBK ada di halaman sendiri: js/peringkat.js)
//   Game saat ini: Matematika (js/matdas.js), Bahasa Inggris (js/inggris.js), Sinonim & Antonim (js/sinonim.js).
//   Menambah game baru: daftarkan di MG_GAMES, simpan hasil lewat mgSimpanSesi(),
//   dan tambahkan nama game ke constraint tabel minigame_sesi di database.
//
// Poin per sesi dihitung OTOMATIS oleh database dari jumlah jawaban benar/salah per
// tingkat kesulitan (klien tidak bisa mengisi poin sendiri):
//   benar : +10 (mudah), +20 (sedang), +30 (sulit)
//   salah : -2  (mudah), -4  (sedang), -6  (sulit)      (poin sesi minimal 0)
// ====================================================================

const MG_GAMES = {
    matematika: { nama: 'Matematika',      ikon: 'calculator', deskripsi: 'Hitung cepat: penjumlahan sampai pecahan dan desimal.', buka: 'openMatdasPage()' },
    inggris:    { nama: 'Bahasa Inggris',  ikon: 'languages',  deskripsi: 'Terjemahkan kata dari dan ke bahasa Inggris.',          buka: 'openInggrisPage()' },
    sinonim:    { nama: 'Sinonim & Antonim', ikon: 'arrow-left-right', deskripsi: 'Pilih persamaan atau lawan kata yang tepat.',   buka: 'openSinonimPage()' }
};
const MG_MENIT = [1, 2, 3, 4, 5];
const MG_JUMLAH = [10, 20, 30, 50, 100];
const MG_KESULITAN = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit', acak: 'Acak' };
const MG_LEVEL = [
    { min: 0,     nama: 'Pemula' },
    { min: 300,   nama: 'Perunggu' },
    { min: 1000,  nama: 'Perak' },
    { min: 2500,  nama: 'Emas' },
    { min: 5000,  nama: 'Platinum' },
    { min: 10000, nama: 'Berlian' }
];

const mg = {
    view: 'hub',
    ringkas: null,                     // { minggu: baris | null, semua: baris | null }
    riwayat: { matematika: [], inggris: [], sinonim: [] },
    riwayatMuat: { matematika: false, inggris: false, sinonim: false }
};

function resetMiniGamesState() {
    Object.assign(mg, {
        view: 'hub', ringkas: null,
        riwayat: { matematika: [], inggris: [], sinonim: [] }, riwayatMuat: { matematika: false, inggris: false, sinonim: false }
    });
    const root = document.getElementById('minigames-root');
    if (root) root.innerHTML = '';
}

// ---------- Helper bersama ----------
function mgFmtWaktu(detik) {
    const d = Math.max(0, Math.round(detik));
    return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}`;
}
function mgFmtTgl(iso) {
    return fmtTgl(iso, { day: 'numeric', month: 'short', year: 'numeric' });
}
function mgFmtAngka(n) { return Number(n).toLocaleString('id-ID'); }
function mgLabelMode(mode, batas) { return mode === 'waktu' ? `Time attack ${batas} menit` : `${batas} soal`; }
function mgChip(aktif, onclick, label, ekstra = '') {
    return `<button type="button" onclick="${onclick}" aria-pressed="${aktif}" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition touch-manipulation ${aktif ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'} ${ekstra}">${label}</button>`;
}
function mgToast(msg) {
    let el = document.getElementById('mg-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mg-toast';
        el.className = 'fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-opacity duration-200';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(mgToast._t);
    mgToast._t = setTimeout(() => { el.style.opacity = '0'; }, 2400);
}
function mgLevel(poin) {
    let idx = 0;
    MG_LEVEL.forEach((l, i) => { if (poin >= l.min) idx = i; });
    return { ...MG_LEVEL[idx], idx, berikut: MG_LEVEL[idx + 1] || null };
}
function mgNamaTopik(game, kunci) {
    const peta = game === 'matematika' ? (typeof MD_TOPIK !== 'undefined' ? MD_TOPIK : {})
        : game === 'inggris' ? (typeof ING_TOPIK !== 'undefined' ? ING_TOPIK : {})
        : game === 'sinonim' ? (typeof SNM_TOPIK !== 'undefined' ? SNM_TOPIK : {}) : {};
    return peta[kunci] ? peta[kunci].nama : null;
}

// ---------- Poin & penyimpanan sesi ----------
// hasil: [{ kes: 'mudah'|'sedang'|'sulit', benar: bool }]
function mgBreakdown(hasil) {
    const b = { benar_mudah: 0, benar_sedang: 0, benar_sulit: 0, salah_mudah: 0, salah_sedang: 0, salah_sulit: 0 };
    hasil.forEach(h => { b[(h.benar ? 'benar_' : 'salah_') + h.kes]++; });
    return b;
}
// Rumus yang sama dengan kolom 'poin' di database (untuk tampilan pratinjau)
function mgPoin(hasil) {
    const b = mgBreakdown(hasil);
    return Math.max(0, 10 * (b.benar_mudah + 2 * b.benar_sedang + 3 * b.benar_sulit) - 2 * (b.salah_mudah + 2 * b.salah_sedang + 3 * b.salah_sulit));
}
async function mgSimpanSesi(game, s) {
    // Database menolak sesi yang lebih cepat dari 0,8 detik per soal. Pada mode jumlah soal,
    // durasi dibulatkan naik ke batas itu (hanya terjadi pada sesi yang sangat cepat).
    const durasi = s.mode === 'jumlah' ? Math.max(s.durasi, Math.ceil(s.hasil.length * 0.8)) : s.durasi;
    const baris = {
        siswa_id: activeUser.id, game, mode: s.mode, batas: s.batas, kesulitan: s.kesulitan, topik: s.topik,
        durasi_detik: durasi, ...mgBreakdown(s.hasil)
    };
    const { error } = await supabaseClient.from('minigame_sesi').insert(baris);
    if (error) throw error;
}

async function mgMuatRiwayat(game) {
    try {
        const { data, error } = await supabaseClient.from('minigame_sesi').select('*').eq('game', game)
            .order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        mg.riwayat[game] = data || [];
        mg.riwayatMuat[game] = true;
    } catch (err) {
        console.error('Gagal memuat riwayat:', err);
    }
}
function mgAkurasi(r) { return r.total ? r.benar / r.total : 0; }
// Apakah a lebih baik dari b untuk mode yang sama?
function mgLebihBaik(a, b, mode) {
    if (!b) return true;
    if (mode === 'waktu') return a.poin > b.poin || (a.poin === b.poin && mgAkurasi(a) > mgAkurasi(b));
    return a.poin > b.poin || (a.poin === b.poin && a.durasi_detik < b.durasi_detik);
}
function mgRekor(game, mode, batas) {
    return (mg.riwayat[game] || []).filter(r => r.mode === mode && r.batas === batas)
        .reduce((best, r) => mgLebihBaik(r, best, mode) ? r : best, null);
}

// Tampilan riwayat & rekor (dipakai semua game)
function mgViewRiwayat(game) {
    if (!mg.riwayatMuat[game]) return `<p class="text-sm text-slate-400 py-6 text-center">Memuat riwayat...</p>`;
    const data = mg.riwayat[game];
    if (!data.length) {
        return `<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p class="font-semibold text-slate-700">Belum ada riwayat</p>
            <p class="text-sm text-slate-400 mt-1">Selesaikan satu sesi latihan, nanti hasil dan rekormu muncul di sini.</p></div>`;
    }
    const kunci = [];
    MG_MENIT.forEach(m => { if (mgRekor(game, 'waktu', m)) kunci.push(['waktu', m]); });
    MG_JUMLAH.forEach(j => { if (mgRekor(game, 'jumlah', j)) kunci.push(['jumlah', j]); });
    const rekor = kunci.map(([mode, batas]) => {
        const r = mgRekor(game, mode, batas);
        return `<div class="flex items-center justify-between gap-3 py-2.5">
            <div><p class="text-sm font-semibold text-slate-700">${mgLabelMode(mode, batas)}</p>
                <p class="text-xs text-slate-400">Tingkat ${escapeHtml(MG_KESULITAN[r.kesulitan] || '')}, ${mgFmtTgl(r.created_at)}</p></div>
            <div class="text-right"><p class="text-sm font-bold text-primary-700">${mgFmtAngka(r.poin)} poin</p>
                <p class="text-xs text-slate-400">${Number(r.benar)} benar, ${Math.round(mgAkurasi(r) * 100)}%, ${mgFmtWaktu(r.durasi_detik)}</p></div></div>`;
    }).join('');
    const daftar = data.slice(0, 12).map(r => {
        const nama = (r.topik || []).map(k => mgNamaTopik(game, k)).filter(Boolean);
        const ringkas = nama.length >= 9 ? 'Semua topik' : nama.join(', ');
        return `<div class="py-3 flex items-start justify-between gap-3">
            <div class="min-w-0"><p class="text-sm font-semibold text-slate-700">${mgLabelMode(r.mode, r.batas)}, ${escapeHtml(MG_KESULITAN[r.kesulitan] || '')}</p>
                <p class="text-xs text-slate-400 truncate">${escapeHtml(ringkas)}</p></div>
            <div class="text-right shrink-0"><p class="text-sm font-bold text-slate-800">${Number(r.benar)} dari ${Number(r.total)}</p>
                <p class="text-xs text-slate-400">${mgFmtAngka(r.poin)} poin, ${mgFmtTgl(r.created_at)}</p></div></div>`;
    }).join('');
    return `<div class="flex flex-col gap-4">
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800">Rekor pribadi</h4>
            <p class="text-xs text-slate-400 mb-1">Rekor dinilai dari poin tertinggi dalam satu sesi di mode yang sama.</p>
            <div class="divide-y divide-slate-100">${rekor}</div></div>
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800">Sesi terakhir</h4>
            <div class="divide-y divide-slate-100">${daftar}</div></div>
    </div>`;
}

// ====================================================================
// HUB (dibuka dari navigasi bawah)
// ====================================================================
async function openMiniGames() {
    if (!activeUser) return;
    mg.view = 'hub';
    showDashPage('minigames');
    mgRender();
    await mgMuatRingkas();
    if (mg.view === 'hub') mgRender();
}
function mgKeHub() { openMiniGames(); }

async function mgPanggilPeringkat(game, periode) {
    const { data, error } = await supabaseClient.rpc('peringkat_minigame', { p_game: game, p_periode: periode });
    if (error) throw error;
    return data || [];
}
async function mgMuatRingkas() {
    try {
        const [minggu, semua] = await Promise.all([mgPanggilPeringkat(null, 'minggu'), mgPanggilPeringkat(null, 'semua')]);
        mg.ringkas = { minggu: minggu.find(r => r.adalah_saya) || null, semua: semua.find(r => r.adalah_saya) || null };
    } catch (err) {
        console.error('Gagal memuat ringkasan peringkat:', err);
        mg.ringkas = { minggu: null, semua: null, galat: true };
    }
}

function mgRender() {
    const root = document.getElementById('minigames-root');
    if (!root) return;
    root.innerHTML = mgViewHub();
    lucide.createIcons();
}

function mgViewHub() {
    const seumur = mg.ringkas && mg.ringkas.semua ? Number(mg.ringkas.semua.poin_seumur) : 0;
    const lv = mgLevel(seumur);
    const pct = lv.berikut ? Math.min(100, Math.round((seumur - lv.min) / (lv.berikut.min - lv.min) * 100)) : 100;
    const minggu = mg.ringkas && mg.ringkas.minggu;
    const kartuSaya = !mg.ringkas ? `<p class="text-sm text-primary-100">Memuat...</p>` : `
        <p class="text-sm text-primary-100">Levelmu</p>
        <p class="text-3xl font-extrabold tracking-tight mt-0.5">${lv.nama}</p>
        <div class="mt-3 h-2 rounded-full bg-white/20 overflow-hidden"><div class="h-full rounded-full bg-white" style="width:${pct}%"></div></div>
        <p class="text-xs text-primary-200 mt-2">${mgFmtAngka(seumur)} poin${lv.berikut ? `. ${mgFmtAngka(lv.berikut.min - seumur)} poin lagi menuju ${lv.berikut.nama}.` : '. Level tertinggi.'}</p>
        <p class="text-sm text-primary-100 mt-3">${minggu
            ? `Minggu ini kamu peringkat <b class="text-white">${minggu.rk}</b> dengan ${mgFmtAngka(minggu.total_poin)} poin.`
            : 'Belum ada sesi minggu ini. Mainkan satu game untuk masuk peringkat.'}</p>`;

    const kartuGame = Object.entries(MG_GAMES).map(([id, g]) => `
        <button type="button" onclick="${g.buka}" class="group text-left rounded-2xl border border-slate-200 bg-white hover:border-primary-300 hover:shadow-md active:scale-[0.99] transition p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><i data-lucide="${g.ikon}" class="w-6 h-6"></i></div>
            <div class="flex-1 min-w-0"><p class="font-bold text-slate-800">${g.nama}</p><p class="text-xs text-slate-500 mt-0.5 leading-relaxed">${g.deskripsi}</p></div>
            <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300 group-hover:text-primary-500 shrink-0"></i>
        </button>`).join('');

    return `<div class="flex flex-col gap-4">
        <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-5">${kartuSaya}</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${kartuGame}
            <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0"><i data-lucide="puzzle" class="w-6 h-6"></i></div>
                <div class="flex-1 min-w-0"><p class="font-bold text-slate-500">Segera hadir</p><p class="text-xs text-slate-400 mt-0.5">Game lainnya menyusul.</p></div>
            </div>
        </div>
    </div>`;
}
