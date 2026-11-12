// ====================================================================
// KARTU "AKUN" DI PROFIL (khusus Akun Umum): edit nama lengkap & username
// Fungsi database: akun_saya(), ubah_akun_umum(p_nama, p_username)
// ====================================================================
const akunState = { dimuat: false, galatMuat: false, username: '', mengedit: false, menyimpan: false, draft: null, galat: '' };

function akunReset() {
    Object.assign(akunState, { dimuat: false, galatMuat: false, username: '', mengedit: false, menyimpan: false, draft: null, galat: '' });
}

async function akunMuat() {
    try {
        const { data, error } = await supabaseClient.rpc('akun_saya');
        if (error) throw error;
        if (!data || data.error) throw new Error((data && data.error) || 'kosong');
        akunState.username = data.username || '';
        akunState.galatMuat = false;
    } catch (err) {
        console.error('Gagal memuat akun:', err);
        akunState.galatMuat = true;
    }
    akunState.dimuat = true;
}

function akunMulaiEdit() {
    akunState.draft = { nama: activeUser.nama, username: akunState.username };
    akunState.mengedit = true;
    akunState.galat = '';
    profilRender();
    const el = document.getElementById('akun-input-nama');
    if (el) el.focus();
}
function akunBatalEdit() {
    akunState.mengedit = false;
    akunState.draft = null;
    akunState.galat = '';
    profilRender();
}
function akunIsiDraft(kunci, nilai) { if (akunState.draft) akunState.draft[kunci] = nilai; }

async function akunSimpan(e) {
    if (e) e.preventDefault();
    if (!akunState.draft || akunState.menyimpan) return;
    const nama = String(akunState.draft.nama || '').replace(/\s+/g, ' ').trim();
    const username = String(akunState.draft.username || '').trim().toLowerCase();

    if (!/^[A-Za-zÀ-ÿ0-9 .'-]{2,30}$/.test(nama)) { akunState.galat = 'Nama 2-30 karakter (huruf, angka, spasi, titik, apostrof, atau strip).'; return profilRender(); }
    if (!/^[a-z0-9_]{4,20}$/.test(username)) { akunState.galat = 'Username 4-20 karakter: huruf kecil, angka, atau garis bawah (_).'; return profilRender(); }
    if (nama === activeUser.nama && username === akunState.username) return akunBatalEdit();

    akunState.menyimpan = true;
    akunState.galat = '';
    profilRender();
    try {
        const { data, error } = await supabaseClient.rpc('ubah_akun_umum', { p_nama: nama, p_username: username });
        if (error) throw error;
        if (!data || !data.ok) {
            const pesan = {
                tidak_login: 'Sesi kamu sudah habis. Silakan login ulang.',
                bukan_akun_umum: 'Hanya akun Umum yang bisa diubah dari sini.',
                nama_tidak_valid: 'Nama tidak valid. Pakai 2-30 karakter.',
                username_tidak_valid: 'Username 4-20 karakter: huruf kecil, angka, atau garis bawah (_).',
                username_dipakai: 'Username itu sudah dipakai. Coba username lain.',
                terlalu_sering: 'Terlalu sering mengubah. Coba lagi beberapa menit lagi.'
            };
            akunState.galat = pesan[data && data.error] || 'Gagal menyimpan. Coba lagi.';
        } else {
            activeUser.nama = nama;
            akunState.username = username;
            akunState.mengedit = false;
            akunState.draft = null;
            // Perbarui tampilan header
            const n = document.getElementById('user-display-name'); if (n) n.innerText = nama;
            const bn = document.getElementById('umum-banner-nama'); if (bn) bn.textContent = nama;
            const a = document.getElementById('user-avatar-text'); if (a) a.innerText = nama.substring(0, 2).toUpperCase();
            if (typeof utbkToast === 'function') utbkToast('Akun disimpan');
        }
    } catch (err) {
        console.error('Gagal menyimpan akun:', err);
        akunState.galat = 'Gagal menyimpan. Periksa koneksi internet kamu.';
    } finally {
        akunState.menyimpan = false;
        profilRender();
    }
}

function akunKartu() {
    if (!isAkunUmum()) return '';
    const judul = (tombol) => `<div class="flex items-center justify-between mb-3"><h4 class="font-bold text-slate-800">Pengaturan akun</h4>${tombol}</div>`;
    if (!akunState.dimuat) {
        return `<div class="rounded-2xl border border-slate-100 p-4">${judul('')}<p class="text-sm text-slate-400 flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memuat...</p></div>`;
    }
    if (akunState.galatMuat) {
        return `<div class="rounded-2xl border border-slate-100 p-4">${judul('')}<p class="text-sm text-rose-600">Pengaturan akun belum bisa dimuat. Buka Profil lagi nanti.</p></div>`;
    }
    const cls = 'w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
    if (akunState.mengedit) {
        const off = akunState.menyimpan ? 'disabled' : '';
        return `<form onsubmit="akunSimpan(event)" class="rounded-2xl border border-slate-100 p-4">
            ${judul('')}
            <div class="space-y-3">
                <div><label for="akun-input-nama" class="block text-xs font-semibold text-slate-500 mb-1.5">Nama lengkap</label>
                    <input type="text" id="akun-input-nama" maxlength="30" autocomplete="name" value="${escapeHtml(akunState.draft.nama)}" oninput="akunIsiDraft('nama', this.value)" ${off} class="${cls}"></div>
                <div><label for="akun-input-username" class="block text-xs font-semibold text-slate-500 mb-1.5">Username</label>
                    <input type="text" id="akun-input-username" maxlength="20" autocapitalize="none" spellcheck="false" autocomplete="username" value="${escapeHtml(akunState.draft.username)}" oninput="akunIsiDraft('username', this.value)" ${off} class="${cls}">
                    <p class="text-[11px] text-slate-400 mt-1">4-20 karakter: huruf kecil, angka, atau garis bawah (_).</p></div>
            </div>
            ${akunState.galat ? `<p class="mt-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">${escapeHtml(akunState.galat)}</p>` : ''}
            <div class="flex gap-2 mt-4">
                <button type="button" onclick="akunBatalEdit()" ${off} class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">Batal</button>
                <button type="submit" ${off} class="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm transition">${akunState.menyimpan ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
        </form>`;
    }
    const baris = (ikon, label, nilai) => `<div class="flex items-center gap-3">
        <span class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><i data-lucide="${ikon}" class="w-4.5 h-4.5"></i></span>
        <div class="min-w-0"><p class="text-xs text-slate-400">${label}</p><p class="text-sm font-semibold text-slate-800 break-words">${escapeHtml(nilai)}</p></div></div>`;
    let isi = baris('user', 'Nama lengkap', activeUser.nama) + baris('at-sign', 'Username', '@' + akunState.username);
    const tombolEdit = `<button type="button" onclick="akunMulaiEdit()" class="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"><i data-lucide="pencil" class="w-4 h-4"></i> Edit</button>`;
    return `<div class="rounded-2xl border border-slate-100 p-4">${judul(tombolEdit)}<div class="space-y-3">${isi}</div></div>`;
}
