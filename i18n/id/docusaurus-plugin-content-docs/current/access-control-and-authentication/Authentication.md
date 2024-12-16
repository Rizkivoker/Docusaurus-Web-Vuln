---
sidebar_position: 2
---

# Autentikasi

## Pengenalan Autentikasi

**Autentikasi** adalah proses mengonfirmasi bahwa seseorang atau sistem adalah seperti yang mereka klaim, biasanya menggunakan metode seperti kata sandi, sidik jari, atau token keamanan.

**Identitas Digital** mengacu pada representasi online unik dari seorang pengguna. Ini tidak selalu terhubung kembali ke orang yang nyata.

**Identifikasi Pembuktian** memastikan bahwa seorang pengguna benar-benar siapa yang mereka klaim, menghubungkan identitas digital mereka dengan individu yang nyata.

**Manajemen Sesi** adalah proses di mana server mempertahankan status entitas yang berinteraksi dengannya. Ini diperlukan agar server dapat mengingat bagaimana bereaksi terhadap permintaan berikutnya sepanjang transaksi. Ini membantu server mengingat interaksi pengguna selama sesi, menggunakan pengenal sesi unik untuk melacak permintaan. Untuk praktik terbaik, lihat Lembar Saku Manajemen Sesi.



## Pedoman Umum Autentikasi

### ID Pengguna

Fungsi utama dari User ID adalah untuk mengidentifikasi pengguna secara unik dalam sebuah sistem. Idealnya, User ID harus dihasilkan secara acak untuk mencegah pembuatan ID yang dapat diprediksi atau berurutan, yang dapat menimbulkan risiko keamanan, terutama dalam sistem di mana User ID mungkin terekspos atau disimpulkan dari sumber eksternal.


### Nama Pengguna

Nama pengguna adalah pengenal yang mudah diingat yang dipilih oleh pengguna dan digunakan untuk mengidentifikasi diri mereka saat masuk ke sistem atau layanan. Istilah User ID dan nama pengguna mungkin digunakan secara bergantian jika nama pengguna yang dipilih oleh pengguna juga berfungsi sebagai pengidentifikasi unik mereka dalam sistem.

Pengguna harus diizinkan untuk menggunakan alamat email mereka sebagai nama pengguna, asalkan email tersebut diverifikasi selama pendaftaran. Selain itu, mereka harus memiliki opsi untuk memilih nama pengguna selain alamat email.


### Solusi Autentikasi dan Akun Sensitif

- JANGAN izinkan login dengan akun sensitif (misalnya akun yang dapat digunakan secara internal dalam solusi seperti ke back-end / middleware / DB) ke antarmuka pengguna front-end mana pun
- JANGAN gunakan metode autentikasi yang sama untuk akses aman dan publik.

### Terapkan Kontrol Kekuatan Kata Sandi yang Tepat

Salah satu kekhawatiran utama saat menggunakan kata sandi untuk autentikasi adalah kekuatan kata sandi. Kebijakan kata sandi "kuat" membuatnya sulit atau bahkan tidak mungkin bagi seseorang untuk menebak kata sandi tersebut melalui cara manual atau otomatis. Karakteristik berikut mendefinisikan kata sandi yang kuat:

- Panjang Kata Sandi
  - **Panjang minimum** dari kata sandi harus **ditegakkan** oleh aplikasi. Kata sandi yang lebih pendek dari 8 karakter dianggap lemah ([NIST SP800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)).
  - **Panjang maksimum** kata sandi harus **setidaknya 64 karakter** untuk memungkinkan frasa sandi ([NIST SP800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)). Perhatikan bahwa beberapa implementasi algoritma hashing dapat menyebabkan [serangan penolakan layanan dengan kata sandi panjang](https://www.acunetix.com/vulnerabilities/web/long-password-denial-of-service/).
- Jangan memotong kata sandi secara diam-diam. **Password Storage Cheat Sheet** memberikan panduan lebih lanjut tentang cara menangani kata sandi yang lebih panjang dari panjang maksimum.
- Izinkan penggunaan **semua** karakter termasuk unicode dan spasi. Tidak boleh ada aturan komposisi kata sandi yang membatasi jenis karakter yang diizinkan. Tidak boleh ada persyaratan untuk huruf besar atau kecil atau angka atau karakter khusus.
- Pastikan rotasi kredensial ketika terjadi kebocoran kata sandi, atau pada saat identifikasi kompromi.
- Sertakan pengukur kekuatan kata sandi untuk membantu pengguna membuat kata sandi yang lebih kompleks dan memblokir kata sandi yang umum serta yang telah dibobol sebelumnya.
    - [zxcvbn-ts library](https://github.com/zxcvbn-ts/zxcvbn) dapat digunakan untuk tujuan ini.
    - [Pwned Passwords](https://haveibeenpwned.com/Passwords) adalah layanan di mana kata sandi dapat diperiksa terhadap kata sandi yang sebelumnya telah dibobol. Anda dapat menghostingnya sendiri atau menggunakan [API](https://haveibeenpwned.com/API/v3#PwnedPasswords).

#### Untuk informasi lebih lanjut, periksa Untuk informasi lebih lanjut, periksa

- [Persyaratan Keamanan Kata Sandi ASVS v4.0](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x11-V2-Authentication.md#v21-password-security-requirements)
- [Kata Sandi Berkembang: Panduan Autentikasi untuk Era Modern](https://www.troyhunt.com/passwords-evolved-authentication-guidance-for-the-modern-era/)

### Terapkan Mekanisme Pemulihan Kata Sandi yang Aman

Adalah hal yang umum bagi sebuah aplikasi untuk memiliki mekanisme yang menyediakan cara bagi pengguna untuk mendapatkan akses ke akun mereka jika mereka lupa kata sandi mereka. Silakan lihat **Lembar Cheat Lupa Kata Sandi** untuk detail tentang fitur ini.

### Simpan Kata Sandi dengan Cara yang Aman

Sangat penting bagi sebuah aplikasi untuk menyimpan kata sandi menggunakan teknik kriptografi yang tepat. Silakan lihat **Lembar Cheat Penyimpanan Kata Sandi** untuk detail tentang fitur ini.

### Bandingkan Hash Password Menggunakan Fungsi yang Aman

Jika memungkinkan, kata sandi yang diberikan oleh pengguna harus dibandingkan dengan hash kata sandi yang disimpan menggunakan fungsi perbandingan kata sandi yang aman yang disediakan oleh bahasa atau kerangka kerja, seperti fungsi [password_verify()](https://www.php.net/manual/en/function.password-verify.php) di PHP. Jika ini tidak memungkinkan, pastikan bahwa fungsi perbandingan:

- Memiliki panjang input maksimum, untuk melindungi dari serangan penolakan layanan dengan input yang sangat panjang.
- Secara eksplisit mengatur tipe kedua variabel, untuk melindungi dari serangan kebingungan tipe seperti [Magic Hashes](https://www.whitehatsec.com/blog/magic-hashes/) di PHP.
- Mengembalikan dalam waktu konstan, untuk melindungi dari serangan waktu.

### Fitur Ganti Kata Sandi

Saat mengembangkan fitur ganti kata sandi, pastikan untuk memiliki:

- Pengguna terautentikasi dengan sesi aktif.
- Verifikasi kata sandi saat ini. Ini untuk memastikan bahwa pengguna yang sah yang sedang mengubah kata sandi. Kasus penyalahgunaan adalah sebagai berikut: seorang pengguna yang sah menggunakan komputer umum untuk masuk. Pengguna ini lupa untuk keluar. Kemudian orang lain menggunakan komputer publik ini. Jika kita tidak memverifikasi kata sandi saat ini, orang lain tersebut mungkin dapat mengubah kata sandi.

### Kirim Kata Sandi Hanya Melalui TLS atau Transportasi Kuat Lainnya

Lihat: **Lembar Cheat Keamanan Transport Layer**

Halaman login dan semua halaman terautentikasi berikutnya harus diakses secara eksklusif melalui TLS atau transportasi kuat lainnya. Gagal menggunakan TLS atau transportasi kuat lainnya untuk halaman login memungkinkan penyerang untuk memodifikasi aksi formulir login, menyebabkan kredensial pengguna diposting ke lokasi sembarangan. Gagal menggunakan TLS atau transportasi kuat lainnya untuk halaman yang telah diautentikasi setelah login memungkinkan penyerang untuk melihat ID sesi yang tidak terenkripsi dan membahayakan sesi yang telah diautentikasi pengguna.

### Memerlukan Re-autentikasi untuk Fitur Sensitif

Untuk mengurangi risiko CSRF dan pencurian sesi, penting untuk meminta kredensial terkini untuk sebuah akun sebelum memperbarui informasi akun yang sensitif seperti kata sandi atau alamat email pengguna -- atau sebelum transaksi sensitif, seperti mengirimkan pembelian ke alamat baru. Tanpa langkah pencegahan ini, seorang penyerang mungkin dapat mengeksekusi transaksi sensitif melalui serangan CSRF atau XSS tanpa perlu mengetahui kredensial akun pengguna saat ini. Selain itu, penyerang mungkin mendapatkan akses fisik sementara ke browser pengguna atau mencuri ID sesi mereka untuk mengambil alih sesi pengguna.

### Pertimbangkan Autentikasi Transaksi yang Kuat

Beberapa aplikasi harus menggunakan faktor kedua untuk memeriksa apakah pengguna dapat melakukan operasi sensitif. Untuk informasi lebih lanjut, lihat **Transaction Authorization Cheat Sheet**.

#### Autentikasi Klien TLS

Autentikasi Klien TLS, yang juga dikenal sebagai autentikasi TLS dua arah, terdiri dari browser dan server yang mengirimkan sertifikat TLS masing-masing selama proses handshake TLS. Sama seperti Anda dapat memvalidasi keaslian server dengan menggunakan sertifikat dan menanyakan kepada Otoritas Sertifikat (CA) yang dapat diverifikasi apakah sertifikat tersebut valid, server dapat mengautentikasi pengguna dengan menerima sertifikat dari klien dan memvalidasinya terhadap CA pihak ketiga atau CA miliknya sendiri. Untuk melakukan ini, server harus menyediakan pengguna dengan sertifikat yang dihasilkan khusus untuknya, menetapkan nilai pada subjek sehingga nilai-nilai ini dapat digunakan untuk menentukan pengguna mana yang harus divalidasi oleh sertifikat tersebut. Pengguna menginstal sertifikat di browser dan sekarang menggunakannya untuk situs web.

Ini adalah ide yang baik untuk melakukan ini ketika:

- Diterima (atau bahkan lebih disukai) jika pengguna hanya mengakses situs web dari satu komputer/browser saja.
- Pengguna tidak mudah takut dengan proses pemasangan sertifikat TLS di browsernya, atau akan ada seseorang, mungkin dari dukungan TI, yang akan melakukannya untuk pengguna.
- Pengguna tidak mudah takut dengan proses pemasangan sertifikat TLS di browsernya, atau akan ada seseorang, mungkin dari dukungan TI, yang akan melakukannya untuk pengguna. - Situs web tersebut memerlukan langkah keamanan tambahan. Situs web ini memerlukan langkah keamanan tambahan.
- Ini juga merupakan hal yang baik untuk digunakan ketika situs web tersebut untuk intranet perusahaan atau organisasi.

Secara umum, tidak disarankan untuk menggunakan metode ini untuk situs web yang tersedia secara luas dan publik yang akan memiliki pengguna rata-rata. Misalnya, tidak akan menjadi ide yang baik untuk menerapkan ini pada situs web seperti Facebook. Meskipun teknik ini dapat mencegah pengguna dari harus mengetikkan kata sandi (sehingga melindungi dari pencurian oleh keylogger biasa), tetap dianggap sebagai ide yang baik untuk mempertimbangkan penggunaan kombinasi kata sandi dan otentikasi klien TLS.

Selain itu, jika klien berada di belakang proxy perusahaan yang melakukan dekripsi SSL/TLS, ini akan merusak otentikasi sertifikat kecuali situs tersebut diizinkan di proxy.

Untuk informasi lebih lanjut, lihat: [TLS handshake yang diautentikasi klien](https://en.wikipedia.org/wiki/Transport_Layer_Security#Client-authenticated_TLS_handshake)

### Autentikasi dan Pesan Kesalahan

Pesan kesalahan yang diimplementasikan dengan tidak benar dalam kasus fungsionalitas otentikasi dapat digunakan untuk tujuan enumerasi ID pengguna dan kata sandi. Sebuah aplikasi harus merespons (baik HTTP maupun HTML) dengan cara yang generik.

#### Respons Autentikasi

Menggunakan salah satu mekanisme otentikasi (login, reset kata sandi, atau pemulihan kata sandi), sebuah aplikasi harus merespons dengan pesan kesalahan generik terlepas dari apakah:

- ID pengguna atau kata sandi salah.
- Akun tidak ada.
- Akun terkunci atau dinonaktifkan.

Fitur pendaftaran akun juga harus dipertimbangkan, dan pendekatan yang sama dengan pesan kesalahan generik dapat diterapkan dalam kasus di mana pengguna sudah ada.

Tujuannya adalah untuk mencegah penciptaan [faktor ketidaksesuaian](https://cwe.mitre.org/data/definitions/204.html), yang memungkinkan penyerang melakukan tindakan enumerasi pengguna terhadap aplikasi.

Menarik untuk dicatat bahwa logika bisnis itu sendiri dapat membawa faktor ketidaksesuaian terkait dengan waktu pemrosesan yang diambil. Memang, tergantung pada implementasinya, waktu pemrosesan dapat sangat berbeda menurut kasusnya (sukses vs gagal) yang memungkinkan penyerang untuk melancarkan [serangan berbasis waktu](https://en.wikipedia.org/wiki/Timing_attack). (delta of some seconds for example).

Contoh menggunakan pseudo-kode untuk fitur login:

- Implementasi pertama menggunakan pendekatan "quick exit"

```text
IF USER_EXISTS(username) THEN
    password_hash=HASH(password)
    IS_VALID=LOOKUP_CREDENTIALS_IN_STORE(username, password_hash)
    IF NOT IS_VALID THEN
        RETURN Error("Invalid Username or Password!")
    ENDIF
ELSE
   RETURN Error("Invalid Username or Password!")
ENDIF
```

Dapat dilihat dengan jelas bahwa jika pengguna tidak ada, aplikasi akan langsung mengeluarkan kesalahan. Jika tidak, ketika pengguna ada tetapi kata sandi tidak ada, jelas bahwa akan ada lebih banyak pemrosesan sebelum aplikasi menghasilkan kesalahan. Sebagai imbalannya, waktu respons akan berbeda untuk kesalahan yang sama, memungkinkan penyerang untuk membedakan antara nama pengguna yang salah dan kata sandi yang salah.

- Implementasi kedua tanpa mengandalkan pendekatan "quick exit":

```text
password_hash=HASH(password)
IS_VALID=LOOKUP_CREDENTIALS_IN_STORE(username, password_hash)
IF NOT IS_VALID THEN
   RETURN Error("Invalid Username or Password!")
ENDIF
```

Kode ini akan melalui proses yang sama terlepas dari siapa pengguna atau kata sandinya, memungkinkan aplikasi untuk kembali dalam waktu respons yang kira-kira sama.

Masalah dengan mengembalikan pesan kesalahan generik untuk pengguna adalah masalah Pengalaman Pengguna (UX). Pengguna yang sah mungkin merasa bingung dengan pesan generik tersebut, sehingga menyulitkan mereka untuk menggunakan aplikasi, dan setelah beberapa kali mencoba, mungkin akan meninggalkan aplikasi karena kompleksitasnya. Keputusan untuk mengembalikan *pesan kesalahan generik* dapat ditentukan berdasarkan tingkat kritis aplikasi dan datanya. Misalnya, untuk aplikasi kritis, tim dapat memutuskan bahwa dalam skenario kegagalan, pengguna akan selalu diarahkan ke halaman dukungan dan *pesan kesalahan umum* akan dikembalikan.

Mengenai enumerasi pengguna itu sendiri, perlindungan terhadap [serangan brute-force](#protect-against-automated-attacks) juga efektif karena mencegah penyerang menerapkan enumerasi dalam skala besar. Penggunaan [CAPTCHA](https://en.wikipedia.org/wiki/CAPTCHA) dapat diterapkan pada fitur di mana *pesan kesalahan generik* tidak dapat dikembalikan karena *pengalaman pengguna* harus dipertahankan.

##### Contoh respons yang salah dan benar

###### Masuk

Contoh respons yang salah:

- "Login untuk Pengguna foo: kata sandi tidak valid."
- "Login gagal, ID pengguna tidak valid."
- "Login gagal; akun dinonaktifkan."
- "Login gagal; pengguna ini tidak aktif."

Contoh respons yang benar:

- "Login gagal; ID pengguna atau kata sandi tidak valid."

Pemulihan kata sandi

Contoh respons yang salah:

- "Kami baru saja mengirimkan tautan untuk mengatur ulang kata sandi Anda."
- "Alamat email ini tidak ada dalam database kami."

Contoh respons yang benar:

- "Jika alamat email tersebut ada dalam database kami, kami akan mengirimkan email untuk mengatur ulang kata sandi Anda."

###### Pembuatan akun

Contoh respons yang salah:

- "ID pengguna ini sudah digunakan."
- "Selamat datang!" Anda telah mendaftar dengan sukses.

Contoh respons yang benar:

- "Tautan untuk mengaktifkan akun Anda telah dikirim ke alamat yang diberikan."

##### Kode Kesalahan dan URL

Aplikasi mungkin mengembalikan kode kesalahan [HTTP yang berbeda](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) tergantung pada respons percobaan autentikasi. Ini mungkin merespons dengan 200 untuk hasil positif dan 403 untuk hasil negatif. Meskipun halaman kesalahan generik ditampilkan kepada pengguna, kode respons HTTP mungkin berbeda yang dapat membocorkan informasi tentang apakah akun tersebut valid atau tidak.

Pengungkapan kesalahan juga dapat digunakan sebagai faktor ketidaksesuaian, konsultasikan **lembar contekan penanganan kesalahan** mengenai penanganan global berbagai kesalahan dalam aplikasi.

### Lindungi Terhadap Serangan Otomatis

Ada beberapa jenis serangan otomatis yang dapat digunakan oleh penyerang untuk mencoba dan membobol akun pengguna. Jenis yang paling umum adalah sebagai berikut:

| Attack Type | Description |
|-------------|-------------|
| Brute Force | Testing multiple passwords from a dictionary or other source against a single account. |
| Credential Stuffing | Testing username/password pairs obtained from the breach of another site. |
| Password Spraying | Testing a single weak password against a large number of different accounts.|

Berbagai mekanisme perlindungan dapat diterapkan untuk melindungi terhadap serangan-serangan ini. Dalam banyak kasus, pertahanan ini tidak memberikan perlindungan yang lengkap, tetapi ketika sejumlah dari mereka diterapkan dalam pendekatan pertahanan berlapis, tingkat perlindungan yang wajar dapat dicapai.

Bagian berikutnya akan berfokus terutama pada pencegahan serangan brute-force, meskipun kontrol ini juga dapat efektif terhadap jenis serangan lainnya. Untuk panduan lebih lanjut tentang cara melindungi diri dari serangan credential stuffing dan password spraying, lihat **Lembar Cheat Credential Stuffing**.

#### Autentikasi Multi-Faktor

Autentikasi multi-faktor (MFA) adalah pertahanan terbaik sejauh ini terhadap sebagian besar serangan terkait kata sandi, termasuk serangan brute-force, dengan analisis oleh Microsoft yang menunjukkan bahwa hal itu akan menghentikan [99,9% kompromi akun](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Your-Pa-word-doesn-t-matter/ba-p/731984). Oleh karena itu, MFA harus diterapkan di mana pun memungkinkan; namun, tergantung pada audiens aplikasi, mungkin tidak praktis atau layak untuk menegakkan penggunaan MFA.

**Multifactor Authentication Cheat Sheet** berisi panduan lebih lanjut tentang penerapan MFA.

#### Pembatasan Login

Login Throttling adalah protokol yang digunakan untuk mencegah penyerang melakukan terlalu banyak upaya menebak kata sandi melalui cara interaktif normal, termasuk:

- Jumlah maksimum percobaan.

##### Penguncian Akun

Perlindungan yang paling umum terhadap serangan ini adalah menerapkan penguncian akun, yang mencegah upaya login lebih lanjut untuk jangka waktu tertentu setelah sejumlah login gagal.

Penghitung kegagalan login harus dikaitkan dengan akun itu sendiri, bukan dengan alamat IP sumber, untuk mencegah penyerang melakukan upaya login dari sejumlah besar alamat IP yang berbeda. Ada sejumlah faktor berbeda yang harus dipertimbangkan saat menerapkan kebijakan penguncian akun untuk menemukan keseimbangan antara keamanan dan kegunaan:

- Jumlah upaya gagal sebelum akun dikunci (lockout threshold).
- Jangka waktu di mana upaya-upaya ini harus dilakukan (observation window).
- Berapa lama akun dikunci (lockout duration).

Alih-alih menerapkan durasi penguncian yang tetap (misalnya, sepuluh menit), beberapa aplikasi menggunakan penguncian eksponensial, di mana durasi penguncian dimulai sebagai periode yang sangat singkat (misalnya, satu detik), tetapi berlipat ganda setelah setiap upaya login yang gagal.

- Jumlah waktu untuk menunda setelah setiap penguncian akun (max 2-3, after that permanent account lockout).

Saat merancang sistem penguncian akun, harus diambil langkah-langkah untuk mencegahnya digunakan untuk menyebabkan penolakan layanan dengan mengunci akun pengguna lain. Salah satu cara untuk melakukannya adalah dengan memungkinkan pengguna fungsi lupa kata sandi untuk masuk, meskipun akun tersebut terkunci.

#### CAPTCHA

Penggunaan CAPTCHA yang efektif dapat membantu mencegah upaya login otomatis terhadap akun. Namun, banyak implementasi CAPTCHA memiliki kelemahan yang memungkinkan mereka diselesaikan menggunakan teknik otomatis atau dapat dialihdayakan ke layanan yang dapat menyelesaikannya. Oleh karena itu, penggunaan CAPTCHA harus dilihat sebagai kontrol pertahanan yang mendalam untuk membuat serangan brute-force lebih memakan waktu dan mahal, daripada sebagai pencegahan.

Mungkin lebih ramah pengguna jika hanya memerlukan CAPTCHA diselesaikan setelah sejumlah kecil upaya login yang gagal, daripada memerlukannya dari login pertama.

#### Pertanyaan Keamanan dan Kata yang Mudah Diingat

Penambahan pertanyaan keamanan atau kata yang mudah diingat juga dapat membantu melindungi dari serangan otomatis, terutama ketika pengguna diminta untuk memasukkan sejumlah karakter yang dipilih secara acak dari kata tersebut. Perlu dicatat bahwa ini **tidak** merupakan autentikasi multi-faktor, karena kedua faktor tersebut adalah sama. (something you know). Selain itu, pertanyaan keamanan sering kali lemah dan memiliki jawaban yang dapat diprediksi, jadi mereka harus dipilih dengan hati-hati. Lembar contekan **Memilih dan Menggunakan Pertanyaan Keamanan** berisi panduan lebih lanjut tentang hal ini.

## Pencatatan dan Pemantauan

Aktifkan pencatatan dan pemantauan fungsi autentikasi untuk mendeteksi serangan/kegagalan secara real-time.

- Pastikan bahwa semua kegagalan dicatat dan ditinjau
- Pastikan bahwa semua kegagalan kata sandi dicatat dan ditinjau
- Pastikan bahwa semua penguncian akun dicatat dan ditinjau

## Penggunaan protokol otentikasi yang tidak memerlukan kata sandi

Meskipun autentikasi melalui kombinasi nama pengguna, kata sandi, dan autentikasi multi-faktor dianggap umumnya aman, ada kasus penggunaan di mana hal ini tidak dianggap sebagai opsi terbaik atau bahkan aman. Contoh dari hal ini adalah aplikasi pihak ketiga yang ingin terhubung ke aplikasi web, baik dari perangkat seluler, situs web lain, desktop, atau situasi lainnya. Ketika ini terjadi, TIDAK dianggap aman untuk membiarkan aplikasi pihak ketiga menyimpan kombinasi pengguna/kata sandi, karena hal itu akan memperluas permukaan serangan ke tangan mereka, di mana Anda tidak memiliki kendali. Untuk kasus ini dan kasus lainnya, ada beberapa protokol otentikasi yang dapat melindungi Anda dari mengekspos data pengguna Anda kepada penyerang.

### OAuth

Open Authorization (OAuth) adalah protokol yang memungkinkan sebuah aplikasi untuk mengautentikasi terhadap server sebagai pengguna, tanpa memerlukan kata sandi atau server pihak ketiga yang bertindak sebagai penyedia identitas. Ini menggunakan token yang dihasilkan oleh server dan menyediakan bagaimana aliran otorisasi paling sering terjadi, sehingga klien, seperti aplikasi seluler, dapat memberi tahu server pengguna mana yang menggunakan layanan tersebut.

Rekomendasinya adalah menggunakan dan mengimplementasikan [OAuth 2.0](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics) karena versi pertamanya (OAuth1.0) telah ditemukan rentan terhadap session fixation.

OAuth 2.0 mengandalkan HTTPS untuk keamanan dan saat ini digunakan serta diterapkan oleh API dari perusahaan-perusahaan seperti Facebook, Google, Twitter, dan Microsoft. OAuth 1.0a lebih sulit digunakan karena memerlukan penggunaan pustaka kriptografi untuk tanda tangan digital. Namun, karena OAuth 1.0a tidak bergantung pada HTTPS untuk keamanan, ini bisa lebih cocok untuk transaksi berisiko tinggi.

### OpenId

OpenId adalah protokol berbasis HTTP yang menggunakan penyedia identitas untuk memvalidasi bahwa seorang pengguna adalah siapa yang mereka katakan. Ini adalah protokol yang sangat sederhana yang memungkinkan cara inisiasi penyedia layanan untuk single sign-on. (SSO). Ini memungkinkan pengguna untuk menggunakan kembali satu identitas yang diberikan kepada penyedia identitas OpenId yang tepercaya dan menjadi pengguna yang sama di beberapa situs web, tanpa perlu memberikan kata sandi kepada situs web mana pun, kecuali kepada penyedia identitas OpenId.

Karena kesederhanaannya dan kemampuannya dalam melindungi kata sandi, OpenId telah diadopsi dengan baik. Beberapa penyedia identitas terkenal untuk OpenId adalah Stack Exchange, Google, Facebook, dan Yahoo!

Untuk lingkungan non-perusahaan, OpenId dianggap sebagai pilihan yang aman dan sering kali lebih baik, asalkan penyedia identitasnya dapat dipercaya.

### SAML

Bahasa Markup Pernyataan Keamanan (SAML) sering dianggap bersaing dengan OpenId. Versi yang paling direkomendasikan adalah 2.0 karena sangat lengkap fitur dan menyediakan keamanan yang kuat. Seperti OpenId, SAML menggunakan penyedia identitas, tetapi tidak seperti OpenId, SAML berbasis XML dan memberikan lebih banyak fleksibilitas. SAML didasarkan pada pengalihan browser yang mengirimkan data XML. Selain itu, SAML tidak hanya diinisiasi oleh penyedia layanan; ia juga dapat diinisiasi dari penyedia identitas. Ini memungkinkan pengguna untuk menavigasi melalui berbagai portal sambil tetap terautentikasi tanpa harus melakukan apa pun, sehingga prosesnya menjadi transparan.

Sementara OpenId telah mengambil sebagian besar pasar konsumen, SAML sering menjadi pilihan untuk aplikasi perusahaan karena ada sedikit penyedia identitas OpenId yang dianggap kelas perusahaan (artinya cara mereka memvalidasi identitas pengguna tidak memenuhi standar tinggi yang diperlukan untuk identitas perusahaan). Lebih umum untuk melihat SAML digunakan di dalam situs web intranet, terkadang bahkan menggunakan server dari intranet sebagai penyedia identitas.

Dalam beberapa tahun terakhir, aplikasi seperti SAP ERP dan SharePoint (SharePoint dengan menggunakan Active Directory Federation Services 2.0) telah memutuskan untuk menggunakan autentikasi SAML 2.0 sebagai metode yang sering dipilih untuk implementasi single sign-on setiap kali federasi perusahaan diperlukan untuk layanan web dan aplikasi web.

**Lihat juga: [SAML Security Cheat Sheet]**

### FIDO

Aliansi Fast Identity Online (FIDO) telah menciptakan dua protokol untuk memfasilitasi autentikasi online: protokol Universal Authentication Framework (UAF) dan protokol Universal Second Factor (U2F). Sementara UAF berfokus pada otentikasi tanpa kata sandi, U2F memungkinkan penambahan faktor kedua pada otentikasi berbasis kata sandi yang ada. Kedua protokol tersebut didasarkan pada model tantangan-respons kriptografi kunci publik.

UAF memanfaatkan teknologi keamanan yang sudah ada pada perangkat untuk otentikasi termasuk sensor sidik jari, kamera (biometrik wajah), mikrofon (biometrik suara), Trusted Execution Environments (TEEs), Secure Elements (SEs), dan lainnya. Protokol ini dirancang untuk menghubungkan kemampuan perangkat ini ke dalam kerangka autentikasi yang umum. UAF bekerja dengan aplikasi native dan aplikasi web.

U2F meningkatkan otentikasi berbasis kata sandi menggunakan token perangkat keras (biasanya USB) yang menyimpan kunci otentikasi kriptografi dan menggunakannya untuk penandatanganan. Pengguna dapat menggunakan token yang sama sebagai faktor kedua untuk beberapa aplikasi. U2F bekerja dengan aplikasi web. Ini menyediakan **perlindungan terhadap phishing** dengan menggunakan URL situs web untuk mencari kunci otentikasi yang disimpan.

## Pengelola Kata Sandi

Pengelola kata sandi adalah program, plugin browser, atau layanan web yang mengotomatiskan pengelolaan sejumlah besar kredensial yang berbeda. Sebagian besar pengelola kata sandi memiliki fungsionalitas untuk memungkinkan pengguna menggunakannya dengan mudah di situs web, baik:
(a) dengan menempelkan kata sandi ke dalam formulir login
-- atau --
(b) dengan mensimulasikan pengguna yang mengetiknya.

Aplikasi web seharusnya tidak membuat pekerjaan pengelola kata sandi lebih sulit dari yang diperlukan dengan mengikuti rekomendasi berikut:

- Gunakan formulir HTML standar untuk input nama pengguna dan kata sandi dengan atribut `type` yang sesuai.
- Hindari halaman login berbasis plugin (such as Flash or Silverlight).
- Terapkan panjang maksimum kata sandi yang wajar, setidaknya 64 karakter, seperti yang dibahas dalam [Bagian Implementasi Kontrol Kekuatan Kata Sandi yang Tepat](#implementasi-kontrol-kekuatan-kata-sandi-yang-tepat).
- Izinkan karakter yang dapat dicetak digunakan dalam kata sandi.
- Izinkan pengguna untuk menempelkan ke dalam kolom nama pengguna, kata sandi, dan MFA.
- Izinkan pengguna untuk menavigasi antara kolom nama pengguna dan kata sandi dengan sekali tekan tombol `Tab`.

## Mengubah Alamat Email Terdaftar Pengguna

Alamat email pengguna sering berubah. Proses berikut disarankan untuk menangani situasi seperti ini dalam sebuah sistem:

*Catatan: Proses ini kurang ketat dengan [Autentikasi Multifaktor](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html), karena bukti identitas lebih kuat daripada hanya mengandalkan kata sandi.*

### Proses yang Direkomendasikan Jika Pengguna MEMILIKI [Autentikasi Multifaktor](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) Diaktifkan

1. Konfirmasi keabsahan cookie/token autentikasi pengguna. Jika tidak valid, tampilkan layar login.
2. Jelaskan proses untuk mengubah alamat email yang terdaftar kepada pengguna.
3. Minta pengguna untuk mengajukan alamat email baru yang diusulkan, memastikan bahwa alamat tersebut mematuhi aturan sistem.
4. Minta penggunaan [Autentikasi Multifaktor](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) untuk verifikasi identitas.
5. Simpan alamat email baru yang diusulkan sebagai perubahan yang tertunda.
6. Buat dan simpan **dua** nonce terbatas waktu untuk (a) pemberitahuan administrator sistem, dan (b) konfirmasi pengguna.
7. Kirim dua pesan email dengan tautan yang menyertakan nonce tersebut:

    - Sebuah **pesan email hanya untuk pemberitahuan** ke alamat saat ini, memberitahukan pengguna tentang perubahan yang akan datang dan menyediakan tautan untuk situasi yang tidak terduga.

    - Sebuah **pesan email yang memerlukan konfirmasi** ke alamat baru yang diusulkan, menginstruksikan pengguna untuk mengonfirmasi perubahan dan menyediakan tautan untuk situasi yang tidak terduga.

8. Tangani tanggapan dari tautan tersebut sesuai.

### Proses yang Direkomendasikan Jika Pengguna TIDAK MEMILIKI Autentikasi Multifaktor Diaktifkan

1. Konfirmasi keabsahan cookie/token autentikasi pengguna. Jika tidak valid, tampilkan layar login.
2. Jelaskan proses untuk mengubah alamat email yang terdaftar kepada pengguna.
3. Minta pengguna untuk mengajukan alamat email baru yang diusulkan, memastikan bahwa alamat tersebut mematuhi aturan sistem.
4. Minta kata sandi pengguna saat ini untuk verifikasi identitas.
5. Simpan alamat email baru yang diusulkan sebagai perubahan yang tertunda.
6. Buat dan simpan tiga nonce terbatas waktu untuk pemberitahuan administrator sistem, konfirmasi pengguna, dan langkah tambahan untuk ketergantungan kata sandi.
7. Kirim dua pesan email dengan tautan ke nonce tersebut:

    - Sebuah **pesan email yang memerlukan konfirmasi** ke alamat saat ini, menginstruksikan pengguna untuk mengonfirmasi perubahan dan menyediakan tautan untuk situasi yang tidak terduga.

    - Sebuah **pesan email terpisah yang memerlukan konfirmasi** ke alamat baru yang diusulkan, menginstruksikan pengguna untuk mengonfirmasi perubahan dan menyediakan tautan untuk situasi yang tidak terduga.

8. Tangani tanggapan dari tautan tersebut sesuai.

### Catatan tentang Proses di Atas

- Perlu dicatat bahwa Google mengadopsi pendekatan yang berbeda untuk akun yang hanya dilindungi oleh kata sandi -- [di mana alamat email saat ini hanya menerima email pemberitahuan](https://support.google.com/accounts/answer/55393?hl=id). Metode ini membawa risiko dan memerlukan kewaspadaan pengguna.

- Pelatihan rekayasa sosial secara rutin sangat penting. Administrator sistem dan staf help desk harus dilatih untuk mengikuti proses yang ditentukan serta mengenali dan merespons serangan rekayasa sosial. Rujuk ke [CISA's "Avoiding Social Engineering and Phishing Attacks"](https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks) untuk panduan.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `