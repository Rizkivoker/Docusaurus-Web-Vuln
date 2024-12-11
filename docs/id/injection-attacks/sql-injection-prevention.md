---
sidebar_position: 3
---

# Pencegahan SQL Injection

## Pengantar Pencegahan SQL Injection

Lembar contekan ini akan membantu Anda mencegah kelemahan injeksi SQL dalam aplikasi Anda. Lembar contekan ini akan mendefinisikan apa itu injeksi SQL, menjelaskan di mana kelemahan tersebut terjadi, dan menyediakan empat opsi untuk bertahan terhadap serangan injeksi SQL. Serangan [Injeksi SQL](https://owasp.org/www-community/attacks/SQL_Injection) umum terjadi karena:

1. Kerentanan Injeksi SQL sangat umum, dan
2. Basis data aplikasi sering menjadi target penyerang karena biasanya berisi data yang menarik/kritis.

## Apa Itu Serangan Injeksi SQL?

Penyerang dapat menggunakan injeksi SQL pada aplikasi jika aplikasi tersebut memiliki kueri basis data dinamis yang menggunakan penggabungan string dan input yang disediakan pengguna. Untuk menghindari kelemahan injeksi SQL, pengembang perlu:

1. Berhenti menulis kueri dinamis dengan penggabungan string atau
2. Mencegah input SQL berbahaya disertakan dalam kueri yang dijalankan.

Ada beberapa teknik sederhana untuk mencegah kerentanan injeksi SQL dan teknik tersebut dapat digunakan dengan hampir semua jenis bahasa pemrograman dan semua jenis basis data. Meskipun basis data XML dapat memiliki masalah yang serupa (misalnya, injeksi XPath dan XQuery), teknik-teknik ini juga dapat digunakan untuk melindunginya.

## Anatomi Kerentanan Injeksi SQL yang Umum

Kelemahan injeksi SQL yang umum di Java ada di bawah ini. Karena parameter "customerName" yang tidak divalidasi hanya ditambahkan ke kueri, penyerang dapat memasukkan kode SQL ke dalam kueri tersebut dan aplikasi akan mengambil kode penyerang dan mengeksekusinya di basis data.

```java
String query = "SELECT account_balance FROM user_data WHERE user_name = "
+ request.getParameter("customerName");
try {
Statement statement = connection.createStatement( ... );
ResultSet results = statement.executeQuery( query ); }

...
```

## Pertahanan Utama

- **Opsi 1: Penggunaan Pernyataan yang Disiapkan (dengan Kueri Berparameter)**
- **Opsi 2: Penggunaan Prosedur Tersimpan yang Dibangun dengan Benar**
- **Opsi 3: Validasi Input Daftar Izin**
- **Opsi 4: SANGAT TIDAK DINJAUAN: Menghindari Semua Input yang Disediakan Pengguna**

### Pertahanan Opsi 1: Pernyataan yang Disiapkan (dengan Kueri Berparameter)

Ketika pengembang diajari cara menulis kueri basis data, mereka harus diberi tahu untuk menggunakan pernyataan yang disiapkan dengan pengikatan variabel (alias kueri berparameter). Pernyataan yang disiapkan mudah ditulis dan lebih mudah dipahami daripada kueri dinamis, dan kueri berparameter memaksa pengembang untuk mendefinisikan semua kode SQL terlebih dahulu dan meneruskan setiap parameter ke kueri nanti.

Jika kueri basis data menggunakan gaya pengodean ini, basis data akan selalu membedakan antara kode dan data, terlepas dari input pengguna apa yang diberikan. Selain itu, pernyataan yang disiapkan memastikan bahwa penyerang tidak dapat mengubah maksud kueri, bahkan jika perintah SQL dimasukkan oleh penyerang.

#### Contoh Pernyataan Siap Java yang Aman

Dalam contoh Java yang aman di bawah ini, jika penyerang memasukkan userID sebagai `tom' atau '1'='1`, kueri berparameter akan mencari nama pengguna yang secara harfiah cocok dengan seluruh string `tom' atau '1'='1`. Dengan demikian, basis data akan terlindungi dari penyuntikan kode SQL yang berbahaya.

Contoh kode berikut menggunakan `PreparedStatement`, implementasi Java dari kueri berparameter, untuk menjalankan kueri basis data yang sama.

```java
// This should REALLY be validated too
String custname = request.getParameter("customerName");
// Perform input validation to detect attacks
String query = "SELECT account_balance FROM user_data WHERE user_name = ? ";
PreparedStatement pstmt = connection.prepareStatement( query );
pstmt.setString( 1, custname);
ResultSet results = pstmt.executeQuery( );
```

#### Contoh Pernyataan Siap C\# .NET yang Aman

Di .NET, pembuatan dan eksekusi kueri tidak berubah. Cukup berikan parameter ke kueri menggunakan panggilan `Parameters.Add()` seperti yang ditunjukkan di bawah ini.

```csharp
String query = "SELECT account_balance FROM user_data WHERE user_name = ?";
try {
OleDbCommand command = new OleDbCommand(query, connection);
command.Parameters.Add(new OleDbParameter("customerName", CustomerName Name.Text));
OleDbDataReader reader = command.ExecuteReader();
// …
} catch (OleDbException se) {
// penanganan kesalahan
}
```

Meskipun kami telah menunjukkan contoh dalam Java dan .NET, hampir semua bahasa lain (termasuk Cold Fusion dan Classic ASP) mendukung antarmuka kueri berparameter. Bahkan lapisan abstraksi SQL, seperti [Hibernate Query Language](http://hibernate.org/) (HQL) dengan jenis masalah injeksi yang sama (disebut [HQL Injection](http://cwe.mitre.org/data/definitions/564.html)) juga mendukung kueri berparameter:

#### Contoh Pernyataan Siap Hibernate Query Language (HQL) (Parameter Bernama)

```java
// Ini adalah pernyataan HQL yang tidak aman
Query unsafeHQLQuery = session.createQuery("from Inventory where productID='"+userSuppliedParameter+"'");
// Berikut adalah versi aman dari kueri yang sama menggunakan parameter bernama
Query safeHQLQuery = session.createQuery("from Inventory where productID=:productid");
safeHQLQuery.setParameter("productid", userSuppliedParameter); ```

#### Contoh Lain Pernyataan Tersiap yang Aman

Jika Anda memerlukan contoh kueri yang disiapkan/bahasa berparameter, termasuk Ruby, PHP, Cold Fusion, Perl, dan Rust, lihat [situs](http://bobby-tables.com/) ini.

Umumnya, pengembang menyukai pernyataan yang disiapkan karena semua kode SQL tetap berada dalam aplikasi, yang membuat aplikasi relatif independen dari basis data.

### Opsi Pertahanan 2: Prosedur Tersimpan

Meskipun prosedur tersimpan tidak selalu aman dari injeksi SQL, pengembang dapat menggunakan konstruksi pemrograman prosedur tersimpan standar tertentu. Pendekatan ini memiliki efek yang sama seperti menggunakan kueri berparameter, selama prosedur tersimpan diimplementasikan dengan aman (yang merupakan norma untuk sebagian besar bahasa prosedur tersimpan).

#### Pendekatan Aman untuk Prosedur Tersimpan

Jika prosedur tersimpan diperlukan, pendekatan paling aman untuk menggunakannya mengharuskan pengembang untuk membuat pernyataan SQL dengan parameter yang secara otomatis diparameterisasi, kecuali jika pengembang melakukan sesuatu yang sebagian besar tidak lazim. Perbedaan antara pernyataan yang disiapkan dan prosedur tersimpan adalah bahwa kode SQL untuk prosedur tersimpan didefinisikan dan disimpan dalam basis data itu sendiri, kemudian dipanggil dari aplikasi. Karena pernyataan yang disiapkan dan prosedur tersimpan yang aman sama-sama efektif dalam mencegah injeksi SQL, organisasi Anda harus memilih pendekatan yang paling masuk akal bagi Anda.

#### Kapan Prosedur Tersimpan Dapat Meningkatkan Risiko

Kadang-kadang, prosedur tersimpan dapat meningkatkan risiko ketika suatu sistem diserang. Misalnya, pada MS SQL Server, Anda memiliki tiga peran default utama: `db_datareader`, `db_datawriter` dan `db_owner`. Sebelum prosedur tersimpan digunakan, DBA akan memberikan hak `db_datareader` atau `db_datawriter` kepada pengguna layanan web, tergantung pada persyaratannya.

Namun, prosedur tersimpan memerlukan hak eksekusi, peran yang tidak tersedia secara default. Dalam beberapa pengaturan di mana manajemen pengguna telah dipusatkan, tetapi terbatas pada 3 peran tersebut, aplikasi web harus berjalan sebagai `db_owner` sehingga prosedur tersimpan dapat berfungsi. Tentu saja, itu berarti bahwa jika server diretas, penyerang memiliki hak penuh atas basis data, yang sebelumnya hanya memiliki akses baca.

#### Contoh Prosedur Tersimpan Java yang Aman

Contoh kode berikut menggunakan implementasi Java dari antarmuka prosedur tersimpan (`CallableStatement`) untuk menjalankan kueri basis data yang sama. Prosedur tersimpan `sp_getAccountBalance` harus ditetapkan sebelumnya dalam basis data dan menggunakan fungsionalitas yang sama seperti kueri di atas.

```java
// This should REALLY be validated
String custname = request.getParameter("customerName");
try {
  CallableStatement cs = connection.prepareCall("{call sp_getAccountBalance(?)}");
  cs.setString(1, custname);
  ResultSet results = cs.executeQuery();
  // … result set handling
} catch (SQLException se) {
  // … logging and error handling
}
```

#### Contoh Prosedur Tersimpan VB .NET yang Aman

Contoh kode berikut menggunakan `SqlCommand`, implementasi antarmuka prosedur tersimpan .NET, untuk menjalankan kueri basis data yang sama. Prosedur tersimpan `sp_getAccountBalance` harus ditetapkan sebelumnya dalam basis data dan menggunakan fungsionalitas yang sama seperti kueri yang ditetapkan di atas.

```vbnet
Coba
Dim command As SqlCommand = new SqlCommand("sp_getAccountBalance", connection)
command.CommandType = CommandType.StoredProcedure
command.Parameters.Add(new SqlParameter("@CustomerName", CustomerName.Text))
Dim reader As SqlDataReader = command.ExecuteReader()
'...
Catch se As SqlException
'penanganan kesalahan
Akhiri Coba
```

### Opsi Pertahanan 3: Validasi Input Daftar Izin

Jika Anda dihadapkan dengan bagian kueri SQL yang tidak dapat menggunakan variabel bind, seperti nama tabel, nama kolom, atau indikator urutan sortir (ASC atau DESC), validasi input atau desain ulang kueri adalah pertahanan yang paling tepat. Jika nama tabel atau kolom diperlukan, idealnya nilai tersebut berasal dari kode dan bukan dari parameter pengguna.

#### Contoh Validasi Nama Tabel yang Aman

PERINGATAN: Menggunakan nilai parameter pengguna untuk menargetkan nama tabel atau kolom merupakan gejala desain yang buruk dan penulisan ulang secara menyeluruh harus dipertimbangkan jika waktu memungkinkan. Jika hal itu tidak memungkinkan, pengembang harus memetakan nilai parameter ke nama tabel atau kolom yang sah/diharapkan untuk memastikan masukan pengguna yang tidak divalidasi tidak berakhir dalam kueri.

Dalam contoh di bawah ini, karena `tableName` diidentifikasi sebagai salah satu nilai yang sah dan diharapkan untuk nama tabel dalam kueri ini, nilai tersebut dapat langsung ditambahkan ke kueri SQL. Perlu diingat bahwa fungsi validasi tabel generik dapat menyebabkan hilangnya data jika nama tabel digunakan dalam kueri yang tidak diharapkan.

```text
String tableName;
switch(PARAM):
  case "Value1": tableName = "fooTable";
                 break;
  case "Value2": tableName = "barTable";
                 break;
  ...
  default      : throw new InputValidationException("unexpected value provided"
                                                  + " for table name");
```

#### Penggunaan Pembuatan SQL Dinamis Paling Aman (DILARANG)

Saat kami mengatakan prosedur tersimpan "diimplementasikan dengan aman," itu berarti prosedur tersebut tidak menyertakan pembuatan SQL dinamis yang tidak aman. Pengembang biasanya tidak membuat SQL dinamis di dalam prosedur tersimpan. Namun, hal itu dapat dilakukan, tetapi harus dihindari.

Jika tidak dapat dihindari, prosedur tersimpan harus menggunakan validasi input atau escape yang tepat, seperti yang dijelaskan dalam artikel ini, untuk memastikan bahwa semua input yang diberikan pengguna ke prosedur tersimpan tidak dapat digunakan untuk menyuntikkan kode SQL ke dalam kueri yang dibuat secara dinamis. Auditor harus selalu mencari penggunaan `sp_execute`, `execute` atau `exec` dalam prosedur tersimpan SQL Server. Pedoman audit serupa diperlukan untuk fungsi serupa bagi vendor lain.

#### Contoh Pembuatan Kueri Dinamis yang Lebih Aman (DILARANG)

Untuk sesuatu yang sederhana seperti urutan pengurutan, sebaiknya input yang diberikan pengguna diubah menjadi boolean, lalu boolean tersebut digunakan untuk memilih nilai aman yang akan ditambahkan ke kueri. Ini adalah kebutuhan yang sangat standar dalam pembuatan kueri dinamis.

Misalnya:

```java
public String someMethod(boolean sortOrder) {
String SQLquery = "some SQL ... order by Salary " + (sortOrder ? "ASC" : "DESC");`
...
```

Setiap kali input pengguna dapat diubah menjadi non-String, seperti tanggal, numerik, boolean, tipe enumerasi, dll. sebelum ditambahkan ke kueri, atau digunakan untuk memilih nilai yang akan ditambahkan ke kueri, ini memastikan bahwa hal tersebut aman untuk dilakukan.

Validasi input juga direkomendasikan sebagai pertahanan sekunder dalam SEMUA kasus, bahkan saat menggunakan variabel bind seperti yang dibahas sebelumnya dalam artikel ini.

### Opsi Pertahanan 4: SANGAT DILARANG: Menghindari Semua Input yang Disediakan Pengguna

Dalam pendekatan ini, pengembang akan menghindari semua input pengguna sebelum memasukkannya ke dalam kueri. Pendekatan ini sangat spesifik terhadap basis data dalam implementasinya. Metodologi ini lemah dibandingkan dengan pertahanan lainnya, dan kami TIDAK DAPAT menjamin bahwa opsi ini akan mencegah semua injeksi SQL dalam semua situasi.

Jika aplikasi dibangun dari awal atau memerlukan toleransi risiko rendah, aplikasi tersebut harus dibangun atau ditulis ulang menggunakan kueri berparameter, prosedur tersimpan, atau semacam Object Relational Mapper (ORM) yang membangun kueri untuk Anda.

## Pertahanan Tambahan

Selain mengadopsi salah satu dari empat pertahanan utama, kami juga merekomendasikan untuk mengadopsi semua pertahanan tambahan ini untuk memberikan pertahanan yang mendalam. Pertahanan tambahan ini adalah:

- **Hak Istimewa Terkecil**
- **Validasi Input Daftar Izin**

### Hak Istimewa Terkecil

Untuk meminimalkan potensi kerusakan akibat serangan injeksi SQL yang berhasil, Anda harus meminimalkan hak istimewa yang diberikan ke setiap akun basis data di lingkungan Anda. Mulailah dari dasar untuk menentukan hak akses apa yang diperlukan akun aplikasi Anda, daripada mencoba mencari tahu hak akses apa yang perlu Anda cabut.

Pastikan bahwa akun yang hanya memerlukan akses baca hanya diberikan akses baca ke tabel yang perlu diaksesnya. JANGAN TETAPKAN AKSES JENIS DBA ATAU ADMIN KE AKUN APLIKASI ANDA. Kami memahami bahwa ini mudah, dan semuanya "berfungsi" saat Anda melakukannya dengan cara ini, tetapi ini sangat berbahaya.

#### Meminimalkan Hak Istimewa Aplikasi dan OS

Injeksi SQL bukan satu-satunya ancaman terhadap data basis data Anda. Penyerang dapat dengan mudah mengubah nilai parameter dari salah satu nilai legal yang diberikan kepada mereka, ke nilai yang tidak sah bagi mereka, tetapi aplikasi itu sendiri mungkin diizinkan untuk mengakses. Dengan demikian, meminimalkan hak istimewa yang diberikan ke aplikasi Anda akan mengurangi kemungkinan upaya akses yang tidak sah tersebut, bahkan saat penyerang tidak mencoba menggunakan injeksi SQL sebagai bagian dari eksploitasi mereka.

Saat Anda melakukannya, Anda harus meminimalkan hak istimewa akun sistem operasi yang menjalankan DBMS. Jangan jalankan DBMS Anda sebagai root atau sistem! Sebagian besar DBMS berjalan di luar kotak dengan akun sistem yang sangat kuat. Misalnya, MySQL berjalan sebagai sistem pada Windows secara default! Ubah akun OS DBMS ke sesuatu yang lebih sesuai, dengan hak istimewa terbatas.

#### Rincian Hak Istimewa Paling Rendah Saat Mengembangkan

Jika akun hanya memerlukan akses ke sebagian tabel, pertimbangkan untuk membuat tampilan yang membatasi akses ke bagian data tersebut dan menetapkan akses akun ke tampilan tersebut, bukan tabel yang mendasarinya. Jarang, jika pernah, berikan akses buat atau hapus ke akun basis data.

Jika Anda mengadopsi kebijakan di mana Anda menggunakan prosedur tersimpan di mana-mana, dan tidak mengizinkan akun aplikasi untuk langsung menjalankan kueri mereka sendiri, maka batasi akun tersebut agar hanya dapat menjalankan prosedur tersimpan yang mereka butuhkan. Jangan berikan mereka hak apa pun secara langsung ke tabel dalam basis data.

#### Hak Istimewa Admin Paling Rendah untuk Beberapa DB

Perancang aplikasi web harus menghindari penggunaan akun pemilik/admin yang sama di aplikasi web untuk terhubung ke basis data. Pengguna DB yang berbeda harus digunakan untuk aplikasi web yang berbeda.

Secara umum, setiap aplikasi web terpisah yang memerlukan akses ke basis data harus memiliki akun pengguna basis data yang ditunjuk yang akan digunakan aplikasi untuk terhubung ke DB. Dengan demikian, perancang aplikasi dapat memiliki ketelitian yang baik dalam kontrol akses, sehingga mengurangi hak istimewa sebanyak mungkin. Setiap pengguna DB kemudian akan memiliki akses tertentu hanya ke apa yang dibutuhkannya, dan akses tulis sesuai kebutuhan.

Sebagai contoh, halaman login memerlukan akses baca ke kolom nama pengguna dan kata sandi tabel, tetapi tidak ada akses tulis dalam bentuk apa pun (tidak ada penyisipan, pembaruan, atau penghapusan). Namun, halaman pendaftaran tentu saja memerlukan hak istimewa penyisipan ke tabel tersebut; pembatasan ini hanya dapat diberlakukan jika aplikasi web ini menggunakan pengguna DB yang berbeda untuk terhubung ke basis data.

#### Meningkatkan Least Privilege dengan SQL Views

Anda dapat menggunakan SQL view untuk lebih meningkatkan granularitas akses dengan membatasi akses baca ke kolom tertentu dari tabel atau gabungan tabel. Ini dapat memberikan manfaat tambahan.

Misalnya, jika sistem diharuskan (mungkin karena beberapa persyaratan hukum tertentu) untuk menyimpan kata sandi pengguna, alih-alih kata sandi yang diacak, perancang dapat menggunakan view untuk mengimbangi batasan ini. Mereka dapat mencabut semua akses ke tabel (dari semua pengguna DB kecuali pemilik/admin) dan membuat view yang menampilkan hash kolom kata sandi dan bukan kolom itu sendiri.

Setiap serangan injeksi SQL yang berhasil mencuri informasi DB akan dibatasi untuk mencuri hash kata sandi (bahkan bisa berupa hash yang dikunci), karena tidak ada pengguna DB untuk aplikasi web mana pun yang memiliki akses ke tabel itu sendiri.

### Validasi Input Daftar Izin

Selain menjadi pertahanan utama saat tidak ada cara lain yang memungkinkan (misalnya, saat variabel bind tidak sah), validasi input juga dapat menjadi pertahanan sekunder yang digunakan untuk mendeteksi input yang tidak sah sebelum diteruskan ke kueri SQL. Lanjutkan dengan hati-hati di sini. Data yang divalidasi belum tentu aman untuk dimasukkan ke dalam kueri SQL melalui pembuatan string. ## Artikel Terkait

**Lembar Contekan Serangan Injeksi SQL**:

Artikel berikut menjelaskan cara mengeksploitasi berbagai jenis kerentanan injeksi SQL pada berbagai platform (yang artikel ini dibuat untuk membantu Anda menghindarinya):

- [Lembar Contekan Injeksi SQL](https://www.netsparker.com/blog/web-security/sql-injection-cheat-sheet/)
- Melewati WAF dengan SQLi - [Melewati WAF Injeksi SQL](https://owasp.org/www-community/attacks/SQL_Injection_Bypassing_WAF)

**Deskripsi Kerentanan Injeksi SQL**:

- Artikel OWASP tentang Kerentanan [Injeksi SQL](https://owasp.org/www-community/attacks/SQL_Injection)
- Artikel OWASP tentang Kerentanan [Blind_SQL_Injection](https://owasp.org/www-community/attacks/Blind_SQL_Injection)

**Cara Menghindari Kerentanan Injeksi SQL**:

- Artikel [Panduan Pengembang OWASP](https://github.com/OWASP/DevGuide) tentang cara menghindari kerentanan injeksi SQL
- Lembar Contekan OWASP yang menyediakan **banyak contoh spesifik bahasa kueri berparameter menggunakan Pernyataan Tersiap dan Prosedur Tersimpan**
- [Situs Bobby Tables (terinspirasi oleh komik web XKCD) memiliki banyak contoh dalam berbagai bahasa Pernyataan Tersiap dan Prosedur Tersimpan berparameter](http://bobby-tables.com/)

**Cara Meninjau Kode untuk Kerentanan Injeksi SQL**:

- Artikel [Panduan Peninjauan Kode OWASP](https://wiki.owasp.org/index.php/Category:OWASP_Code_Review_Project) tentang cara [Meninjau Kode untuk Kerentanan Injeksi SQL](https://wiki.owasp.org/index.php/Reviewing_Code_for_SQL_Injection)

**Cara Menguji Kerentanan Injeksi SQL**:

- Artikel [Panduan Pengujian OWASP](https://owasp.org/www-project-web-security-testing-guide) tentang cara [Menguji Kerentanan Injeksi SQL](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection.html)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `