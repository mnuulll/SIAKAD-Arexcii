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
const mdF = (n, d) => `<span class="inline-flex flex-col items-center align-middle mx-1 leading-tight text-[0.82em]"><span class="px-1.5 border-b-2 border-slate-800">${n}</span><span class="px-1.5">${d}</span></span>`;

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
            if (mdRnd(0, 2) > 0) { const n = mdRnd(2, 12); return mdMk(`${n}<sup>2</sup>`, `${n}^2`, mdR(n * n)); }
            const n = mdRnd(2, 5); return mdMk(`${n}<sup>3</sup>`, `${n}^3`, mdR(n ** 3));
        },
        sedang() {
            const t = mdRnd(0, 4);
            if (t === 4) { const a = mdRnd(2, 12), b = mdRnd(2, 12); return mdMk(`${a}<sup>2</sup> + ${b}<sup>2</sup>`, `${a}^2+${b}^2`, mdR(a * a + b * b)); }
            if (t === 0) { const n = mdRnd(13, 25); return mdMk(`${n}<sup>2</sup>`, `${n}^2`, mdR(n * n)); }
            if (t === 1) { const n = mdRnd(2, 10); return mdMk(`${n}<sup>3</sup>`, `${n}^3`, mdR(n ** 3)); }
            if (t === 2) { const k = mdRnd(5, 10); return mdMk(`2<sup>${k}</sup>`, `2^${k}`, mdR(2 ** k)); }
            const k = mdRnd(2, 6); return mdMk(`10<sup>${k}</sup>`, `10^${k}`, mdR(10 ** k));
        },
        sulit() {
            const t = mdRnd(0, 6);
            if (t === 5) { const a = mdRnd(10, 25), b = mdRnd(2, 9); return mdMk(`${a}<sup>2</sup> − ${b}<sup>2</sup>`, `${a}^2-${b}^2`, mdR(a * a - b * b)); }
            if (t === 6) { const a = mdRnd(2, 9), b = mdRnd(2, 12); return mdMk(`${a}<sup>3</sup> + ${b}<sup>2</sup>`, `${a}^3+${b}^2`, mdR(a ** 3 + b * b)); }
            if (t === 0) {
                const b = mdRnd(2, 9); let e = mdRnd(3, 5);
                while (b ** e > 100000) e--;
                return mdMk(`${b}<sup>${e}</sup>`, `${b}^${e}`, mdR(b ** e));
            }
            if (t === 1) { const b = mdRnd(2, 5), e = mdRnd(2, 5); return mdMk(`(−${b})<sup>${e}</sup>`, `(-${b})^${e}`, mdR((-b) ** e)); }
            if (t === 2) { const n = mdRnd(2, 99); return mdMk(`${n}<sup>0</sup>`, `${n}^0`, mdR(1)); }
            if (t === 3) {
                const b = mdRnd(2, 5), e = mdRnd(1, 3);
                return mdMk(`${b}<sup>−${e}</sup>`, `${b}^-${e}`, mdR(1, b ** e), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 1/8' });
            }
            let a, b;
            do { a = mdRnd(1, 5); b = mdRnd(2, 6); } while (mdGcd(a, b) !== 1);
            const e = mdRnd(2, 3);
            return mdMk(`(${mdF(a, b)})<sup>${e}</sup>`, `(${a}/${b})^${e}`, mdR(a ** e, b ** e), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 4/9' });
        }
    },
    akar: {
        mudah() { const n = mdRnd(2, 12); return mdMk(`√${n * n}`, `sqrt(${n * n})`, mdR(n)); },
        sedang() {
            const t = mdRnd(0, 2);
            if (t === 0) { const n = mdRnd(13, 30); return mdMk(`√${mdFi(n * n)}`, `sqrt(${n * n})`, mdR(n)); }
            if (t === 1) { const n = mdRnd(2, 15), m = mdRnd(2, 15); return mdMk(`√${n * n} + √${m * m}`, `sqrt(${n * n})+sqrt(${m * m})`, mdR(n + m)); }
            const n = mdRnd(2, 6); return mdMk(`∛${n ** 3}`, `cbrt(${n ** 3})`, mdR(n));
        },
        sulit() {
            const t = mdRnd(0, 4);
            if (t === 4) { const a = mdRnd(3, 20), b = mdRnd(2, 12); return mdMk(`√${mdFi(a * a)} × √${b * b}`, `sqrt(${a * a})*sqrt(${b * b})`, mdR(a * b)); }
            if (t === 0) { const n = mdRnd(31, 60); return mdMk(`√${mdFi(n * n)}`, `sqrt(${n * n})`, mdR(n)); }
            if (t === 1) { const n = mdRnd(7, 12); return mdMk(`∛${mdFi(n ** 3)}`, `cbrt(${n ** 3})`, mdR(n)); }
            if (t === 2) {
                const n = mdPick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]);
                return mdMk(`√${mdDec(n * n, 2, { trim: true })}`, `sqrt(${mdDec(n * n, 2, { trim: true, dot: true })})`, mdR(n, 10), { format: 'des', hint: 'Jawab dalam desimal, contoh 0,7' });
            }
            let a, b;
            do { a = mdRnd(2, 9); b = mdRnd(2, 9); } while (mdGcd(a, b) !== 1 || a >= b);
            return mdMk(`√${mdF(a * a, b * b)}`, `sqrt(${a * a}/${b * b})`, mdR(a, b), { format: 'frac', hint: 'Jawab dalam pecahan, contoh 7/9' });
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
    md.kunci = false;
}

// Dipanggil showDashPage() saat berpindah dari halaman latihan: sesi yang berjalan dibatalkan
function matdasOnLeave() {
    if (md.fase === 'main') { mdHentikan(); md.fase = 'setup'; }
}

function setupMatdasLauncher() {
    const el = document.getElementById('matdas-launcher');
    if (!el) return;
    el.classList.toggle('hidden', !(activeUser && activeUser.role !== 'wali_kelas'));
}

async function openMatdasPage() {
    if (!activeUser) return;
    mdMuatSetelan();
    if (md.fase === 'main') { mdHentikan(); md.fase = 'setup'; }
    if (md.fase === 'hasil') md.fase = 'setup';
    showDashPage('matdas');
    mdRender();
    await mdMuatRiwayat();
    if (md.fase === 'setup') mdRender();
}

// ====================================================================
// RIWAYAT & REKOR
// ====================================================================
async function mdMuatRiwayat() {
    try {
        const { data, error } = await supabaseClient.from('latihan_matdas').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        md.riwayat = data || [];
        md.riwayatMuat = true;
    } catch (err) {
        console.error('Gagal memuat riwayat latihan:', err);
    }
}

function mdAkurasi(r) { return r.total ? r.benar / r.total : 0; }
// Apakah a lebih baik dari b untuk mode yang sama?
function mdLebihBaik(a, b, mode) {
    if (!b) return true;
    if (mode === 'waktu') return a.benar > b.benar || (a.benar === b.benar && mdAkurasi(a) > mdAkurasi(b));
    return mdAkurasi(a) > mdAkurasi(b) || (mdAkurasi(a) === mdAkurasi(b) && a.durasi_detik < b.durasi_detik);
}
function mdRekor(mode, batas) {
    return md.riwayat.filter(r => r.mode === mode && r.batas === batas).reduce((best, r) => mdLebihBaik(r, best, mode) ? r : best, null);
}
function mdFmtWaktu(detik) {
    const d = Math.max(0, Math.round(detik));
    return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}`;
}
function mdFmtTgl(iso) {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function mdLabelMode(mode, batas) { return mode === 'waktu' ? `Time attack ${batas} menit` : `${batas} soal`; }
function mdToast(msg) {
    let el = document.getElementById('md-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'md-toast';
        el.className = 'fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-opacity duration-200';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(mdToast._t);
    mdToast._t = setTimeout(() => { el.style.opacity = '0'; }, 2400);
}

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
        <p class="text-sm text-slate-600 leading-relaxed">Latihan hitung cepat. Soal dibuat otomatis setiap kali, jadi tidak akan habis dan jarang berulang.</p>
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
function mdViewRiwayat() {
    if (!md.riwayatMuat) return `<p class="text-sm text-slate-400 py-6 text-center">Memuat riwayat...</p>`;
    if (!md.riwayat.length) {
        return `<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p class="font-semibold text-slate-700">Belum ada riwayat</p>
            <p class="text-sm text-slate-400 mt-1">Selesaikan satu sesi latihan, nanti hasil dan rekormu muncul di sini.</p></div>`;
    }
    const kunciRekor = [];
    MD_MENIT.forEach(m => { if (mdRekor('waktu', m)) kunciRekor.push(['waktu', m]); });
    MD_JUMLAH.forEach(j => { if (mdRekor('jumlah', j)) kunciRekor.push(['jumlah', j]); });
    const rekor = kunciRekor.map(([mode, batas]) => {
        const r = mdRekor(mode, batas);
        const nilai = mode === 'waktu' ? `${r.benar} soal benar` : `${Math.round(mdAkurasi(r) * 100)}% dalam ${mdFmtWaktu(r.durasi_detik)}`;
        return `<div class="flex items-center justify-between gap-3 py-2.5">
            <div><p class="text-sm font-semibold text-slate-700">${mdLabelMode(mode, batas)}</p>
                <p class="text-xs text-slate-400">Tingkat ${escapeHtml(MD_KESULITAN[r.kesulitan] || '')}, ${mdFmtTgl(r.created_at)}</p></div>
            <p class="text-sm font-bold text-primary-700 text-right">${nilai}</p></div>`;
    }).join('');
    const daftar = md.riwayat.slice(0, 12).map(r => {
        const topik = (r.topik || []).filter(k => MD_TOPIK[k]).map(k => MD_TOPIK[k].nama);
        const ringkasTopik = topik.length === MD_URUT_TOPIK.length ? 'Semua topik' : topik.join(', ');
        return `<div class="py-3">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0"><p class="text-sm font-semibold text-slate-700">${mdLabelMode(r.mode, r.batas)}, ${escapeHtml(MD_KESULITAN[r.kesulitan] || '')}</p>
                    <p class="text-xs text-slate-400 truncate">${escapeHtml(ringkasTopik)}</p></div>
                <div class="text-right shrink-0"><p class="text-sm font-bold text-slate-800">${Number(r.benar)} dari ${Number(r.total)}</p>
                    <p class="text-xs text-slate-400">${mdFmtTgl(r.created_at)}</p></div>
            </div></div>`;
    }).join('');
    return `<div class="flex flex-col gap-4">
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800">Rekor pribadi</h4>
            <p class="text-xs text-slate-400 mb-1">Time attack dinilai dari jumlah soal benar. Mode jumlah soal dinilai dari akurasi, lalu kecepatan.</p>
            <div class="divide-y divide-slate-100">${rekor}</div></div>
        <div class="rounded-2xl border border-slate-100 p-4"><h4 class="font-bold text-slate-800">Sesi terakhir</h4>
            <div class="divide-y divide-slate-100">${daftar}</div></div>
    </div>`;
}

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
        <p id="md-umpan" class="min-h-[1.5rem] text-center text-sm font-semibold" aria-live="assertive"></p>
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
    el.className = 'min-h-[1.5rem] text-center text-sm font-semibold ' + (kelas || '');
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
        html: md.q.html, topik: md.q.topik, kes: md.q.kes, benar,
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
    else mdUmpan(`Jawaban yang benar: ${mdTampilJawab(md.q)}`, 'text-rose-600');
    md.jeda = setTimeout(mdLanjut, ok ? 300 : 1200);
}

function mdLewati() {
    if (md.fase !== 'main' || md.kunci) return;
    mdCatat(false, '(dilewati)');
    md.kunci = true;
    mdUmpan(`Jawaban yang benar: ${mdTampilJawab(md.q)}`, 'text-slate-600');
    md.jeda = setTimeout(mdLanjut, 1000);
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
    const baris = { mode: md.mode, batas, kesulitan: md.kes, topik: [...md.topik], benar, total, durasi_detik: durasi };
    const lama = mdRekor(md.mode, batas);
    md.ringkas = { benar, total, durasi, batas, rekorBaru: total > 0 && mdLebihBaik({ ...baris, created_at: '' }, lama, md.mode), pertama: !lama };
    md.status = total > 0 ? 'Menyimpan hasil...' : '';
    mdRender();
    window.scrollTo({ top: 0 });
    if (!total) return;
    try {
        const { error } = await supabaseClient.from('latihan_matdas').insert({ siswa_id: activeUser.id, ...baris });
        if (error) throw error;
        md.status = 'Hasil tersimpan di riwayatmu.';
        await mdMuatRiwayat();
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
                <span class="text-slate-500 ml-3">Benar:</span> <span class="font-semibold text-emerald-600">${escapeHtml(h.jawabBenar)}</span></p></div>`).join('')}</div></div>` : '';
    const judul = r.rekorBaru ? (r.pertama ? 'Sesi pertama di mode ini' : 'Rekor baru') : 'Selesai';
    const sub = md.mode === 'waktu'
        ? `${r.benar} soal benar dalam ${r.batas} menit`
        : `${r.benar} dari ${r.total} soal benar`;
    return `<div class="flex flex-col gap-4 max-w-xl mx-auto">
        <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-5">
            <p class="text-sm text-primary-100">${judul}</p>
            <p class="mt-1 text-3xl font-extrabold tracking-tight">${sub}</p>
            <p class="text-xs text-primary-200 mt-2">${mdLabelMode(md.mode, r.batas)}, tingkat ${MD_KESULITAN[md.kes]}</p>
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

function mdKePengaturan() { md.fase = 'setup'; md.tab = 'latih'; mdRender(); window.scrollTo({ top: 0 }); }
