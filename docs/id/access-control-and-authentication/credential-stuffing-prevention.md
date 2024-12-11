---
sidebar_position: 4
---

# Pencegahan Credential Stuffing

## Pengenalan Pencegahan Credential Stuffing 

Cheatsheet ini mencakup pertahanan terhadap dua jenis serangan terkait otentikasi yang umum: credential stuffing dan password spraying. Meskipun ini adalah serangan yang terpisah dan berbeda, dalam banyak kasus pertahanan yang akan diterapkan untuk melindungi terhadap mereka adalah sama, dan mereka juga akan efektif dalam melindungi terhadap serangan brute-force.  Ringkasan dari berbagai serangan ini tercantum di bawah ini:

| Attack Type | Description |
|-------------|-------------|
| Brute Force | Testing multiple passwords from dictionary or other source against a single account. |
| Credential Stuffing | Testing username/password pairs obtained from the breach of another site. |
| Password Spraying | Testing a single weak password against a large number of different accounts.|

## Autentikasi Multi-Faktor

[Autentikasi multi-faktor (MFA)](Multifactor_Authentication_Cheat_Sheet.md) adalah pertahanan terbaik sejauh ini terhadap sebagian besar serangan terkait kata sandi, termasuk pengisian kredensial dan penyemprotan kata sandi, dengan analisis oleh Microsoft yang menunjukkan bahwa hal itu akan menghentikan [99,9% kompromi akun](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Your-Pa-word-doesn-t-matter/ba-p/731984). Oleh karena itu, hal ini harus diterapkan di mana pun memungkinkan. Secara historis, tergantung pada audiens aplikasi, mungkin tidak praktis atau layak untuk menerapkan penggunaan MFA, namun dengan browser modern dan perangkat seluler yang kini mendukung FIDO2 Passkeys dan bentuk MFA lainnya, hal ini dapat dicapai untuk sebagian besar kasus penggunaan.

Untuk menyeimbangkan keamanan dan kegunaan, otentikasi multi-faktor dapat digabungkan dengan teknik lain untuk memerlukan faktor kedua hanya dalam keadaan tertentu di mana ada alasan untuk mencurigai bahwa upaya login mungkin tidak sah, seperti login dari:

- Browser/perangkat atau alamat IP baru.
- Negara atau lokasi yang tidak biasa.
- Negara-negara tertentu yang dianggap tidak tepercaya atau biasanya tidak memiliki pengguna layanan.
- Alamat IP yang muncul di daftar penolakan yang dikenal atau terkait dengan layanan anonimisasi, seperti layanan proxy atau VPN. Alamat IP yang muncul di daftar penolakan yang dikenal atau terkait dengan layanan anonimisasi, seperti layanan proxy atau VPN.
- Alamat IP yang telah mencoba masuk ke beberapa akun.
- Upaya login yang tampaknya telah diprogram atau berasal dari bot daripada manusia (i.e. large login volume sourced from a single IP or subnet).

Atau sebuah organisasi dapat memilih untuk memerlukan MFA dalam bentuk autentikasi "step-up" untuk skenario di atas selama sesi yang dikombinasikan dengan permintaan untuk aktivitas berisiko tinggi seperti:

- Transaksi mata uang besar
- Perubahan konfigurasi yang bersifat istimewa atau administratif

Selain itu, untuk aplikasi perusahaan, rentang IP tepercaya yang dikenal dapat ditambahkan ke daftar putih sehingga MFA tidak diperlukan ketika pengguna terhubung dari rentang ini.

## Pertahanan Alternatif

Di mana tidak mungkin untuk menerapkan MFA, ada banyak pertahanan alternatif yang dapat digunakan untuk melindungi terhadap credential stuffing dan password spraying. Secara terpisah, tidak ada satu pun dari ini yang seefektif MFA, namun pertahanan berlapis yang beragam dapat memberikan tingkat perlindungan yang wajar. Dalam banyak kasus, mekanisme ini juga akan melindungi terhadap serangan brute-force atau password spraying.

Di mana sebuah aplikasi memiliki beberapa peran pengguna, mungkin tepat untuk menerapkan pertahanan yang berbeda untuk peran yang berbeda. Misalnya, mungkin tidak praktis untuk menerapkan MFA untuk semua pengguna, tetapi seharusnya memungkinkan untuk mewajibkan semua administrator menggunakannya.

## Pertahanan Berlapis & Metrik

Meskipun bukan teknik spesifik, penting untuk menerapkan pertahanan yang mempertimbangkan dampak dari pertahanan individu yang dikalahkan atau gagal.  Sebagai contoh, pertahanan sisi klien, seperti fingerprinting perangkat atau tantangan JavaScript, dapat dipalsukan atau dilewati dan lapisan pertahanan lainnya harus diterapkan untuk mengatasi hal ini.

Selain itu, setiap pertahanan harus menghasilkan metrik volume untuk digunakan sebagai mekanisme deteksi. Idealnya, metrik tersebut akan mencakup volume serangan yang terdeteksi dan yang telah diminimalkan serta memungkinkan penyaringan pada bidang seperti alamat IP.  Memantau dan melaporkan metrik ini dapat mengidentifikasi kegagalan pertahanan atau keberadaan serangan yang tidak teridentifikasi, serta dampak dari pertahanan baru atau yang ditingkatkan.

Akhirnya, ketika administrasi berbagai pertahanan dilakukan oleh beberapa tim, harus diperhatikan agar ada komunikasi dan koordinasi ketika tim yang terpisah melakukan pemeliharaan, penyebaran, atau memodifikasi pertahanan individu.

### Kata Sandi Sekunder, PIN, dan Pertanyaan Keamanan

Selain meminta pengguna untuk memasukkan kata sandi mereka saat melakukan otentikasi, pengguna juga dapat diminta untuk memberikan informasi keamanan tambahan seperti:

- PIN
- Karakter tertentu dari kata sandi sekunder atau kata yang mudah diingat
- Jawaban untuk [pertanyaan keamanan](Memilih_dan_Menggunakan_Pertanyaan_Keamanan_Cheat_Sheet.md)

Harus ditekankan bahwa ini **tidak** merupakan autentikasi multi-faktor. (as both factors are the same - something you know). Namun, ini masih dapat memberikan lapisan perlindungan yang berguna terhadap baik credential stuffing maupun password spraying di mana MFA yang tepat tidak dapat diterapkan.

### CAPTCHA

Mewajibkan pengguna untuk menyelesaikan "Completely Automated Public Turing test to tell Computers and Humans Apart" (CAPTCHA) atau teka-teki serupa untuk setiap upaya login dapat membantu mengidentifikasi serangan otomatis/bot dan membantu mencegah upaya login otomatis, serta dapat memperlambat serangan pengisian kredensial atau penyemprotan kata sandi.  Namun, CAPTCHA tidak sempurna, dan dalam banyak kasus terdapat alat atau layanan yang dapat digunakan untuk memecahkannya dengan tingkat keberhasilan yang cukup tinggi.  Memantau tingkat penyelesaian CAPTCHA dapat membantu mengidentifikasi dampak terhadap pengguna yang baik, serta teknologi pemecahan CAPTCHA otomatis, yang mungkin ditunjukkan oleh tingkat penyelesaian yang tidak normal tinggi.

Untuk meningkatkan kegunaan, mungkin diinginkan untuk hanya meminta pengguna menyelesaikan CAPTCHA ketika permintaan login dianggap mencurigakan atau berisiko tinggi, menggunakan kriteria yang sama yang dibahas di bagian MFA.

### Mitigasi IP dan Intelijen

Memblokir alamat IP mungkin cukup untuk menghentikan serangan yang kurang canggih, tetapi tidak boleh digunakan sebagai pertahanan utama karena kemudahan dalam menghindarinya.  Lebih efektif untuk memiliki respons bertahap terhadap penyalahgunaan yang memanfaatkan berbagai langkah pertahanan tergantung pada berbagai faktor serangan.

Setiap proses atau keputusan untuk mengurangi (termasuk pemblokiran dan CAPTCHA) lalu lintas pengisian kredensial dari alamat IP harus mempertimbangkan berbagai skenario penyalahgunaan, dan tidak bergantung pada batas volume yang dapat diprediksi tunggal.  Periode waktu pendek (misalnya, lonjakan) dan periode waktu panjang harus dipertimbangkan, serta volume permintaan tinggi dan kasus di mana satu alamat IP, kemungkinan besar bekerja sama dengan _banyak_ alamat IP lainnya, menghasilkan volume lalu lintas yang rendah tetapi konsisten.  Selain itu, keputusan mitigasi harus mempertimbangkan faktor-faktor seperti klasifikasi alamat IP (misalnya: residensial vs hosting) dan geolokasi.  Faktor-faktor ini dapat dimanfaatkan untuk menaikkan atau menurunkan ambang batas mitigasi guna mengurangi dampak potensial pada pengguna yang sah atau lebih agresif dalam mengatasi penyalahgunaan yang berasal dari sumber yang tidak normal.  Mitigasi, terutama memblokir alamat IP, harus bersifat sementara dan proses harus ada untuk menghapus alamat IP dari keadaan mitigasi saat penyalahgunaan menurun atau berhenti.

Banyak toolkit credential stuffing, seperti [Sentry MBA](https://federalnewsnetwork.com/wp-content/uploads/2020/06/Shape-Threat-Research-Automating-Cybercrime-with-SentryMBA.pdf), menawarkan penggunaan jaringan proxy bawaan untuk mendistribusikan permintaan ke sejumlah besar alamat IP unik.  Ini dapat mengalahkan baik daftar blokir IP maupun pembatasan laju, karena volume permintaan IP mungkin tetap relatif rendah, bahkan pada serangan dengan volume tinggi.  Mengorelasikan lalu lintas otentikasi dengan proxy dan intelijen alamat IP serupa, serta rentang alamat IP penyedia hosting dapat membantu mengidentifikasi serangan pengisian kredensial yang sangat terdistribusi, serta berfungsi sebagai pemicu mitigasi.  Misalnya, setiap permintaan yang berasal dari penyedia hosting dapat diharuskan untuk menyelesaikan CAPTCHA.

Ada sumber intelijen dan klasifikasi alamat IP baik publik maupun komersial yang dapat dimanfaatkan sebagai sumber data untuk tujuan ini.  Selain itu, beberapa penyedia hosting menerbitkan ruang alamat IP mereka sendiri, seperti [AWS](https://docs.aws.amazon.com/vpc/latest/userguide/aws-ip-ranges.html).

Terpisah dari memblokir koneksi jaringan, pertimbangkan untuk menyimpan riwayat otentikasi alamat IP akun.  Jika alamat IP terbaru ditambahkan ke daftar blokir atau mitigasi, mungkin perlu untuk mengunci akun dan memberi tahu pengguna.

### Pengenalan Perangkat

Selain alamat IP, ada sejumlah faktor berbeda yang dapat digunakan untuk mencoba mengenali perangkat. Beberapa di antaranya dapat diperoleh secara pasif oleh server dari header HTTP (terutama header "User-Agent"), termasuk:

- Sistem operasi & versi
- Browser & versi
- Bahasa

Menggunakan JavaScript, dimungkinkan untuk mengakses jauh lebih banyak informasi, seperti:

- Resolusi layar
- Font yang terpasang
- Plugin browser yang terpasang

Menggunakan berbagai atribut ini, dimungkinkan untuk membuat sidik jari perangkat. Sidik jari ini kemudian dapat dicocokkan dengan browser mana pun yang mencoba masuk ke akun, dan jika tidak cocok, pengguna dapat diminta untuk melakukan autentikasi tambahan. Banyak pengguna akan memiliki beberapa perangkat atau browser yang mereka gunakan, jadi tidak praktis untuk hanya memblokir upaya yang tidak cocok dengan sidik jari yang ada, namun umum untuk mendefinisikan proses bagi pengguna atau pelanggan untuk melihat riwayat perangkat mereka dan mengelola perangkat yang diingat.  Selain itu, atribut-atribut ini dapat digunakan untuk mendeteksi aktivitas anomalus seperti perangkat yang tampaknya menjalankan versi OS atau Browser yang lebih lama.

Perpustakaan JavaScript [fingerprintjs2](https://github.com/Valve/fingerprintjs2) dapat digunakan untuk melakukan fingerprinting sisi klien.

Perlu dicatat bahwa karena semua informasi ini disediakan oleh klien, informasi tersebut berpotensi dipalsukan oleh penyerang. Dalam beberapa kasus, menipu atribut-atribut ini sangat mudah (seperti header "User-Agent"), tetapi dalam kasus lain mungkin lebih sulit untuk memodifikasi atribut-atribut ini.

### Pemalsuan Koneksi

Mirip dengan fingerprinting perangkat, ada banyak teknik fingerprinting yang tersedia untuk koneksi jaringan.  Beberapa contohnya termasuk [JA3](https://github.com/salesforce/ja3), fingerprinting HTTP/2, dan urutan header HTTP.  Karena teknik-teknik ini biasanya berfokus pada bagaimana sebuah koneksi dibuat, penandaan sidik jari koneksi mungkin memberikan hasil yang lebih akurat daripada pertahanan lain yang bergantung pada indikator, seperti alamat IP, atau data permintaan, seperti string agen pengguna.

Pencetakan sidik jari koneksi juga dapat digunakan bersamaan dengan pertahanan lainnya untuk memastikan kebenaran permintaan otentikasi.  Misalnya, jika header user agent dan sidik jari perangkat menunjukkan perangkat seluler, tetapi sidik jari koneksi menunjukkan skrip Python, permintaan tersebut kemungkinan mencurigakan.

### Memerlukan Nama Pengguna yang Tidak Dapat Diprediksi

Serangan credential stuffing bergantung tidak hanya pada penggunaan kembali kata sandi di berbagai situs, tetapi juga pada penggunaan kembali nama pengguna. Sebagian besar situs web menggunakan alamat email sebagai nama pengguna, dan karena sebagian besar pengguna hanya memiliki satu alamat email yang mereka gunakan untuk semua akun mereka, kombinasi alamat email dan kata sandi ini sangat efektif untuk serangan credential stuffing.

Mewajibkan pengguna untuk membuat nama pengguna mereka sendiri saat mendaftar di situs web membuatnya lebih sulit bagi penyerang untuk mendapatkan pasangan nama pengguna dan kata sandi yang valid untuk serangan credential stuffing, karena banyak daftar kredensial yang tersedia hanya mencakup alamat email. Memberikan pengguna nama pengguna yang dihasilkan dapat memberikan tingkat perlindungan yang lebih tinggi (karena pengguna cenderung memilih nama pengguna yang sama di sebagian besar situs web), tetapi tidak ramah pengguna. Selain itu, perlu diambil langkah-langkah untuk memastikan bahwa nama pengguna yang dihasilkan tidak dapat diprediksi (seperti berdasarkan nama lengkap pengguna, atau ID numerik berurutan), karena hal ini dapat memudahkan enumerasi nama pengguna yang valid untuk serangan penyemprotan kata sandi.

### Proses Login Multi-Langkah

Mayoritas alat siap pakai dirancang untuk proses login satu langkah, di mana kredensial dikirimkan ke server melalui POST, dan responsnya menunjukkan apakah upaya login berhasil atau tidak. Dengan menambahkan langkah-langkah tambahan ke proses ini, seperti mengharuskan nama pengguna dan kata sandi dimasukkan secara berurutan, atau mengharuskan pengguna terlebih dahulu mendapatkan [CSRF Token](Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.md) acak sebelum mereka dapat login, ini membuat serangan sedikit lebih sulit dilakukan, dan menggandakan jumlah permintaan yang harus dilakukan oleh penyerang.

Proses login bertahap, bagaimanapun, harus memperhatikan agar tidak memfasilitasi [enumerasi pengguna](Authentication_Cheat_Sheet.md).  Menghimpun pengguna sebelum serangan pengisian kredensial dapat mengakibatkan serangan dengan volume permintaan yang lebih rendah dan lebih sulit diidentifikasi.

### Memerlukan JavaScript dan Memblokir Browser Tanpa Antarmuka

Sebagian besar alat yang digunakan untuk jenis serangan ini akan membuat permintaan POST langsung ke server dan membaca responsnya, tetapi tidak akan mengunduh atau mengeksekusi JavaScript yang terkandung di dalamnya. Dengan mengharuskan penyerang untuk mengevaluasi JavaScript dalam respons (misalnya untuk menghasilkan token valid yang harus disertakan dengan permintaan), ini memaksa penyerang untuk menggunakan browser nyata dengan kerangka otomatisasi seperti Selenium atau Headless Chrome, atau untuk mengimplementasikan parsing JavaScript dengan alat lain seperti PhantomJS. Selain itu, ada sejumlah teknik yang dapat digunakan untuk mengidentifikasi [Headless Chrome](https://antoinevastel.com/bot%20detection/2018/01/17/detect-chrome-headless-v2.html) atau [PhantomJS](https://blog.shapesecurity.com/2015/01/22/detecting-phantomjs-based-visitors/).

Harap dicatat bahwa memblokir pengunjung yang menonaktifkan JavaScript akan mengurangi aksesibilitas situs web, terutama bagi pengunjung yang menggunakan pembaca layar. In certain jurisdictions this may be in breach of equalities legislation.

### Degradasi

Pertahanan yang lebih agresif terhadap credential stuffing adalah dengan menerapkan langkah-langkah yang meningkatkan waktu yang dibutuhkan untuk menyelesaikan serangan tersebut.  Ini mungkin termasuk secara bertahap meningkatkan kompleksitas JavaScript yang harus dievaluasi, memperkenalkan periode tunggu yang lama sebelum merespons permintaan, mengembalikan aset HTML yang terlalu besar, atau mengembalikan pesan kesalahan yang diacak.

Karena potensi dampak negatifnya terhadap pengguna yang sah, perhatian besar harus diberikan pada jenis pertahanan ini, meskipun mungkin diperlukan untuk mengurangi serangan pengisian kredensial yang lebih canggih.

### Mengidentifikasi Kata Sandi yang Bocor

[Persyaratan Keamanan Kata Sandi ASVS v4.0](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x11-V2-Authentication.md#v21-password-security-requirements) ketentuan (2.1.7) tentang memverifikasi keberadaan kata sandi baru dalam dataset kata sandi yang telah dibobol harus diterapkan.

Ada layanan komersial dan gratis yang mungkin berguna untuk memvalidasi keberadaan kata sandi dalam pelanggaran sebelumnya.  Layanan gratis yang terkenal untuk ini adalah [Pwned Passwords](https://haveibeenpwned.com/Passwords). Anda dapat menghosting salinan aplikasi sendiri, atau menggunakan [API](https://haveibeenpwned.com/API/v2#PwnedPasswords).

### Beri tahu pengguna tentang peristiwa keamanan yang tidak biasa

Ketika aktivitas mencurigakan atau tidak biasa terdeteksi, mungkin perlu untuk memberi tahu atau memperingatkan pengguna. Namun, perlu diperhatikan agar pengguna tidak kewalahan dengan sejumlah besar notifikasi yang tidak penting bagi mereka, atau mereka akan mulai mengabaikan atau menghapusnya.  Selain itu, karena seringnya penggunaan ulang kata sandi di berbagai situs, kemungkinan bahwa akun email pengguna juga telah dikompromikan harus dipertimbangkan.

Misalnya, umumnya tidak pantas untuk memberi tahu pengguna bahwa telah ada upaya untuk masuk ke akun mereka dengan kata sandi yang salah. Namun, jika ada login dengan kata sandi yang benar, tetapi kemudian gagal pada pemeriksaan MFA berikutnya, pengguna harus diberitahu agar mereka dapat mengganti kata sandi mereka.  Selanjutnya, jika pengguna meminta beberapa reset kata sandi dari perangkat atau alamat IP yang berbeda, mungkin perlu untuk mencegah akses lebih lanjut ke akun tersebut hingga proses verifikasi pengguna lebih lanjut dilakukan.

Rincian terkait login saat ini atau terbaru juga harus ditampilkan kepada pengguna. Misalnya, ketika mereka masuk ke aplikasi, tanggal, waktu, dan lokasi dari upaya masuk mereka sebelumnya dapat ditampilkan kepada mereka. Selain itu, jika aplikasi mendukung sesi bersamaan, pengguna harus dapat melihat daftar semua sesi aktif, dan mengakhiri sesi lain yang tidak sah.

## Mitigasi

Berikut adalah daftar mitigasi yang dapat mencegah credential stuffing:

### 1. Terapkan Autentikasi Multi-Faktor (MFA)
- Memerlukan lapisan autentikasi tambahan di luar nama pengguna dan kata sandi.
- Memerlukan lapisan tambahan autentikasi di luar nama pengguna dan kata sandi. Gunakan kata sandi sekali pakai (OTP), aplikasi autentikator, atau autentikasi biometrik.
### 2. Terapkan Kebijakan Kata Sandi yang Kuat
- Mewajibkan pengguna untuk membuat kata sandi yang kompleks dengan panjang minimum dan campuran karakter.
- Mewajibkan pengguna untuk membuat kata sandi yang kompleks dengan panjang minimum dan campuran karakter. Mencegah penggunaan kata sandi yang sering bocor atau lemah dengan memeriksa terhadap basis data kata sandi yang telah dibobol.
### 3. Gunakan Pembatasan Kecepatan dan CAPTCHA
- Batasi jumlah upaya login per alamat IP atau akun dalam jangka waktu tertentu.
- Gunakan tantangan CAPTCHA setelah upaya login yang gagal untuk menggagalkan skrip otomatis.
### 4. Pantau dan Analisis Aktivitas Login
- Lacak perilaku login yang tidak biasa, seperti beberapa upaya login dari IP yang sama atau permintaan yang cepat.
- Gunakan alat pemantauan waktu nyata untuk menandai aktivitas mencurigakan.
### 5. Manfaatkan Pencetakan Sidik Jari Perangkat
- Identifikasi dan lacak perangkat untuk mendeteksi upaya login yang tidak biasa dari perangkat atau lokasi yang tidak dikenal.### 6. Terapkan Manajemen Reputasi IP
- Blokir IP yang diketahui berbahaya atau gunakan geofencing untuk membatasi akses dari daerah berisiko tinggi.
### 7. Terapkan Penguncian Akun dan Pemberitahuan
- Kunci sementara akun setelah beberapa kali percobaan login yang gagal.
- Beri tahu pengguna tentang upaya login yang gagal dan login yang berhasil dari perangkat atau lokasi baru.
### 8. Amankan Endpoint API
- Lindungi API yang menangani autentikasi dengan langkah-langkah keamanan yang kuat.
- Gunakan pembatasan laju API dan otentikasi berbasis token.
### 9. Gunakan Hashing dan Salting Kata Sandi
- Pastikan kata sandi yang disimpan di-hash menggunakan algoritma yang kuat (e.g., bcrypt, Argon2).
- Tambahkan salt pada kata sandi untuk mencegah serangan berbasis hash.
### 10. Dorong Pengguna untuk Menggunakan Pengelola Kata Sandi
- Sarankan pengguna untuk membuat dan menyimpan kata sandi unik menggunakan pengelola kata sandi.
- Edukasi pengguna tentang menghindari penggunaan ulang kata sandi di berbagai layanan.
### 11. Integrasikan Pakan Intelijen Ancaman
- Gunakan pakan intelijen untuk memblokir kredensial yang terlibat dalam pelanggaran data yang diketahui.
### 12. Edukasi Pengguna dan Karyawan
- Berikan pelatihan tentang mengenali dan mencegah serangan terkait kredensial.
- Dorong pengguna untuk segera mengganti kata sandi jika mereka mencurigai adanya kompromi.

## Referensi

- [Artikel OWASP Credential Stuffing](https://owasp.org/www-community/attacks/Credential_stuffing)
- [OWASP Ancaman Terautomasi terhadap Aplikasi Web](https://owasp.org/www-project-automated-threats-to-web-applications/)
- Proyek: [OAT-008 Credential Stuffing](https://owasp.org/www-community/attacks/Credential_stuffing), yang merupakan salah satu dari 20 ancaman yang didefinisikan dalam [OWASP Automated Threat Handbook](https://owasp.org/www-pdf-archive/Automated-threat-handbook.pdf) yang dihasilkan oleh proyek ini.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `