// ====================================================================
// LATIHAN MATEMATIKA DASAR
//   Topik: penjumlahan, pengurangan, perkalian, pembagian, pangkat, akar,
//          persen, pecahan, desimal.
//   Kesulitan: mudah, sedang, sulit, atau acak.
//   Mode: time attack (1-5 menit) atau jumlah soal.
//
// Soal TIDAK disimpan sebagai daftar tetap, melainkan dibuat oleh generator tiap kali
// (puluhan ribu kombinasi unik). Semua jawaban dihitung dengan bilangan pecahan eksak
// (bukan bilangan desimal komputer), jadi tidak ada galat pembulatan.
// Hasil tiap sesi disimpan di tabel latihan_matdas (RLS: hanya pemilik data).
// ====================================================================

const MD_TOPIK = {
    tambah:  { nama: 'Penjumlahan' },
    kurang:  { nama: 'Pengurangan' },
    kali:    { nama: 'Perkalian' },
    bagi:    { nama: 'Pembagian' },
    pangkat: { nama: 'Pangkat' },
    akar:    { nama: 'Akar' },
    persen:  { nama: 'Persen' },
    pecahan: { nama: 'Pecahan' },
    desimal: { nama: 'Desimal' }
};
const MD_URUT_TOPIK = Object.keys(MD_TOPIK);
const MD_KESULITAN = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit', acak: 'Acak' };
const MD_MENIT = [1, 2, 3, 4, 5];
const MD_JUMLAH = [10, 20, 30, 50, 100];

// ---------- Bilangan pecahan eksak ----------
const mdRnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const mdPick = (arr) => arr[mdRnd(0, arr.length - 1)];
function mdGcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function mdR(n, d = 1) {
    if (d === 0) throw new Error('penyebut nol');
    if (d < 0) { n = -n; d = -d; }
    const g = mdGcd(n, d) || 1;
    return { n: n / g, d: d / g };
}
const mdAdd = (x, y) => mdR(x.n * y.d + y.n * x.d, x.d * y.d);
const mdSub = (x, y) => mdR(x.n * y.d - y.n * x.d, x.d * y.d);
const mdMul = (x, y) => mdR(x.n * y.n, x.d * y.d);
const mdDiv = (x, y) => mdR(x.n * y.d, x.d * y.n);

// ---------- Tampilan angka ----------
const mdFi = (n) => Number(n).toLocaleString('id-ID');
const mdFiS = (n) => (n < 0 ? '−' : '') + mdFi(Math.abs(n));
// Bilangan bulat v berskala 10^p -> "12,35" (opsi: trim = buang nol di belakang, dot = titik desimal untuk ekspresi)
function mdDec(v, p, opsi = {}) {
    const neg = v < 0;
    const s = String(Math.abs(v)).padStart(p + 1, '0');
    const ip = s.slice(0, s.length - p);
    let fp = p ? s.slice(s.length - p) : '';
    if (opsi.trim) fp = fp.replace(/0+$/, '');
    const sep = opsi.dot ? '.' : ',';
    return (neg ? (opsi.dot ? '-' : '−') : '') + ip + (fp ? sep + fp : '');
}
// Pecahan bersusun
const mdF = (n, d) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .25em;line-height:1.15;font-size:.85em"><span style="padding:0 .3em;border-bottom:2px solid currentColor">${n}</span><span style="padding:0 .3em">${d}</span></span>`;
// Pangkat: tulisan kecil di atas, gayanya ditulis langsung agar selalu tampil sebagai pangkat
const mdSup = (e) => `<sup style="font-size:.62em;line-height:0;vertical-align:super;margin-left:.05em">${e}</sup>`;
// Akar: tanda akar tebal + garis di atas angka, supaya tidak terbaca sebagai angka biasa. 'pangkat' = indeks akar (3 untuk akar pangkat tiga)
const mdAkar = (isi, pangkat) => `<span style="white-space:nowrap">${pangkat ? `<sup style="font-size:.55em;line-height:0;vertical-align:super;margin-right:-.05em">${pangkat}</sup>` : ''}<span style="font-weight:800;font-size:1.1em;margin-right:.04em">√</span><span style="border-top:2px solid currentColor;padding:.1em .14em 0">${isi}</span></span>`;

function mdRatDec(r) {
    for (let k = 0; k <= 6; k++) {
        const p = Math.pow(10, k);
        if (p % r.d === 0) return mdDec(r.n * (p / r.d), k, { trim: true });
    }
    return `${r.n}/${r.d}`;
}
function mdTampilJawab(q) {
    const r = q.jawab;
    if (q.format === 'des') return mdRatDec(r);
    if (r.d === 1) return mdFiS(r.n);
    return `${r.n < 0 ? '−' : ''}${Math.abs(r.n)}/${r.d}`;
}

function mdMk(html, ekspresi, jawab, extra) {
    return Object.assign({ html, ekspresi, jawab, format: null, sederhana: false, hint: '' }, extra || {});
}

// ====================================================================
// PEMERIKSA TAMPILAN
// Membaca ulang soal dari HTML yang BENAR-BENAR tampil di layar (bukan dari rumus pembuatnya),
// menghitung jawabannya sendiri dengan pecahan eksak, lalu membandingkannya dengan jawaban yang
// disimpan. Soal yang tidak cocok tidak akan dimunculkan (dibuat ulang).
// ====================================================================
function mdDesimalKeR(s) {
    const [a, b = ''] = String(s).split('.');
    return mdR(Number(a + b), 10 ** b.length);
}
function mdAngkaId(s) { return mdDesimalKeR(String(s).replace(/\./g, '').replace(',', '.')); }   // "1.234,5" -> 2469/2
function mdAkarEksak(v, k) {
    const ak = (n) => { const r = Math.round(Math.pow(n, 1 / k)); for (const c of [r - 1, r, r + 1]) if (c >= 0 && Math.pow(c, k) === n) return c; throw new Error('bukan pangkat sempurna'); };
    return mdR(ak(v.n), ak(v.d));
}
function mdPangkatR(b, e) {
    let n = 1, d = 1;
    for (let i = 0; i < Math.abs(e); i++) { n *= b.n; d *= b.d; }
    return e >= 0 ? mdR(n, d) : mdR(d, n);
}
function mdEvalEkspresi(t) {
    let i = 0;
    const pk = () => t[i];
    const tutup = () => { if (t[i] !== ')') throw new Error('kurung'); i++; };
    function atom() {
        if (pk() === '(') { i++; const v = expr(); tutup(); return v; }
        if (t.startsWith('sqrt(', i)) { i += 5; const v = expr(); tutup(); return mdAkarEksak(v, 2); }
        if (t.startsWith('cbrt(', i)) { i += 5; const v = expr(); tutup(); return mdAkarEksak(v, 3); }
        const m = /^\d+(\.\d+)?/.exec(t.slice(i));
        if (!m) throw new Error('angka');
        i += m[0].length;
        return mdDesimalKeR(m[0]);
    }
    function pangkat() {
        const b = atom();
        if (pk() === '^') { i++; const e = unary(); if (e.d !== 1) throw new Error('pangkat'); return mdPangkatR(b, e.n); }
        return b;
    }
    function unary() { if (pk() === '-') { i++; const v = unary(); return mdR(-v.n, v.d); } return pangkat(); }
    function term() {
        let v = unary();
        while (pk() === '*' || pk() === '/') { const op = t[i++]; const w = unary(); v = op === '*' ? mdMul(v, w) : mdDiv(v, w); }
        return v;
    }
    function expr() {
        let v = term();
        while (pk() === '+' || pk() === '-') { const op = t[i++]; const w = term(); v = op === '+' ? mdAdd(v, w) : mdSub(v, w); }
        return v;
    }
    const v = expr();
    if (i !== t.length) throw new Error('sisa');
    return v;
}

// HTML soal -> teks ekspresi yang bisa dihitung. Pecahan jadi (a/b), akar jadi sqrt()/cbrt(), pangkat jadi ^(..)
function mdTampilanKeTeks(html) {
    let s = String(html);
    s = s.replace(/<span style="display:inline-flex[^>]*><span[^>]*>([^<]*)<\/span><span[^>]*>([^<]*)<\/span><\/span>/g, '($1/$2)');
    s = s.replace(/<span style="white-space:nowrap">(?:<sup[^>]*>(\d+)<\/sup>)?<span[^>]*>√<\/span><span[^>]*>([^<]*)<\/span><\/span>/g,
        (m, idx, isi) => (idx === '3' ? 'cbrt(' : 'sqrt(') + isi + ')');
    s = s.replace(/<sup[^>]*>([^<]*)<\/sup>/g, '^($1)');
    return s.replace(/<[^>]+>/g, '');
}
function mdNormalisasi(teks) {
    return teks.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '.');
}
// Soal berbentuk kalimat: dibaca menurut kerangka kalimatnya
function mdEvalKalimat(t) {
    const N = '([\\d.,]+)';
    let m;
    if ((m = new RegExp(`^${N}% dari suatu bilangan adalah ${N}\\.`).exec(t))) return mdDiv(mdMul(mdAngkaId(m[2]), mdR(100)), mdAngkaId(m[1]));
    if ((m = new RegExp(`^${N}% dari ${N}$`).exec(t))) return mdDiv(mdMul(mdAngkaId(m[2]), mdAngkaId(m[1])), mdR(100));
    if ((m = new RegExp(`^${N} adalah berapa persen dari ${N}\\?$`).exec(t))) return mdMul(mdDiv(mdAngkaId(m[1]), mdAngkaId(m[2])), mdR(100));
    if ((m = new RegExp(`^Harga barang Rp${N} didiskon ${N}%\\.`).exec(t))) return mdDiv(mdMul(mdAngkaId(m[1]), mdSub(mdR(100), mdAngkaId(m[2]))), mdR(100));
    if ((m = new RegExp(`^Gaji Rp${N} naik ${N}%\\.`).exec(t))) return mdDiv(mdMul(mdAngkaId(m[1]), mdAdd(mdR(100), mdAngkaId(m[2]))), mdR(100));
    if ((m = /^Sederhanakan (\(\d+\/\d+\))$/.exec(t))) return mdEvalEkspresi(m[1]);
    if ((m = /^Ubah (\(\d+\/\d+\)) ke desimal$/.exec(t))) return mdEvalEkspresi(m[1]);
    if ((m = new RegExp(`^Ubah ${N} ke pecahan paling sederhana$`).exec(t))) return mdAngkaId(m[1]);
    if ((m = new RegExp(`^(\\(\\d+/\\d+\\)) dari ${N}$`).exec(t))) return mdMul(mdEvalEkspresi(m[1]), mdAngkaId(m[2]));
    return null;   // kerangka kalimat tak dikenal: tidak diverifikasi
}
// true = tampilan & jawaban cocok, false = TIDAK cocok, null = tidak bisa diverifikasi
function mdVerifikasiTampilan(q) {
    try {
        const teks = mdTampilanKeTeks(q.html);
        const nilai = /[A-Za-z]{3,}/.test(teks.replace(/sqrt|cbrt/g, '')) ? mdEvalKalimat(teks) : mdEvalEkspresi(mdNormalisasi(teks));
        if (!nilai) return null;
        return nilai.n === q.jawab.n && nilai.d === q.jawab.d;
    } catch (e) {
        return null;
    }
}

// ====================================================================
// GENERATOR SOAL
// ====================================================================
const MD_GEN = {
    tambah: {
        mudah() { const a = mdRnd(11, 99), b = mdRnd(11, 99); return mdMk(`${a} + ${b}`, `${a}+${b}`, mdR(a + b)); },
        sedang() {
            if (mdRnd(0, 1)) { const a = mdRnd(101, 899), b = mdRnd(101, 899); return mdMk(`${a} + ${b}`, `${a}+${b}`, mdR(a + b)); }
            const a = mdRnd(12, 98), b = mdRnd(12, 98), c = mdRnd(12, 98);
            return mdMk(`${a} + ${b} + ${c}`, `${a}+${b}+${c}`, mdR(a + b + c));
        },
        sulit() {
            const t = mdRnd(0, 2);
            if (t === 0) { const a = mdRnd(1001, 8999), b = mdRnd(1001, 8999), c = mdRnd(101, 999); return mdMk(`${mdFi(a)} + ${mdFi(b)} + ${mdFi(c)}`, `${a}+${b}+${c}`, mdR(a + b + c)); }
            if (t === 1) { const a = mdRnd(101, 999), b = mdRnd(101, 999); return mdMk(`−${a} + ${b}`, `-${a}+${b}`, mdR(b - a)); }
            const a = mdRnd(101, 999), b = mdRnd(101, 999);
            return mdMk(`−${a} − ${b}`, `-${a}-${b}`, mdR(-a - b));
        }
    },
    kurang: {
        mudah() { const a = mdRnd(21, 99), b = mdRnd(11, a - 1); return mdMk(`${a} − ${b}`, `${a}-${b}`, mdR(a - b)); },
        sedang() {
            const t = mdRnd(0, 2);
            if (t === 0) { const a = mdRnd(301, 999), b = mdRnd(101, a - 1); return mdMk(`${a} − ${b}`, `${a}-${b}`, mdR(a - b)); }
            if (t === 1) { const b = mdRnd(11, 99); return mdMk(`${mdFi(1000)} − ${b}`, `1000-${b}`, mdR(1000 - b)); }
            const a = mdRnd(300, 900), b = mdRnd(11, 99), c = mdRnd(11, 99);
            return mdMk(`${a} − ${b} − ${c}`, `${a}-${b}-${c}`, mdR(a - b - c));
        },
        sulit() {
            const t = mdRnd(0, 2);
            if (t === 0) { const a = mdRnd(1001, 9999), b = mdRnd(1001, 9999); return mdMk(`${mdFi(a)} − ${mdFi(b)}`, `${a}-${b}`, mdR(a - b)); }
            if (t === 1) { const a = mdRnd(2001, 9999), b = mdRnd(101, 999), c = mdRnd(101, 999); return mdMk(`${mdFi(a)} − ${b} − ${c}`, `${a}-${b}-${c}`, mdR(a - b - c)); }
            const a = mdRnd(101, 999), b = mdRnd(101, 999);
            return mdMk(`${a} − (−${b})`, `${a}-(-${b})`, mdR(a + b));
        }
    },
    kali: {
        mudah() { const a = mdRnd(2, 10), b = mdRnd(2, 10); return mdMk(`${a} × ${b}`, `${a}*${b}`, mdR(a * b)); },
        sedang() {
            const t = mdRnd(0, 1);
            const a = t ? mdRnd(11, 19) : mdRnd(12, 99), b = t ? mdRnd(11, 19) : mdRnd(3, 9);
            return mdMk(`${a} × ${b}`, `${a}*${b}`, mdR(a * b));
        },
        sulit() {
            const t = mdRnd(0, 3);
            if (t === 0) { const a = mdRnd(21, 99), b = mdRnd(21, 99); return mdMk(`${a} × ${b}`, `${a}*${b}`, mdR(a * b)); }
            if (t === 1) { const a = mdRnd(101, 999), b = mdRnd(3, 9); return mdMk(`${a} × ${b}`, `${a}*${b}`, mdR(a * b)); }
            if (t === 2) { const b = 4 * mdRnd(3, 30); return mdMk(`25 × ${b}`, `25*${b}`, mdR(25 * b)); }
            const a = mdRnd(101, 399), b = mdRnd(11, 19);
            return mdMk(`${a} × ${b}`, `${a}*${b}`, mdR(a * b));
        }
    },
    bagi: {
        mudah() { const d = mdRnd(2, 10), q = mdRnd(2, 10), a = d * q; return mdMk(`${a} ÷ ${d}`, `${a}/${d}`, mdR(q)); },
        sedang() { const d = mdRnd(3, 15), q = mdRnd(11, 60), a = d * q; return mdMk(`${a} ÷ ${d}`, `${a}/${d}`, mdR(q)); },
        sulit() {
            if (mdRnd(0, 2) > 0) { const d = mdRnd(12, 49), q = mdRnd(12, 99), a = d * q; return mdMk(`${mdFi(a)} ÷ ${d}`, `${a}/${d}`, mdR(q)); }
            const d = mdPick([2, 4, 5, 8]);
            let a = mdRnd(11, 199);
            if (a % d === 0) a += 1;
            return mdMk(`${a} ÷ ${d}`, `${a}/${d}`, mdR(a, d), { format: 'des', hint: 'Jawab dalam desimal, contoh 12,5' });
        }
    },
    pangkat: {
        mudah() {
            if (mdRnd(0, 2) > 0) { const n = mdRnd(2, 12); return mdMk(`${n}${mdSup(`2`)}`, `${n}^2`, mdR(n * n)); }
            const n = mdRnd(2, 5); return mdMk(`${n}${mdSup(`3`)}`, `${n}^3`, mdR(n ** 3));
        },
        sedang() {
            const t = mdRnd(0, 4);
            if (t === 4) { const a = mdRnd(2, 12), b = mdRnd(2, 12); return mdMk(`${a}${mdSup(`2`)} + ${b}${mdSup(`2`)}`, `${a}^2+${b}^2`, mdR(a * a + b * b), { hint: 'Hitung tiap pangkat lebih dulu, lalu jumlahkan.' }); }
            if (t === 0) { const n = mdRnd(13, 25); return mdMk(`${n}${mdSup(`2`)}`, `${n}^2`, mdR(n * n)); }
            if (t === 1) { const n = mdRnd(2, 10); return mdMk(`${n}${mdSup(`3`)}`, `${n}^3`, mdR(n ** 3)); }
            if (t === 2) { const k = mdRnd(5, 10); return mdMk(`2${mdSup(`${k}`)}`, `2^${k}`, mdR(2 ** k)); }
            const k = mdRnd(2, 6); return mdMk(`10${mdSup(`${k}`)}`, `10^${k}`, mdR(10 ** k));
        },
        sulit() {
            const t = mdRnd(0, 6);
            if (t === 5) { const a = mdRnd(10, 25), b = mdRnd(2, 9); return mdMk(`${a}${mdSup(`2`)} − ${b}${mdSup(`2`)}`, `${a}^2-${b}^2`, mdR(a * a - b * b), { hint: 'Hitung tiap pangkat lebih dulu, lalu kurangkan.' }); }
            if (t === 6) { const a = mdRnd(2, 9), b = mdRnd(2, 12); return mdMk(`${a}${mdSup(`3`)} + ${b}${mdSup(`2`)}`, `${a}^3+${b}^2`, mdR(a ** 3 + b * b), { hint: 'Hitung tiap pangkat lebih dulu, lalu jumlahkan.' }); }
            if (t === 0) {
                const b = mdRnd(2, 9); let e = mdRnd(3, 5);
                while (b ** e > 100000) e--;
                return mdMk(`${b}${mdSup(`${e}`)}`, `${b}^${e}`, mdR(b ** e));
            }
            if (t === 1) { const b = mdRnd(2, 5), e = mdRnd(2, 5); return mdMk(`(−${b})${mdSup(`${e}`)}`, `(-${b})^${e}`, mdR((-b) ** e)); }
            if (t === 2) { const n = mdRnd(2, 99); return mdMk(`${n}${mdSup(`0`)}`, `${n}^0`, mdR(1)); }
            if (t === 3) {
                const b = mdRnd(2, 5), e = mdRnd(1, 3);
                return mdMk(`${b}${mdSup(`−${e}`)}`, `${b}^-${e}`, mdR(1, b ** e), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 1/8' });
            }
            let a, b;
            do { a = mdRnd(1, 5); b = mdRnd(2, 6); } while (mdGcd(a, b) !== 1);
            const e = mdRnd(2, 3);
            return mdMk(`(${mdF(a, b)})${mdSup(`${e}`)}`, `(${a}/${b})^${e}`, mdR(a ** e, b ** e), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 4/9' });
        }
    },
    akar: {
        mudah() {
            const n = mdRnd(2, 12);
            return mdMk(mdAkar(n * n), `sqrt(${n * n})`, mdR(n), { hint: 'Akar kuadrat: bilangan yang jika dikuadratkan sama dengan angka di bawah tanda akar.' });
        },
        sedang() {
            const t = mdRnd(0, 2);
            if (t === 0) { const n = mdRnd(13, 30); return mdMk(mdAkar(mdFi(n * n)), `sqrt(${n * n})`, mdR(n), { hint: 'Akar kuadrat: bilangan yang jika dikuadratkan sama dengan angka di bawah tanda akar.' }); }
            if (t === 1) {
                const n = mdRnd(2, 15), m = mdRnd(2, 15);
                return mdMk(`${mdAkar(n * n)} + ${mdAkar(m * m)}`, `sqrt(${n * n})+sqrt(${m * m})`, mdR(n + m), { hint: 'Hitung nilai tiap akar kuadrat lebih dulu, lalu jumlahkan.' });
            }
            const n = mdRnd(2, 6);
            return mdMk(mdAkar(n ** 3, 3), `cbrt(${n ** 3})`, mdR(n), { hint: 'Akar pangkat tiga (angka 3 kecil di kiri tanda akar): bilangan yang dipangkatkan 3 sama dengan angka ini.' });
        },
        sulit() {
            const t = mdRnd(0, 4);
            if (t === 4) {
                const a = mdRnd(3, 20), b = mdRnd(2, 12);
                return mdMk(`${mdAkar(mdFi(a * a))} × ${mdAkar(b * b)}`, `sqrt(${a * a})*sqrt(${b * b})`, mdR(a * b), { hint: 'Hitung nilai tiap akar kuadrat lebih dulu, lalu kalikan.' });
            }
            if (t === 0) { const n = mdRnd(31, 60); return mdMk(mdAkar(mdFi(n * n)), `sqrt(${n * n})`, mdR(n), { hint: 'Akar kuadrat: bilangan yang jika dikuadratkan sama dengan angka di bawah tanda akar.' }); }
            if (t === 1) { const n = mdRnd(7, 12); return mdMk(mdAkar(mdFi(n ** 3), 3), `cbrt(${n ** 3})`, mdR(n), { hint: 'Akar pangkat tiga (angka 3 kecil di kiri tanda akar): bilangan yang dipangkatkan 3 sama dengan angka ini.' }); }
            if (t === 2) {
                const n = mdPick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]);
                return mdMk(mdAkar(mdDec(n * n, 2, { trim: true })), `sqrt(${mdDec(n * n, 2, { trim: true, dot: true })})`, mdR(n, 10), { format: 'des', hint: 'Akar kuadrat. Jawab dalam desimal, contoh 0,7' });
            }
            let a, b;
            do { a = mdRnd(2, 9); b = mdRnd(2, 9); } while (mdGcd(a, b) !== 1 || a >= b);
            return mdMk(mdAkar(mdF(a * a, b * b)), `sqrt(${a * a}/${b * b})`, mdR(a, b), { format: 'frac', hint: 'Akar kuadrat. Jawab dalam pecahan, contoh 7/9' });
        }
    },
    persen: {
        mudah() {
            const p = mdPick([10, 20, 25, 50]), n = 20 * mdRnd(1, 25);
            return mdMk(`${p}% dari ${n}`, `${n}*${p}/100`, mdR(n * p, 100));
        },
        sedang() {
            if (mdRnd(0, 1)) {
                const p = mdPick([5, 12, 15, 16, 24, 30, 35, 36, 40, 45, 60, 75, 80, 90]);
                const step = 100 / mdGcd(p, 100);
                const n = step * mdRnd(1, Math.max(1, Math.floor(1000 / step)));
                return mdMk(`${p}% dari ${mdFi(n)}`, `${n}*${p}/100`, mdR(n * p, 100));
            }
            const p = mdPick([10, 20, 25, 40, 50, 60, 75, 80]), b = 20 * mdRnd(2, 40), a = b * p / 100;
            return mdMk(`${a} adalah berapa persen dari ${b}?`, `${a}/${b}*100`, mdR(p), { hint: 'Jawab dalam angka persen saja, tanpa tanda %' });
        },
        sulit() {
            const t = mdRnd(0, 3);
            if (t === 0) {
                const P = 1000 * mdRnd(20, 300), d = mdPick([10, 15, 20, 25, 30, 35, 40, 45, 50]);
                return mdMk(`Harga barang Rp${mdFi(P)} didiskon ${d}%. Berapa harga yang dibayar (dalam rupiah)?`, `${P}*(100-${d})/100`, mdR(P * (100 - d), 100));
            }
            if (t === 1) {
                const P = 1000 * mdRnd(20, 300), p = mdPick([5, 10, 12, 15, 20, 25]);
                return mdMk(`Gaji Rp${mdFi(P)} naik ${p}%. Berapa gaji barunya (dalam rupiah)?`, `${P}*(100+${p})/100`, mdR(P * (100 + p), 100));
            }
            if (t === 2) {
                const p10 = mdPick([125, 375, 625, 875]), n = 8 * mdRnd(5, 80);
                return mdMk(`${mdDec(p10, 1)}% dari ${n}`, `${n}*${mdDec(p10, 1, { dot: true })}/100`, mdR(n * p10, 1000));
            }
            const p = mdPick([10, 20, 25, 40, 50, 60, 75, 80]), n = 20 * mdRnd(2, 40), y = n * p / 100;
            return mdMk(`${p}% dari suatu bilangan adalah ${y}. Berapa bilangan itu?`, `${y}*100/${p}`, mdR(n));
        }
    },
    pecahan: {
        mudah() {
            const t = mdRnd(0, 2);
            if (t === 0) {
                const d = mdRnd(3, 12); let a = mdRnd(1, d - 1), b = mdRnd(1, d - 1);
                if (mdRnd(0, 1)) return mdMk(`${mdF(a, d)} + ${mdF(b, d)}`, `${a}/${d}+${b}/${d}`, mdR(a + b, d), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 5/6' });
                if (a === b) a = Math.min(d - 1, a + 1);
                if (a < b) [a, b] = [b, a];
                return mdMk(`${mdF(a, d)} − ${mdF(b, d)}`, `${a}/${d}-${b}/${d}`, mdR(a - b, d), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 5/6' });
            }
            if (t === 1) {
                let n, d;
                do { d = mdRnd(3, 12); n = mdRnd(1, d - 1); } while (mdGcd(n, d) !== 1);
                const k = mdRnd(2, 6);
                return mdMk(`Sederhanakan ${mdF(n * k, d * k)}`, `${n * k}/${d * k}`, mdR(n, d), { format: 'frac', sederhana: true, hint: 'Jawab dalam pecahan paling sederhana, contoh 3/4' });
            }
            const k = mdRnd(2, 10), m = k * mdRnd(2, 12);
            return mdMk(`${mdF(1, k)} dari ${m}`, `(1/${k})*${m}`, mdR(m, k));
        },
        sedang() {
            const t = mdRnd(0, 2);
            if (t === 0) {
                const DS = [2, 3, 4, 5, 6, 8, 10, 12];
                let d1, d2, a, b;
                do { d1 = mdPick(DS); d2 = mdPick(DS); a = mdRnd(1, d1 - 1); b = mdRnd(1, d2 - 1); } while (d1 === d2 || a * d2 === b * d1);
                if (mdRnd(0, 1)) return mdMk(`${mdF(a, d1)} + ${mdF(b, d2)}`, `${a}/${d1}+${b}/${d2}`, mdAdd(mdR(a, d1), mdR(b, d2)), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 7/12' });
                if (a * d2 < b * d1) { [a, b] = [b, a]; [d1, d2] = [d2, d1]; }
                return mdMk(`${mdF(a, d1)} − ${mdF(b, d2)}`, `${a}/${d1}-${b}/${d2}`, mdSub(mdR(a, d1), mdR(b, d2)), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 7/12' });
            }
            if (t === 1) {
                const a = mdRnd(1, 8), b = mdRnd(2, 9), c = mdRnd(1, 8), d = mdRnd(2, 9);
                return mdMk(`${mdF(a, b)} × ${mdF(c, d)}`, `(${a}/${b})*(${c}/${d})`, mdMul(mdR(a, b), mdR(c, d)), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 3/10' });
            }
            const d = mdRnd(3, 9), a = mdRnd(2, d - 1), m = d * mdRnd(2, 12);
            return mdMk(`${mdF(a, d)} dari ${m}`, `(${a}/${d})*${m}`, mdR(a * m, d));
        },
        sulit() {
            const t = mdRnd(0, 4);
            if (t === 0) {
                const a = mdRnd(1, 8), b = mdRnd(2, 9), c = mdRnd(1, 8), d = mdRnd(2, 9);
                return mdMk(`${mdF(a, b)} ÷ ${mdF(c, d)}`, `(${a}/${b})/(${c}/${d})`, mdDiv(mdR(a, b), mdR(c, d)), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 9/8' });
            }
            if (t === 1) {
                const DS = [2, 3, 4, 5, 6, 8, 10, 12];
                for (;;) {
                    const b = mdPick(DS), d = mdPick(DS), f = mdPick(DS);
                    const a = mdRnd(1, b), c = mdRnd(1, d), e = mdRnd(1, f);
                    const hasil = mdSub(mdAdd(mdR(a, b), mdR(c, d)), mdR(e, f));
                    if (hasil.n > 0) return mdMk(`${mdF(a, b)} + ${mdF(c, d)} − ${mdF(e, f)}`, `(${a}/${b})+(${c}/${d})-(${e}/${f})`, hasil, { format: 'frac', hint: 'Jawab dalam pecahan, contoh 11/12' });
                }
            }
            if (t === 2) {
                const a = mdRnd(1, 6), b = mdRnd(2, 8), c = mdRnd(1, 6), d = mdRnd(2, 8), e = mdRnd(1, 5), f = mdRnd(2, 8);
                return mdMk(`${mdF(a, b)} × ${mdF(c, d)} + ${mdF(e, f)}`, `(${a}/${b})*(${c}/${d})+(${e}/${f})`, mdAdd(mdMul(mdR(a, b), mdR(c, d)), mdR(e, f)), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 13/24' });
            }
            if (t === 3) {
                const d = mdPick([2, 4, 5, 8, 20, 25]), n = mdRnd(1, d - 1);
                return mdMk(`Ubah ${mdF(n, d)} ke desimal`, `${n}/${d}`, mdR(n, d), { format: 'des', hint: 'Jawab dalam desimal, contoh 0,75' });
            }
            const p = mdPick([2, 3]);
            let v;
            do { v = mdRnd(1, p === 2 ? 99 : 999); } while (v % 10 === 0 || (p === 2 && v % 100 === 0));
            return mdMk(`Ubah ${mdDec(v, p)} ke pecahan paling sederhana`, `${mdDec(v, p, { dot: true })}`, mdR(v, 10 ** p), { format: 'frac', sederhana: true, hint: 'Jawab dalam pecahan paling sederhana, contoh 7/20' });
        }
    },
    desimal: {
        mudah() {
            const a = mdRnd(11, 99), b = mdRnd(11, 99);
            if (mdRnd(0, 1)) return mdMk(`${mdDec(a, 1)} + ${mdDec(b, 1)}`, `${mdDec(a, 1, { dot: true })}+${mdDec(b, 1, { dot: true })}`, mdR(a + b, 10), { format: 'des', hint: 'Jawab dalam desimal' });
            const x = Math.max(a, b), y = Math.min(a, b);
            return mdMk(`${mdDec(x, 1)} − ${mdDec(y, 1)}`, `${mdDec(x, 1, { dot: true })}-${mdDec(y, 1, { dot: true })}`, mdR(x - y, 10), { format: 'des', hint: 'Jawab dalam desimal' });
        },
        sedang() {
            const t = mdRnd(0, 2);
            if (t === 0) {
                const a = mdRnd(101, 999), b = mdRnd(101, 999);
                if (mdRnd(0, 1)) return mdMk(`${mdDec(a, 2)} + ${mdDec(b, 2)}`, `${mdDec(a, 2, { dot: true })}+${mdDec(b, 2, { dot: true })}`, mdR(a + b, 100), { format: 'des', hint: 'Jawab dalam desimal' });
                const x = Math.max(a, b), y = Math.min(a, b);
                return mdMk(`${mdDec(x, 2)} − ${mdDec(y, 2)}`, `${mdDec(x, 2, { dot: true })}-${mdDec(y, 2, { dot: true })}`, mdR(x - y, 100), { format: 'des', hint: 'Jawab dalam desimal' });
            }
            if (t === 1) {
                const a = mdRnd(11, 99), b = mdRnd(3, 12);
                return mdMk(`${mdDec(a, 1)} × ${b}`, `${mdDec(a, 1, { dot: true })}*${b}`, mdR(a * b, 10), { format: 'des', hint: 'Jawab dalam desimal' });
            }
            const q = mdRnd(11, 99), d = mdRnd(2, 9);
            return mdMk(`${mdDec(q * d, 1)} ÷ ${d}`, `${mdDec(q * d, 1, { dot: true })}/${d}`, mdR(q, 10), { format: 'des', hint: 'Jawab dalam desimal' });
        },
        sulit() {
            const t = mdRnd(0, 2);
            if (t === 0) {
                const a = mdRnd(2, 25), b = mdRnd(2, 25);
                return mdMk(`${mdDec(a, 1)} × ${mdDec(b, 1)}`, `${mdDec(a, 1, { dot: true })}*${mdDec(b, 1, { dot: true })}`, mdR(a * b, 100), { format: 'des', hint: 'Jawab dalam desimal' });
            }
            if (t === 1) {
                const q = mdRnd(2, 60), v2 = mdRnd(2, 25);
                return mdMk(`${mdDec(q * v2, 2, { trim: true })} ÷ ${mdDec(v2, 2)}`, `${mdDec(q * v2, 2, { trim: true, dot: true })}/${mdDec(v2, 2, { dot: true })}`, mdR(q), { format: 'des', hint: 'Jawab dalam desimal atau bilangan bulat' });
            }
            const a = mdRnd(101, 999), b = mdRnd(101, 999), c = mdRnd(11, 99);
            const hasil = mdR(a + b - c, 100);
            return mdMk(`${mdDec(a, 2)} + ${mdDec(b, 2)} − ${mdDec(c, 2)}`, `${mdDec(a, 2, { dot: true })}+${mdDec(b, 2, { dot: true })}-${mdDec(c, 2, { dot: true })}`, hasil, { format: 'des', hint: 'Jawab dalam desimal' });
        }
    }
};

// Buat satu soal dari topik terpilih. 'sudah' = himpunan soal yang sudah keluar (hindari pengulangan).
function mdBuatSoal(daftarTopik, kesulitan, sudah) {
    let q;
    for (let i = 0; i < 40; i++) {
        const tp = mdPick(daftarTopik);
        const kes = kesulitan === 'acak' ? mdPick(['mudah', 'sedang', 'sulit']) : kesulitan;
        q = MD_GEN[tp][kes]();
        q.topik = tp; q.kes = kes;
        if (mdVerifikasiTampilan(q) === false) {   // jaring pengaman: soal yang tampilannya tak cocok dengan jawabannya dibuang
            console.warn('Soal dibuang (tampilan tidak cocok dengan jawaban):', q.ekspresi);
            continue;
        }
        if (!sudah || !sudah.has(q.html)) break;
    }
    if (sudah) sudah.add(q.html);
    return q;
}

// ====================================================================
// PEMERIKSAAN JAWABAN
// ====================================================================
function mdParseJawab(teks) {
    const s = String(teks).trim().replace(/−/g, '-').replace(/\s+/g, '').replace(',', '.');
    let m;
    if ((m = s.match(/^(-?)(\d{1,12})$/))) {
        return { r: mdR(Number(m[1] + m[2])), adaSlash: false, adaDesimal: false };
    }
    if ((m = s.match(/^(-?)(\d{1,12})\.(\d{1,6})$/))) {
        const n = Number(m[2] + m[3]) * (m[1] ? -1 : 1);
        return { r: mdR(n, 10 ** m[3].length), adaSlash: false, adaDesimal: true };
    }
    if ((m = s.match(/^(-?)(\d{1,9})\/(\d{1,9})$/))) {
        const d = Number(m[3]);
        if (d === 0) return null;
        const n = Number(m[2]) * (m[1] ? -1 : 1);
        return { r: mdR(n, d), adaSlash: true, adaDesimal: false, n, d };
    }
    return null;
}

// true = benar, false = salah, null = format tidak valid
function mdPeriksa(q, teks) {
    const p = mdParseJawab(teks);
    if (!p) return null;
    let ok = p.r.n === q.jawab.n && p.r.d === q.jawab.d;
    if (ok && q.format === 'des' && p.adaSlash) ok = false;
    if (ok && q.format === 'frac' && p.adaDesimal) ok = false;
    if (ok && q.sederhana && (!p.adaSlash || mdGcd(p.n, p.d) !== 1)) ok = false;
    return ok;
}

// ====================================================================
// STATE
// ====================================================================
const md = {
    fase: 'setup',            // setup | main | hasil
    tab: 'latih',             // latih | riwayat (hanya pada fase setup)
    topik: new Set(MD_URUT_TOPIK), kes: 'sedang', mode: 'waktu', menit: 2, jumlah: 20,
    q: null, input: '', hasil: [], sudah: new Set(),
    mulai: 0, tSoal: 0, batasMs: 0, timer: null, jeda: null, kunci: false,
    ringkas: null, status: '',
    riwayat: [], riwayatMuat: false
};

function mdMuatSetelan() {
    try {
        const s = JSON.parse(localStorage.getItem('matdas_setelan') || 'null');
        if (!s) return;
        const t = (s.topik || []).filter(k => MD_TOPIK[k]);
        if (t.length) md.topik = new Set(t);
        if (MD_KESULITAN[s.kes]) md.kes = s.kes;
        if (s.mode === 'waktu' || s.mode === 'jumlah') md.mode = s.mode;
        if (MD_MENIT.includes(s.menit)) md.menit = s.menit;
        if (MD_JUMLAH.includes(s.jumlah)) md.jumlah = s.jumlah;
    } catch (e) { /* abaikan */ }
}
function mdSimpanSetelan() {
    try {
        localStorage.setItem('matdas_setelan', JSON.stringify({ topik: [...md.topik], kes: md.kes, mode: md.mode, menit: md.menit, jumlah: md.jumlah }));
    } catch (e) { /* abaikan */ }
}

function resetMatdasState() {
    mdHentikan();
    Object.assign(md, { fase: 'setup', tab: 'latih', q: null, input: '', hasil: [], sudah: new Set(), ringkas: null, status: '', riwayat: [], riwayatMuat: false });
    const root = document.getElementById('matdas-root');
    if (root) root.innerHTML = '';
}

function mdHentikan() {
    if (md.timer) { clearInterval(md.timer); md.timer = null; }
    if (md.jeda) { clearTimeout(md.jeda); md.jeda = null; }
    document.removeEventListener('keydown', mdKey);
    document.body.classList.remove('game-berjalan');
    md.kunci = false;
}

// Dipanggil showDashPage() saat berpindah dari halaman latihan: sesi yang berjalan dibatalkan
function matdasOnLeave() {
    if (md.fase === 'main') { mdHentikan(); md.fase = 'setup'; }
}

async function openMatdasPage() {
    if (!activeUser) return;
    mdMuatSetelan();
    if (md.fase === 'main') { mdHentikan(); md.fase = 'setup'; }
    if (md.fase === 'hasil') md.fase = 'setup';
    showDashPage('matdas');
    mdRender();
    await mgMuatRiwayat('matematika');
    if (md.fase === 'setup') mdRender();
}

// ====================================================================
// RIWAYAT & REKOR: fungsi bersama ada di js/minigames.js
// ====================================================================
const mdFmtWaktu = (d) => mgFmtWaktu(d);
const mdLabelMode = (m, b) => mgLabelMode(m, b);
async function mdMuatRiwayat() { await mgMuatRiwayat('matematika'); }

// ====================================================================
// RENDER
// ====================================================================
function mdRender() {
    const root = document.getElementById('matdas-root');
    if (!root) return;
    root.innerHTML = md.fase === 'main' ? mdViewMain() : md.fase === 'hasil' ? mdViewHasil() : mdViewSetup();
    lucide.createIcons();
    if (md.fase === 'main') mdUpdateInput();
}

function mdChip(aktif, onclick, label, ekstra = '') {
    return `<button type="button" onclick="${onclick}" aria-pressed="${aktif}" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition touch-manipulation ${aktif ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'} ${ekstra}">${label}</button>`;
}

function mdViewSetup() {
    const tabs = [['latih', 'Latihan'], ['riwayat', 'Riwayat dan rekor']].map(([k, l]) =>
        `<button type="button" onclick="mdGantiTab('${k}')" ${md.tab === k ? 'aria-current="page"' : ''}
            class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${md.tab === k ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white'}">${l}</button>`).join('');
    return `<div class="flex flex-col gap-5">
        <div class="flex gap-2">${tabs}</div>
        ${md.tab === 'latih' ? mdViewPengaturan() : mdViewRiwayat()}
    </div>`;
}

function mdViewPengaturan() {
    const semua = md.topik.size === MD_URUT_TOPIK.length;
    const topik = MD_URUT_TOPIK.map(k => mdChip(md.topik.has(k), `mdToggleTopik('${k}')`, MD_TOPIK[k].nama)).join('');
    const kes = Object.entries(MD_KESULITAN).map(([k, l]) => mdChip(md.kes === k, `mdSet('kes','${k}')`, l)).join('');
    const mode = [['waktu', 'Time attack'], ['jumlah', 'Jumlah soal']].map(([k, l]) => mdChip(md.mode === k, `mdSet('mode','${k}')`, l)).join('');
    const sub = md.mode === 'waktu'
        ? MD_MENIT.map(m => mdChip(md.menit === m, `mdSet('menit',${m})`, `${m} menit`)).join('')
        : MD_JUMLAH.map(j => mdChip(md.jumlah === j, `mdSet('jumlah',${j})`, `${j} soal`)).join('');
    const label = (t) => `<p class="text-sm font-semibold text-slate-700 mb-2">${t}</p>`;
    return `
        <p class="text-sm text-slate-600 leading-relaxed">Latihan hitung cepat. Soal dibuat otomatis setiap kali, jadi tidak akan habis dan jarang berulang. Poin tiap sesi masuk ke peringkat Mini Games.</p>
        <div>${label('Topik')}<div class="flex flex-wrap gap-2">
            ${mdChip(semua, "mdToggleSemua()", 'Semua topik')}${topik}</div></div>
        <div>${label('Kesulitan')}<div class="flex flex-wrap gap-2">${kes}</div></div>
        <div>${label('Mode')}<div class="flex flex-wrap gap-2">${mode}</div>
            <div class="flex flex-wrap gap-2 mt-2">${sub}</div>
            <p class="text-xs text-slate-400 mt-2">${md.mode === 'waktu'
                ? 'Jawab sebanyak mungkin soal sebelum waktu habis. Jawaban salah tidak mengurangi nilai, tapi menghabiskan waktu.'
                : 'Selesaikan semua soal secepat dan seakurat mungkin. Waktu dihitung dari soal pertama.'}</p></div>
        <div class="flex justify-end">
            <button type="button" onclick="mdMulai()" class="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                <i data-lucide="play" class="w-4 h-4"></i> Mulai latihan
            </button>
        </div>`;
}

function mdGantiTab(t) { md.tab = t; mdRender(); }
function mdSet(kunci, nilai) { md[kunci] = nilai; mdSimpanSetelan(); mdRender(); }
function mdToggleTopik(k) {
    if (md.topik.has(k)) { if (md.topik.size > 1) md.topik.delete(k); } else md.topik.add(k);
    mdSimpanSetelan(); mdRender();
}
function mdToggleSemua() { md.topik = new Set(MD_URUT_TOPIK); mdSimpanSetelan(); mdRender(); }

// ---------- Riwayat ----------
function mdViewRiwayat() { return mgViewRiwayat('matematika'); }

// ---------- Layar latihan ----------
function mdViewMain() {
    const waktu = md.mode === 'waktu';
    const KEY = (k, label, kelas = '') => `<button type="button" onclick="mdTombol('${k}')" aria-label="${label || k}"
        class="h-14 rounded-xl text-xl font-bold touch-manipulation select-none transition active:scale-95 ${kelas || 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 active:bg-slate-100'}">${label && label.length > 2 ? '' : (label || k)}</button>`;
    const aksi = 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 border border-slate-200';
    return `
    <div class="flex flex-col gap-4 max-w-md mx-auto">
        <div class="flex items-center justify-between">
            <button type="button" onclick="mdKeluar()" class="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"><i data-lucide="x" class="w-4 h-4"></i> Keluar</button>
            <p class="text-sm font-semibold text-slate-600">Benar <span id="md-benar" class="text-emerald-600">${md.hasil.filter(h => h.benar).length}</span></p>
        </div>
        <div>
            ${waktu ? `<p id="md-waktu" role="timer" class="text-4xl font-extrabold tabular-nums text-slate-800 text-center">${mdFmtWaktu(md.menit * 60)}</p>`
                : `<p class="text-center text-sm font-semibold text-slate-600">Soal <span id="md-nomor">${md.hasil.length + 1}</span> dari ${md.jumlah}
                    <span id="md-lewat" class="text-slate-400 font-normal tabular-nums"> (0:00)</span></p>`}
            <div class="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden"><div id="md-bar" class="h-full rounded-full bg-primary-600" style="width:${waktu ? 100 : 0}%"></div></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p id="md-label" class="text-xs text-slate-400">${MD_TOPIK[md.q.topik].nama}</p>
            <div id="md-soal" aria-live="polite" class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums break-words">${md.q.html}</div>
            <p id="md-hint" class="text-xs text-slate-500 mt-3 min-h-[1rem]">${escapeHtml(md.q.hint)}</p>
        </div>
        <div id="md-kotak" class="rounded-xl border-2 border-primary-200 bg-primary-50/40 min-h-[3.75rem] px-4 flex items-center justify-center">
            <span id="md-jawab" class="text-2xl font-bold tabular-nums text-slate-900"></span>
        </div>
        <p id="md-umpan" class="min-h-[3.5rem] text-center text-sm font-semibold" aria-live="assertive"></p>
        <div class="grid grid-cols-4 gap-2">
            ${KEY('7')}${KEY('8')}${KEY('9')}${KEY('⌫', '⌫', aksi)}
            ${KEY('4')}${KEY('5')}${KEY('6')}${KEY('/', '/', aksi)}
            ${KEY('1')}${KEY('2')}${KEY('3')}${KEY('±', '±', aksi)}
            ${KEY('0')}${KEY(',')}${KEY('C', 'C', aksi)}
            <button type="button" onclick="mdTombol('OK')" class="h-14 rounded-xl text-base font-bold bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 touch-manipulation select-none transition active:scale-95">Jawab</button>
        </div>
        <button type="button" onclick="mdLewati()" class="self-center text-sm font-semibold text-slate-500 hover:text-slate-700">Lewati soal ini</button>
    </div>`;
}

function mdUpdateInput() {
    const el = document.getElementById('md-jawab');
    if (!el) return;
    el.textContent = md.input.replace(/^-/, '−');
    el.classList.toggle('text-slate-300', !md.input);
    if (!md.input) el.textContent = 'Jawabanmu';
}

function mdUmpan(teks, kelas) {
    const el = document.getElementById('md-umpan');
    if (!el) return;
    el.textContent = teks;
    el.className = 'min-h-[3.5rem] text-center text-sm font-semibold ' + (kelas || '');
}

// Pembahasan singkat: soal yang berupa hitungan ditampilkan lengkap dengan hasilnya, mis. "√64 + √81 = 17"
function mdPembahasan(q) {
    const teks = q.html.replace(/<[^>]+>/g, ' ');
    if (/[A-Za-z]{3,}/.test(teks)) return '';   // soal berbentuk kalimat: tanpa persamaan
    return `<div class="mt-1 text-lg font-bold text-slate-700 tabular-nums">${q.html} <span class="text-slate-400">=</span> ${mdTampilJawab(q)}</div>`;
}
function mdUmpanSalah(q, kelas) {
    const el = document.getElementById('md-umpan');
    if (!el) return;
    el.innerHTML = `Jawaban yang benar: ${mdTampilJawab(q)}${mdPembahasan(q)}`;
    el.className = 'min-h-[3.5rem] text-center text-sm font-semibold ' + kelas;
}

// ====================================================================
// ALUR LATIHAN
// ====================================================================
function mdMulai() {
    if (!md.topik.size) return alert('Pilih minimal satu topik.');
    md.hasil = []; md.sudah = new Set(); md.ringkas = null; md.status = ''; md.input = '';
    md.fase = 'main';
    md.mulai = Date.now();
    md.batasMs = md.mode === 'waktu' ? md.menit * 60000 : 0;
    md.q = mdBuatSoal([...md.topik], md.kes, md.sudah);
    md.tSoal = Date.now();
    mdHentikan();
    document.body.classList.add('game-berjalan');
    md.timer = setInterval(mdTick, 200);
    document.addEventListener('keydown', mdKey);
    mdRender();
    mdTick();
}

function mdTick() {
    if (md.fase !== 'main') return;
    const lewat = Date.now() - md.mulai;
    if (md.mode === 'waktu') {
        const sisa = md.batasMs - lewat;
        if (sisa <= 0) { mdSelesai(); return; }
        const el = document.getElementById('md-waktu');
        if (el) { el.textContent = mdFmtWaktu(Math.ceil(sisa / 1000)); el.classList.toggle('text-rose-600', sisa <= 10000); }
        const bar = document.getElementById('md-bar');
        if (bar) { bar.style.width = (sisa / md.batasMs * 100) + '%'; bar.classList.toggle('bg-rose-500', sisa <= 10000); }
    } else {
        const el = document.getElementById('md-lewat');
        if (el) el.textContent = ` (${mdFmtWaktu(lewat / 1000)})`;
    }
}

function mdKey(e) {
    if (md.fase !== 'main' || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) mdTombol(k);
    else if (k === ',' || k === '.') mdTombol(',');
    else if (k === '/') mdTombol('/');
    else if (k === '-') mdTombol('±');
    else if (k === 'Backspace') mdTombol('⌫');
    else if (k === 'Enter') mdTombol('OK');
    else return;
    e.preventDefault();
}

function mdTombol(k) {
    if (md.fase !== 'main' || md.kunci) return;
    if (/^\d$/.test(k)) {
        if (md.input.replace(/[-,/]/g, '').length < 12) md.input += k;
    } else if (k === ',') {
        if (!md.input.includes(',') && !md.input.includes('/')) md.input += (md.input === '' || md.input === '-') ? '0,' : ',';
    } else if (k === '/') {
        if (/\d$/.test(md.input) && !md.input.includes('/') && !md.input.includes(',')) md.input += '/';
    } else if (k === '±') {
        md.input = md.input.startsWith('-') ? md.input.slice(1) : '-' + md.input;
    } else if (k === '⌫') {
        md.input = md.input.slice(0, -1);
    } else if (k === 'C') {
        md.input = '';
    } else if (k === 'OK') {
        return mdKirim();
    }
    mdUmpan('', '');
    mdUpdateInput();
}

function mdCatat(benar, jawabUser) {
    md.hasil.push({
        html: md.q.html, topik: md.q.topik, kes: md.q.kes, benar, ekspresi: md.q.ekspresi,
        jawabUser, jawabBenar: mdTampilJawab(md.q), detik: (Date.now() - md.tSoal) / 1000
    });
    const el = document.getElementById('md-benar');
    if (el) el.textContent = md.hasil.filter(h => h.benar).length;
}

function mdKirim() {
    if (md.fase !== 'main' || md.kunci || !md.input) return;
    const ok = mdPeriksa(md.q, md.input);
    if (ok === null) { mdUmpan('Format belum benar. Contoh: 12, 2,5, atau 3/4', 'text-amber-600'); return; }
    mdCatat(ok, md.input);
    md.kunci = true;
    if (ok) mdUmpan('Benar', 'text-emerald-600');
    else mdUmpanSalah(md.q, 'text-rose-600');
    md.jeda = setTimeout(mdLanjut, ok ? 300 : 1800);
}

function mdLewati() {
    if (md.fase !== 'main' || md.kunci) return;
    mdCatat(false, '(dilewati)');
    md.kunci = true;
    mdUmpanSalah(md.q, 'text-slate-600');
    md.jeda = setTimeout(mdLanjut, 1800);
}

function mdLanjut() {
    md.jeda = null; md.kunci = false;
    if (md.fase !== 'main') return;
    if (md.mode === 'jumlah' && md.hasil.length >= md.jumlah) { mdSelesai(); return; }
    if (md.mode === 'waktu' && Date.now() - md.mulai >= md.batasMs) { mdSelesai(); return; }
    md.q = mdBuatSoal([...md.topik], md.kes, md.sudah);
    md.input = '';
    md.tSoal = Date.now();
    mdRender();
    mdTick();
}

function mdKeluar() {
    if (!confirm('Keluar dari latihan? Sesi ini tidak akan disimpan.')) return;
    mdHentikan();
    md.fase = 'setup';
    mdRender();
}

async function mdSelesai() {
    if (md.fase !== 'main') return;
    const lewat = Math.min(Date.now() - md.mulai, md.mode === 'waktu' ? md.batasMs : 7200000);
    mdHentikan();
    md.fase = 'hasil';
    const benar = md.hasil.filter(h => h.benar).length;
    const total = md.hasil.length;
    const durasi = Math.max(1, Math.round(lewat / 1000));
    const batas = md.mode === 'waktu' ? md.menit : md.jumlah;
    const poin = mgPoin(md.hasil);
    const lama = mgRekor('matematika', md.mode, batas);
    md.ringkas = {
        benar, total, durasi, batas, poin,
        rekorBaru: total > 0 && mgLebihBaik({ benar, total, poin, durasi_detik: durasi }, lama, md.mode),
        pertama: !lama
    };
    md.status = total > 0 ? 'Menyimpan hasil...' : '';
    mdRender();
    window.scrollTo({ top: 0 });
    if (!total) return;
    try {
        await mgSimpanSesi('matematika', { mode: md.mode, batas, kesulitan: md.kes, topik: [...md.topik], durasi, hasil: md.hasil });
        md.status = 'Hasil tersimpan di riwayat dan peringkatmu.';
        await mgMuatRiwayat('matematika');
    } catch (err) {
        console.error('Gagal menyimpan hasil latihan:', err);
        md.status = 'Hasil belum tersimpan (periksa koneksi internet).';
    }
    const el = document.getElementById('md-status');
    if (el) el.textContent = md.status;
}

function mdViewHasil() {
    const r = md.ringkas;
    if (!r || !r.total) {
        return `<div class="max-w-md mx-auto text-center py-8">
            <p class="font-bold text-slate-800">Belum ada soal yang dijawab</p>
            <button type="button" onclick="mdKePengaturan()" class="mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Kembali</button></div>`;
    }
    const akurasi = Math.round(r.benar / r.total * 100);
    const tile = (label, nilai) => `<div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"><p class="text-xs text-slate-500">${label}</p><p class="text-xl font-bold text-slate-800 mt-0.5 tabular-nums">${nilai}</p></div>`;
    const per = {};
    md.hasil.forEach(h => { const p = per[h.topik] = per[h.topik] || { b: 0, t: 0 }; p.t++; if (h.benar) p.b++; });
    const perTopik = Object.entries(per).map(([k, v]) => {
        const pct = Math.round(v.b / v.t * 100);
        return `<div class="flex items-center gap-3"><span class="w-24 shrink-0 text-sm text-slate-600">${MD_TOPIK[k].nama}</span>
            <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width:${pct}%"></div></div>
            <span class="w-14 shrink-0 text-right text-sm font-semibold text-slate-700 tabular-nums">${v.b}/${v.t}</span></div>`;
    }).join('');
    const salah = md.hasil.filter(h => !h.benar);
    const reviu = salah.length ? `
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800 mb-1">Soal yang salah (${salah.length})</h4>
            <div class="divide-y divide-slate-100">${salah.map(h => `
                <div class="py-3"><div class="text-lg font-bold text-slate-900 tabular-nums break-words">${h.html}</div>
                <p class="text-sm mt-1"><span class="text-slate-500">Jawabanmu:</span> <span class="font-semibold text-rose-600">${escapeHtml(h.jawabUser)}</span>
                <span class="text-slate-500 ml-3">Benar:</span> <span class="font-semibold text-emerald-600">${escapeHtml(h.jawabBenar)}</span></p>
                <button type="button" onclick="mdSalinDetail(${md.hasil.indexOf(h)})" class="mt-1.5 text-xs font-semibold text-slate-400 hover:text-primary-700 underline">Soal ini keliru? Salin detail</button></div>`).join('')}</div></div>` : '';
    const judul = r.rekorBaru ? (r.pertama ? 'Sesi pertama di mode ini' : 'Rekor baru') : 'Selesai';
    const sub = md.mode === 'waktu'
        ? `${r.benar} soal benar dalam ${r.batas} menit`
        : `${r.benar} dari ${r.total} soal benar`;
    return `<div class="flex flex-col gap-4 max-w-xl mx-auto">
        <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-5">
            <p class="text-sm text-primary-100">${judul}</p>
            <p class="mt-1 text-3xl font-extrabold tracking-tight">${sub}</p>
            <p class="text-sm text-primary-100 mt-2"><b class="text-white">+${mgFmtAngka(r.poin)} poin</b> untuk peringkatmu</p>
            <p class="text-xs text-primary-200 mt-1">${mdLabelMode(md.mode, r.batas)}, tingkat ${MD_KESULITAN[md.kes]}</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${tile('Akurasi', akurasi + '%')}${tile('Soal dijawab', r.total)}
            ${tile('Waktu', mdFmtWaktu(r.durasi))}${tile('Rata-rata per soal', (r.durasi / r.total).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' dtk')}
        </div>
        <p id="md-status" class="text-xs text-slate-400">${escapeHtml(md.status)}</p>
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800 mb-3">Per topik</h4><div class="space-y-3">${perTopik}</div></div>
        ${reviu}
        <div class="flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onclick="mdKePengaturan()" class="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-600 hover:bg-slate-50">Ubah pengaturan</button>
            <button type="button" onclick="mdMulai()" class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm flex items-center justify-center gap-2"><i data-lucide="rotate-ccw" class="w-4 h-4"></i> Main lagi</button>
        </div>
    </div>`;
}

// Menyalin detail satu soal supaya bisa ditempel dan dilaporkan kalau ada soal yang janggal
function mdSalinDetail(i) {
    const h = md.hasil[i];
    if (!h) return;
    const teks = ['Laporan soal matematika',
        `Soal: ${mdNormalisasi(mdTampilanKeTeks(h.html))}`,
        `Jawabanku: ${h.jawabUser}`, `Jawaban sistem: ${h.jawabBenar}`,
        `Rumus: ${h.ekspresi}`, `Topik: ${h.topik}, tingkat ${h.kes}`,
        `Versi aplikasi: ${typeof APP_VERSI !== 'undefined' ? APP_VERSI : '-'}`].join('\n');
    const ok = () => mgToast('Detail soal disalin. Tempel ke chat.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(teks).then(ok).catch(() => window.prompt('Salin teks ini:', teks));
    else window.prompt('Salin teks ini:', teks);
}

function mdKePengaturan() { md.fase = 'setup'; md.tab = 'latih'; mdRender(); window.scrollTo({ top: 0 }); }
