---
sidebar_position: 1
---

# Pengalihan dan Penerusan yang Tidak Divalidasi

## Pendahuluan tentang Pengalihan dan Penerusan yang Tidak Divalidasi

Pengalihan dan penerusan yang tidak divalidasi mungkin terjadi saat aplikasi web menerima masukan yang tidak tepercaya yang dapat menyebabkan aplikasi web mengalihkan permintaan ke URL yang terdapat dalam masukan yang tidak tepercaya. Dengan mengubah masukan URL yang tidak tepercaya ke situs jahat, penyerang dapat berhasil meluncurkan penipuan phishing dan mencuri kredensial pengguna.

Karena nama server dalam tautan yang diubah identik dengan situs asli, upaya phishing mungkin tampak lebih tepercaya. Serangan pengalihan dan penerusan yang tidak divalidasi juga dapat digunakan untuk membuat URL yang akan lolos pemeriksaan kontrol akses aplikasi dan kemudian meneruskan penyerang ke fungsi istimewa yang biasanya tidak dapat diaksesnya.

## Pengalihan URL Aman

Saat kita ingin mengalihkan pengguna secara otomatis ke halaman lain (tanpa tindakan pengunjung seperti mengeklik hyperlink), Anda dapat menerapkan kode seperti berikut:

Java

```java
response.sendRedirect("http://www.mysite.com");
```

PHP

```php
<?php
/* Redirect browser */
header("Location: http://www.mysite.com");
/* Keluar untuk mencegah kode lainnya dijalankan */
exit;
?>
```

ASP .NET

```csharp
Response.Redirect("~/folder/Login.aspx")
```

Rails

```ruby
redirect_to login_path
```

Rust actix web

```rust
  Ok(HttpResponse::Found()
        .insert_header((header::LOCATION, "https://mysite.com/"))
        .finish())
```

Dalam contoh di atas, URL dideklarasikan secara eksplisit dalam kode dan tidak dapat dimanipulasi oleh penyerang.

## Pengalihan URL Berbahaya

Contoh berikut menunjukkan kode pengalihan dan penerusan yang tidak aman.

### Contoh Pengalihan URL Berbahaya 1

Kode Java berikut menerima URL dari parameter bernama `url` ([GET atau POST](https://docs.oracle.com/javaee/7/api/javax/servlet/ServletRequest.html#getParameter-java.lang.String-)) dan mengalihkan ke URL tersebut:

```java
response.sendRedirect(request.getParameter("url"));
```

Kode PHP berikut memperoleh URL dari string kueri (melalui parameter bernama `url`) dan kemudian mengalihkan pengguna ke URL tersebut. Selain itu, kode PHP setelah fungsi `header()` ini akan terus dijalankan, jadi jika pengguna mengonfigurasi browser mereka untuk mengabaikan pengalihan, mereka mungkin dapat mengakses sisa halaman.

```php
$redirect_url = $_GET['url'];
header("Location: " . $redirect_url);
```

Contoh serupa dari Kode C\# .NET yang Rentan:

```csharp
string url = request.QueryString["url"];
Response.Redirect(url); ```

Dan di Rails:

```ruby
redirect_to params[:url]
```

Rust actix web

```rust
Ok(HttpResponse::Found()
.insert_header((header::LOCATION, query_string.path.as_str()))
.finish())
```

Kode di atas rentan terhadap serangan jika tidak ada validasi atau kontrol metode tambahan yang diterapkan untuk memverifikasi kepastian URL. Kerentanan ini dapat digunakan sebagai bagian dari penipuan phishing dengan mengarahkan pengguna ke situs berbahaya.

Jika tidak ada validasi yang diterapkan, pengguna jahat dapat membuat hyperlink untuk mengarahkan pengguna Anda ke situs web jahat yang tidak divalidasi, misalnya:

```teks
http://example.com/example.php?url=http://malicious.example.com
```

Pengguna melihat tautan yang mengarah ke situs tepercaya asli (`example.com`) dan tidak menyadari pengalihan yang dapat terjadi

### Contoh Pengalihan URL Berbahaya 2

[Situs web ASP .NET MVC 1 & 2](https://docs.microsoft.com/en-us/aspnet/mvc/overview/security/preventing-open-redirection-attacks) sangat rentan terhadap serangan pengalihan terbuka. Untuk menghindari kerentanan ini, Anda perlu menerapkan MVC 3.

Kode untuk tindakan LogOn dalam aplikasi ASP.NET MVC 2 ditunjukkan di bawah ini. Setelah login berhasil, pengontrol mengembalikan pengalihan ke returnUrl. Anda dapat melihat bahwa tidak ada validasi yang dilakukan terhadap parameter returnUrl.

Tindakan LogOn ASP.NET MVC 2 di `AccountController.cs` (lihat tautan Microsoft Docs yang disediakan di atas untuk konteksnya):

```csharp
[HttpPost]
 public ActionResult LogOn(LogOnModel model, string returnUrl)
 {
   if (ModelState.IsValid)
   {
     if (MembershipService.ValidateUser(model.UserName, model.Password))
     {
       FormsService.SignIn(model.UserName, model.RememberMe);
       if (!String.IsNullOrEmpty(returnUrl))
       {
         return Redirect(returnUrl);
       }
       else
       {
         return RedirectToAction("Index", "Home");
       }
     }
     else
     {
       ModelState.AddModelError("", "The user name or password provided is incorrect.");
     }
   }

   // If we got this far, something failed, redisplay form
   return View(model);
 }
```

### Contoh Penerusan Berbahaya

Saat aplikasi mengizinkan masukan pengguna untuk meneruskan permintaan antara berbagai bagian situs, aplikasi harus memeriksa apakah pengguna berwenang untuk mengakses URL, menjalankan fungsi yang disediakannya, dan apakah permintaan URL tersebut sesuai.

Jika aplikasi gagal menjalankan pemeriksaan ini, URL yang dibuat penyerang dapat melewati pemeriksaan kontrol akses aplikasi dan kemudian meneruskan penyerang ke fungsi administratif yang biasanya tidak diizinkan.

Contoh:

```teks
http://www.example.com/function.jsp?fwd=admin.jsp
```

Kode berikut adalah servlet Java yang akan menerima permintaan `GET` dengan parameter URL bernama `fwd` dalam permintaan untuk meneruskan ke alamat yang ditentukan dalam parameter URL. Servlet akan mengambil nilai parameter URL [dari permintaan](https://docs.oracle.com/javaee/7/api/javax/servlet/ServletRequest.html#getParameter-java.lang.String-) dan menyelesaikan pemrosesan penerusan sisi server sebelum merespons ke browser.

```java
public class ForwardServlet extends HttpServlet
{
protected void doGet(HttpServletRequest request, HttpServletResponse response)
throws ServletException, IOException {
String query = request.getQueryString();
if (query.contains("fwd"))
{
String fwd = request.getParameter("fwd");
try
{
request.getRequestDispatcher(fwd).forward(request, response);
}
catch (ServletException e)
{
e.printStackTrace(); }
}
}
}
```

## Mencegah Pengalihan dan Penerusan yang Tidak Divalidasi

Penggunaan pengalihan dan penerusan yang aman dapat dilakukan dengan sejumlah cara:

- Hindari penggunaan pengalihan dan penerusan.
- Jika digunakan, jangan izinkan URL sebagai input pengguna untuk tujuan.
- Jika memungkinkan, minta pengguna memberikan nama pendek, ID, atau token yang dipetakan di sisi server ke URL target lengkap.
- Ini memberikan tingkat perlindungan tertinggi terhadap serangan yang merusak URL.
- Berhati-hatilah agar ini tidak menimbulkan kerentanan enumerasi tempat pengguna dapat beralih melalui ID untuk menemukan semua target pengalihan yang memungkinkan
- Jika input pengguna tidak dapat dihindari, pastikan **nilai** yang diberikan valid, sesuai untuk aplikasi, dan **diizinkan** untuk pengguna.
- Bersihkan input dengan membuat daftar URL tepercaya (daftar host atau regex).
- Ini harus didasarkan pada pendekatan daftar yang diizinkan, bukan daftar yang ditolak.
- Paksa semua pengalihan untuk terlebih dahulu melewati halaman yang memberi tahu pengguna bahwa mereka akan keluar dari situs Anda, dengan tujuan ditampilkan dengan jelas, dan minta mereka mengeklik tautan untuk mengonfirmasi.

### Memvalidasi URL

Memvalidasi dan membersihkan masukan pengguna untuk menentukan apakah URL aman bukanlah tugas yang mudah. ​​Petunjuk terperinci tentang cara menerapkan validasi URL dijelaskan **di Lembar Contekan Pencegahan Pemalsuan Permintaan Sisi Server**.

## Referensi

- [CWE Entry 601 on Open Redirects](http://cwe.mitre.org/data/definitions/601.html).
- [WASC Article on URL Redirector Abuse](http://projects.webappsec.org/w/page/13246981/URL%20Redirector%20Abuse)
- [Google blog article on the dangers of open redirects](http://googlewebmastercentral.blogspot.com/2009/01/open-redirect-urls-is-your-site-being.html).
- [Preventing Open Redirection Attacks (C\#)](http://www.asp.net/mvc/tutorials/security/preventing-open-redirection-attacks).

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `