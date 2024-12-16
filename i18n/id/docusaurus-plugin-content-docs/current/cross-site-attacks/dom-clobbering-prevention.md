---
sidebar_position: 3
---

# Pencegahan DOM Clobbering

## Pendahuluan tentang Pencegahan DOM Clobbering

[DOM Clobbering](https://domclob.xyz/domc_wiki/#overview) adalah jenis serangan injeksi HTML-only yang menggunakan kembali kode, di mana penyerang membingungkan aplikasi web dengan menyuntikkan elemen HTML yang atribut `id` atau `name`-nya cocok dengan nama variabel yang sensitif terhadap keamanan atau API browser, seperti variabel yang digunakan untuk mengambil konten jarak jauh (misalnya, skrip src), dan menutupi nilainya.

Hal ini khususnya relevan ketika injeksi skrip tidak memungkinkan, misalnya, ketika difilter oleh pembersih HTML, atau dikurangi dengan melarang atau mengendalikan eksekusi skrip. Dalam skenario ini, penyerang mungkin masih menyuntikkan markup HTML non-skrip ke halaman web dan mengubah markup yang awalnya aman menjadi kode yang dapat dieksekusi, sehingga mencapai [Cross-Site Scripting (XSS)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

**Lembar contekan ini adalah daftar panduan, pola pengodean yang aman, dan praktik untuk mencegah atau membatasi dampak DOM Clobbering pada aplikasi web Anda.**

## Latar Belakang

Sebelum kita menyelami DOM Clobbering, mari segarkan pengetahuan kita dengan beberapa latar belakang Web dasar.

Saat halaman web dimuat, browser membuat [pohon DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) yang mewakili struktur dan konten halaman, dan kode JavaScript memiliki akses baca dan tulis ke pohon ini.

Saat membuat pohon DOM, peramban juga membuat atribut untuk (beberapa) elemen HTML bernama pada objek `window` dan `document`. Elemen HTML bernama adalah elemen yang memiliki atribut `id` atau `name`. Misalnya, markup:

```html
<form id=x></a>
```

akan menyebabkan peramban membuat referensi ke elemen formulir tersebut dengan atribut `x` dari `window` dan `document`:

```js
var obj1 = document.getElementById('x');
var obj2 = document.x;
var obj3 = document.x;
var obj4 = window.x;
var obj5 = x; // secara default, objek termasuk dalam Window global, jadi x sama dengan window.x
console.log(
obj1 === obj2 && obj2 === obj3 &&
obj3 === obj4 && obj4 === obj5
); // true
```

Saat mengakses atribut objek `window` dan `document`, referensi elemen HTML bernama muncul sebelum pencarian API bawaan dan atribut lain pada `window` dan `document` yang telah ditetapkan pengembang, yang juga dikenal sebagai [akses properti bernama](https://html.spec.whatwg.org/multipage/nav-history-apis.html#named-access-on-the-window-object). Pengembang yang tidak menyadari perilaku tersebut dapat menggunakan konten atribut window/document untuk operasi sensitif, seperti URL untuk mengambil konten jarak jauh, dan penyerang dapat mengeksploitasinya dengan menyuntikkan markup dengan nama yang bertabrakan. Mirip dengan atribut/variabel kustom, API browser bawaan dapat dibayangi oleh DOM Clobbering.

Jika penyerang dapat menyuntikkan markup HTML (non-skrip) di pohon DOM,
ia dapat mengubah nilai variabel yang diandalkan aplikasi web karena akses properti bernama, menyebabkannya tidak berfungsi, mengekspos data sensitif, atau menjalankan skrip yang dikendalikan penyerang. DOM Clobbering bekerja dengan memanfaatkan perilaku (lama) ini, yang menyebabkan tabrakan namespace antara lingkungan eksekusi (yaitu, objek `window` dan `document`), dan kode JavaScript.

### Contoh Serangan 1

```javascript
let redirectTo = window.redirectTo || '/profile/';
location.assign(redirectTo);
```

Penyerang dapat:

- menyuntikkan markup `<a id=redirectTo href='javascript:alert(1)'` dan memperoleh XSS. - menyuntikkan markup `<a id=redirectTo href='phishing.com'` dan memperoleh pengalihan terbuka.

### Contoh Serangan 2

```javascript
var script = document.createElement('script');
let src = window.config.url || 'script.js';
s.src = src;
document.body.appendChild(s);
```

Penyerang dapat menyuntikkan markup `<a id=config><a id=config name=url href='malicious.js'>` untuk memuat kode JavaScript tambahan, dan memperoleh eksekusi kode sisi klien yang sewenang-wenang.

## Ringkasan Pedoman

Sebagai referensi cepat, berikut adalah ringkasan pedoman yang dibahas berikutnya.

|    | **Guidelines**                                                | Description                                                               |
|----|---------------------------------------------------------------|---------------------------------------------------------------------------|
| \# 1  | Use HTML Sanitizers                                           | [link](#1-html-sanitization)                                              |
| \# 2  | Use Content-Security Policy                                   | [link](#2-content-security-policy)                                        |
| \# 3  | Freeze Sensitive DOM Objects                                  | [link](#3-freezing-sensitive-dom-objects)                                 |
| \# 4  | Validate All Inputs to DOM Tree                               | [link](#4-validate-all-inputs-to-dom-tree)                                |
| \# 5  | Use Explicit Variable Declarations                            | [link](#5-use-explicit-variable-declarations)                             |
| \# 6  | Do Not Use Document and Window for Global Variables           | [link](#6-do-not-use-document-and-window-for-global-variables)            |
| \# 7  | Do Not Trust Document Built-in APIs Before Validation         | [link](#7-do-not-trust-document-built-in-apis-before-validation)          |
| \# 8  | Enforce Type Checking                                         | [link](#8-enforce-type-checking)                                          |
| \# 9  | Use Strict Mode                                               | [link](#9-use-strict-mode)                                                |
| \# 10 | Apply Browser Feature Detection                               | [link](#10-apply-browser-feature-detection)                               |
| \# 11 | Limit Variables to Local Scope                                | [link](#11-limit-variables-to-local-scope)                                |
| \# 12 | Use Unique Variable Names In Production                       | [link](#12-use-unique-variable-names-in-production)                       |
| \# 13 | Use Object-oriented Programming Techniques like Encapsulation | [link](#13-use-object-oriented-programming-techniques-like-encapsulation) |

## Teknik Mitigasi

### \#1: Sanitasi HTML

Sanitizer HTML yang kuat dapat mencegah atau membatasi risiko DOM Clobbering. Sanitizer dapat melakukannya dengan berbagai cara. Misalnya:

- menghapus sepenuhnya properti bernama seperti `id` dan `name`. Meskipun efektif, hal ini dapat menghambat kegunaan saat properti bernama dibutuhkan untuk fungsi yang sah.

- isolasi namespace, yang dapat berupa, misalnya, awalan nilai properti bernama dengan string konstan untuk membatasi risiko tabrakan penamaan.

- memeriksa secara dinamis apakah properti bernama dari tanda input memiliki tabrakan dengan pohon DOM yang ada, dan jika demikian, hapus properti bernama dari markup input.

OWASP merekomendasikan [DOMPurify](https://github.com/cure53/DOMPurify) atau [API Sanitizer](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API) untuk sanitasi HTML.

#### DOMPurify Sanitizer

Secara default, DOMPurify menghapus semua tabrakan clobbering dengan API dan properti **bawaan** (menggunakan opsi konfigurasi `SANITIZE_DOM` yang diaktifkan secara default).

Agar terlindungi dari clobbering variabel dan properti kustom, Anda perlu mengaktifkan konfigurasi `SANITIZE_NAMED_PROPS`:

```js
var clean = DOMPurify.sanitize(dirty, {SANITIZE_NAMED_PROPS: true});
```

Ini akan mengisolasi namespace dari properti bernama dan variabel JavaScript dengan mengawalinya dengan string `user-content-`.

#### API Sanitizer

[API Sanitizer](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API) bawaan browser yang baru tidak mencegah DOM Clobbering pada [setelan default](https://wicg.github.io/sanitizer-api/#dom-clobbering), tetapi dapat dikonfigurasi untuk menghapus properti bernama:

```js
const sanitizerInstance = new Sanitizer({
  blockAttributes: [
    {'name': 'id', elements: '*'},
    {'name': 'name', elements: '*'}
  ]
});
containerDOMElement.setHTML(input, {sanitizer: sanitizerInstance});
```

### \#2: Kebijakan Keamanan Konten

[Kebijakan Keamanan Konten (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) adalah serangkaian aturan yang memberi tahu peramban sumber daya mana yang boleh dimuat di halaman web. Dengan membatasi sumber file JavaScript (misalnya, dengan perintah [script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)), CSP dapat mencegah kode berbahaya dimasukkan ke dalam halaman.

**Catatan:** CSP hanya dapat mengurangi **beberapa varian** serangan DOM clobbering, seperti saat penyerang mencoba memuat skrip baru dengan menghancurkan sumber skrip, tetapi tidak saat kode yang sudah ada dapat disalahgunakan untuk eksekusi kode, misalnya, menghancurkan parameter konstruksi evaluasi kode seperti `eval()`.

### \#3: Membekukan Objek DOM yang Sensitif

Cara sederhana untuk mengurangi DOM Clobbering terhadap objek individual adalah dengan membekukan objek DOM yang sensitif dan propertinya, misalnya, melalui metode [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze).

**Catatan:** Membekukan properti objek mencegahnya ditimpa oleh elemen DOM bernama. Namun, menentukan semua objek dan properti objek yang perlu dibekukan mungkin tidak mudah, sehingga membatasi kegunaan pendekatan ini.

## Panduan Pengodean yang Aman

Penghancuran DOM dapat dihindari dengan pemrograman defensif dan mematuhi beberapa pola dan panduan pengodean.

### \#4: Validasi Semua Input ke Pohon DOM

Sebelum memasukkan markup apa pun ke pohon DOM halaman web, bersihkan atribut `id` dan `name` (lihat [pembersihan HTML](#html-sanitization)).

### \#5: Gunakan Deklarasi Variabel Eksplisit

Saat menginisialisasi variabel, selalu gunakan deklarator variabel seperti `var`, `let` atau `const`, yang mencegah penghancuran variabel.

**Catatan:** Mendeklarasikan variabel dengan `let` tidak membuat properti pada `window`, tidak seperti `var`. Oleh karena itu, `window.VARNAME` masih dapat dihancurkan (dengan asumsi `VARNAME` adalah nama variabel).

### \#6: Jangan Gunakan Document dan Window untuk Variabel Global

Hindari penggunaan objek seperti `document` dan `window` untuk menyimpan variabel global, karena keduanya dapat dengan mudah dimanipulasi. (lihat, misalnya, [di sini](https://domclob.xyz/domc_wiki/indicators/patterns.html#do-not-use-document-for-global-variables)).

### \#7: Jangan Percayai API Bawaan Document Sebelum Validasi

Properti dokumen, termasuk yang bawaan, selalu dibayangi oleh DOM Clobbering, bahkan setelah diberi nilai.

**Petunjuk:** Hal ini disebabkan oleh apa yang disebut [algoritme visibilitas properti bernama](https://webidl.spec.whatwg.org/#legacy-platform-object-abstract-ops), di mana referensi elemen HTML bernama muncul sebelum pencarian API bawaan dan atribut lain pada `document`.

### \#8: Terapkan Pemeriksaan Tipe

Selalu periksa tipe properti `document` dan `window` sebelum menggunakannya dalam operasi sensitif, misalnya, menggunakan operator [`instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof).

**Petunjuk:** Saat objek dihancurkan, objek tersebut akan merujuk ke instance [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element), yang mungkin bukan tipe yang diharapkan.

### \#9: Gunakan Mode Ketat

Gunakan mode `ketat` untuk mencegah pembuatan variabel global yang tidak diinginkan, dan untuk [menimbulkan kesalahan](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Read-only) saat properti baca-saja dicoba untuk ditimpa.

### \#10: Terapkan Deteksi Fitur Peramban

Daripada mengandalkan fitur atau properti khusus peramban, gunakan deteksi fitur untuk menentukan apakah suatu fitur didukung sebelum menggunakannya. Ini dapat membantu mencegah kesalahan dan DOM Clobbering yang mungkin muncul saat menggunakan fitur tersebut di peramban yang tidak didukung.

**Petunjuk:** API fitur yang tidak didukung dapat bertindak sebagai variabel/properti yang tidak ditentukan di peramban yang tidak didukung, sehingga dapat ditimpa.

### \#11: Batasi Variabel ke Cakupan Lokal

Variabel global lebih rentan ditimpa oleh DOM Clobbering. Bila memungkinkan, gunakan variabel lokal dan properti objek.

### \#12: Gunakan Nama Variabel Unik dalam Produksi

Penggunaan nama variabel unik dapat membantu mencegah tabrakan penamaan yang dapat menyebabkan penimpaan yang tidak disengaja.

### \#13: Gunakan Teknik Pemrograman Berorientasi Objek seperti Enkapsulasi

Enkapsulasi variabel dan fungsi dalam objek atau kelas dapat membantu mencegahnya ditimpa. Dengan menjadikannya privat, variabel dan fungsi tidak dapat diakses dari luar objek, sehingga tidak mudah diretas oleh DOM.

## Referensi

- [domclob.xyz](https://domclob.xyz)
- [PortSwigger: DOM Clobbering Strikes Back](https://portswigger.net/research/dom-clobbering-strikes-back)
- [Blogpost: XSS in GMail’s AMP4Email](https://research.securitum.com/xss-in-amp4email-dom-clobbering/)
- [HackTricks: DOM Clobbering](https://book.hacktricks.xyz/pentesting-web/xss-cross-site-scripting/dom-clobbering)
- [HTMLHell: DOM Clobbering](https://www.htmhell.dev/adventcalendar/2022/12/)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `