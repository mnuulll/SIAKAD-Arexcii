// ====================================================================
// SOSIAL (khusus Akun Umum): daftar teman, cari teman, permintaan, dan chat.
// Semua lewat fungsi database (teman_*, cari_teman, pesan_*). Chat memakai polling
// (cek pesan baru tiap beberapa detik), bukan Realtime, karena sesi memakai token sendiri.
// ====================================================================
const SO = { tab: 'teman', daftar: null, hasil: null, q: '', galat: '', chat: null, timer: null, latar: null, kirim: false };

function soRpc(nama, args) {
    return supabaseClient.rpc(nama, args).then(({ data, error }) => {
        if (error) throw error;
        if (data && data.error) { const e = new Error(data.error); e.kode = data.error; throw e; }
        return data;
    });
}
function soJam(t) { try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
function soInisial(n) { return escapeHtml(String(n || '?').substring(0, 2).toUpperCase()); }
function soAvatar(n, kecil) { return `<span class="${kecil ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm'} rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white font-bold flex items-center justify-center shrink-0">${soInisial(n)}</span>`; }

// ---------- badge & latar belakang ----------
function sosialBadge() {
    const el = document.getElementById('nav-sosial-badge');
    if (!el) return;
    const d = SO.daftar;
    const n = d ? d.teman.reduce((x, t) => x + Number(t.belum || 0), 0) + d.masuk.length : 0;
    el.textContent = n > 9 ? '9+' : String(n);
    el.classList.toggle('hidden', !n);
}
async function sosialMuatDaftar() {
    try { SO.daftar = await soRpc('teman_daftar'); } catch (e) { console.error('Gagal memuat teman:', e); }
    sosialBadge();
}
function sosialMulaiLatar() {
    if (SO.latar) return;
    sosialMuatDaftar();
    SO.latar = setInterval(() => { if (!document.hidden && !SO.timer) sosialMuatDaftar(); }, 30000);
}
function sosialReset() {
    sosialOnLeave();
    if (SO.latar) clearInterval(SO.latar);
    Object.assign(SO, { tab: 'teman', daftar: null, hasil: null, q: '', galat: '', chat: null, timer: null, latar: null, kirim: false });
    sosialBadge();
    const r = document.getElementById('sosial-root'); if (r) r.innerHTML = '';
}
function sosialOnLeave() {
    if (SO.timer) { clearInterval(SO.timer); SO.timer = null; }
    document.body.classList.remove('game-berjalan');
    SO.chat = null;
}

// ---------- halaman ----------
async function openSosialPage() {
    if (!activeUser || !isAkunUmum()) return;
    showDashPage('sosial');
    SO.chat = null;
    document.body.classList.remove('game-berjalan');
    sosialRender();
    await sosialMuatDaftar();
    sosialRender();
    if (SO.timer) clearInterval(SO.timer);
    SO.timer = setInterval(async () => {
        if (document.hidden) return;
        if (SO.chat) return sosialAmbilPesan();
        if (SO.tab === 'cari') return;
        await sosialMuatDaftar();
        if (!SO.chat && SO.tab !== 'cari') sosialRender();
    }, 4000);
}

function sosialTab(t) { SO.tab = t; SO.galat = ''; sosialRender(); if (t === 'cari') { const i = document.getElementById('so-q'); if (i) i.focus(); } }

function sosialRender() {
    const root = document.getElementById('sosial-root');
    if (!root || !activeUser) return;
    if (SO.chat) return sosialRenderChat(root);
    const d = SO.daftar;
    const nMasuk = d ? d.masuk.length : 0;
    const tab = (k, label, extra = '') => `<button type="button" onclick="sosialTab('${k}')" class="flex-1 py-2 rounded-lg text-sm font-bold transition ${SO.tab === k ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}">${label}${extra}</button>`;
    const badge = nMasuk ? `<span class="ml-1 text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.5">${nMasuk}</span>` : '';
    let isi = '';
    if (!d) isi = '<p class="text-sm text-slate-400 flex items-center gap-2 p-4"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memuat...</p>';
    else if (SO.tab === 'teman') isi = sosialListTeman(d);
    else if (SO.tab === 'masuk') isi = sosialListMasuk(d);
    else isi = sosialFormCari();
    root.innerHTML = `<div class="flex flex-col gap-4 max-w-md mx-auto">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2"><i data-lucide="users" class="w-5 h-5 text-primary-600"></i> Sosial</h3>
        <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">${tab('teman', 'Teman')}${tab('masuk', 'Permintaan', badge)}${tab('cari', 'Cari')}</div>
        ${SO.galat ? `<p class="text-xs font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">${escapeHtml(SO.galat)}</p>` : ''}
        ${isi}</div>`;
    lucide.createIcons();
}

function sosialListTeman(d) {
    if (!d.teman.length) return '<div class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Belum ada teman. Buka tab <b>Cari</b> untuk menambahkan lewat username.</div>';
    return `<div class="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">${d.teman.map(t => `
        <button type="button" onclick="sosialBukaChat('${t.id}')" class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition">
            ${soAvatar(t.nama)}
            <span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-slate-800 truncate">${escapeHtml(t.nama)}</span><span class="block text-xs text-slate-400 truncate">@${escapeHtml(t.username)}</span></span>
            ${Number(t.belum) ? `<span class="text-[11px] font-bold bg-primary-600 text-white rounded-full px-2 py-0.5">${Number(t.belum)}</span>` : '<i data-lucide="message-circle" class="w-5 h-5 text-slate-300"></i>'}
        </button>`).join('')}</div>`;
}

function sosialListMasuk(d) {
    const baris = (u, aksi) => `<div class="flex items-center gap-3 px-4 py-3">${soAvatar(u.nama, true)}
        <span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-slate-800 truncate">${escapeHtml(u.nama)}</span><span class="block text-xs text-slate-400 truncate">@${escapeHtml(u.username)}</span></span>${aksi}</div>`;
    const masuk = d.masuk.map(u => baris(u, `<button type="button" onclick="sosialBalas('${u.id}', true)" class="text-xs font-bold bg-primary-600 text-white rounded-lg px-3 py-1.5">Terima</button><button type="button" onclick="sosialBalas('${u.id}', false)" class="text-xs font-bold border border-slate-200 text-slate-500 rounded-lg px-3 py-1.5">Tolak</button>`)).join('');
    const keluar = d.keluar.map(u => baris(u, `<button type="button" onclick="sosialHapus('${u.id}')" class="text-xs font-bold border border-slate-200 text-slate-500 rounded-lg px-3 py-1.5">Batalkan</button>`)).join('');
    if (!masuk && !keluar) return '<div class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Tidak ada permintaan pertemanan.</div>';
    return (masuk ? `<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Masuk</p><div class="rounded-2xl border border-slate-100 divide-y divide-slate-100">${masuk}</div>` : '')
        + (keluar ? `<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Terkirim</p><div class="rounded-2xl border border-slate-100 divide-y divide-slate-100">${keluar}</div>` : '');
}

function sosialFormCari() {
    const h = SO.hasil;
    const tombol = u => ({
        none: `<button type="button" onclick="sosialKirim('${u.id}')" class="text-xs font-bold bg-primary-600 text-white rounded-lg px-3 py-1.5">Tambah</button>`,
        terkirim: '<span class="text-xs font-semibold text-slate-400">Menunggu</span>',
        masuk: `<button type="button" onclick="sosialBalas('${u.id}', true)" class="text-xs font-bold bg-primary-600 text-white rounded-lg px-3 py-1.5">Terima</button>`,
        teman: '<span class="text-xs font-semibold text-emerald-600">Teman</span>'
    })[u.hubungan] || '';
    const list = h === null ? '' : (h.length ? `<div class="rounded-2xl border border-slate-100 divide-y divide-slate-100">${h.map(u => `<div class="flex items-center gap-3 px-4 py-3">${soAvatar(u.nama, true)}<span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-slate-800 truncate">${escapeHtml(u.nama)}</span><span class="block text-xs text-slate-400 truncate">@${escapeHtml(u.username)}</span></span>${tombol(u)}</div>`).join('')}</div>` : '<p class="text-sm text-slate-400 text-center py-4">Tidak ada akun dengan username itu.</p>');
    return `<form onsubmit="sosialCari(event)" class="flex gap-2">
        <input type="text" id="so-q" maxlength="21" autocapitalize="none" spellcheck="false" placeholder="Cari username (min. 3 huruf)" value="${escapeHtml(SO.q)}" class="flex-1 bg-slate-50 border border-slate-200 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <button type="submit" class="px-4 rounded-xl bg-primary-600 text-white font-semibold text-sm">Cari</button></form>${list}`;
}

// ---------- aksi ----------
const SO_PESAN = { kata_kunci_pendek: 'Ketik minimal 3 karakter username (huruf kecil, angka, _).', terlalu_banyak: 'Terlalu banyak permintaan menunggu.', tidak_login: 'Sesi kamu sudah habis. Silakan login ulang.', bukan_teman: 'Kalian belum berteman.', terlalu_cepat: 'Terlalu cepat. Tunggu sebentar.', terlalu_panjang: 'Pesan maksimal 500 karakter.' };
async function soAksi(fn) { SO.galat = ''; try { await fn(); } catch (e) { console.error(e); SO.galat = SO_PESAN[e.kode] || 'Gagal. Periksa koneksi internet kamu.'; } await sosialMuatDaftar(); sosialRender(); }

async function sosialCari(e) {
    e.preventDefault();
    SO.q = document.getElementById('so-q').value.trim().toLowerCase();
    SO.galat = '';
    try { SO.hasil = (await soRpc('cari_teman', { p_q: SO.q })).hasil; } catch (err) { SO.hasil = null; SO.galat = SO_PESAN[err.kode] || 'Gagal mencari. Coba lagi.'; }
    sosialRender();
}
async function sosialCariUlang() { if (SO.q) { try { SO.hasil = (await soRpc('cari_teman', { p_q: SO.q })).hasil; } catch (e) { /* abaikan */ } } }
function sosialKirim(id) { soAksi(async () => { await soRpc('teman_kirim', { p_id: id }); await sosialCariUlang(); }); }
function sosialBalas(id, terima) { soAksi(async () => { await soRpc('teman_balas', { p_id: id, p_terima: terima }); await sosialCariUlang(); }); }
function sosialHapus(id) { soAksi(async () => { await soRpc('teman_hapus', { p_id: id }); await sosialCariUlang(); }); }

// ---------- chat ----------
function sosialBukaChat(id) {
    const t = SO.daftar && SO.daftar.teman.find(x => x.id === id);
    if (!t) return;
    SO.chat = { id, nama: t.nama, username: t.username, pesan: [], last: 0 };
    document.body.classList.add('game-berjalan');   // sembunyikan navigasi bawah selama chat
    sosialRender();
    sosialAmbilPesan(true);
}
function sosialTutupChat() {
    SO.chat = null;
    document.body.classList.remove('game-berjalan');
    sosialMuatDaftar().then(sosialRender);
    sosialRender();
}
async function sosialAmbilPesan(paksa) {
    const c = SO.chat; if (!c) return;
    try {
        const d = await soRpc('pesan_ambil', { p_id: c.id, p_setelah: c.last });
        if (SO.chat !== c) return;
        if (d.pesan.length) {
            c.pesan.push(...d.pesan); c.last = d.pesan[d.pesan.length - 1].id;
            sosialIsiPesan(true);
        } else if (paksa) sosialIsiPesan(true);
    } catch (e) { if (e.kode === 'bukan_teman') sosialTutupChat(); }
}
function sosialIsiPesan(gulir) {
    const el = document.getElementById('so-msgs'); if (!el || !SO.chat) return;
    el.innerHTML = SO.chat.pesan.length ? SO.chat.pesan.map(m => `<div class="flex ${m.saya ? 'justify-end' : 'justify-start'}"><div class="max-w-[80%] rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap ${m.saya ? 'bg-primary-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}">${escapeHtml(m.isi)}<span class="block text-[10px] mt-0.5 ${m.saya ? 'text-primary-100' : 'text-slate-400'} text-right">${soJam(m.dibuat)}</span></div></div>`).join('')
        : '<p class="text-center text-sm text-slate-400 py-8">Belum ada pesan. Sapa temanmu!</p>';
    if (gulir) el.scrollTop = el.scrollHeight;
}
function sosialRenderChat(root) {
    const c = SO.chat;
    root.innerHTML = `<div class="flex flex-col max-w-md mx-auto bg-white rounded-2xl border border-slate-100 overflow-hidden" style="height:calc(100dvh - 9rem)">
        <div class="flex items-center gap-3 px-3 py-2.5 border-b border-slate-100">
            <button type="button" onclick="sosialTutupChat()" class="p-1.5 text-slate-500" aria-label="Kembali"><i data-lucide="arrow-left" class="w-5 h-5"></i></button>
            ${soAvatar(c.nama, true)}
            <span class="flex-1 min-w-0"><span class="block text-sm font-bold text-slate-800 truncate">${escapeHtml(c.nama)}</span><span class="block text-xs text-slate-400 truncate">@${escapeHtml(c.username)}</span></span>
            <button type="button" onclick="sosialLepas('${c.id}')" class="p-1.5 text-slate-400 hover:text-rose-600" aria-label="Hapus teman"><i data-lucide="user-minus" class="w-5 h-5"></i></button>
        </div>
        <div id="so-msgs" class="flex-1 overflow-y-auto p-3 space-y-2"></div>
        <form onsubmit="sosialKirimPesan(event)" class="flex gap-2 p-2.5 border-t border-slate-100" style="padding-bottom:calc(.625rem + env(safe-area-inset-bottom,0px))">
            <input type="text" id="so-isi" maxlength="500" autocomplete="off" placeholder="Tulis pesan..." class="flex-1 bg-slate-50 border border-slate-200 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <button type="submit" id="so-btn" class="px-4 rounded-xl bg-primary-600 disabled:opacity-60 text-white" aria-label="Kirim"><i data-lucide="send" class="w-4 h-4"></i></button>
        </form></div>`;
    lucide.createIcons();
    sosialIsiPesan(true);
}
async function sosialKirimPesan(e) {
    e.preventDefault();
    const c = SO.chat, inp = document.getElementById('so-isi');
    if (!c || SO.kirim || !inp.value.trim()) return;
    SO.kirim = true;
    const teks = inp.value;
    try {
        await soRpc('pesan_kirim', { p_id: c.id, p_isi: teks });
        inp.value = '';
        await sosialAmbilPesan();
    } catch (err) { console.error(err); if (typeof utbkToast === 'function') utbkToast(SO_PESAN[err.kode] || 'Pesan gagal dikirim'); }
    finally { SO.kirim = false; if (inp) inp.focus(); }
}
async function sosialLepas(id) {
    if (!confirm('Hapus teman ini? Riwayat chat kalian juga akan dihapus.')) return;
    try { await soRpc('teman_hapus', { p_id: id }); } catch (e) { return; }
    sosialTutupChat();
}
