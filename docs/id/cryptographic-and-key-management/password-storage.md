---
sidebar_position: 1
---

# Penyimpanan Kata Sandi

## Pengantar Penyimpanan Kata Sandi

Lembar contekan ini memberi tahu Anda tentang metode yang tepat untuk menyimpan kata sandi untuk autentikasi. Saat kata sandi disimpan, kata sandi tersebut harus dilindungi dari penyerang meskipun aplikasi atau basis datanya disusupi. Untungnya, sebagian besar bahasa dan kerangka kerja modern menyediakan fungsionalitas bawaan untuk membantu menyimpan kata sandi dengan aman.

Namun, setelah penyerang memperoleh hash kata sandi yang tersimpan, mereka selalu dapat melakukan brute force hash secara offline. Pembela dapat memperlambat serangan offline dengan memilih algoritma hash yang membutuhkan sumber daya semaksimal mungkin.

Untuk meringkas rekomendasi kami:

- **Gunakan [Argon2id](#argon2id) dengan konfigurasi minimum memori 19 MiB, jumlah iterasi 2, dan 1 derajat paralelisme.**
- **Jika [Argon2id](#argon2id) tidak tersedia, gunakan [scrypt](#scrypt) dengan parameter biaya CPU/memori minimum (2^17), ukuran blok minimum 8 (1024 byte), dan parameter paralelisasi 1.**
- **Untuk sistem lama yang menggunakan [bcrypt](#bcrypt), gunakan faktor kerja 10 atau lebih dan dengan batas kata sandi 72 byte.**
- **Jika kepatuhan FIPS-140 diperlukan, gunakan [PBKDF2](#pbkdf2) dengan faktor kerja 600.000 atau lebih dan atur dengan fungsi hash internal HMAC-SHA-256.**
- **Pertimbangkan untuk menggunakan [pepper](#peppering) untuk memberikan pertahanan tambahan yang lebih mendalam (meskipun sendiri, ia tidak memberikan karakteristik keamanan tambahan).**

## Latar Belakang

### Hashing vs Enkripsi

Hashing dan enkripsi dapat menjaga data sensitif tetap aman, tetapi dalam hampir semua keadaan, **kata sandi harus di-hash, BUKAN dienkripsi.**

Karena **hashing adalah fungsi satu arah** (yaitu, tidak mungkin untuk "mendekripsi" hash dan mendapatkan nilai teks biasa asli), ini adalah pendekatan yang paling tepat untuk validasi kata sandi. Bahkan jika penyerang mendapatkan kata sandi yang di-hash, mereka tidak dapat menggunakannya untuk masuk sebagai korban.

Karena **enkripsi adalah fungsi dua arah**, penyerang dapat mengambil teks biasa asli dari data yang dienkripsi. Ini dapat digunakan untuk menyimpan data seperti alamat pengguna karena data ini ditampilkan dalam teks biasa pada profil pengguna. Hashing alamat mereka akan menghasilkan kekacauan yang tidak jelas.

Satu-satunya waktu enkripsi harus digunakan dalam kata sandi adalah dalam kasus-kasus ekstrem di mana perlu untuk mendapatkan kata sandi teks biasa asli. Hal ini mungkin diperlukan jika aplikasi perlu menggunakan kata sandi untuk mengautentikasi dengan sistem lain yang tidak mendukung cara modern untuk memberikan akses secara terprogram, seperti OpenID Connect (OIDC). Jika memungkinkan, arsitektur alternatif harus digunakan untuk menghindari kebutuhan menyimpan kata sandi dalam bentuk terenkripsi.

Untuk panduan lebih lanjut tentang enkripsi, lihat [Cryptographic Storage Cheat Sheet](Cryptographic_Storage_Cheat_Sheet.md).

### Kapan Hash Kata Sandi Dapat Dibobol

**Kata sandi kuat yang disimpan dengan algoritme hashing modern dan menggunakan praktik hashing terbaik seharusnya tidak mungkin dibobol oleh penyerang.** Merupakan tanggung jawab Anda sebagai pemilik aplikasi untuk memilih algoritme hashing modern.

Namun, ada beberapa situasi di mana penyerang dapat "membobol" hash dalam beberapa keadaan dengan melakukan hal berikut:

- Memilih kata sandi yang menurut Anda telah dipilih korban (misalnya `password1!`)
- Menghitung hash
- Membandingkan hash yang Anda hitung dengan hash korban. Jika cocok, berarti Anda telah "memecahkan" hash dengan benar dan kini mengetahui nilai teks biasa dari kata sandi mereka.

Biasanya, penyerang akan mengulangi proses ini dengan daftar sejumlah besar kata sandi kandidat potensial, seperti:

- Daftar kata sandi yang diperoleh dari situs lain yang disusupi
- Brute force (mencoba setiap kandidat yang memungkinkan)
- Kamus atau daftar kata sandi umum

Meskipun jumlah permutasi bisa sangat banyak, dengan perangkat keras berkecepatan tinggi (seperti GPU) dan layanan cloud dengan banyak server untuk disewa, biaya yang dikeluarkan penyerang relatif kecil untuk melakukan pemecahan kata sandi yang berhasil, terutama jika praktik terbaik untuk hashing tidak diikuti.

## Metode untuk Meningkatkan Penyimpanan Kata Sandi

### Salting

Salt adalah string unik yang dibuat secara acak yang ditambahkan ke setiap kata sandi sebagai bagian dari proses hashing. Karena salt bersifat unik untuk setiap pengguna, penyerang harus memecahkan hash satu per satu menggunakan salt masing-masing daripada menghitung hash sekali dan membandingkannya dengan setiap hash yang tersimpan. Hal ini membuat pemecahan sejumlah besar hash menjadi jauh lebih sulit, karena waktu yang dibutuhkan bertambah berbanding lurus dengan jumlah hash.

Salting juga melindungi dari pra-komputasi hash oleh penyerang menggunakan tabel pelangi atau pencarian berbasis basis data. Terakhir, salting berarti tidak mungkin untuk menentukan apakah dua pengguna memiliki kata sandi yang sama tanpa memecahkan hash, karena salt yang berbeda akan menghasilkan hash yang berbeda meskipun kata sandinya sama.

[Algoritma hashing modern](#password-hashing-algorithms) seperti Argon2id, bcrypt, dan PBKDF2 secara otomatis melakukan salting pada kata sandi, jadi tidak diperlukan langkah tambahan saat menggunakannya.

### Peppering

[Pepper](https://datatracker.ietf.org/doc/html/draft-ietf-kitten-password-storage-07#section-4.2) dapat digunakan sebagai tambahan untuk salting guna memberikan lapisan perlindungan tambahan. Pepper mencegah penyerang dapat memecahkan hash apa pun jika mereka hanya memiliki akses ke basis data, misalnya, jika mereka telah mengeksploitasi kerentanan injeksi SQL atau memperoleh cadangan basis data. Strategi peppering tidak memengaruhi fungsi hashing kata sandi dengan cara apa pun.

Misalnya, salah satu strategi peppering adalah melakukan hashing kata sandi seperti biasa (menggunakan algoritme hashing kata sandi) lalu menggunakan HMAC (misalnya, HMAC-SHA256, HMAC-SHA512, tergantung pada panjang keluaran yang diinginkan) pada hash kata sandi asli sebelum menyimpan hash kata sandi dalam basis data, dengan pepper bertindak sebagai kunci HMAC.

- Pepper **dibagi di antara kata sandi yang disimpan**, alih-alih *unik* seperti salt. - Tidak seperti salt password, pepper **tidak boleh disimpan dalam basis data**.
- Pepper adalah rahasia dan harus disimpan dalam "brankas rahasia" atau HSM (Modul Keamanan Perangkat Keras). Lihat [Lembar Contekan Manajemen Rahasia](Secrets_Management_Cheat_Sheet.md) untuk informasi lebih lanjut tentang penyimpanan rahasia yang aman.
- Seperti kunci kriptografi lainnya, strategi rotasi pepper harus dipertimbangkan.

### Menggunakan Faktor Kerja

Faktor kerja adalah jumlah iterasi algoritma hashing yang dilakukan untuk setiap kata sandi (biasanya, sebenarnya iterasi `2^work`). Faktor kerja biasanya disimpan dalam keluaran hash. Hal ini membuat penghitungan hash menjadi lebih mahal secara komputasi, yang pada gilirannya mengurangi kecepatan dan/atau meningkatkan biaya yang harus dikeluarkan penyerang untuk mencoba memecahkan hash kata sandi.

Saat Anda memilih faktor kerja, seimbangkan antara keamanan dan kinerja. Meskipun faktor kerja yang lebih tinggi membuat hash lebih sulit dipecahkan oleh penyerang, faktor tersebut akan memperlambat proses verifikasi upaya login. Jika faktor kerja terlalu tinggi, kinerja aplikasi dapat menurun, yang dapat digunakan oleh penyerang untuk melakukan serangan penolakan layanan dengan menguras CPU server dengan sejumlah besar upaya login.

Tidak ada aturan emas untuk faktor kerja yang ideal - ini akan bergantung pada kinerja server dan jumlah pengguna pada aplikasi. Menentukan faktor kerja yang optimal akan memerlukan eksperimen pada server tertentu yang digunakan oleh aplikasi. Sebagai aturan umum, menghitung hash akan memakan waktu kurang dari satu detik.

#### Meningkatkan Faktor Kerja

Salah satu keuntungan utama memiliki faktor kerja adalah bahwa faktor tersebut dapat ditingkatkan seiring waktu karena perangkat keras menjadi lebih kuat dan lebih murah.

Pendekatan yang paling umum untuk meningkatkan faktor kerja adalah menunggu hingga pengguna mengautentikasi berikutnya, lalu melakukan hash ulang kata sandi mereka dengan faktor kerja yang baru. Hash yang berbeda akan memiliki faktor kerja yang berbeda dan hash mungkin tidak akan pernah ditingkatkan jika pengguna tidak masuk kembali ke aplikasi. Bergantung pada aplikasinya, mungkin perlu untuk menghapus hash kata sandi lama dan mengharuskan pengguna untuk mengatur ulang kata sandi mereka saat mereka perlu masuk lagi untuk menghindari penyimpanan hash lama dan kurang aman.

## Algoritma Hash Kata Sandi

Beberapa algoritma hash modern telah dirancang khusus untuk menyimpan kata sandi dengan aman. Ini berarti bahwa algoritma tersebut harus lambat (tidak seperti algoritma seperti MD5 dan SHA-1, yang dirancang untuk menjadi cepat), dan Anda dapat mengubah seberapa lambatnya algoritma tersebut dengan mengubah faktor kerja.

Anda tidak perlu menyembunyikan algoritma hash kata sandi mana yang digunakan oleh suatu aplikasi. Jika Anda menggunakan algoritma hash kata sandi modern dengan parameter konfigurasi yang tepat, seharusnya aman untuk menyatakan di depan umum algoritma hash kata sandi mana yang digunakan dan dicantumkan [di sini](https://pulse.michalspacek.cz/passwords/storages).

Tiga algoritma hash yang harus dipertimbangkan:

### Argon2id

[Argon2](https://en.wikipedia.org/wiki/Argon2) adalah pemenang [Password Hashing Competition](https://en.wikipedia.org/wiki/Password_Hashing_Competition) tahun 2015. Dari tiga versi Argon2, gunakan varian Argon2id karena varian ini menyediakan pendekatan yang seimbang untuk menahan serangan berbasis side-channel dan GPU.

Daripada faktor kerja sederhana seperti algoritme lain, Argon2id memiliki tiga parameter berbeda yang dapat dikonfigurasi: basis minimum dari ukuran memori minimum (m), jumlah iterasi minimum (t), dan derajat paralelisme (p). Kami merekomendasikan pengaturan konfigurasi berikut:

- m=47104 (46 MiB), t=1, p=1 (Jangan gunakan dengan Argon2i)
- m=19456 (19 MiB), t=2, p=1 (Jangan gunakan dengan Argon2i)
- m=12288 (12 MiB), t=3, p=1
- m=9216 (9 MiB), t=4, p=1
- m=7168 (7 MiB), t=5, p=1

Pengaturan konfigurasi ini menyediakan tingkat pertahanan yang sama, dan satu-satunya perbedaan adalah penggunaan CPU dan RAM.

### scrypt

[scrypt](http://www.tarsnap.com/scrypt/scrypt.pdf) adalah fungsi derivasi kunci berbasis kata sandi yang dibuat oleh [Colin Percival](https://twitter.com/cperciva). Meskipun [Argon2id](#argon2id) seharusnya menjadi pilihan terbaik untuk hashing kata sandi, [scrypt](#scrypt) harus digunakan saat yang pertama tidak tersedia.

Seperti [Argon2id](#argon2id), scrypt memiliki tiga parameter berbeda yang dapat dikonfigurasi: parameter biaya CPU/memori minimum (N), ukuran blok (r) dan tingkat paralelisme (p). Gunakan salah satu pengaturan berikut:

- N=2^17 (128 MiB), r=8 (1024 byte), p=1
- N=2^16 (64 MiB), r=8 (1024 byte), p=2
- N=2^15 (32 MiB), r=8 (1024 byte), p=3
- N=2^14 (16 MiB), r=8 (1024 byte), p=5
- N=2^13 (8 MiB), r=8 (1024 byte), p=10

Pengaturan konfigurasi ini menyediakan tingkat pertahanan yang sama. Satu-satunya perbedaan adalah penggunaan CPU dan RAM.

### bcrypt

Fungsi hashing kata sandi [bcrypt](https://en.wikipedia.org/wiki/bcrypt) seharusnya menjadi pilihan terbaik untuk penyimpanan kata sandi dalam sistem lama atau jika PBKDF2 diperlukan untuk mencapai kepatuhan FIPS-140.

Faktor kerja harus sebesar yang diizinkan oleh kinerja server verifikasi, dengan minimum 10.

#### Batas Input bcrypt

bcrypt memiliki panjang input maksimum 72 byte [untuk sebagian besar implementasi](https://security.stackexchange.com/questions/39849/does-bcrypt-have-a-maximum-password-length), jadi Anda harus menerapkan panjang kata sandi maksimum 72 byte (atau kurang jika implementasi bcrypt yang digunakan memiliki batasan yang lebih kecil).

#### Pra-Hashing Kata Sandi dengan bcrypt

Pendekatan alternatif adalah dengan melakukan pra-hash kata sandi yang diberikan pengguna dengan algoritma cepat seperti SHA-256, lalu melakukan hash hash yang dihasilkan dengan bcrypt (misalnya, `bcrypt(base64(hmac-sha256(data:$password, key:$pepper)), $salt, $cost)`). Ini adalah praktik berbahaya (tetapi umum) yang **harus dihindari** karena [peretasan kata sandi](https://www.youtube.com/watch?v=OQD3qDYMyYQ) dan masalah lain saat [menggabungkan bcrypt dengan fungsi hash lain](https://blog.ircmaxell.com/2015/03/security-issue-combining-bcrypt-with.html) (**Catatan:** "Perbaikan" dalam posting blog ini hanya melindungi Anda dari byte nol; **TIDAK** melindungi Anda dari peretasan kata sandi!).

### PBKDF2

Karena [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) direkomendasikan oleh [NIST](https://pages.nist.gov/800-63-3/sp800-63b.html#memsecretver) dan memiliki implementasi yang divalidasi FIPS-140, maka algoritma ini harus menjadi pilihan utama saat implementasi tersebut dibutuhkan.

Algoritma PBKDF2 mengharuskan Anda memilih algoritma hashing internal seperti HMAC atau berbagai algoritma hashing lainnya. HMAC-SHA-256 didukung secara luas dan direkomendasikan oleh NIST.

Faktor kerja untuk PBKDF2 diimplementasikan melalui hitungan iterasi, yang harus ditetapkan secara berbeda berdasarkan algoritma hashing internal yang digunakan.

- PBKDF2-HMAC-SHA1: 1.300.000 iterasi
- PBKDF2-HMAC-SHA256: 600.000 iterasi
- PBKDF2-HMAC-SHA512: 210.000 iterasi

### PBKDF2 Paralel

- PPBKDF2-SHA512: biaya 2
- PPBKDF2-SHA256: biaya 5
- PPBKDF2-SHA1: biaya 10

Pengaturan konfigurasi ini setara dalam hal pertahanan yang diberikannya. ([Angka per Desember 2022, berdasarkan pengujian GPU RTX 4000](https://tobtu.com/minimum-password-settings/))

#### Pra-Hashing PBKDF2

Jika PBKDF2 digunakan dengan HMAC, dan kata sandi lebih panjang dari ukuran blok fungsi hash (64 byte untuk SHA-256), kata sandi akan secara otomatis di-hash terlebih dahulu. Misalnya, kata sandi "Ini adalah kata sandi yang lebih panjang dari 512 bit yang merupakan ukuran blok SHA-256" diubah menjadi nilai hash (dalam heksadesimal): `fa91498c139805af73f7ba275cca071e78d78675027000c99a9925e2ec92eedd`.

Implementasi PBKDF2 yang baik melakukan pra-hashing sebelum fase hashing berulang yang mahal. Namun, beberapa implementasi melakukan konversi pada setiap iterasi, yang dapat membuat hashing kata sandi yang panjang jauh lebih mahal daripada hashing kata sandi yang pendek. Ketika pengguna memberikan kata sandi yang sangat panjang, potensi kerentanan penolakan layanan dapat terjadi, seperti yang dipublikasikan di [Django](https://www.djangoproject.com/weblog/2013/sep/15/security/) selama tahun 2013. Pra-hashing manual dapat mengurangi risiko ini tetapi memerlukan penambahan [salt](#salting) ke langkah pra-hash.

## Memutakhirkan Hash Lama

Aplikasi lama yang menggunakan algoritme hashing yang kurang aman, seperti MD5 atau SHA-1, dapat dimutakhirkan ke algoritme hashing kata sandi modern seperti yang dijelaskan di atas. Ketika pengguna memasukkan kata sandi mereka (biasanya dengan mengautentikasi pada aplikasi), input tersebut harus di-hash ulang menggunakan algoritme baru. Pembela harus menghapus kata sandi pengguna saat ini dan meminta mereka untuk memasukkan yang baru, sehingga hash lama (kurang aman) dari kata sandi mereka tidak lagi berguna bagi penyerang.

Namun, ini berarti bahwa hash kata sandi lama (kurang aman) akan disimpan dalam basis data hingga pengguna masuk. Anda dapat mengambil salah satu dari dua pendekatan untuk menghindari dilema ini.

Metode Peningkatan Satu: Hapus dan hapus hash kata sandi pengguna yang tidak aktif dalam waktu lama dan minta mereka menyetel ulang kata sandi mereka untuk masuk lagi. Meskipun aman, pendekatan ini tidak terlalu ramah pengguna. Kedaluwarsa kata sandi banyak pengguna dapat menyebabkan masalah bagi staf dukungan atau dapat ditafsirkan oleh pengguna sebagai indikasi pelanggaran.

Metode Peningkatan Dua: Gunakan hash kata sandi yang ada sebagai input untuk algoritme yang lebih aman. Misalnya, jika aplikasi awalnya menyimpan kata sandi sebagai `md5($password)`, ini dapat dengan mudah ditingkatkan ke `bcrypt(md5($password))`. Pelapisan hash menghindari kebutuhan untuk mengetahui kata sandi asli; namun, ini dapat membuat hash lebih mudah dipecahkan. Hash ini harus diganti dengan hash langsung dari kata sandi pengguna saat pengguna masuk berikutnya.

Ingatlah bahwa setelah metode hashing kata sandi Anda dipilih, metode tersebut harus ditingkatkan di masa mendatang, jadi pastikan bahwa peningkatan algoritma hashing Anda semudah mungkin. Selama masa transisi, berikan ruang untuk campuran algoritma hashing lama dan baru. Menggunakan campuran algoritma hashing lebih mudah jika algoritma hashing kata sandi dan faktor kerja disimpan dengan kata sandi menggunakan format standar, misalnya, [format string PHC modular](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).

### Karakter Internasional

Pustaka hashing Anda harus dapat menerima berbagai macam karakter dan harus kompatibel dengan semua titik kode Unicode, sehingga pengguna dapat menggunakan berbagai macam karakter yang tersedia pada perangkat modern - khususnya papan ketik seluler. Mereka harus dapat memilih kata sandi dari berbagai bahasa dan menyertakan piktogram. Sebelum melakukan hashing, entropi entri pengguna tidak boleh dikurangi, dan pustaka hashing kata sandi harus dapat menggunakan input yang mungkin berisi byte NULL.

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah Penyimpanan Kata Sandi yang Rentan:

### 1. Gunakan Algoritma Hashing Kata Sandi yang Kuat
- Gunakan algoritma seperti `bcrypt`, `Argon2`, atau `PBKDF2`.
- Hindari algoritma yang sudah ketinggalan zaman seperti `MD5` atau `SHA1`.

### 2. Tambahkan Salting ke Kata Sandi
- Tambahkan salt yang unik dan dibuat secara acak ke setiap kata sandi sebelum melakukan hashing.
- Simpan salt dengan aman di samping hash.

### 3. Gunakan Pepper untuk Keamanan Tambahan
- Tambahkan rahasia seluruh server (pepper) ke kata sandi sebelum melakukan hashing.
- Simpan pepper dengan aman di file konfigurasi terpisah.

### 4. Terapkan Peregangan Kunci
- Gunakan beberapa iterasi algoritma hashing untuk meningkatkan upaya komputasi untuk serangan brute-force.

### 5. Simpan Hash Kata Sandi dengan Aman
- Hindari menyimpan kata sandi teks biasa.
- Gunakan basis data dan enkripsi yang aman untuk menyimpan hash dan salt.

### 6. Lindungi dari Serangan Waktu
- Gunakan fungsi perbandingan waktu konstan saat memverifikasi kata sandi untuk mencegah kebocoran melalui analisis waktu respons.

### 7. Terapkan Kebijakan Kata Sandi yang Kuat
- Minta pengguna untuk membuat kata sandi yang rumit dengan panjang minimum dan keragaman karakter.
- Cegah penggunaan kembali kata sandi yang disusupi atau lemah.

### 8. Perbarui Algoritma Hashing Secara Berkala
- Tetap terinformasi tentang kemajuan dalam algoritma hashing dan bermigrasi ke yang lebih kuat sesuai kebutuhan.
- Gunakan versi untuk hash yang disimpan untuk memungkinkan peningkatan algoritma yang lancar.

### 9. Pantau dan Catat Aktivitas Mencurigakan
- Lacak upaya login yang gagal dan beri tahu administrator tentang pola yang tidak biasa.
- Gunakan pembatasan kecepatan untuk mengurangi serangan brute-force.

### 10. Edukasi Pengguna tentang Praktik Kata Sandi yang Aman
- Dorong penggunaan pengelola kata sandi untuk membuat dan menyimpan kata sandi yang unik dan kuat.
- Sarankan pengguna untuk mengubah kata sandi secara berkala, terutama setelah dugaan pelanggaran.

### 11. Lakukan Audit dan Pengujian Keamanan
- Audit sistem penyimpanan kata sandi secara berkala untuk mengidentifikasi dan memperbaiki kerentanan.
- Uji sistem menggunakan pengujian penetrasi dan simulasi serangan.

### 12. Mekanisme Reset Kata Sandi yang Aman
- Gunakan metode yang aman dan dapat diverifikasi untuk reset kata sandi, seperti tautan berbasis token.
- Pastikan token reset bersifat unik, sementara, dan terikat pada pengguna tertentu.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `