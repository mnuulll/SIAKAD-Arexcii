// ====================================================================
// HALAMAN PERINGKAT (tab navigasi bawah)
//   - Tab "Mini Games": peringkat poin (fungsi database peringkat_minigame).
//   - Tab "UTBK"      : peringkat rata-rata try out (fungsi database peringkat_utbk,
//                       lihat sql/2026-11-09_peringkat_utbk_dan_hapus_akun.sql).
//   Peringkat hanya membandingkan sesama jenis akun (Umum dengan Umum, Arexcii dengan Arexcii).
//   Tab UTBK hanya muncul untuk akun yang punya UTBK Corner.
// ====================================================================
const pr = {
    tab: 'minigames',                       // minigames | utbk
    mgPeriode: 'minggu', mgGame: null,
    mgData: null, mgMuat: false, mgGalat: false,
    utbkData: null, utbkMuat: false, utbkGalat: false,
    permintaan: 0                           // penanda agar hasil lama yang datang terlambat diabaikan
};

function resetPeringkatState() {
    Object.assign(pr, {
        tab: 'minigames', mgPeriode: 'minggu', mgGame: null, mgData: null, mgMuat: false, mgGalat: false,
        utbkData: null, utbkMuat: false, utbkGalat: false, permintaan: 0
    });
    const root = document.getElementById('peringkat-root');
    if (root) root.innerHTML = '';
}

function prAdaTabUtbk() { return typeof utbkIsEligible === 'function' && utbkIsEligible(); }

async function openPeringkatPage(tab) {
    if (!activeUser || activeUser.role === 'wali_kelas') return;
    if (tab) pr.tab = tab;
    if (pr.tab === 'utbk' && !prAdaTabUtbk()) pr.tab = 'minigames';
    showDashPage('peringkat');
    await prMuatTabAktif();
}

async function prMuatTabAktif() {
    if (pr.tab === 'utbk') await prMuatUtbk();
    else await prMuatMinigames();
}

function prSetTab(tab) {
    if (tab === pr.tab) return;
    pr.tab = tab;
    prMuatTabAktif();
}

// ---------- Muat data ----------
async function prMuatMinigames() {
    const id = ++pr.permintaan;
    pr.mgMuat = true; pr.mgGalat = false; pr.mgData = null;
    prRender();
    try {
        const data = await mgPanggilPeringkat(pr.mgGame, pr.mgPeriode);
        if (id !== pr.permintaan) return;
        pr.mgData = data;
    } catch (err) {
        if (id !== pr.permintaan) return;
        console.error('Gagal memuat peringkat Mini Games:', err);
        pr.mgGalat = true;
    }
    pr.mgMuat = false;
    prRender();
}
function prSetPeriode(p) { pr.mgPeriode = p; prMuatMinigames(); }
function prSetGame(g) { pr.mgGame = g || null; prMuatMinigames(); }

async function prMuatUtbk() {
    const id = ++pr.permintaan;
    pr.utbkMuat = true; pr.utbkGalat = false; pr.utbkData = null;
    prRender();
    try {
        const { data, error } = await supabaseClient.rpc('peringkat_utbk');
        if (error) throw error;
        if (id !== pr.permintaan) return;
        pr.utbkData = data || [];
    } catch (err) {
        if (id !== pr.permintaan) return;
        console.error('Gagal memuat peringkat UTBK:', err);
        pr.utbkGalat = true;
    }
    pr.utbkMuat = false;
    prRender();
}

// ---------- Tampilan ----------
function prKotakGalat(onclick) {
    return `<div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p class="font-semibold">Peringkat belum bisa dimuat. Periksa koneksi internet.</p>
        <button type="button" onclick="${onclick}" class="mt-3 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Coba lagi</button></div>`;
}
function prKotakKosong(judul, isi, aksi = '') {
    return `<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
        <p class="font-semibold text-slate-700">${judul}</p><p class="text-sm text-slate-400 mt-1">${isi}</p>${aksi}</div>`;
}
function prWarnaRank(rk) {
    return rk === 1 ? 'bg-amber-100 text-amber-700' : rk === 2 ? 'bg-slate-200 text-slate-700'
        : rk === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500';
}
// Baris peringkat bersama (judul, subjudul, nilai di kanan)
function prBaris(rk, lompat, saya, nama, sub, nilai) {
    return `${lompat ? `<div class="text-center text-slate-300 text-xs py-1" aria-hidden="true">. . .</div>` : ''}
    <div class="flex items-center gap-3 rounded-xl px-3 py-2.5 ${saya ? 'bg-primary-50 border border-primary-200' : 'border border-transparent'}">
        <span class="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold tabular-nums ${prWarnaRank(rk)}">${rk}</span>
        <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 truncate">${escapeHtml(nama)}${saya ? ' <span class="text-primary-700 font-medium">(kamu)</span>' : ''}</p>
            <p class="text-xs text-slate-400">${sub}</p>
        </div>
        <p class="text-base font-bold text-primary-700 tabular-nums shrink-0">${nilai}</p>
    </div>`;
}

function prViewMinigames() {
    const periode = [['minggu', 'Minggu ini'], ['semua', 'Semua waktu']]
        .map(([k, l]) => mgChip(pr.mgPeriode === k, `prSetPeriode('${k}')`, l)).join('');
    const game = [[null, 'Semua game'], ...Object.entries(MG_GAMES).map(([k, g]) => [k, g.nama])]
        .map(([k, l]) => mgChip(pr.mgGame === k, `prSetGame(${k === null ? 'null' : `'${k}'`})`, l)).join('');

    let isi;
    if (pr.mgGalat) isi = prKotakGalat('prMuatMinigames()');
    else if (pr.mgMuat || !pr.mgData) isi = `<p class="text-sm text-slate-400 py-8 text-center">Memuat peringkat...</p>`;
    else if (!pr.mgData.length) {
        isi = prKotakKosong('Belum ada yang bermain', pr.mgPeriode === 'minggu' ? 'Peringkat minggu ini masih kosong. Jadilah yang pertama.' : 'Belum ada sesi yang tercatat.',
            `<button type="button" onclick="openMiniGames()" class="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">Main sekarang</button>`);
    } else {
        let sebelumnya = 0;
        isi = `<div class="flex flex-col gap-1">${pr.mgData.map(r => {
            const lompat = r.rk > 20 && sebelumnya <= 20;
            sebelumnya = r.rk;
            const lv = mgLevel(Number(r.poin_seumur));
            return prBaris(r.rk, lompat, r.adalah_saya, r.nama_siswa,
                `${escapeHtml(lv.nama)}, ${Number(r.jumlah_sesi)} sesi, akurasi ${Number(r.akurasi_persen)}%`, mgFmtAngka(r.total_poin));
        }).join('')}</div>`;
    }

    return `
        <div><h4 class="font-bold text-lg text-slate-800">Peringkat Mini Games</h4>
            <p class="text-xs text-slate-400 mt-0.5">${pr.mgPeriode === 'minggu' ? 'Berganti setiap Senin pukul 00.00 WIB.' : 'Total poin dari semua sesi.'}</p></div>
        <div class="flex flex-wrap gap-2">${periode}</div>
        <div class="flex flex-wrap gap-2">${game}</div>
        ${isi}
        <details class="rounded-2xl border border-slate-100 bg-white">
            <summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 p-4 font-bold text-slate-800 text-sm">Cara poin dihitung<i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i></summary>
            <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed space-y-2">
                <p>Setiap jawaban benar menambah poin sesuai tingkat kesulitan soalnya: <b>10</b> poin untuk soal mudah, <b>20</b> untuk sedang, dan <b>30</b> untuk sulit. Jawaban salah mengurangi sedikit: 2, 4, dan 6 poin. Poin satu sesi tidak pernah di bawah 0.</p>
                <p>Peringkat menjumlahkan poin semua sesi pada periode yang dipilih, jadi yang rajin berlatih dan akurat akan naik. Poin dihitung oleh database, bukan oleh aplikasi di HP.</p>
                <p>Level ditentukan dari total poin sepanjang waktu: Pemula, Perunggu (300), Perak (1.000), Emas (2.500), Platinum (5.000), dan Berlian (10.000).</p>
            </div>
        </details>`;
}

function prViewUtbk() {
    let isi;
    if (pr.utbkGalat) isi = prKotakGalat('prMuatUtbk()');
    else if (pr.utbkMuat || !pr.utbkData) isi = `<p class="text-sm text-slate-400 py-8 text-center">Memuat peringkat...</p>`;
    else if (!pr.utbkData.length) {
        isi = prKotakKosong('Belum ada try out tercatat', 'Catat skor try out di UTBK Corner untuk masuk peringkat.',
            `<button type="button" onclick="openUtbkPage('tryout')" class="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">Buka UTBK Corner</button>`);
    } else {
        const saya = pr.utbkData.some(r => r.adalah_saya);
        let sebelumnya = 0;
        const baris = pr.utbkData.map(r => {
            const lompat = r.rk > 20 && sebelumnya <= 20;
            sebelumnya = r.rk;
            return prBaris(r.rk, lompat, r.adalah_saya, r.nama_siswa,
                `${Number(r.jumlah_to)} try out, skor terbaik ${utbkFmt(Number(r.terbaik))}`, utbkFmt(Number(r.rata_rata)));
        }).join('');
        const ajakan = saya ? '' : `<div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Kamu belum masuk peringkat karena belum punya try out dengan skor.
            <button type="button" onclick="openUtbkPage('tryout')" class="font-semibold underline">Catat try out</button></div>`;
        isi = `${ajakan}<div class="flex flex-col gap-1">${baris}</div>`;
    }

    return `
        <div><h4 class="font-bold text-lg text-slate-800">Peringkat UTBK</h4>
            <p class="text-xs text-slate-400 mt-0.5">Diurutkan dari rata-rata skor try out tertinggi.</p></div>
        ${isi}
        <details class="rounded-2xl border border-slate-100 bg-white">
            <summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 p-4 font-bold text-slate-800 text-sm">Cara peringkat dihitung<i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i></summary>
            <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed space-y-2">
                <p>Untuk tiap try out, dihitung rata-rata skor dari subtes yang terisi (subtes kosong diabaikan). Lalu semua try out kamu dirata-ratakan, dan hasilnya dipakai untuk peringkat.</p>
                <p>Yang tampil adalah 20 teratas dan posisimu sendiri. Hanya sesama jenis akun yang dibandingkan, dan skor per subtes dan per try out tidak ditampilkan ke orang lain.</p>
            </div>
        </details>`;
}

function prRender() {
    const root = document.getElementById('peringkat-root');
    if (!root) return;
    const tabs = prAdaTabUtbk()
        ? `<div class="flex gap-1 p-1 rounded-xl bg-slate-100" role="tablist">
            ${[['minigames', 'Mini Games', 'gamepad-2'], ['utbk', 'UTBK', 'graduation-cap']].map(([k, l, ik]) => `
            <button type="button" role="tab" aria-selected="${pr.tab === k}" onclick="prSetTab('${k}')" class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition touch-manipulation ${pr.tab === k ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"><i data-lucide="${ik}" class="w-4 h-4"></i>${l}</button>`).join('')}
        </div>` : '';
    root.innerHTML = `<div class="flex flex-col gap-4">${tabs}${pr.tab === 'utbk' ? prViewUtbk() : prViewMinigames()}</div>`;
    lucide.createIcons();
}
