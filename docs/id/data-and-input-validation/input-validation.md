---
sidebar_position: 1
---

# Validasi Input

## Pendahuluan tentang Validasi Input

Artikel ini difokuskan pada penyediaan panduan yang jelas, sederhana, dan dapat ditindaklanjuti untuk menyediakan fungsionalitas keamanan Validasi Input dalam aplikasi Anda.

## Sasaran Validasi Input

Validasi input dilakukan untuk memastikan hanya data yang terbentuk dengan benar yang memasuki alur kerja dalam sistem informasi, mencegah data yang tidak terbentuk tetap ada dalam basis data dan memicu kegagalan fungsi berbagai komponen hilir. Validasi input harus dilakukan sedini mungkin dalam aliran data, sebaiknya segera setelah data diterima dari pihak eksternal.

Data dari semua sumber yang berpotensi tidak tepercaya harus tunduk pada validasi input, termasuk tidak hanya klien web yang menghadap Internet tetapi juga umpan backend melalui ekstranet, dari [pemasok, mitra, vendor, atau regulator](https://badcyber.com/several-polish-banks-hacked-information-stolen-by-unknown-attackers/), yang masing-masing dapat dikompromikan sendiri dan mulai mengirim data yang tidak terbentuk.

Validasi Input tidak boleh digunakan sebagai metode *utama* untuk mencegah **XSS**, **Injeksi SQL**, dan serangan lain yang dibahas dalam [lembar contekan](https://cheatsheetseries.owasp.org/) masing-masing, tetapi dapat berkontribusi secara signifikan untuk mengurangi dampaknya jika diterapkan dengan benar.

## Strategi Validasi Input

Validasi input harus diterapkan pada tingkat sintaksis dan semantik:

- Validasi **sintaksis** harus menerapkan sintaksis yang benar dari bidang terstruktur (misalnya SSN, tanggal, simbol mata uang).
- Validasi **semantik** harus menerapkan kebenaran *nilai* mereka dalam konteks bisnis tertentu (misalnya tanggal mulai sebelum tanggal berakhir, harga berada dalam kisaran yang diharapkan).

Selalu disarankan untuk mencegah serangan sedini mungkin dalam pemrosesan permintaan pengguna (penyerang). Validasi input dapat digunakan untuk mendeteksi input yang tidak sah sebelum diproses oleh aplikasi.

## Menerapkan Validasi Input

Validasi input dapat diterapkan menggunakan teknik pemrograman apa pun yang memungkinkan penerapan kebenaran sintaksis dan semantik yang efektif, misalnya:

- Validator tipe data tersedia secara native dalam kerangka kerja aplikasi web (seperti [Django Validators](https://docs.djangoproject.com/en/1.11/ref/validators/), [Apache Commons Validators](https://commons.apache.org/proper/commons-validator/apidocs/org/apache/commons/validator/package-summary.html#doc.Usage.validator) dll).
- Validasi terhadap [JSON Schema](http://json-schema.org/) dan [XML Schema (XSD)](https://www.w3schools.com/xml/schema_intro.asp) untuk input dalam format ini. - Konversi tipe (misalnya `Integer.parseInt()` di Java, `int()` di Python) dengan penanganan pengecualian yang ketat
- Pemeriksaan rentang nilai minimum dan maksimum untuk parameter numerik dan tanggal, pemeriksaan panjang minimum dan maksimum untuk string.
- Rangkaian nilai yang diizinkan untuk set kecil parameter string (misalnya hari dalam seminggu).
- Ekspresi reguler untuk data terstruktur lainnya yang mencakup seluruh string input `(^...$)` dan **tidak** menggunakan karakter pengganti "karakter apa pun" (seperti `.` atau `\S`)
- Menolak pola berbahaya yang diketahui dapat digunakan sebagai lapisan pertahanan tambahan, tetapi harus melengkapi - bukan menggantikan - daftar yang diizinkan, untuk membantu menangkap beberapa serangan atau pola yang umum diamati tanpa mengandalkannya sebagai metode validasi utama.

### Daftar yang Diizinkan vs Daftar yang Ditolak

Merupakan kesalahan umum untuk menggunakan validasi daftar yang ditolak guna mencoba mendeteksi karakter dan pola yang mungkin berbahaya seperti karakter apostrof `'`, string `1=1`, atau tag `<script>`, tetapi ini merupakan pendekatan yang sangat cacat karena mudah bagi penyerang untuk melewati filter tersebut.

Ditambah lagi, filter tersebut sering kali mencegah masukan yang sah, seperti `O'Brian`, di mana karakter `'` sepenuhnya sah. Untuk informasi lebih lanjut tentang penghindaran filter XSS, silakan lihat [halaman wiki ini](https://owasp.org/www-community/xss-filter-evasion-cheatsheet).

Meskipun daftar yang ditolak dapat berguna sebagai lapisan pertahanan tambahan untuk menangkap beberapa pola berbahaya yang umum, hal itu tidak boleh diandalkan sebagai metode utama. Daftar yang diizinkan tetap menjadi pendekatan yang lebih kuat dan aman untuk mencegah masukan yang berpotensi berbahaya.

Validasi daftar yang diizinkan sesuai untuk semua bidang masukan yang diberikan oleh pengguna. Validasi daftar putih melibatkan pendefinisian secara tepat apa yang diizinkan, dan menurut definisi, semua hal lainnya tidak diizinkan.

Jika data tersebut terstruktur dengan baik, seperti tanggal, nomor jaminan sosial, kode pos, alamat email, dll. maka pengembang harus dapat mendefinisikan pola validasi yang sangat kuat, biasanya berdasarkan ekspresi reguler, untuk memvalidasi masukan tersebut.

Jika kolom input berasal dari serangkaian opsi tetap, seperti daftar drop-down atau tombol radio, maka input harus benar-benar cocok dengan salah satu nilai yang ditawarkan kepada pengguna sejak awal.

### Memvalidasi Teks Unicode Bentuk Bebas

Teks bentuk bebas, khususnya dengan karakter Unicode, dianggap sulit divalidasi karena ruang karakter yang relatif besar yang perlu diizinkan.

Input teks bentuk bebas juga menyoroti pentingnya pengodean output yang sesuai konteks dan dengan jelas menunjukkan bahwa validasi input **bukan** perlindungan utama terhadap Cross-Site Scripting. Jika pengguna Anda ingin mengetik apostrof `'` atau tanda kurang dari `<` di kolom komentar mereka, mereka mungkin memiliki alasan yang sangat sah untuk itu dan tugas aplikasi adalah menanganinya dengan benar di seluruh siklus hidup data.

Cara utama validasi input untuk input teks bentuk bebas adalah:

- **Normalisasi:** Pastikan pengodean kanonik digunakan di seluruh teks dan tidak ada karakter yang tidak valid. - **Daftar karakter yang diizinkan:** Unicode mengizinkan pencantuman kategori seperti "angka desimal" atau "huruf" yang tidak hanya mencakup alfabet Latin tetapi juga berbagai skrip lain yang digunakan secara global (misalnya Arab, Sirilik, ideograf CJK, dll.).

- **Daftar karakter yang diizinkan:** Jika Anda mengizinkan huruf dan ideograf dalam nama dan juga ingin mengizinkan apostrof `'` untuk nama Irlandia, tetapi tidak ingin mengizinkan seluruh kategori tanda baca.

Referensi:

- [Validasi input teks Unicode bentuk bebas dalam Python](https://web.archive.org/web/20170717174432/https://ipsec.pl/python/2017/input-validation-free-form-unicode-text-python.html/)
- [UAX 31: Pengidentifikasi Unicode dan Sintaksis Pola](https://unicode.org/reports/tr31/)
- [UAX 15: Bentuk Normalisasi Unicode](https://www.unicode.org/reports/tr15/)
- [UAX 24: Properti Skrip Unicode](https://unicode.org/reports/tr24/)

### Ekspresi Reguler (Regex)

Mengembangkan ekspresi reguler bisa jadi rumit, dan jauh di luar cakupan lembar contekan ini.

Ada banyak sumber daya di internet tentang cara menulis ekspresi reguler, termasuk [situs](https://www.regular-expressions.info/) ini dan [Repositori Regex Validasi OWASP](https://owasp.org/www-community/OWASP_Validation_Regex_Repository).

Saat merancang ekspresi reguler, waspadai [serangan Penolakan Layanan RegEx (ReDoS)](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS). Serangan ini menyebabkan program yang menggunakan Ekspresi Reguler yang dirancang dengan buruk beroperasi sangat lambat dan menggunakan sumber daya CPU untuk waktu yang sangat lama.

Singkatnya, validasi input harus:

- Diterapkan ke semua data input, minimal.

- Menentukan set karakter yang diizinkan untuk diterima.

- Menentukan panjang minimum dan maksimum untuk data (misalnya `{1,25}`).

## Contoh Ekspresi Reguler Daftar Izin

Memvalidasi Kode Pos AS (5 digit plus opsional -4)

```text
^\d{5}(-\d{4})?$
```

Validating U.S. State Selection From a Drop-Down Menu

```text
^(AA|AE|AP|AL|AK|AS|AZ|AR|CA|CO|CT|DE|DC|FM|FL|GA|GU|
HI|ID|IL|IN|IA|KS|KY|LA|ME|MH|MD|MA|MI|MN|MS|MO|MT|NE|
NV|NH|NJ|NM|NY|NC|ND|MP|OH|OK|OR|PW|PA|PR|RI|SC|SD|TN|
TX|UT|VT|VI|VA|WA|WV|WI|WY)$
```

**Contoh Penggunaan Java Regex:**

Contoh validasi parameter "zip" menggunakan ekspresi reguler.

```java
private static final Pattern zipPattern = Pattern.compile("^\d{5}(-\d{4})?$");

public void doPost( HttpServletRequest request, HttpServletResponse response) {
  try {
      String zipCode = request.getParameter( "zip" );
      if ( !zipPattern.matcher( zipCode ).matches() ) {
          throw new YourValidationException( "Improper zipcode format." );
      }
      // do what you want here, after its been validated ..
  } catch(YourValidationException e ) {
      response.sendError( response.SC_BAD_REQUEST, e.getMessage() );
  }
}
```

Beberapa validator Daftar Izin juga telah ditetapkan sebelumnya dalam berbagai paket sumber terbuka yang dapat Anda manfaatkan. Misalnya:

- [Apache Commons Validator](http://commons.apache.org/proper/commons-validator/)

## Validasi Sisi Klien vs. Sisi Server

Validasi input **harus** diimplementasikan di sisi server sebelum data apa pun diproses oleh fungsi aplikasi, karena validasi input berbasis JavaScript apa pun yang dilakukan di sisi klien dapat dielakkan oleh penyerang yang menonaktifkan JavaScript atau menggunakan proksi web. Menerapkan validasi berbasis JavaScript sisi klien untuk UX dan validasi sisi server untuk keamanan adalah pendekatan yang direkomendasikan, memanfaatkan masing-masing untuk kelebihannya masing-masing.

## Memvalidasi Konten Pengguna yang Kaya

Sangat sulit untuk memvalidasi konten kaya yang dikirimkan oleh pengguna. Untuk informasi lebih lanjut, silakan lihat lembar contekan XSS tentang **Membersihkan Markup HTML dengan Pustaka yang Dirancang untuk Pekerjaan**.

## Mencegah XSS dan Kebijakan Keamanan Konten

Semua data pengguna yang dikontrol harus dikodekan saat dikembalikan di halaman HTML untuk mencegah eksekusi data berbahaya (misalnya XSS). Misalnya `<script>` akan dikembalikan sebagai `<script>`

Jenis pengodean khusus untuk konteks halaman tempat data yang dikontrol pengguna dimasukkan. Misalnya, pengodean entitas HTML sesuai untuk data yang ditempatkan di badan HTML. Namun, data pengguna yang ditempatkan ke dalam skrip akan memerlukan pengodean keluaran khusus JavaScript.

Informasi terperinci tentang pencegahan XSS di sini: **OWASP XSS Prevention Cheat Sheet**

## Validasi Pengunggahan File

Banyak situs web memungkinkan pengguna untuk mengunggah file, seperti gambar profil atau lainnya. Bagian ini membantu menyediakan fitur tersebut dengan aman.

Periksa **File Upload Cheat Sheet**.

### Verifikasi Pengunggahan

- Gunakan validasi input untuk memastikan nama file yang diunggah menggunakan jenis ekstensi yang diharapkan.

- Pastikan file yang diunggah tidak lebih besar dari ukuran file maksimum yang ditentukan.
- Jika situs web mendukung pengunggahan file ZIP, lakukan pemeriksaan validasi sebelum mengekstrak file. Pemeriksaan tersebut meliputi jalur target, tingkat kompresi, perkiraan ukuran ekstraksi.

### Penyimpanan Unggah

- Gunakan nama file baru untuk menyimpan file di OS. Jangan gunakan teks yang dikontrol pengguna untuk nama file ini atau untuk nama file sementara.
- Saat file diunggah ke web, disarankan untuk mengganti nama file di penyimpanan. Misalnya, nama file yang diunggah adalah *test.JPG*, ganti namanya menjadi *JAI1287uaisdjhf.JPG* dengan nama file acak. Tujuannya adalah untuk mencegah risiko akses file langsung dan nama file ambigu untuk menghindari filter, seperti `test.jpg;.asp atau /../../../../../test.jpg`.
- File yang diunggah harus dianalisis untuk konten berbahaya (anti-malware, analisis statis, dll.).
- Jalur file tidak boleh dapat ditentukan oleh sisi klien. Hal ini diputuskan oleh sisi server.

### Penyajian Publik Konten yang Diunggah

- Pastikan gambar yang diunggah disajikan dengan jenis konten yang benar (misalnya image/jpeg, application/x-xpinstall)

### Waspadai Jenis File Tertentu

Fitur unggah harus menggunakan pendekatan daftar yang diizinkan untuk hanya mengizinkan jenis dan ekstensi file tertentu. Namun, penting untuk mengetahui jenis file berikut yang, jika diizinkan, dapat mengakibatkan kerentanan keamanan:

- **crossdomain.xml** / **clientaccesspolicy.xml:** mengizinkan pemuatan data lintas domain di Flash, Java, dan Silverlight. Jika diizinkan di situs dengan autentikasi, hal ini dapat mengizinkan pencurian data lintas domain dan serangan CSRF. Perhatikan bahwa hal ini dapat menjadi sangat rumit tergantung pada versi plugin tertentu yang dimaksud, jadi sebaiknya larang saja file bernama "crossdomain.xml" atau "clientaccesspolicy.xml". - **.htaccess** dan **.htpasswd:** Menyediakan opsi konfigurasi server berdasarkan per direktori, dan tidak boleh diizinkan. Lihat [dokumentasi HTACCESS](http://en.wikipedia.org/wiki/Htaccess).
- File skrip web yang dapat dieksekusi disarankan untuk tidak diizinkan seperti `aspx, asp, css, swf, xhtml, rhtml, shtml, jsp, js, pl, php, cgi`.

### Verifikasi Unggahan Gambar

- Gunakan pustaka penulisan ulang gambar untuk memverifikasi bahwa gambar tersebut valid dan untuk menghapus konten yang tidak relevan.
- Tetapkan ekstensi gambar yang disimpan menjadi ekstensi gambar yang valid berdasarkan jenis konten gambar yang terdeteksi dari pemrosesan gambar (misalnya, jangan hanya mempercayai tajuk dari unggahan). - Pastikan jenis konten gambar yang terdeteksi berada dalam daftar jenis gambar yang ditentukan (jpg, png, dll.)

## Validasi Alamat Email

### Validasi Sintaksis

Format alamat email ditentukan oleh [RFC 5321](https://tools.ietf.org/html/rfc5321#section-4.1.2), dan jauh lebih rumit daripada yang disadari kebanyakan orang. Sebagai contoh, berikut ini semuanya dianggap sebagai alamat email yang valid:

- `"><script>alert(1);</script>"@example.org`
- `user+subaddress@example.org`
- `user@[IPv6:2001:db8::1]`
- `" "@example.org`

Mengurai alamat email dengan benar untuk validitas dengan ekspresi reguler sangatlah rumit, meskipun ada sejumlah [dokumen yang tersedia untuk umum tentang regex](https://datatracker.ietf.org/doc/html/draft-seantek-mail-regexen-03#rfc.section.3).

Peringatan terbesar tentang hal ini adalah bahwa meskipun RFC mendefinisikan format yang sangat fleksibel untuk alamat email, sebagian besar implementasi di dunia nyata (seperti server email) menggunakan format alamat yang jauh lebih terbatas, yang berarti bahwa mereka akan menolak alamat yang *secara teknis* valid. Meskipun secara teknis mungkin benar, alamat ini tidak banyak berguna jika aplikasi Anda tidak akan dapat benar-benar mengirim email ke alamat tersebut.

Dengan demikian, cara terbaik untuk memvalidasi alamat email adalah dengan melakukan beberapa validasi awal dasar, lalu meneruskan alamat tersebut ke server email dan menangkap pengecualian jika server menolaknya. Ini berarti bahwa aplikasi dapat yakin bahwa server emailnya dapat mengirim email ke alamat mana pun yang diterimanya. Validasi awal bisa sesederhana ini:

- Alamat email berisi dua bagian, dipisahkan dengan simbol `@`.
- Alamat email tidak berisi karakter berbahaya (seperti tanda kutip terbalik, tanda kutip tunggal atau ganda, atau byte nol).
- Karakter mana yang berbahaya akan bergantung pada bagaimana alamat akan digunakan (digemakan di halaman, dimasukkan ke dalam basis data, dll.).
- Bagian domain hanya berisi huruf, angka, tanda hubung (`-`) dan titik (`.`).
- Alamat email memiliki panjang yang wajar:
- Bagian lokal (sebelum `@`) tidak boleh lebih dari 63 karakter.
- Panjang total tidak boleh lebih dari 254 karakter.

### Validasi Semantik

Validasi semantik adalah tentang menentukan apakah alamat email benar dan sah. Cara yang paling umum untuk melakukannya adalah dengan mengirim email ke pengguna, dan meminta mereka mengklik tautan di email, atau memasukkan kode yang telah dikirimkan kepada mereka. Ini memberikan tingkat jaminan dasar bahwa:

- Alamat email sudah benar.
- Aplikasi dapat berhasil mengirim email ke alamat tersebut.
- Pengguna memiliki akses ke kotak surat.

Tautan yang dikirim ke pengguna untuk membuktikan kepemilikan harus berisi token yang:

- Panjangnya minimal 32 karakter.
- Dibuat menggunakan **sumber acak yang aman**.
- Sekali pakai.
- Terbatas waktu (misalnya, kedaluwarsa setelah delapan jam).

Setelah memvalidasi kepemilikan alamat email, pengguna kemudian harus diminta untuk mengautentikasi pada aplikasi melalui mekanisme yang biasa.

#### Alamat Email Sekali Pakai

Dalam beberapa kasus, pengguna mungkin tidak ingin memberikan alamat email asli mereka saat mendaftar pada aplikasi, dan sebagai gantinya akan memberikan alamat email sekali pakai. Ini adalah alamat yang tersedia untuk umum yang tidak mengharuskan pengguna untuk mengautentikasi, dan biasanya digunakan untuk mengurangi jumlah spam yang diterima oleh alamat email utama pengguna.

Memblokir alamat email sekali pakai hampir mustahil, karena ada banyak situs web yang menawarkan layanan ini, dengan domain baru yang dibuat setiap hari. Ada sejumlah daftar yang tersedia untuk umum dan daftar komersial domain sekali pakai yang diketahui, tetapi daftar ini tidak akan pernah lengkap.

Jika daftar ini digunakan untuk memblokir penggunaan alamat email sekali pakai, maka pengguna akan diberikan pesan yang menjelaskan mengapa alamat tersebut diblokir (meskipun mereka cenderung hanya mencari penyedia layanan sekali pakai lain daripada memberikan alamat yang sah).

Jika alamat email sekali pakai harus diblokir, maka pendaftaran hanya boleh dilakukan dari penyedia layanan email yang diizinkan secara khusus. Namun, jika ini mencakup penyedia layanan publik seperti Google atau Yahoo, pengguna cukup mendaftarkan alamat sekali pakai mereka sendiri dengan penyedia layanan tersebut.

#### Sub-Addressing

Sub-addressing memungkinkan pengguna untuk menentukan *tag* di bagian lokal alamat email (sebelum tanda `@`), yang akan diabaikan oleh server email. Misalnya, jika domain `example.org` mendukung sub-addressing, maka alamat email berikut ini setara:

- `user@example.org`
- `user+site1@example.org`
- `user+site2@example.org`

Banyak penyedia email (seperti Microsoft Exchange) tidak mendukung sub-addressing. Penyedia yang paling terkenal yang mendukungnya adalah Gmail, meskipun ada banyak penyedia lain yang juga mendukungnya.

Beberapa pengguna akan menggunakan *tag* yang berbeda untuk setiap situs web tempat mereka mendaftar, sehingga jika mereka mulai menerima spam ke salah satu sub-alamat, mereka dapat mengidentifikasi situs web mana yang membocorkan atau menjual alamat email mereka.

Karena fitur ini memungkinkan pengguna untuk mendaftarkan beberapa akun dengan satu alamat email, beberapa situs mungkin ingin memblokir sub-pengalamatan dengan menghapus semua tanda antara `+` dan `@`. Fitur ini umumnya tidak direkomendasikan, karena hal ini menunjukkan bahwa pemilik situs web tidak menyadari adanya sub-pengalamatan atau ingin mencegah pengguna mengidentifikasi mereka saat mereka membocorkan atau menjual alamat email. Selain itu, fitur ini dapat dengan mudah dilewati dengan menggunakan [alamat email sekali pakai](#disposable-email-addresses), atau cukup mendaftarkan beberapa akun email dengan penyedia tepercaya.

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah validasi input yang rentan:

### 1. Validasi Input di Sisi Klien dan Sisi Server
- Lakukan validasi sisi klien untuk pengalaman pengguna yang lebih baik.
- Selalu terapkan validasi di sisi server sebagai pertahanan utama.

### 2. Gunakan Daftar Putih
- Izinkan hanya input yang diketahui dan diharapkan, seperti karakter, pola, atau tipe data tertentu.
- Tolak input apa pun yang tidak sesuai dengan kriteria daftar putih.

### 3. Tetapkan Batas Panjang
- Tetapkan batasan panjang minimum dan maksimum untuk bidang input.
- Cegah input yang terlalu panjang yang dapat menyebabkan luapan buffer atau serangan penolakan layanan.

### 4. Validasi Format Input
- Gunakan ekspresi reguler atau pola yang telah ditetapkan sebelumnya untuk memastikan input sesuai dengan format yang diharapkan (misalnya, alamat email, nomor telepon).
- Tolak input yang menyimpang dari format yang diharapkan.

### 5. Hapus atau Keluarkan Karakter Berbahaya
- Gunakan teknik escape untuk input yang akan ditampilkan sebagai HTML, SQL, atau konteks lainnya. - Saring atau enkode karakter seperti `<`, `>`, `'`, `"`, `;`, dan `--`.

### 6. Terapkan Tipe Data Kuat
- Validasi input terhadap tipe data tertentu (misalnya, bilangan bulat, tanggal).
- Gunakan pengecoran tipe dan perbandingan ketat untuk menghindari perilaku yang tidak diharapkan.

### 7. Tolak Byte Null dan Karakter yang Tidak Dapat Dicetak
- Hapus byte null (`\0`) dan karakter lain yang tidak dapat dicetak dari input pengguna.
- Tolak input yang berisi karakter ini jika tidak diperlukan.

### 8. Bersihkan Input Sebelum Diproses
- Gunakan pustaka atau kerangka kerja tepercaya untuk membersihkan input untuk konteks tertentu (misalnya, kueri basis data, rendering HTML).
- Pastikan bahwa pembersihan tidak menghapus data penting secara tidak sengaja.

### 9. Hindari Mengandalkan Validasi JavaScript Semata-mata
- Jangan berasumsi bahwa validasi sisi klien saja sudah cukup, karena dapat dilewati.
- Gunakan validasi sisi server untuk menegakkan aturan keamanan.

### 10. Batasi Unggahan File
- Batasi jenis dan ukuran file untuk input unggahan file.
- Validasi konten dan ekstensi file sebelum menerimanya.

### 11. Uji dan Pantau Input
- Uji aplikasi secara berkala untuk serangan injeksi dan kerentanan berbasis input.
- Catat dan pantau input untuk pola yang mencurigakan atau penyalahgunaan.

### 12. Terapkan Pustaka Validasi Input
- Gunakan pustaka atau kerangka kerja yang teruji dengan baik untuk menangani validasi input dengan aman.
- Hindari menulis logika validasi khusus kecuali benar-benar diperlukan.

### 13. Lindungi dari Serangan Injeksi
- Gabungkan validasi input dengan kueri berparameter untuk mencegah injeksi SQL.
- Hindari membuat perintah atau kueri secara dinamis menggunakan input pengguna.

### 14. Berikan Pesan Kesalahan Deskriptif
- Berikan umpan balik yang jelas kepada pengguna tentang input yang tidak valid tanpa mengungkap detail sistem yang sensitif.
- Hindari kebocoran aturan validasi dalam pesan kesalahan.

### 15. Tinjau dan Perbarui Aturan Validasi Secara Berkala
- Sesuaikan aturan validasi seiring dengan perkembangan persyaratan aplikasi dan ancaman.
- Pastikan logika validasi konsisten di seluruh aplikasi.

## Referensi

- [OWASP Top 10 Proactive Controls 2024: C3: Validate all Input & Handle Exceptions](https://top10proactive.owasp.org/the-top-10/c3-validate-input-and-handle-exceptions)
- [CWE-20 Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)
- [OWASP Top 10 2021: A03:2021-Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [Snyk: Improper Input Validation](https://learn.snyk.io/lesson/improper-input-validation/)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `