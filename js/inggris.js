// ====================================================================
// MINI GAME BAHASA INGGRIS: TERJEMAHKAN KATA
//   Arah: Inggris ke Indonesia, Indonesia ke Inggris, atau campuran.
//   Kesulitan: mudah, sedang, sulit (menurut tingkat katanya), atau acak.
//   Mode: time attack (1-5 menit) atau jumlah soal.
//   Soal pilihan ganda 4 opsi. Pengecoh dipilih dari kata lain dengan jenis kata
//   yang sama dan TIDAK berbagi arti dengan jawaban benar.
// Hasil tiap sesi masuk ke peringkat Mini Games (js/minigames.js).
// ====================================================================

const ING_ARAH = { en_id: 'Inggris ke Indonesia', id_en: 'Indonesia ke Inggris', campur: 'Campuran' };
const ING_LEVEL = { mudah: 1, sedang: 2, sulit: 3, acak: 0 };
const ING_NAMA_LEVEL = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };
const ING_PER_LEVEL = { 1: [], 2: [], 3: [] };
ING_KAMUS.forEach(e => ING_PER_LEVEL[e.lvl].push(e));

function ingAcak(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
const ingPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ====================================================================
// PEMBUAT SOAL
// ====================================================================
function ingSusun(e, dir) {
    const tokBenar = new Set(e.tok);
    const kand = ING_KAMUS.filter(x => x !== e && x.en !== e.en && !x.tok.some(t => tokBenar.has(t)));
    const samaJenis = kand.filter(x => x.pos === e.pos);
    const dekat = samaJenis.filter(x => Math.abs(x.lvl - e.lvl) <= 1);
    const pool = dekat.length >= 6 ? dekat : (samaJenis.length >= 6 ? samaJenis : kand);
    const teksOpsi = (x) => dir === 'en_id' ? x.id : x.en;
    const benarTeks = teksOpsi(e);
    const dipakai = new Set([benarTeks.toLowerCase()]);
    const pengecoh = [];
    for (const x of ingAcak(pool)) {
        const t = teksOpsi(x);
        if (dipakai.has(t.toLowerCase())) continue;
        dipakai.add(t.toLowerCase());
        pengecoh.push(t);
        if (pengecoh.length === 3) break;
    }
    const opsi = ingAcak([benarTeks, ...pengecoh]);
    return {
        dir, lvl: e.lvl, kes: ING_NAMA_LEVEL[e.lvl], en: e.en, id: e.id, pos: e.pos,
        prompt: dir === 'en_id' ? e.en : e.id,
        opsi, benarIdx: opsi.indexOf(benarTeks), jawabBenar: benarTeks, topik: dir
    };
}

// 'sudah' = himpunan soal yang sudah keluar di sesi ini (hindari pengulangan)
function ingBuatSoal(kesulitan, arah, sudah) {
    let q;
    for (let i = 0; i < 40; i++) {
        const lvl = kesulitan === 'acak' ? ingPick([1, 2, 3]) : ING_LEVEL[kesulitan];
        const entri = ingPick(ING_PER_LEVEL[lvl]);
        const dir = arah === 'campur' ? ingPick(['en_id', 'id_en']) : arah;
        const kunci = dir + '|' + entri.en;
        q = ingSusun(entri, dir);
        if (!sudah || !sudah.has(kunci)) { if (sudah) sudah.add(kunci); return q; }
    }
    return q;
}

// ====================================================================
// STATE
// ====================================================================
const ing = {
    fase: 'setup', tab: 'latih',
    arah: 'campur', kes: 'sedang', mode: 'waktu', menit: 2, jumlah: 20,
    q: null, hasil: [], sudah: new Set(),
    mulai: 0, tSoal: 0, batasMs: 0, timer: null, jeda: null, kunci: false,
    ringkas: null, status: ''
};

function ingMuatSetelan() {
    try {
        const s = JSON.parse(localStorage.getItem('inggris_setelan') || 'null');
        if (!s) return;
        if (ING_ARAH[s.arah]) ing.arah = s.arah;
        if (MG_KESULITAN[s.kes]) ing.kes = s.kes;
        if (s.mode === 'waktu' || s.mode === 'jumlah') ing.mode = s.mode;
        if (MG_MENIT.includes(s.menit)) ing.menit = s.menit;
        if (MG_JUMLAH.includes(s.jumlah)) ing.jumlah = s.jumlah;
    } catch (e) { /* abaikan */ }
}
function ingSimpanSetelan() {
    try { localStorage.setItem('inggris_setelan', JSON.stringify({ arah: ing.arah, kes: ing.kes, mode: ing.mode, menit: ing.menit, jumlah: ing.jumlah })); } catch (e) { /* abaikan */ }
}

function resetInggrisState() {
    ingHentikan();
    Object.assign(ing, { fase: 'setup', tab: 'latih', q: null, hasil: [], sudah: new Set(), ringkas: null, status: '' });
    const root = document.getElementById('inggris-root');
    if (root) root.innerHTML = '';
}
function ingHentikan() {
    if (ing.timer) { clearInterval(ing.timer); ing.timer = null; }
    if (ing.jeda) { clearTimeout(ing.jeda); ing.jeda = null; }
    document.removeEventListener('keydown', ingKey);
    ing.kunci = false;
}
// Dipanggil showDashPage() saat berpindah dari halaman game: sesi yang berjalan dibatalkan
function inggrisOnLeave() {
    if (ing.fase === 'main') { ingHentikan(); ing.fase = 'setup'; }
}

async function openInggrisPage() {
    if (!activeUser) return;
    ingMuatSetelan();
    if (ing.fase !== 'setup') { ingHentikan(); ing.fase = 'setup'; }
    showDashPage('inggris');
    ingRender();
    await mgMuatRiwayat('inggris');
    if (ing.fase === 'setup') ingRender();
}

// ====================================================================
// RENDER
// ====================================================================
function ingRender() {
    const root = document.getElementById('inggris-root');
    if (!root) return;
    root.innerHTML = ing.fase === 'main' ? ingViewMain() : ing.fase === 'hasil' ? ingViewHasil() : ingViewSetup();
    lucide.createIcons();
}

function ingViewSetup() {
    const tabs = [['latih', 'Latihan'], ['riwayat', 'Riwayat dan rekor']].map(([k, l]) =>
        `<button type="button" onclick="ingGantiTab('${k}')" ${ing.tab === k ? 'aria-current="page"' : ''}
            class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${ing.tab === k ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white'}">${l}</button>`).join('');
    return `<div class="flex flex-col gap-5">
        <div class="flex gap-2">${tabs}</div>
        ${ing.tab === 'latih' ? ingViewPengaturan() : mgViewRiwayat('inggris')}
    </div>`;
}

function ingViewPengaturan() {
    const label = (t) => `<p class="text-sm font-semibold text-slate-700 mb-2">${t}</p>`;
    const arah = Object.entries(ING_ARAH).map(([k, l]) => mgChip(ing.arah === k, `ingSet('arah','${k}')`, l)).join('');
    const kes = Object.entries(MG_KESULITAN).map(([k, l]) => mgChip(ing.kes === k, `ingSet('kes','${k}')`, l)).join('');
    const mode = [['waktu', 'Time attack'], ['jumlah', 'Jumlah soal']].map(([k, l]) => mgChip(ing.mode === k, `ingSet('mode','${k}')`, l)).join('');
    const sub = ing.mode === 'waktu'
        ? MG_MENIT.map(m => mgChip(ing.menit === m, `ingSet('menit',${m})`, `${m} menit`)).join('')
        : MG_JUMLAH.map(j => mgChip(ing.jumlah === j, `ingSet('jumlah',${j})`, `${j} soal`)).join('');
    const jumlahKata = ING_KAMUS.length;
    return `
        <p class="text-sm text-slate-600 leading-relaxed">Pilih terjemahan yang tepat untuk setiap kata. Ada ${mgFmtAngka(jumlahKata)} kata dalam tiga tingkat, dan pilihan jawabannya diacak setiap kali. Poin tiap sesi masuk ke peringkat Mini Games.</p>
        <div>${label('Arah terjemahan')}<div class="flex flex-wrap gap-2">${arah}</div></div>
        <div>${label('Kesulitan')}<div class="flex flex-wrap gap-2">${kes}</div>
            <p class="text-xs text-slate-400 mt-2">Mudah: kata sehari-hari. Sedang: kosakata menengah. Sulit: kosakata akademik dan formal.</p></div>
        <div>${label('Mode')}<div class="flex flex-wrap gap-2">${mode}</div>
            <div class="flex flex-wrap gap-2 mt-2">${sub}</div>
            <p class="text-xs text-slate-400 mt-2">${ing.mode === 'waktu'
                ? 'Jawab sebanyak mungkin kata sebelum waktu habis.'
                : 'Selesaikan semua soal secepat dan seakurat mungkin.'}</p></div>
        <div class="flex justify-end">
            <button type="button" onclick="ingMulai()" class="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                <i data-lucide="play" class="w-4 h-4"></i> Mulai
            </button>
        </div>`;
}

function ingGantiTab(t) { ing.tab = t; ingRender(); }
function ingSet(kunci, nilai) { ing[kunci] = nilai; ingSimpanSetelan(); ingRender(); }

function ingViewMain() {
    const waktu = ing.mode === 'waktu';
    const q = ing.q;
    const opsi = q.opsi.map((t, i) => `
        <button type="button" id="ing-opsi-${i}" onclick="ingPilih(${i})"
            class="w-full text-left flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white hover:border-primary-300 active:bg-slate-50 px-4 py-3.5 transition touch-manipulation select-none">
            <span class="w-7 h-7 shrink-0 rounded-lg bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center">${i + 1}</span>
            <span class="text-base sm:text-lg font-semibold text-slate-800">${escapeHtml(t)}</span>
        </button>`).join('');
    return `
    <div class="flex flex-col gap-4 max-w-md mx-auto">
        <div class="flex items-center justify-between">
            <button type="button" onclick="ingKeluar()" class="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"><i data-lucide="x" class="w-4 h-4"></i> Keluar</button>
            <p class="text-sm font-semibold text-slate-600">Benar <span id="ing-benar" class="text-emerald-600">${ing.hasil.filter(h => h.benar).length}</span></p>
        </div>
        <div>
            ${waktu ? `<p id="ing-waktu" role="timer" class="text-4xl font-extrabold tabular-nums text-slate-800 text-center">${mgFmtWaktu(ing.menit * 60)}</p>`
                : `<p class="text-center text-sm font-semibold text-slate-600">Soal <span id="ing-nomor">${ing.hasil.length + 1}</span> dari ${ing.jumlah}
                    <span id="ing-lewat" class="text-slate-400 font-normal tabular-nums"> (0:00)</span></p>`}
            <div class="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden"><div id="ing-bar" class="h-full rounded-full bg-primary-600" style="width:${waktu ? 100 : 0}%"></div></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p class="text-xs text-slate-400">${ING_ARAH[q.dir]}, ${ING_JENIS[q.pos] || ''}</p>
            <p id="ing-soal" aria-live="polite" class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 break-words">${escapeHtml(q.prompt)}</p>
            <p class="text-xs text-slate-500 mt-3">${q.dir === 'en_id' ? 'Pilih artinya dalam bahasa Indonesia.' : 'Pilih kata yang sesuai dalam bahasa Inggris.'}</p>
        </div>
        <div class="flex flex-col gap-2">${opsi}</div>
        <p id="ing-umpan" class="min-h-[2.75rem] text-center text-sm font-semibold" aria-live="assertive"></p>
        <button type="button" onclick="ingLewati()" class="self-center text-sm font-semibold text-slate-500 hover:text-slate-700">Lewati soal ini</button>
    </div>`;
}

// ====================================================================
// ALUR GAME
// ====================================================================
function ingMulai() {
    ing.hasil = []; ing.sudah = new Set(); ing.ringkas = null; ing.status = '';
    ing.fase = 'main';
    ing.mulai = Date.now();
    ing.batasMs = ing.mode === 'waktu' ? ing.menit * 60000 : 0;
    ing.q = ingBuatSoal(ing.kes, ing.arah, ing.sudah);
    ing.tSoal = Date.now();
    ingHentikan();
    ing.timer = setInterval(ingTick, 200);
    document.addEventListener('keydown', ingKey);
    ingRender();
    ingTick();
}

function ingTick() {
    if (ing.fase !== 'main') return;
    const lewat = Date.now() - ing.mulai;
    if (ing.mode === 'waktu') {
        const sisa = ing.batasMs - lewat;
        if (sisa <= 0) { ingSelesai(); return; }
        const el = document.getElementById('ing-waktu');
        if (el) { el.textContent = mgFmtWaktu(Math.ceil(sisa / 1000)); el.classList.toggle('text-rose-600', sisa <= 10000); }
        const bar = document.getElementById('ing-bar');
        if (bar) { bar.style.width = (sisa / ing.batasMs * 100) + '%'; bar.classList.toggle('bg-rose-500', sisa <= 10000); }
    } else {
        const el = document.getElementById('ing-lewat');
        if (el) el.textContent = ` (${mgFmtWaktu(lewat / 1000)})`;
    }
}

function ingKey(e) {
    if (ing.fase !== 'main' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) { ingPilih(Number(e.key) - 1); e.preventDefault(); }
}

function ingCatat(benar, pilihTeks) {
    const q = ing.q;
    ing.hasil.push({
        topik: q.dir, kes: q.kes, benar, prompt: q.prompt, en: q.en, id: q.id,
        pilih: pilihTeks, jawabBenar: q.jawabBenar, detik: (Date.now() - ing.tSoal) / 1000
    });
    const el = document.getElementById('ing-benar');
    if (el) el.textContent = ing.hasil.filter(h => h.benar).length;
}

function ingPasangan(q) { return `<b>${escapeHtml(q.en)}</b> = ${escapeHtml(q.id)}`; }

function ingPilih(i) {
    if (ing.fase !== 'main' || ing.kunci || !ing.q.opsi[i]) return;
    const q = ing.q;
    const benar = i === q.benarIdx;
    ingCatat(benar, q.opsi[i]);
    ing.kunci = true;
    q.opsi.forEach((_, k) => {
        const b = document.getElementById('ing-opsi-' + k);
        if (!b) return;
        b.disabled = true;
        b.className = 'w-full text-left flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition select-none ' +
            (k === q.benarIdx ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : k === i ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-100 bg-white text-slate-400');
    });
    const um = document.getElementById('ing-umpan');
    if (um) {
        um.className = 'min-h-[2.75rem] text-center text-sm font-semibold ' + (benar ? 'text-emerald-600' : 'text-rose-600');
        um.innerHTML = benar ? 'Benar' : `Jawaban yang benar: ${escapeHtml(q.jawabBenar)}<div class="mt-0.5 text-base font-normal text-slate-700">${ingPasangan(q)}</div>`;
    }
    ing.jeda = setTimeout(ingLanjut, benar ? 450 : 1800);
}

function ingLewati() {
    if (ing.fase !== 'main' || ing.kunci) return;
    const q = ing.q;
    ingCatat(false, '(dilewati)');
    ing.kunci = true;
    const b = document.getElementById('ing-opsi-' + q.benarIdx);
    if (b) b.className = 'w-full text-left flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 px-4 py-3.5';
    const um = document.getElementById('ing-umpan');
    if (um) { um.className = 'min-h-[2.75rem] text-center text-sm font-semibold text-slate-600'; um.innerHTML = ingPasangan(q); }
    ing.jeda = setTimeout(ingLanjut, 1500);
}

function ingLanjut() {
    ing.jeda = null; ing.kunci = false;
    if (ing.fase !== 'main') return;
    if (ing.mode === 'jumlah' && ing.hasil.length >= ing.jumlah) { ingSelesai(); return; }
    if (ing.mode === 'waktu' && Date.now() - ing.mulai >= ing.batasMs) { ingSelesai(); return; }
    ing.q = ingBuatSoal(ing.kes, ing.arah, ing.sudah);
    ing.tSoal = Date.now();
    ingRender();
    ingTick();
}

function ingKeluar() {
    if (!confirm('Keluar dari game? Sesi ini tidak akan disimpan.')) return;
    ingHentikan();
    ing.fase = 'setup';
    ingRender();
}

async function ingSelesai() {
    if (ing.fase !== 'main') return;
    const lewat = Math.min(Date.now() - ing.mulai, ing.mode === 'waktu' ? ing.batasMs : 7200000);
    ingHentikan();
    ing.fase = 'hasil';
    const benar = ing.hasil.filter(h => h.benar).length;
    const total = ing.hasil.length;
    const durasi = Math.max(1, Math.round(lewat / 1000));
    const batas = ing.mode === 'waktu' ? ing.menit : ing.jumlah;
    const poin = mgPoin(ing.hasil);
    const lama = mgRekor('inggris', ing.mode, batas);
    ing.ringkas = {
        benar, total, durasi, batas, poin,
        rekorBaru: total > 0 && mgLebihBaik({ benar, total, poin, durasi_detik: durasi }, lama, ing.mode),
        pertama: !lama
    };
    ing.status = total > 0 ? 'Menyimpan hasil...' : '';
    ingRender();
    window.scrollTo({ top: 0 });
    if (!total) return;
    try {
        const topik = ing.arah === 'campur' ? ['en_id', 'id_en'] : [ing.arah];
        await mgSimpanSesi('inggris', { mode: ing.mode, batas, kesulitan: ing.kes, topik, durasi, hasil: ing.hasil });
        ing.status = 'Hasil tersimpan di riwayat dan peringkatmu.';
        await mgMuatRiwayat('inggris');
    } catch (err) {
        console.error('Gagal menyimpan hasil game:', err);
        ing.status = 'Hasil belum tersimpan (periksa koneksi internet).';
    }
    const el = document.getElementById('ing-status');
    if (el) el.textContent = ing.status;
}

function ingViewHasil() {
    const r = ing.ringkas;
    if (!r || !r.total) {
        return `<div class="max-w-md mx-auto text-center py-8">
            <p class="font-bold text-slate-800">Belum ada soal yang dijawab</p>
            <button type="button" onclick="ingKePengaturan()" class="mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Kembali</button></div>`;
    }
    const akurasi = Math.round(r.benar / r.total * 100);
    const tile = (label, nilai) => `<div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"><p class="text-xs text-slate-500">${label}</p><p class="text-xl font-bold text-slate-800 mt-0.5 tabular-nums">${nilai}</p></div>`;

    const kelompok = (kunciFn, namaFn) => {
        const per = {};
        ing.hasil.forEach(h => { const k = kunciFn(h); const p = per[k] = per[k] || { b: 0, t: 0 }; p.t++; if (h.benar) p.b++; });
        return Object.entries(per).map(([k, v]) => {
            const pct = Math.round(v.b / v.t * 100);
            return `<div class="flex items-center gap-3"><span class="w-40 shrink-0 text-sm text-slate-600">${namaFn(k)}</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width:${pct}%"></div></div>
                <span class="w-14 shrink-0 text-right text-sm font-semibold text-slate-700 tabular-nums">${v.b}/${v.t}</span></div>`;
        }).join('');
    };
    const adaDuaArah = new Set(ing.hasil.map(h => h.topik)).size > 1;
    const adaBanyakTingkat = new Set(ing.hasil.map(h => h.kes)).size > 1;
    const rincian = [
        adaDuaArah ? `<div><p class="text-xs text-slate-500 mb-2">Per arah</p><div class="space-y-3">${kelompok(h => h.topik, k => ING_ARAH[k])}</div></div>` : '',
        adaBanyakTingkat ? `<div><p class="text-xs text-slate-500 mb-2">Per tingkat kata</p><div class="space-y-3">${kelompok(h => h.kes, k => MG_KESULITAN[k])}</div></div>` : ''
    ].join('');

    const salah = ing.hasil.filter(h => !h.benar);
    const reviu = salah.length ? `
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800 mb-1">Kata yang perlu dipelajari (${salah.length})</h4>
            <div class="divide-y divide-slate-100">${salah.map(h => `
                <div class="py-3"><p class="text-base text-slate-800">${ingPasangan(h)}</p>
                <p class="text-sm text-slate-500 mt-0.5">Jawabanmu: <span class="font-semibold text-rose-600">${escapeHtml(h.pilih)}</span></p></div>`).join('')}</div></div>` : '';

    const judul = r.rekorBaru ? (r.pertama ? 'Sesi pertama di mode ini' : 'Rekor baru') : 'Selesai';
    const sub = ing.mode === 'waktu' ? `${r.benar} kata benar dalam ${r.batas} menit` : `${r.benar} dari ${r.total} kata benar`;
    return `<div class="flex flex-col gap-4 max-w-xl mx-auto">
        <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-5">
            <p class="text-sm text-primary-100">${judul}</p>
            <p class="mt-1 text-3xl font-extrabold tracking-tight">${sub}</p>
            <p class="text-sm text-primary-100 mt-2"><b class="text-white">+${mgFmtAngka(r.poin)} poin</b> untuk peringkatmu</p>
            <p class="text-xs text-primary-200 mt-1">${mgLabelMode(ing.mode, r.batas)}, ${ING_ARAH[ing.arah]}, tingkat ${MG_KESULITAN[ing.kes]}</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${tile('Akurasi', akurasi + '%')}${tile('Kata dijawab', r.total)}
            ${tile('Waktu', mgFmtWaktu(r.durasi))}${tile('Rata-rata per kata', (r.durasi / r.total).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' dtk')}
        </div>
        <p id="ing-status" class="text-xs text-slate-400">${escapeHtml(ing.status)}</p>
        ${rincian ? `<div class="rounded-2xl border border-slate-100 p-4 space-y-4"><h4 class="font-bold text-slate-800">Rincian</h4>${rincian}</div>` : ''}
        ${reviu}
        <div class="flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onclick="ingKePengaturan()" class="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-600 hover:bg-slate-50">Ubah pengaturan</button>
            <button type="button" onclick="ingMulai()" class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm flex items-center justify-center gap-2"><i data-lucide="rotate-ccw" class="w-4 h-4"></i> Main lagi</button>
        </div>
    </div>`;
}

function ingKePengaturan() { ing.fase = 'setup'; ing.tab = 'latih'; ingRender(); window.scrollTo({ top: 0 }); }
