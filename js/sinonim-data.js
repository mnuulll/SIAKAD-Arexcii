// ====================================================================
// KAMUS GAME SINONIM & ANTONIM (bahasa Indonesia)
// Format tiap baris:  kata | sinonim | antonim
//   - Beberapa sinonim/antonim dipisah " / ". Semuanya dianggap benar untuk kata itu.
//   - Boleh dikosongkan salah satunya (mis. "jauh||dekat"): kata itu hanya keluar
//     sebagai soal jenis yang datanya ada.
//   - Aplikasi TIDAK memakai kata yang berkerabat (sinonim/antonim dari kata soal atau
//     dari jawaban benar) sebagai pilihan pengecoh, supaya tidak ada dua jawaban benar.
//   - Tingkat 1 = mudah (sehari-hari), 2 = sedang, 3 = sulit (formal/akademik).
// Menambah kata: cukup tambahkan baris baru di tingkat yang sesuai.
// ====================================================================

const SNM_TOPIK = {
    sinonim: { nama: 'Sinonim' },
    antonim: { nama: 'Antonim' }
};

const SNM_TEKS = {
1: `
besar|agung / raya|kecil
kecil|mungil / imut|besar
tinggi|jangkung|rendah / pendek
rendah|pendek|tinggi
pendek|singkat|panjang
panjang||pendek
cepat|lekas / kencang|lambat
lambat|pelan|cepat
baik|bagus / elok|buruk / jelek
bagus|apik / baik|jelek / buruk
buruk|jelek|baik / bagus
cantik|molek / jelita|jelek
indah|elok / permai|jelek
senang|gembira / bahagia|sedih / susah
sedih|pilu / duka|senang / gembira
takut|gentar / ngeri|berani
berani|gagah|takut / pengecut
marah|murka / berang|sabar
rajin|tekun / giat|malas
malas|enggan|rajin / giat
pintar|pandai / cerdas|bodoh / dungu
bodoh|dungu|pintar / pandai
kaya|berada / makmur|miskin
miskin|papa / melarat|kaya
mudah|gampang / ringan|sulit / sukar
sulit|sukar / rumit|mudah / gampang
dekat||jauh
jauh||dekat
terang|cerah / benderang|gelap
gelap|kelam / pekat|terang
panas|gerah|dingin
dingin|sejuk|panas
baru|anyar|lama / usang
lama|kuno|baru
tua|renta / uzur|muda
muda|belia|tua
kuat|tangguh / perkasa|lemah
lemah|lunglai|kuat / perkasa
benar|betul / tepat|salah
salah|keliru|benar / betul
jujur||curang
bersih|higienis|kotor
kotor|jorok / cemar|bersih
penuh|sarat|kosong
kosong|hampa|penuh
datang|tiba|pergi
pergi|berangkat|datang / pulang
naik|mendaki|turun
turun|merosot|naik
buka||tutup
tutup||buka
beli||jual
jual||beli
menang||kalah
kalah||menang
masuk||keluar
keluar||masuk
tertawa|terbahak|menangis
menangis|terisak|tertawa
rumah|kediaman|
uang|duit|
pria|laki-laki / lelaki|wanita / perempuan
wanita|perempuan|pria / laki-laki
siang||malam
malam||siang
teman|kawan / sahabat|musuh
musuh|lawan|kawan / teman
hidup|bernyawa|mati
mati|tewas / meninggal|hidup
`,
2: `
ramai|riuh / gaduh|sepi / sunyi
sepi|lengang / sunyi|ramai
luas|lapang / leluasa|sempit
sempit|sesak|luas / lapang
lebar|luas|sempit
tebal||tipis
tipis||tebal
ringan|enteng|berat
berat||ringan
lunak|empuk|keras
keras|kaku / alot|lunak / empuk
halus|lembut|kasar
kasar||halus
rapi|teratur / tertib|berantakan / kacau
berantakan|kacau / semrawut|rapi / teratur
sopan|santun / beradab|lancang
pelit|kikir / bakhil|dermawan / murah hati
dermawan|pemurah / murah hati|pelit / kikir
cemas|khawatir / gelisah|tenang
tenang|damai / teduh|cemas / gelisah
aman|selamat|bahaya / terancam
bahaya|marabahaya / ancaman|aman
sehat|bugar / segar|sakit
sakit|gering|sehat
sempurna|paripurna|cacat
cacat|cela / noda|sempurna
murah|terjangkau|mahal
mahal||murah
awal|permulaan / mula|akhir
akhir|penghabisan / ujung|awal
membantu|menolong / menyokong|menghambat
melarang|mencegah / menghalangi|mengizinkan / membolehkan
mengizinkan|membolehkan / merestui|melarang
mencintai|menyayangi|membenci
membenci|memusuhi|mencintai / menyayangi
melupakan||mengingat
mengingat|mengenang|melupakan
menambah|menjumlahkan|mengurangi
mengurangi|memangkas / menyusutkan|menambah
memuji|menyanjung / memuja|mencela / mencaci
mencela|menghina / mencaci|memuji / menyanjung
ragu|bimbang / waswas|yakin / mantap
yakin|percaya / mantap|ragu / bimbang
jernih|bening|keruh
keruh||jernih / bening
subur|gembur|tandus / gersang
tandus|gersang|subur
lancar|mulus|tersendat / macet
macet|tersendat|lancar
ramah|bersahabat|galak
galak|garang / ganas|ramah / jinak
jinak||liar / buas
liar|buas|jinak
hemat|irit / cermat|boros
boros|mubazir|hemat / irit
`,
3: `
abadi|kekal / langgeng|fana / sementara
fana|sementara|abadi / kekal
arif|bijaksana / bijak|dungu
gigih|ulet / tabah|
jelas|gamblang / terang|kabur / samar
samar|kabur / remang|jelas / gamblang
nyata|konkret / faktual|semu / maya
semu|palsu / pura-pura|nyata / sejati
asli|orisinal / murni|palsu / tiruan
palsu|tiruan / gadungan|asli
genting|gawat / kritis|
lazim|umum / biasa|ganjil / janggal
ganjil|janggal / aneh|lazim / biasa
fleksibel|lentur / luwes|kaku
kaku|tidak lentur|fleksibel / luwes
penting|esensial / krusial|remeh / sepele
remeh|sepele|penting / krusial
minim|sedikit / terbatas|melimpah
melimpah|berlimpah / banyak|sedikit / minim
mutakhir|terbaru / modern|kuno / usang
usang|lapuk / ketinggalan zaman|mutakhir
sombong|angkuh / congkak|rendah hati
rendah hati|bersahaja / tawadu|sombong / angkuh
optimis|yakin / penuh harapan|pesimis / putus asa
pesimis|putus asa|optimis
rumit|kompleks / pelik|sederhana / simpel
sederhana|simpel / lugas|rumit / kompleks
meningkat|naik / melonjak|menurun / merosot
menurun|merosot / anjlok|meningkat / naik
menyetujui|menyepakati / merestui|menolak / menentang
menolak|menampik / menepis|menerima / menyetujui
menerima||menolak
mempercepat|mengakselerasi / mengebut|memperlambat
memperlambat|menghambat|mempercepat
memperkuat|memperkokoh / menguatkan|memperlemah / melemahkan
memperlemah|melemahkan / menggoyahkan|memperkuat / memperkokoh
menghemat|mengirit / berhemat|memboroskan / menghamburkan
mendukung|menyokong / menopang|menentang
menentang|melawan / menolak|mendukung / menyokong
mempersulit|merumitkan / mempersukar|mempermudah / memudahkan
mempermudah|memudahkan / meringankan|mempersulit
hakiki|sejati / sesungguhnya|semu
lugas|langsung / blak-blakan|berbelit-belit
berbelit-belit|bertele-tele|lugas / ringkas
ringkas|singkat / padat|bertele-tele
lugu|polos / naif|cerdik / licik
licik|culas / curang|jujur / lurus
hening|sunyi / senyap|gaduh / bising
bising|gaduh / riuh|hening / senyap
riang|ceria / gembira|murung / muram
murung|muram / suram|riang / ceria
fasih|lancar / mahir|gagap / terbata-bata
mahir|terampil / cakap|
canggung|kikuk / kaku|luwes
damai|tenteram / harmonis|ricuh / bentrok
ricuh|kacau / gaduh|damai / tenteram
`
};

// Ubah teks di atas menjadi daftar kata
const SNM_KAMUS = [];
// Peta kerabat: kata -> himpunan semua kata yang sekelompok (kata, sinonim, antonimnya)
const SNM_REL = {};
Object.entries(SNM_TEKS).forEach(([lvl, teks]) => {
    teks.split('\n').map(b => b.trim()).filter(Boolean).forEach(baris => {
        const [kata, sin, ant] = baris.split('|').map(s => (s || '').trim());
        const pecah = (s) => s ? s.split('/').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
        const e = { kata: kata.toLowerCase(), sin: pecah(sin), ant: pecah(ant), lvl: Number(lvl) };
        e.semua = [e.kata, ...e.sin, ...e.ant];
        SNM_KAMUS.push(e);
        e.semua.forEach(w => { const s = SNM_REL[w] || (SNM_REL[w] = new Set()); e.semua.forEach(x => s.add(x)); });
    });
});
