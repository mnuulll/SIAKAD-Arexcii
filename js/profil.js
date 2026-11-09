// ====================================================================
// HALAMAN PROFIL: identitas, level & poin Mini Games, ganti PIN, keluar, versi aplikasi
// ====================================================================
// Data profil yang bisa diedit (asal sekolah, universitas & jurusan tujuan) — tabel profil_siswa
const profilData = { dimuat: false, galatMuat: false, nilai: { asal_sekolah: '', universitas_tujuan: '', jurusan_tujuan: '' }, mengedit: false, menyimpan: false, draft: null, galat: '' };
const PROFIL_BIDANG = [
    { kunci: 'asal_sekolah', label: 'Asal sekolah', ikon: 'school', contoh: 'Contoh: SMAN 1 Arjawinangun' },
    { kunci: 'universitas_tujuan', label: 'Universitas tujuan', ikon: 'building-2', contoh: 'Contoh: Universitas Indonesia' },
    { kunci: 'jurusan_tujuan', label: 'Jurusan tujuan', ikon: 'book-open', contoh: 'Contoh: Teknik Informatika' }
];

// Data tambahan profil (kehadiran bulan ini & saldo tabungan pribadi)
const profilExtra = { dimuat: false, absen: null, tabungan: null };

function profilReset() {
    Object.assign(profilExtra, { dimuat: false, absen: null, tabungan: null });
    Object.assign(profilData, { dimuat: false, galatMuat: false, nilai: { asal_sekolah: '', universitas_tujuan: '', jurusan_tujuan: '' }, mengedit: false, menyimpan: false, draft: null, galat: '' });
    const root = document.getElementById('profil-root');
    if (root) root.innerHTML = '';
}

async function profilMuat() {
    try {
        const { data, error } = await supabaseClient.rpc('profil_saya');
        if (error) throw error;
        const d = data || {};
        profilData.nilai = {
            asal_sekolah: d.asal_sekolah || '',
            universitas_tujuan: d.universitas_tujuan || '',
            jurusan_tujuan: d.jurusan_tujuan || ''
        };
        profilData.galatMuat = false;
    } catch (err) {
        console.error('Gagal memuat profil:', err);
        profilData.galatMuat = true;
    }
    profilData.dimuat = true;
}

async function profilMuatExtra() {
    profilExtra.absen = null; profilExtra.tabungan = null;
    const bulan = wibBulanIni();
    try {
        const { data, error } = await supabaseClient.from('absensi').select('tanggal, status').eq('siswa_id', activeUser.id);
        if (error) throw error;
        const hit = { Hadir: 0, Ijin: 0, Sakit: 0, Dispen: 0, Alpha: 0 };
        (data || []).filter(a => String(a.tanggal).startsWith(bulan)).forEach(a => { if (hit[a.status] !== undefined) hit[a.status]++; });
        profilExtra.absen = hit;
    } catch (err) { console.error('Gagal memuat kehadiran profil:', err); }
    try {
        const tabel = { villa: 'tabungan_villa', yearbook: 'tabungan_yearbook', kas: 'tabungan_kas' };
        const hasil = {};
        await Promise.all(Object.entries(tabel).map(async ([k, nama]) => {
            const { data, error } = await supabaseClient.from(nama).select('nominal, jenis').eq('siswa_id', activeUser.id);
            if (error) throw error;
            hasil[k] = (data || []).reduce((n, t) => n + (t.jenis === 'setor' ? t.nominal : -t.nominal), 0);
        }));
        profilExtra.tabungan = hasil;
    } catch (err) { console.error('Gagal memuat tabungan profil:', err); }
    profilExtra.dimuat = true;
}

async function openProfilPage() {
    if (!activeUser) return;
    showDashPage('profil');
    profilRender();
    const tugas = [];
    if (activeUser.role !== 'wali_kelas') {
        tugas.push(profilMuat());
        if (typeof mgMuatRingkas === 'function') tugas.push(mgMuatRingkas());
        if (!isAkunUmum()) tugas.push(profilMuatExtra());
        if (typeof utbkIsEligible === 'function' && utbkIsEligible() && !utbkState.loaded) tugas.push(utbkLoadData());
    }
    await Promise.all(tugas);
    profilRender();
}

function profilMulaiEdit() {
    profilData.draft = { ...profilData.nilai };
    profilData.mengedit = true;
    profilData.galat = '';
    profilRender();
    const pertama = document.getElementById('profil-input-asal_sekolah');
    if (pertama) pertama.focus();
}
function profilBatalEdit() {
    profilData.mengedit = false;
    profilData.draft = null;
    profilData.galat = '';
    profilRender();
}
function profilIsiDraft(kunci, nilai) {
    if (profilData.draft) profilData.draft[kunci] = nilai;
}

async function profilSimpan(e) {
    if (e) e.preventDefault();
    if (!profilData.draft || profilData.menyimpan) return;
    const d = profilData.draft;
    const bersih = k => String(d[k] || '').replace(/\s+/g, ' ').trim();
    const baru = { asal_sekolah: bersih('asal_sekolah'), universitas_tujuan: bersih('universitas_tujuan'), jurusan_tujuan: bersih('jurusan_tujuan') };
    if (Object.values(baru).some(v => v.length > 80)) {
        profilData.galat = 'Setiap isian maksimal 80 karakter.';
        return profilRender();
    }
    profilData.menyimpan = true;
    profilData.galat = '';
    profilRender();
    try {
        const { data, error } = await supabaseClient.rpc('simpan_profil', {
            p_sekolah: baru.asal_sekolah, p_univ: baru.universitas_tujuan, p_jurusan: baru.jurusan_tujuan
        });
        if (error) throw error;
        if (!data || !data.ok) {
            const pesan = { tidak_login: 'Sesi kamu sudah habis. Silakan login ulang.', terlalu_panjang: 'Setiap isian maksimal 80 karakter.' };
            profilData.galat = pesan[data && data.error] || 'Gagal menyimpan profil. Coba lagi.';
        } else {
            profilData.nilai = baru;
            profilData.mengedit = false;
            profilData.draft = null;
            if (typeof utbkToast === 'function') utbkToast('Profil disimpan');
        }
    } catch (err) {
        console.error('Gagal menyimpan profil:', err);
        profilData.galat = 'Gagal menyimpan profil. Periksa koneksi internet kamu.';
    } finally {
        profilData.menyimpan = false;
        profilRender();
    }
}

// Kartu "Data diri": asal sekolah, universitas tujuan, jurusan tujuan
function profilKartuData() {
    const judul = (tombol) => `<div class="flex items-center justify-between mb-3"><h4 class="font-bold text-slate-800">Data diri</h4>${tombol}</div>`;

    if (!profilData.dimuat) {
        return `<div class="rounded-2xl border border-slate-100 p-4">${judul('')}<p class="text-sm text-slate-400 flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memuat...</p></div>`;
    }
    if (profilData.mengedit) {
        const input = b => `
            <div>
                <label for="profil-input-${b.kunci}" class="block text-xs font-semibold text-slate-500 mb-1.5">${b.label}</label>
                <input type="text" id="profil-input-${b.kunci}" maxlength="80" placeholder="${escapeHtml(b.contoh)}" value="${escapeHtml(profilData.draft[b.kunci])}"
                    oninput="profilIsiDraft('${b.kunci}', this.value)" ${profilData.menyimpan ? 'disabled' : ''}
                    class="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            </div>`;
        return `
        <form onsubmit="profilSimpan(event)" class="rounded-2xl border border-slate-100 p-4">
            ${judul('')}
            <div class="space-y-3">${PROFIL_BIDANG.map(input).join('')}</div>
            ${profilData.galat ? `<p class="mt-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">${escapeHtml(profilData.galat)}</p>` : ''}
            <div class="flex gap-2 mt-4">
                <button type="button" onclick="profilBatalEdit()" ${profilData.menyimpan ? 'disabled' : ''} class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">Batal</button>
                <button type="submit" ${profilData.menyimpan ? 'disabled' : ''} class="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm transition">${profilData.menyimpan ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
        </form>`;
    }
    const baris = b => {
        const v = profilData.nilai[b.kunci];
        return `<div class="flex items-start gap-3">
            <span class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><i data-lucide="${b.ikon}" class="w-4.5 h-4.5"></i></span>
            <div class="min-w-0"><p class="text-xs text-slate-400">${b.label}</p>
                <p class="text-sm font-semibold ${v ? 'text-slate-800' : 'text-slate-300'} break-words">${v ? escapeHtml(v) : 'Belum diisi'}</p></div>
        </div>`;
    };
    const tombolEdit = `<button type="button" onclick="profilMulaiEdit()" class="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"><i data-lucide="pencil" class="w-4 h-4"></i> Edit</button>`;
    return `<div class="rounded-2xl border border-slate-100 p-4">
        ${judul(profilData.galatMuat ? '' : tombolEdit)}
        ${profilData.galatMuat ? '<p class="text-sm text-rose-600">Data diri belum bisa dimuat. Buka Profil lagi nanti.</p>' : `<div class="space-y-3.5">${PROFIL_BIDANG.map(baris).join('')}</div>`}
    </div>`;
}

// Kartu "Info akun": peran, kelas, jenis akun, kelengkapan data diri
function profilKartuAkun() {
    const umum = isAkunUmum();
    const wali = activeUser.role === 'wali_kelas';
    const baris = (ikon, label, nilai) => `<div class="flex items-center gap-3">
        <span class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><i data-lucide="${ikon}" class="w-4.5 h-4.5"></i></span>
        <div class="min-w-0"><p class="text-xs text-slate-400">${label}</p><p class="text-sm font-semibold text-slate-800 break-words">${escapeHtml(nilai)}</p></div></div>`;
    let isi = baris('badge-check', 'Peran', getRoleLabelUser(activeUser))
        + baris('shield', 'Jenis akun', umum ? 'Akun Umum' : 'Akun Arexcii');
    if (!umum && !wali) isi += baris('users', 'Kelas', getKelasLabel(getKelasKey(activeUser)));
    let lengkap = '';
    if (!wali && profilData.dimuat && !profilData.galatMuat) {
        const terisi = PROFIL_BIDANG.filter(b => profilData.nilai[b.kunci]).length;
        const pct = Math.round(terisi / PROFIL_BIDANG.length * 100);
        lengkap = `<div class="mt-4 pt-3 border-t border-slate-100">
            <div class="flex items-center justify-between text-xs mb-1.5"><span class="font-semibold text-slate-500">Kelengkapan data diri</span><span class="font-bold ${pct === 100 ? 'text-emerald-600' : 'text-slate-700'}">${terisi}/${PROFIL_BIDANG.length}</span></div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-primary-600'}" style="width:${pct}%"></div></div>
            ${pct < 100 ? '<p class="text-xs text-slate-400 mt-1.5">Lengkapi asal sekolah, universitas, dan jurusan tujuan di kartu Data diri.</p>' : ''}
        </div>`;
    }
    return `<div class="rounded-2xl border border-slate-100 p-4">
        <h4 class="font-bold text-slate-800 mb-3">Info akun</h4>
        <div class="space-y-3">${isi}</div>${lengkap}
    </div>`;
}

// Kartu "Kehadiran bulan ini": hitungan H/I/S/D/A + persentase hadir (akun Arexcii non wali kelas)
function profilKartuKehadiran() {
    if (isAkunUmum() || activeUser.role === 'wali_kelas') return '';
    const bulan = fmtTgl(new Date(), { month: 'long', year: 'numeric' });
    const judul = `<h4 class="font-bold text-slate-800">Kehadiran</h4><span class="text-xs text-slate-400">${escapeHtml(bulan)}</span>`;
    if (!profilExtra.dimuat) {
        return `<div class="rounded-2xl border border-slate-100 p-4"><div class="flex items-center justify-between mb-3">${judul}</div><p class="text-sm text-slate-400 flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memuat...</p></div>`;
    }
    if (!profilExtra.absen) {
        return `<div class="rounded-2xl border border-slate-100 p-4"><div class="flex items-center justify-between mb-3">${judul}</div><p class="text-sm text-rose-600">Data kehadiran belum bisa dimuat.</p></div>`;
    }
    const a = profilExtra.absen;
    const total = Object.values(a).reduce((x, y) => x + y, 0);
    const pct = total ? Math.round(a.Hadir / total * 100) : 0;
    const tile = (label, n, warna) => `<div class="rounded-xl bg-slate-50/70 border border-slate-100 py-2.5 text-center"><p class="text-lg font-bold ${warna} tabular-nums">${n}</p><p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">${label}</p></div>`;
    return `<div class="rounded-2xl border border-slate-100 p-4">
        <div class="flex items-center justify-between mb-3">${judul}</div>
        <div class="grid grid-cols-5 gap-2">
            ${tile('Hadir', a.Hadir, 'text-emerald-600')}${tile('Ijin', a.Ijin, 'text-yellow-600')}${tile('Sakit', a.Sakit, 'text-sky-600')}${tile('Dispen', a.Dispen, 'text-purple-600')}${tile('Alpha', a.Alpha, 'text-rose-600')}
        </div>
        <p class="text-xs text-slate-400 mt-3">${total ? `Kehadiran ${pct}% dari ${total} hari tercatat bulan ini.` : 'Belum ada absensi tercatat bulan ini.'}</p>
    </div>`;
}

// Kartu "Tabungan saya": saldo Villa, Yearbook, Kas (tabungan reguler dilihat di aplikasi AIO Neges)
function profilKartuTabungan() {
    if (isAkunUmum() || activeUser.role === 'wali_kelas') return '';
    const judul = '<h4 class="font-bold text-slate-800 mb-3">Tabungan saya</h4>';
    if (!profilExtra.dimuat) {
        return `<div class="rounded-2xl border border-slate-100 p-4">${judul}<p class="text-sm text-slate-400 flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memuat...</p></div>`;
    }
    if (!profilExtra.tabungan) {
        return `<div class="rounded-2xl border border-slate-100 p-4">${judul}<p class="text-sm text-rose-600">Data tabungan belum bisa dimuat.</p></div>`;
    }
    const t = profilExtra.tabungan;
    const baris = (ikon, warna, label, nilai) => `<div class="flex items-center justify-between gap-3">
        <span class="flex items-center gap-2.5 text-sm font-semibold text-slate-600"><span class="w-8 h-8 rounded-lg ${warna} flex items-center justify-center"><i data-lucide="${ikon}" class="w-4 h-4"></i></span>${label}</span>
        <span class="text-sm font-bold text-slate-800 tabular-nums">${formatRupiah(nilai)}</span></div>`;
    return `<div class="rounded-2xl border border-slate-100 p-4">
        ${judul}
        <div class="space-y-3">
            ${baris('palmtree', 'bg-amber-50 text-amber-600', 'Villa', t.villa)}
            ${baris('book-image', 'bg-purple-50 text-purple-600', 'Yearbook', t.yearbook)}
            ${baris('wallet', 'bg-emerald-50 text-emerald-600', 'Kas', t.kas)}
        </div>
        <button type="button" onclick="openTabunganInfo()" class="mt-3 text-sm font-semibold text-primary-700 hover:underline">Lihat detail &amp; log tabungan</button>
    </div>`;
}

// Kartu "UTBK": hitung mundur & ringkas try out (hanya akun kelas UTBK)
function profilKartuUtbk() {
    if (typeof utbkIsEligible !== 'function' || !utbkIsEligible()) return '';
    const judul = `<div class="flex items-center justify-between mb-3"><h4 class="font-bold text-slate-800">UTBK</h4>
        <button type="button" onclick="openUtbkPage()" class="text-sm font-semibold text-primary-700 hover:underline">Buka UTBK Corner</button></div>`;
    if (!utbkState.loaded) {
        return `<div class="rounded-2xl border border-slate-100 p-4">${judul}<p class="text-sm text-slate-400 flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memuat...</p></div>`;
    }
    const hari = utbkHariMenujuUjian();
    const avgs = utbkState.tryouts.map(utbkAvgTO).filter(v => v !== null);
    const tile = (label, nilai) => `<div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center"><p class="text-[11px] text-slate-500">${label}</p><p class="text-lg font-bold text-slate-800 mt-0.5 tabular-nums">${nilai}</p></div>`;
    return `<div class="rounded-2xl border border-slate-100 p-4">${judul}
        <div class="grid grid-cols-3 gap-3">
            ${tile('Hari menuju UTBK', hari > 0 ? hari : '-')}
            ${tile('Try out', utbkState.tryouts.length)}
            ${tile('Rata-rata terakhir', utbkFmt(avgs.length ? avgs[avgs.length - 1] : null))}
        </div>
    </div>`;
}

function profilRender() {
    const root = document.getElementById('profil-root');
    if (!root || !activeUser) return;
    const wali = activeUser.role === 'wali_kelas';
    const inisial = escapeHtml(String(activeUser.nama).substring(0, 2).toUpperCase());
    const umum = isAkunUmum();
    const kelas = (wali || umum) ? '' : getKelasLabel(getKelasKey(activeUser));

    let statistik = '';
    if (!wali) {
        const seumur = mg.ringkas && mg.ringkas.semua ? Number(mg.ringkas.semua.poin_seumur) : 0;
        const minggu = mg.ringkas && mg.ringkas.minggu;
        const lv = mgLevel(seumur);
        const pct = lv.berikut ? Math.min(100, Math.round((seumur - lv.min) / (lv.berikut.min - lv.min) * 100)) : 100;
        const tile = (label, nilai) => `<div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-center"><p class="text-xs text-slate-500">${label}</p><p class="text-lg font-bold text-slate-800 mt-0.5 tabular-nums">${nilai}</p></div>`;
        statistik = `
        <div class="rounded-2xl border border-slate-100 p-4">
            <div class="flex items-center justify-between mb-3"><h4 class="font-bold text-slate-800">Mini Games</h4>
                <button type="button" onclick="openMiniGames()" class="text-sm font-semibold text-primary-700 hover:underline">Main sekarang</button></div>
            <div class="grid grid-cols-3 gap-3">
                ${tile('Level', mg.ringkas ? lv.nama : '...')}
                ${tile('Total poin', mg.ringkas ? mgFmtAngka(seumur) : '...')}
                ${tile('Peringkat minggu ini', minggu ? '#' + minggu.rk : '-')}
            </div>
            <div class="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full bg-primary-600" style="width:${pct}%"></div></div>
            <p class="text-xs text-slate-400 mt-1.5">${lv.berikut ? `${mgFmtAngka(lv.berikut.min - seumur)} poin lagi menuju ${lv.berikut.nama}.` : 'Level tertinggi.'}</p>
        </div>`;
    }

    root.innerHTML = `
    <div class="flex flex-col gap-4 max-w-md mx-auto">
        <div class="flex flex-col items-center text-center pt-2">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg ring-4 ring-white">${inisial}</div>
            <h4 class="mt-3 text-xl font-bold text-slate-800">${escapeHtml(activeUser.nama)}</h4>
            <div class="mt-1 flex flex-wrap items-center justify-center gap-2">
                <span class="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">${escapeHtml(getRoleLabelUser(activeUser))}</span>
                ${kelas ? `<span class="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">${escapeHtml(kelas)}</span>` : ''}
            </div>
        </div>
        ${wali ? '' : profilKartuData()}
        ${profilKartuAkun()}
        ${profilKartuKehadiran()}
        ${profilKartuTabungan()}
        ${profilKartuUtbk()}
        ${statistik}
        <div class="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            <button type="button" onclick="openChangePinModal()" class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition">
                <span class="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><i data-lucide="key-round" class="w-5 h-5"></i></span>
                <span class="flex-1"><span class="block text-sm font-semibold text-slate-800">${umum ? 'Ganti Kata Sandi' : 'Ganti PIN'}</span><span class="block text-xs text-slate-400">${umum ? 'Ubah kata sandi akun kamu' : 'Disarankan jika masih memakai PIN awal'}</span></span>
                <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300"></i>
            </button>
            <button type="button" onclick="profilMuatUlang()" class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition">
                <span class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><i data-lucide="refresh-cw" class="w-5 h-5"></i></span>
                <span class="flex-1"><span class="block text-sm font-semibold text-slate-800">Perbarui aplikasi</span><span class="block text-xs text-slate-400">Muat ulang jika ada tampilan yang tidak sesuai</span></span>
                <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300"></i>
            </button>
            <button type="button" onclick="handleLogout()" class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-rose-50 transition">
                <span class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><i data-lucide="log-out" class="w-5 h-5"></i></span>
                <span class="flex-1"><span class="block text-sm font-semibold text-rose-600">Keluar</span></span>
            </button>
            ${umum ? `<button type="button" onclick="openHapusAkunModal()" class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-rose-50 transition">
                <span class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><i data-lucide="trash-2" class="w-5 h-5"></i></span>
                <span class="flex-1"><span class="block text-sm font-semibold text-rose-600">Hapus Akun</span><span class="block text-xs text-slate-400">Hapus akun dan semua datanya secara permanen</span></span>
            </button>` : ''}
        </div>
        <p class="text-center text-xs text-slate-400">Versi aplikasi ${escapeHtml(APP_VERSI)}</p>
    </div>`;
    lucide.createIcons();
}

// Menghapus salinan lama yang tersimpan di perangkat lalu memuat ulang
async function profilMuatUlang() {
    try {
        if ('caches' in window) {
            const nama = await caches.keys();
            await Promise.all(nama.filter(n => n.startsWith('siakad-')).map(n => caches.delete(n)));
        }
    } catch (e) { /* abaikan */ }
    location.reload();
}
