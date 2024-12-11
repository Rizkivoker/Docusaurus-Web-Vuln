---
sidebar_position: 2
---

# Pencegahan Cross Site Scripting

## Pengantar Pencegahan Cross Site Scripting 

Lembar contekan ini membantu pengembang mencegah kerentanan XSS.

Cross-Site Scripting (XSS) adalah istilah yang salah kaprah. Awalnya istilah ini berasal dari versi awal serangan yang terutama difokuskan pada pencurian data lintas situs. Sejak saat itu, istilah ini telah meluas hingga mencakup penyuntikan pada hampir semua konten. Serangan XSS serius dan dapat menyebabkan peniruan identitas akun, mengamati perilaku pengguna, memuat konten eksternal, mencuri data sensitif, dan banyak lagi.

**Lembar contekan ini berisi teknik untuk mencegah atau membatasi dampak XSS. Karena tidak ada satu teknik pun yang dapat mengatasi XSS, penggunaan kombinasi teknik pertahanan yang tepat akan diperlukan untuk mencegah XSS.**

## Keamanan Kerangka Kerja

Untungnya, aplikasi yang dibangun dengan kerangka kerja web modern memiliki lebih sedikit bug XSS, karena kerangka kerja ini mengarahkan pengembang ke praktik keamanan yang baik dan membantu mengurangi XSS dengan menggunakan templating, auto-escaping, dan banyak lagi. Namun, pengembang perlu mengetahui bahwa masalah dapat terjadi jika kerangka kerja digunakan secara tidak aman, seperti:

- _escape hatch_ yang digunakan kerangka kerja untuk memanipulasi DOM secara langsung
- `dangerouslySetInnerHTML` React tanpa membersihkan HTML
- React tidak dapat menangani URL `javascript:` atau `data:` tanpa validasi khusus
- Fungsi `bypassSecurityTrustAs*` Angular
- Fungsi `unsafeHTML` Lit
- Atribut `inner-h-t-m-l` Polymer dan fungsi `htmlLiteral`
- Injeksi templat
- Plugin atau komponen kerangka kerja yang kedaluwarsa
- dan banyak lagi

Saat Anda menggunakan kerangka kerja web modern, Anda perlu mengetahui bagaimana kerangka kerja Anda mencegah XSS dan di mana saja celahnya. Akan ada saat-saat di mana Anda perlu melakukan sesuatu di luar perlindungan yang disediakan oleh kerangka kerja Anda, yang berarti bahwa Pengodean Keluaran dan Pembersihan HTML dapat menjadi sangat penting. OWASP akan membuat lembar contekan khusus kerangka kerja untuk React, Vue, dan Angular.

## Filosofi Pertahanan XSS

Agar serangan XSS berhasil, penyerang harus dapat memasukkan dan mengeksekusi konten berbahaya di halaman web. Jadi, semua variabel dalam aplikasi web perlu dilindungi. Memastikan bahwa **semua variabel** melalui validasi dan kemudian di-escape atau disanitasi dikenal sebagai **ketahanan injeksi sempurna**. Variabel apa pun yang tidak melalui proses ini berpotensi menjadi kelemahan. Kerangka kerja memudahkan untuk memastikan variabel divalidasi dan di-escape atau disanitasi dengan benar.

Namun, tidak ada kerangka kerja yang sempurna dan celah keamanan masih ada dalam kerangka kerja populer seperti React dan Angular. Pengodean keluaran dan sanitasi HTML membantu mengatasi celah tersebut.

## Pengodean Keluaran

Saat Anda perlu menampilkan data dengan aman persis seperti yang diketik pengguna, pengodean keluaran direkomendasikan. Variabel tidak boleh diartikan sebagai kode, bukan teks. Bagian ini membahas setiap bentuk pengodean keluaran, tempat menggunakannya, dan kapan Anda tidak boleh menggunakan variabel dinamis sama sekali.

Pertama, saat Anda ingin menampilkan data sebagaimana pengguna mengetiknya, mulailah dengan perlindungan penyandian keluaran bawaan kerangka kerja Anda. Penyandian otomatis dan fungsi escape sudah terpasang di sebagian besar kerangka kerja.

Jika Anda tidak menggunakan kerangka kerja atau perlu menutupi celah dalam kerangka kerja, maka Anda harus menggunakan pustaka penyandian keluaran. Setiap variabel yang digunakan dalam antarmuka pengguna harus melewati fungsi penyandian keluaran. Daftar pustaka penyandian keluaran disertakan dalam lampiran.

Ada banyak metode penyandian keluaran yang berbeda karena browser mengurai HTML, JS, URL, dan CSS secara berbeda. Menggunakan metode penyandian yang salah dapat menimbulkan kelemahan atau merusak fungsionalitas aplikasi Anda.

### Penyandian Keluaran untuk “Konteks HTML”

“Konteks HTML” mengacu pada penyisipan variabel di antara dua tag HTML dasar seperti `<div>` atau `<b>`. Misalnya:

```HTML
<div> $varUnsafe </div>
```

Seorang penyerang dapat mengubah data yang ditampilkan sebagai `$varUnsafe`. Hal ini dapat menyebabkan serangan ditambahkan ke halaman web. Misalnya:

```HTML
<div> <script>alert`1`</script> </div> // Example Attack
```

Untuk menambahkan variabel ke konteks HTML dengan aman ke templat web, gunakan penyandian entitas HTML untuk variabel tersebut.

Berikut ini beberapa contoh nilai yang disandikan untuk karakter tertentu:

Jika Anda menggunakan JavaScript untuk menulis ke HTML, lihat atribut `.textContent`. Ini adalah **Safe Sink** dan akan secara otomatis melakukan Pengodean Entitas HTML.

```HTML
& &amp;
< &lt;
> &gt; " &quot;
' &#x27;
```

### Pengodean Keluaran untuk “Konteks Atribut HTML”

“Konteks Atribut HTML” terjadi saat variabel ditempatkan dalam nilai atribut HTML. Anda mungkin ingin melakukan ini untuk mengubah hyperlink, menyembunyikan elemen, menambahkan teks alt untuk gambar, atau mengubah gaya CSS sebaris. Anda harus menerapkan pengodean atribut HTML ke variabel yang ditempatkan di sebagian besar atribut HTML. Daftar atribut HTML yang aman disediakan di bagian **Safe Sinks**.

```HTML
<div attr="$varUnsafe">
<div attr=”*x” onblur=”alert(1)*”> // Contoh Serangan
```

**Sangat penting untuk menggunakan tanda kutip seperti `"` atau `'` untuk mengapit variabel Anda.** Mengutip membuat sulit untuk mengubah konteks tempat variabel beroperasi, yang membantu mencegah XSS. Mengutip juga secara signifikan mengurangi set karakter yang perlu Anda enkode, membuat aplikasi Anda lebih andal dan pengodean lebih mudah diimplementasikan.

Jika Anda menulis ke Atribut HTML dengan JavaScript, lihat metode `.setAttribute` dan `[attribute]` karena keduanya akan secara otomatis mengodekan Atribut HTML. Itu adalah **Safe Sink** selama nama atribut dikodekan secara permanen dan tidak berbahaya, seperti `id` atau `class`. Umumnya, atribut yang menerima JavaScript, seperti `onClick`, **TIDAK aman** untuk digunakan dengan nilai atribut yang tidak tepercaya.

### Pengodean Keluaran untuk “Konteks JavaScript”

“Konteks JavaScript” mengacu pada situasi saat variabel ditempatkan ke dalam JavaScript sebaris lalu disematkan dalam dokumen HTML. Situasi ini umumnya terjadi dalam program yang banyak menggunakan JavaScript khusus yang disematkan di halaman web mereka.

Namun, satu-satunya lokasi ‘aman’ untuk menempatkan variabel dalam JavaScript adalah di dalam “nilai data yang dikutip”. Semua konteks lainnya tidak aman dan Anda tidak boleh menempatkan data variabel di dalamnya.

Contoh “Nilai Data yang Dikutip”

```HTML
<script>alert('$varUnsafe’)</script>
<script>x=’$varUnsafe’</script>
<div onmouseover="'$varUnsafe'"</div>
```

Encode semua karakter menggunakan format `\xHH`. Pustaka encode sering kali memiliki `EncodeForJavaScript` atau yang serupa untuk mendukung fungsi ini.

Harap lihat [Contoh encode JavaScript OWASP Java Encoder](https://owasp.org/www-project-java-encoder/) untuk contoh penggunaan JavaScript yang tepat yang memerlukan encode minimal.

Untuk JSON, verifikasi bahwa header `Content-Type` adalah `application/json` dan bukan `text/html` untuk mencegah XSS.

### Encode Keluaran untuk “Konteks CSS”

“Konteks CSS” merujuk pada variabel yang ditempatkan ke dalam CSS sebaris, yang umum terjadi saat pengembang ingin penggunanya menyesuaikan tampilan dan nuansa halaman web mereka. Karena CSS sangat hebat, ia telah digunakan untuk banyak jenis serangan. **Variabel hanya boleh ditempatkan dalam nilai properti CSS. "Konteks CSS" lainnya tidak aman dan Anda tidak boleh menempatkan data variabel di dalamnya.**

```HTML
<style> selector { property : $varUnsafe; } </style>
<style> selector { property : "$varUnsafe"; } </style>
<span style="property : $varUnsafe">Oh tidak</span>
```

Jika Anda menggunakan JavaScript untuk mengubah properti CSS, pertimbangkan untuk menggunakan
`style.property = x`.
Ini adalah **Safe Sink** dan akan secara otomatis mengodekan data CSS di dalamnya.

Saat memasukkan variabel ke dalam properti CSS, pastikan data dikodekan dan disanitasi dengan benar untuk mencegah serangan injeksi. Hindari menempatkan variabel langsung ke dalam selector atau konteks CSS lainnya.

### Pengodean Output untuk "Konteks URL"

"Konteks URL" merujuk pada variabel yang ditempatkan ke dalam URL. Umumnya, pengembang akan menambahkan parameter atau fragmen URL ke basis URL yang kemudian ditampilkan atau digunakan dalam beberapa operasi. Gunakan Pengodean URL untuk skenario ini.

```HTML
<a href="http://www.owasp.org?test=$varUnsafe">tautan</a >
```

Kodekan semua karakter dengan format pengodean `%HH`. Pastikan semua atribut dikutip sepenuhnya, sama seperti JS dan CSS.

#### Kesalahan Umum

Akan ada situasi saat Anda menggunakan URL dalam konteks yang berbeda. Yang paling umum adalah menambahkannya ke atribut `href` atau `src` dari tag `<a>`. Dalam skenario ini, Anda harus melakukan pengodean URL, diikuti dengan pengodean atribut HTML.

```HTML
url = "https://site.com?data=" + urlencode(parameter)
<a href='attributeEncode(url)'>tautan</a>
```

Jika Anda menggunakan JavaScript untuk membuat Nilai Kueri URL, pertimbangkan untuk menggunakan `window.encodeURIComponent(x)`. Ini adalah **Safe Sink** dan akan secara otomatis mengodekan URL data di dalamnya.

### Konteks Berbahaya

Pengodean keluaran tidaklah sempurna. Pengodean ini tidak akan selalu mencegah XSS. Lokasi ini dikenal sebagai **konteks berbahaya**. Konteks berbahaya meliputi:

```HTML
<script>Directly in a script</script>
<!-- Inside an HTML comment -->
<style>Directly in CSS</style>
<div ToDefineAnAttribute=test />
<ToDefineATag href="/test" />
```

Area lain yang perlu diperhatikan meliputi:

- Fungsi panggilan balik
- Semua pengendali peristiwa JavaScript (`onclick()`, `onerror()`, `onmouseover()`).

- Fungsi JS yang tidak aman seperti `eval()`, `setInterval()`, `setTimeout()`

Jangan tempatkan variabel ke dalam konteks yang berbahaya karena meskipun dengan penyandian keluaran, hal itu tidak akan sepenuhnya mencegah serangan XSS.

## Sanitasi HTML

Saat pengguna perlu menulis HTML, pengembang dapat mengizinkan pengguna mengubah gaya atau struktur konten di dalam editor WYSIWYG. Penyandian keluaran dalam kasus ini akan mencegah XSS, tetapi akan merusak fungsionalitas aplikasi yang dimaksudkan. Gaya tersebut tidak akan ditampilkan. Dalam kasus ini, Sanitasi HTML harus digunakan.

Sanitasi HTML akan menghapus HTML yang berbahaya dari variabel dan mengembalikan string HTML yang aman. OWASP merekomendasikan [DOMPurify](https://github.com/cure53/DOMPurify) untuk Sanitasi HTML.

```js
let clean = DOMPurify.sanitize(dirty);
```

Ada beberapa hal lebih lanjut yang perlu dipertimbangkan:

- Jika Anda membersihkan konten lalu memodifikasinya setelahnya, Anda dapat dengan mudah membatalkan upaya keamanan Anda.
- Jika Anda membersihkan konten lalu mengirimkannya ke pustaka untuk digunakan, periksa apakah pustaka tersebut tidak mengubah string tersebut. Jika tidak, sekali lagi, upaya keamanan Anda batal.
- Anda harus secara teratur menambal DOMPurify atau pustaka Sanitasi HTML lain yang Anda gunakan. Peramban mengubah fungsionalitas dan bypass ditemukan secara teratur.

## Tempat Pembuangan yang Aman

Para profesional keamanan sering berbicara dalam istilah sumber dan tempat pembuangan. Jika Anda mencemari sungai, air akan mengalir ke hilir di suatu tempat. Sama halnya dengan keamanan komputer. Tempat pembuangan XSS adalah tempat variabel ditempatkan di halaman web Anda.

Untungnya, banyak tempat pembuangan tempat variabel dapat ditempatkan aman. Ini karena tempat pembuangan ini memperlakukan variabel sebagai teks dan tidak akan pernah mengeksekusinya. Cobalah untuk memfaktorkan ulang kode Anda untuk menghapus referensi ke sink yang tidak aman seperti innerHTML, dan sebagai gantinya gunakan textContent atau value.

```js
elem.textContent = dangerVariable;
elem.insertAdjacentText(dangerVariable);
elem.className = dangerVariable;
elem.setAttribute(safeName, dangerVariable);
formfield.value = dangerVariable;
document.createTextNode(dangerVariable);
document.createElement(dangerVariable);
elem.innerHTML = DOMPurify.sanitize(dangerVar);
```

**Atribut HTML yang Aman meliputi:** `align`, `alink`, `alt`, `bgcolor`, `border`, `cellpadding`, `cellspacing`, `class`, `color`, `cols`, `colspan`, `coords`, `dir`, `face`, `height`, `hspace`, `ismap`, `lang`, `marginheight`, `marginwidth`, `multiple`, `nohref`, `noresize`, `noshade`, `nowrap`, `ref`, `rel`, `rev`, `rows`, `rowspan`, `scrolling`, `shape`, `span`, `summary`, `tabindex`, `title`, `usemap`, `valign`, `value`, `vlink`, `vspace`, `width`.

Untuk atribut yang tidak dilaporkan di atas, pastikan bahwa jika kode JavaScript diberikan sebagai nilai, kode tersebut tidak dapat dijalankan.

## Kontrol Lainnya

Perlindungan Keamanan Kerangka Kerja, Pengodean Keluaran, dan Sanitasi HTML akan memberikan perlindungan terbaik untuk aplikasi Anda. OWASP merekomendasikan hal ini dalam semua situasi.

Pertimbangkan untuk mengadopsi kontrol berikut sebagai tambahan dari yang di atas.

- Atribut Cookie - Ini mengubah cara JavaScript dan browser dapat berinteraksi dengan cookie. Atribut cookie mencoba membatasi dampak serangan XSS tetapi tidak mencegah eksekusi konten berbahaya atau mengatasi akar penyebab kerentanan.
- Kebijakan Keamanan Konten - Daftar putih yang mencegah konten dimuat. Mudah untuk membuat kesalahan dengan implementasi sehingga tidak boleh menjadi mekanisme pertahanan utama Anda. Gunakan CSP sebagai lapisan pertahanan tambahan dan lihat [cheatsheet di sini](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).
- Web Application Firewall - Ini mencari rangkaian serangan yang diketahui dan memblokirnya. WAF tidak dapat diandalkan dan teknik bypass baru ditemukan secara berkala. WAF juga tidak mengatasi akar penyebab kerentanan XSS. Selain itu, WAF juga tidak memiliki kelas kerentanan XSS yang beroperasi secara eksklusif di sisi klien. WAF tidak direkomendasikan untuk mencegah XSS, terutama XSS Berbasis DOM.

### Ringkasan Aturan Pencegahan XSS

Cuplikan HTML ini menunjukkan cara merender data yang tidak tepercaya dengan aman dalam berbagai konteks yang berbeda.

Tipe Data: String
Konteks: Isi HTML
Kode: `<span>DATA YANG TIDAK DIPERCAYA </span>`
Contoh Pertahanan: Pengodean Entitas HTML (aturan \#1)

Tipe Data: Kuat
Konteks: Atribut HTML yang Aman
Kode: `<input type="text" name="fname" value="DATA YANG TIDAK DIPERCAYA ">`
Contoh Pertahanan: Pengodean Entitas HTML yang Agresif (aturan \#2), Hanya tempatkan data yang tidak dipercaya ke dalam daftar atribut yang aman (tercantum di bawah), Validasi secara ketat atribut yang tidak aman seperti latar belakang, ID, dan nama.

Tipe Data: String
Konteks: Parameter GET
Kode: `<a href="/site/search?value=DATA YANG TIDAK DIPERCAYA ">clickme</a>`
Contoh Pertahanan: Pengodean URL (aturan \#5).

Tipe Data: String
Konteks: URL tidak tepercaya dalam atribut SRC atau HREF
Kode: `<a href="URL TIDAK TERPERCAYA ">clickme</a> <iframe src="URL TIDAK TERPERCAYA " />`
Contoh Pertahanan: Kanonikalisasi input, Validasi URL, Verifikasi URL yang aman, Hanya URL http dan HTTPS yang diizinkan (Hindari Protokol JavaScript untuk Membuka Jendela baru), Pengode atribut.

Tipe Data: String
Konteks: Nilai CSS
Kode: `HTML <div style="width: DATA TIDAK TERPERCAYA ;">Pilihan</div>`
Contoh Pertahanan: Validasi struktural yang ketat (aturan \#4), Pengodean heksadesimal CSS, Desain fitur CSS yang baik.

Tipe Data: String
Konteks: Variabel JavaScript
Kode: `<script>var currentValue='UNTRUSTED DATA ';</script> <script>someFunction('UNTRUSTED DATA ');</script>`
Contoh Pertahanan: Pastikan variabel JavaScript dikutip, penyandian heksadesimal JavaScript, penyandian Unicode JavaScript, hindari penyandian garis miring terbalik (`\"` atau `\'` atau `\\`).

Tipe Data: HTML
Konteks: Isi HTML
Kode: `<div>HTML YANG TIDAK TERPERCAYA</div>`
Contoh Pertahanan: Validasi HTML (JSoup, AntiSamy, HTML Sanitizer...).

Tipe Data: String
Konteks: DOM XSS
Kode: `<script>document.write("UNTRUSTED INPUT: " + document.location.hash );<script/>`
Contoh Pertahanan: **Lembar Contekan Pencegahan XSS berbasis DOM** |

### Ringkasan Aturan Penyandian Keluaran

Tujuan dari penyandian keluaran (sebagaimana yang terkait dengan Cross Site Scripting) adalah untuk mengubah masukan yang tidak tepercaya menjadi bentuk yang aman di mana masukan tersebut ditampilkan sebagai **data** kepada pengguna tanpa dijalankan sebagai **kode** di browser. Bagan berikut menyediakan daftar metode penyandian keluaran penting yang diperlukan untuk menghentikan Cross Site Scripting. Jenis Pengodean: Entitas HTML
Mekanisme Pengodean: Ubah `&` menjadi `&amp;`, Ubah `<` menjadi `&lt;`, Ubah `>` menjadi `&gt;`, Ubah `"` menjadi `&quot;`, Ubah `'` menjadi `&#x27`

Jenis Pengodean: Pengodean Atribut HTML
Mekanisme Pengodean: Kodekan semua karakter dengan format Entitas HTML `&#xHH;`, termasuk spasi, di mana **HH** mewakili nilai heksadesimal karakter dalam Unicode. Misalnya, `A` menjadi `&#x41`. Semua karakter alfanumerik (huruf A hingga Z, a hingga z, dan angka 0 hingga 9) tetap tidak dikodekan.

Jenis Pengodean: Pengodean URL
Mekanisme Pengodean: Gunakan pengodean persen standar, seperti yang ditentukan dalam [W3C spesifikasi](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1), untuk mengodekan nilai parameter. Berhati-hatilah dan hanya mengodekan nilai parameter, bukan seluruh URL atau fragmen jalur URL.

Jenis Pengodean: Pengodean JavaScript
Mekanisme Pengodean: Mengodekan semua karakter menggunakan format pengodean Unicode `\uXXXX`, di mana **XXXX** mewakili titik kode Unicode heksadesimal. Misalnya, `A` menjadi `\u0041`. Semua karakter alfanumerik (huruf A hingga Z, a hingga z, dan angka 0 hingga 9) tetap tidak dikodekan.

Jenis Pengodean: Pengodean Heksadesimal CSS
Mekanisme Pengodean: Pengodean CSS mendukung format `\XX` dan `\XXXXXX`. Untuk memastikan penyandian yang tepat, pertimbangkan opsi berikut: (a) Tambahkan spasi setelah penyandian CSS (yang akan diabaikan oleh parser CSS), atau (b) gunakan format penyandian CSS enam karakter penuh dengan menambahkan nilai nol. Misalnya, `A` menjadi `\41` (format pendek) atau `\000041` (format penuh). Karakter alfanumerik (huruf A hingga Z, a hingga z, dan angka 0 hingga 9) tetap tidak dikodekan.

## Antipola Umum: Pendekatan yang Tidak Efektif untuk Dihindari

Bertahan melawan XSS itu sulit. Karena alasan itu, beberapa orang mencari jalan pintas untuk mencegah XSS.

Kita akan memeriksa dua [antipola](https://en.wikipedia.org/wiki/Anti-pattern) umum yang sering muncul di postingan lama, tetapi masih sering dikutip sebagai solusi di postingan modern tentang pertahanan XSS di forum programmer seperti Stack Overflow dan tempat nongkrong developer lainnya.

### Hanya Bergantung pada Header Kebijakan Keamanan Konten (CSP)

Pertama-tama, mari kita perjelas, kami adalah pendukung kuat CSP jika digunakan dengan benar. Dalam konteks pertahanan XSS, CSP bekerja paling baik jika:

- Digunakan sebagai teknik pertahanan mendalam.
- Disesuaikan untuk setiap aplikasi individual, bukan diterapkan sebagai solusi perusahaan yang cocok untuk semua orang.

Yang kami lawan adalah kebijakan CSP menyeluruh untuk seluruh perusahaan. Masalah dengan pendekatan tersebut adalah:

#### Masalah 1 - Asumsi Versi Peramban Mendukung CSP Secara Merata

Biasanya ada asumsi implisit bahwa semua browser pelanggan mendukung semua konstruksi CSP yang digunakan oleh kebijakan CSP menyeluruh Anda. Lebih jauh, asumsi ini sering dilakukan tanpa menguji secara eksplisit header permintaan `User-Agent` untuk melihat apakah memang itu jenis browser yang didukung dan menolak penggunaan situs jika tidak. Mengapa? Karena sebagian besar bisnis tidak ingin menolak pelanggan jika mereka menggunakan browser lama yang tidak mendukung beberapa konstruksi CSP Level 2 atau Level 3 yang mereka andalkan untuk pencegahan XSS. (Secara statistik, hampir semua browser mendukung arahan CSP Level 1, jadi kecuali Anda khawatir Kakek akan mengeluarkan laptop Windows 98 lamanya dan menggunakan beberapa versi Internet Explorer lama untuk mengakses situs Anda, dukungan CSP Level 1 mungkin dapat diasumsikan.)

#### Masalah 2 - Masalah yang Mendukung Aplikasi Lama

Header respons CSP universal wajib di seluruh perusahaan pasti akan merusak beberapa aplikasi web, terutama yang lama. Hal ini menyebabkan bisnis menolak pedoman AppSec dan mau tidak mau mengakibatkan AppSec mengeluarkan keringanan dan/atau pengecualian keamanan hingga kode aplikasi dapat ditambal. Namun pengecualian keamanan ini memungkinkan celah pada pelindung XSS Anda, dan meskipun celah tersebut bersifat sementara, hal itu tetap dapat memengaruhi bisnis Anda, setidaknya berdasarkan reputasi.

### Ketergantungan pada HTTP Interceptor

Anti-pola umum lainnya yang kami amati adalah upaya untuk menangani validasi dan/atau penyandian keluaran dalam beberapa jenis interseptor seperti Spring Interceptor yang umumnya mengimplementasikan `org.springframework.web.servlet.HandlerInterceptor` atau sebagai penyaring servlet JavaEE yang mengimplementasikan `javax.servlet.Filter`. Meskipun hal ini dapat berhasil untuk aplikasi yang sangat spesifik (misalnya, jika Anda memvalidasi bahwa semua permintaan masukan yang pernah dirender hanyalah data alfanumerik), hal ini melanggar prinsip utama pertahanan XSS di mana melakukan penyandian keluaran sedekat mungkin dengan tempat data dirender adalah mungkin. Umumnya, permintaan HTTP diperiksa untuk parameter kueri dan POST, tetapi hal-hal lain seperti header permintaan HTTP yang mungkin ditampilkan seperti data kuki, tidak diperiksa. Pendekatan umum yang pernah kami lihat adalah seseorang akan memanggil `ESAPI.validator().getValidSafeHTML()` atau `ESAPI.encoder.canonicalize()` dan bergantung pada hasilnya akan dialihkan ke halaman kesalahan atau memanggil sesuatu seperti `ESAPI.encoder().encodeForHTML()`. Selain fakta bahwa pendekatan ini sering kali melewatkan masukan yang tercemar seperti header permintaan atau "informasi jalur tambahan" dalam URI, pendekatan ini sama sekali mengabaikan fakta bahwa pengodean keluaran sama sekali tidak kontekstual. Misalnya, bagaimana filter servlet mengetahui bahwa parameter kueri masukan akan ditampilkan dalam konteks HTML (yaitu, di antara tag HTML) daripada dalam konteks JavaScript seperti dalam tag `<script>` atau digunakan dengan atribut pengendali peristiwa JavaScript? Tidak. Dan karena penyandian JavaScript dan HTML tidak dapat dipertukarkan, Anda tetap rentan terhadap serangan XSS.

Kecuali jika filter atau pencegat Anda memiliki pengetahuan penuh tentang aplikasi Anda dan khususnya kesadaran tentang bagaimana aplikasi Anda menggunakan setiap parameter untuk permintaan tertentu, maka aplikasi tersebut tidak akan berhasil untuk semua kasus ekstrem yang mungkin terjadi. Dan kami berpendapat bahwa aplikasi tersebut tidak akan pernah dapat menggunakan pendekatan ini karena menyediakan konteks tambahan yang diperlukan merupakan desain yang terlalu rumit dan secara tidak sengaja memperkenalkan beberapa kerentanan lain (mungkin yang dampaknya jauh lebih buruk daripada XSS) hampir tidak dapat dihindari jika Anda mencobanya.

Pendekatan naif ini biasanya memiliki setidaknya satu dari empat masalah ini.

#### Masalah 1 - Penyandian untuk konteks tertentu tidak memuaskan untuk semua jalur URI

Salah satu masalahnya adalah penyandian yang tidak tepat yang masih dapat memungkinkan XSS yang dapat dieksploitasi di beberapa jalur URI aplikasi Anda. Contohnya mungkin parameter formulir 'nama belakang' dari POST yang biasanya ditampilkan di antara tag HTML sehingga penyandian HTML sudah memadai, tetapi mungkin ada satu atau dua kasus khusus di mana nama belakang sebenarnya ditampilkan sebagai bagian dari blok JavaScript yang penyandian HTML-nya tidak memadai dan karenanya rentan terhadap serangan XSS.

#### Masalah 2 - Pendekatan pencegat dapat menyebabkan tampilan rusak yang disebabkan oleh penyandian yang tidak tepat atau ganda

Masalah kedua dengan pendekatan ini adalah aplikasi dapat menghasilkan penyandian yang salah atau ganda. Misalnya, anggaplah dalam contoh sebelumnya, pengembang telah melakukan penyandian keluaran yang tepat untuk perenderan JavaScript nama belakang. Namun jika sudah dikodekan keluaran HTML juga, saat dirender, nama belakang yang sah seperti "O'Hara" mungkin akan keluar seperti "O\'Hara".

Meskipun kasus kedua ini bukan sepenuhnya masalah keamanan, jika cukup sering terjadi, hal itu dapat mengakibatkan penolakan bisnis terhadap penggunaan filter dan dengan demikian bisnis dapat memutuskan untuk menonaktifkan filter atau cara untuk menentukan pengecualian untuk halaman atau parameter tertentu yang difilter, yang pada gilirannya akan melemahkan pertahanan XSS yang disediakannya.

#### Masalah 3 - Interceptor tidak efektif terhadap XSS berbasis DOM

Masalah ketiga dengan ini adalah bahwa hal itu tidak efektif terhadap XSS berbasis DOM. Untuk melakukannya, seseorang harus meminta interseptor atau filter memindai semua konten JavaScript yang masuk sebagai bagian dari respons HTTP, mencoba mencari tahu keluaran yang tercemar, dan melihat apakah rentan terhadap XSS berbasis DOM. Itu sama sekali tidak praktis.

#### Masalah 4 - Interseptor tidak efektif jika data dari respons berasal dari luar aplikasi Anda

Masalah terakhir dengan interseptor adalah bahwa mereka umumnya tidak menyadari data dalam respons aplikasi Anda yang berasal dari sumber internal lain seperti layanan web berbasis REST internal atau bahkan basis data internal. Masalahnya adalah bahwa kecuali aplikasi Anda benar-benar memvalidasi data tersebut _pada titik pengambilannya_ (yang umumnya merupakan satu-satunya titik aplikasi Anda memiliki cukup konteks untuk melakukan validasi data yang ketat menggunakan pendekatan daftar yang diizinkan), data tersebut harus selalu dianggap tercemar. Namun, jika Anda mencoba melakukan penyandian keluaran atau validasi data ketat semua data yang tercemar pada sisi respons HTTP dari suatu penyadap (seperti penyaring servlet Java), pada saat itu, penyadap aplikasi Anda tidak akan tahu ada data tercemar yang ada dari layanan web REST atau basis data lain yang Anda gunakan. Pendekatan yang umumnya digunakan pada penyadap sisi respons yang mencoba menyediakan pertahanan XSS adalah hanya menganggap "parameter masukan" yang cocok sebagai tercemar dan melakukan penyandian keluaran atau sanitasi HTML pada parameter tersebut dan semua hal lainnya dianggap aman. Namun, terkadang tidak demikian? Meskipun sering diasumsikan bahwa semua layanan web internal dan semua basis data internal dapat "dipercaya" dan digunakan sebagaimana mestinya, ini adalah asumsi yang sangat buruk untuk dibuat kecuali Anda telah memasukkannya dalam beberapa pemodelan ancaman mendalam untuk aplikasi Anda.

Misalnya, anggaplah Anda sedang mengerjakan aplikasi untuk menunjukkan kepada pelanggan tagihan bulanan terperinci mereka. Mari kita asumsikan bahwa aplikasi Anda sedang meminta data internal asing (bukan bagian dari aplikasi spesifik Anda) atau layanan web REST yang digunakan aplikasi Anda untuk mendapatkan nama lengkap, alamat, dll. pengguna. Namun, data tersebut berasal dari aplikasi lain yang Anda asumsikan "tepercaya" tetapi sebenarnya memiliki kerentanan XSS persisten yang tidak dilaporkan pada berbagai bidang terkait alamat pelanggan. Lebih jauh, mari kita asumsikan bahwa staf dukungan pelanggan perusahaan Anda dapat memeriksa tagihan terperinci pelanggan untuk membantu mereka saat pelanggan memiliki pertanyaan tentang tagihan mereka. Jadi, pelanggan yang jahat memutuskan untuk memasang bom XSS di bidang alamat dan kemudian menghubungi layanan pelanggan untuk meminta bantuan terkait tagihan. Jika skenario seperti itu terjadi, pencegat yang mencoba mencegah XSS akan melewatkannya sepenuhnya dan hasilnya akan menjadi sesuatu yang jauh lebih buruk daripada sekadar memunculkan kotak peringatan untuk menampilkan "1" atau "XSS" atau "pwn'd".

### Ringkasan

Catatan akhir: Jika penerapan interseptor/filter sebagai pertahanan XSS merupakan pendekatan yang berguna terhadap serangan XSS, tidakkah Anda berpikir bahwa pendekatan tersebut akan dimasukkan ke dalam semua Web Application Firewall (WAF) komersial dan menjadi pendekatan yang direkomendasikan OWASP dalam lembar contekan ini?

## Artikel Terkait

**Lembar Contekan Serangan XSS:**

Artikel berikut menjelaskan bagaimana penyerang dapat mengeksploitasi berbagai jenis kerentanan XSS (dan artikel ini dibuat untuk membantu Anda menghindarinya):

- OWASP: [Lembar Contekan Penghindaran Filter XSS](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html).

**Deskripsi Kerentanan XSS:**

- Artikel OWASP tentang Kerentanan [XSS](https://owasp.org/www-community/attacks/xss/).

**Diskusi tentang Jenis Kerentanan XSS:**

- [Jenis Cross-Site Scripting](https://owasp.org/www-community/Types_of_Cross-Site_Scripting).

**Cara Meninjau Kode untuk Kerentanan Cross-Site Scripting:**

- [Panduan Peninjauan Kode OWASP](https://owasp.org/www-project-code-review-guide/) artikel tentang [Meninjau Kode untuk Kerentanan Cross-site scripting](https://wiki.owasp.org/index.php/Reviewing_Code_for_Cross-site_scripting).

**Cara Menguji Kerentanan Cross-Site Scripting:**

- [Panduan Pengujian OWASP](https://owasp.org/www-project-web-security-testing-guide/) artikel tentang pengujian untuk kerentanan Cross-Site Scripting. - [Aturan Pengodean Minimal Eksperimental XSS](https://wiki.owasp.org/index.php/XSS_Experimental_Minimal_Encoding_Rules)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `