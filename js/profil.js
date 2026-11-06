// ====================================================================
// HALAMAN PROFIL: identitas, level & poin Mini Games, ganti PIN, keluar, versi aplikasi
// ====================================================================
async function openProfilPage() {
    if (!activeUser) return;
    showDashPage('profil');
    profilRender();
    if (activeUser.role !== 'wali_kelas' && typeof mgMuatRingkas === 'function') {
        await mgMuatRingkas();
        profilRender();
    }
}

function profilRender() {
    const root = document.getElementById('profil-root');
    if (!root || !activeUser) return;
    const wali = activeUser.role === 'wali_kelas';
    const inisial = escapeHtml(String(activeUser.nama).substring(0, 2).toUpperCase());
    const kelas = wali ? '' : getKelasLabel(getKelasKey(activeUser));

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
                <span class="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">${escapeHtml(getReadableRole(activeUser.role))}</span>
                ${kelas ? `<span class="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">${escapeHtml(kelas)}</span>` : ''}
            </div>
        </div>
        ${statistik}
        <div class="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            <button type="button" onclick="openChangePinModal()" class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition">
                <span class="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><i data-lucide="key-round" class="w-5 h-5"></i></span>
                <span class="flex-1"><span class="block text-sm font-semibold text-slate-800">Ganti PIN</span><span class="block text-xs text-slate-400">Disarankan jika masih memakai PIN awal</span></span>
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
