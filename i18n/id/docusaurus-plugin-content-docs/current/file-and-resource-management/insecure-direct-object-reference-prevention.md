---
sidebar_position: 2
---

# Pencegahan Insecure Direct Object Reference

## Pengantar untuk Insecure Direct Object Reference

Referensi Objek Langsung yang Tidak Aman (IDOR) adalah kerentanan yang muncul saat penyerang dapat mengakses atau mengubah objek dengan memanipulasi pengidentifikasi yang digunakan dalam URL atau parameter aplikasi web. Hal ini terjadi karena tidak adanya pemeriksaan kontrol akses, yang gagal memverifikasi apakah pengguna diizinkan untuk mengakses data tertentu.

## Contoh

Misalnya, saat pengguna mengakses profil mereka, aplikasi mungkin membuat URL seperti ini:

```
https://example.org/users/123
```

Angka 123 di URL adalah referensi langsung ke rekaman pengguna di basis data, yang sering kali diwakili oleh kunci utama. Jika penyerang mengubah angka ini menjadi 124 dan memperoleh akses ke informasi pengguna lain, aplikasi rentan terhadap Referensi Objek Langsung yang Tidak Aman. Hal ini terjadi karena aplikasi tidak memeriksa dengan benar apakah pengguna memiliki izin untuk melihat data untuk pengguna 124 sebelum menampilkannya.

Dalam beberapa kasus, pengenal mungkin tidak ada di URL, tetapi di badan POST, seperti yang ditunjukkan dalam contoh berikut:

```
<form action="/update_profile" method="post">
<!-- Kolom lain untuk memperbarui nama, email, dll. -->
<input type="hidden" name="user_id" value="12345">
<button type="submit">Perbarui Profil</button>
</form>
```

Dalam contoh ini, aplikasi memungkinkan pengguna untuk memperbarui profil mereka dengan mengirimkan formulir dengan ID pengguna di kolom tersembunyi. Jika aplikasi tidak melakukan kontrol akses yang tepat di sisi server, penyerang dapat memanipulasi kolom "user_id" untuk mengubah profil pengguna lain tanpa otorisasi.

## Kompleksitas pengenal

Dalam beberapa kasus, penggunaan pengenal yang lebih kompleks seperti GUID dapat membuat penyerang hampir tidak mungkin menebak nilai yang valid. Namun, bahkan dengan pengenal yang kompleks, pemeriksaan kontrol akses sangat penting. Jika penyerang memperoleh URL untuk objek yang tidak sah, aplikasi harus tetap memblokir upaya akses mereka.

## Mitigasi

Untuk mengurangi IDOR, terapkan pemeriksaan kontrol akses untuk setiap objek yang coba diakses pengguna. Kerangka kerja web sering kali menyediakan cara untuk memfasilitasi hal ini. Selain itu, gunakan pengenal kompleks sebagai tindakan pertahanan mendalam, tetapi ingat bahwa kontrol akses sangat penting bahkan dengan pengenal ini.

Hindari mengekspos pengenal di URL dan badan POST jika memungkinkan. Sebaliknya, tentukan pengguna yang saat ini diautentikasi dari informasi sesi. Saat menggunakan alur multi-langkah, berikan pengenal dalam sesi untuk mencegah gangguan.

Saat mencari objek berdasarkan kunci utama, gunakan kumpulan data yang dapat diakses pengguna. Misalnya, dalam Ruby on Rails:

```
// rentan, mencari semua proyek
@project = Project.find(params[:id])
// aman, mencari proyek yang terkait dengan pengguna saat ini
@project = @current_user.projects.find(params[:id])
```

Verifikasi izin pengguna setiap kali upaya akses dilakukan. Terapkan ini secara struktural menggunakan pendekatan yang direkomendasikan untuk kerangka web Anda.

Sebagai langkah pertahanan mendalam tambahan, ganti pengenal numerik yang dapat dihitung dengan pengenal acak yang lebih kompleks. Anda dapat mencapainya dengan menambahkan kolom dengan string acak dalam tabel basis data dan menggunakan string tersebut di URL, bukan kunci utama numerik. Pilihan lainnya adalah menggunakan UUID atau nilai acak panjang lainnya sebagai kunci utama. Hindari mengenkripsi pengenal karena dapat menjadi tantangan untuk melakukannya dengan aman.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `