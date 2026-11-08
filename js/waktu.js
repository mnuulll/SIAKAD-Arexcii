// ====================================================================
// WAKTU INDONESIA (WIB, UTC+7)
// Supabase menyimpan waktu dalam UTC (selisih 7 jam dari WIB). Semua perhitungan
// tanggal/jam di aplikasi memakai helper ini supaya selalu mengikuti WIB, apa pun
// zona waktu perangkat. WIB tidak memakai waktu musim panas, jadi selisihnya tetap.
// ====================================================================
const WIB = 'Asia/Jakarta';
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

// Ubah nilai dari database menjadi Date. Teks tanggal-jam TANPA keterangan zona
// (mis. kolom "timestamp without time zone") dianggap UTC, bukan waktu perangkat.
function waktuParse(v) {
    if (v instanceof Date) return v;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(v) && !/(Z|[+-]\d{2}(:?\d{2})?)$/i.test(v)) {
        v = v.replace(' ', 'T') + 'Z';
    }
    return new Date(v);
}
// Date yang kolom UTC-nya berisi jam dinding WIB (baca dengan getUTC*)
function wibGeser(d) { return new Date(waktuParse(d || new Date()).getTime() + WIB_OFFSET_MS); }
function wibTanggalIso(d) { return wibGeser(d).toISOString().slice(0, 10); }   // "YYYY-MM-DD" WIB
function wibBulanIni(d) { return wibTanggalIso(d).slice(0, 7); }                // "YYYY-MM" WIB
function wibHari(d) { return wibGeser(d).getUTCDay(); }                         // 0=Minggu ... 6=Sabtu (WIB)
function wibMenitHari(d) {                                                      // menit sejak 00:00 WIB
    const s = wibGeser(d);
    return s.getUTCHours() * 60 + s.getUTCMinutes() + s.getUTCSeconds() / 60;
}
// Batas bulan WIB dalam milidetik epoch: awal bulan "YYYY-MM" dan awal bulan berikutnya
function wibAwalBulanMs(bulanStr) {
    const [y, m] = bulanStr.split('-').map(Number);
    return Date.UTC(y, m - 1, 1) - WIB_OFFSET_MS;
}
function wibAwalBulanBerikutMs(bulanStr) {
    const [y, m] = bulanStr.split('-').map(Number);
    return Date.UTC(y, m, 1) - WIB_OFFSET_MS;
}

// Format tampilan (selalu WIB)
function fmtTgl(v, opts) { return waktuParse(v).toLocaleDateString('id-ID', Object.assign({ timeZone: WIB }, opts || {})); }
function fmtJam(v) { return waktuParse(v).toLocaleTimeString('id-ID', { timeZone: WIB, hour: '2-digit', minute: '2-digit' }); }
function fmtWaktu(v, opts) { return waktuParse(v).toLocaleString('id-ID', Object.assign({ timeZone: WIB }, opts || {})); }

// Rentang bulan: "2026-08" s.d. "2026-11" -> ['2026-08','2026-09','2026-10','2026-11'].
// Mengembalikan null jika tidak valid (kosong, terbalik, atau lebih dari 24 bulan).
function waktuDaftarBulan(dari, sampai) {
    sampai = sampai || dari;
    if (!/^\d{4}-\d{2}$/.test(dari || '') || !/^\d{4}-\d{2}$/.test(sampai)) return null;
    let [y, m] = dari.split('-').map(Number);
    const [y2, m2] = sampai.split('-').map(Number);
    const hasil = [];
    while (y < y2 || (y === y2 && m <= m2)) {
        hasil.push(`${y}-${String(m).padStart(2, '0')}`);
        if (++m > 12) { m = 1; y++; }
        if (hasil.length > 24) return null;
    }
    return hasil.length ? hasil : null;
}
function waktuLabelBulan(bulanStr) {
    const [y, m] = bulanStr.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}
