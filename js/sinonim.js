// ====================================================================
// MINI GAME SINONIM & ANTONIM (bahasa Indonesia)
//   Jenis soal: sinonim (persamaan kata), antonim (lawan kata), atau campuran.
//   Kesulitan: mudah, sedang, sulit (menurut tingkat katanya), atau acak.
//   Mode: time attack (1-5 menit) atau jumlah soal.
//   Soal pilihan ganda 4 opsi. Pengecoh dipilih dari kata lain yang TIDAK berkerabat
//   (bukan sinonim/antonim) dengan kata soal maupun jawaban benar (lihat SNM_REL).
// Hasil tiap sesi masuk ke peringkat Mini Games (js/minigames.js).
// ====================================================================

const SNM_TIPE = { sinonim: 'Sinonim', antonim: 'Antonim', campur: 'Campuran' };
const SNM_LEVEL = { mudah: 1, sedang: 2, sulit: 3, acak: 0 };
const SNM_NAMA_LEVEL = { 1: 'mudah', 2: 'sedang', 3: 'sulit' };

function snmAcak(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
const snmPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const snmDaftar = (e, tipe) => tipe === 'sinonim' ? e.sin : e.ant;

// ====================================================================
// PEMBUAT SOAL
// ====================================================================
function snmSusun(e, tipe) {
    const benarTeks = snmPick(snmDaftar(e, tipe));
    const larang = new Set([e.kata, benarTeks, ...(SNM_REL[e.kata] || []), ...(SNM_REL[benarTeks] || [])]);
    const kand = SNM_KAMUS.filter(x => x !== e);
    const dekat = kand.filter(x => Math.abs(x.lvl - e.lvl) <= 1);
    const pool = dekat.length >= 12 ? dekat : kand;
    const dipakai = new Set();
    const pengecoh = [];
    for (const x of snmAcak(pool)) {
        const t = snmPick(x.semua);
        if (larang.has(t) || dipakai.has(t)) continue;
        dipakai.add(t);
        pengecoh.push(t);
        if (pengecoh.length === 3) break;
    }
    const opsi = snmAcak([benarTeks, ...pengecoh]);
    return {
        tipe, lvl: e.lvl, kes: SNM_NAMA_LEVEL[e.lvl], prompt: e.kata,
        ket: snmDaftar(e, tipe).join(', '),
        opsi, benarIdx: opsi.indexOf(benarTeks), jawabBenar: benarTeks, topik: tipe
    };
}

// 'sudah' = himpunan soal yang sudah keluar di sesi ini (hindari pengulangan)
function snmBuatSoal(kesulitan, tipe, sudah) {
    let q;
    for (let i = 0; i < 40; i++) {
        const lvl = kesulitan === 'acak' ? snmPick([1, 2, 3]) : SNM_LEVEL[kesulitan];
        const t = tipe === 'campur' ? snmPick(['sinonim', 'antonim']) : tipe;
        const daftar = SNM_KAMUS.filter(e => e.lvl === lvl && snmDaftar(e, t).length);
        const entri = snmPick(daftar);
        const kunci = t + '|' + entri.kata;
        q = snmSusun(entri, t);
        if (!sudah || !sudah.has(kunci)) { if (sudah) sudah.add(kunci); return q; }
    }
    return q;
}

// ====================================================================
// STATE
// ====================================================================
const snm = {
    fase: 'setup', tab: 'latih',
    tipe: 'campur', kes: 'sedang', mode: 'waktu', menit: 2, jumlah: 20,
    q: null, hasil: [], sudah: new Set(),
    mulai: 0, tSoal: 0, batasMs: 0, timer: null, jeda: null, kunci: false,
    ringkas: null, status: ''
};

function snmMuatSetelan() {
    try {
        const s = JSON.parse(localStorage.getItem('sinonim_setelan') || 'null');
        if (!s) return;
        if (SNM_TIPE[s.tipe]) snm.tipe = s.tipe;
        if (MG_KESULITAN[s.kes]) snm.kes = s.kes;
        if (s.mode === 'waktu' || s.mode === 'jumlah') snm.mode = s.mode;
        if (MG_MENIT.includes(s.menit)) snm.menit = s.menit;
        if (MG_JUMLAH.includes(s.jumlah)) snm.jumlah = s.jumlah;
    } catch (e) { /* abaikan */ }
}
function snmSimpanSetelan() {
    try { localStorage.setItem('sinonim_setelan', JSON.stringify({ tipe: snm.tipe, kes: snm.kes, mode: snm.mode, menit: snm.menit, jumlah: snm.jumlah })); } catch (e) { /* abaikan */ }
}

function resetSinonimState() {
    snmHentikan();
    Object.assign(snm, { fase: 'setup', tab: 'latih', q: null, hasil: [], sudah: new Set(), ringkas: null, status: '' });
    const root = document.getElementById('sinonim-root');
    if (root) root.innerHTML = '';
}
function snmHentikan() {
    if (snm.timer) { clearInterval(snm.timer); snm.timer = null; }
    if (snm.jeda) { clearTimeout(snm.jeda); snm.jeda = null; }
    document.removeEventListener('keydown', snmKey);
    document.body.classList.remove('game-berjalan');
    snm.kunci = false;
}
// Dipanggil showDashPage() saat berpindah dari halaman game: sesi yang berjalan dibatalkan
function sinonimOnLeave() {
    if (snm.fase === 'main') { snmHentikan(); snm.fase = 'setup'; }
}

async function openSinonimPage() {
    if (!activeUser) return;
    snmMuatSetelan();
    if (snm.fase !== 'setup') { snmHentikan(); snm.fase = 'setup'; }
    showDashPage('sinonim');
    snmRender();
    await mgMuatRiwayat('sinonim');
    if (snm.fase === 'setup') snmRender();
}

// ====================================================================
// RENDER
// ====================================================================
function snmRender() {
    const root = document.getElementById('sinonim-root');
    if (!root) return;
    root.innerHTML = snm.fase === 'main' ? snmViewMain() : snm.fase === 'hasil' ? snmViewHasil() : snmViewSetup();
    lucide.createIcons();
}

function snmViewSetup() {
    const tabs = [['latih', 'Latihan'], ['riwayat', 'Riwayat dan rekor']].map(([k, l]) =>
        `<button type="button" onclick="snmGantiTab('${k}')" ${snm.tab === k ? 'aria-current="page"' : ''}
            class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${snm.tab === k ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white'}">${l}</button>`).join('');
    return `<div class="flex flex-col gap-5">
        <div class="flex gap-2">${tabs}</div>
        ${snm.tab === 'latih' ? snmViewPengaturan() : mgViewRiwayat('sinonim')}
    </div>`;
}

function snmViewPengaturan() {
    const label = (t) => `<p class="text-sm font-semibold text-slate-700 mb-2">${t}</p>`;
    const arah = Object.entries(SNM_TIPE).map(([k, l]) => mgChip(snm.tipe === k, `snmSet('tipe','${k}')`, l)).join('');
    const kes = Object.entries(MG_KESULITAN).map(([k, l]) => mgChip(snm.kes === k, `snmSet('kes','${k}')`, l)).join('');
    const mode = [['waktu', 'Time attack'], ['jumlah', 'Jumlah soal']].map(([k, l]) => mgChip(snm.mode === k, `snmSet('mode','${k}')`, l)).join('');
    const sub = snm.mode === 'waktu'
        ? MG_MENIT.map(m => mgChip(snm.menit === m, `snmSet('menit',${m})`, `${m} menit`)).join('')
        : MG_JUMLAH.map(j => mgChip(snm.jumlah === j, `snmSet('jumlah',${j})`, `${j} soal`)).join('');
    const jumlahKata = SNM_KAMUS.length;
    return `
        <p class="text-sm text-slate-600 leadsnm-relaxed">Pilih persamaan kata (sinonim) atau lawan kata (antonim) yang tepat. Ada ${mgFmtAngka(jumlahKata)} kata dalam tiga tingkat, dan pilihan jawabannya diacak setiap kali. Poin tiap sesi masuk ke peringkat Mini Games.</p>
        <div>${label('Jenis soal')}<div class="flex flex-wrap gap-2">${arah}</div></div>
        <div>${label('Kesulitan')}<div class="flex flex-wrap gap-2">${kes}</div>
            <p class="text-xs text-slate-400 mt-2">Mudah: kata sehari-hari. Sedang: kosakata menengah. Sulit: kosakata akademik dan formal.</p></div>
        <div>${label('Mode')}<div class="flex flex-wrap gap-2">${mode}</div>
            <div class="flex flex-wrap gap-2 mt-2">${sub}</div>
            <p class="text-xs text-slate-400 mt-2">${snm.mode === 'waktu'
                ? 'Jawab sebanyak mungkin kata sebelum waktu habis.'
                : 'Selesaikan semua soal secepat dan seakurat mungkin.'}</p></div>
        <div class="flex justify-end">
            <button type="button" onclick="snmMulai()" class="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                <i data-lucide="play" class="w-4 h-4"></i> Mulai
            </button>
        </div>`;
}

function snmGantiTab(t) { snm.tab = t; snmRender(); }
function snmSet(kunci, nilai) { snm[kunci] = nilai; snmSimpanSetelan(); snmRender(); }

function snmViewMain() {
    const waktu = snm.mode === 'waktu';
    const q = snm.q;
    const opsi = q.opsi.map((t, i) => `
        <button type="button" id="snm-opsi-${i}" onclick="snmPilih(${i})"
            class="w-full text-left flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white hover:border-primary-300 active:bg-slate-50 px-4 py-3.5 transition touch-manipulation select-none">
            <span class="w-7 h-7 shrink-0 rounded-lg bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center">${i + 1}</span>
            <span class="text-base sm:text-lg font-semibold text-slate-800">${escapeHtml(t)}</span>
        </button>`).join('');
    return `
    <div class="flex flex-col gap-4 max-w-md mx-auto">
        <div class="flex items-center justify-between">
            <button type="button" onclick="snmKeluar()" class="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"><i data-lucide="x" class="w-4 h-4"></i> Keluar</button>
            <p class="text-sm font-semibold text-slate-600">Benar <span id="snm-benar" class="text-emerald-600">${snm.hasil.filter(h => h.benar).length}</span></p>
        </div>
        <div>
            ${waktu ? `<p id="snm-waktu" role="timer" class="text-4xl font-extrabold tabular-nums text-slate-800 text-center">${mgFmtWaktu(snm.menit * 60)}</p>`
                : `<p class="text-center text-sm font-semibold text-slate-600">Soal <span id="snm-nomor">${snm.hasil.length + 1}</span> dari ${snm.jumlah}
                    <span id="snm-lewat" class="text-slate-400 font-normal tabular-nums"> (0:00)</span></p>`}
            <div class="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden"><div id="snm-bar" class="h-full rounded-full bg-primary-600" style="width:${waktu ? 100 : 0}%"></div></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p class="text-xs text-slate-400">${q.tipe === 'sinonim' ? 'Sinonim (persamaan kata)' : 'Antonim (lawan kata)'}</p>
            <p id="snm-soal" aria-live="polite" class="mt-2 text-3xl sm:text-4xl font-bold tracksnm-tight text-slate-900 break-words">${escapeHtml(q.prompt)}</p>
            <p class="text-xs text-slate-500 mt-3">${q.tipe === 'sinonim' ? 'Pilih kata yang artinya sama.' : 'Pilih kata yang artinya berlawanan.'}</p>
        </div>
        <div class="flex flex-col gap-2">${opsi}</div>
        <p id="snm-umpan" class="min-h-[2.75rem] text-center text-sm font-semibold" aria-live="assertive"></p>
        <button type="button" onclick="snmLewati()" class="self-center text-sm font-semibold text-slate-500 hover:text-slate-700">Lewati soal ini</button>
    </div>`;
}

// ====================================================================
// ALUR GAME
// ====================================================================
function snmMulai() {
    snm.hasil = []; snm.sudah = new Set(); snm.ringkas = null; snm.status = '';
    snm.fase = 'main';
    snm.mulai = Date.now();
    snm.batasMs = snm.mode === 'waktu' ? snm.menit * 60000 : 0;
    snm.q = snmBuatSoal(snm.kes, snm.tipe, snm.sudah);
    snm.tSoal = Date.now();
    snmHentikan();
    document.body.classList.add('game-berjalan');
    snm.timer = setInterval(snmTick, 200);
    document.addEventListener('keydown', snmKey);
    snmRender();
    snmTick();
}

function snmTick() {
    if (snm.fase !== 'main') return;
    const lewat = Date.now() - snm.mulai;
    if (snm.mode === 'waktu') {
        const sisa = snm.batasMs - lewat;
        if (sisa <= 0) { snmSelesai(); return; }
        const el = document.getElementById('snm-waktu');
        if (el) { el.textContent = mgFmtWaktu(Math.ceil(sisa / 1000)); el.classList.toggle('text-rose-600', sisa <= 10000); }
        const bar = document.getElementById('snm-bar');
        if (bar) { bar.style.width = (sisa / snm.batasMs * 100) + '%'; bar.classList.toggle('bg-rose-500', sisa <= 10000); }
    } else {
        const el = document.getElementById('snm-lewat');
        if (el) el.textContent = ` (${mgFmtWaktu(lewat / 1000)})`;
    }
}

function snmKey(e) {
    if (snm.fase !== 'main' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) { snmPilih(Number(e.key) - 1); e.preventDefault(); }
}

function snmCatat(benar, pilihTeks) {
    const q = snm.q;
    snm.hasil.push({
        topik: q.tipe, kes: q.kes, benar, prompt: q.prompt, ket: q.ket,
        pilih: pilihTeks, jawabBenar: q.jawabBenar, detik: (Date.now() - snm.tSoal) / 1000
    });
    const el = document.getElementById('snm-benar');
    if (el) el.textContent = snm.hasil.filter(h => h.benar).length;
}

function snmPasangan(q) { return `<b>${escapeHtml(q.prompt)}</b> ${(q.tipe || q.topik) === 'sinonim' ? 'bersinonim dengan' : 'berlawanan dengan'} ${escapeHtml(q.ket)}`; }

function snmPilih(i) {
    if (snm.fase !== 'main' || snm.kunci || !snm.q.opsi[i]) return;
    const q = snm.q;
    const benar = i === q.benarIdx;
    snmCatat(benar, q.opsi[i]);
    snm.kunci = true;
    q.opsi.forEach((_, k) => {
        const b = document.getElementById('snm-opsi-' + k);
        if (!b) return;
        b.disabled = true;
        b.className = 'w-full text-left flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition select-none ' +
            (k === q.benarIdx ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : k === i ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-100 bg-white text-slate-400');
    });
    const um = document.getElementById('snm-umpan');
    if (um) {
        um.className = 'min-h-[2.75rem] text-center text-sm font-semibold ' + (benar ? 'text-emerald-600' : 'text-rose-600');
        um.innerHTML = benar ? 'Benar' : `Jawaban yang benar: ${escapeHtml(q.jawabBenar)}<div class="mt-0.5 text-base font-normal text-slate-700">${snmPasangan(q)}</div>`;
    }
    snm.jeda = setTimeout(snmLanjut, benar ? 450 : 1800);
}

function snmLewati() {
    if (snm.fase !== 'main' || snm.kunci) return;
    const q = snm.q;
    snmCatat(false, '(dilewati)');
    snm.kunci = true;
    const b = document.getElementById('snm-opsi-' + q.benarIdx);
    if (b) b.className = 'w-full text-left flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 px-4 py-3.5';
    const um = document.getElementById('snm-umpan');
    if (um) { um.className = 'min-h-[2.75rem] text-center text-sm font-semibold text-slate-600'; um.innerHTML = snmPasangan(q); }
    snm.jeda = setTimeout(snmLanjut, 1500);
}

function snmLanjut() {
    snm.jeda = null; snm.kunci = false;
    if (snm.fase !== 'main') return;
    if (snm.mode === 'jumlah' && snm.hasil.length >= snm.jumlah) { snmSelesai(); return; }
    if (snm.mode === 'waktu' && Date.now() - snm.mulai >= snm.batasMs) { snmSelesai(); return; }
    snm.q = snmBuatSoal(snm.kes, snm.tipe, snm.sudah);
    snm.tSoal = Date.now();
    snmRender();
    snmTick();
}

function snmKeluar() {
    if (!confirm('Keluar dari game? Sesi ini tidak akan disimpan.')) return;
    snmHentikan();
    snm.fase = 'setup';
    snmRender();
}

async function snmSelesai() {
    if (snm.fase !== 'main') return;
    const lewat = Math.min(Date.now() - snm.mulai, snm.mode === 'waktu' ? snm.batasMs : 7200000);
    snmHentikan();
    snm.fase = 'hasil';
    const benar = snm.hasil.filter(h => h.benar).length;
    const total = snm.hasil.length;
    const durasi = Math.max(1, Math.round(lewat / 1000));
    const batas = snm.mode === 'waktu' ? snm.menit : snm.jumlah;
    const poin = mgPoin(snm.hasil);
    const lama = mgRekor('sinonim', snm.mode, batas);
    snm.ringkas = {
        benar, total, durasi, batas, poin,
        rekorBaru: total > 0 && mgLebihBaik({ benar, total, poin, durasi_detik: durasi }, lama, snm.mode),
        pertama: !lama
    };
    snm.status = total > 0 ? 'Menyimpan hasil...' : '';
    snmRender();
    window.scrollTo({ top: 0 });
    if (!total) return;
    try {
        const topik = snm.tipe === 'campur' ? ['sinonim', 'antonim'] : [snm.tipe];
        await mgSimpanSesi('sinonim', { mode: snm.mode, batas, kesulitan: snm.kes, topik, durasi, hasil: snm.hasil });
        snm.status = 'Hasil tersimpan di riwayat dan peringkatmu.';
        await mgMuatRiwayat('sinonim');
    } catch (err) {
        console.error('Gagal menyimpan hasil game:', err);
        snm.status = 'Hasil belum tersimpan (periksa koneksi internet).';
    }
    const el = document.getElementById('snm-status');
    if (el) el.textContent = snm.status;
}

function snmViewHasil() {
    const r = snm.ringkas;
    if (!r || !r.total) {
        return `<div class="max-w-md mx-auto text-center py-8">
            <p class="font-bold text-slate-800">Belum ada soal yang dijawab</p>
            <button type="button" onclick="snmKePengaturan()" class="mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Kembali</button></div>`;
    }
    const akurasi = Math.round(r.benar / r.total * 100);
    const tile = (label, nilai) => `<div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"><p class="text-xs text-slate-500">${label}</p><p class="text-xl font-bold text-slate-800 mt-0.5 tabular-nums">${nilai}</p></div>`;

    const kelompok = (kunciFn, namaFn) => {
        const per = {};
        snm.hasil.forEach(h => { const k = kunciFn(h); const p = per[k] = per[k] || { b: 0, t: 0 }; p.t++; if (h.benar) p.b++; });
        return Object.entries(per).map(([k, v]) => {
            const pct = Math.round(v.b / v.t * 100);
            return `<div class="flex items-center gap-3"><span class="w-40 shrink-0 text-sm text-slate-600">${namaFn(k)}</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width:${pct}%"></div></div>
                <span class="w-14 shrink-0 text-right text-sm font-semibold text-slate-700 tabular-nums">${v.b}/${v.t}</span></div>`;
        }).join('');
    };
    const adaDuaArah = new Set(snm.hasil.map(h => h.topik)).size > 1;
    const adaBanyakTingkat = new Set(snm.hasil.map(h => h.kes)).size > 1;
    const rincian = [
        adaDuaArah ? `<div><p class="text-xs text-slate-500 mb-2">Per jenis soal</p><div class="space-y-3">${kelompok(h => h.topik, k => SNM_TIPE[k])}</div></div>` : '',
        adaBanyakTingkat ? `<div><p class="text-xs text-slate-500 mb-2">Per tingkat kata</p><div class="space-y-3">${kelompok(h => h.kes, k => MG_KESULITAN[k])}</div></div>` : ''
    ].join('');

    const salah = snm.hasil.filter(h => !h.benar);
    const reviu = salah.length ? `
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800 mb-1">Kata yang perlu dipelajari (${salah.length})</h4>
            <div class="divide-y divide-slate-100">${salah.map(h => `
                <div class="py-3"><p class="text-base text-slate-800">${snmPasangan(h)}</p>
                <p class="text-sm text-slate-500 mt-0.5">Jawabanmu: <span class="font-semibold text-rose-600">${escapeHtml(h.pilih)}</span></p></div>`).join('')}</div></div>` : '';

    const judul = r.rekorBaru ? (r.pertama ? 'Sesi pertama di mode ini' : 'Rekor baru') : 'Selesai';
    const sub = snm.mode === 'waktu' ? `${r.benar} kata benar dalam ${r.batas} menit` : `${r.benar} dari ${r.total} kata benar`;
    return `<div class="flex flex-col gap-4 max-w-xl mx-auto">
        <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-5">
            <p class="text-sm text-primary-100">${judul}</p>
            <p class="mt-1 text-3xl font-extrabold tracksnm-tight">${sub}</p>
            <p class="text-sm text-primary-100 mt-2"><b class="text-white">+${mgFmtAngka(r.poin)} poin</b> untuk peringkatmu</p>
            <p class="text-xs text-primary-200 mt-1">${mgLabelMode(snm.mode, r.batas)}, ${SNM_TIPE[snm.tipe]}, tingkat ${MG_KESULITAN[snm.kes]}</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${tile('Akurasi', akurasi + '%')}${tile('Kata dijawab', r.total)}
            ${tile('Waktu', mgFmtWaktu(r.durasi))}${tile('Rata-rata per kata', (r.durasi / r.total).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' dtk')}
        </div>
        <p id="snm-status" class="text-xs text-slate-400">${escapeHtml(snm.status)}</p>
        ${rincian ? `<div class="rounded-2xl border border-slate-100 p-4 space-y-4"><h4 class="font-bold text-slate-800">Rincian</h4>${rincian}</div>` : ''}
        ${reviu}
        <div class="flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onclick="snmKePengaturan()" class="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-600 hover:bg-slate-50">Ubah pengaturan</button>
            <button type="button" onclick="snmMulai()" class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm flex items-center justify-center gap-2"><i data-lucide="rotate-ccw" class="w-4 h-4"></i> Main lagi</button>
        </div>
    </div>`;
}

function snmKePengaturan() { snm.fase = 'setup'; snm.tab = 'latih'; snmRender(); window.scrollTo({ top: 0 }); }
