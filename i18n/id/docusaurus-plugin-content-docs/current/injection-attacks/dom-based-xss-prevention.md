---
sidebar_position: 1
---

# Pencegahan DOM based XSS

## Pengantar Pencegahan DOM based XSS

Saat melihat XSS (Cross-Site Scripting), ada tiga bentuk [XSS](https://owasp.org/www-community/attacks/xss/) yang dikenal secara umum:

- [Reflected atau Stored](https://owasp.org/www-community/attacks/xss/#stored-and-reflected-xss-attacks)
- [DOM Based XSS](https://owasp.org/www-community/attacks/DOM_Based_XSS).

**XSS Prevention Cheatsheet** membahas XSS yang Dipantulkan dan Disimpan dengan sangat baik. Cheatsheet ini membahas XSS berbasis DOM (Document Object Model) dan merupakan perluasan (dan mengasumsikan pemahaman) dari **XSS Prevention Cheatsheet**.

Untuk memahami XSS berbasis DOM, seseorang perlu melihat perbedaan mendasar antara XSS yang Dipantulkan dan Disimpan jika dibandingkan dengan XSS berbasis DOM. Perbedaan utamanya adalah di mana serangan disuntikkan ke dalam aplikasi.

Reflected dan Stored XSS adalah masalah injeksi sisi server sementara XSS berbasis DOM adalah masalah injeksi sisi klien (browser).

Semua kode ini berasal dari server, yang berarti merupakan tanggung jawab pemilik aplikasi untuk membuatnya aman dari XSS, terlepas dari jenis kelemahan XSS-nya. Selain itu, serangan XSS selalu **dieksekusi** di browser.

Perbedaan antara Reflected/Stored XSS adalah di mana serangan ditambahkan atau disuntikkan ke dalam aplikasi. Dengan Reflected/Stored, serangan disuntikkan ke dalam aplikasi selama pemrosesan permintaan sisi server di mana input yang tidak tepercaya ditambahkan secara dinamis ke HTML. Untuk DOM XSS, serangan disuntikkan ke dalam aplikasi selama runtime di klien secara langsung.

Saat browser merender HTML dan konten terkait lainnya seperti CSS atau JavaScript, browser mengidentifikasi berbagai konteks rendering untuk berbagai jenis input dan mengikuti aturan yang berbeda untuk setiap konteks. Konteks rendering dikaitkan dengan penguraian tag HTML dan atributnya.

- Parser HTML dari konteks rendering menentukan bagaimana data disajikan dan ditata pada halaman dan selanjutnya dapat dipecah menjadi konteks standar HTML, atribut HTML, URL, dan CSS.

- Parser JavaScript atau VBScript dari konteks eksekusi dikaitkan dengan penguraian dan eksekusi kode skrip. Setiap parser memiliki semantik yang berbeda dan terpisah dalam cara mereka mengeksekusi kode skrip yang membuat pembuatan aturan yang konsisten untuk mengurangi kerentanan dalam berbagai konteks menjadi sulit. Komplikasi ini diperparah oleh perbedaan makna dan perlakuan terhadap nilai yang dikodekan dalam setiap subkonteks (HTML, atribut HTML, URL, dan CSS) dalam konteks eksekusi.

Untuk tujuan artikel ini, kami merujuk pada konteks HTML, atribut HTML, URL, dan CSS sebagai subkonteks karena masing-masing konteks ini dapat dijangkau dan ditetapkan dalam konteks eksekusi JavaScript.

Dalam kode JavaScript, konteks utamanya adalah JavaScript tetapi dengan tag dan karakter penutup konteks yang tepat, penyerang dapat mencoba menyerang 4 konteks lainnya menggunakan metode DOM JavaScript yang setara.

Berikut ini adalah contoh kerentanan yang terjadi dalam konteks JavaScript dan subkonteks HTML:

```html
 <script>
 var x = '<%= taintedVar %>';
 var d = document.createElement('div');
 d.innerHTML = x;
 document.body.appendChild(d);
 </script>
```

Mari kita lihat masing-masing subkonteks dari konteks eksekusi secara bergantian.

## ATURAN \#1 - Escape HTML lalu Escape JavaScript Sebelum Memasukkan Data yang Tidak Dipercaya ke dalam Subkonteks HTML dalam Konteks Eksekusi

Ada beberapa metode dan atribut yang dapat digunakan untuk langsung merender konten HTML dalam JavaScript. Metode-metode ini merupakan Subkonteks HTML dalam Konteks Eksekusi. Jika metode-metode ini diberikan dengan input yang tidak tepercaya, maka kerentanan XSS dapat terjadi. Misalnya:

### Contoh Metode HTML Berbahaya

#### Atribut

```javascript
element.innerHTML = "<HTML> Tag dan markup";
element.outerHTML = "<HTML> Tag dan markup";
```

#### Metode

```javascript
document.write("<HTML> Tag dan markup");
document.writeln("<HTML> Tag dan markup"); ```

### Panduan

Untuk melakukan pembaruan dinamis pada HTML di DOM yang aman, kami sarankan:

1. Pengodean HTML, lalu

2. Pengodean JavaScript untuk semua masukan yang tidak tepercaya, seperti yang ditunjukkan dalam contoh berikut:

```javascript
var ESAPI = require('node-esapi');
element.innerHTML = "<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>";
element.outerHTML = "<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>";
```

```javascript
var ESAPI = require('node-esapi'); document.write("<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>");

document.writeln("<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>");

```

## ATURAN \#2 - Escape JavaScript Sebelum Memasukkan Data yang Tidak Dipercaya ke Subkonteks Atribut HTML dalam Konteks Eksekusi

*Subkonteks* atribut HTML dalam konteks *eksekusi* berbeda dari aturan penyandian standar. Ini karena aturan untuk penyandian atribut HTML dalam konteks rendering atribut HTML diperlukan untuk mengurangi serangan yang mencoba keluar dari atribut HTML atau mencoba menambahkan atribut tambahan yang dapat menyebabkan XSS.

Bila Anda berada dalam konteks eksekusi DOM, Anda hanya perlu mengodekan JavaScript pada atribut HTML yang tidak mengeksekusi kode (atribut selain event handler, CSS, dan atribut URL).

Misalnya, aturan umumnya adalah mengodekan Atribut HTML pada data yang tidak tepercaya (data dari basis data, permintaan HTTP, pengguna, sistem back-end, dll.) yang ditempatkan dalam Atribut HTML. Ini adalah langkah yang tepat untuk diambil saat mengeluarkan data dalam konteks rendering, namun menggunakan pengodean Atribut HTML dalam konteks eksekusi akan merusak tampilan data aplikasi.

### Contoh AMAN tetapi RUSAK

```javascript
 var ESAPI = require('node-esapi');
 var x = document.createElement("input");
 x.setAttribute("name", "company_name");
 // In the following line of code, companyName represents untrusted user input
 // The ESAPI.encoder().encodeForHTMLAttribute() is unnecessary and causes double-encoding
 x.setAttribute("value", '<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTMLAttribute(companyName))%>');
 var form1 = document.forms[0];
 form1.appendChild(x);
```

Masalahnya adalah jika companyName memiliki nilai "Johnson & Johnson". Apa yang akan ditampilkan di kolom teks input adalah "Johnson & Johnson". Pengodean yang tepat untuk digunakan dalam kasus di atas hanyalah pengodean JavaScript untuk melarang penyerang menutup tanda kutip tunggal dan kode sebaris, atau keluar ke HTML dan membuka tag skrip baru.

### Contoh AMAN dan BENAR SECARA FUNGSIONAL

```javascript
var ESAPI = require('node-esapi');
var x = document.createElement("input");
x.setAttribute("name", "company_name");
x.setAttribute("value", '<%=ESAPI.encoder().encodeForJavascript(companyName)%>');
var form1 = document.forms[0];
form1.appendChild(x); ```

Penting untuk dicatat bahwa saat menyetel atribut HTML yang tidak mengeksekusi kode, nilainya disetel langsung di dalam atribut objek elemen HTML sehingga tidak ada masalah dengan penyuntikan.

## ATURAN \#3 - Berhati-hatilah saat Memasukkan Data yang Tidak Dipercaya ke dalam Penangan Peristiwa dan Subkonteks kode JavaScript dalam Konteks Eksekusi

Menempatkan data dinamis dalam kode JavaScript sangat berbahaya karena penyandian JavaScript memiliki semantik yang berbeda untuk data yang disandikan JavaScript jika dibandingkan dengan penyandian lainnya. Dalam banyak kasus, penyandian JavaScript tidak menghentikan serangan dalam konteks eksekusi. Misalnya, string yang disandikan JavaScript akan dieksekusi meskipun disandikan JavaScript.

Oleh karena itu, rekomendasi utama adalah **menghindari penyertaan data yang tidak tepercaya dalam konteks ini**. Jika Anda harus melakukannya, contoh berikut menjelaskan beberapa pendekatan yang berhasil dan tidak berhasil.

```javascript
var x = document.createElement("a");
x.href="#";
// Pada baris kode di bawah ini, data yang dikodekan di sebelah kanan (argumen kedua untuk setAttribute)
// adalah contoh data tidak tepercaya yang dikodekan JavaScript dengan benar tetapi masih dijalankan.
x.setAttribute("onclick", "\u0061\u006c\u0065\u0072\u0074\u0028\u0032\u0032\u0029");
var y = document.createTextNode("Klik Untuk Menguji");
x.appendChild(y);
document.body.appendChild(x);
```

Metode `setAttribute(name_string,value_string)` berbahaya karena secara implisit memaksa *value_string* ke dalam tipe data atribut DOM dari *name_string*.

Dalam kasus di atas, nama atribut adalah pengendali peristiwa JavaScript, sehingga nilai atribut secara implisit diubah ke kode JavaScript dan dievaluasi. Dalam kasus di atas, penyandian JavaScript tidak mengurangi risiko XSS berbasis DOM.

Metode JavaScript lain yang menggunakan kode sebagai tipe string akan memiliki masalah serupa seperti yang diuraikan di atas (`setTimeout`, `setInterval`, new Function, dll.). Hal ini sangat kontras dengan penyandian JavaScript dalam atribut event handler dari tag HTML (parser HTML) di mana penyandian JavaScript mengurangi risiko XSS.

```html
<!-- TIDAK berfungsi -->
<a id="bb" href="#" onclick="\u0061\u006c\u0065\u0072\u0074\u0028\u0031\u0029"> Test me</a>
```

Alternatif untuk menggunakan `Element.setAttribute(...)` guna menyetel atribut DOM adalah menyetel atribut secara langsung. Menetapkan atribut event handler secara langsung akan memungkinkan penyandian JavaScript mengurangi risiko XSS berbasis DOM. Harap dicatat, menempatkan data yang tidak tepercaya secara langsung ke dalam konteks eksekusi perintah selalu merupakan desain yang berbahaya.

``` html
<a id="bb" href="#"> Test Me</a>
```

``` javascript
//The following does NOT work because the event handler is being set to a string.
//"alert(7)" is JavaScript encoded.
document.getElementById("bb").onclick = "\u0061\u006c\u0065\u0072\u0074\u0028\u0037\u0029";

//The following does NOT work because the event handler is being set to a string.
document.getElementById("bb").onmouseover = "testIt";

//The following does NOT work because of the encoded "(" and ")".
//"alert(77)" is JavaScript encoded.
document.getElementById("bb").onmouseover = \u0061\u006c\u0065\u0072\u0074\u0028\u0037\u0037\u0029;

//The following does NOT work because of the encoded ";".
//"testIt;testIt" is JavaScript encoded.
document.getElementById("bb").onmouseover = \u0074\u0065\u0073\u0074\u0049\u0074\u003b\u0074\u0065\u0073
                                            \u0074\u0049\u0074;

//The following DOES WORK because the encoded value is a valid variable name or function reference.
//"testIt" is JavaScript encoded
document.getElementById("bb").onmouseover = \u0074\u0065\u0073\u0074\u0049\u0074;

function testIt() {
   alert("I was called.");
}
```

Ada tempat lain di JavaScript di mana pengkodean JavaScript diterima sebagai kode eksekusi yang valid.

```javascript
 for(var \u0062=0; \u0062 < 10; \u0062++){
     \u0064\u006f\u0063\u0075\u006d\u0065\u006e\u0074
     .\u0077\u0072\u0069\u0074\u0065\u006c\u006e
     ("\u0048\u0065\u006c\u006c\u006f\u0020\u0057\u006f\u0072\u006c\u0064");
 }
 \u0077\u0069\u006e\u0064\u006f\u0077
 .\u0065\u0076\u0061\u006c
 \u0064\u006f\u0063\u0075\u006d\u0065\u006e\u0074
 .\u0077\u0072\u0069\u0074\u0065(111111111);
```

atau

```javascript
 var s = "\u0065\u0076\u0061\u006c";
 var t = "\u0061\u006c\u0065\u0072\u0074\u0028\u0031\u0031\u0029";
 window[s](t);
```

Karena JavaScript didasarkan pada standar internasional (ECMAScript), penyandian JavaScript memungkinkan dukungan karakter internasional dalam konstruksi dan variabel pemrograman selain representasi string alternatif (string escape).

Namun, yang terjadi adalah sebaliknya dengan penyandian HTML. Elemen tag HTML didefinisikan dengan baik dan tidak mendukung representasi alternatif dari tag yang sama. Jadi, penyandian HTML tidak dapat digunakan untuk memungkinkan pengembang memiliki representasi alternatif dari tag `<a>` misalnya.

### Sifat Melucuti Senjata Penyandian HTML

Secara umum, penyandian HTML berfungsi untuk mengebiri tag HTML yang ditempatkan dalam konteks HTML dan atribut HTML. Contoh kerja (tanpa penyandian HTML):

```html
<a href="..." >
```

Contoh yang disandikan secara normal (Tidak Berfungsi – DNW):

```html
&#x3c;a href=... &#x3e;
```

Contoh yang disandikan HTML untuk menyoroti perbedaan mendasar dengan nilai yang disandikan JavaScript (DNW):

```html
<&#x61; href=...>
```

Jika penyandian HTML mengikuti semantik yang sama dengan penyandian JavaScript, baris di atas mungkin dapat berfungsi untuk merender tautan. Perbedaan ini membuat penyandian JavaScript menjadi senjata yang kurang ampuh dalam melawan XSS.

## ATURAN \#4 - Escape JavaScript Sebelum Memasukkan Data yang Tidak Dipercaya ke Subkonteks Atribut CSS dalam Konteks Eksekusi

Biasanya, mengeksekusi JavaScript dari konteks CSS memerlukan penerusan `javascript:attackCode()` ke metode `url()` CSS atau pemanggilan metode `expression()` CSS yang meneruskan kode JavaScript agar dapat dieksekusi secara langsung.

Dari pengalaman saya, pemanggilan fungsi `expression()` dari konteks eksekusi (JavaScript) telah dinonaktifkan. Untuk mengurangi risiko terhadap metode `url()` CSS, pastikan Anda mengodekan URL data yang diteruskan ke metode `url()` CSS.

```javascript
var ESAPI = require('node-esapi'); document.body.style.backgroundImage = "url(<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForURL(companyName))%>)";
```

## ATURAN \#5 - Escape URL lalu Escape JavaScript Sebelum Memasukkan Data yang Tidak Dipercaya ke Subkonteks Atribut URL dalam Konteks Eksekusi

Logika yang mengurai URL dalam konteks eksekusi dan rendering tampak sama. Oleh karena itu, ada sedikit perubahan dalam aturan pengodean untuk atribut URL dalam konteks eksekusi (DOM).

```javascript
var ESAPI = require('node-esapi');
var x = document.createElement("a");
x.setAttribute("href", '<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForURL(userRelativePath))%>');
var y = document.createTextElement("Click Me To Test");
x.appendChild(y);
document.body.appendChild(x);
```

Jika Anda menggunakan URL yang sepenuhnya memenuhi syarat, maka ini akan memutus tautan karena titik dua dalam pengenal protokol (`http:` atau `javascript:`) akan dikodekan sebagai URL yang mencegah protokol `http` dan `javascript` dipanggil.

## ATURAN \#6 - Mengisi DOM menggunakan fungsi atau properti JavaScript yang aman

Cara aman paling mendasar untuk mengisi DOM dengan data yang tidak tepercaya adalah dengan menggunakan properti penugasan aman `textContent`.

Berikut adalah contoh penggunaan yang aman.

```html
<script>
element.textContent = untrustedData; //tidak mengeksekusi kode
</script>
```

## ATURAN \#7 - Memperbaiki Kerentanan Skrip Lintas Situs DOM

Cara terbaik untuk memperbaiki skrip lintas situs berbasis DOM adalah dengan menggunakan metode keluaran (sink) yang tepat. Misalnya, jika Anda ingin menggunakan input pengguna untuk menulis dalam elemen `tag div`, jangan gunakan `innerHtml`, sebaliknya gunakan `innerText` atau `textContent`. Ini akan menyelesaikan masalah, dan merupakan cara yang tepat untuk memperbaiki kerentanan XSS berbasis DOM.

**Selalu merupakan ide yang buruk untuk menggunakan input yang dikontrol pengguna dalam sumber yang berbahaya seperti eval. 99% dari waktu itu merupakan indikasi praktik pemrograman yang buruk atau malas, jadi jangan lakukan itu alih-alih mencoba membersihkan input.**

Terakhir, untuk memperbaiki masalah dalam kode awal kita, alih-alih mencoba mengodekan output dengan benar yang merepotkan dan dapat dengan mudah salah, kita cukup menggunakan `element.textContent` untuk menuliskannya dalam konten seperti ini:

```html
<b>URL Saat Ini:</b> <span id="contentholder"></span>
...
<script>
document.getElementById("contentholder").textContent = document.baseURI;
</script>
```

Ia melakukan hal yang sama tetapi kali ini tidak rentan terhadap kerentanan skrip lintas situs berbasis DOM.

## Panduan untuk Mengembangkan Aplikasi Aman yang Memanfaatkan JavaScript

XSS berbasis DOM sangat sulit untuk diatasi karena permukaan serangannya yang besar dan kurangnya standarisasi di seluruh browser.

Pedoman di bawah ini merupakan upaya untuk memberikan pedoman bagi pengembang saat mengembangkan aplikasi JavaScript berbasis Web (Web 2.0) sehingga mereka dapat menghindari XSS.

### PANDUAN \#1 - Data yang tidak tepercaya hanya boleh diperlakukan sebagai teks yang dapat ditampilkan

Hindari memperlakukan data yang tidak tepercaya sebagai kode atau markup dalam kode JavaScript.

### PANDUAN \#2 - Selalu kodekan JavaScript dan batasi data yang tidak tepercaya sebagai string yang dikutip saat memasuki aplikasi saat membangun JavaScript yang menggunakan templat

Selalu kodekan JavaScript dan batasi data yang tidak tepercaya sebagai string yang dikutip saat memasuki aplikasi seperti yang diilustrasikan dalam contoh berikut.

```javascript
var x = "<%= Encode.forJavaScript(untrustedData) %>"; ```

### PANDUAN \#3 - Gunakan document.createElement("..."), element.setAttribute("...","value"), element.appendChild(...) dan sejenisnya untuk membangun antarmuka dinamis

`document.createElement("...")`, `element.setAttribute("...","value")`, `element.appendChild(...)` dan sejenisnya adalah cara aman untuk membangun antarmuka dinamis.

Harap dicatat, `element.setAttribute` hanya aman untuk sejumlah atribut terbatas.

Atribut berbahaya mencakup atribut apa pun yang merupakan konteks eksekusi perintah, seperti `onclick` atau `onblur`.

Contoh atribut yang aman meliputi: `align`, `alink`, `alt`, `bgcolor`, `border`, `cellpadding`, `cellspacing`, `class`, `color`, `cols`, `colspan`, `coords`, `dir`, `face`, `height`, `hspace`, `ismap`, `lang`, `marginheight`, `marginwidth`, `multiple`, `nohref`, `noresize`, `noshade`, `nowrap`, `ref`, `rel`, `rev`, `rows`, `rowspan`, `scrolling`, `shape`, `span`, `summary`, `tabindex`, `title`, `usemap`, `valign`, `value`, `vlink`, `vspace`, `width`.

### PANDUAN \#4 - Hindari mengirim data yang tidak tepercaya ke dalam metode rendering HTML

Hindari mengisi metode berikut dengan data yang tidak tepercaya.

1. `element.innerHTML = "...";`
2. `element.outerHTML = "...";`
3. `document.write(...);`
4. `document.writeln(...);`

### PANDUAN \#5 - Hindari banyak metode yang secara implisit mengeval() data yang diteruskan kepadanya

Ada banyak metode yang secara implisit mengeval() data yang diteruskan kepadanya yang harus dihindari.

Pastikan bahwa semua data yang tidak tepercaya yang diteruskan ke metode ini:

1. Dibatasi dengan pembatas string
2. Diapit dalam penutupan atau JavaScript yang dikodekan ke N-level berdasarkan penggunaan
3. Dibungkus dalam fungsi kustom.

Pastikan untuk mengikuti langkah 3 di atas guna memastikan bahwa data yang tidak tepercaya tidak dikirim ke metode berbahaya dalam fungsi kustom atau menanganinya dengan menambahkan lapisan penyandian tambahan.

#### Memanfaatkan Penutup (seperti yang disarankan oleh Gaz)

Contoh berikut mengilustrasikan penggunaan penutup untuk menghindari penyandian JavaScript ganda.

```javascript
 var ESAPI = require('node-esapi');
 setTimeout((function(param) { return function() {
          customFunction(param);
        }
 })("<%=ESAPI.encoder().encodeForJavascript(untrustedData)%>"), y);
```

Alternatif lainnya adalah menggunakan N-level pengodean.

#### N-Level Pengodean

Jika kode Anda tampak seperti berikut, Anda hanya perlu mengodekan data input JavaScript dua kali.

```javascript
setTimeout("customFunction('<%=doubleJavaScriptEncodedData%>', y)");
function customFunction (firstName, lastName)
alert("Hello" + firstName + " " + lastNam);
}
```

`doubleJavaScriptEncodedData` memiliki lapisan pertama pengodean JavaScript yang dibalik (saat dijalankan) dalam tanda kutip tunggal.

Kemudian `eval` implisit dari `setTimeout` membalikkan lapisan lain dari penyandian JavaScript untuk meneruskan nilai yang benar ke `customFunction`

Alasan mengapa Anda hanya perlu melakukan penyandian JavaScript ganda adalah karena fungsi `customFunction` itu sendiri tidak meneruskan input ke metode lain yang secara implisit atau eksplisit memanggil `eval`. Jika *firstName* diteruskan ke metode JavaScript lain yang secara implisit atau eksplisit memanggil `eval()` maka `<%=doubleJavaScriptEncodedData%>` di atas perlu diubah menjadi `<%=tripleJavaScriptEncodedData%>`.

Catatan implementasi yang penting adalah jika kode JavaScript mencoba menggunakan data yang disandikan ganda atau rangkap tiga dalam perbandingan string, nilai tersebut dapat ditafsirkan sebagai nilai yang berbeda berdasarkan jumlah `evals()` yang telah dilalui data sebelum diteruskan ke perbandingan if dan berapa kali nilai tersebut disandikan JavaScript.

Jika **A** dikodekan JavaScript ganda, maka pemeriksaan **if** berikut akan mengembalikan false.

``` javascript
var x = "doubleJavaScriptEncodedA"; //\u005c\u0075\u0030\u0030\u0034\u0031
if (x == "A") {
alert("x adalah A");
} else if (x == "\u0041") {
alert("Ini yang muncul");
}
```

Hal ini memunculkan poin desain yang menarik. Idealnya, cara yang benar untuk menerapkan pengodean dan menghindari masalah yang disebutkan di atas adalah dengan mengodekan sisi server untuk konteks keluaran tempat data dimasukkan ke dalam aplikasi.

Kemudian mengodekan sisi klien (menggunakan pustaka pengodean JavaScript seperti [node-esapi](https://github.com/ESAPI/node-esapi/)) untuk subkonteks individual (metode DOM) tempat data yang tidak tepercaya diteruskan.

Berikut ini beberapa contoh penggunaannya:

```javascript
//pengodean sisi server
var ESAPI = require('node-esapi');
var input = "<%=ESAPI.encoder().encodeForJavascript(untrustedData)%>";
```

```javascript
//Pengodean HTML terjadi di JavaScript
var ESAPI = require('node-esapi');
document.writeln(ESAPI.encoder().encodeForHTML(input));
```

Salah satu opsi adalah memanfaatkan properti ECMAScript 5 yang tidak dapat diubah di pustaka JavaScript.
Opsi lain yang disediakan oleh Gaz (Gareth) adalah menggunakan konstruksi kode tertentu untuk membatasi mutabilitas dengan penutupan anonim.

Berikut ini contohnya:

```javascript
function escapeHTML(str) {
     str = str + "''";
     var out = "''";
     for(var i=0; i<str.length; i++) {
         if(str[i] === '<') {
             out += '&lt;';
         } else if(str[i] === '>') {
             out += '&gt;';
         } else if(str[i] === "'") {
             out += '&#39;';
         } else if(str[i] === '"') {
             out += '&quot;';
         } else {
             out += str[i];
         }
     }
     return out;
}
```

### PANDUAN \#6 - Gunakan data yang tidak tepercaya hanya pada sisi kanan suatu ekspresi

Gunakan data yang tidak tepercaya hanya pada sisi kanan suatu ekspresi, terutama data yang tampak seperti kode dan dapat diteruskan ke aplikasi (misalnya, `location` dan `eval()`).

```javascript
window[userDataOnLeftSide] = "userDataOnRightSide";
```

Menggunakan data pengguna yang tidak tepercaya pada sisi kiri ekspresi memungkinkan penyerang untuk menumbangkan atribut internal dan eksternal objek jendela, sedangkan menggunakan input pengguna pada sisi kanan ekspresi tidak memungkinkan manipulasi langsung.

### PANDUAN \#7 - Saat mengode URL dalam DOM, waspadai masalah set karakter

Saat mengode URL dalam DOM, waspadai masalah set karakter karena set karakter dalam JavaScript DOM tidak didefinisikan dengan jelas (Mike Samuel).

### PANDUAN \#8 - Batasi akses ke properti objek saat menggunakan pengakses objek\[x\]

Batasi akses ke properti objek saat menggunakan pengakses `object[x]` (Mike Samuel). Dengan kata lain, tambahkan tingkat ketidakterusterangan antara masukan yang tidak tepercaya dan properti objek yang ditentukan.

Berikut adalah contoh masalah menggunakan tipe peta:

```javascript
var myMapType = {};
myMapType[<%=untrustedData%>] = "moreUntrustedData";
```

Pengembang yang menulis kode di atas mencoba menambahkan elemen kunci tambahan ke objek `myMapType`. Namun, ini dapat digunakan oleh penyerang untuk menumbangkan atribut internal dan eksternal objek `myMapType`.

Pendekatan yang lebih baik adalah dengan menggunakan yang berikut:

```javascript
if (untrustedData === 'location') {
myMapType.location = "moreUntrustedData"; }
```

### PANDUAN \#9 - Jalankan JavaScript Anda di kanopi atau sandbox ECMAScript 5

Jalankan JavaScript Anda di [kanopi](https://github.com/jcoglan/canopy) atau sandbox ECMAScript 5 untuk mempersulit API JavaScript Anda disusupi (Gareth Heyes dan John Stevens).

Contoh beberapa sandbox/sanitizer JavaScript:

- [js-xss](https://github.com/leizongmin/js-xss)
- [sanitize-html](https://github.com/apostrophecms/sanitize-html)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [MDN - HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
- [OWASP Summit 2011 - DOM Sandboxing](https://owasp.org/www-pdf-archive/OWASPSummit2011DOMSandboxingBrowserSecurityTrack.pdf)

### PANDUAN \#10 - Jangan eval() JSON untuk mengubahnya menjadi objek JavaScript asli

Jangan `eval()` JSON untuk mengubahnya ke objek JavaScript asli. Sebaliknya gunakan `JSON.toJSON()` dan `JSON.parse()` (Chris Schmidt).

## Masalah Umum Terkait Mitigasi XSS Berbasis DOM

### Konteks Kompleks

Dalam banyak kasus, konteksnya tidak selalu mudah dipahami.

```html
<a href="javascript:myFunction('<%=untrustedData%>', 'test');">Klik Saya</a>
...
<script>
Fungsi myFunction (url,nama) {
window.location = url;
}
</script>
```

Dalam contoh di atas, data yang tidak tepercaya dimulai dalam konteks URL rendering (atribut `href` dari tag `a`) lalu diubah ke konteks eksekusi JavaScript (penanganan protokol `javascript:`) yang meneruskan data yang tidak tepercaya ke subkonteks URL eksekusi (`window.location` dari `myFunction`).

Karena data diperkenalkan dalam kode JavaScript dan diteruskan ke subkonteks URL, pengodean sisi server yang sesuai akan menjadi berikut:

```html
<a href="javascript:myFunction('<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForURL(untrustedData)) %>', 'test');">
Klik Saya</a>
...
```

Atau jika Anda menggunakan ECMAScript 5 dengan pustaka pengodean sisi klien JavaScript yang tidak dapat diubah, Anda dapat melakukan hal berikut:

```html
<!-- pengodean URL sisi server telah dihapus. Sekarang hanya pengodean JavaScript di sisi server. -->
<a href="javascript:myFunction('<%=ESAPI.encoder().encodeForJavascript(untrustedData)%>', 'test');">Klik Saya</a>
...
<script>
Fungsi myFunction (url,nama) {
var encodedURL = ESAPI.encoder().encodeForURL(url); //Pengodean URL menggunakan skrip sisi klien
window.location = encodedURL; }
</script>
```

### Ketidakkonsistenan Pustaka Pengodean

Ada sejumlah pustaka pengodean sumber terbuka di luar sana:

1. OWASP [ESAPI](https://owasp.org/www-project-enterprise-security-api/)
2. OWASP [Java Encoder](https://owasp.org/www-project-java-encoder/)
3. Apache Commons Text [StringEscapeUtils](https://commons.apache.org/proper/commons-text/javadocs/api-release/org/apache/commons/text/StringEscapeUtils.html), gantikan satu dari [Apache Commons Lang3](https://commons.apache.org/proper/commons-lang/apidocs/org/apache/commons/lang3/StringEscapeUtils.html)
4. [Jtidy](http://jtidy.sourceforge.net/)
5. Implementasi kustom perusahaan Anda.

Sebagian bekerja pada daftar penolakan sementara sebagian lainnya mengabaikan karakter penting seperti "&lt;" dan "&gt;".

Java Encoder adalah proyek aktif yang menyediakan dukungan untuk penyandian HTML, CSS, dan JavaScript.

ESAPI adalah salah satu dari sedikit yang bekerja pada daftar yang diizinkan dan menyandikan semua karakter non-alfanumerik. Penting untuk menggunakan pustaka penyandian yang memahami karakter mana yang dapat digunakan untuk mengeksploitasi kerentanan dalam konteksnya masing-masing. Banyak kesalahpahaman terkait penyandian yang tepat yang diperlukan.

### Kesalahpahaman Penyandian

Banyak kurikulum dan makalah pelatihan keamanan menganjurkan penggunaan penyandian HTML secara membabi buta untuk mengatasi XSS.

Secara logis ini tampaknya merupakan saran yang bijaksana karena parser JavaScript tidak memahami penyandian HTML.

Namun, jika halaman yang dikembalikan dari aplikasi web Anda menggunakan tipe konten `text/xhtml` atau ekstensi tipe file `*.xhtml` maka pengodean HTML mungkin tidak berfungsi untuk mengurangi risiko XSS.

Misalnya:

```html
<script>
&#x61;lert(1);
</script>
```

Nilai HTML yang dikodekan di atas masih dapat dieksekusi. Jika itu tidak cukup untuk diingat, Anda harus ingat bahwa penyandian hilang saat Anda mengambilnya menggunakan atribut nilai dari elemen DOM.

Mari kita lihat contoh halaman dan skrip:

```html
<form name="myForm" ...>
<input type="text" name="lName" value="<%=ESAPI.encoder().encodeForHTML(last_name)%>">
...
</form>
<script>
var x = document.myForm.lName.value; //saat nilai diambil, penyandian dibalik
document.writeln(x); //setiap kode yang dimasukkan ke lName sekarang dapat dieksekusi.
</script>
```

Akhirnya ada masalah bahwa metode tertentu dalam JavaScript yang biasanya aman bisa jadi tidak aman dalam konteks tertentu.

### Metode yang Biasanya Aman

Salah satu contoh atribut yang dianggap aman adalah `innerText`.

Beberapa makalah atau panduan menganjurkan penggunaannya sebagai alternatif `innerHTML` untuk mengurangi risiko XSS dalam `innerHTML`. Namun, tergantung pada tag tempat `innerText` diterapkan, kode dapat dieksekusi.

```html
<script>
var tag = document.createElement("script");
tag.innerText = "<%=untrustedData%>"; //mengeksekusi kode
</script>
```

Fitur `innerText` awalnya diperkenalkan oleh Internet Explorer, dan secara resmi ditetapkan dalam standar HTML pada tahun 2016 setelah diadopsi oleh semua vendor browser utama.

### Mendeteksi DOM XSS menggunakan analisis varian

**Kode yang rentan:**

```
<script>
var x = location.hash.split("#")[1];
document.write(x);
</script>
```

Aturan Semgrep untuk mengidentifikasi dom xss di atas [link](https://semgrep.dev/s/we30).

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `