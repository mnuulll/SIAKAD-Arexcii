// ====================================================================
// AUTH & INISIALISASI
// Login memakai fungsi database login_siswa (PIN diperiksa di server, bukan di browser).
// Browser hanya menyimpan token sesi acak; semua request membawa token itu lewat
// header "x-session-token", yang dipakai policy RLS untuk mengenali siapa pengguna.
//
// Ada dua jenis akun (kolom siswa.jenis di Supabase):
//   - 'arexcii' : siswa kelas, login pilih nama + PIN (login_siswa).
//   - 'umum'    : akun UTBK umum, daftar sendiri (daftar_umum) lalu login dengan
//                 username + kata sandi (login_umum). Tabelnya: akun_umum.
// ====================================================================

const SESSION_TOKEN_KEY = 'siswa_token';

// Global state
let supabaseClient = null;
let activeUser = null;
let siswaListGlobal = [];

function getSessionToken() {
    try { return localStorage.getItem(SESSION_TOKEN_KEY); } catch (e) { return null; }
}
function setSessionToken(token) {
    try { localStorage.setItem(SESSION_TOKEN_KEY, token); } catch (e) { /* abaikan */ }
}
function clearSessionToken() {
    try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        // Sisa dari versi lama: menyimpan data siswa (termasuk PIN) di browser. Hapus.
        localStorage.removeItem('siswa_session');
    } catch (e) { /* abaikan */ }
}

// Inisialisasi Supabase SDK; setiap request otomatis membawa token sesi.
function initSupabase() {
    const warningEl = document.getElementById('config-warning');
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
            global: {
                fetch: (input, init = {}) => {
                    const headers = new Headers(init.headers || {});
                    const token = getSessionToken();
                    if (token) headers.set('x-session-token', token);
                    return fetch(input, { ...init, headers });
                }
            }
        });
        warningEl.style.display = 'none';
        return true;
    } catch (err) {
        console.error("Gagal menghubungkan ke Supabase SDK:", err);
        warningEl.innerHTML = `<span>Terjadi kesalahan: ${escapeHtml(err.message)}</span>`;
        warningEl.style.display = 'flex';
        return false;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();

    // Dibuka ulang/reload saat riwayat masih menyimpan 'halaman panel': bersihkan
    try { if (history.state && history.state.dashPage) history.replaceState(null, ''); } catch (e) { /* abaikan */ }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date-display').innerText = fmtTgl(new Date(), options);

    if (!initSupabase()) return;

    await fetchSiswaList();   // sebelum login: hanya id + nama (untuk dropdown login)
    await checkSession();     // jika token masih valid, langsung masuk dashboard
});

// Sebelum login  -> daftar nama saja (fungsi daftar_login).
// Setelah login  -> data siswa lengkap TANPA kolom pin (dibatasi RLS).
async function fetchSiswaList() {
    try {
        if (activeUser && activeUser.jenis === 'umum') {
            // Akun Umum tidak boleh melihat daftar siswa kelas (dibatasi RLS)
            siswaListGlobal = [];
            return;
        }
        if (activeUser) {
            const { data, error } = await supabaseClient
                .from('siswa')
                .select('id, nama, role, kelas_tipe')
                .order('nama', { ascending: true });
            if (error) throw error;
            siswaListGlobal = data;
            populateRoleDropdowns(data);
        } else {
            const { data, error } = await supabaseClient.rpc('daftar_login');
            if (error) throw error;
            siswaListGlobal = (data || []).map(s => ({
                id: s.id,
                nama: s.nama,
                role: s.is_wali ? 'wali_kelas' : 'anggota'
            }));
            populateLoginDropdown(siswaListGlobal);
        }
    } catch (err) {
        console.error("Gagal mengambil data siswa:", err);
        alert("Gagal memuat daftar siswa dari Supabase. Periksa koneksi internet kamu.");
    }
}

function togglePinVisibility() {
    const pinInput = document.getElementById('login-pin');
    const eyeIcon = document.getElementById('pin-eye-icon');
    if (pinInput.type === 'password') {
        pinInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        pinInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

async function handleLogin() {
    const siswaId = document.getElementById('login-siswa').value;
    const enteredPin = document.getElementById('login-pin').value;

    if (!siswaId) {
        alert("Silakan pilih nama siswa terlebih dahulu.");
        return;
    }
    if (!enteredPin) {
        alert("Silakan masukkan PIN login kamu.");
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('login_siswa', {
            p_siswa_id: siswaId,
            p_pin: enteredPin
        });
        if (error) throw error;

        if (data && data.error === 'terlalu_banyak_percobaan') {
            alert("Terlalu banyak percobaan login yang salah. Coba lagi dalam 10 menit.");
            return;
        }
        if (!data || data.error || !data.token) {
            alert("PIN yang Anda masukkan salah. Coba lagi.");
            return;
        }

        setSessionToken(data.token);
        activeUser = data.user;
        await fetchSiswaList();
        showDashboard();
    } catch (err) {
        console.error("Gagal login:", err);
        alert("Login gagal. Periksa koneksi internet kamu lalu coba lagi.");
    }
}

async function handleLogout() {
    // Hapus sesi di server (butuh token, jadi dilakukan sebelum token dihapus)
    try { if (supabaseClient && getSessionToken()) await supabaseClient.rpc('logout_siswa'); } catch (e) { /* abaikan */ }
    clearSessionToken();

    activeUser = null;
    closeTabunganPages();
    if (typeof resetUtbkState === 'function') resetUtbkState();
    if (typeof resetMatdasState === 'function') resetMatdasState();
    if (typeof resetInggrisState === 'function') resetInggrisState();
    if (typeof resetMiniGamesState === 'function') resetMiniGamesState();
    if (typeof resetPeringkatState === 'function') resetPeringkatState();
    if (typeof profilReset === 'function') profilReset();
    if (typeof navSembunyikan === 'function') navSembunyikan();

    document.getElementById('login-card').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('login-pin').value = '';
    resetFormUmum();
    setLoginTab('arexcii');

    hideAllRolePanels();

    // Kembalikan daftar siswa ke versi publik (hanya nama)
    await fetchSiswaList();
}

// Cek token tersimpan ke server. Jika sudah kedaluwarsa/tidak valid, token dibuang.
async function checkSession() {
    try { localStorage.removeItem('siswa_session'); } catch (e) { /* abaikan */ }   // sisa versi lama
    if (!getSessionToken()) return;

    try {
        const { data, error } = await supabaseClient.rpc('sesi_me');
        if (error) throw error;
        if (!data) {
            clearSessionToken();
            return;
        }
        activeUser = data;
        await fetchSiswaList();
        showDashboard();
    } catch (err) {
        console.error("Gagal memeriksa sesi:", err);
    }
}

// ====================================================================
// LOGIN: tab Arexcii / Umum
// ====================================================================
function setLoginTab(tab) {
    const umum = tab === 'umum';
    document.getElementById('login-form-arexcii').classList.toggle('hidden', umum);
    document.getElementById('login-form-umum').classList.toggle('hidden', !umum);

    const aktif = ['bg-white', 'text-primary-700', 'shadow-sm'];
    const mati = ['text-slate-500', 'hover:text-slate-700'];
    [['arexcii', !umum], ['umum', umum]].forEach(([nama, on]) => {
        const el = document.getElementById('login-tab-' + nama);
        el.classList.remove(...aktif, ...mati);
        el.classList.add(...(on ? aktif : mati));
        el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.getElementById('login-subtitle').innerText = umum
        ? 'Akun umum untuk UTBK Corner & Mini Games'
        : 'Sistem Terintegrasi Absensi, Tabungan & Tabungan Villa';
    lucide.createIcons();
}

function setModeUmum(mode) {
    const daftar = mode === 'daftar';
    document.getElementById('umum-form-masuk').classList.toggle('hidden', daftar);
    document.getElementById('umum-form-daftar').classList.toggle('hidden', !daftar);
    tampilPesanUmum('masuk', '');
    tampilPesanUmum('daftar', '');
    lucide.createIcons();
}

function resetFormUmum() {
    ['umum-login-username', 'umum-login-sandi', 'umum-daftar-nama', 'umum-daftar-username', 'umum-daftar-sandi', 'umum-daftar-sandi2']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    setModeUmum('masuk');
}

// jenis: 'galat' (merah) | 'sukses' (hijau) | '' (sembunyikan)
function tampilPesanUmum(form, pesan, jenis = 'galat') {
    const el = document.getElementById('umum-pesan-' + form);
    if (!el) return;
    el.innerText = pesan || '';
    el.classList.toggle('hidden', !pesan);
    el.classList.remove('bg-red-50', 'text-red-600', 'bg-emerald-50', 'text-emerald-700');
    el.classList.add(...(jenis === 'sukses' ? ['bg-emerald-50', 'text-emerald-700'] : ['bg-red-50', 'text-red-600']));
}

function toggleSandiUmum(inputId, tombol) {
    const input = document.getElementById(inputId);
    const tampil = input.type === 'password';
    input.type = tampil ? 'text' : 'password';
    tombol.innerHTML = `<i data-lucide="${tampil ? 'eye-off' : 'eye'}" class="w-5 h-5"></i>`;
    lucide.createIcons();
}

// ---------- Daftar akun Umum (fungsi database daftar_umum) ----------
async function handleDaftarUmum(e) {
    if (e) e.preventDefault();
    const nama = document.getElementById('umum-daftar-nama').value.trim();
    const username = document.getElementById('umum-daftar-username').value.trim().toLowerCase();
    const sandi = document.getElementById('umum-daftar-sandi').value;
    const sandi2 = document.getElementById('umum-daftar-sandi2').value;

    // Pemeriksaan awal di browser (aturan sebenarnya tetap diperiksa di server)
    if (!/^[A-Za-zÀ-ÿ0-9 .'-]{2,30}$/.test(nama)) return tampilPesanUmum('daftar', 'Nama 2-30 karakter (huruf, angka, spasi, titik, apostrof, atau strip).');
    if (!/^[a-z0-9_]{4,20}$/.test(username)) return tampilPesanUmum('daftar', 'Username 4-20 karakter: huruf kecil, angka, atau garis bawah (_).');
    if (sandi.length < 8) return tampilPesanUmum('daftar', 'Kata sandi minimal 8 karakter.');
    if (sandi !== sandi2) return tampilPesanUmum('daftar', 'Pengulangan kata sandi tidak sama.');

    const btn = document.getElementById('umum-btn-daftar');
    btn.disabled = true;
    tampilPesanUmum('daftar', '');
    try {
        const { data, error } = await supabaseClient.rpc('daftar_umum', { p_nama: nama, p_username: username, p_sandi: sandi });
        if (error) throw error;

        const pesan = {
            nama_tidak_valid: 'Nama tidak valid. Pakai 2-30 karakter.',
            username_tidak_valid: 'Username 4-20 karakter: huruf kecil, angka, atau garis bawah (_).',
            sandi_tidak_valid: 'Kata sandi minimal 8 karakter.',
            sandi_terlalu_mudah: 'Kata sandi terlalu mudah ditebak. Jangan pakai username atau angka berurutan.',
            terlalu_banyak_pendaftaran: 'Sedang terlalu banyak pendaftaran. Coba lagi beberapa menit lagi.',
            username_dipakai: 'Username itu sudah dipakai. Coba username lain.'
        };
        if (!data || !data.ok) {
            return tampilPesanUmum('daftar', pesan[data && data.error] || 'Gagal membuat akun. Coba lagi.');
        }

        // Akun jadi -> pindah ke form Masuk dengan username terisi; login dilakukan terpisah
        document.getElementById('umum-daftar-nama').value = '';
        document.getElementById('umum-daftar-username').value = '';
        document.getElementById('umum-daftar-sandi').value = '';
        document.getElementById('umum-daftar-sandi2').value = '';
        setModeUmum('masuk');
        document.getElementById('umum-login-username').value = username;
        document.getElementById('umum-login-sandi').value = '';
        tampilPesanUmum('masuk', 'Akun berhasil dibuat. Silakan masuk dengan kata sandi kamu.', 'sukses');
        document.getElementById('umum-login-sandi').focus();
    } catch (err) {
        console.error('Gagal daftar akun umum:', err);
        tampilPesanUmum('daftar', 'Pendaftaran gagal. Periksa koneksi internet kamu lalu coba lagi.');
    } finally {
        btn.disabled = false;
    }
}

// ---------- Masuk akun Umum (fungsi database login_umum) ----------
async function handleLoginUmum(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('umum-login-username').value.trim().toLowerCase();
    const sandi = document.getElementById('umum-login-sandi').value;

    if (!username) return tampilPesanUmum('masuk', 'Masukkan username kamu.');
    if (!sandi) return tampilPesanUmum('masuk', 'Masukkan kata sandi kamu.');

    const btn = document.getElementById('umum-btn-masuk');
    btn.disabled = true;
    tampilPesanUmum('masuk', '');
    try {
        const { data, error } = await supabaseClient.rpc('login_umum', { p_username: username, p_sandi: sandi });
        if (error) throw error;

        if (data && data.error === 'terlalu_banyak_percobaan') {
            return tampilPesanUmum('masuk', 'Terlalu banyak percobaan yang salah. Coba lagi dalam 10 menit.');
        }
        if (!data || data.error || !data.token || !data.user) {
            return tampilPesanUmum('masuk', 'Username atau kata sandi salah.');
        }

        setSessionToken(data.token);
        activeUser = data.user;
        document.getElementById('umum-login-sandi').value = '';
        await showDashboard();
    } catch (err) {
        console.error('Gagal login akun umum:', err);
        tampilPesanUmum('masuk', 'Login gagal. Periksa koneksi internet kamu lalu coba lagi.');
    } finally {
        btn.disabled = false;
    }
}

// ====================================================================
// GANTI PIN SENDIRI (fungsi database ganti_pin; PIN lama diverifikasi di server)
// ====================================================================
function showPinModalError(msg) {
    const el = document.getElementById('pin-modal-error');
    el.innerText = msg || '';
    el.classList.toggle('hidden', !msg);
}

function openChangePinModal() {
    const umum = isAkunUmum();
    ['pin-lama', 'pin-baru', 'pin-baru2'].forEach(id => {
        const el = document.getElementById(id);
        el.value = '';
        if (umum) {
            el.removeAttribute('inputmode');
            el.maxLength = 72;
            el.placeholder = '';
            el.classList.remove('tracking-[0.5em]', 'text-center', 'font-bold');
        } else {
            el.setAttribute('inputmode', 'numeric');
            el.maxLength = 6;
            el.placeholder = '******';
            el.classList.add('tracking-[0.5em]', 'text-center', 'font-bold');
        }
    });
    document.getElementById('pin-modal-title').innerText = umum ? 'Ganti Kata Sandi' : 'Ganti PIN';
    document.getElementById('pin-label-lama').innerText = umum ? 'Kata sandi lama' : 'PIN lama';
    document.getElementById('pin-label-baru').innerText = umum ? 'Kata sandi baru (min. 8 karakter)' : 'PIN baru (6 angka)';
    document.getElementById('pin-label-baru2').innerText = umum ? 'Ulangi kata sandi baru' : 'Ulangi PIN baru';
    document.getElementById('pin-submit-btn').innerText = umum ? 'Simpan Sandi' : 'Simpan PIN';
    document.getElementById('pin-modal-hint').innerText = umum
        ? 'Jangan pakai username atau angka berurutan. Perangkat lain yang sedang login akan otomatis keluar.'
        : 'Jangan pakai 123456 atau angka yang sama semua. Perangkat lain yang sedang login akan otomatis keluar.';
    showPinModalError('');
    document.getElementById('pin-modal').classList.remove('hidden');
    lucide.createIcons();
    document.getElementById('pin-lama').focus();
}

function closeChangePinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
}

async function submitChangePin() {
    const lama = document.getElementById('pin-lama').value;
    const baru = document.getElementById('pin-baru').value;
    const baru2 = document.getElementById('pin-baru2').value;
    const umum = isAkunUmum();

    if (!lama) return showPinModalError(umum ? 'Masukkan kata sandi lama kamu.' : 'Masukkan PIN lama kamu.');
    if (umum) {
        if (baru.length < 8) return showPinModalError('Kata sandi baru minimal 8 karakter.');
        if (baru !== baru2) return showPinModalError('Pengulangan kata sandi baru tidak sama.');
    } else {
        if (!/^[0-9]{6}$/.test(baru)) return showPinModalError('PIN baru harus 6 angka.');
        if (baru !== baru2) return showPinModalError('Pengulangan PIN baru tidak sama.');
    }

    const btn = document.getElementById('pin-submit-btn');
    btn.disabled = true;
    showPinModalError('');

    try {
        const { data, error } = umum
            ? await supabaseClient.rpc('ganti_sandi_umum', { p_lama: lama, p_baru: baru })
            : await supabaseClient.rpc('ganti_pin', { p_pin_lama: lama, p_pin_baru: baru });
        if (error) throw error;

        const pesan = umum ? {
            tidak_login: 'Sesi kamu sudah habis. Silakan login ulang.',
            bukan_akun_umum: 'Akun ini bukan akun Umum.',
            sandi_tidak_valid: 'Kata sandi baru minimal 8 karakter.',
            sandi_terlalu_mudah: 'Kata sandi terlalu mudah ditebak. Jangan pakai username atau angka berurutan.',
            sandi_sama: 'Kata sandi baru tidak boleh sama dengan yang lama.',
            terlalu_banyak_percobaan: 'Terlalu banyak percobaan salah. Coba lagi dalam 10 menit.',
            sandi_lama_salah: 'Kata sandi lama yang kamu masukkan salah.'
        } : {
            tidak_login: 'Sesi kamu sudah habis. Silakan login ulang.',
            format_pin_baru: 'PIN baru harus 6 angka.',
            pin_terlalu_mudah: 'PIN terlalu mudah ditebak. Jangan pakai 123456 atau angka yang sama semua.',
            pin_sama: 'PIN baru tidak boleh sama dengan PIN lama.',
            terlalu_banyak_percobaan: 'Terlalu banyak percobaan salah. Coba lagi dalam 10 menit.',
            pin_lama_salah: 'PIN lama yang kamu masukkan salah.'
        };
        if (!data || !data.ok) {
            showPinModalError(pesan[data && data.error] || (umum ? 'Gagal mengganti kata sandi. Coba lagi.' : 'Gagal mengganti PIN. Coba lagi.'));
            return;
        }

        closeChangePinModal();
        alert(umum
            ? 'Kata sandi berhasil diganti. Gunakan kata sandi baru saat login berikutnya.'
            : 'PIN berhasil diganti. Gunakan PIN baru saat login berikutnya.');
    } catch (err) {
        console.error('Gagal ganti PIN/sandi:', err);
        showPinModalError(umum ? 'Gagal mengganti kata sandi. Periksa koneksi internet kamu.' : 'Gagal mengganti PIN. Periksa koneksi internet kamu.');
    } finally {
        btn.disabled = false;
    }
}

// ====================================================================
// HAPUS AKUN (khusus akun Umum; fungsi database hapus_akun_umum, kata sandi diverifikasi di server)
// ====================================================================
function showHapusAkunError(msg) {
    const el = document.getElementById('hapus-akun-error');
    el.innerText = msg || '';
    el.classList.toggle('hidden', !msg);
}

function openHapusAkunModal() {
    if (!isAkunUmum()) return;
    document.getElementById('hapus-akun-sandi').value = '';
    document.getElementById('hapus-akun-cek').checked = false;
    showHapusAkunError('');
    document.getElementById('hapus-akun-modal').classList.remove('hidden');
    lucide.createIcons();
    document.getElementById('hapus-akun-sandi').focus();
}

function closeHapusAkunModal() {
    document.getElementById('hapus-akun-modal').classList.add('hidden');
    document.getElementById('hapus-akun-sandi').value = '';
}

async function submitHapusAkun() {
    if (!isAkunUmum()) return;
    const sandi = document.getElementById('hapus-akun-sandi').value;
    if (!sandi) return showHapusAkunError('Masukkan kata sandi kamu.');
    if (!document.getElementById('hapus-akun-cek').checked) return showHapusAkunError('Centang kotak persetujuan terlebih dahulu.');

    const btn = document.getElementById('hapus-akun-btn');
    btn.disabled = true;
    showHapusAkunError('');
    try {
        const { data, error } = await supabaseClient.rpc('hapus_akun_umum', { p_sandi: sandi });
        if (error) throw error;
        if (!data || !data.ok) {
            const pesan = {
                tidak_login: 'Sesi kamu sudah habis. Silakan login ulang.',
                bukan_akun_umum: 'Hanya akun Umum yang bisa dihapus dari sini.',
                sandi_salah: 'Kata sandi yang kamu masukkan salah.',
                terlalu_banyak_percobaan: 'Terlalu banyak percobaan salah. Coba lagi dalam 10 menit.'
            };
            return showHapusAkunError(pesan[data && data.error] || 'Gagal menghapus akun. Coba lagi.');
        }

        closeHapusAkunModal();
        await handleLogout();   // sesi sudah terhapus di server; ini membersihkan token & tampilan
        setLoginTab('umum');
        tampilPesanUmum('masuk', 'Akun kamu sudah dihapus permanen.', 'sukses');
    } catch (err) {
        console.error('Gagal menghapus akun:', err);
        showHapusAkunError('Gagal menghapus akun. Periksa koneksi internet kamu lalu coba lagi.');
    } finally {
        btn.disabled = false;
    }
}
