---
sidebar_position: 1
---

# Unggah Berkas

## Pendahuluan tentang Unggah Berkas

Unggah berkas menjadi bagian yang semakin penting dari aplikasi apa pun, tempat pengguna dapat mengunggah foto, CV, atau video yang memamerkan proyek yang sedang mereka kerjakan. Aplikasi harus mampu menangkal berkas palsu dan berbahaya dengan cara menjaga aplikasi dan pengguna tetap aman.

Singkatnya, prinsip-prinsip berikut harus diikuti untuk mencapai penerapan unggahan berkas yang aman:

- **Daftar ekstensi yang diizinkan. Hanya izinkan ekstensi yang aman dan penting untuk fungsionalitas bisnis**
- **Pastikan validasi input diterapkan sebelum memvalidasi ekstensi.**
- **Validasi jenis berkas, jangan percaya [header Jenis Konten](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) karena dapat dipalsukan**
- **Ubah nama berkas menjadi sesuatu yang dibuat oleh aplikasi**
- **Tetapkan batas panjang nama berkas. **Batasi karakter yang diizinkan jika memungkinkan**
- **Tetapkan batas ukuran file**
- **Hanya izinkan pengguna yang berwenang untuk mengunggah file**
- **Simpan file di server lain. Jika tidak memungkinkan, simpan di luar webroot**
- **Jika file dapat diakses publik, gunakan pengendali yang dipetakan ke nama file di dalam aplikasi (someid -> file.ext)**
- **Jalankan file melalui antivirus atau sandbox jika tersedia untuk memvalidasi bahwa file tersebut tidak berisi data berbahaya**
- **Jalankan file melalui CDR (Content Disarm & Reconstruct) jika berlaku jenisnya (PDF, DOCX, dll...)**
- **Pastikan bahwa pustaka yang digunakan dikonfigurasi dengan aman dan selalu diperbarui**
- **Lindungi unggahan file dari serangan CSRF**

## Ancaman Pengunggahan File

Untuk menilai dan mengetahui dengan tepat kontrol apa yang harus diterapkan, mengetahui apa yang Anda hadapi sangat penting untuk melindungi aset Anda. Bagian berikut diharapkan akan menunjukkan risiko yang menyertai fungsionalitas unggahan file.

### File Berbahaya

Penyerang mengirimkan file untuk tujuan jahat, seperti:

1. Mengeksploitasi kerentanan pada parser file atau modul pemrosesan (misalnya [ImageTrick Exploit](https://imagetragick.com/), [XXE](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing))
2. Menggunakan file untuk phishing (misalnya formulir karier)
3. Mengirim bom ZIP, bom XML (atau dikenal sebagai serangan billion laughs), atau sekadar file besar dengan cara memenuhi penyimpanan server yang menghambat dan merusak ketersediaan server
4. Menimpa file yang ada di sistem
5. Konten aktif sisi klien (XSS, CSRF, dll.) yang dapat membahayakan pengguna lain jika file dapat diambil secara publik.

### Pengambilan Berkas Publik

Jika berkas yang diunggah dapat diambil secara publik, ancaman tambahan dapat diatasi:

1. Pengungkapan berkas lain secara publik
2. Memulai serangan DoS dengan meminta banyak berkas. Permintaannya kecil, tetapi responsnya jauh lebih besar
3. Konten berkas yang dapat dianggap ilegal, menyinggung, atau berbahaya (misalnya data pribadi, data berhak cipta, dll.) yang akan menjadikan Anda sebagai tempat penyimpanan berkas berbahaya tersebut.

## Perlindungan Pengunggahan Berkas

Tidak ada cara instan untuk memvalidasi konten pengguna. Menerapkan pendekatan pertahanan yang mendalam adalah kunci untuk membuat proses pengunggahan lebih sulit dan lebih terbatas pada kebutuhan dan persyaratan layanan. Menerapkan beberapa teknik adalah kunci dan direkomendasikan, karena tidak ada satu teknik pun yang cukup untuk mengamankan layanan.

### Validasi Ekstensi

Pastikan validasi terjadi setelah mendekode nama file, dan filter yang tepat telah ditetapkan untuk menghindari beberapa bypass yang diketahui, seperti berikut:

- Ekstensi ganda, _misalnya_ `.jpg.php`, yang dengan mudah menghindari regex `\.jpg`
- Byte nol, _misalnya_ `.php%00.jpg`, yang mana `.jpg` terpotong dan `.php` menjadi ekstensi baru
- Regex umum yang buruk yang tidak diuji dengan benar dan ditinjau dengan baik. Jangan membuat logika Anda sendiri kecuali Anda memiliki cukup pengetahuan tentang topik ini.

Lihat **Input Validation CS** untuk mengurai dan memproses ekstensi dengan benar.

#### Daftar Ekstensi yang Diizinkan

Pastikan penggunaan ekstensi _yang penting bagi bisnis_ saja, tanpa mengizinkan semua jenis ekstensi _yang tidak diperlukan_. Misalnya jika sistem mengharuskan:

- unggah gambar, izinkan satu jenis yang disetujui agar sesuai dengan persyaratan bisnis;

- unggah cv, izinkan ekstensi `docx` dan `pdf`.

Berdasarkan kebutuhan aplikasi, pastikan jenis file yang **paling tidak berbahaya** dan **berisiko paling rendah** digunakan.

#### Blokir Ekstensi

Identifikasi jenis file yang berpotensi berbahaya dan blokir ekstensi yang Anda anggap berbahaya bagi layanan Anda.

Perlu diketahui bahwa memblokir ekstensi tertentu merupakan metode perlindungan yang lemah. Artikel [Kerentanan Pengunggahan File Tanpa Batas](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload) menjelaskan bagaimana penyerang dapat mencoba
untuk melewati pemeriksaan tersebut.

### Validasi Jenis Konten

_Jenis Konten untuk file yang diunggah disediakan oleh pengguna, dan dengan demikian tidak dapat dipercaya, karena mudah dipalsukan. Meskipun tidak boleh diandalkan untuk keamanan, ini menyediakan pemeriksaan cepat untuk mencegah pengguna mengunggah file dengan jenis yang salah secara tidak sengaja._

Selain menentukan ekstensi file yang diunggah, jenis MIME-nya dapat diperiksa untuk perlindungan cepat terhadap serangan pengunggahan file sederhana.

Ini sebaiknya dilakukan dengan pendekatan daftar putih; jika tidak, ini dapat dilakukan dengan pendekatan daftar putih.

### Validasi Tanda Tangan Berkas

Bersamaan dengan [validasi tipe konten](#content-type-validation), validasi tanda tangan berkas dapat diperiksa dan diverifikasi terhadap berkas yang diharapkan akan diterima.

> Ini tidak boleh digunakan sendiri, karena melewatinya cukup umum dan mudah.

### Sanitasi Nama Berkas

Nama berkas dapat membahayakan sistem dalam berbagai cara, baik dengan menggunakan karakter yang tidak dapat diterima, atau dengan menggunakan nama berkas khusus dan terbatas. Untuk Windows, rujuk ke [panduan MSDN](https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file?redirectedfrom=MSDN#naming-conventions) berikut. Untuk tinjauan yang lebih luas tentang berbagai sistem berkas dan cara mereka memperlakukan berkas, rujuk ke [halaman Nama Berkas Wikipedia](https://en.wikipedia.org/wiki/Filename).

Untuk menghindari ancaman yang disebutkan di atas, membuat **string acak** sebagai nama file, seperti membuat UUID/GUID, sangatlah penting. Jika nama file diperlukan oleh kebutuhan bisnis, validasi input yang tepat harus dilakukan untuk vektor serangan sisi klien (misalnya konten aktif yang mengakibatkan serangan XSS dan CSRF) dan sisi back-end (misalnya penimpaan atau pembuatan file khusus). Batasan panjang nama file harus dipertimbangkan berdasarkan sistem yang menyimpan file, karena setiap sistem memiliki batasan panjang nama file sendiri. Jika nama file pengguna diperlukan, pertimbangkan untuk menerapkan hal berikut:

- Terapkan panjang maksimum
- Batasi karakter ke subset yang diizinkan secara khusus, seperti karakter alfanumerik, tanda hubung, spasi, dan titik

- Jika ini tidak memungkinkan, blokir karakter berbahaya yang dapat membahayakan kerangka kerja dan sistem yang menyimpan dan menggunakan file.

### Validasi Konten File

Seperti yang disebutkan di bagian [Pengambilan File Publik](#public-file-retrieval), konten file dapat berisi data berbahaya, tidak pantas, atau ilegal.

Berdasarkan jenis yang diharapkan, validasi konten file khusus dapat diterapkan:

- Untuk **gambar**, menerapkan teknik penulisan ulang gambar akan menghancurkan semua jenis konten berbahaya yang dimasukkan ke dalam gambar; ini dapat dilakukan melalui [pengacakan](https://security.stackexchange.com/a/8625/118367).
- Untuk **dokumen Microsoft**, penggunaan [Apache POI](https://poi.apache.org/) membantu memvalidasi dokumen yang diunggah.
- **File ZIP** tidak direkomendasikan karena dapat berisi semua jenis file, dan vektor serangan yang berkaitan dengannya sangat banyak.

Layanan Unggah File seharusnya memungkinkan pengguna untuk melaporkan konten ilegal, dan pemilik hak cipta untuk melaporkan penyalahgunaan.

Jika ada cukup sumber daya, peninjauan berkas manual harus dilakukan di lingkungan sandboxed sebelum merilis berkas ke publik.

Menambahkan beberapa otomatisasi ke peninjauan dapat membantu, yang merupakan proses yang sulit dan harus dipelajari dengan baik sebelum penggunaannya. Beberapa layanan (misalnya Virus Total) menyediakan API untuk memindai berkas terhadap hash berkas berbahaya yang terkenal. Beberapa kerangka kerja dapat memeriksa dan memvalidasi jenis konten mentah dan memvalidasinya terhadap jenis berkas yang telah ditentukan sebelumnya, seperti di [ASP.NET Drawing Library](https://docs.microsoft.com/en-us/dotnet/api/system.drawing.imaging.imageformat). Waspadalah terhadap ancaman kebocoran data dan pengumpulan informasi oleh layanan publik.

### Lokasi Penyimpanan Berkas

Lokasi penyimpanan file harus dipilih berdasarkan persyaratan keamanan dan bisnis. Poin-poin berikut ditetapkan berdasarkan prioritas keamanan, dan bersifat inklusif:

1. Simpan file di **host berbeda**, yang memungkinkan pemisahan tugas sepenuhnya antara aplikasi yang melayani pengguna, dan host yang menangani unggahan file dan penyimpanannya.

2. Simpan file **di luar webroot**, tempat hanya akses administratif yang diizinkan.

3. Simpan file **di dalam webroot**, dan tetapkan dalam izin tulis saja.

Jika akses baca diperlukan, pengaturan kontrol yang tepat adalah suatu keharusan (misalnya IP internal, pengguna yang sah, dll.)

Menyimpan file dengan cara yang dipelajari dalam basis data adalah salah satu teknik tambahan. Ini terkadang digunakan untuk proses pencadangan otomatis, serangan non-sistem file, dan masalah izin. Sebagai gantinya, ini membuka pintu bagi masalah kinerja (dalam beberapa kasus), pertimbangan penyimpanan untuk basis data dan cadangannya, dan ini membuka pintu bagi serangan SQLi. Hal ini hanya disarankan jika ada DBA dalam tim dan proses ini menunjukkan adanya peningkatan dalam penyimpanan file di sistem berkas.

> Beberapa file dikirim melalui email atau diproses setelah diunggah, dan tidak disimpan di server. Sangat penting untuk melakukan langkah-langkah keamanan yang dibahas dalam lembar ini sebelum melakukan tindakan apa pun pada file tersebut.

### Izin Pengguna

Sebelum layanan unggah berkas diakses, validasi yang tepat harus dilakukan pada dua level untuk pengguna yang mengunggah berkas:

- Level autentikasi
- Pengguna harus menjadi pengguna terdaftar, atau pengguna yang dapat diidentifikasi, untuk menetapkan batasan dan pembatasan untuk kemampuan unggah mereka
- Level otorisasi
- Pengguna harus memiliki izin yang sesuai untuk mengakses atau mengubah berkas

### Izin Sistem Berkas

> Tetapkan izin berkas berdasarkan prinsip hak istimewa paling rendah.

File harus disimpan dengan cara yang memastikan:

- Pengguna sistem yang diizinkan adalah satu-satunya yang mampu membaca file
- Hanya mode yang diperlukan yang ditetapkan untuk file
- Jika eksekusi diperlukan, pemindaian file sebelum menjalankannya diperlukan sebagai praktik keamanan terbaik, untuk memastikan tidak ada makro atau skrip tersembunyi yang tersedia.

### Batasan Unggah dan Unduh

Aplikasi harus menetapkan batas ukuran yang tepat untuk layanan unggah guna melindungi kapasitas penyimpanan file. Jika sistem akan mengekstrak file atau memprosesnya, batas ukuran file harus dipertimbangkan setelah dekompresi file dilakukan dan dengan menggunakan metode yang aman untuk menghitung ukuran file zip. Untuk informasi lebih lanjut tentang ini, lihat cara [Mengekstrak file dengan aman dari ZipInputStream](https://wiki.sei.cmu.edu/confluence/display/java/IDS04-J.+Safely+extract+files+from+ZipInputStream), aliran input Java untuk menangani file ZIP.

Aplikasi juga harus menetapkan batasan permintaan yang tepat untuk layanan unduhan jika tersedia guna melindungi server dari serangan DoS.

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah pengunggahan file yang rentan:

### 1. Batasi Jenis File
- Batasi jenis file yang diizinkan berdasarkan ekstensi file dan jenis MIME.
- Hanya izinkan format tertentu yang tepercaya seperti gambar (`.jpg`, `.png`), dokumen (`.pdf`), dll.

### 2. Batasi Ukuran File
- Tetapkan batas ukuran pada file yang diunggah untuk mencegah serangan penolakan layanan (DoS).
- Pertimbangkan untuk membatasi ukuran file berdasarkan persyaratan aplikasi.

### 3. Gunakan Validasi Nama File yang Kuat
- Bersihkan nama file yang diunggah untuk mencegah karakter jahat atau serangan penelusuran jalur (misalnya, `../../`).
- Tolak atau ganti nama file dengan nama yang mencurigakan atau tidak aman.

### 4. Simpan File di Luar Root Web
- Hindari menyimpan file yang diunggah langsung di root dokumen server web. - Simpan file dalam direktori yang tidak dapat diakses langsung oleh server web, dan sajikan melalui akses terkendali.

### 5. Gunakan Pemindaian File untuk Malware
- Pindai semua file yang diunggah untuk mencari virus, malware, dan ancaman yang diketahui menggunakan antivirus atau alat keamanan tepercaya.
- Integrasikan pemindaian malware otomatis ke dalam proses pengunggahan file.

### 6. Hasilkan Nama File Unik
- Ubah nama file yang diunggah untuk menghasilkan nama file unik, mencegah tabrakan atau penimpaan file.
- Gunakan kombinasi string acak, UUID, atau stempel waktu untuk nama unik.

### 7. Terapkan Kontrol Akses untuk File yang Diunggah
- Terapkan kontrol akses ketat pada file yang diunggah, pastikan bahwa hanya pengguna yang berwenang yang dapat mengakses atau mengubahnya.
- Gunakan kontrol akses berbasis peran (RBAC) atau model izin lainnya.

### 8. Lakukan Pemeriksaan Jenis Konten
- Verifikasi jenis konten file yang diunggah di sisi server, meskipun ekstensi file atau jenis MIME dilaporkan oleh klien.
- Validasi konten file untuk memastikannya sesuai dengan jenis yang diharapkan.

### 9. Batasi Lokasi Unggahan yang Diizinkan
- Batasi unggahan file ke direktori atau subdirektori tertentu.
- Cegah unggahan ke direktori penting sistem (misalnya, `/bin`, `/etc`, atau `/dev`).

### 10. Aktifkan Pemeriksaan Integritas File
- Terapkan checksum atau fungsi hash (misalnya, SHA-256) untuk memverifikasi integritas file selama pengunggahan dan setelah penyimpanan.
- Deteksi gangguan atau kerusakan file yang diunggah.

### 11. Gunakan Web Application Firewall (WAF)
- Lindungi titik akhir unggahan file dengan WAF untuk mendeteksi dan memblokir unggahan file berbahaya.
- Gunakan aturan yang telah ditetapkan sebelumnya atau konfigurasi khusus untuk mengidentifikasi unggahan file yang mencurigakan.

### 12. Hindari Eksekusi Langsung File yang Diunggah
- Jangan izinkan file yang diunggah dieksekusi langsung di server (misalnya, `.php`, `.exe`, `.sh`). - Jika file yang dapat dieksekusi diperlukan, batasi eksekusi ke lingkungan yang aman dan terapkan teknik isolasi yang tepat.

### 13. Uji Fungsionalitas Unggah File Secara Berkala
- Lakukan pengujian penetrasi untuk mengidentifikasi kelemahan dalam fungsionalitas unggah file.
- Uji kerentanan seperti injeksi file, pengunggahan malware, atau serangan penolakan layanan (DoS).

### 14. Edukasi Pengembang dan Pengguna tentang Praktik Pengunggahan File yang Aman
- Berikan panduan kepada pengguna tentang jenis, ukuran, dan batasan file yang dapat diterima.
- Latih pengembang untuk mengikuti praktik pengunggahan file yang aman dan untuk menyadari kerentanan umum.

### 15. Terapkan Pencatatan dan Pemantauan
- Catat semua unggahan file, termasuk nama file, ukuran, jenis, dan detail pengguna.
- Pantau log secara berkala untuk aktivitas yang mencurigakan atau pola yang tidak biasa dalam unggahan file.

## Cuplikan Kode Java

Repositori [Perlindungan Unggahan Dokumen](https://github.com/righettod/document-upload-protection) yang ditulis oleh Dominique untuk jenis dokumen tertentu di Java.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `