// ====================================================================
// DATA UTBK: bobot subtes, katalog program studi, estimasi skor minimal, daftar kampus
//
// PENTING (baca sebelum mengubah):
// 1. BOBOT SUBTES di bawah ini adalah ESTIMASI untuk prioritas belajar, BUKAN bobot resmi.
//    Per Oktober 2026 panitia SNPMB belum mengumumkan pembobotan subtes per program studi
//    untuk UTBK 2027; PTN berwenang menetapkannya sendiri. Ganti nilainya jika sudah resmi.
// 2. SKOR MINIMAL adalah ESTIMASI KASAR yang dihitung dari: skor dasar kampus + penambah
//    sesuai kelas keketatan prodi (1-5). Dikalibrasi dengan beberapa data publik tahun
//    2025-2026 yang tidak resmi dan saling berbeda antar sumber, jadi selisihnya bisa
//    +/- 40-60 poin. Skor minimal sebenarnya tidak pernah dirilis resmi dan berubah tiap tahun.
// 3. KATALOG PRODI belum lengkap dan nama prodi bisa sedikit berbeda dari pengumuman resmi.
//    Daftar resmi ada di portal SNPMB (daya tampung). Prodi yang tidak ada di katalog tetap
//    bisa diisi manual.
// ====================================================================

const UTBK_SUBTES_KEYS = ['pu', 'ppu', 'pbm', 'pk', 'lbi', 'lbe', 'pm'];

// Bobot tiap subtes per kelompok prodi (jumlah = 1)
const UTBK_RUMPUN = {
    teknik:            { nama: 'Teknik, Komputer & Informatika',          bobot: { pu: .22, ppu: .08, pbm: .06, pk: .22, lbi: .10, lbe: .10, pm: .22 } },
    sains:             { nama: 'Sains (Matematika, Fisika, Kimia, Biologi)', bobot: { pu: .18, ppu: .10, pbm: .08, pk: .18, lbi: .13, lbe: .13, pm: .20 } },
    kesehatan:         { nama: 'Kedokteran & Kesehatan',                  bobot: { pu: .20, ppu: .12, pbm: .08, pk: .15, lbi: .15, lbe: .15, pm: .15 } },
    agro:              { nama: 'Pertanian, Peternakan, Perikanan & Kehutanan', bobot: { pu: .17, ppu: .12, pbm: .08, pk: .15, lbi: .17, lbe: .16, pm: .15 } },
    ekonomi:           { nama: 'Ekonomi & Bisnis',                        bobot: { pu: .18, ppu: .10, pbm: .08, pk: .20, lbi: .13, lbe: .13, pm: .18 } },
    hukum_sosial:      { nama: 'Hukum, Sosial & Politik',                 bobot: { pu: .18, ppu: .16, pbm: .14, pk: .09, lbi: .20, lbe: .14, pm: .09 } },
    bahasa_humaniora:  { nama: 'Bahasa, Sastra & Humaniora',              bobot: { pu: .14, ppu: .17, pbm: .20, pk: .06, lbi: .20, lbe: .17, pm: .06 } },
    psikologi:         { nama: 'Psikologi',                               bobot: { pu: .20, ppu: .15, pbm: .13, pk: .11, lbi: .17, lbe: .13, pm: .11 } },
    pendidikan:        { nama: 'Pendidikan (guru, bahasa, sosial)',       bobot: { pu: .16, ppu: .16, pbm: .15, pk: .12, lbi: .16, lbe: .12, pm: .13 } },
    pendidikan_stem:   { nama: 'Pendidikan MIPA & Teknologi',             bobot: { pu: .16, ppu: .10, pbm: .10, pk: .18, lbi: .14, lbe: .14, pm: .18 } },
    arsitektur_desain: { nama: 'Arsitektur & Desain',                     bobot: { pu: .20, ppu: .14, pbm: .10, pk: .12, lbi: .13, lbe: .13, pm: .18 } },
    umum:              { nama: 'Umum (bobot sama rata)',                  bobot: { pu: 1/7, ppu: 1/7, pbm: 1/7, pk: 1/7, lbi: 1/7, lbe: 1/7, pm: 1/7 } }
};

// Penambah skor menurut kelas keketatan prodi (1 = longgar ... 5 = sangat ketat)
const UTBK_OFFSET_KETAT = { 1: 0, 2: 30, 3: 60, 4: 90, 5: 130 };
const UTBK_KISARAN_ESTIMASI = 40;   // +/- poin yang ditampilkan di aplikasi

// Prodi umum: nama -> [rumpun, keketatan default, jenjang (opsional, default S1)]
const UTBK_PRODI_UMUM = {
    // Kedokteran & kesehatan
    'Kedokteran': ['kesehatan', 5], 'Kedokteran Gigi': ['kesehatan', 5], 'Kedokteran Hewan': ['kesehatan', 4],
    'Farmasi': ['kesehatan', 4], 'Ilmu Keperawatan': ['kesehatan', 3], 'Kesehatan Masyarakat': ['kesehatan', 3],
    'Gizi': ['kesehatan', 4], 'Gizi Masyarakat': ['kesehatan', 4],
    // Teknik, komputer, informatika
    'Teknik Elektro': ['teknik', 4], 'Teknik Mesin': ['teknik', 4], 'Teknik Sipil': ['teknik', 3],
    'Teknik Industri': ['teknik', 4], 'Teknik Kimia': ['teknik', 4], 'Teknik Fisika': ['teknik', 3],
    'Teknik Metalurgi dan Material': ['teknik', 3], 'Teknik Material': ['teknik', 3], 'Teknik Lingkungan': ['teknik', 3],
    'Teknik Perkapalan': ['teknik', 3], 'Teknik Kelautan': ['teknik', 3], 'Teknik Geologi': ['teknik', 3],
    'Teknik Geodesi': ['teknik', 3], 'Teknik Geofisika': ['teknik', 3], 'Teknik Nuklir': ['teknik', 3],
    'Teknik Biomedik': ['teknik', 4], 'Teknik Komputer': ['teknik', 4], 'Teknik Informatika': ['teknik', 5],
    'Informatika': ['teknik', 5], 'Ilmu Komputer': ['teknik', 5], 'Sistem Informasi': ['teknik', 4],
    'Teknologi Informasi': ['teknik', 4], 'Elektronika dan Instrumentasi': ['teknik', 3],
    'Teknik Pertanian dan Biosistem': ['teknik', 2], 'Teknik Sipil dan Lingkungan': ['teknik', 3],
    'Teknik Mesin dan Biosistem': ['teknik', 3],
    'Teknologi Rekayasa Elektro': ['teknik', 4, 'D4'],
    // Sains
    'Matematika': ['sains', 3], 'Statistika': ['sains', 3], 'Fisika': ['sains', 2], 'Kimia': ['sains', 3],
    'Biologi': ['sains', 3], 'Geografi': ['sains', 2], 'Aktuaria': ['sains', 4], 'Biokimia': ['sains', 3],
    'Meteorologi Terapan': ['sains', 3], 'Ilmu Kelautan': ['sains', 2],
    // Agro
    'Agroteknologi': ['agro', 2], 'Agroekoteknologi': ['agro', 2], 'Agribisnis': ['agro', 2], 'Peternakan': ['agro', 2],
    'Perikanan': ['agro', 2], 'Akuakultur': ['agro', 2], 'Budidaya Perairan': ['agro', 2], 'Kehutanan': ['agro', 2],
    'Teknologi Pangan': ['agro', 3], 'Ilmu dan Teknologi Pangan': ['agro', 3], 'Agronomi dan Hortikultura': ['agro', 2],
    'Proteksi Tanaman': ['agro', 2], 'Teknologi Hasil Perairan': ['agro', 2], 'Manajemen Sumberdaya Perairan': ['agro', 2],
    'Arsitektur Lanskap': ['agro', 2], 'Silvikultur': ['agro', 2], 'Manajemen Hutan': ['agro', 2],
    'Teknologi Industri Pertanian': ['agro', 3], 'Manajemen Sumberdaya Lahan': ['agro', 2],
    // Ekonomi
    'Ilmu Ekonomi': ['ekonomi', 3], 'Manajemen': ['ekonomi', 4], 'Akuntansi': ['ekonomi', 4],
    'Manajemen Bisnis': ['ekonomi', 3], 'Ekonomi Sumberdaya dan Lingkungan': ['ekonomi', 3],
    // Hukum, sosial, politik
    'Ilmu Hukum': ['hukum_sosial', 4], 'Ilmu Komunikasi': ['hukum_sosial', 4], 'Hubungan Internasional': ['hukum_sosial', 4],
    'Ilmu Politik': ['hukum_sosial', 3], 'Politik dan Pemerintahan': ['hukum_sosial', 3], 'Sosiologi': ['hukum_sosial', 3],
    'Administrasi Publik': ['hukum_sosial', 3], 'Ilmu Administrasi Negara': ['hukum_sosial', 3],
    'Antropologi': ['hukum_sosial', 2], 'Ilmu Perpustakaan': ['hukum_sosial', 2],
    'Komunikasi dan Pengembangan Masyarakat': ['hukum_sosial', 2], 'Ilmu Keluarga dan Konsumen': ['hukum_sosial', 2],
    // Bahasa & humaniora
    'Sastra Inggris': ['bahasa_humaniora', 3], 'Sastra Indonesia': ['bahasa_humaniora', 2],
    'Ilmu Sejarah': ['bahasa_humaniora', 2], 'Filsafat': ['bahasa_humaniora', 2],
    // Psikologi
    'Psikologi': ['psikologi', 4],
    // Arsitektur & desain
    'Arsitektur': ['arsitektur_desain', 4], 'Desain Komunikasi Visual': ['arsitektur_desain', 3],
    'Desain Produk': ['arsitektur_desain', 3],
    // Pendidikan
    'Pendidikan Guru Sekolah Dasar': ['pendidikan', 2], 'Pendidikan Guru PAUD': ['pendidikan', 2],
    'Pendidikan Bahasa Inggris': ['pendidikan', 3], 'Pendidikan Bahasa Indonesia': ['pendidikan', 2],
    'Pendidikan Ekonomi': ['pendidikan', 2], 'Pendidikan Sejarah': ['pendidikan', 2], 'Pendidikan Geografi': ['pendidikan', 2],
    'Pendidikan Jasmani': ['pendidikan', 2], 'Bimbingan dan Konseling': ['pendidikan', 2], 'Administrasi Pendidikan': ['pendidikan', 2],
    // Pendidikan MIPA & teknologi
    'Pendidikan Matematika': ['pendidikan_stem', 3], 'Pendidikan Fisika': ['pendidikan_stem', 2],
    'Pendidikan Kimia': ['pendidikan_stem', 2], 'Pendidikan Biologi': ['pendidikan_stem', 2],
    'Pendidikan Teknik Elektro': ['pendidikan_stem', 2], 'Pendidikan Ilmu Komputer': ['pendidikan_stem', 3]
};

// Katalog per kampus. base = skor dasar kampus (dipakai rumus estimasi).
// Setiap prodi ditulis "Nama" atau "Nama:k" untuk mengganti kelas keketatan di kampus itu.
// 'khusus' dipakai untuk unit/prodi yang namanya hanya ada di kampus tersebut.
const UTBK_KATALOG = {
    UI: { base: 595, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Farmasi', 'Ilmu Keperawatan', 'Kesehatan Masyarakat', 'Gizi',
        'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi:4', 'Manajemen', 'Akuntansi', 'Ilmu Komputer', 'Sistem Informasi',
        'Teknik Elektro', 'Teknik Mesin', 'Teknik Sipil', 'Teknik Industri', 'Teknik Kimia', 'Teknik Perkapalan',
        'Teknik Lingkungan', 'Teknik Metalurgi dan Material', 'Teknik Biomedik', 'Arsitektur', 'Matematika', 'Fisika',
        'Kimia', 'Biologi', 'Geografi', 'Ilmu Komunikasi', 'Ilmu Politik', 'Hubungan Internasional', 'Sosiologi',
        'Antropologi', 'Ilmu Administrasi Negara', 'Sastra Inggris', 'Sastra Indonesia', 'Ilmu Sejarah', 'Filsafat',
        'Ilmu Perpustakaan'] },
    ITB: { base: 590, khusus: {
            'Sekolah Teknik Elektro dan Informatika (Komputasi)': ['teknik', 5],
            'Sekolah Teknik Elektro dan Informatika (Rekayasa)': ['teknik', 4],
            'Fakultas Teknik Mesin dan Dirgantara': ['teknik', 4],
            'Fakultas Teknik Sipil dan Lingkungan': ['teknik', 3],
            'Fakultas Teknologi Industri': ['teknik', 4],
            'Fakultas Teknik Pertambangan dan Perminyakan': ['teknik', 4],
            'Fakultas Ilmu dan Teknologi Kebumian': ['teknik', 3],
            'Fakultas Matematika dan Ilmu Pengetahuan Alam': ['sains', 3],
            'Sekolah Ilmu dan Teknologi Hayati': ['sains', 3],
            'Sekolah Farmasi': ['kesehatan', 4],
            'Sekolah Bisnis dan Manajemen': ['ekonomi', 4],
            'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan': ['arsitektur_desain', 4],
            'Fakultas Seni Rupa dan Desain': ['arsitektur_desain', 3]
        }, catatan: 'ITB menyeleksi per fakultas atau sekolah; pilihan program studi ditentukan kemudian.',
        prodi: ['Sekolah Teknik Elektro dan Informatika (Komputasi)', 'Sekolah Teknik Elektro dan Informatika (Rekayasa)',
            'Fakultas Teknik Mesin dan Dirgantara', 'Fakultas Teknik Sipil dan Lingkungan', 'Fakultas Teknologi Industri',
            'Fakultas Teknik Pertambangan dan Perminyakan', 'Fakultas Ilmu dan Teknologi Kebumian',
            'Fakultas Matematika dan Ilmu Pengetahuan Alam', 'Sekolah Ilmu dan Teknologi Hayati', 'Sekolah Farmasi',
            'Sekolah Bisnis dan Manajemen', 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan',
            'Fakultas Seni Rupa dan Desain'] },
    UGM: { base: 600, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Kedokteran Hewan', 'Farmasi', 'Ilmu Keperawatan', 'Gizi',
        'Kesehatan Masyarakat', 'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi:4', 'Manajemen', 'Akuntansi', 'Ilmu Komputer',
        'Teknologi Informasi', 'Teknik Elektro', 'Elektronika dan Instrumentasi', 'Teknik Mesin', 'Teknik Sipil',
        'Teknik Industri', 'Teknik Kimia', 'Teknik Fisika', 'Teknik Geologi', 'Teknik Geodesi', 'Teknik Nuklir',
        'Arsitektur', 'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Statistika', 'Geografi', 'Ilmu Komunikasi',
        'Hubungan Internasional', 'Politik dan Pemerintahan', 'Sosiologi', 'Antropologi', 'Sastra Inggris',
        'Sastra Indonesia', 'Ilmu Sejarah', 'Filsafat', 'Agroteknologi', 'Agribisnis', 'Peternakan', 'Kehutanan',
        'Teknologi Rekayasa Elektro'] },
    IPB: { base: 570, prodi: ['Kedokteran Hewan', 'Gizi Masyarakat', 'Ilmu Komputer', 'Statistika', 'Matematika', 'Aktuaria',
        'Biologi', 'Kimia', 'Fisika', 'Biokimia', 'Meteorologi Terapan', 'Teknik Sipil dan Lingkungan',
        'Teknik Mesin dan Biosistem', 'Teknologi Industri Pertanian', 'Ilmu dan Teknologi Pangan', 'Ilmu Ekonomi',
        'Manajemen', 'Agribisnis', 'Ekonomi Sumberdaya dan Lingkungan', 'Ilmu Keluarga dan Konsumen',
        'Komunikasi dan Pengembangan Masyarakat', 'Agronomi dan Hortikultura', 'Proteksi Tanaman',
        'Manajemen Sumberdaya Lahan', 'Peternakan', 'Teknologi Hasil Perairan', 'Budidaya Perairan',
        'Manajemen Sumberdaya Perairan', 'Silvikultur', 'Manajemen Hutan', 'Arsitektur Lanskap'] },
    ITS: { base: 570, prodi: ['Teknik Informatika', 'Sistem Informasi', 'Teknologi Informasi', 'Teknik Komputer',
        'Teknik Biomedik', 'Teknik Elektro', 'Teknik Mesin', 'Teknik Material', 'Teknik Kimia', 'Teknik Industri',
        'Teknik Sipil', 'Arsitektur', 'Desain Produk', 'Desain Komunikasi Visual', 'Teknik Fisika', 'Teknik Lingkungan',
        'Teknik Perkapalan', 'Teknik Kelautan', 'Teknik Geofisika', 'Matematika', 'Statistika', 'Fisika', 'Kimia',
        'Biologi', 'Aktuaria', 'Manajemen Bisnis'] },
    UNAIR: { base: 570, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Kedokteran Hewan', 'Farmasi', 'Ilmu Keperawatan',
        'Kesehatan Masyarakat', 'Gizi', 'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi',
        'Ilmu Komunikasi', 'Hubungan Internasional', 'Ilmu Politik', 'Sosiologi', 'Antropologi', 'Sastra Inggris',
        'Sastra Indonesia', 'Ilmu Sejarah', 'Matematika', 'Statistika', 'Fisika', 'Kimia', 'Biologi', 'Teknik Industri',
        'Teknik Biomedik', 'Sistem Informasi'] },
    UNPAD: { base: 565, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Farmasi', 'Ilmu Keperawatan', 'Kesehatan Masyarakat',
        'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi', 'Ilmu Komunikasi', 'Hubungan Internasional',
        'Administrasi Publik', 'Sosiologi', 'Antropologi', 'Sastra Inggris', 'Sastra Indonesia', 'Ilmu Sejarah',
        'Matematika', 'Statistika', 'Fisika', 'Kimia', 'Biologi', 'Teknik Informatika', 'Teknik Elektro', 'Teknik Geologi',
        'Teknik Geodesi', 'Teknik Pertanian dan Biosistem', 'Agroteknologi', 'Agribisnis', 'Peternakan',
        'Teknologi Pangan', 'Perikanan'] },
    UNDIP: { base: 565, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Farmasi', 'Ilmu Keperawatan', 'Kesehatan Masyarakat', 'Gizi',
        'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi', 'Ilmu Komunikasi', 'Hubungan Internasional',
        'Administrasi Publik', 'Sastra Inggris', 'Sastra Indonesia', 'Ilmu Sejarah', 'Teknik Elektro', 'Teknik Mesin',
        'Teknik Sipil', 'Teknik Industri', 'Teknik Kimia', 'Teknik Komputer', 'Informatika', 'Arsitektur',
        'Teknik Lingkungan', 'Teknik Perkapalan', 'Teknik Geologi', 'Teknik Geodesi', 'Matematika', 'Statistika',
        'Fisika', 'Kimia', 'Biologi', 'Agroekoteknologi', 'Peternakan', 'Akuakultur'] },
    UB: { base: 555, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Kedokteran Hewan', 'Farmasi', 'Ilmu Keperawatan', 'Gizi',
        'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi', 'Ilmu Komunikasi', 'Hubungan Internasional',
        'Administrasi Publik', 'Sosiologi', 'Sastra Inggris', 'Sastra Indonesia', 'Teknik Informatika', 'Sistem Informasi',
        'Teknik Komputer', 'Teknik Elektro', 'Teknik Mesin', 'Teknik Sipil', 'Teknik Industri', 'Teknik Kimia',
        'Arsitektur', 'Matematika', 'Statistika', 'Fisika', 'Kimia', 'Biologi', 'Agroekoteknologi', 'Agribisnis',
        'Peternakan', 'Budidaya Perairan'] },
    UNS: { base: 540, prodi: ['Kedokteran', 'Farmasi', 'Gizi', 'Ilmu Keperawatan', 'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi',
        'Manajemen', 'Akuntansi', 'Ilmu Komunikasi', 'Hubungan Internasional', 'Ilmu Administrasi Negara', 'Sosiologi',
        'Sastra Inggris', 'Sastra Indonesia', 'Ilmu Sejarah', 'Informatika', 'Teknik Elektro', 'Teknik Mesin',
        'Teknik Sipil', 'Teknik Industri', 'Teknik Kimia', 'Arsitektur', 'Matematika', 'Statistika', 'Fisika', 'Kimia',
        'Biologi', 'Agroteknologi', 'Agribisnis', 'Peternakan', 'Pendidikan Matematika', 'Pendidikan Bahasa Inggris',
        'Pendidikan Guru Sekolah Dasar'] },
    UPI: { base: 540, prodi: ['Psikologi', 'Manajemen', 'Akuntansi', 'Ilmu Komputer', 'Pendidikan Ilmu Komputer',
        'Teknik Elektro', 'Pendidikan Teknik Elektro', 'Arsitektur', 'Desain Komunikasi Visual', 'Matematika', 'Fisika',
        'Kimia', 'Biologi', 'Pendidikan Matematika', 'Pendidikan Fisika', 'Pendidikan Kimia', 'Pendidikan Biologi',
        'Pendidikan Bahasa Inggris', 'Pendidikan Bahasa Indonesia', 'Pendidikan Guru Sekolah Dasar',
        'Pendidikan Guru PAUD', 'Pendidikan Ekonomi', 'Pendidikan Sejarah', 'Pendidikan Geografi', 'Pendidikan Jasmani',
        'Bimbingan dan Konseling', 'Administrasi Pendidikan'] },
    UNSOED: { base: 520, prodi: ['Kedokteran', 'Farmasi', 'Ilmu Keperawatan', 'Kesehatan Masyarakat', 'Ilmu Hukum',
        'Manajemen', 'Akuntansi', 'Ilmu Komunikasi', 'Hubungan Internasional', 'Ilmu Administrasi Negara', 'Sosiologi',
        'Sastra Inggris', 'Teknik Elektro', 'Informatika', 'Teknik Mesin', 'Teknik Sipil', 'Teknik Industri', 'Teknik Kimia',
        'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Agroteknologi', 'Agribisnis', 'Peternakan', 'Akuakultur', 'Kehutanan',
        'Teknologi Pangan'] },
    UNHAS: { base: 530, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Kedokteran Hewan', 'Farmasi', 'Ilmu Keperawatan',
        'Kesehatan Masyarakat', 'Gizi', 'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi',
        'Ilmu Komunikasi', 'Hubungan Internasional', 'Ilmu Politik', 'Sosiologi', 'Antropologi', 'Sastra Inggris',
        'Sastra Indonesia', 'Ilmu Sejarah', 'Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Teknik Mesin',
        'Teknik Sipil', 'Teknik Industri', 'Arsitektur', 'Matematika', 'Statistika', 'Fisika', 'Kimia', 'Biologi',
        'Agroteknologi', 'Peternakan', 'Kehutanan', 'Ilmu Kelautan', 'Perikanan'] },
    USU: { base: 520, prodi: ['Kedokteran', 'Kedokteran Gigi', 'Farmasi', 'Ilmu Keperawatan', 'Kesehatan Masyarakat',
        'Psikologi', 'Ilmu Hukum', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi', 'Ilmu Komunikasi', 'Sastra Inggris',
        'Sastra Indonesia', 'Ilmu Sejarah', 'Teknik Elektro', 'Teknik Mesin', 'Teknik Sipil', 'Teknik Industri',
        'Teknik Kimia', 'Teknik Informatika', 'Ilmu Komputer', 'Arsitektur', 'Matematika', 'Fisika', 'Kimia', 'Biologi',
        'Agroteknologi', 'Agribisnis', 'Kehutanan', 'Peternakan'] }
};

// Daftar prodi sebuah kampus beserta estimasi skor minimal. null jika kampus belum ada di katalog.
function utbkDaftarProdi(singkat) {
    const kat = UTBK_KATALOG[singkat];
    if (!kat) return null;
    const hasil = [];
    kat.prodi.forEach(entri => {
        const [nama, kOverride] = entri.split(':');
        const info = (kat.khusus && kat.khusus[nama]) || UTBK_PRODI_UMUM[nama];
        if (!info) { console.warn('Prodi tidak dikenal di katalog:', nama); return; }
        const k = kOverride ? Number(kOverride) : info[1];
        hasil.push({
            nama, rumpun: info[0], k, jenjang: info[2] || 'S1',
            skor: Math.round((kat.base + UTBK_OFFSET_KETAT[k]) / 5) * 5
        });
    });
    return hasil;
}

// Daftar kampus (PTN dan politeknik negeri). Tidak lengkap; daftar resmi ada di portal SNPMB.
const UTBK_PTN = [
    { s: 'UI',      n: 'Universitas Indonesia',                   k: 'Depok',              u: 'ui.ac.id' },
    { s: 'ITB',     n: 'Institut Teknologi Bandung',              k: 'Bandung',            u: 'itb.ac.id' },
    { s: 'UGM',     n: 'Universitas Gadjah Mada',                 k: 'Yogyakarta',         u: 'ugm.ac.id' },
    { s: 'IPB',     n: 'IPB University',                          k: 'Bogor',              u: 'ipb.ac.id' },
    { s: 'ITS',     n: 'Institut Teknologi Sepuluh Nopember',     k: 'Surabaya',           u: 'its.ac.id' },
    { s: 'UNAIR',   n: 'Universitas Airlangga',                   k: 'Surabaya',           u: 'unair.ac.id' },
    { s: 'UNPAD',   n: 'Universitas Padjadjaran',                 k: 'Jatinangor',         u: 'unpad.ac.id' },
    { s: 'UNDIP',   n: 'Universitas Diponegoro',                  k: 'Semarang',           u: 'undip.ac.id' },
    { s: 'UB',      n: 'Universitas Brawijaya',                   k: 'Malang',             u: 'ub.ac.id' },
    { s: 'UNS',     n: 'Universitas Sebelas Maret',               k: 'Surakarta',          u: 'uns.ac.id' },
    { s: 'UPI',     n: 'Universitas Pendidikan Indonesia',        k: 'Bandung',            u: 'upi.edu' },
    { s: 'UNJ',     n: 'Universitas Negeri Jakarta',              k: 'Jakarta',            u: 'unj.ac.id' },
    { s: 'UNY',     n: 'Universitas Negeri Yogyakarta',           k: 'Yogyakarta',         u: 'uny.ac.id' },
    { s: 'UNNES',   n: 'Universitas Negeri Semarang',             k: 'Semarang',           u: 'unnes.ac.id' },
    { s: 'UNESA',   n: 'Universitas Negeri Surabaya',             k: 'Surabaya',           u: 'unesa.ac.id' },
    { s: 'UM',      n: 'Universitas Negeri Malang',               k: 'Malang',             u: 'um.ac.id' },
    { s: 'UNSOED',  n: 'Universitas Jenderal Soedirman',          k: 'Purwokerto',         u: 'unsoed.ac.id' },
    { s: 'UNTIRTA', n: 'Universitas Sultan Ageng Tirtayasa',      k: 'Serang',             u: 'untirta.ac.id' },
    { s: 'UNSIL',   n: 'Universitas Siliwangi',                   k: 'Tasikmalaya',        u: 'unsil.ac.id' },
    { s: 'UNEJ',    n: 'Universitas Jember',                      k: 'Jember',             u: 'unej.ac.id' },
    { s: 'UTM',     n: 'Universitas Trunojoyo Madura',            k: 'Bangkalan',          u: 'trunojoyo.ac.id' },
    { s: 'UPNVJ',   n: 'UPN Veteran Jakarta',                     k: 'Jakarta',            u: 'upnvj.ac.id' },
    { s: 'UPNYK',   n: 'UPN Veteran Yogyakarta',                  k: 'Yogyakarta',         u: 'upnyk.ac.id' },
    { s: 'UPNJATIM',n: 'UPN Veteran Jawa Timur',                  k: 'Surabaya',           u: 'upnjatim.ac.id' },
    { s: 'ITERA',   n: 'Institut Teknologi Sumatera',             k: 'Lampung Selatan',    u: 'itera.ac.id' },
    { s: 'ITK',     n: 'Institut Teknologi Kalimantan',           k: 'Balikpapan',         u: 'itk.ac.id' },
    { s: 'USU',     n: 'Universitas Sumatera Utara',              k: 'Medan',              u: 'usu.ac.id' },
    { s: 'UNIMED',  n: 'Universitas Negeri Medan',                k: 'Medan',              u: 'unimed.ac.id' },
    { s: 'USK',     n: 'Universitas Syiah Kuala',                 k: 'Banda Aceh',         u: 'usk.ac.id' },
    { s: 'UNAND',   n: 'Universitas Andalas',                     k: 'Padang',             u: 'unand.ac.id' },
    { s: 'UNP',     n: 'Universitas Negeri Padang',               k: 'Padang',             u: 'unp.ac.id' },
    { s: 'UNRI',    n: 'Universitas Riau',                        k: 'Pekanbaru',          u: 'unri.ac.id' },
    { s: 'UNJA',    n: 'Universitas Jambi',                       k: 'Jambi',              u: 'unja.ac.id' },
    { s: 'UNSRI',   n: 'Universitas Sriwijaya',                   k: 'Palembang',          u: 'unsri.ac.id' },
    { s: 'UNIB',    n: 'Universitas Bengkulu',                    k: 'Bengkulu',           u: 'unib.ac.id' },
    { s: 'UNILA',   n: 'Universitas Lampung',                     k: 'Bandar Lampung',     u: 'unila.ac.id' },
    { s: 'UNTAN',   n: 'Universitas Tanjungpura',                 k: 'Pontianak',          u: 'untan.ac.id' },
    { s: 'ULM',     n: 'Universitas Lambung Mangkurat',           k: 'Banjarmasin',        u: 'ulm.ac.id' },
    { s: 'UNMUL',   n: 'Universitas Mulawarman',                  k: 'Samarinda',          u: 'unmul.ac.id' },
    { s: 'UNHAS',   n: 'Universitas Hasanuddin',                  k: 'Makassar',           u: 'unhas.ac.id' },
    { s: 'UNM',     n: 'Universitas Negeri Makassar',             k: 'Makassar',           u: 'unm.ac.id' },
    { s: 'UNTAD',   n: 'Universitas Tadulako',                    k: 'Palu',               u: 'untad.ac.id' },
    { s: 'UHO',     n: 'Universitas Halu Oleo',                   k: 'Kendari',            u: 'uho.ac.id' },
    { s: 'UNG',     n: 'Universitas Negeri Gorontalo',            k: 'Gorontalo',          u: 'ung.ac.id' },
    { s: 'UNSRAT',  n: 'Universitas Sam Ratulangi',               k: 'Manado',             u: 'unsrat.ac.id' },
    { s: 'UNIMA',   n: 'Universitas Negeri Manado',               k: 'Minahasa',           u: 'unima.ac.id' },
    { s: 'UNUD',    n: 'Universitas Udayana',                     k: 'Denpasar',           u: 'unud.ac.id' },
    { s: 'UNDIKSHA',n: 'Universitas Pendidikan Ganesha',          k: 'Singaraja',          u: 'undiksha.ac.id' },
    { s: 'UNRAM',   n: 'Universitas Mataram',                     k: 'Mataram',            u: 'unram.ac.id' },
    { s: 'UNDANA',  n: 'Universitas Nusa Cendana',                k: 'Kupang',             u: 'undana.ac.id' },
    { s: 'UNPATTI', n: 'Universitas Pattimura',                   k: 'Ambon',              u: 'unpatti.ac.id' },
    { s: 'POLBAN',  n: 'Politeknik Negeri Bandung',               k: 'Bandung',            u: 'polban.ac.id' },
    { s: 'PNJ',     n: 'Politeknik Negeri Jakarta',               k: 'Depok',              u: 'pnj.ac.id' },
    { s: 'PENS',    n: 'Politeknik Elektronika Negeri Surabaya',  k: 'Surabaya',           u: 'pens.ac.id' },
    { s: 'POLINES', n: 'Politeknik Negeri Semarang',              k: 'Semarang',           u: 'polines.ac.id' },
    { s: 'POLINEMA',n: 'Politeknik Negeri Malang',                k: 'Malang',             u: 'polinema.ac.id' },
    { s: 'POLSRI',  n: 'Politeknik Negeri Sriwijaya',             k: 'Palembang',          u: 'polsri.ac.id' }
];

function utbkCariPtn(teks) {
    const q = String(teks || '').trim().toLowerCase();
    if (!q) return null;
    return UTBK_PTN.find(p => p.n.toLowerCase() === q || p.s.toLowerCase() === q) || null;
}
