---
sidebar_position: 2
---

# Penugasan Massal

## Pendahuluan tentang Penugasan Massal

Kerangka kerja perangkat lunak terkadang memungkinkan pengembang untuk secara otomatis mengikat parameter permintaan HTTP ke dalam variabel atau objek kode program untuk memudahkan pengembang dalam menggunakan kerangka kerja tersebut. Hal ini terkadang dapat menyebabkan kerugian.

Penyerang terkadang dapat menggunakan metodologi ini untuk membuat parameter baru yang tidak pernah dimaksudkan oleh pengembang yang pada gilirannya membuat atau menimpa variabel atau objek baru dalam kode program yang tidak dimaksudkan.

Ini disebut kerentanan **Penugasan Massal**.

### Nama Alternatif

Tergantung pada bahasa/kerangka kerja yang dimaksud, kerentanan ini dapat memiliki beberapa [nama alternatif](https://cwe.mitre.org/data/definitions/915.html):

- **Penugasan Massal:** Ruby on Rails, NodeJS.
- **Pengikatan Otomatis:** Spring MVC, ASP NET MVC.
- **Injeksi Objek:** PHP.

### Contoh

Misalkan ada formulir untuk mengedit informasi akun pengguna:

```html
<form>
     <input name="userid" type="text">
     <input name="password" type="text">
     <input name="email" text="text">
     <input type="submit">
</form>  
```

Berikut adalah objek yang diikat oleh formulir:

```java
public class User {
   private String userid;
   private String password;
   private String email;
   private boolean isAdmin;

   //Getters & Setters
}
```

Berikut adalah pengontrol yang menangani permintaan:

```java
@RequestMapping(value = "/addUser", method = RequestMethod.POST)
public String submit(User user) {
   userService.add(user);
   return "successPage";
}
```

Berikut ini adalah permintaan umumnya:

```text
POST /addUser
...
userid=bobbytables&password=hashedpass&email=bobby@tables.com
```

Dan berikut adalah eksploitasi di mana kami menetapkan nilai atribut `isAdmin` dari instance kelas `User`:

```text
POST /addUser
...
userid=bobbytables&password=hashedpass&email=bobby@tables.com&isAdmin=true
```

### Eksploitasi

Fungsionalitas ini menjadi dapat dieksploitasi saat:

- Penyerang dapat menebak bidang sensitif yang umum.

- Penyerang memiliki akses ke kode sumber dan dapat meninjau model untuk bidang sensitif.

- DAN objek dengan bidang sensitif memiliki konstruktor kosong.

### Studi kasus GitHub

Pada tahun 2012, GitHub diretas menggunakan penugasan massal. Seorang pengguna dapat mengunggah kunci publiknya ke organisasi mana pun dan dengan demikian membuat perubahan berikutnya dalam repositori mereka. [Posting Blog GitHub](https://blog.github.com/2012-03-04-public-key-security-vulnerability-and-mitigation/).

### Solusi

- Daftarkan bidang yang dapat diikat dan tidak sensitif ke daftar yang diizinkan.

- Daftarkan bidang sensitif yang tidak dapat diikat ke daftar yang diblokir.

- Gunakan [Objek Transfer Data](https://martinfowler.com/eaaCatalog/dataTransferObject.html) (DTO).

## Solusi Umum

Pendekatan arsitektural adalah membuat Objek Transfer Data dan menghindari pengikatan input secara langsung ke objek domain. Hanya bidang yang dimaksudkan untuk dapat diedit oleh pengguna yang disertakan dalam DTO.

```java
public class UserRegistrationFormDTO {
 private String userid;
 private String password;
 private String email;

 //NOTE: isAdmin field is not present

 //Getters & Setters
}
```

## Solusi khusus Bahasa & Kerangka Kerja

### Spring MVC

#### Daftar yang diizinkan

```java
@Controller
public class UserController
{
@InitBinder
public void initBinder(WebDataBinder binder, WebRequest request)
{
binder.setAllowedFields(["userid","password","email"]);
}
...
}
```

Lihat [di sini](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/validation/DataBinder.html#setAllowedFields-java.lang.String...-) untuk dokumentasinya.

#### Daftar yang diblokir

```java
@Controller
public class UserController
{
   @InitBinder
   public void initBinder(WebDataBinder binder, WebRequest request)
   {
      binder.setDisallowedFields(["isAdmin"]);
   }
...
}
```

Lihat [di sini](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/validation/DataBinder.html#setDisallowedFields-java.lang.String...-) untuk dokumentasinya.

### NodeJS + Mongoose

#### Daftar yang diizinkan

```javascript
var UserSchema = new mongoose.Schema({
userid: String,
password: String,
email : String,
isAdmin : Boolean,
});

UserSchema.statics = {
User.userCreateSafeFields: ['userid', 'password', 'email']
};

var User = mongoose.model('User', UserSchema);

_ = require('underscore'); var user = new User(_.pick(req.body, User.userCreateSafeFields));
```

Lihat [di sini](http://underscorejs.org/#pick) untuk dokumentasinya.

#### Daftar blokir

```javascript
var massAssign = require('mongoose-mass-assign');

var UserSchema = new mongoose.Schema({
userid: String,
password: String,
email : String,
isAdmin : { type: Boolean, protect: true, default: false }
});

UserSchema.plugin(massAssign);

var User = mongoose.model('User', UserSchema);

/** Metode statis, berguna untuk pembuatan **/
var user = User.massAssign(req.body);

/** Metode instan, berguna untuk pembaruan**/
var user = new User; user.massAssign(req.body);

/** Metode massUpdate statis **/
var input = { userid: 'bhelx', isAdmin: 'true' };
User.update({ '_id': someId }, { $set: User.massUpdate(input) }, console.log);
```

Lihat [di sini](https://www.npmjs.com/package/mongoose-mass-assign) untuk dokumentasinya.

### Ruby On Rails

Lihat [di sini](https://guides.rubyonrails.org/v3.2.9/security.html#mass-assignment) untuk dokumentasinya.

### Django

Lihat [di sini](https://coffeeonthekeyboard.com/mass-assignment-security-part-10-855/) untuk dokumentasinya.

### ASP NET

Lihat [di sini](https://odetocode.com/Blogs/scott/archive/2012/03/11/complete-guide-to-mass-assignment-in-asp-net-mvc.aspx) untuk dokumentasinya.

### PHP Laravel + Eloquent

#### Daftar yang diizinkan

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    private $userid;
    private $password;
    private $email;
    private $isAdmin;

    protected $fillable = array('userid','password','email');
}
```

Lihat [di sini](https://laravel.com/docs/5.2/eloquent#mass-assignment) untuk dokumentasinya.

#### Daftar blokir

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
private $userid;
private $password;
private $email;
private $isAdmin;

protected $guarded = array('isAdmin');
}
```

Lihat [di sini](https://laravel.com/docs/5.2/eloquent#mass-assignment) untuk dokumentasinya.

### Grails

Lihat [di sini](http://spring.io/blog/2012/03/28/secure-data-binding-with-grails/) untuk dokumentasinya.

### Mainkan

Lihat [di sini](https://www.playframework.com/documentation/1.4.x/controllers#nobinding) untuk dokumentasinya.

### Jackson (JSON Object Mapper)

Lihat [di sini](https://www.baeldung.com/jackson-field-serializable-deserializable-or-not) dan [di sini](http://lifelongprogrammer.blogspot.com/2015/09/using-jackson-view-to-protect-mass-assignment.html) untuk dokumentasinya.

### GSON (JSON Object Mapper)

Lihat [di sini](https://sites.google.com/site/gson/gson-user-guide#TOC-Excluding-Fields-From-Serialization-and-Deserialization) dan [di sini](https://stackoverflow.com/a/27986860) untuk dokumennya.

### JSON-Lib (JSON Object Mapper)

Lihat [di sini](http://json-lib.sourceforge.net/advanced.html) untuk dokumentasinya.

### Flexjson (JSON Object Mapper)

Lihat [di sini](http://flexjson.sourceforge.net/#Serialization) untuk dokumentasinya.

## Referensi dan bacaan selanjutnya

- [Mass Assignment, Rails and You](https://code.tutsplus.com/tutorials/mass-assignment-rails-and-you--net-31695)

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah validasi masukan yang rentan:

### 1. Gunakan Daftar yang Diizinkan untuk Atribut yang Dapat Ditugaskan
- Tetapkan secara eksplisit atribut mana yang aman untuk ditetapkan dalam model atau pengontrol.
- Hindari penggunaan karakter pengganti untuk mengizinkan penetapan atribut tanpa batas.

### 2. Nonaktifkan Penetapan Massal Secara Default
- Gunakan kerangka kerja atau pustaka yang menonaktifkan penetapan massal secara global.
- Tetapkan secara manual atribut yang akan diperbarui untuk setiap operasi.

### 3. Validasi Masukan Secara Eksplisit
- Validasi dan bersihkan data masukan untuk memastikan hanya atribut yang valid yang diproses.
- Tolak permintaan yang berisi parameter yang tidak diharapkan atau tambahan.

### 4. Terapkan Kontrol Akses Atribut Berbasis Peran
- Tetapkan atribut berdasarkan peran dan izin pengguna.
- Batasi akses ke bidang sensitif untuk pengguna yang tidak sah.

### 5. Gunakan Metode ORM yang Aman
- Manfaatkan metode Object-Relational Mapping (ORM) yang menerapkan pengetikan dan kontrol atribut yang kuat.
- Hindari memetakan input pengguna secara langsung ke bidang basis data tanpa validasi.

### 6. Hindari Menggunakan `update()` atau `save()` dengan Data yang Tidak Difilter
- Jangan meneruskan data yang disediakan pengguna secara langsung ke metode seperti `update()` atau `save()` dalam kerangka kerja.
- Gunakan penugasan eksplisit untuk setiap atribut tepercaya.

### 7. Tinjau dan Perkuat Titik Akhir API
- Audit titik akhir API untuk memastikannya tidak mengekspos atribut yang tidak diinginkan.
- Gunakan alat untuk menguji potensi kerentanan penugasan massal.

### 8. Catat dan Pantau Aktivitas Mencurigakan
- Catat upaya untuk mengubah atribut yang dibatasi.
- Pantau log untuk pola penyalahgunaan atau upaya akses yang tidak sah.

### 9. Latih Pengembang tentang Praktik Pengodean yang Aman
- Berikan edukasi kepada pengembang tentang risiko penugasan massal dan praktik terbaik untuk penanganan atribut yang aman. - Mengintegrasikan pedoman pengembangan yang aman ke dalam alur kerja tim.

### 10. Penilaian Keamanan Berkala
- Melakukan tinjauan kode dan uji penetrasi secara berkala untuk mengidentifikasi risiko penugasan massal.
- Memastikan mitigasi tetap efektif seiring dengan perkembangan aplikasi.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `