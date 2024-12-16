---
sidebar_position: 2
---

# Keamanan Transportasi Ketat HTTP

## Pengantar Keamanan Transportasi Ketat HTTP

HTTP [Keamanan Transportasi Ketat](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) (juga disebut **HSTS**) adalah peningkatan keamanan opt-in yang ditetapkan oleh aplikasi web melalui penggunaan header respons khusus. Setelah browser yang didukung menerima header ini, browser tersebut akan mencegah komunikasi apa pun dikirim melalui HTTP ke domain yang ditentukan dan sebagai gantinya akan mengirim semua komunikasi melalui HTTPS. Ini juga mencegah perintah klik HTTPS pada browser.

Spesifikasi tersebut telah dirilis dan dipublikasikan akhir tahun 2012 sebagai [RFC 6797](http://tools.ietf.org/html/rfc6797) (Keamanan Transportasi Ketat HTTP (HSTS)) oleh IETF.

## Ancaman

HSTS menangani ancaman berikut:

- Bookmark pengguna atau mengetik `http://example.com` secara manual dan menjadi sasaran penyerang perantara

- HSTS secara otomatis mengalihkan permintaan HTTP ke HTTPS untuk domain target
- Aplikasi web yang dimaksudkan untuk menjadi HTTPS murni secara tidak sengaja berisi tautan HTTP atau menyajikan konten melalui HTTP
- HSTS secara otomatis mengalihkan permintaan HTTP ke HTTPS untuk domain target
- Penyerang perantara mencoba untuk mencegat lalu lintas dari pengguna korban menggunakan sertifikat yang tidak valid dan berharap pengguna akan menerima sertifikat yang buruk

- HSTS tidak mengizinkan pengguna untuk mengabaikan pesan sertifikat yang tidak valid

## Contoh

Contoh sederhana, menggunakan max-age yang panjang (1 tahun = 31536000 detik). Contoh ini berbahaya karena tidak memiliki `includeSubDomains`:

`Strict-Transport-Security: max-age=31536000`

Contoh ini berguna jika semua subdomain saat ini dan mendatang akan menjadi HTTPS. Ini adalah opsi yang lebih aman tetapi akan memblokir akses ke halaman tertentu yang hanya dapat disajikan melalui HTTP:

`Strict-Transport-Security: max-age=31536000; includeSubDomains`

Contoh ini berguna jika semua subdomain saat ini dan mendatang akan menjadi HTTPS. Dalam contoh ini, kami menetapkan max-age yang sangat singkat jika terjadi kesalahan selama peluncuran awal:

`Strict-Transport-Security: max-age=86400; includeSubDomains`

**Direkomendasikan:**

- Jika pemilik situs ingin domain mereka disertakan dalam [daftar pramuat HSTS](https://hstspreload.org) yang dikelola oleh Chrome (dan digunakan oleh Firefox dan Safari), gunakan header di bawah ini.
- Mengirim perintah `preload` dari situs Anda dapat memiliki **KONSEKUENSI PERMANEN** dan mencegah pengguna mengakses situs Anda dan semua subdomainnya jika Anda merasa perlu beralih kembali ke HTTP. Harap baca detailnya di [penghapusan pramuat](https://hstspreload.org/#removal) sebelum mengirim header dengan `preload`.

`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

Tanda `preload` menunjukkan persetujuan pemilik situs untuk memuat domain mereka terlebih dahulu. Pemilik situs masih perlu mengirimkan domain ke daftar tersebut.

## Masalah

Pemilik situs dapat menggunakan HSTS untuk mengidentifikasi pengguna tanpa cookie. Hal ini dapat menyebabkan kebocoran privasi yang signifikan. Lihat [di sini](http://www.leviathansecurity.com/blog/the-double-edged-sword-of-hsts-persistence-and-privacy) untuk detail selengkapnya.

Cookie dapat dimanipulasi dari subdomain, jadi dengan menghilangkan opsi `includeSubDomains`, berbagai serangan terkait cookie dapat dicegah oleh HSTS dengan mewajibkan sertifikat yang valid untuk subdomain. Memastikan tanda `secure` ditetapkan pada semua cookie juga akan mencegah, beberapa, tetapi tidak semua, serangan yang sama.

## Dukungan Browser

Pada September 2019, HSTS didukung oleh [semua browser modern](https://caniuse.com/#feat=stricttransportsecurity), dengan satu-satunya pengecualian yang penting adalah Opera Mini.

## Mitigasi
Berikut adalah daftar mitigasi untuk mencegah HTTP Strict Transport Security:

### 1. Aktifkan HSTS di Server
- Tambahkan header `Strict-Transport-Security` dengan arahan yang sesuai dalam konfigurasi server.
- Contoh: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.

### 2. Verifikasi Implementasi HTTPS
- Pastikan semua lalu lintas web dilayani melalui HTTPS sebelum mengaktifkan HSTS.
- Gunakan sertifikat SSL/TLS yang valid.

### 3. Tetapkan Nilai Max-Age yang Tepat
- Mulailah dengan max-age yang lebih pendek (misalnya, `max-age=86400`) selama pengujian, lalu tingkatkan (misalnya, satu tahun) untuk produksi.

### 4. Sertakan Subdomain
- Gunakan perintah `includeSubDomains` untuk melindungi semua subdomain di bawah domain utama.

### 5. Pramuat dalam Daftar Pramuat HSTS
- Kirimkan domain ke [Daftar Pramuat HSTS](https://hstspreload.org/) untuk perlindungan tambahan.

### 6. Hindari Header HSTS pada Halaman Non-HTTPS
- Pastikan header HSTS hanya dikirim melalui koneksi HTTPS yang aman.

### 7. Uji Konfigurasi HSTS
- Gunakan alat seperti [SSL Labs](https://www.ssllabs.com/) atau alat pengembang browser untuk memverifikasi implementasi yang tepat.

## Referensi

- [Chromium Projects/HSTS](https://www.chromium.org/hsts/)
- **OWASP TLS Protection Cheat Sheet**
- [sslstrip](https://github.com/moxie0/sslstrip)
- [AppSecTutorial Series - Episode 4](https://www.youtube.com/watch?v=zEV3HOuM_Vw)
- [Nmap NSE script to detect HSTS configuration](https://github.com/icarot/NSE_scripts/blob/master/http-hsts-verify.nse)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `