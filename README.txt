PATCH: DATA PER LEAD (trader yang diikuti)
==========================================

File hasil patch ada di folder ini:
- code.gs       -> ganti isi Code.gs di Apps Script lalu DEPLOY ulang (ada action=renameLead baru)
- index.html    -> ganti index.html di repo GitHub
- sw.js         -> ganti sw.js di repo GitHub (cache version sudah naik jadi v25-leadpop)
- manifest.json   -> ganti manifest.json di repo GitHub (nama/short_name + icon lokal 192/512).
- icon-64.png     -> favicon tab browser (64x64).
- icon-180.png    -> apple-touch-icon untuk home screen iOS.
- icon-192.png    -> icon PWA "any" (manifest).
- icon-512.png    -> icon PWA "any maskable" (manifest, diambil dari CDN 512x512 asli).
- shortcut-url.js -> alamat pintasan di halaman Profil. Edit FILE INI SAJA kalau mau ganti
  tautan Binance / Sheet / daftar host yang dibolehkan. Tidak perlu menyentuh index.html.
- appsscript.json -> panduan scope UrlFetchApp (TIDAK di-push ke GitHub; dipakai di Apps Script)
- Database.js   -> TIDAK berubah (tetap pakai ACCOUNTS_URL)
- WarnaCoin.gs  -> TIDAK berubah (tetap mewarnai kolom D / Pair)

Konsep
------
- Akun/login = siapa yang memakai aplikasi (sudah ada, satu tab per akun).
- Lead       = trader di Binance yang diikuti. Satu akun boleh punya banyak lead.
- Lead bukan tab/login tersendiri, tapi kolom di tiap trade (kolom O di tab akun).
- Daftar lead disimpan di tab "Lead" dan dipakai BERSAMA oleh semua akun dalam Sheet yang sama.
- Id lead case-sensitive: "my-DreAM" dan "My-Dream" adalah dua lead berbeda.

Langkah pasang
--------------
1. Buka Google Sheet -> Ekstensi -> Apps Script -> tempel seluruh isi code.gs ini -> Simpan.
2. Jalankan fungsi adminIsiLeadDefault() sekali. Fungsi ini otomatis memanggil setup(),
   jadi tab "Lead" akan dibuat kalau belum ada, dengan baris default:
   utama | Lead Utama | #a5a8ff | aktif | (foto kosong).
   Fungsi ini hanya mengisi kolom O yang kosong. Id yang sudah ada dibiarkan apa adanya.
3. Apps Script -> Terapkan -> Kelola deployment -> pensil -> Versi: Versi baru -> Terapkan.
   Link /exec tidak berubah, jadi Database.js tidak perlu diedit.
4. Push index.html dan sw.js ke GitHub (repo romini1993/sample).
5. Buka aplikasi. Service worker v25 akan membuang cache lama otomatis.

PENTING untuk fitur ambil dari link
-----------------------------------
Karena script sekarang memanggil UrlFetchApp, project Apps Script harus punya scope
"https://www.googleapis.com/auth/script.external_request".
- Buka Apps Script -> Project Settings -> centang "Show appsscript.json".
- Buka appsscript.json. Kalau ada "oauthScopes", TAMBAHKAN scope di atas ke dalam daftar.
  Kalau belum ada, boleh ganti seluruh isinya dengan file appsscript.json yang disertakan
  di folder ini (scopes: spreadsheets + script.external_request).
- Simpan, lalu buat Versi baru & Terapkan lagi.

Kalau scope ini belum ada, errors-nya persis:
  "Data lead tidak terbaca. Detail: You do not have permission to call fetch."
Setelah scope ditambahkan + deployment versi baru, pesan error akan hilang dan nama/foto
langsung terisi.

Tambah lead dari aplikasi (TIDAK perlu edit Sheet manual)
---------------------------------------------------------
- Di form input trade, sebelah kanan pilihan "Lead yang diikuti" ada tombol "Tambah".
- Klik "Tambah" -> isi nama lead -> pilih warna (palette / color picker) -> opsional: pilih foto
  -> klik "Tambah lead".
- Foto bisa dipotong & diperbesar dulu di dialog cropper. Foto disimpan sebagai data URL JPEG
  kecil (±10 KB) di kolom E tab "Lead", bukan sebagai file.
- Lead baru langsung masuk ke tab "Lead" lewat Apps Script (action=addLead lewat POST), lalu
  otomatis terpilih di pilihan lead form.
- Kalau nama lead PERSIS sama (termasuk huruf besar/kecil) sudah ada, aplikasi memakai lead lama
  (tidak dobel). Foto akan diisi kalau lead lama belum punya foto.
- Akun "gabungan" bersifat read-only, jadi tombol ini tidak bisa dipakai dari akun itu.

Ambil nama + foto otomatis dari link Binance
--------------------------------------------
- Di dialog tambah lead ada kolom "Link lead Binance (opsional)" dan tombol
  "Ambil nama & foto dari link".
- Tempel misalnya:
  https://www.binance.com/id/copy-trading/lead-details/5121809002771580416
- Pengambilan otomatis setelah link selesai ditempel (sekitar 0,7 detik). Tombol
  "Ambil nama & foto dari link" tetap ada kalau mau trigger manual. Boleh juga langsung
  klik "Tambah lead" dengan link saja; nama akan diambil dulu sebelum disimpan.
- Apps Script yang mengunjungi halaman Binance (bukan browser), jadi tidak kena CORS.
  Yang diambil HANYA uid + nama + foto; statistik diabaikan.
- Kalau Binance memblok IP server / isi halaman baru muncul setelah JavaScript, Apps Script
  otomatis mencoba pembaca halaman cadangan (r.jina.ai). Ini layanan pihak ketiga; kalau
  suatu hari tidak bisa, input manual tetap tersedia.
- Link boleh membawa query seperti ?timeRange=30D dan prefiks /id/. Supaya bisa diakses,
  link itu juga dicoba dalam bentuk bersih: https://www.binance.com/copy-trading/lead-details/<uid>.
  Jadi ada empat sumber yang dicoba berurutan: halaman link asli, halaman bersih, pembaca
  halaman (r.jina.ai) pada URL bersih, lalu pembaca pada link asli. Proses berhenti hanya kalau
  nama DAN foto sudah didapat — tidak berhenti di nama saja.
- Nama otomatis mengisi kolom "Nama lead". Foto otomatis dipotong tengah jadi 192px JPEG
  (±10 KB) dan muncul di preview. Kamu tetap bisa ganti nama, ganti foto manual, dan pilih warna
  sebelum klik "Tambah lead".
- Link divalidasi ketat: harus https://(www.)binance.com/.../copy-trading/lead-details/<angka>.
  Host lain ditolak.
- Tidak perlu mengubah Apps Script tiap kali menambah lead. Cukup deploy versi baru SEKALI
  setelah action=previewLead terpasang. Kalau Binance mengubah struktur halamannya, baru
  parser di Apps Script yang perlu disesuaikan; input manual tetap bisa dipakai.
- Kalau foto tidak ketemu / gagal diunduh, nama tetap terisi dan kamu bisa pilih foto manual.
  Teks status sekarang menyertakan ringkasan `Sumber: ...` (mis. `halaman:200+nama |
  pembaca:200+nama+foto`), jadi kalau masih gagal, kirim teks itu untuk mendebug.
  Teks status di dialog sekarang dibungkus (tidak pakai `truncate`), jadi kalimat panjang tidak
  lagi terpotong di tengah.
- Foto asli sampai 2 MB dikirim ke browser lalu dipotong jadi avatar 192px (~10 KB); batas
  45.000 karakter di Sheet tetap dijaga. Kalau lebih dari 2 MB, nama tetap terisi dan statusnya
  meminta foto manual.
- CATATAN perbaikan: dulu Apps Script berhenti begitu ada nama yang ketemu, walaupun fotonya
  belum ada. Padahal halaman Binance langsung sering cuma memuat nama; fotonya baru muncul di
  halaman versi render (r.jina.ai). Sekarang keempat sumber dibaca sampai nama DAN foto dapat.
  Regex foto juga diperlonggar supaya URL di markdown `![](...)` tidak ikut menelan tanda `)`.

Hapus lead
----------
- Buka daftar pilihan "Lead yang diikuti" di form input trade.
- Di sebelah kanan tiap baris ada tombol "Hapus" (kecuali "Lead Utama", yang memang tidak bisa
  dihapus). Tombol ini HANYA ada di popup form, supaya tidak terpicu saat kamu sedang edit trade.
- Akan muncul dialog konfirmasi. Setelah disetujui, lead hilang dari daftar pilihan form/edit/impor.
- Yang terjadi di Sheet: baris tab "Lead" TIDAK dihapus, kolom status (D) diubah jadi "nonaktif".
  Tujuannya supaya riwayat trade yang sudah memakai lead itu tetap menyimpan nama + foto yang sama.
  Lead yang dihapus masuk daftar arsip (`leadsArsip`) dan masih bisa dipakai untuk filter riwayat
  (ditandai "(dihapus)"), tapi tidak bisa dipilih untuk trade baru.
- Kalau lead yang sedang dipilih ikut dihapus, pilihan otomatis balik ke "Lead Utama".
- Akun "gabungan" tetap read-only, jadi tidak bisa menghapus lead.

Foto lead muncul di mana
------------------------
- Di tombol pilihan "Lead yang diikuti" form input trade: foto + nama nempel di dalam tombol.
  Diklik akan membuka daftar lead; tiap baris juga berisi foto + nama (mirip badge riwayat).
- Modal Edit Trade dan modal Impor massal pakai pola yang sama: foto + nama di tombol dan di daftar.
  Tombol "Tambah" di samping pilihan lead form sengaja TANPA foto.
- Tombol filter lead di Riwayat Trade: diklik akan membuka daftar lead dengan foto + nama
  (select biasa tidak bisa menampilkan gambar).
- Badge kecil di tiap kartu riwayat trade.
- Kalau lead belum punya foto, aplikasi menampilkan inisial dengan warna lead.
- <select> aslinya disimpan hidden tapi tetap dipakai sebagai sumber nilai, jadi semua kode lama
  yang membaca .value (form, edit, impor, filter) tetap bekerja.

Catatan tab "Lead" (untuk admin / kalau mau rapih manual)
---------------------------------------------------------
Format: id | nama | warna | aktif | foto
Contoh:
  my-DreAM  | my-DreAM | #34d399 | aktif | (data:image/jpeg;base64,...)
  My-Dream  | My-Dream | #f59e0b | aktif |
  Lead 中国  | Lead 中国 | #38bdf8 | aktif |
- id dibuat otomatis dari nama dengan huruf besar/kecil TETAP dipakai. Spasi/tanda baca jadi "-".
- Huruf China / Korea / Jepang tetap dipakai sebagai id (mis. "Lead 中国" -> "Lead-中国").
- Status selain "aktif" tidak muncul di dropdown, tapi trade lama yang memakai id itu tetap terbaca.
- Kolom foto boleh dikosongkan. Kalau diisi manual, pakai data URL `data:image/jpeg;base64,...`
  (maksimal 45.000 karakter).

Yang berubah di aplikasi
------------------------
- Form input & modal edit: dropdown "Lead yang diikuti" + avatar lead.
- Tombol "+" di samping dropdown form untuk tambah lead + warna + foto + import dari link Binance.
- Pilihan lead terakhir diingat per akun (localStorage), jadi input berikutnya cepat.
- Tiap baris riwayat ada badge nama lead + foto/inisial + warna sesuai master.
- Filter riwayat: tombol lead dengan popup berisi foto + nama (plus "Semua lead").
- Statistik Lanjutan: blok "Per lead (total P&L)".
- Impor massal: dropdown lead tujuan + avatar; duplikat dicek per lead.
- ANTI-DUPLIKAT: pengecekan memakai JUMLAH kemunculan, bukan sekadar ada/tidaknya. Trade scalping
  yang tanggal/pair/side/PNL-nya identik (mis. SOXL 05/11 Buy 0.03 berulang) tetap dianggap transaksi
  berbeda, jadi tidak lagi kepotong 20 baris seperti sebelumnya. Yang dilewati hanya sebanyak baris
  identik yang MEMANG sudah ada di Sheet untuk lead tujuan. Kalau Sheet punya 2 dan tempelan 3,
  yang dikirim tetap 1. Baris lead lain tidak ikut terhitung.
- Di modal Impor, ringkasan dan TIAP baris preview sekarang ikut menampilkan avatar + nama lead
  tujuan, jadi jelas ke lead mana trade akan masuk sebelum tombol Impor ditekan.
- Modal Impor sekarang melebar mengikuti layar (max-w-3xl di desktop, tetap penuh di HP) dan
  teks/inputnya diperbesar. Kalau pengiriman gagal, modal tidak langsung tutup: alasan gagalnya
  (mis. pesan dari Sheet) ditampilkan di ringkasan & toast.
- URUTAN IMPOR: salinan riwayat Binance biasanya descending (terbaru di atas). Sebelum dikirim ke
  Sheet, semua baris diurutkan ASCENDING memakai timestamp Ditutup yang lengkap (tanggal + jam),
  bukan cuma tanggalnya. Jadi dalam tanggal yang sama, posisi yang ditutup pagi masuk lebih dulu,
  yang malam di belakang. Baris manual 5 kolom juga ikut diurutkan ascending.
  Untuk baris manual yang cuma punya TANGGAL (tanpa jam), urutan asli salinan Binance dibalik:
  karena salinan descending, baris paling bawah di blok tanggal yang sama dianggap yang paling awal.
  Contoh: tiga SNDKUSDT Sell 19/11/2026 (1.10, 4.70, 15.11) masuk sebagai 15.11, 4.70, 1.10.
  Catatan: baris lama yang sudah salah urut di Sheet tidak diubah otomatis — hapus baris itu dulu
  kalau mau hasil impor yang benar-benar kronologis.
- Cadangan CSV: ikut membawa kolom Lead (nama lead, bukan foto).
- Total P&L di hero tetap total SEMUA lead. Filter lead hanya mengubah daftar riwayat
  dan statistik lanjutan, supaya angka gabungan tidak membingungkan.

Impor: semua format diteks langsung ke Modal Impor
---------------------------------------------------
- TABEL EKSPOR Binance (copy dari Sheet/CSV) sekarang dibaca otomatis. Kolom dicari dari
  NAMA headernya, jadi urutan boleh berubah. Pemisah: tab, koma, titik koma, atau spasi ganda.
  Header yang dikenali antara lain:
    Symbol / Pair / Simbol, Side / Arah, Status, Opened / Dibuka,
    Closing PNL / PNL Penutupan / PNL Terealisasi / Realized Profit,
    Closed / Ditutup. Kolom lain (Entry Price, Max. Open Interest, Avg. Close Price,
    Closed Vol., leverage, ROI) diabaikan.
  Contoh baris yang kebaca:
    SKHYNIXUSDT  Isolated  Long  All Closed  2026-09-01 07:39:54.245
    1198.66000000 USDT  0.38000000 SKHYNIX  -0.29260000 USDT
    2026-09-02 17:37:37.858  1197.89000000 USDT  0.38000000 SKHYNIX
  Angka bersatuan dibersihkan ("-0.29260000 USDT" -> -0.2926, "0,075 ETH" -> 0.075),
  jam + milidetik dipakai untuk sorting ascending. Baris dengan status masih Open dilewati.
- Format blok HP (sama untuk trade akun biasa maupun posisi copy trade):
    B SOXLUSDT              <- B = Buy/Long
    S SOXLUSDT              <- S = Sell/Short
    Perp
    Cross 20x
    PNL Penutupan / PNL Terealisasi (USDT)
    +3,45080034             <- nilai PNL
    Dibuka
    2026-11-27 09:19:53
    Ditutup
    2026-11-27 09:45:42
  Timestamp pertama dalam blok = Dibuka, kedua = Ditutup. Jam ikut dipakai untuk sorting ascending.
- Label dan nilainya boleh terpisah/tertukar urutannya: PNL diambil dari angka bertanda (+/-)
  lebih dulu; kalau tidak ada, dari angka murni pertama di blok (bukan persen). ROI, volume,
  harga entri, leverage, dan status diabaikan.
- Desimal Indonesia dinormalisasi: 105,99 -> 105.99; +3,45080034 -> 3.45080034;
  1.018,41792 -> 1018.41792 (titik = pemisah ribuan, koma = desimal).
- Format lama (Open/Close Long/Short dan baris 5 kolom) tetap diterima.

Ukuran foto lead
----------------
- Pemilih lead di form/edit/impor & filter: avatar 24-30px (sebelumnya 16-20px), baris popup
  lebih tinggi & teks 12px. Pratinjau foto di dialog Tambah Lead: 44px.
- Kartu Riwayat Trade & Rekap Harian: foto lead dapat kolom sendiri di kiri (36px, lingkaran
  mengikuti warna lead). Nama lead dipindah dari badge kecil 8px ke baris PROFIT/LOSS dengan
  teks 10px, jadi foto tidak lagi "nempel" di badge yang sempit.

Perbaikan performa HP & orientasi
---------------------------------
- Foto lead BUKAN penyebab utama berat. Penyebabnya: tiap kartu bikin Intl.NumberFormat baru (~500x),
  pasang 8 event listener long-press (~4000 listener), dan animasi + delay untuk semua baris.
  Sekarang: formatter di-cache (1x), long-press pakai SATU delegasi listener untuk semua kartu,
  avatar di-cache per (id, ukuran) + lazy-load, animasi cuma 12 kartu teratas di HP.
- Efek hover kartu dimatikan di perangkat layar sentuh supaya scroll tidak bikin layer komposit kerja terus.
- `manifest.json`: orientation diubah dari `portrait` ke `any`, jadi HP bisa landscape / mode desktop
  lagi kalau dipiringin. (Cache v25 perlu di-refresh supaya manifest lama terbuang.)

Tata letak desktop & tampilan Riwayat
--------------------------------------
- Beranda desktop: Rekap Harian dan Riwayat Trade masing-masing menampilkan 7 entri terbaru.
  Kartu Riwayat mengisi sisa tinggi kolom supaya batas bawahnya rata dengan kalender aktivitas;
  kotak tanggal kalender tidak gepeng (tinggi minimal 44px per baris).
- Riwayat Trade: kalau ada filter aktif (pairs / lead / Buy-Sell / hasil / tanggal) ATAU urutan
  diubah ke Opened, daftar otomatis tampil "layaknya Rekap": baris TOTAL di atas daftar
  (rentang tanggal · jumlah hari · jumlah trade · total USDT + rupiah, memakai gaya #rekapSum),
  lalu satu baris ringkasan per tanggal; ketuk baris untuk membuka kartu-kartu trade di dalamnya.
  Berlaku di HP dan desktop. Tanpa filter dan urutan masih Closed, tampilan tetap daftar biasa.
- Statistik: kartu "Lead & sorotan" (P&L per lead, hari terbaik/terburuk, trade terakhir) tampil
  di BAWAH kalender di HP. Di desktop (>=1024px) kartu itu pindah ke KIRI BAWAH di bawah
  Statistik Cepat dan ikut melebar; kalender digeser ke kanan sampai ujung dengan lebar tetap
  maks. 760px, jadi tidak ada ruang kosong di sisi kanan.
- Popup pemilih lead di filter Riwayat diperlebar (300px, dibatasi lebar layar HP) dan nama
  lead yang panjang sekarang dibungkus, tidak dipotong pakai elipsis.

Edit lead yang diikuti
----------------------
- Di popup pemilih lead (form Tambah Trade), tombol "Hapus" diganti "EDIT" (kecuali Lead Utama).
- Tekan EDIT -> muncul menu "Ubah Nama" dan "Hapus".
  * Ubah Nama: isi nama baru (maks. 30 karakter). KODE lead sengaja tidak diubah supaya
    semua trade lama yang memakai lead itu tetap terbaca / tidak berpindah lead.
    Nama baru tidak boleh bentrok dengan nama lead lain.
  * Hapus: tetap seperti sebelumnya -> lead dinonaktifkan, trade lama masih tersimpan.
- Perubahan nama langsung tersinkron ke dropdown form/edit/impor/filter dan kartu Riwayat Trade.
- Backend: action POST baru `renameLead` -> `gantiNamaLead_()` di Code.gs (kolom B saja).
  Akun gabungan tetap read-only. Karena code.gs berubah, Apps Script WAJIB di-deploy ulang.

Perubahan Sheet (tambahan saja, tidak menggeser yang lama)
----------------------------------------------------------
Kolom A-N tetap seperti sebelumnya. Kolom baru:
O = Lead (id lead). Rumus F, G, I-N tidak berubah. WarnaCoin.gs tetap aman.
Tab "Lead" sekarang punya 5 kolom: id | nama | warna | aktif | foto.

Edit lead setelah trade tersimpan
---------------------------------
Tahan baris trade -> Edit Trade -> ganti dropdown Lead -> Simpan.
Kalau tanggal Closed ikut diubah, script memindahkan baris dan lead tetap ikut terbawa.

Fungsi admin
------------
adminIsiLeadDefault()  - mengisi kolom O yang kosong; id lama tidak diubah (aman diulang).
adminRapikanSemuaTab() - sudah aman: tab "Lead" tidak ikut dirapikan sebagai tab akun.

Ganti ikon aplikasi
-------------------
1. Upload kelima file ke repo GitHub: manifest.json, icon-64.png, icon-180.png,
   icon-192.png, icon-512.png (satu folder dengan index.html).
2. index.html baris 9-11 sekarang memakai file lokal, bukan data URI lama:
   icon-64.png untuk favicon tab, icon-180.png untuk apple-touch-icon iOS.
3. manifest.json memakai icon-192.png ("any") dan icon-512.png ("any maskable").
   Jangan pakai URL CDN /128/ lalu diklaim 512x512 — hasilnya buram dan bisa gagal install.
4. Push juga sw.js (v25-leadpop) supaya cache lama dibuang.
5. Nama di bawah icon diatur lewat "short_name"; warna status bar lewat "theme_color".

Pintasan Profil (Binance & Sheet)
---------------------------------
Semua alamat pintasan ada di shortcut-url.js. Cara ganti: edit file itu, push, refresh aplikasi.

- binance: https://app.binance.info/id/copy-trading/copy-management
  Di HP, domain app.binance.info adalah app link terverifikasi untuk paket com.binance.dev,
  jadi langsung masuk aplikasi Binance ke halaman Kelola Copy (tanpa popup "Tautan ini tidak
  berfungsi"). Di desktop, domain ini otomatis mengarah ke
  https://www.binance.info/id/copy-trading/copy-management di browser.
  Catatan: app.binance.com dengan path yang sama justru memicu popup error di Android, makanya
  tidak dipakai.
- sheet: link Sheet data trading (bisa ditimpa lewat "Atur tautan Sheet", tersimpan per akun).
- binanceHosts: daftar host yang boleh disimpan di "Atur tautan Binance". Daftar eksplisit
  (bukan regex longgar) supaya domain palsu tidak bisa masuk. Kalau mau menambah domain,
  tambahkan di array itu.

Tombol "Pakai bawaan" / "Hapus tautan" menghapus penimpaan di perangkat dan kembali ke nilai
dari shortcut-url.js.
