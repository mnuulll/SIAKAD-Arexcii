// ====================================================================
// AUTH & INISIALISASI
// Login memakai fungsi database login_siswa (PIN diperiksa di server, bukan di browser).
// Browser hanya menyimpan token sesi acak; semua request membawa token itu lewat
// header "x-session-token", yang dipakai policy RLS untuk mengenali siapa pengguna.
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

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date-display').innerText = new Date().toLocaleDateString('id-ID', options);

    if (!initSupabase()) return;

    await fetchSiswaList();   // sebelum login: hanya id + nama (untuk dropdown login)
    await checkSession();     // jika token masih valid, langsung masuk dashboard
});

// Sebelum login  -> daftar nama saja (fungsi daftar_login).
// Setelah login  -> data siswa lengkap TANPA kolom pin (dibatasi RLS).
async function fetchSiswaList() {
    try {
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

    closeTabunganPages();
    activeUser = null;

    document.getElementById('login-card').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('login-pin').value = '';

    hideAllRolePanels();
    hideFeatureBubble();

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
