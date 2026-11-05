// ====================================================================
// KAMUS GAME BAHASA INGGRIS
// Format tiap baris:  kata Inggris | terjemahan Indonesia | jenis kata
//   - Beberapa terjemahan/sinonim dipisah " / ". Semuanya dianggap benar untuk kata itu,
//     dan aplikasi TIDAK akan memakai kata lain yang berbagi salah satu sinonim itu sebagai
//     pilihan pengecoh (supaya tidak ada dua jawaban yang sama-sama benar).
//   - Jenis kata: n = kata benda, v = kata kerja, adj = kata sifat, adv = kata keterangan,
//     x = ungkapan/kata tugas.
//   - Tingkat 1 = mudah (dasar), 2 = sedang, 3 = sulit.
// Menambah kata: cukup tambahkan baris baru di tingkat yang sesuai.
// ====================================================================

const ING_TOPIK = {
    en_id: { nama: 'Inggris ke Indonesia' },
    id_en: { nama: 'Indonesia ke Inggris' }
};
const ING_JENIS = { n: 'kata benda', v: 'kata kerja', adj: 'kata sifat', adv: 'kata keterangan', x: 'ungkapan' };

const ING_TEKS = {
1: `
house|rumah|n
car|mobil|n
book|buku|n
water|air|n
food|makanan|n
friend|teman / sahabat|n
family|keluarga|n
school|sekolah|n
teacher|guru|n
student|siswa / pelajar|n
mother|ibu|n
father|ayah|n
sister|saudara perempuan|n
brother|saudara laki-laki|n
child|anak|n
man|pria / laki-laki|n
woman|wanita / perempuan|n
dog|anjing|n
cat|kucing|n
bird|burung|n
fish|ikan|n
tree|pohon|n
flower|bunga|n
sun|matahari|n
moon|bulan|n
star|bintang|n
rain|hujan|n
wind|angin|n
fire|api|n
day|hari|n
night|malam|n
morning|pagi|n
table|meja|n
chair|kursi|n
door|pintu|n
window|jendela|n
room|ruangan / kamar|n
bed|tempat tidur|n
kitchen|dapur|n
garden|kebun / taman|n
street|jalan|n
city|kota|n
village|desa|n
country|negara|n
market|pasar|n
shop|toko|n
money|uang|n
time|waktu|n
name|nama|n
hand|tangan|n
foot|kaki|n
head|kepala|n
eye|mata|n
ear|telinga|n
nose|hidung|n
mouth|mulut|n
hair|rambut|n
face|wajah|n
apple|apel|n
banana|pisang|n
rice|nasi / beras|n
bread|roti|n
milk|susu|n
egg|telur|n
meat|daging|n
chicken|ayam|n
coffee|kopi|n
tea|teh|n
sugar|gula|n
salt|garam|n
breakfast|sarapan|n
lunch|makan siang|n
dinner|makan malam|n
shirt|kemeja / baju|n
shoes|sepatu|n
hat|topi|n
bag|tas|n
paper|kertas|n
phone|telepon|n
computer|komputer|n
music|musik|n
song|lagu|n
ball|bola|n
picture|gambar|n
story|cerita|n
word|kata|n
number|angka / nomor|n
color|warna|n
week|minggu|n
year|tahun|n
sea|laut|n
river|sungai|n
mountain|gunung|n
eat|makan|v
drink|minum|v
sleep|tidur|v
walk|berjalan|v
run|berlari|v
read|membaca|v
write|menulis|v
speak|berbicara|v
listen|mendengarkan|v
look|memandang / melihat|v
see|melihat|v
open|membuka|v
close|menutup|v
buy|membeli|v
sell|menjual|v
give|memberi|v
take|mengambil|v
come|datang|v
go|pergi|v
sit|duduk|v
stand|berdiri|v
play|bermain|v
work|bekerja|v
study|belajar|v
help|membantu / menolong|v
love|mencintai|v
like|menyukai / suka|v
want|ingin / mau|v
need|membutuhkan / perlu|v
know|mengetahui / tahu|v
think|berpikir|v
make|membuat|v
use|menggunakan / memakai|v
wash|mencuci|v
cook|memasak|v
sing|bernyanyi|v
dance|menari|v
swim|berenang|v
call|memanggil / menelepon|v
ask|bertanya|v
answer|menjawab|v
wait|menunggu|v
live|tinggal / hidup|v
bring|membawa|v
big|besar|adj
small|kecil|adj
long|panjang|adj
short|pendek|adj
tall|tinggi|adj
new|baru|adj
old|tua / lama|adj
good|baik / bagus|adj
bad|buruk / jelek|adj
happy|senang / bahagia|adj
sad|sedih|adj
hot|panas|adj
cold|dingin|adj
fast|cepat|adj
slow|lambat|adj
easy|mudah|adj
difficult|sulit / susah|adj
beautiful|indah / cantik|adj
clean|bersih|adj
dirty|kotor|adj
heavy|berat|adj
cheap|murah|adj
expensive|mahal|adj
young|muda|adj
strong|kuat|adj
weak|lemah|adj
rich|kaya|adj
poor|miskin|adj
full|penuh|adj
empty|kosong|adj
hungry|lapar|adj
thirsty|haus|adj
tired|lelah / capek|adj
angry|marah|adj
afraid|takut|adj
sick|sakit|adj
healthy|sehat|adj
red|merah|adj
blue|biru|adj
green|hijau|adj
yellow|kuning|adj
black|hitam|adj
white|putih|adj
dark|gelap|adj
bright|terang|adj
quiet|tenang / sepi|adj
noisy|berisik / ribut|adj
wet|basah|adj
dry|kering|adj
same|sama|adj
different|berbeda|adj
near|dekat|adj
far|jauh|adj
now|sekarang|adv
today|hari ini|adv
tomorrow|besok|adv
yesterday|kemarin|adv
always|selalu|adv
never|tidak pernah|adv
sometimes|kadang-kadang|adv
here|di sini|adv
there|di sana|adv
very|sangat|adv
again|lagi / kembali|adv
also|juga|adv
please|tolong / silakan|x
sorry|maaf|x
hello|halo|x
thank you|terima kasih|x
`,
2: `
advice|saran / nasihat|n
environment|lingkungan|n
opportunity|kesempatan|n
experience|pengalaman|n
knowledge|pengetahuan|n
decision|keputusan|n
relationship|hubungan|n
government|pemerintah|n
society|masyarakat|n
community|komunitas|n
culture|budaya|n
tradition|tradisi|n
neighbor|tetangga|n
journey|perjalanan|n
adventure|petualangan|n
career|karier|n
salary|gaji|n
customer|pelanggan|n
weather|cuaca|n
traffic|lalu lintas|n
health|kesehatan|n
disease|penyakit|n
medicine|obat|n
hospital|rumah sakit|n
library|perpustakaan|n
airport|bandara|n
ticket|tiket / karcis|n
meeting|rapat / pertemuan|n
project|proyek|n
result|hasil|n
reason|alasan|n
problem|masalah|n
solution|solusi / pemecahan|n
goal|tujuan|n
dream|mimpi / impian|n
memory|ingatan / kenangan|n
habit|kebiasaan|n
price|harga|n
risk|risiko|n
value|nilai|n
achieve|mencapai|v
improve|memperbaiki / meningkatkan|v
develop|mengembangkan|v
create|menciptakan|v
decide|memutuskan|v
discover|menemukan|v
explain|menjelaskan|v
describe|menggambarkan|v
compare|membandingkan|v
choose|memilih|v
believe|percaya / meyakini|v
forget|melupakan / lupa|v
remember|mengingat|v
imagine|membayangkan|v
prefer|lebih menyukai|v
suggest|menyarankan / mengusulkan|v
support|mendukung|v
protect|melindungi|v
prevent|mencegah|v
provide|menyediakan|v
receive|menerima|v
refuse|menolak|v
borrow|meminjam|v
lend|meminjamkan|v
arrive|tiba / sampai|v
travel|bepergian|v
enjoy|menikmati|v
gather|mengumpulkan|v
invite|mengundang|v
join|bergabung|v
practice|berlatih|v
repeat|mengulang|v
save|menyimpan / menabung|v
spend|menghabiskan / membelanjakan|v
waste|membuang / menyia-nyiakan|v
warn|memperingatkan|v
important|penting|adj
necessary|diperlukan|adj
careful|hati-hati|adj
dangerous|berbahaya|adj
safe|aman|adj
famous|terkenal|adj
polite|sopan|adj
honest|jujur|adj
lazy|malas|adj
clever|pandai / cerdas|adj
brave|berani|adj
generous|dermawan / murah hati|adj
shy|pemalu|adj
patient|sabar|adj
curious|penasaran|adj
confident|percaya diri|adj
comfortable|nyaman|adj
ancient|kuno|adj
common|umum|adj
rare|langka|adj
independent|mandiri|adj
successful|sukses / berhasil|adj
useful|berguna|adj
huge|sangat besar / raksasa|adj
tiny|sangat kecil / mungil|adj
narrow|sempit|adj
wide|lebar|adj
thick|tebal|adj
thin|tipis / kurus|adj
rough|kasar|adj
sharp|tajam|adj
usually|biasanya|adv
recently|baru-baru ini|adv
suddenly|tiba-tiba|adv
quickly|dengan cepat|adv
hardly|hampir tidak|adv
probably|mungkin / barangkali|adv
especially|terutama|adv
finally|akhirnya|adv
almost|hampir|adv
instead|sebagai gantinya|adv
although|meskipun|x
however|namun / akan tetapi|x
because|karena|x
between|di antara|x
during|selama|x
without|tanpa|x
`,
3: `
achievement|prestasi / pencapaian|n
awareness|kesadaran|n
behavior|perilaku|n
challenge|tantangan|n
consequence|konsekuensi / akibat|n
contribution|kontribusi / sumbangan|n
criticism|kritik|n
democracy|demokrasi|n
dilemma|dilema|n
efficiency|efisiensi|n
evidence|bukti|n
expertise|keahlian|n
guidance|bimbingan / arahan|n
heritage|warisan|n
hypothesis|hipotesis|n
identity|identitas|n
impact|dampak|n
incentive|insentif / dorongan|n
infrastructure|infrastruktur|n
innovation|inovasi|n
insight|wawasan|n
integrity|integritas|n
justice|keadilan|n
leadership|kepemimpinan|n
lifestyle|gaya hidup|n
obstacle|rintangan / hambatan|n
perspective|sudut pandang / perspektif|n
phenomenon|fenomena|n
priority|prioritas|n
privilege|hak istimewa|n
profit|keuntungan / laba|n
resource|sumber daya|n
responsibility|tanggung jawab|n
strategy|strategi|n
sustainability|keberlanjutan|n
threat|ancaman|n
tolerance|toleransi|n
welfare|kesejahteraan|n
wisdom|kebijaksanaan|n
abolish|menghapuskan|v
acknowledge|mengakui|v
allocate|mengalokasikan / membagikan|v
analyze|menganalisis|v
anticipate|mengantisipasi|v
assess|menilai|v
commit|berkomitmen|v
compensate|mengganti rugi / mengompensasi|v
conclude|menyimpulkan|v
contribute|menyumbang / berkontribusi|v
convince|meyakinkan|v
criticize|mengkritik|v
demonstrate|memperlihatkan / mendemonstrasikan|v
eliminate|menghilangkan|v
emphasize|menekankan|v
enhance|memperkuat / mempertinggi|v
establish|mendirikan / menetapkan|v
estimate|memperkirakan / menaksir|v
evaluate|mengevaluasi|v
exaggerate|melebih-lebihkan|v
fulfill|memenuhi|v
hesitate|ragu-ragu|v
illustrate|mengilustrasikan / memberi contoh|v
implement|melaksanakan / menerapkan|v
indicate|menunjukkan|v
inspire|menginspirasi|v
interpret|menafsirkan|v
investigate|menyelidiki|v
maintain|mempertahankan / memelihara|v
negotiate|bernegosiasi / berunding|v
obtain|memperoleh|v
overcome|mengatasi|v
participate|berpartisipasi / ikut serta|v
persuade|membujuk|v
postpone|menunda|v
predict|meramalkan / memprediksi|v
prohibit|melarang|v
reveal|mengungkapkan / membeberkan|v
resolve|menyelesaikan / memecahkan|v
restrict|membatasi|v
spread|menyebar|v
ambiguous|ambigu / bermakna ganda|adj
considerable|cukup besar / cukup banyak|adj
consistent|konsisten|adj
controversial|kontroversial|adj
crucial|sangat penting / krusial|adj
deliberate|disengaja|adj
essential|esensial / pokok|adj
fundamental|mendasar|adj
genuine|asli / tulus|adj
inevitable|tak terelakkan|adj
inherent|melekat / bawaan|adj
innovative|inovatif|adj
mandatory|wajib|adj
negligible|dapat diabaikan|adj
obsolete|usang / ketinggalan zaman|adj
ongoing|sedang berlangsung|adj
plausible|masuk akal|adj
precise|tepat / presisi|adj
prominent|menonjol / terkemuka|adj
reluctant|enggan|adj
reliable|dapat diandalkan|adj
remarkable|luar biasa|adj
sustainable|berkelanjutan|adj
temporary|sementara|adj
thorough|menyeluruh / teliti|adj
vulnerable|rentan|adj
widespread|tersebar luas / meluas|adj
apparently|tampaknya / rupanya|adv
briefly|secara singkat|adv
consequently|akibatnya / oleh karena itu|adv
eventually|pada akhirnya|adv
furthermore|selain itu / lagi pula|adv
nevertheless|meskipun demikian / namun demikian|adv
otherwise|jika tidak / kalau tidak|adv
presumably|diduga / kemungkinan besar|adv
`
};

// Ubah teks di atas menjadi daftar kata
const ING_KAMUS = [];
Object.entries(ING_TEKS).forEach(([lvl, teks]) => {
    teks.split('\n').map(b => b.trim()).filter(Boolean).forEach(baris => {
        const [en, id, pos] = baris.split('|').map(s => s.trim());
        ING_KAMUS.push({ en, id, pos, lvl: Number(lvl), tok: id.split('/').map(t => t.trim().toLowerCase()) });
    });
});
