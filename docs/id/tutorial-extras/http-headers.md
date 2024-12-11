---
sidebar_position: 1
---

# Header HTTP

## Pendahuluan tentang Header HTTP

Header HTTP merupakan pendorong hebat bagi keamanan web dengan penerapan yang mudah. ​​Header respons HTTP yang tepat dapat membantu mencegah kerentanan keamanan seperti Cross-Site Scripting, Clickjacking, Pengungkapan informasi, dan banyak lagi.

Dalam lembar contekan ini, kami akan meninjau semua header HTTP terkait keamanan, konfigurasi yang direkomendasikan, dan merujuk sumber lain untuk header yang rumit.

## Header Keamanan

### X-Frame-Options

Header respons HTTP `X-Frame-Options` dapat digunakan untuk menunjukkan apakah browser diizinkan untuk merender halaman dalam `<frame>`, `<iframe>`, `<embed>`, atau `<object>`. Situs dapat menggunakan ini untuk menghindari serangan [clickjacking](https://owasp.org/www-community/attacks/Clickjacking), dengan memastikan bahwa konten mereka tidak disematkan ke situs lain.

Arahan frame-ancestors Kebijakan Keamanan Konten (CSP) menggantikan X-Frame-Options untuk browser yang mendukung ([sumber](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)).

Header X-Frame-Options hanya berguna ketika respons HTTP tempat header tersebut disertakan memiliki sesuatu untuk berinteraksi (misalnya tautan, tombol). Jika respons HTTP adalah pengalihan atau API yang mengembalikan data JSON, X-Frame-Options tidak menyediakan keamanan apa pun.

#### Rekomendasi

Gunakan arahan frame-ancestors Kebijakan Keamanan Konten (CSP) jika memungkinkan.

Jangan izinkan halaman ditampilkan dalam bingkai. > `X-Frame-Options: DENY`

### X-XSS-Protection

Header respons HTTP `X-XSS-Protection` merupakan fitur Internet Explorer, Chrome, dan Safari yang menghentikan pemuatan halaman saat mendeteksi serangan cross-site scripting (XSS).

PERINGATAN: Meskipun header ini dapat melindungi pengguna browser web lama yang belum mendukung CSP, dalam beberapa kasus, header ini dapat membuat kerentanan XSS di situs web yang aman [sumber](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection).

#### Rekomendasi

Gunakan Kebijakan Keamanan Konten (CSP) yang menonaktifkan penggunaan JavaScript sebaris.

Jangan tetapkan header ini atau menonaktifkannya secara eksplisit.
> `X-XSS-Protection: 0`

Silakan lihat [Mozilla X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) untuk detailnya.

### X-Content-Type-Options

Header HTTP respons `X-Content-Type-Options` digunakan oleh server untuk menunjukkan kepada browser bahwa tipe MIME yang diiklankan di header Content-Type harus diikuti dan tidak ditebak.

Header ini digunakan untuk memblokir [pengendusan tipe MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#mime_sniffing) peramban, yang dapat mengubah tipe MIME yang tidak dapat dieksekusi menjadi tipe MIME yang dapat dieksekusi ([Serangan Kebingungan MIME](https://blog.mozilla.org/security/2016/08/26/mitigating-mime-confusion-attacks-in-firefox/)).

#### Rekomendasi

Tetapkan header Content-Type dengan benar di seluruh situs.

> `X-Content-Type-Options: nosniff`

### Referrer-Policy

Header HTTP `Referrer-Policy` mengontrol seberapa banyak informasi referrer (yang dikirim melalui header Referer) yang harus disertakan dengan permintaan.

#### Rekomendasi

Kebijakan referrer telah didukung oleh browser sejak 2014. Saat ini, perilaku default di browser modern adalah tidak lagi mengirim semua informasi referrer (asal, jalur, dan string kueri) ke situs yang sama tetapi hanya mengirim asal ke situs lain. Namun, karena tidak semua pengguna mungkin menggunakan browser terbaru, kami sarankan untuk memaksakan perilaku ini dengan mengirimkan header ini pada semua respons.

> `Referrer-Policy: strict-origin-when-cross-origin`

- *CATATAN:* Untuk informasi lebih lanjut tentang mengonfigurasi header ini, silakan lihat [Mozilla Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy).

### Content-Type

Header representasi `Content-Type` digunakan untuk menunjukkan jenis media asli dari sumber daya (sebelum pengodean konten apa pun diterapkan untuk pengiriman). Jika tidak ditetapkan dengan benar, sumber daya (misalnya gambar) dapat ditafsirkan sebagai HTML, yang memungkinkan kerentanan XSS.

Meskipun disarankan untuk selalu menetapkan header `Content-Type` dengan benar, hal itu akan menjadi kerentanan hanya jika konten dimaksudkan untuk dirender oleh klien dan sumber daya tidak tepercaya (disediakan atau dimodifikasi oleh pengguna).

#### Rekomendasi

> `Content-Type: text/html; charset=UTF-8`

- *CATATAN:* atribut `charset` diperlukan untuk mencegah XSS di halaman **HTML**
- *CATATAN*: `text/html` dapat berupa salah satu [tipe MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) yang memungkinkan

### Set-Cookie

Header respons HTTP `Set-Cookie` digunakan untuk mengirim cookie dari server ke agen pengguna, sehingga agen pengguna dapat mengirimkannya kembali ke server nanti. Untuk mengirim beberapa cookie, beberapa header Set-Cookie harus dikirim dalam respons yang sama.

Ini bukan header keamanan, tetapi atribut keamanannya sangat penting.

#### Rekomendasi

- Harap baca [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies) untuk penjelasan terperinci tentang opsi konfigurasi cookie.

### Strict-Transport-Security (HSTS)

Header respons HTTP `Strict-Transport-Security` (sering disingkat HSTS) memungkinkan situs web memberi tahu browser bahwa situs web tersebut hanya boleh diakses menggunakan HTTPS, alih-alih menggunakan HTTP.

#### Rekomendasi

> `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

- *CATATAN*: Baca dengan saksama cara kerja header ini sebelum menggunakannya. Jika header HSTS salah dikonfigurasi atau jika ada masalah dengan sertifikat SSL/TLS yang digunakan, pengguna yang sah mungkin tidak dapat mengakses situs web. Misalnya, jika header HSTS disetel ke durasi yang sangat panjang dan sertifikat SSL/TLS kedaluwarsa atau dicabut, pengguna yang sah mungkin tidak dapat mengakses situs web hingga durasi header HSTS berakhir.

Silakan periksa [HTTP Strict Transport Security Cheat Sheet](HTTP_Strict_Transport_Security_Cheat_Sheet.md) untuk informasi lebih lanjut.

### Expect-CT ❌

Header `Expect-CT` memungkinkan situs ikut serta dalam pelaporan persyaratan Transparansi Sertifikat (CT). Mengingat klien arus utama kini memerlukan kualifikasi CT, satu-satunya nilai yang tersisa adalah melaporkan kejadian tersebut ke nilai report-uri yang dinominasikan di header. Header kini tidak lagi tentang penegakan hukum, tetapi lebih tentang deteksi/pelaporan.

#### Rekomendasi

Jangan menggunakannya. Mozilla [merekomendasikan](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT) untuk menghindarinya, dan menghapusnya dari kode yang ada jika memungkinkan.

### Kebijakan Keamanan Konten (CSP)

Kebijakan Keamanan Konten (CSP) adalah fitur keamanan yang digunakan untuk menentukan asal konten yang diizinkan untuk dimuat di situs web atau dalam aplikasi web. Ini adalah lapisan keamanan tambahan yang membantu mendeteksi dan mengurangi jenis serangan tertentu, termasuk Cross-Site Scripting (XSS) dan serangan injeksi data. Serangan ini digunakan untuk segala hal mulai dari pencurian data hingga perusakan situs hingga distribusi malware.

- *CATATAN*: Header ini relevan untuk diterapkan di halaman yang dapat memuat dan menginterpretasikan skrip dan kode, tetapi mungkin tidak berarti dalam respons REST API yang mengembalikan konten yang tidak akan ditampilkan.

#### Rekomendasi

Kebijakan Keamanan Konten rumit untuk dikonfigurasi dan dikelola. Untuk penjelasan tentang opsi penyesuaian, silakan baca [Content Security Policy Cheat Sheet](Content_Security_Policy_Cheat_Sheet.md)

### Access-Control-Allow-Origin

Jika Anda tidak menggunakan header ini, situs Anda dilindungi secara default oleh Same Origin Policy (SOP). Yang dilakukan header ini adalah melonggarkan kontrol ini dalam keadaan tertentu.

`Access-Control-Allow-Origin` adalah header CORS (cross-origin resource sharing). Header ini menunjukkan apakah respons yang terkait dengannya dapat dibagikan dengan kode yang meminta dari asal yang diberikan. Dengan kata lain, jika siteA meminta sumber daya dari siteB, siteB harus menunjukkan dalam header `Access-Control-Allow-Origin` bahwa siteA diizinkan untuk mengambil sumber daya tersebut, jika tidak, akses diblokir karena Same Origin Policy (SOP).

#### Rekomendasi

Jika Anda menggunakannya, tetapkan [asal](https://developer.mozilla.org/en-US/docs/Glossary/Origin) tertentu, bukan `*`. Lihat [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) untuk detailnya.
> `Access-Control-Allow-Origin: https://yoursite.com`

- *CATATAN*: Penggunaan '\*' mungkin diperlukan tergantung pada kebutuhan Anda. Misalnya, untuk API publik yang seharusnya dapat diakses dari asal mana pun, mungkin perlu mengizinkan '\*'.

### Cross-Origin-Opener-Policy (COOP)

Header respons HTTP `Cross-Origin-Opener-Policy` (COOP) memungkinkan Anda memastikan dokumen tingkat atas tidak berbagi grup konteks penelusuran dengan dokumen lintas asal.

Header ini bekerja bersama dengan Cross-Origin-Embedder-Policy (COEP) dan Cross-Origin-Resource-Policy (CORP) yang dijelaskan di bawah ini.

Mekanisme ini melindungi terhadap serangan seperti Spectre yang dapat melewati batas keamanan yang ditetapkan oleh Same Origin Policy (SOP) untuk sumber daya dalam grup konteks penelusuran yang sama.

Karena header ini sangat terkait dengan browser, mungkin tidak masuk akal untuk diterapkan ke REST API atau klien yang bukan browser.

#### Rekomendasi

Mengisolasi konteks penelusuran secara eksklusif ke dokumen asal yang sama. > `Cross-Origin-Opener-Policy: same-origin`

### Cross-Origin-Embedder-Policy (COEP)

Header respons HTTP `Cross-Origin-Embedder-Policy` (COEP) mencegah dokumen memuat sumber daya lintas asal yang tidak secara eksplisit memberikan izin dokumen (menggunakan [CORP](#cross-origin-resource-policy) atau CORS).

- *CATATAN*: Mengaktifkan ini akan memblokir sumber daya lintas asal yang tidak dikonfigurasi dengan benar agar tidak dimuat.

#### Rekomendasi

Suatu dokumen hanya dapat memuat sumber daya dari asal yang sama, atau sumber daya yang secara eksplisit ditandai sebagai dapat dimuat dari asal lain.
> `Cross-Origin-Embedder-Policy: require-corp`

- *CATATAN*: Anda dapat mengabaikannya untuk sumber daya tertentu dengan menambahkan atribut `crossorigin`:
- `<img src="https://thirdparty.com/img.png" crossorigin>`

### Cross-Origin-Resource-Policy (CORP)

Header `Cross-Origin-Resource-Policy` (CORP) memungkinkan Anda untuk mengontrol serangkaian asal yang berwenang untuk menyertakan suatu sumber daya. Ini merupakan pertahanan yang kuat terhadap serangan seperti [Spectre](https://meltdownattack.com/), karena memungkinkan browser untuk memblokir respons tertentu sebelum memasuki proses penyerang.

#### Rekomendasi

Batasi pemuatan sumber daya saat ini ke situs dan subdomain saja. > `Cross-Origin-Resource-Policy: same-site`

### Permissions-Policy (sebelumnya Feature-Policy)

Permissions-Policy memungkinkan Anda untuk mengontrol origin mana yang dapat menggunakan fitur browser mana, baik di halaman tingkat atas maupun di frame yang disematkan. Untuk setiap fitur yang dikontrol oleh Feature Policy, fitur tersebut hanya diaktifkan di dokumen atau frame saat ini jika origin-nya cocok dengan daftar origin yang diizinkan. Ini berarti Anda dapat mengonfigurasi situs Anda agar tidak pernah mengizinkan kamera atau mikrofon diaktifkan. Ini mencegah injeksi, misalnya XSS, mengaktifkan kamera, mikrofon, atau fitur browser lainnya.

Informasi selengkapnya: [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

#### Rekomendasi

Tetapkan dan nonaktifkan semua fitur yang tidak dibutuhkan situs Anda atau izinkan hanya untuk domain yang sah:
> `Permissions-Policy: geolocation=(), camera=(), microphone=()`

- *CATATAN*: Contoh ini menonaktifkan geolokasi, kamera, dan mikrofon untuk semua domain.

### FLoC (Federated Learning of Cohorts)

FLoC adalah metode yang diusulkan oleh Google pada tahun 2021 untuk menayangkan iklan berbasis minat kepada sekelompok pengguna ("kohort"). [Electronic Frontier Foundation](https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea), [Mozilla](https://blog.mozilla.org/en/privacy-security/privacy-analysis-of-floc/), dan lainnya percaya bahwa FLoC tidak cukup melindungi privasi pengguna.

#### Rekomendasi

Sebuah situs dapat menyatakan bahwa ia tidak ingin disertakan dalam daftar situs pengguna untuk perhitungan kohort dengan mengirimkan header HTTP ini.
> Permissions-Policy: interest-cohort=()

### Server

Header `Server` menjelaskan perangkat lunak yang digunakan oleh server asal yang menangani permintaan — yaitu, server yang menghasilkan respons.

Ini bukan header keamanan, tetapi cara penggunaannya relevan untuk keamanan.

#### Rekomendasi

Hapus header ini atau tetapkan nilai yang tidak informatif.
> `Server: webserver`

- *CATATAN*: Ingatlah bahwa penyerang memiliki cara lain untuk membuat sidik jari pada teknologi server.

### X-Powered-By

Header `X-Powered-By` menjelaskan teknologi yang digunakan oleh webserver. Informasi ini mengekspos server ke penyerang. Dengan menggunakan informasi dalam header ini, penyerang dapat menemukan kerentanan dengan lebih mudah.

#### Rekomendasi

Hapus semua header `X-Powered-By`.

- *CATATAN*: Ingatlah bahwa penyerang memiliki cara lain untuk membuat sidik jari pada tumpukan teknologi Anda.

### X-AspNet-Version

Memberikan informasi tentang versi .NET.

#### Rekomendasi

Nonaktifkan pengiriman header ini. Tambahkan baris berikut di `web.config` Anda di bagian `<system.web>` untuk menghapusnya.

```xml
<httpRuntime enableVersionHeader="false" />
```

- *CATATAN*: Ingat bahwa penyerang memiliki cara lain untuk mendapatkan sidik jari pada tumpukan teknologi Anda.

### X-AspNetMvc-Version

Memberikan informasi tentang versi .NET.

#### Rekomendasi

Nonaktifkan pengiriman header ini. Untuk menghapus header `X-AspNetMvc-Version`, tambahkan baris di bawah ini di file `Global.asax`.

```lang-none
MvcHandler.DisableMvcResponseHeader = true; ```

- *CATATAN*: Ingatlah bahwa penyerang memiliki cara lain untuk mengambil sidik jari tumpukan teknologi Anda.

### X-DNS-Prefetch-Control

Header respons HTTP `X-DNS-Prefetch-Control` mengontrol prapengambilan DNS, sebuah fitur yang digunakan browser secara proaktif untuk melakukan resolusi nama domain pada tautan yang dapat dipilih pengguna untuk diikuti serta URL untuk item yang dirujuk oleh dokumen, termasuk gambar, CSS, JavaScript, dan sebagainya.

#### Rekomendasi

Perilaku default browser adalah melakukan caching DNS yang baik untuk sebagian besar situs web.

Jika Anda tidak mengontrol tautan di situs web Anda, Anda mungkin ingin menetapkan `off` sebagai nilai untuk menonaktifkan prapengambilan DNS guna menghindari kebocoran informasi ke domain tersebut.

> `X-DNS-Prefetch-Control: off`

- *CATATAN*: Jangan mengandalkan fungsionalitas ini untuk apa pun yang sensitif terhadap produksi: ini bukan standar atau tidak didukung sepenuhnya dan implementasinya dapat bervariasi di antara browser.

### Public-Key-Pins (HPKP)

Header respons HTTP `Public-Key-Pins` digunakan untuk mengaitkan kunci publik kriptografi tertentu dengan server web tertentu guna mengurangi risiko serangan MITM dengan sertifikat palsu.

#### Rekomendasi

Header ini sudah tidak digunakan lagi dan tidak boleh digunakan lagi.

## Menambahkan Header HTTP di Berbagai Teknologi

### PHP

Kode contoh di bawah ini menetapkan header `X-Frame-Options` di PHP.

```php
header("X-Frame-Options: DENY");
```

### Apache

Di bawah ini adalah contoh konfigurasi `.htaccess` yang menetapkan header `X-Frame-Options` di Apache. Perhatikan bahwa tanpa opsi `always`, header hanya akan dikirim untuk kode status tertentu, seperti yang dijelaskan dalam [dokumentasi Apache](https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header).

```lang-bsh
<IfModule mod_headers.c>
Header selalu menyetel X-Frame-Options "DENY"
</IfModule>
```

### IIS

Tambahkan konfigurasi di bawah ini ke `Web.config` Anda di IIS untuk mengirim header `X-Frame-Options`.

```xml
<system.webServer>
...
 <httpProtocol>
   <customHeaders>
     <add name="X-Frame-Options" value="DENY" />
   </customHeaders>
 </httpProtocol>
...
</system.webServer>
```

### HAProxy

Tambahkan baris di bawah ini ke konfigurasi front-end, listen, atau backend Anda untuk mengirim header `X-Frame-Options`.

```lang-none
http-response set-header X-Frame-Options DENY
```

### Nginx

Di bawah ini adalah contoh konfigurasi, yang menyetel header `X-Frame-Options` di Nginx. Perhatikan bahwa tanpa opsi `always`, header hanya akan dikirim untuk kode status tertentu, seperti yang dijelaskan dalam [dokumentasi nginx](https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header).

```lang-none
add_header "X-Frame-Options" "DENY" always; ```

### Express

Anda dapat menggunakan [helmet](https://www.npmjs.com/package/helmet) untuk menyiapkan header HTTP di Express. Kode di bawah ini adalah contoh untuk menambahkan header `X-Frame-Options`.

```javascript
const helmet = require('helmet');
const app = express();
// Sets "X-Frame-Options: SAMEORIGIN"
app.use(
 helmet.frameguard({
   action: "sameorigin",
 })
);
```

## Menguji Implementasi Header Keamanan yang Tepat

### Mozilla Observatory

[Mozilla Observatory](https://observatory.mozilla.org/) adalah alat daring yang membantu Anda memeriksa status header situs web Anda.

### SmartScanner

[SmartScanner](https://www.thesmartscanner.com/) memiliki [profil pengujian](https://www.thesmartscanner.com/docs/configuring-security-tests) khusus untuk menguji keamanan header HTTP.

Alat daring biasanya menguji beranda alamat yang diberikan. Namun, SmartScanner memindai seluruh situs web. Jadi, Anda dapat memastikan semua halaman web Anda memiliki Header HTTP yang tepat.

## Referensi

- [Mozilla: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [Mozilla: X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)
- [hstspreload.org](https://hstspreload.org/)
- [Mozilla: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [Mozilla: Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
- [Mozilla: Expect-CT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT)
- [Mozilla: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [content-security-policy.com](https://content-security-policy.com/)
- [Mozilla: Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
- [resourcepolicy.fyi](https://resourcepolicy.fyi/)
- [Mozilla: Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)
- [Mozilla: Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
- [Mozilla: Server Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server)
- [Linked OWASP project: Secure Headers Project](https://owasp.org/www-project-secure-headers/)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `