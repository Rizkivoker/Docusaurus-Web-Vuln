---
sidebar_position: 2
---

# Pencegahan Penyuntikan

## Pengantar Pencegahan Penyuntikan

Artikel ini difokuskan pada penyediaan panduan yang jelas, sederhana, dan dapat ditindaklanjuti untuk mencegah seluruh kategori kelemahan Penyuntikan dalam aplikasi Anda. Serangan penyuntikan, khususnya [SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection), sayangnya sangat umum terjadi.

Aksesibilitas aplikasi merupakan faktor yang sangat penting dalam perlindungan dan pencegahan kelemahan penyuntikan. Hanya sebagian kecil dari semua aplikasi dalam suatu perusahaan/usaha yang dikembangkan secara internal, sedangkan sebagian besar aplikasi berasal dari sumber eksternal. Aplikasi sumber terbuka setidaknya memberikan kesempatan untuk memperbaiki masalah, tetapi aplikasi sumber tertutup memerlukan pendekatan yang berbeda terhadap kelemahan penyuntikan.

Kelemahan penyuntikan terjadi ketika suatu aplikasi mengirimkan data yang tidak tepercaya ke penerjemah. Kelemahan penyuntikan sangat umum terjadi, khususnya dalam kode lama, sering ditemukan dalam kueri SQL, kueri LDAP, kueri XPath, perintah OS, argumen program, dsb. Kelemahan penyuntikan mudah ditemukan saat memeriksa kode, tetapi lebih sulit melalui pengujian. Pemindai dan fuzzer dapat membantu penyerang menemukannya.

Bergantung pada aksesibilitas, tindakan yang berbeda harus diambil untuk memperbaikinya. Cara terbaik adalah memperbaiki masalah dalam kode sumber itu sendiri, atau bahkan mendesain ulang beberapa bagian aplikasi. Namun, jika kode sumber tidak tersedia atau tidak ekonomis untuk memperbaiki perangkat lunak lama, hanya patch virtual yang masuk akal.

## Jenis Aplikasi

Biasanya ada tiga kelas aplikasi yang dapat dilihat dalam sebuah perusahaan. Ketiga jenis tersebut diperlukan untuk mengidentifikasi tindakan yang perlu dilakukan untuk mencegah/memperbaiki kelemahan injeksi.

### A1: Aplikasi Baru

Aplikasi web baru dalam fase desain, atau dalam tahap pengembangan awal.

### A2: Aplikasi Open Source yang Produktif

Aplikasi yang sudah produktif, yang dapat dengan mudah diadaptasi. Aplikasi tipe Model-View-Controller (MVC) hanyalah salah satu contoh arsitektur aplikasi yang mudah diakses.

### A3: Aplikasi Closed Source yang Produktif

Aplikasi produktif yang tidak dapat atau hanya sulit dimodifikasi.

## Bentuk Injeksi

Ada beberapa bentuk injeksi yang menargetkan berbagai teknologi, termasuk kueri SQL, kueri LDAP, kueri XPath, dan perintah OS.

### Bahasa kueri

Bentuk injeksi yang paling terkenal adalah Injeksi SQL, tempat penyerang dapat mengubah kueri basis data yang ada.

Namun, kueri berbasis LDAP, SOAP, XPath, dan REST juga rentan terhadap serangan injeksi yang memungkinkan pengambilan data atau bypass kontrol.

#### Injeksi SQL

Serangan injeksi SQL terdiri dari penyisipan atau "injeksi" kueri SQL sebagian atau lengkap melalui input data atau yang dikirimkan dari klien (peramban) ke aplikasi web.

Serangan injeksi SQL yang berhasil dapat membaca data sensitif dari basis data, mengubah data basis data (menyisipkan/memperbarui/menghapus), menjalankan operasi administrasi pada basis data (seperti mematikan DBMS), memulihkan konten file tertentu yang ada pada sistem file DBMS atau menulis file ke dalam sistem file, dan, dalam beberapa kasus, mengeluarkan perintah ke sistem operasi. Serangan injeksi SQL adalah jenis serangan injeksi, di mana perintah SQL disuntikkan ke input bidang data untuk memengaruhi eksekusi perintah SQL yang telah ditentukan sebelumnya.

Serangan Injeksi SQL dapat dibagi menjadi tiga kelas berikut:

- **Inband:** data diekstraksi menggunakan saluran yang sama yang digunakan untuk menyuntikkan kode SQL. Ini adalah jenis serangan yang paling mudah, di mana data yang diambil disajikan langsung di halaman web aplikasi.

- **Out-of-band:** data diambil menggunakan saluran yang berbeda (misalnya, email dengan hasil kueri dibuat dan dikirim ke penguji).

- **Inferensial atau Buta:** tidak ada transfer data yang sebenarnya, tetapi penguji dapat merekonstruksi informasi dengan mengirimkan permintaan tertentu dan mengamati perilaku Server DB yang dihasilkan.

##### Cara menguji masalah

###### Selama peninjauan kode

Harap periksa apakah kueri ke basis data tidak dilakukan melalui pernyataan yang telah disiapkan.

Jika pernyataan dinamis dibuat, harap periksa apakah data telah disanitasi sebelum digunakan sebagai bagian dari pernyataan.

Auditor harus selalu mencari penggunaan sp_execute, execute, atau exec dalam prosedur tersimpan SQL Server. Pedoman audit serupa diperlukan untuk fungsi serupa bagi vendor lain.

###### Eksploitasi Otomatis

Sebagian besar situasi dan teknik di bawah ini dapat dilakukan secara otomatis menggunakan beberapa alat. Dalam artikel ini penguji dapat menemukan informasi tentang cara melakukan audit otomatis menggunakan [SQLMap](https://wiki.owasp.org/index.php/Automated_Audit_using_SQLMap)

Analisis Kode Statis yang Sama Aturan aliran data dapat mendeteksi input yang dikendalikan pengguna yang tidak disanitasi yang dapat mengubah kueri SQL.

###### Injeksi Prosedur Tersimpan

Saat menggunakan SQL dinamis dalam prosedur tersimpan, aplikasi harus membersihkan input pengguna dengan benar untuk menghilangkan risiko penyuntikan kode. Jika tidak dibersihkan, pengguna dapat memasukkan SQL berbahaya yang akan dieksekusi dalam prosedur tersimpan.

###### Teknik Eksploitasi Penundaan Waktu

Teknik eksploitasi penundaan waktu sangat berguna saat penguji menemukan situasi Injeksi SQL Buta, di mana tidak ada yang diketahui tentang hasil operasi. Teknik ini terdiri dari pengiriman kueri yang disuntikkan dan jika kondisinya benar, penguji dapat memantau waktu yang dibutuhkan server untuk merespons. Jika terjadi penundaan, penguji dapat menganggap hasil kueri kondisional itu benar. Teknik eksploitasi ini dapat berbeda dari DBMS ke DBMS (periksa bagian khusus DBMS).

```teks
http://www.example.com/product.php?id=10 DAN JIKA(versi() seperti '5%', tidur(10), 'salah'))--
```

Dalam contoh ini penguji memeriksa apakah versi MySql adalah 5.x atau bukan, yang membuat server menunda jawaban selama 10 detik. Penguji dapat menambah waktu tunda dan memantau respons. Penguji juga tidak perlu menunggu respons. Terkadang mereka dapat menetapkan nilai yang sangat tinggi (misalnya 100) dan membatalkan permintaan setelah beberapa detik.

###### Teknik Eksploitasi di Luar Band

Teknik ini sangat berguna ketika penguji menemukan situasi Injeksi SQL Buta, di mana tidak ada yang diketahui tentang hasil operasi. Teknik ini terdiri dari penggunaan fungsi DBMS untuk melakukan koneksi di luar band dan mengirimkan hasil kueri yang disuntikkan sebagai bagian dari permintaan ke server penguji. Seperti teknik berbasis kesalahan, setiap DBMS memiliki fungsinya sendiri. Periksa bagian DBMS tertentu.

##### Remediasi

###### Opsi Pertahanan 1: Pernyataan yang Disiapkan (dengan Kueri Berparameter)

Pernyataan yang disiapkan memastikan bahwa penyerang tidak dapat mengubah maksud kueri, bahkan jika perintah SQL dimasukkan oleh penyerang. Dalam contoh aman di bawah ini, jika penyerang memasukkan ID pengguna `tom' atau '1'='1`, kueri berparameter tidak akan rentan dan sebaliknya akan mencari nama pengguna yang secara harfiah cocok dengan seluruh string `tom' atau '1'='1`.

###### Opsi Pertahanan 2: Prosedur Tersimpan

Perbedaan antara pernyataan yang disiapkan dan prosedur tersimpan adalah bahwa kode SQL untuk prosedur tersimpan didefinisikan dan disimpan dalam database itu sendiri, lalu dipanggil dari aplikasi.

Kedua teknik ini memiliki efektivitas yang sama dalam mencegah injeksi SQL sehingga organisasi Anda harus memilih pendekatan mana yang paling masuk akal bagi Anda. Prosedur tersimpan tidak selalu aman dari injeksi SQL. Namun, konstruksi pemrograman prosedur tersimpan standar tertentu memiliki efek yang sama dengan penggunaan kueri berparameter saat diimplementasikan dengan aman* yang merupakan norma untuk sebagian besar bahasa prosedur tersimpan.

*Catatan:* 'Diimplementasikan dengan aman' berarti prosedur tersimpan tidak menyertakan pembuatan SQL dinamis yang tidak aman.

###### Opsi Pertahanan 3: Validasi Input Daftar yang Diizinkan

Berbagai bagian kueri SQL bukanlah lokasi yang sah untuk penggunaan variabel bind, seperti nama tabel atau kolom, dan indikator urutan sortir (ASC atau DESC). Dalam situasi seperti itu, validasi input atau desain ulang kueri adalah pertahanan yang paling tepat. Untuk nama tabel atau kolom, idealnya nilai tersebut berasal dari kode, dan bukan dari parameter pengguna.

Namun, jika nilai parameter pengguna digunakan untuk membedakan nama tabel dan nama kolom, maka nilai parameter harus dipetakan ke nama tabel atau kolom yang sah/diharapkan untuk memastikan input pengguna yang tidak divalidasi tidak berakhir dalam kueri. Harap dicatat, ini adalah gejala desain yang buruk dan penulisan ulang penuh harus dipertimbangkan jika waktu memungkinkan.

###### Opsi Pertahanan 4: Menghindari Semua Input yang Disediakan Pengguna

Teknik ini hanya boleh digunakan sebagai pilihan terakhir, jika tidak ada satu pun yang memungkinkan. Validasi input mungkin merupakan pilihan yang lebih baik karena metodologi ini lemah dibandingkan dengan pertahanan lain dan kami tidak dapat menjamin bahwa metodologi ini akan mencegah semua Injeksi SQL dalam semua situasi.

Teknik ini digunakan untuk menghindari input pengguna sebelum memasukkannya ke dalam kueri. Biasanya hanya disarankan untuk memasang kembali kode lama jika penerapan validasi input tidak efektif dari segi biaya.

##### Contoh kode - Java

###### Contoh Pernyataan Siap Java yang Aman

Contoh kode berikut menggunakan `PreparedStatement`, implementasi Java dari kueri berparameter, untuk menjalankan kueri basis data yang sama.

```java
// This should REALLY be validated too
String custname = request.getParameter("customerName");
// Perform input validation to detect attacks
String query = "SELECT account_balance FROM user_data WHERE user_name = ?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setString(1, custname);
ResultSet results = pstmt.executeQuery();
```

Kami telah menunjukkan contoh dalam Java, tetapi hampir semua bahasa lain, termasuk Cold Fusion, dan ASP Klasik, mendukung antarmuka kueri berparameter.

###### Contoh Prosedur Tersimpan Java yang Aman

Contoh kode berikut menggunakan `CallableStatement`, implementasi Java dari antarmuka prosedur tersimpan, untuk menjalankan kueri basis data yang sama. Prosedur tersimpan `sp_getAccountBalance` harus ditetapkan sebelumnya dalam basis data dan menerapkan fungsionalitas yang sama seperti kueri yang ditetapkan di atas.

```java
// This should REALLY be validated
String custname = request.getParameter("customerName");
try {
 CallableStatement cs = connection.prepareCall("{call sp_getAccountBalance(?)}");
 cs.setString(1, custname);
 ResultSet results = cs.executeQuery();
 // Result set handling...
} catch (SQLException se) {
 // Logging and error handling...
}
```

#### Injeksi LDAP

Injeksi LDAP adalah serangan yang digunakan untuk mengeksploitasi aplikasi berbasis web yang menyusun pernyataan LDAP berdasarkan masukan pengguna. Ketika aplikasi gagal membersihkan masukan pengguna dengan benar, pernyataan LDAP dapat dimodifikasi melalui teknik yang mirip dengan [Injeksi SQL](https://owasp.org/www-community/attacks/SQL_Injection). Serangan injeksi LDAP dapat mengakibatkan pemberian izin untuk kueri yang tidak sah, dan modifikasi konten di dalam pohon LDAP. Untuk informasi selengkapnya tentang serangan Injeksi LDAP, kunjungi [Injeksi LDAP](https://owasp.org/www-community/attacks/LDAP_Injection).

Serangan [Injeksi LDAP](https://owasp.org/www-community/attacks/LDAP_Injection) umum terjadi karena dua faktor:

1. Kurangnya antarmuka kueri LDAP yang lebih aman dan berparameter
2. Penggunaan LDAP secara luas untuk mengautentikasi pengguna ke sistem.

##### Cara menguji masalah

###### Selama peninjauan kode

Harap periksa setiap kueri ke karakter khusus escape LDAP.

###### Eksploitasi Otomatis

Modul pemindai alat seperti OWASP [ZAP](https://www.zaproxy.org/) memiliki modul untuk mendeteksi masalah injeksi LDAP.

##### Remediasi

###### Escape semua variabel menggunakan fungsi enkode LDAP yang tepat

Cara utama LDAP menyimpan nama didasarkan pada DN ([nama khusus](https://ldapwiki.com/wiki/Nama%20Tertentu)). Anda dapat menganggapnya seperti pengenal unik. Ini terkadang digunakan untuk mengakses sumber daya, seperti nama pengguna.

DN mungkin terlihat seperti ini

```teks
cn=Richard Feynman, ou=Departemen Fisika, dc=Caltech, dc=edu
```

atau

```teks
uid=inewton, ou=Departemen Matematika, dc=Cambridge, dc=com
```

Ada karakter tertentu yang dianggap sebagai karakter khusus dalam DN. Daftar lengkapnya adalah sebagai berikut: `\ # + < > , ; " =` dan spasi di awal atau di akhir

Setiap DN menunjuk tepat ke 1 entri, yang dapat dianggap seperti baris dalam RDBMS. Untuk setiap entri, akan ada 1 atau lebih atribut yang dianalogikan dengan kolom RDBMS. Jika Anda tertarik untuk mencari pengguna dengan atribut tertentu melalui LDAP, Anda dapat melakukannya dengan filter pencarian. Dalam filter pencarian, Anda dapat menggunakan logika boolean standar untuk mendapatkan daftar pengguna yang cocok dengan batasan sembarang. Filter pencarian ditulis dalam notasi Polandia alias notasi awalan.

Contoh:

```teks
(&(ou=Fisika)(| (manajer=cn=Freeman Dyson,ou=Fisika,dc=Caltech,dc=edu)
(manajer=cn=Albert Einstein,ou=Fisika,dc=Princeton,dc=edu) ))
```

Saat membuat kueri LDAP dalam kode aplikasi, Anda HARUS menghindari data tidak tepercaya yang ditambahkan ke kueri LDAP apa pun. Ada dua bentuk escape LDAP. Pengodean untuk Pencarian LDAP dan Pengodean untuk DN LDAP (nama khusus). Escape yang tepat bergantung pada apakah Anda membersihkan input untuk filter pencarian, atau Anda menggunakan DN sebagai kredensial seperti nama pengguna untuk mengakses beberapa sumber daya.

##### Contoh kode - Java

###### Java yang Aman untuk Contoh escape LDAP

```java
public String escapeDN (String name) {
 //From RFC 2253 and the / character for JNDI
 final char[] META_CHARS = {'+', '"', '<', '>', ';', '/'};
 String escapedStr = new String(name);
 //Backslash is both a Java and an LDAP escape character,
 //so escape it first
 escapedStr = escapedStr.replaceAll("\\\\\\\\","\\\\\\\\");
 //Positional characters - see RFC 2253
 escapedStr = escapedStr.replaceAll("\^#","\\\\\\\\#");
 escapedStr = escapedStr.replaceAll("\^ | $","\\\\\\\\ ");
 for (int i=0 ; i < META_CHARS.length ; i++) {
        escapedStr = escapedStr.replaceAll("\\\\" +
                     META_CHARS[i],"\\\\\\\\" + META_CHARS[i]);
 }
 return escapedStr;
}
```

Perhatikan, bahwa karakter garis miring terbalik adalah literal Java String dan karakter escape ekspresi reguler.

```java
public String escapeSearchFilter (String filter) {
//Dari RFC 2254
String escapedStr = new String(filter);
escapedStr = escapedStr.replaceAll("\\\\\\\\","\\\\\\\5c");
escapedStr = escapedStr.replaceAll("\\\\\*","\\\\\\\\2a");
escapedStr = escapedStr.replaceAll("\\\\(","\\\\\\\\28");
escapedStr = escapedStr.replaceAll("\\\\)","\\\\\\\\29");
escapedStr = escapedStr.replaceAll("\\\\" +
Character.toString('\\u0000'), "\\\\\\\\00"); return escapedStr;
}
```

#### XPath Injection

TODO

### Bahasa skrip

Semua bahasa skrip yang digunakan dalam aplikasi web memiliki bentuk panggilan `eval` yang menerima kode saat runtime dan mengeksekusinya. Jika kode dibuat menggunakan kode input pengguna yang tidak divalidasi dan tidak lolos, injeksi kode dapat terjadi yang memungkinkan penyerang untuk menumbangkan logika aplikasi dan akhirnya mendapatkan akses lokal.

Setiap kali bahasa skrip digunakan, implementasi aktual dari bahasa skrip yang 'lebih tinggi' dilakukan menggunakan bahasa yang 'lebih rendah' ​​seperti C. Jika bahasa skrip memiliki cacat dalam kode penanganan data '[Null Byte Injection](http://projects.webappsec.org/w/page/13246949/Null%20Byte%20Injection)' vektor serangan dapat digunakan untuk mendapatkan akses ke area lain dalam memori, yang menghasilkan serangan yang berhasil.

### Perintah Sistem Operasi

Injeksi perintah OS adalah teknik yang digunakan melalui antarmuka web untuk menjalankan perintah OS pada server web. Pengguna menyediakan perintah sistem operasi melalui antarmuka web untuk menjalankan perintah OS.

Setiap antarmuka web yang tidak disanitasi dengan benar rentan terhadap eksploitasi ini. Dengan kemampuan untuk menjalankan perintah OS, pengguna dapat mengunggah program jahat atau bahkan memperoleh kata sandi. Injeksi perintah OS dapat dicegah jika keamanan ditekankan selama desain dan pengembangan aplikasi.

#### Cara menguji masalah

##### Selama peninjauan kode

Periksa apakah ada metode eksekusi perintah yang dipanggil dan input pengguna yang tidak divalidasi diambil sebagai data untuk perintah tersebut.

Di luar itu, menambahkan titik koma di akhir parameter kueri URL diikuti oleh perintah sistem operasi, akan menjalankan perintah tersebut. `%3B` adalah URL yang dikodekan dan didekodekan menjadi titik koma. Ini karena `;` ditafsirkan sebagai pemisah perintah.

Contoh: `http://sensitive/something.php?dir=%3Bcat%20/etc/passwd`

Jika aplikasi merespons dengan keluaran file `/etc/passwd`, maka Anda tahu serangan telah berhasil. Banyak pemindai aplikasi web dapat digunakan untuk menguji serangan ini karena mereka menyuntikkan variasi perintah dan menguji respons.

Alat Analisis Kode Statis memeriksa aliran data masukan pengguna yang tidak tepercaya ke dalam aplikasi web dan memeriksa apakah data tersebut kemudian dimasukkan ke dalam metode berbahaya yang mengeksekusi masukan pengguna sebagai perintah.

### Perbaikan

Jika dianggap tidak dapat dihindari panggilan ke perintah sistem yang digabungkan dengan yang disediakan pengguna, dua lapisan pertahanan berikut harus digunakan dalam perangkat lunak untuk mencegah serangan

1. **Parameterisasi** - Jika tersedia, gunakan mekanisme terstruktur yang secara otomatis menegakkan pemisahan antara data dan perintah. Mekanisme ini dapat membantu menyediakan kutipan dan penyandian yang relevan. 2. **Validasi input** - nilai untuk perintah dan argumen yang relevan harus divalidasi. Ada beberapa tingkat validasi untuk perintah aktual dan argumennya:
    - Terkait **perintah** yang digunakan, perintah tersebut harus divalidasi terhadap daftar perintah yang diizinkan.
- Terkait **argumen** yang digunakan untuk perintah tersebut, perintah tersebut harus divalidasi menggunakan opsi berikut:
- Validasi masukan positif atau daftar yang diizinkan - di mana argumen yang diizinkan didefinisikan secara eksplisit
- Ekspresi Reguler Daftar yang Diizinkan - di mana secara eksplisit didefinisikan daftar karakter baik yang diizinkan dan panjang maksimum string. Pastikan bahwa metakarakter seperti `& | ; $ > < \` \ !` dan spasi bukan bagian dari Ekspresi Reguler. Misalnya, ekspresi reguler berikut hanya mengizinkan huruf kecil dan angka, dan tidak mengandung metakarakter. Panjangnya juga dibatasi hingga 3-10 karakter:

`^[a-z0-9]{3,10}$`

#### Contoh kode - Java

##### Penggunaan yang Salah

```java
ProcessBuilder b = new ProcessBuilder("C:\DoStuff.exe -arg1 -arg2");
```

Dalam contoh ini, perintah beserta argumennya dilewatkan sebagai satu string, sehingga mudah untuk memanipulasi ekspresi tersebut dan menyuntikkan string berbahaya.

##### Penggunaan yang Benar

Berikut adalah contoh yang memulai proses dengan direktori kerja yang dimodifikasi. Perintah dan setiap argumen dilewatkan secara terpisah. Ini memudahkan untuk memvalidasi setiap istilah dan mengurangi risiko untuk memasukkan string berbahaya.

```java
ProcessBuilder pb = new ProcessBuilder("TrustedCmd", "TrustedArg1", "TrustedArg2"); Map<String, String> env = pb.environment();
pb.directory(new File("TrustedDir"));
Process p = pb.start();
```

### Protokol Jaringan

Aplikasi web sering berkomunikasi dengan daemon jaringan (seperti SMTP, IMAP, FTP) tempat input pengguna menjadi bagian dari aliran komunikasi. Di sini, urutan perintah dapat diinjeksikan untuk menyalahgunakan sesi yang sudah ada.

## Aturan Pencegahan Injeksi

### Aturan \#1 (Lakukan validasi input yang tepat)

Lakukan validasi input yang tepat. Validasi input positif atau daftar putih dengan kanonisasi yang tepat juga direkomendasikan, tetapi **bukan pembelaan yang lengkap** karena banyak aplikasi memerlukan karakter khusus dalam inputnya.

### Aturan \#2 (Gunakan API yang aman)

Pilihan yang lebih disukai adalah menggunakan API yang aman yang menghindari penggunaan interpreter sepenuhnya atau menyediakan antarmuka berparameter. Berhati-hatilah terhadap API, seperti prosedur tersimpan, yang berparameter, tetapi masih dapat menyebabkan injeksi di balik layar.

### Aturan \#3 (Escape data pengguna secara kontekstual)

Jika API berparameter tidak tersedia, Anda harus escape karakter khusus dengan hati-hati menggunakan sintaks escape khusus untuk interpreter tersebut.

## Other Injection Cheatsheets

**SQL Injection Prevention Cheat Sheet**

**OS Command Injection Defense Cheat Sheet**

**LDAP Injection Prevention Cheat Sheet**

**Injection Prevention Cheat Sheet in Java**

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `