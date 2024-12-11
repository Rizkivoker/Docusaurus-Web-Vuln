---
sidebar_position: 3
---

# Parameterisasi Kueri

## Pengantar Parameterisasi Kueri

[Injeksi SQL](https://owasp.org/www-community/attacks/SQL_Injection) adalah salah satu kerentanan web yang paling berbahaya. Begitu berbahayanya sehingga menjadi item #1 di OWASP Top 10 [versi 2013](https://wiki.owasp.org/index.php/Top_10_2013-A1-Injection), dan [versi 2017](https://owasp.org/www-project-top-ten/2017/A1_2017-Injection.html). Pada tahun 2021, ia berada di posisi #3 di [OWASP Top 10](https://owasp.org/Top10/A03_2021-Injection/).

Ini merupakan ancaman serius karena SQL Injection memungkinkan kode penyerang jahat mengubah struktur pernyataan SQL aplikasi web dengan cara yang dapat mencuri data, memodifikasi data, atau berpotensi memfasilitasi injeksi perintah ke OS yang mendasarinya.

Lembar contekan ini merupakan karya turunan dari **SQL Injection Prevention Cheat Sheet**.

## Contoh Kueri Berparameter

SQL Injection paling baik dicegah melalui penggunaan **kueri berparameter**. Bagan berikut menunjukkan, dengan contoh kode dunia nyata, cara membuat kueri berparameter di sebagian besar bahasa web umum. Tujuan dari contoh kode ini adalah untuk menunjukkan kepada pengembang web cara menghindari SQL Injection saat membuat kueri basis data dalam aplikasi web.

Harap dicatat, banyak kerangka kerja dan pustaka sisi klien menawarkan parameterisasi kueri sisi klien. Pustaka ini sering kali hanya membuat kueri dengan penggabungan string sebelum mengirim kueri mentah ke server. Pastikan bahwa parameterisasi kueri dilakukan di sisi server!

### Contoh Pernyataan yang Disiapkan

#### Menggunakan fitur bawaan Java

```java
String custname = request.getParameter("customerName");
String query = "SELECT account_balance FROM user_data WHERE user_name = ? ";
PreparedStatement pstmt = connection.prepareStatement( query );
pstmt.setString( 1, custname);
ResultSet results = pstmt.executeQuery();
```

#### Menggunakan Java dengan Hibernate

```java
// HQL
@Entity // deklarasikan sebagai entitas;
@NamedQuery(
name="findByDescription",
query="FROM Inventory i WHERE i.productDescription = :productDescription"
)
public class Inventory implements Serializable {
@Id
private long id;
private String productDescription; }

// Kasus penggunaan
// Ini HARUS BENAR-BENAR divalidasi juga
String userSuppliedParameter = request.getParameter("Product-Description");
// Lakukan validasi input untuk mendeteksi serangan
List<Inventory> list =
session.getNamedQuery("findByDescription")
.setParameter("productDescription", userSuppliedParameter).list();

// API Kriteria
// Ini HARUS BENAR-BENAR divalidasi juga
String userSuppliedParameter = request.getParameter("Product-Description");
// Lakukan validasi input untuk mendeteksi serangan
Inventory inv = (Inventory) session.createCriteria(Inventory.class).add
(Restrictions.eq("productDescription", userSuppliedParameter)).uniqueResult();
```

#### Menggunakan fitur bawaan .NET

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

#### Menggunakan fitur bawaan ASP .NET

```csharp
string sql = "SELECT * FROM Customers WHERE CustomerId = @CustomerId";
SqlCommand command = new SqlCommand(sql);
command.Parameters.Add(new SqlParameter("@CustomerId", System.Data.SqlDbType.Int)); perintah.Parameter["@CustomerId"].Nilai = 1; ```

#### Menggunakan Ruby dengan ActiveRecord

```ruby
## Buat
Project.create!(:name => 'owasp')
## Baca
Project.all(:conditions => "name = ?", name)
Project.all(:conditions => { :name => name })
Project.where("name = :name", :name => name)
## Perbarui
project.update_attributes(:name => 'owasp')
## Hapus
Project.delete(:name => 'name')
```

#### Menggunakan fitur bawaan Ruby

```ruby
insert_new_user = db.prepare "INSERT INTO users (name, age, gender) VALUES (?, ? ,?)"
insert_new_user.execute 'aizatto', '20', 'male'
```

#### Menggunakan PHP dengan Objek Data PHP

```php
$stmt = $dbh->prepare("MASUKKAN KE REGISTRY (nama, nilai) NILAI (:nama, :nilai)");
$stmt->bindParam(':nama', $nama);
$stmt->bindParam(':nilai', $nilai);
```

#### Menggunakan fitur bawaan Cold Fusion

```coldfusion
<cfquery name = "getFirst" dataSource = "cfsnippets">
SELECT * FROM #strDatabasePrefix#_courses WHERE intCourseID =
<cfqueryparam value = #intCourseID# CFSQLType = "CF_SQL_INTEGER">
</cfquery>
```

#### Menggunakan PERL dengan Antarmuka Independen Basis Data

```perl
my $sql = "INSERT INTO foo (bar, baz) VALUES ( ?, ? )";
my $sth = $dbh->prepare( $sql );
$sth->execute( $bar, $baz );
```

#### Menggunakan Rust dengan SQLx
<!-- disumbangkan oleh GeekMasher -->

```rust
// Input dari CLI args tetapi bisa apa saja
let username = std::env::args().last().unwrap();

// Menggunakan makro bawaan (pemeriksaan waktu kompilasi)
let users = sqlx::query_as!(
User,
"SELECT * FROM users WHERE name = ?",
username
)
.fetch_all(&pool)
.await
.unwrap();

// Menggunakan fungsi bawaan
let users: Vec<User> = sqlx::query_as::<_, User>(
"SELECT * FROM users WHERE name = ?"
)
.bind(&username)
.fetch_all(&pool)
.await
.unwrap();
```

### Contoh Stored Procedure

SQL yang Anda tulis di aplikasi web Anda bukanlah satu-satunya tempat kerentanan injeksi SQL dapat muncul. Jika Anda menggunakan Stored Procedure, dan Anda secara dinamis membangun SQL di dalamnya, Anda juga dapat memperkenalkan kerentanan injeksi SQL.

SQL dinamis dapat diparameterisasi menggunakan variabel bind, untuk memastikan SQL yang dibangun secara dinamis aman.

Berikut adalah beberapa contoh penggunaan variabel bind dalam stored procedure di berbagai basis data.

#### Oracle menggunakan PL/SQL

##### Stored Procedure Normal

Tidak ada SQL dinamis yang dibuat. Parameter yang diteruskan ke prosedur tersimpan secara alami terikat ke lokasi mereka dalam kueri tanpa memerlukan hal khusus apa pun:

```sql
PROCEDURE SafeGetBalanceQuery(UserID varchar, Dept varchar) AS BEGIN
SELECT balance FROM accounts_table WHERE user_ID = UserID AND department = Dept;
END;
```

##### Prosedur Tersimpan Menggunakan Variabel Bind dalam SQL Run dengan EXECUTE

Variabel bind digunakan untuk memberi tahu basis data bahwa input ke SQL dinamis ini adalah 'data' dan mungkin bukan kode:

```sql
PROCEDURE AnotherSafeGetBalanceQuery(UserID varchar, Dept varchar)
          AS stmt VARCHAR(400); result NUMBER;
BEGIN
   stmt := 'SELECT balance FROM accounts_table WHERE user_ID = :1
            AND department = :2';
   EXECUTE IMMEDIATE stmt INTO result USING UserID, Dept;
   RETURN result;
END;
```

#### SQL Server menggunakan Transact-SQL

##### Prosedur Tersimpan Normal

Tidak ada SQL dinamis yang dibuat. Parameter yang diteruskan ke prosedur tersimpan secara alami terikat ke lokasi mereka dalam kueri tanpa memerlukan hal khusus apa pun:

```sql
PROCEDURE SafeGetBalanceQuery(@UserID varchar(20), @Dept varchar(10)) AS BEGIN
SELECT balance FROM accounts_table WHERE user_ID = @UserID AND department = @Dept
END
```

##### Prosedur Tersimpan Menggunakan Variabel Bind dalam SQL Run dengan EXEC

Variabel Bind digunakan untuk memberi tahu basis data bahwa input ke SQL dinamis ini adalah 'data' dan mungkin bukan kode:

```sql
PROCEDURE SafeGetBalanceQuery(@UserID varchar(20), @Dept varchar(10)) AS BEGIN
DECLARE @sql VARCHAR(200)
SELECT @sql = 'SELECT balance FROM accounts_table WHERE '
+ 'user_ID = @UID AND department = @DPT'
EXEC sp_executesql @sql, '@UID VARCHAR(20), @DPT VARCHAR(10)',
@UID=@UserID, @DPT=@Dept
END
```

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah validasi input yang rentan:

### 1. Gunakan Pernyataan yang Disiapkan dengan Kueri Berparameter
- Selalu gunakan pernyataan yang disiapkan dalam kueri basis data untuk memisahkan logika SQL dari input pengguna.
- Hindari konstruksi kueri dinamis menggunakan penggabungan atau interpolasi string.

### 2. Manfaatkan Kerangka Kerja ORM
- Gunakan kerangka kerja Pemetaan Relasional Objek (ORM) yang mendukung kueri berparameter secara default.
- Hindari melewati perlindungan ORM dengan menjalankan kueri mentah.

### 3. Validasi dan Bersihkan Input
- Lakukan validasi input untuk memastikan hanya tipe dan format data yang diharapkan yang diterima.
- Tolak atau bersihkan input berbahaya sebelum meneruskannya ke kueri.

### 4. Hindari Menggunakan Penggabungan String
- Jangan buat kueri SQL menggunakan input pengguna secara langsung dalam string. - Ganti konstruksi seperti `SELECT * FROM users WHERE name = '" + userInput + "'` dengan alternatif berparameter.

### 5. Gunakan Prosedur Tersimpan
- Manfaatkan prosedur tersimpan untuk operasi basis data jika berlaku.
- Pastikan bahwa prosedur tersimpan menggunakan input berparameter dan bebas dari kerentanan injeksi SQL.

### 6. Terapkan Hak Istimewa Terkecil untuk Akun Basis Data
- Gunakan akun basis data dengan hak istimewa minimal yang diperlukan untuk fungsionalitas aplikasi.
- Batasi akun dari menjalankan perintah yang berpotensi berbahaya seperti `DROP`, `ALTER`, atau `TRUNCATE`.

### 7. Hindari Karakter Khusus Bila Diperlukan
- Untuk sistem basis data yang tidak mendukung kueri berparameter, hindari karakter khusus dalam input menggunakan pustaka tepercaya.
- Hindari mengandalkan pelarian semata sebagai mitigasi.

### 8. Aktifkan Fitur Keamanan Khusus Basis Data
- Aktifkan fitur seperti daftar putih kueri atau sandboxing untuk membatasi cakupan eksekusi SQL. - Gunakan alat yang disediakan oleh basis data Anda untuk menganalisis dan mengurangi kueri yang berisiko.

### 9. Catat dan Pantau Aktivitas Basis Data
- Catat detail eksekusi kueri, termasuk nilai parameter, untuk mendeteksi aktivitas yang mencurigakan.

- Gunakan alat pemantauan basis data untuk mengidentifikasi potensi upaya injeksi.

### 10. Perbarui Pustaka dan Driver Secara Berkala
- Jaga pustaka dan driver basis data tetap mutakhir untuk mendapatkan manfaat dari patch dan peningkatan keamanan.

- Hindari penggunaan API yang tidak digunakan lagi atau tidak didukung untuk interaksi basis data.

### 11. Lakukan Pengujian Keamanan Secara Berkala
- Lakukan uji penetrasi dan pemindaian otomatis untuk mengidentifikasi kerentanan injeksi SQL.

- Gunakan alat seperti OWASP ZAP atau SQLMap untuk memvalidasi efektivitas parameterisasi.

### 12. Latih Pengembang tentang Praktik Kueri Aman
- Berikan edukasi kepada pengembang tentang risiko injeksi SQL dan pentingnya kueri berparameter.

- Gabungkan praktik pengodean yang aman ke dalam pedoman pengembangan.

## Referensi

- [Situs Bobby Tables (terinspirasi oleh komik web XKCD) memiliki banyak contoh dalam berbagai bahasa tentang Pernyataan Tersiap dan Prosedur Tersimpan yang diparameterisasi](http://bobby-tables.com/)
- **Lembar contekan pencegahan injeksi SQL** OWASP

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `