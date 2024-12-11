---
sidebar_position: 1
---

# Pencegahan Cross Site Request Forgery 

## Pengantar Pencegahan Cross Site Request Forgery

Serangan [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) terjadi saat situs web, email, blog, pesan instan, atau program berbahaya mengelabui peramban web pengguna yang diautentikasi agar melakukan tindakan yang tidak diinginkan di situs tepercaya. Jika pengguna target diautentikasi ke situs tersebut, situs target yang tidak dilindungi tidak dapat membedakan antara permintaan sah yang sah dan permintaan palsu yang diautentikasi.

Karena permintaan peramban secara otomatis menyertakan semua kuki termasuk kuki sesi, serangan ini berhasil kecuali jika otorisasi yang tepat digunakan, yang berarti bahwa mekanisme respons-tantangan situs target tidak memverifikasi identitas dan otoritas peminta. Akibatnya, serangan CSRF membuat sistem target menjalankan fungsi yang ditentukan penyerang melalui peramban korban tanpa sepengetahuan korban (biasanya hingga setelah tindakan tidak sah dilakukan).

Namun, serangan CSRF yang berhasil hanya dapat mengeksploitasi kemampuan yang diekspos oleh aplikasi yang rentan dan hak istimewa pengguna. Bergantung pada kredensial pengguna, penyerang dapat mentransfer dana, mengubah kata sandi, melakukan pembelian yang tidak sah, meningkatkan hak istimewa untuk akun target, atau melakukan tindakan apa pun yang diizinkan untuk dilakukan oleh pengguna.

Singkatnya, prinsip-prinsip berikut harus diikuti untuk melindungi diri dari CSRF:

**PENTING: Ingat bahwa Cross-Site Scripting (XSS) dapat mengalahkan semua teknik mitigasi CSRF!**

- **Lihat Lembar Contekan Pencegahan XSS OWASP untuk panduan terperinci tentang cara mencegah kelemahan XSS.**
- **Pertama, periksa apakah kerangka kerja Anda memiliki [perlindungan CSRF bawaan](#use-built-in-or-existing-csrf-implementations-for-csrf-protection) dan gunakanlah**
- **Jika kerangka kerja tidak memiliki perlindungan CSRF bawaan, tambahkan [token CSRF](#token-based-mitigation) ke semua permintaan yang mengubah status (permintaan yang menyebabkan tindakan di situs) dan validasi permintaan tersebut di backend**
- **Perangkat lunak yang memiliki status harus menggunakan [pola token sinkronisasi](#synchronizer-token-pattern)**
- **Perangkat lunak yang tidak memiliki status harus menggunakan [double submit cookies](#alternative-using-a-double-submit-cookie-pattern)**
- **Jika situs yang digerakkan API tidak dapat menggunakan tag `<form>`, pertimbangkan [menggunakan header permintaan khusus](#employing-custom-request-headers-for-ajaxapi)**
- **Terapkan setidaknya satu mitigasi dari bagian [Mitigasi Pertahanan Mendalam](#defense-in-depth-techniques)**
- **[Atribut Cookie SameSite](#samesite-cookie-attribute) dapat digunakan untuk cookie sesi** tetapi berhati-hatilah untuk TIDAK menyetel cookie khusus untuk domain. Tindakan ini menimbulkan kerentanan keamanan karena semua subdomain dari domain tersebut akan berbagi cookie, dan ini khususnya menjadi masalah jika subdomain memiliki CNAME ke domain yang tidak berada dalam kendali Anda. - **Pertimbangkan untuk menerapkan [perlindungan berbasis interaksi pengguna](#user-interaction-based-csrf-defense) untuk operasi yang sangat sensitif**
- **Pertimbangkan untuk [memverifikasi asal dengan header standar](#verifying-origin-with-standard-headers)**
- **Jangan gunakan permintaan GET untuk operasi perubahan status.**
- **Jika karena alasan apa pun Anda melakukannya, lindungi sumber daya tersebut terhadap CSRF**

## Mitigasi Berbasis Token

[Pola token sinkronisasi](#synchronizer-token-pattern) adalah salah satu metode yang paling populer dan direkomendasikan untuk memitigasi CSRF.

### Gunakan Implementasi CSRF Bawaan atau yang Sudah Ada untuk Perlindungan CSRF

Karena pertahanan token sinkronisasi dibangun ke dalam banyak kerangka kerja, cari tahu apakah kerangka kerja Anda memiliki perlindungan CSRF yang tersedia secara default sebelum Anda membangun sistem pembangkit token khusus. Misalnya, .NET dapat menggunakan [perlindungan bawaan](https://docs.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-2.1) untuk menambahkan token ke sumber daya yang rentan terhadap CSRF. Jika Anda memilih untuk menggunakan perlindungan ini, .NET membuat Anda bertanggung jawab atas konfigurasi yang tepat (seperti manajemen kunci dan manajemen token).

### Pola Token Sinkronisasi

Token CSRF harus dibuat di sisi server dan hanya boleh dibuat sekali per sesi pengguna atau setiap permintaan. Karena rentang waktu bagi penyerang untuk mengeksploitasi token yang dicuri sangat minimal untuk token per permintaan, token tersebut lebih aman daripada token per sesi. Namun, penggunaan token per permintaan dapat menimbulkan masalah kegunaan.

Misalnya, kapabilitas browser tombol "Kembali" dapat terhalang oleh token per permintaan karena halaman sebelumnya mungkin berisi token yang tidak lagi valid. Dalam kasus ini, interaksi dengan halaman sebelumnya akan mengakibatkan peristiwa keamanan positif palsu CSRF di sisi server. Jika implementasi token per sesi terjadi setelah pembuatan token awal, nilainya disimpan dalam sesi dan digunakan untuk setiap permintaan berikutnya hingga sesi berakhir.

Saat klien mengeluarkan permintaan, komponen sisi server harus memverifikasi keberadaan dan validitas token dalam permintaan tersebut dan membandingkannya dengan token yang ditemukan dalam sesi pengguna. Permintaan harus ditolak jika token tersebut tidak ditemukan dalam permintaan atau nilai yang diberikan tidak cocok dengan nilai dalam sesi pengguna. Tindakan tambahan seperti mencatat peristiwa sebagai potensi serangan CSRF yang sedang berlangsung juga harus dipertimbangkan.

Token CSRF harus:

- Unik per sesi pengguna.
- Rahasia
- Tidak dapat diprediksi (nilai acak besar yang dihasilkan oleh [metode aman](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#rule---use-cryptographically-secure-pseudo-random-number-generators-csprng)).

Token CSRF mencegah CSRF karena tanpa token CSRF, penyerang tidak dapat membuat permintaan yang valid ke server backend.

#### Mentransmisikan Token CSRF dalam Pola yang Disinkronkan

Token CSRF dapat ditransmisikan ke klien sebagai bagian dari muatan respons, seperti respons HTML atau JSON, kemudian dapat ditransmisikan kembali ke server sebagai bidang tersembunyi pada pengiriman formulir atau melalui permintaan AJAX sebagai nilai tajuk khusus atau bagian dari muatan JSON. Token CSRF tidak boleh dikirimkan dalam cookie untuk pola yang disinkronkan. Token CSRF tidak boleh bocor dalam log server atau di URL. Permintaan GET berpotensi membocorkan token CSRF di beberapa lokasi, seperti riwayat browser, file log, utilitas jaringan yang mencatat baris pertama permintaan HTTP, dan header Referer jika situs yang dilindungi terhubung ke situs eksternal. Misalnya:

```html
<form action="/transfer.do" method="post">
<input type="hidden" name="CSRFToken" value="OWY4NmQwODE4ODRjN2Q2NTlhMmZlYWEwYzU1YWQwMTVhM2JmNGYxYjJiMGI4MjJjZDE1ZDZMGYwMGEwOA==">
[...]
</form>
```

Karena permintaan dengan header kustom secara otomatis tunduk pada kebijakan asal yang sama, lebih aman untuk memasukkan token CSRF dalam header permintaan HTTP kustom melalui JavaScript daripada menambahkan token CSRF dalam parameter formulir bidang tersembunyi.

### ALTERNATIF: Menggunakan Pola Cookie Kirim Ganda

Jika mempertahankan status token CSRF di server bermasalah, Anda dapat menggunakan teknik alternatif yang dikenal sebagai pola Cookie Kirim Ganda. Teknik ini mudah diimplementasikan dan tidak memiliki status. Ada beberapa cara untuk menerapkan teknik ini, di mana pola _naif_ adalah variasi yang paling umum digunakan.

#### Cookie Double-Submit yang Ditandatangani (DIREKOMENDASIKAN)

Implementasi paling aman dari pola Cookie Double Submit adalah _Signed Double-Submit Cookie_, yang menggunakan kunci rahasia yang hanya diketahui oleh server. Ini memastikan bahwa penyerang tidak dapat membuat dan menyuntikkan token CSRF mereka sendiri yang diketahui ke dalam sesi autentikasi korban. Token sistem harus diamankan dengan melakukan hashing atau enkripsi.

Kami sangat menyarankan Anda menggunakan algoritme Hash-based Message Authentication (HMAC) karena algoritma ini kurang intensif secara komputasi daripada mengenkripsi dan mendekripsi cookie. Anda juga harus mengikat token CSRF dengan sesi pengguna saat ini untuk lebih meningkatkan keamanan.

##### Menggunakan Token CSRF HMAC

Untuk menghasilkan token HMAC CSRF (dengan nilai pengguna yang bergantung pada sesi), sistem harus memiliki:

- **Nilai yang bergantung pada sesi yang berubah pada setiap sesi login**. Nilai ini hanya boleh berlaku untuk keseluruhan sesi pengguna yang diautentikasi. Hindari penggunaan nilai statis seperti email atau ID pengguna, karena tidak aman ([1](https://stackoverflow.com/a/8656417) | [2](https://stackoverflow.com/a/30539335) | [3](https://security.stackexchange.com/a/22936)). Perlu dicatat bahwa memperbarui token CSRF terlalu sering, seperti untuk setiap permintaan, adalah kesalahpahaman yang mengasumsikan bahwa hal itu menambah keamanan yang substansial sementara sebenarnya merugikan pengalaman pengguna ([1](https://security.stackexchange.com/a/22936)). Misalnya, Anda dapat memilih satu atau kombinasi dari nilai-nilai yang bergantung pada sesi berikut:

- ID sesi sisi server (misalnya [PHP](https://www.php.net/manual/en/function.session-start.php) atau [ASP.NET](<https://learn.microsoft.com/en-us/previous-versions/aspnet/ms178581(v=vs.100)>)). Nilai ini tidak boleh meninggalkan server atau berupa teks biasa dalam Token CSRF.

- Nilai acak (misalnya UUID) dalam JWT yang berubah setiap kali JWT dibuat.

- **Kunci kriptografi rahasia** Jangan sampai tertukar dengan nilai acak dari implementasi naif. Nilai ini digunakan untuk menghasilkan hash HMAC. Idealnya, simpan kunci ini seperti yang dibahas di [halaman Penyimpanan Kriptografi](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#key-storage).
- **Nilai acak untuk tujuan anti-tabrakan**. Hasilkan nilai acak (sebaiknya acak secara kriptografi) untuk memastikan bahwa panggilan berurutan dalam detik yang sama tidak menghasilkan hash yang sama ([1](https://github.com/data-govt-nz/ckanext-security/issues/23#issuecomment-479752531)).

**Haruskah Stempel Waktu Disertakan dalam Token CSRF untuk Kedaluwarsa?**

Merupakan kesalahpahaman umum untuk menyertakan stempel waktu sebagai nilai guna menentukan waktu kedaluwarsa token CSRF. Token CSRF bukanlah token akses. Token tersebut digunakan untuk memverifikasi keaslian permintaan selama sesi, menggunakan informasi sesi. Sesi baru harus menghasilkan token baru ([1](https://stackoverflow.com/a/30539335)).

##### Kode Semu untuk Menerapkan Token HMAC CSRF

Di bawah ini adalah contoh dalam kode semu yang menunjukkan langkah-langkah penerapan yang dijelaskan di atas:

```code
// Kumpulkan nilai-nilai
secret = readEnvironmentVariable("CSRF_SECRET") // Kunci rahasia HMAC
sessionID = session.sessionID // Sesi pengguna yang diautentikasi saat ini
randomValue = cryptographic.randomValue() // Nilai acak kriptografi

// Buat Token CSRF
message = sessionID.length + "!" + sessionID + "!" + randomValue.length + "!" + randomValue // Muatan pesan HMAC
hmac = hmac("SHA256", secret, message) // Hasilkan hash HMAC
csrfToken = hmac + "." + randomValue // Tambahkan `randomValue` ke hash HMAC untuk membuat token CSRF akhir. Hindari penggunaan `message` karena berisi sessionID dalam teks biasa, yang sudah disimpan server secara terpisah.

// Simpan Token CSRF dalam cookie
response.setCookie("csrf_token=" + csrfToken + "; Secure") // Tetapkan Cookie tanpa tanda HttpOnly
```

### Pola Cookie Naive Double-Submit (DILARANG)

Metode _Naive Double-Submit Cookie_ adalah teknik yang mudah diskalakan dan mudah diterapkan yang menggunakan nilai acak yang kuat secara kriptografis sebagai cookie dan sebagai parameter permintaan (bahkan sebelum autentikasi pengguna). Kemudian server memverifikasi apakah nilai cookie dan nilai permintaan cocok. Situs harus mengharuskan setiap permintaan transaksi dari pengguna menyertakan nilai acak ini sebagai nilai formulir tersembunyi atau di dalam header permintaan. Jika nilainya cocok di sisi server, server menerimanya sebagai permintaan yang sah dan jika tidak, server menolak permintaan tersebut.

Karena penyerang tidak dapat mengakses nilai cookie selama permintaan lintas situs, mereka tidak dapat menyertakan nilai yang cocok dalam nilai formulir tersembunyi atau sebagai parameter/header permintaan.

Meskipun metode Naive Double-Submit Cookie merupakan langkah awal yang baik untuk melawan CSRF, metode ini masih rentan terhadap serangan tertentu. [Sumber daya ini](https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf) menyediakan informasi lebih lanjut tentang beberapa kerentanan. Oleh karena itu, kami sangat menyarankan Anda menggunakan pola _Signed Double-Submit Cookie_.

## Melarang permintaan sederhana

Saat tag `<form>` digunakan untuk mengirimkan data, tag tersebut mengirimkan [permintaan "sederhana"](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests) yang tidak ditetapkan oleh browser sebagai "akan diproses terlebih dahulu". Permintaan "sederhana" ini menimbulkan risiko CSRF karena browser mengizinkannya untuk dikirim ke sumber mana pun. Jika aplikasi Anda menggunakan tag `<form>` untuk mengirimkan data di mana pun di klien Anda, Anda tetap perlu melindunginya dengan pendekatan alternatif yang dijelaskan dalam dokumen ini seperti token.

> **Peringatan:**
Jika bug browser mengizinkan header HTTP kustom, atau tidak memberlakukan preflight pada tipe konten yang tidak sederhana, hal itu dapat membahayakan keamanan Anda. Meskipun tidak mungkin, sebaiknya pertimbangkan hal ini dalam model ancaman Anda. Menerapkan token CSRF menambahkan lapisan pertahanan tambahan dan memberi pengembang kontrol lebih besar atas keamanan aplikasi.

### Melarang tipe konten sederhana

Agar permintaan dianggap sederhana, permintaan tersebut harus memiliki salah satu tipe konten berikut - `application/x-www-form-urlencoded`, `multipart/form-data` atau `text/plain`. Banyak aplikasi web modern menggunakan API JSON sehingga secara alami memerlukan CORS, namun aplikasi tersebut mungkin menerima `text/plain` yang rentan terhadap CSRF. Oleh karena itu, mitigasi sederhana adalah agar server atau API melarang tipe konten sederhana ini.

### Menggunakan Header Permintaan Kustom untuk AJAX/API

Token sinkronisasi dan kuki pengiriman ganda digunakan untuk mencegah pemalsuan data formulir, tetapi keduanya sulit diterapkan dan menurunkan kegunaan. Banyak aplikasi web modern tidak menggunakan tag `<form>` untuk mengirimkan data. Pertahanan yang mudah digunakan yang sangat cocok untuk titik akhir AJAX atau API adalah penggunaan **header permintaan kustom**. Tidak diperlukan token untuk pendekatan ini.

Dalam pola ini, klien menambahkan header kustom ke permintaan yang memerlukan perlindungan CSRF. Header dapat berupa pasangan kunci-nilai sembarang, asalkan tidak bertentangan dengan header yang ada.

```
X-YOURSITE-CSRF-PROTECTION=1
```

Saat menangani permintaan, API memeriksa keberadaan header ini. Jika header tidak ada, backend menolak permintaan tersebut karena berpotensi dipalsukan. Pendekatan ini memiliki beberapa keuntungan:

- Perubahan UI tidak diperlukan
- tidak ada status server yang diperkenalkan untuk melacak token

Pertahanan ini bergantung pada mekanisme pra-penerbangan CORS yang mengirimkan permintaan `OPTIONS` untuk memverifikasi kepatuhan CORS dengan server tujuan. Semua browser modern menetapkan permintaan dengan header kustom sebagai "yang akan dipra-penerbangan". Saat API memverifikasi bahwa header kustom ada, Anda tahu bahwa permintaan tersebut pasti telah dipra-penerbangan jika berasal dari browser.

#### Header Kustom dan CORS

Cookie tidak ditetapkan pada permintaan lintas-asal (CORS) secara default. Untuk mengaktifkan cookie pada API, Anda akan menetapkan `Access-Control-Allow-Credentials=true`. Browser akan menolak respons apa pun yang menyertakan `Access-Control-Allow-Origin=*` jika kredensial diizinkan. Untuk mengizinkan permintaan CORS, tetapi melindungi dari CSRF, Anda perlu memastikan server hanya mengizinkan beberapa asal terpilih yang Anda kendalikan secara definitif melalui header `Access-Control-Allow-Origin`. Setiap permintaan lintas asal dari domain yang diizinkan akan dapat menyetel header kustom.

Sebagai contoh, Anda dapat mengonfigurasi backend Anda untuk mengizinkan CORS dengan cookie dari `http://www.yoursite.com` dan `http://mobile.yoursite.com`, sehingga satu-satunya respons pra-penerbangan yang mungkin adalah:

```
Access-Control-Allow-Origin=http://mobile.yoursite.com
Access-Control-Allow-Credentials=true
```

atau

```
Access-Control-Allow-Origin=http://www.yoursite.com
Access-Control-Allow-Credentials=true
```

Konfigurasi yang kurang aman adalah mengonfigurasi server backend Anda untuk mengizinkan CORS dari semua subdomain situs Anda menggunakan ekspresi reguler. Jika penyerang dapat [mengambil alih subdomain](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/10-Test_for_Subdomain_Takeover) (yang tidak biasa terjadi pada layanan cloud), konfigurasi CORS Anda akan memungkinkan mereka untuk melewati kebijakan asal yang sama dan memalsukan permintaan dengan header kustom Anda. ## Menangani Serangan CSRF Sisi Klien (PENTING)

[CSRF sisi klien](https://soheilkhodayari.github.io/same-site-wiki/docs/attacks/csrf.html#client-side-csrf) adalah varian baru serangan CSRF di mana penyerang mengelabui kode JavaScript sisi klien untuk mengirim permintaan HTTP palsu ke situs target yang rentan dengan memanipulasi parameter input program. CSRF sisi klien muncul ketika program JavaScript menggunakan input yang dikendalikan penyerang, seperti URL, untuk menghasilkan permintaan HTTP asinkron.

**Catatan:** Varian CSRF ini sangat penting karena dapat melewati beberapa tindakan pencegahan anti-CSRF umum seperti [mitigasi berbasis token](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#token-based-mitigation) dan [cookie SameSite](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute). Misalnya, saat [token sinkronisasi](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#synchronizer-token-pattern) atau [header permintaan HTTP khusus](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#use-of-custom-request-headers) digunakan, program JavaScript akan menyertakannya dalam permintaan asinkron. Selain itu, peramban web akan menyertakan kuki dalam konteks permintaan situs yang sama yang dimulai oleh program JavaScript, sehingga menghindari [kebijakan kuki SameSite](https://soheilkhodayari.github.io/same-site-wiki/docs/policies/overview.html).

**Sisi Klien vs. CSRF Klasik:** Dalam model CSRF klasik, program sisi server merupakan komponen yang paling rentan, karena tidak dapat membedakan apakah permintaan autentikasi yang masuk dilakukan **dengan sengaja**, yang juga dikenal sebagai masalah deputi yang membingungkan. Dalam model CSR sisi klien, komponen yang paling rentan adalah program JavaScript sisi klien karena penyerang dapat menggunakannya untuk menghasilkan permintaan asinkron yang sewenang-wenang dengan memanipulasi titik akhir permintaan dan/atau parameternya. CSRF sisi klien disebabkan oleh masalah validasi input dan memperkenalkan kembali kelemahan deputi yang membingungkan, yaitu, sisi server tidak akan dapat membedakan apakah permintaan dilakukan dengan sengaja atau tidak. Untuk informasi lebih lanjut tentang kerentanan CSRF sisi klien, lihat Bagian 2 dan 5 dari [makalah](https://www.usenix.org/system/files/sec21-khodayari.pdf) ini, [bab CSRF](https://soheilkhodayari.github.io/same-site-wiki/docs/attacks/csrf.html) dari [wiki SameSite](https://soheilkhodayari.github.io/same-site-wiki), dan [postingan ini](https://www.facebook.com/notes/facebook-bug-bounty/client-side-csrf/2056804174333798/) oleh [Program Meta Bug Bounty](https://www.facebook.com/whitehat).

### Contoh CSRF Sisi Klien

Potongan kode berikut menunjukkan contoh sederhana kerentanan CSRF sisi klien.

```html
<script type="text/javascript">
    var csrf_token = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    function ajaxLoad(){
        // process the URL hash fragment
        let hash_fragment = window.location.hash.slice(1);

        // hash fragment should be of the format: /^(get|post);(.*)$/
        // e.g., https://site.com/index/#post;/profile
        if(hash_fragment.length > 0 && hash_fragment.indexOf(';') > 0 ){

            let params = hash_fragment.match(/^(get|post);(.*)$/);
            if(params && params.length){
                let request_method = params[1];
                let request_endpoint = params[3];

                fetch(request_endpoint, {
                    method: request_method,
                    headers: {
                        'XSRF-TOKEN': csrf_token,
                        // [...]
                    },
                    // [...]
                }).then(response => { /* [...] */ });
            }
        }
    }
    // trigger the async request on page load
    window.onload = ajaxLoad();
 </script>
```

**Kerentanan:** Dalam cuplikan ini, program memanggil fungsi `ajaxLoad()` saat halaman dimuat, yang bertanggung jawab untuk memuat berbagai elemen halaman web. Fungsi tersebut membaca nilai [fragmen hash URL](https://developer.mozilla.org/en-US/docs/Web/API/Location/hash) (baris 4), dan mengekstrak dua bagian informasi darinya (yaitu, metode permintaan dan titik akhir) untuk menghasilkan permintaan HTTP asinkron (baris 11-13). Kerentanan terjadi pada baris 15-22, saat program JavaScript menggunakan fragmen URL untuk mendapatkan titik akhir sisi server untuk permintaan HTTP asinkron (baris 15) dan metode permintaan. Namun, kedua masukan tersebut dapat dikontrol oleh penyerang web, yang dapat memilih nilai pilihan mereka, dan membuat URL berbahaya yang berisi muatan serangan.

**Serangan:** Biasanya, penyerang membagikan URL berbahaya kepada korban (melalui elemen seperti email spear-phishing) dan karena URL berbahaya tersebut tampaknya berasal dari situs web yang jujur ​​dan bereputasi baik (tetapi rentan), pengguna sering kali mengekliknya. Atau, penyerang dapat membuat halaman serangan untuk menyalahgunakan API browser (misalnya, API [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)) dan mengelabui JavaScript yang rentan dari halaman target untuk mengirim permintaan HTTP, yang sangat mirip dengan model serangan serangan CSRF klasik.

Untuk contoh CSRF sisi klien yang lebih banyak, lihat [postingan ini](https://www.facebook.com/notes/facebook-bug-bounty/client-side-csrf/2056804174333798/) oleh [Program Meta Bug Bounty](https://www.facebook.com/whitehat) dan [makalah](https://www.usenix.org/system/files/sec21-khodayari.pdf) Keamanan USENIX ini.

### Teknik Mitigasi CSRF Sisi Klien

**Permintaan Independen:** CSRF sisi klien dapat dicegah jika permintaan asinkron tidak dapat dibuat melalui input yang dapat dikontrol penyerang, seperti [URL](https://developer.mozilla.org/en-US/docs/Web/API/Window/location), [nama jendela](https://developer.mozilla.org/en-US/docs/Web/API/Window/name), [perujuk dokumen](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer), dan [postMessages](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), untuk menyebutkan beberapa contoh saja.

**Validasi Input:** Mencapai isolasi lengkap antara input dan parameter permintaan mungkin tidak selalu memungkinkan, tergantung pada konteks dan fungsionalitas. Dalam kasus ini, pemeriksaan validasi input harus diterapkan. Pemeriksaan ini harus benar-benar menilai format dan pilihan nilai parameter permintaan dan memutuskan apakah parameter tersebut hanya dapat digunakan dalam operasi yang tidak mengubah status (misalnya, hanya mengizinkan permintaan GET dan titik akhir yang dimulai dengan awalan yang telah ditetapkan sebelumnya).

**Data Permintaan yang Telah Ditetapkan Sebelumnya:** Teknik mitigasi lainnya adalah menyimpan daftar data permintaan yang telah ditetapkan sebelumnya dan aman dalam kode JavaScript (misalnya, kombinasi titik akhir, metode permintaan, dan parameter lain yang aman untuk diputar ulang). Program tersebut kemudian dapat menggunakan parameter switch dalam fragmen URL untuk memutuskan entri daftar mana yang harus digunakan setiap fungsi JavaScript.

## Teknik Pertahanan Mendalam

### SameSite (Atribut Cookie)

SameSite adalah atribut cookie (mirip dengan HTTPOnly, Secure, dll.) yang bertujuan untuk memitigasi serangan CSRF. Hal ini didefinisikan dalam [RFC6265bis](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7). Atribut ini membantu browser memutuskan apakah akan mengirim cookie bersama dengan permintaan lintas situs. Nilai yang mungkin untuk atribut ini adalah `Lax`, `Strict`, atau `None`.

Nilai Strict akan mencegah cookie dikirim oleh browser ke situs target dalam semua konteks penelusuran lintas situs, bahkan saat mengikuti tautan biasa. Misalnya, jika situs web seperti GitHub menggunakan nilai Strict, pengguna GitHub yang login yang mencoba mengikuti tautan ke proyek GitHub pribadi yang diposting di forum diskusi perusahaan atau email, pengguna tidak akan dapat mengakses proyek tersebut karena GitHub tidak akan menerima cookie sesi. Karena situs web bank tidak akan mengizinkan halaman transaksi apa pun untuk ditautkan dari situs eksternal, maka tanda Strict akan paling sesuai untuk bank.

Jika situs web ingin mempertahankan sesi login pengguna setelah pengguna masuk dari tautan eksternal, nilai Lax default SameSite menyediakan keseimbangan yang wajar antara keamanan dan kegunaan. Jika skenario GitHub di atas menggunakan nilai Lax, cookie sesi akan diizinkan saat mengikuti tautan reguler dari situs web eksternal sambil memblokirnya dalam metode permintaan yang rentan terhadap CSRF seperti POST. Hanya permintaan lintas situs yang diizinkan dalam mode Lax yang memiliki navigasi tingkat atas dan menggunakan metode HTTP [aman](https://tools.ietf.org/html/rfc7231#section-4.2.1). Untuk detail lebih lanjut tentang nilai `SameSite`, periksa [bagian](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7.1) berikut dari [rfc](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02).

Contoh kuki yang menggunakan atribut ini:

```text
Set-Cookie: JSESSIONID=xxxxx; SameSite=Strict
Set-Cookie: JSESSIONID=xxxxx; SameSite=Lax
```

Semua peramban desktop dan hampir semua peramban seluler kini mendukung atribut `SameSite`. Untuk melacak peramban yang menerapkannya dan mengetahui cara penggunaan atribut tersebut, rujuk ke [layanan](https://caniuse.com/#feat=same-site-cookie-attribute) berikut. Perhatikan bahwa Chrome telah [mengumumkan](https://blog.chromium.org/2019/10/developers-get-ready-for-new.html) bahwa mereka akan menandai kuki sebagai `SameSite=Lax` secara default mulai dari Chrome 80 (akan dirilis pada Februari 2020), dan Firefox serta Edge berencana untuk mengikutinya. Selain itu, tanda `Secure` akan diperlukan untuk kuki yang ditandai sebagai `SameSite=None`.

Penting untuk dicatat bahwa atribut ini harus diimplementasikan sebagai konsep _pertahanan berlapis_ tambahan. Atribut ini melindungi pengguna melalui browser yang mendukungnya, dan juga berisi 2 cara untuk melewatinya seperti yang disebutkan dalam [bagian](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7.1) berikut. Atribut ini tidak boleh menggantikan Token CSRF. Sebaliknya, atribut ini harus ada bersamaan dengan token tersebut untuk melindungi pengguna dengan cara yang lebih kuat.

### Menggunakan Header Standar untuk Memverifikasi Asal

Ada dua langkah untuk metode mitigasi ini, yang keduanya memeriksa nilai header permintaan HTTP:

1. Tentukan asal permintaan (asal sumber). Dapat dilakukan melalui header Asal atau Referer. 2. Menentukan asal permintaan (target asal).

Di sisi server, kami memverifikasi apakah keduanya cocok. Jika cocok, kami menerima permintaan tersebut sebagai sah (artinya permintaan asal yang sama) dan jika tidak, kami membuang permintaan tersebut (artinya permintaan tersebut berasal dari lintas domain). Keandalan pada header ini berasal dari fakta bahwa header tersebut tidak dapat diubah secara terprogram karena header tersebut termasuk dalam daftar [forbidden headers](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name), yang berarti hanya browser yang dapat mengaturnya.

#### Mengidentifikasi Asal Sumber (melalui Origin/Referer Header)

##### Memeriksa Origin Header

Jika header Origin ada, verifikasi bahwa nilainya cocok dengan target asal. Tidak seperti referer, header Origin akan ada dalam permintaan HTTP yang berasal dari URL HTTPS.

##### Memeriksa Header Referer jika Header Origin Tidak Ada

Jika header Origin tidak ada, verifikasi bahwa nama host di header Referer cocok dengan origin target. Metode mitigasi CSRF ini juga umum digunakan dengan permintaan yang tidak diautentikasi, seperti permintaan yang dibuat sebelum menetapkan status sesi, yang diperlukan untuk melacak token sinkronisasi.

Dalam kedua kasus, pastikan pemeriksaan origin target kuat. Misalnya, jika situs Anda adalah `example.org` pastikan `example.org.attacker.com` tidak lolos pemeriksaan origin Anda (yaitu, cocokkan dengan / setelah origin untuk memastikan Anda cocok dengan seluruh origin).

Jika tidak ada header ini yang ada, Anda dapat menerima atau memblokir permintaan. Kami sarankan untuk **memblokir**. Atau, Anda mungkin ingin mencatat semua kejadian tersebut, memantau kasus penggunaan/perilakunya, lalu mulai memblokir permintaan hanya setelah Anda merasa cukup yakin.

#### Mengidentifikasi Origin Target

Umumnya, tidak selalu mudah untuk menentukan asal target. Anda tidak selalu dapat dengan mudah mengambil asal target (yaitu, nama host dan port `#`) dari URL dalam permintaan, karena server aplikasi sering kali berada di belakang satu atau beberapa proxy. Ini berarti bahwa URL asli dapat berbeda dari URL yang sebenarnya diterima oleh server aplikasi. Namun, jika server aplikasi Anda diakses langsung oleh penggunanya, maka menggunakan asal di URL tidak masalah dan Anda sudah siap.

Jika Anda berada di belakang proxy, ada sejumlah opsi yang perlu dipertimbangkan.

- **Konfigurasikan aplikasi Anda untuk mengetahui asal targetnya:** Karena itu adalah aplikasi Anda, Anda dapat menemukan asal targetnya dan menetapkan nilai tersebut dalam beberapa entri konfigurasi server. Ini akan menjadi pendekatan yang paling aman karena ditentukan oleh sisi server, jadi ini adalah nilai yang tepercaya. Namun, ini mungkin bermasalah untuk dipertahankan jika aplikasi Anda diterapkan di banyak tempat, misalnya, pengembangan, pengujian, QA, produksi, dan mungkin beberapa instans produksi. Menetapkan nilai yang benar untuk setiap situasi ini mungkin sulit, tetapi jika Anda dapat melakukannya melalui beberapa konfigurasi pusat dan memberi instans Anda kemampuan untuk mengambil nilai darinya, itu bagus! (**Catatan:** Pastikan penyimpanan konfigurasi terpusat dipelihara dengan aman karena bagian utama pertahanan CSRF Anda bergantung padanya.)
- **Gunakan nilai header Host:** Jika Anda ingin aplikasi Anda menemukan targetnya sendiri sehingga tidak perlu dikonfigurasi untuk setiap instans yang diterapkan, kami sarankan untuk menggunakan keluarga header Host. Header Host dimaksudkan untuk memuat asal target permintaan. Namun, jika server aplikasi Anda berada di belakang proxy, nilai header Host kemungkinan besar diubah oleh proxy ke asal target URL di belakang proxy, yang berbeda dari URL asli. Asal header Host yang dimodifikasi ini tidak akan cocok dengan asal sumber di header Origin atau Referer asli. - **Gunakan nilai header X-Forwarded-Host:** Untuk menghindari kemungkinan proxy akan mengubah header host, Anda dapat menggunakan header lain yang disebut X-Forwarded-Host untuk memuat nilai header Host asli yang diterima proxy. Sebagian besar proxy akan meneruskan nilai header Host asli di header X-Forwarded-Host. Jadi nilai di X-Forwarded-Host kemungkinan besar adalah nilai asal target yang perlu Anda bandingkan dengan asal sumber di header Origin atau Referer.

Menggunakan nilai header ini untuk mitigasi akan berfungsi dengan baik saat header origin atau referrer ada dalam permintaan. Meskipun header ini disertakan **sebagian besar** waktu, ada beberapa kasus penggunaan di mana header ini tidak disertakan (sebagian besar karena alasan yang sah untuk melindungi privasi pengguna/untuk menyesuaikan dengan ekosistem browser).

**Kasus penggunaan saat X-Forward-Host tidak digunakan:**

- Dalam contoh setelah [pengalihan 302 lintas asal](https://stackoverflow.com/questions/22397072/are-there-any-browsers-that-set-the-origin-header-to-null-for-privacy-sensitiv), Asal tidak disertakan dalam permintaan yang dialihkan karena itu dapat dianggap sebagai informasi sensitif yang tidak boleh dikirim ke asal lainnya.
- Ada beberapa [konteks privasi](https://wiki.mozilla.org/Security/Origin#Privacy-Sensitive_Contexts) di mana Asal ditetapkan ke "null". Misalnya, lihat yang berikut [di sini](https://www.google.com/search?q=origin+header+sent+null+value+site%3Astackoverflow.com&oq=origin+header+sent+null+value+site%3Astackoverflow.com). - Header asal disertakan untuk semua permintaan lintas asal, tetapi untuk permintaan asal yang sama, di sebagian besar browser, header ini hanya disertakan dalam POST/DELETE/PUT **Catatan:** Meskipun tidak ideal, banyak pengembang menggunakan permintaan GET untuk melakukan operasi perubahan status.
- Header referer tidak terkecuali. Ada beberapa kasus penggunaan di mana header referrer dihilangkan juga ([1](https://stackoverflow.com/questions/6880659/in-what-cases-will-http-referer-be-empty), [2](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer), [3](https://en.wikipedia.org/wiki/HTTP_referer#Referer_hiding), [4](https://seclab.stanford.edu/websec/csrf/csrf.pdf) dan [5](https://www.google.com/search?q=referrer+header+sent+null+value+site:stackoverflow.com)). Penyeimbang beban, proksi, dan perangkat jaringan tertanam juga terkenal menghapus header referrer karena alasan privasi dalam pencatatannya.

Biasanya, persentase kecil lalu lintas termasuk dalam kategori di atas ([1-2%](http://homakov.blogspot.com/2012/04/playing-with-referer-origin-disquscom.html)) dan tidak ada perusahaan yang ingin kehilangan lalu lintas ini. Salah satu teknik populer yang digunakan di Internet untuk membuat teknik ini lebih mudah digunakan adalah dengan menerima permintaan jika Origin/referrer cocok dengan daftar domain yang Anda konfigurasikan "ATAU" nilai null (Contoh [di sini](http://homakov.blogspot.com/2012/04/playing-with-referer-origin-disquscom.html). Nilai null dimaksudkan untuk menutupi kasus-kasus khusus yang disebutkan di atas di mana header ini tidak dikirim). Harap perhatikan bahwa, penyerang dapat mengeksploitasi ini tetapi orang lebih suka menggunakan teknik ini sebagai tindakan pertahanan menyeluruh karena upaya kecil yang diperlukan untuk menyebarkannya. #### Menggunakan Cookie dengan Awalan Host untuk Mengidentifikasi Asal

Meskipun atribut `SameSite` dan `Secure` yang disebutkan sebelumnya membatasi pengiriman cookie yang telah ditetapkan
dan `HttpOnly` membatasi pembacaan cookie yang ditetapkan,
seorang penyerang mungkin masih mencoba untuk menyuntikkan atau menimpa cookie yang diamankan
(lih. [serangan fiksasi sesi](http://www.acrossecurity.com/papers/session_fixation.pdf)).

Menggunakan `Awalan Cookie` untuk cookie dengan token CSRF juga memperluas perlindungan keamanan terhadap serangan semacam ini.

Jika cookie memiliki awalan `__Host-` misalnya `Set-Cookie: __Host-token=RANDOM; path=/; Secure` maka setiap cookie:

- Tidak dapat (ditimpa)ditulis dari subdomain lain dan
- tidak dapat memiliki atribut `Domain`.
- Harus memiliki path `/`.
- Harus ditandai sebagai Aman (yaitu, tidak dapat dikirim melalui HTTP yang tidak terenkripsi).

Selain awalan `__Host-`, awalan `__Secure-` yang lebih lemah juga didukung oleh vendor peramban.

Ini melonggarkan pembatasan pada penimpaan domain, yaitu, domain tersebut

- Dapat memiliki atribut `Domain` dan
- dapat ditimpa oleh subdomain.

- Dapat memiliki `Path` selain `/`.

Varian yang longgar ini dapat digunakan sebagai alternatif untuk awalan `__Host-` yang "terkunci domain",
jika pengguna yang diautentikasi perlu mengunjungi (sub-)domain yang berbeda.

Dalam semua kasus lainnya, disarankan untuk menggunakan awalan `__Host-` sebagai tambahan pada atribut `SameSite`.

Per Juli 2020, awalan kuki [didukung oleh semua peramban utama](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Browser_compatibility).

Lihat [Jaringan Pengembang Mozilla](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives) dan [Draf IETF](https://tools.ietf.org/html/draft-west-cookie-prefixes-05) untuk informasi lebih lanjut tentang awalan kuki.

### Pertahanan CSRF Berbasis Interaksi Pengguna

Meskipun semua teknik yang dirujuk di sini tidak memerlukan interaksi pengguna, terkadang lebih mudah atau lebih tepat untuk melibatkan pengguna dalam transaksi guna mencegah operasi yang tidak sah (dipalsukan melalui CSRF atau lainnya). Berikut ini adalah beberapa contoh teknik yang dapat bertindak sebagai pertahanan CSRF yang kuat jika diterapkan dengan benar.

- Mekanisme Autentikasi Ulang
- Token Sekali Pakai

JANGAN gunakan CAPTCHA karena dirancang khusus untuk melindungi dari bot. Dimungkinkan, dan masih berlaku dalam beberapa implementasi CAPTCHA, untuk memperoleh bukti interaksi/kehadiran manusia dari sesi pengguna yang berbeda. Meskipun hal ini membuat eksploitasi CSRF lebih rumit, hal ini tidak melindungi darinya.

Meskipun ini adalah pertahanan CSRF yang sangat kuat, hal ini dapat menciptakan dampak yang signifikan pada pengalaman pengguna. Dengan demikian, pertahanan ini umumnya hanya digunakan untuk operasi keamanan yang kritis (seperti perubahan kata sandi, transfer uang, dll.), bersama dengan pertahanan lain yang dibahas dalam lembar contekan ini.

## Kemungkinan Kerentanan CSRF dalam Formulir Login

Sebagian besar pengembang cenderung mengabaikan kerentanan CSRF pada formulir login karena mereka berasumsi bahwa CSRF tidak akan berlaku pada formulir login karena pengguna tidak diautentikasi pada tahap tersebut, namun asumsi ini tidak selalu benar. Kerentanan CSRF masih dapat terjadi pada formulir login di mana pengguna tidak diautentikasi, tetapi dampak dan risikonya berbeda.

Misalnya, jika penyerang menggunakan CSRF untuk mengambil identitas korban target yang diautentikasi di situs web belanja menggunakan akun penyerang, dan korban kemudian memasukkan informasi kartu kredit mereka, penyerang mungkin dapat membeli barang menggunakan detail kartu korban yang tersimpan. Untuk informasi lebih lanjut tentang CSRF login dan risiko lainnya, lihat bagian 3 dari makalah [ini](https://seclab.stanford.edu/websec/csrf/csrf.pdf).

CSRF login dapat dikurangi dengan membuat pra-sesi (sesi sebelum pengguna diautentikasi) dan menyertakan token dalam formulir login. Anda dapat menggunakan salah satu teknik yang disebutkan di atas untuk membuat token. Ingat bahwa pra-sesi tidak dapat ditransisikan ke sesi nyata setelah pengguna diautentikasi - sesi harus dihancurkan dan sesi baru harus dibuat untuk menghindari [serangan fiksasi sesi](http://www.acrossecurity.com/papers/session_fixation.pdf). Teknik ini dijelaskan dalam [Pertahanan Kuat untuk Pemalsuan Permintaan Lintas Situs bagian 4.1](https://seclab.stanford.edu/websec/csrf/csrf.pdf). CSRF login juga dapat dikurangi dengan menyertakan header permintaan khusus dalam permintaan AJAX seperti yang dijelaskan [di atas](#employing-custom-request-headers-for-ajaxapi). ## REFERENSI: Contoh Filter JEE yang Mendemonstrasikan Perlindungan CSRF

[Filter web JEE](https://github.com/righettod/poc-csrf/blob/master/src/main/java/eu/righettod/poccsrf/filter/CSRFValidationFilter.java) berikut menyediakan contoh referensi untuk beberapa konsep yang dijelaskan dalam lembar contekan ini. Ini mengimplementasikan mitigasi stateless berikut ([OWASP CSRFGuard](https://github.com/aramrami/OWASP-CSRFGuard), mencakup pendekatan stateful).

- Memverifikasi asal yang sama dengan header standar
- Cookie pengiriman ganda
- Atribut cookie SameSite

**Harap diperhatikan** bahwa ini hanya contoh referensi dan tidak lengkap (misalnya: tidak memiliki blok untuk mengarahkan aliran kontrol saat pemeriksaan asal dan header rujukan berhasil, juga tidak memiliki validasi tingkat port/host/protokol untuk header rujukan). Pengembang disarankan untuk membangun mitigasi lengkap mereka di atas contoh referensi ini. Pengembang juga harus menerapkan mekanisme autentikasi dan otorisasi sebelum memeriksa apakah CSRF dianggap efektif.

Sumber lengkapnya terletak [di sini](https://github.com/righettod/poc-csrf) dan menyediakan POC yang dapat dijalankan.

## JavaScript: Menyertakan Token CSRF Secara Otomatis sebagai Header Permintaan AJAX

Panduan berikut untuk JavaScript secara default menganggap metode **GET**, **HEAD**, dan **OPTIONS** sebagai operasi yang aman. Oleh karena itu, panggilan AJAX metode **GET**, **HEAD**, dan **OPTIONS** tidak perlu ditambahkan dengan header token CSRF. Namun, jika kata kerja digunakan untuk melakukan operasi perubahan status, kata kerja tersebut juga akan memerlukan header token CSRF (meskipun ini merupakan praktik yang buruk, dan harus dihindari).

Metode **POST**, **PUT**, **PATCH**, dan **DELETE**, yang merupakan kata kerja perubahan status, harus memiliki token CSRF yang dilampirkan ke permintaan. Panduan berikut akan menunjukkan cara membuat penggantian di pustaka JavaScript agar token CSRF disertakan secara otomatis dengan setiap permintaan AJAX untuk metode perubahan status yang disebutkan di atas.

### Menyimpan Nilai Token CSRF di DOM

Token CSRF dapat disertakan dalam tag `<meta>` seperti yang ditunjukkan di bawah ini. Semua panggilan berikutnya di halaman dapat mengekstrak token CSRF dari tag `<meta>` ini. Token tersebut juga dapat disimpan dalam variabel JavaScript atau di mana saja di DOM. Namun, tidak disarankan untuk menyimpan token CSRF dalam cookie atau penyimpanan lokal browser.

Cuplikan kode berikut dapat digunakan untuk menyertakan token CSRF sebagai tag `<meta>`:

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

Sintaksis yang tepat untuk mengisi atribut konten akan bergantung pada bahasa pemrograman backend aplikasi web Anda.

### Mengganti Default untuk Mengatur Header Kustom

Beberapa pustaka JavaScript memungkinkan Anda mengganti pengaturan default untuk menambahkan header secara otomatis ke semua permintaan AJAX.

#### XMLHttpRequest (JavaScript Asli)

Metode open() XMLHttpRequest dapat diganti untuk mengatur header `anti-csrf-token` setiap kali metode `open()` dipanggil berikutnya. Fungsi `csrfSafeMethod()` yang didefinisikan di bawah ini akan menyaring metode HTTP yang aman dan hanya menambahkan header ke metode HTTP yang tidak aman.

Ini dapat dilakukan seperti yang ditunjukkan dalam cuplikan kode berikut:

```html
<script type="text/javascript">
    var csrf_token = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS)$/.test(method));
    }
    var o = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(){
        var res = o.apply(this, arguments);
        var err = new Error();
        if (!csrfSafeMethod(arguments[0])) {
            this.setRequestHeader('anti-csrf-token', csrf_token);
        }
        return res;
    };
 </script>
```

#### AngularJS

AngularJS memungkinkan pengaturan header default untuk operasi HTTP. Dokumentasi lebih lanjut dapat ditemukan di dokumentasi AngularJS untuk [$httpProvider](https://docs.angularjs.org/api/ng/provider/$httpProvider#defaults).

```html
<script>
    var csrf_token = document.querySelector("meta[name='csrf-token']").getAttribute("content");

    var app = angular.module("app", []);

    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.post["anti-csrf-token"] = csrf_token;
        $httpProvider.defaults.headers.put["anti-csrf-token"] = csrf_token;
        $httpProvider.defaults.headers.patch["anti-csrf-token"] = csrf_token;
        // AngularJS does not create an object for DELETE and TRACE methods by default, and has to be manually created.
        $httpProvider.defaults.headers.delete = {
            "Content-Type" : "application/json;charset=utf-8",
            "anti-csrf-token" : csrf_token
        };
        $httpProvider.defaults.headers.trace = {
            "Content-Type" : "application/json;charset=utf-8",
            "anti-csrf-token" : csrf_token
        };
      }]);
 </script>
```

Potongan kode ini telah diuji dengan AngularJS versi 1.7.7.

#### Axios

[Axios](https://github.com/axios/axios) memungkinkan kita untuk mengatur header default untuk tindakan POST, PUT, DELETE dan PATCH.

```html
<script type="text/javascript">
    var csrf_token = document.querySelector("meta[name='csrf-token']").getAttribute("content");

    axios.defaults.headers.post['anti-csrf-token'] = csrf_token;
    axios.defaults.headers.put['anti-csrf-token'] = csrf_token;
    axios.defaults.headers.delete['anti-csrf-token'] = csrf_token;
    axios.defaults.headers.patch['anti-csrf-token'] = csrf_token;

    // Axios does not create an object for TRACE method by default, and has to be created manually.
    axios.defaults.headers.trace = {}
    axios.defaults.headers.trace['anti-csrf-token'] = csrf_token
</script>
```

Potongan kode ini telah diuji dengan Axios versi 0.18.0.

#### JQuery

JQuery mengekspos API yang disebut `$.ajaxSetup()` yang dapat digunakan untuk menambahkan header `anti-csrf-token` ke permintaan AJAX. Dokumentasi API untuk `$.ajaxSetup()` dapat ditemukan di sini. Fungsi `csrfSafeMethod()` yang didefinisikan di bawah ini akan menyaring metode HTTP yang aman dan hanya menambahkan header ke metode HTTP yang tidak aman.

Anda dapat mengonfigurasi jQuery untuk secara otomatis menambahkan token ke semua header permintaan dengan mengadopsi potongan kode berikut. Ini memberikan perlindungan CSRF yang sederhana dan mudah untuk aplikasi berbasis AJAX Anda:

```html
<script type="text/javascript">
    var csrf_token = $('meta[name="csrf-token"]').attr('content');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("anti-csrf-token", csrf_token);
            }
        }
    });
</script>
```

Potongan kode ini telah diuji dengan jQuery versi 3.3.1.

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah serangan Pemalsuan Permintaan Lintas Situs:

### 1. Gunakan Token Anti-CSRF
- Sertakan token CSRF yang unik dan tidak dapat diprediksi dalam semua permintaan yang mengubah status (misalnya, pengiriman formulir).
- Verifikasi sisi server token sebelum memproses permintaan.

### 2. Terapkan Cookie SameSite
- Tetapkan cookie dengan atribut `SameSite` untuk mencegahnya dikirim dengan permintaan lintas asal.
- Gunakan `SameSite=Strict` atau `SameSite=Lax` jika sesuai.

### 3. Validasi Header HTTP Referer atau Origin
- Periksa header `Referer` atau `Origin` untuk memastikan permintaan berasal dari domain tepercaya.
- Ketahui batasan dan teknik bypass potensial untuk header ini.

### 4. Memerlukan Autentikasi Pengguna untuk Tindakan Sensitif
- Terapkan pemeriksaan autentikasi sebelum mengizinkan operasi perubahan status kritis.
- Pastikan sesi kedaluwarsa dan autentikasi ulang untuk tindakan berisiko tinggi.

### 5. Gunakan Metode Aman untuk Permintaan Perubahan Status
- Memerlukan metode HTTP `POST` untuk tindakan yang mengubah status server.
- Hindari penggunaan permintaan `GET` untuk tindakan yang menyebabkan efek samping.

### 6. Batasi Kebijakan CORS
- Konfigurasikan Cross-Origin Resource Sharing (CORS) untuk mengizinkan permintaan hanya dari domain tepercaya.
- Hindari penggunaan pengaturan CORS yang terlalu permisif (misalnya, `Access-Control-Allow-Origin: *`).

### 7. Aktifkan Kebijakan Keamanan Konten (CSP)
- Gunakan CSP untuk membatasi pemuatan skrip dan sumber daya eksternal.
- Kurangi CSRF secara tidak langsung dengan mengurangi risiko skrip berbahaya yang dijalankan di browser pengguna.

### 8. Hindari Penggunaan Kredensial yang Diisi Otomatis
- Jangan mengisi kredensial atau informasi sensitif secara otomatis ke dalam formulir yang ditampilkan di halaman.
- Andalkan tindakan pengguna yang eksplisit untuk autentikasi dan pengiriman formulir.

### 9. Catat dan Pantau Aktivitas yang Mencurigakan
- Catat permintaan yang gagal atau tidak biasa yang mungkin mengindikasikan adanya upaya CSRF.
- Gunakan alat pemantauan untuk mendeteksi pola aktivitas berbahaya.

### 10. Edukasi Pengembang tentang Risiko CSRF
- Latih pengembang untuk mengidentifikasi dan mencegah kerentanan CSRF selama proses pengodean.
- Gabungkan strategi mitigasi CSRF ke dalam alur kerja pengembangan.

### 11. Uji Kerentanan CSRF
- Lakukan pengujian penetrasi dan pemindaian otomatis secara berkala untuk mengidentifikasi risiko CSRF.
- Validasi efektivitas mitigasi dengan alat seperti OWASP ZAP atau Burp Suite.

### 12. Hindari Penyematan Tindakan Sensitif dalam Konten Pihak Ketiga
- Cegah fungsi sensitif disematkan dalam iframe dengan menggunakan header `X-Frame-Options`.
- Gunakan perintah `frame-ancestors` dalam CSP untuk kontrol tambahan.

## Referensi dalam Lembar Contekan Terkait

### CSRF

- [Pemalsuan Permintaan Lintas Situs OWASP (CSRF)](https://owasp.org/www-community/attacks/csrf)
- [Akademi Keamanan Web PortSwigger](https://portswigger.net/web-security/csrf)
- [Lembar Contekan Keamanan Web Mozilla](https://infosec.mozilla.org/guidelines/web_security#csrf-prevention)
- [Kesalahpahaman Umum tentang Pencegahan CSRF](https://medium.com/keylogged/common-csrf-prevention-misconceptions-67fd026d94a8)
- [Pertahanan Kuat untuk Pemalsuan Permintaan Lintas Situs](https://seclab.stanford.edu/websec/csrf/csrf.pdf)
- Untuk Java: OWASP [CSRF Guard](https://owasp.org/www-project-csrfguard/) atau [Spring Security](https://docs.spring.io/spring-security/site/docs/5.5.x-SNAPSHOT/reference/html5/#csrf)
- Untuk PHP dan Apache: [Proyek CSRFProtector](https://github.com/OWASP/www-project-csrfprotector )
- Untuk AngularJS: [Perlindungan Pemalsuan Permintaan Lintas Situs (XSRF)](https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `