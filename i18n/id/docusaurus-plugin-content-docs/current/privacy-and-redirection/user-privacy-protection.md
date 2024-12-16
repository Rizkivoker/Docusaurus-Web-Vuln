---
sidebar_position: 2
---

# Perlindungan Privasi Pengguna

## Pendahuluan tentang Perlindungan Privasi Pengguna

Lembar contekan OWASP ini memperkenalkan metode mitigasi yang dapat digunakan pengembang web untuk melindungi pengguna mereka dari berbagai macam potensi ancaman dan agresi yang mungkin mencoba merusak privasi dan anonimitas mereka. Lembar contekan ini berfokus pada ancaman privasi dan anonimitas yang mungkin dihadapi pengguna dengan menggunakan layanan daring, terutama dalam konteks seperti jejaring sosial dan platform komunikasi.

## Pedoman

### Kriptografi yang Kuat

Setiap platform daring yang menangani identitas pengguna, informasi pribadi, atau komunikasi harus diamankan dengan penggunaan kriptografi yang kuat. Komunikasi pengguna harus dienkripsi dalam transit dan penyimpanan. Rahasia pengguna seperti kata sandi juga harus dilindungi menggunakan algoritma hashing yang kuat dan tahan benturan dengan faktor kerja yang meningkat, untuk mengurangi risiko kredensial yang terekspos serta kontrol integritas yang tepat.

Untuk melindungi data saat transit, pengembang harus menggunakan dan mematuhi praktik terbaik TLS/SSL seperti sertifikat terverifikasi, kunci privat yang dilindungi secara memadai, penggunaan sandi yang kuat saja, peringatan yang informatif dan jelas bagi pengguna, serta panjang kunci yang memadai. Data privat harus dienkripsi dalam penyimpanan menggunakan kunci dengan panjang yang memadai dan dalam kondisi akses yang ketat, baik teknis maupun prosedural. Kredensial pengguna harus di-hash terlepas dari apakah kredensial tersebut dienkripsi dalam penyimpanan atau tidak. Untuk panduan terperinci tentang kriptografi yang kuat dan praktik terbaik, baca referensi OWASP berikut:

1. **Cryptographic Storage Cheat Sheet**
2. **Authentication Cheat Sheet**
3. **Transport Layer Security Cheat Sheet**
4. **Guide to Cryptography**

### Support HTTP Strict Transport Security

HTTP Strict Transport Security (HSTS) adalah header HTTP yang ditetapkan oleh server yang menunjukkan kepada agen pengguna bahwa hanya koneksi aman (HTTPS) yang diterima, yang meminta agen pengguna untuk mengubah semua tautan HTTP yang tidak aman ke HTTPS, dan memaksa agen pengguna yang patuh untuk melakukan fail-safe dengan menolak koneksi TLS/SSL yang tidak dipercaya oleh pengguna.

HSTS memiliki dukungan rata-rata pada agen pengguna populer, seperti Mozilla Firefox dan Google Chrome. Meskipun demikian, HSTS tetap sangat berguna bagi pengguna yang selalu takut terhadap mata-mata dan Serangan Man in the Middle.

Jika tidak praktis untuk memaksakan HSTS pada semua pengguna, pengembang web setidaknya harus memberi pengguna pilihan untuk mengaktifkannya jika mereka ingin memanfaatkannya.

Untuk detail lebih lanjut mengenai HSTS, silakan kunjungi:

1. [HTTP Strict Transport Security di Wikipedia](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security).

2. [IETF untuk HSTS RFC](https://tools.ietf.org/html/rfc6797).

3. [OWASP Appsec Tutorial Series - Episode 4: Strict Transport Security](http://www.youtube.com/watch?v=zEV3HOuM_Vw).

### Penyematan Sertifikat Digital

Penyematan Sertifikat adalah praktik pengodean keras atau penyimpanan serangkaian informasi yang telah ditetapkan sebelumnya (biasanya hash) untuk sertifikat digital/kunci publik di agen pengguna (baik itu peramban web, aplikasi seluler, atau plugin peramban) sehingga hanya sertifikat/kunci publik yang telah ditetapkan sebelumnya yang digunakan untuk komunikasi yang aman, dan semua yang lain akan gagal, bahkan jika pengguna mempercayai (secara implisit atau eksplisit) sertifikat/kunci publik lainnya.

Beberapa keuntungan penyematan adalah:

- Jika terjadi kompromi CA, di mana CA yang dikompromikan yang dipercaya oleh pengguna dapat menerbitkan sertifikat untuk domain apa pun, yang memungkinkan pelaku kejahatan untuk menguping pengguna.

- Di lingkungan tempat pengguna dipaksa untuk menerima CA root yang berpotensi berbahaya, seperti lingkungan perusahaan atau skema PKI nasional.

- Dalam aplikasi tempat target demografi mungkin tidak memahami peringatan sertifikat, dan cenderung hanya mengizinkan sertifikat yang tidak valid.

Untuk detail mengenai penyematan sertifikat, silakan lihat berikut ini:

1. **Lembar Contekan Penyematan Sertifikat OWASP**
2. [Ekstensi Penyematan Kunci Publik untuk HTTP RFC](https://tools.ietf.org/html/rfc7469).
3. [Mengamankan saluran SSL terhadap serangan man-in-the-middle: Teknologi masa depan - Keamanan Transportasi Ketat HTTP dan Penyematan Sertifikat, oleh Tobias Gondrom](https://owasp.org/www-pdf-archive/OWASP_defending-MITMA_APAC2012.pdf).

### Mode Panik

Mode panik adalah mode yang dapat digunakan pengguna yang terancam saat mereka berada di bawah ancaman langsung untuk mengungkapkan kredensial akun.

Memberikan pengguna kemampuan untuk membuat mode panik dapat membantu mereka bertahan dari ancaman ini, terutama di wilayah yang bergejolak di seluruh dunia. Sayangnya, banyak pengguna di seluruh dunia yang rentan terhadap jenis ancaman yang tidak diketahui atau diperhitungkan oleh sebagian besar pengembang web.

Contoh mode panik adalah mode di mana pengguna yang tertekan dapat menghapus data mereka saat ada ancaman, masuk ke kotak masuk/akun/sistem palsu, atau memanggil pemicu untuk mencadangkan/mengunggah/menyembunyikan data sensitif.

Mode panik yang tepat untuk diterapkan berbeda-beda, bergantung pada jenis aplikasinya. Perangkat lunak enkripsi disk seperti VeraCrypt dapat menerapkan mode panik yang memulai partisi sistem palsu jika pengguna memasukkan kata sandi yang bermasalah.

Penyedia email dapat menerapkan mode panik yang menyembunyikan email atau kontak sensitif yang telah ditetapkan sebelumnya, sehingga hanya dapat membaca pesan email yang tidak berbahaya, biasanya seperti yang ditetapkan oleh pengguna, sekaligus mencegah mode panik mengambil alih akun yang sebenarnya.

Catatan penting tentang mode panik adalah mode tersebut tidak boleh mudah ditemukan, jika memang ditemukan. Musuh yang berada dalam mode panik korban tidak boleh memiliki cara apa pun, atau sesedikit mungkin kemungkinan, untuk mengetahui kebenaran. Ini berarti bahwa setelah berada dalam mode panik, sebagian besar operasi normal yang tidak sensitif harus diizinkan untuk dilanjutkan (seperti mengirim atau menerima email), dan mode panik lebih lanjut harus dapat dibuat dari dalam mode panik asli (Jika musuh mencoba membuat mode panik pada mode panik korban dan gagal, musuh akan tahu bahwa mereka sudah berada dalam mode panik, dan mungkin mencoba untuk menyakiti korban).

Solusi lainnya adalah mencegah mode panik dibuat dari akun pengguna, dan sebagai gantinya membuatnya sedikit lebih sulit untuk dipalsukan oleh musuh. Misalnya, mode panik hanya dapat dibuat di Luar Jaringan, dan musuh tidak boleh mengetahui bahwa mode panik sudah ada untuk akun tertentu tersebut.

Penerapan mode panik harus selalu bertujuan untuk membingungkan musuh dan mencegah mereka mengakses akun/data sensitif korban yang sebenarnya, serta mencegah ditemukannya mode panik yang ada untuk akun tertentu.

Untuk detail lebih lanjut mengenai mode sistem operasi tersembunyi VeraCrypt, silakan lihat:

- [Sistem Operasi Tersembunyi VeraCrypt](https://www.veracrypt.fr/en/Hidden%20Operating%20System.html).

### Pembatalan Sesi Jarak Jauh

Jika peralatan pengguna hilang, dicuri atau disita, atau dicurigai terjadi pencurian cookie; mungkin sangat bermanfaat bagi pengguna untuk dapat melihat sesi daring mereka saat ini dan memutus/membatalkan sesi mencurigakan yang masih ada, terutama yang berasal dari perangkat yang dicuri atau disita. Pembatalan sesi jarak jauh juga dapat membantu jika pengguna menduga bahwa detail sesi mereka dicuri dalam serangan Man-in-the-Middle.

Untuk detail mengenai manajemen sesi, silakan lihat:

- **OWASP Session Management Cheat Sheet**

### Izinkan Koneksi dari Jaringan Anonimitas

Jaringan anonimitas, seperti Tor Project, memberi pengguna di wilayah yang bergejolak di seluruh dunia kesempatan emas untuk lolos dari pengawasan, mengakses informasi, atau menembus hambatan sensor. Lebih sering daripada tidak, aktivis di wilayah yang bermasalah menggunakan jaringan tersebut untuk melaporkan ketidakadilan atau mengirim informasi tanpa sensor ke seluruh dunia, terutama media seperti jejaring sosial, situs web streaming media, dan penyedia email.

Pengembang web dan administrator jaringan harus mengupayakan setiap cara untuk memungkinkan pengguna mengakses layanan dari balik jaringan tersebut, dan setiap kebijakan yang dibuat terhadap jaringan anonimitas tersebut perlu dievaluasi ulang secara cermat sehubungan dengan dampaknya terhadap orang-orang di seluruh dunia.

Jika memungkinkan, pengembang aplikasi harus mencoba mengintegrasikan atau mengaktifkan penggabungan mudah aplikasi mereka dengan jaringan anonimitas ini, seperti mendukung proksi SOCKS atau pustaka integrasi (misalnya OnionKit untuk Android).

Untuk informasi lebih lanjut tentang jaringan anonimitas, dan perlindungan pengguna yang mereka berikan, silakan lihat:

1. [The Tor Project](https://www.torproject.org).

2. [I2P Network](http://www.i2p2.de).

3. [OnionKit: Tingkatkan Keamanan Jaringan dan Enkripsi di Aplikasi Android Anda](https://github.com/guardianproject/OnionKit).

### Mencegah Kebocoran Alamat IP

Mencegah kebocoran alamat IP pengguna sangat penting saat perlindungan pengguna diterapkan. Aplikasi apa pun yang menghosting konten pihak ketiga eksternal, seperti avatar, tanda tangan, atau lampiran foto; harus mempertimbangkan manfaat yang memungkinkan pengguna untuk memblokir konten pihak ketiga agar tidak dimuat di halaman aplikasi.

Jika memungkinkan untuk menyematkan gambar domain eksternal pihak ketiga, misalnya, di umpan atau linimasa pengguna; penyerang dapat menggunakannya untuk menemukan alamat IP asli korban dengan menghostingnya di domainnya dan mengawasi permintaan HTTP untuk gambar tersebut.

Banyak aplikasi web memerlukan konten pengguna untuk beroperasi, dan ini sepenuhnya dapat diterima sebagai proses bisnis; namun pengembang web disarankan untuk mempertimbangkan memberi pengguna opsi untuk memblokir konten eksternal sebagai tindakan pencegahan. Ini berlaku terutama untuk jejaring sosial dan forum, tetapi dapat juga berlaku untuk email berbasis web, tempat gambar dapat disematkan dalam email berformat HTML.

Masalah serupa terjadi pada email berformat HTML yang berisi gambar pihak ketiga, namun sebagian besar klien dan penyedia email memblokir pemuatan konten pihak ketiga secara default; memberikan pengguna privasi dan perlindungan anonimitas yang lebih baik.

### Kejujuran & Transparansi

Jika aplikasi web tidak dapat memberikan perlindungan hukum atau politik yang cukup kepada pengguna, atau jika aplikasi web tidak dapat mencegah penyalahgunaan atau pengungkapan informasi sensitif seperti log, kebenaran harus diberitahukan kepada pengguna dalam bentuk yang jelas dan mudah dipahami, sehingga pengguna dapat membuat pilihan yang tepat tentang apakah mereka harus menggunakan layanan tertentu atau tidak.

Jika tidak melanggar hukum, beri tahu pengguna jika informasi mereka diminta untuk dihapus atau diselidiki oleh entitas eksternal.

Kejujuran sangat penting dalam menumbuhkan budaya kepercayaan antara aplikasi web dan penggunanya, dan memungkinkan banyak pengguna di seluruh dunia untuk mempertimbangkan pilihan mereka dengan hati-hati, mencegah kerugian bagi pengguna di berbagai wilayah yang berbeda di seluruh dunia.

Wawasan lebih lanjut tentang pencatatan yang aman dapat ditemukan di:

- **OWASP Logging Cheat Sheet**

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah perlindungan privasi pengguna yang rentan:

### 1. Minimalkan Pengumpulan Data
- Kumpulkan hanya data penting yang diperlukan untuk fungsionalitas aplikasi.
- Hindari pengumpulan informasi pribadi yang tidak perlu yang dapat digunakan untuk mengidentifikasi individu.

### 2. Anonimkan atau Pseudonimkan Data Pengguna
- Gunakan teknik anonimisasi atau pseudonimisasi untuk mengaburkan identitas pengguna dalam data yang tersimpan.
- Pastikan bahwa meskipun data dikompromikan, data tersebut tidak dapat dilacak kembali ke pengguna individu.

### 3. Enkripsi Data Pribadi
- Gunakan enkripsi yang kuat untuk melindungi data pengguna yang sensitif saat tidak aktif dan saat transit.
- Terapkan standar enkripsi seperti AES untuk data saat tidak aktif dan TLS untuk data saat transit.

### 4. Terapkan Kontrol Akses yang Kuat
- Batasi akses ke data pengguna yang sensitif berdasarkan peran dan izin.
- Terapkan prinsip hak istimewa paling rendah untuk memastikan bahwa hanya personel yang berwenang yang dapat mengakses data pribadi.

### 5. Audit Log Akses Data Secara Berkala
- Pantau dan catat akses ke data pengguna yang sensitif untuk tujuan audit dan akuntabilitas.
- Tinjau log secara berkala untuk mendeteksi akses yang tidak sah atau aktivitas yang mencurigakan.

### 6. Berikan Kontrol dan Persetujuan Data Pengguna
- Izinkan pengguna untuk mengontrol visibilitas dan pembagian data pribadi mereka.
- Terapkan mekanisme persetujuan yang jelas untuk memberi tahu pengguna tentang praktik pengumpulan dan penggunaan data.

### 7. Tawarkan Opsi Penghapusan dan Retensi Data
- Izinkan pengguna untuk menghapus akun dan data pribadi mereka atas permintaan.
- Tetapkan kebijakan retensi data yang jelas untuk memastikan bahwa data pribadi tidak disimpan lebih lama dari yang diperlukan.

### 8. Tutupi atau Redaksi Informasi Sensitif
- Tutupi atau redaksi data sensitif (misalnya, nomor kartu kredit, kata sandi) saat menampilkannya di antarmuka pengguna.
- Pastikan bahwa informasi sensitif tidak secara tidak sengaja terekspos dalam log, laporan, atau pesan kesalahan.

### 9. Gunakan Autentikasi Pengguna yang Aman
- Terapkan mekanisme autentikasi pengguna yang kuat, seperti autentikasi multifaktor (MFA).
- Pastikan kata sandi di-hash dan disimpan dengan aman, dan wajibkan pembaruan kata sandi secara berkala.

### 10. Lakukan Penilaian Dampak Privasi
- Lakukan penilaian dampak privasi secara berkala untuk mengidentifikasi potensi risiko terhadap privasi pengguna.
- Atasi risiko privasi dan terapkan strategi mitigasi sebagai bagian dari proses pengembangan.

### 11. Enkripsi Saluran Komunikasi
- Gunakan protokol komunikasi yang aman seperti HTTPS dan TLS untuk melindungi data yang dipertukarkan antara pengguna dan server.
- Cegah serangan Man-in-the-Middle (MitM) dengan memastikan semua data yang dikirim dienkripsi.

### 12. Batasi Pembagian Data Pihak Ketiga
- Hindari pembagian data pengguna dengan pihak ketiga kecuali benar-benar diperlukan, dan pastikan penyedia pihak ketiga mematuhi standar privasi.
- Terapkan perjanjian pembagian data yang ketat dan evaluasi kebijakan privasi pihak ketiga.

### 13. Edukasi Pengguna tentang Praktik Privasi
- Berikan kebijakan privasi yang jelas kepada pengguna dan jelaskan cara penggunaan data mereka.
- Tawarkan sumber daya edukasi untuk membantu pengguna membuat keputusan yang tepat tentang berbagi data mereka.

### 14. Terapkan Privasi Berdasarkan Desain
- Gabungkan perlindungan privasi ke dalam desain sistem dan siklus pengembangan.
- Pastikan pertimbangan privasi menjadi prioritas di setiap tahap proses pengembangan perangkat lunak.

### 15. Jaga Sistem dan Perangkat Lunak Tetap Terkini
- Lakukan patch dan perbarui sistem, perangkat lunak, dan kerangka kerja secara berkala untuk memperbaiki kerentanan yang dapat dieksploitasi untuk membahayakan privasi pengguna.
- Terapkan pembaruan keamanan otomatis untuk sistem penting guna meminimalkan risiko paparan.

### 16. Patuhi Peraturan Privasi
- Pastikan kepatuhan terhadap undang-undang dan peraturan privasi, seperti GDPR, CCPA, dan HIPAA.
- Pantau perubahan dalam undang-undang privasi dan sesuaikan praktik privasi sebagaimana mestinya.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `