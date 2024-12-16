---
sidebar_position: 3
---

# Manajemen Dependency yang Rentan

## Pengantar Manajemen Dependency yang Rentan

Tujuan lembar contekan ini adalah untuk memberikan usulan pendekatan terkait penanganan ketergantungan pihak ketiga yang rentan saat terdeteksi, dan ini, tergantung pada situasi yang berbeda.

Lembar contekan ini tidak berorientasi pada alat tetapi berisi bagian [alat](#Tools) yang memberi tahu pembaca tentang solusi gratis dan komersial yang dapat digunakan untuk mendeteksi ketergantungan yang rentan, tergantung pada tingkat dukungan pada teknologi yang ada

**Catatan:**

Usulan yang disebutkan dalam lembar contekan ini bukanlah solusi yang ampuh (resep yang berhasil dalam semua situasi) tetapi dapat digunakan sebagai dasar dan disesuaikan dengan konteks Anda.

## Konteks

Sebagian besar proyek menggunakan ketergantungan pihak ketiga untuk mendelegasikan penanganan berbagai jenis operasi, _misalnya_ pembuatan dokumen dalam format tertentu, komunikasi HTTP, penguraian data dalam format tertentu, dll.

Ini adalah pendekatan yang baik karena memungkinkan tim pengembangan untuk fokus pada kode aplikasi nyata yang mendukung fitur bisnis yang diharapkan. Ketergantungan tersebut menimbulkan kerugian yang diharapkan, yaitu postur keamanan aplikasi nyata kini bergantung padanya.

Aspek ini dirujuk dalam proyek-proyek berikut:

- [OWASP TOP 10 2017](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/) di bawah poin *[A9 - Menggunakan Komponen dengan Kerentanan yang Diketahui](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A9-Using_Components_with_Known_Vulnerabilities.html)*.

- [Proyek Standar Verifikasi Keamanan Aplikasi OWASP](https://owasp.org/www-project-application-security-verification-standard/) di bawah bagian *V14.2 Ketergantungan*.

Berdasarkan konteks ini, penting bagi sebuah proyek untuk memastikan bahwa semua dependensi pihak ketiga yang diterapkan bebas dari masalah keamanan apa pun, dan jika dependensi tersebut mengandung masalah keamanan apa pun, tim pengembangan perlu menyadarinya dan menerapkan langkah-langkah mitigasi yang diperlukan untuk mengamankan aplikasi yang terpengaruh.

Sangat disarankan untuk melakukan analisis dependensi secara otomatis sejak awal proyek. Memang, jika tugas ini ditambahkan di tengah atau akhir proyek, hal itu dapat menyiratkan sejumlah besar pekerjaan untuk menangani semua masalah yang teridentifikasi dan itu pada gilirannya akan membebani tim pengembangan dan mungkin menghalangi kemajuan proyek yang sedang dikerjakan.

**Catatan:**

Di sisa lembar contekan, ketika kita merujuk ke *tim pengembangan* maka kita berasumsi bahwa tim tersebut berisi anggota dengan keterampilan keamanan aplikasi yang diperlukan atau dapat merujuk ke seseorang di perusahaan yang memiliki keterampilan semacam ini untuk menganalisis kerentanan yang memengaruhi dependensi.

## Catatan tentang deteksi

Penting untuk diingat berbagai cara penanganan masalah keamanan setelah ditemukan.

### 1. Pengungkapan yang bertanggung jawab

Lihat deskripsi [di sini](https://en.wikipedia.org/wiki/Responsible_disclosure).

Seorang peneliti menemukan kerentanan dalam suatu komponen, dan setelah bekerja sama dengan penyedia komponen, mereka menerbitkan [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) (terkadang pengenal kerentanan khusus dibuat untuk penyedia tetapi umumnya pengenal CVE lebih disukai) yang terkait dengan masalah yang memungkinkan referensi publik atas masalah tersebut serta perbaikan/mitigasi yang tersedia.

Jika penyedia tidak bekerja sama dengan baik dengan peneliti, hasil berikut diharapkan:

- CVE diterima oleh vendor tetapi penyedia [menolak untuk memperbaiki masalah](https://www.excellium-services.com/cert-xlm-advisory/cve-2019-7161/). - Sering kali, jika peneliti tidak menerima respons dalam 30 hari, mereka akan melanjutkan dan melakukan [pengungkapan penuh](#2.-full-disclosure) atas kerentanan tersebut.

Di sini, kerentanan selalu dirujuk dalam [basis data global CVE](https://nvd.nist.gov/vuln/data-feeds) yang digunakan, secara umum, oleh alat deteksi sebagai salah satu dari beberapa sumber masukan yang digunakan.

### 2. Pengungkapan penuh

Lihat deskripsi [di sini](https://en.wikipedia.org/wiki/Full_disclosure), di bagian bernama **Komputer** tentang **Keamanan Komputer**.

Peneliti memutuskan untuk merilis semua informasi termasuk kode/metode eksploitasi pada layanan seperti [milis Full Disclosure](https://seclists.org/fulldisclosure/), [Exploit-DB](https://www.exploit-db.com).

Di sini CVE tidak selalu dibuat, maka kerentanan tidak selalu ada di basis data global CVE yang menyebabkan alat deteksi berpotensi tidak menyadari kecuali alat tersebut menggunakan sumber masukan lain.

## Catatan tentang keputusan penanganan masalah keamanan

Ketika masalah keamanan terdeteksi, ada kemungkinan untuk memutuskan menerima risiko yang diwakili oleh masalah keamanan tersebut. Namun, keputusan ini harus diambil oleh [Chief Risk Officer](https://en.wikipedia.org/wiki/Chief_risk_officer) (yang dapat diganti dengan [Chief Information Security Officer](https://en.wikipedia.org/wiki/Chief_information_security_officer)) perusahaan berdasarkan masukan teknis dari tim pengembangan yang telah menganalisis masalah tersebut (lihat bagian *[Kasus](#cases)*) serta indikator skor CVE [CVSS](https://www.first.org/cvss/user-guide).

## Kasus

Ketika masalah keamanan terdeteksi, tim pengembangan dapat menghadapi salah satu situasi (disebut *Kasus* di bagian lain lembar contekan) yang disajikan di sub bagian di bawah ini.

Jika kerentanan berdampak pada [ketergantungan transitif](https://en.wikipedia.org/wiki/Transitive_dependency) maka tindakan akan diambil pada ketergantungan langsung proyek karena tindakan pada ketergantungan transitif sering kali berdampak pada stabilitas aplikasi.

Tindakan pada ketergantungan transitif mengharuskan tim pengembangan untuk sepenuhnya memahami hubungan/komunikasi/penggunaan lengkap dari ketergantungan tingkat pertama proyek hingga ketergantungan yang terdampak oleh kerentanan keamanan, tugas ini sangat memakan waktu.

### Kasus 1

#### Konteks

Versi komponen yang ditambal telah dirilis oleh penyedia.

#### Kondisi ideal penerapan pendekatan

Serangkaian pengujian unit atau integrasi atau fungsional atau keamanan otomatis tersedia untuk fitur aplikasi menggunakan ketergantungan yang terdampak yang memungkinkan untuk memvalidasi bahwa fitur tersebut operasional.

#### Pendekatan

**Langkah 1:**

Perbarui versi ketergantungan dalam proyek pada lingkungan pengujian.

**Langkah 2:**

Sebelum menjalankan pengujian, ada 2 jalur keluaran yang memungkinkan:

- Semua pengujian berhasil, sehingga pembaruan dapat didorong ke produksi.
- Satu atau beberapa pengujian gagal, ada beberapa jalur keluaran yang memungkinkan:
- Kegagalan disebabkan oleh perubahan dalam beberapa panggilan fungsi (misalnya tanda tangan, argumen, paket, dll.). Tim pengembangan harus memperbarui kode mereka agar sesuai dengan pustaka baru. Setelah selesai, jalankan kembali pengujian.
- Ketidakcocokan teknis dari dependensi yang dirilis (misalnya memerlukan versi runtime yang lebih baru) yang menyebabkan tindakan berikut:
1. Ajukan masalah tersebut ke penyedia.
2. Terapkan [Kasus 2](#kasus-2) sambil menunggu umpan balik dari penyedia.

### Kasus 2

#### Konteks

Penyedia memberi tahu tim bahwa akan butuh waktu lama untuk memperbaiki masalah tersebut dan, oleh karena itu, versi yang ditambal tidak akan tersedia dalam beberapa bulan.

#### Kondisi ideal penerapan pendekatan

Penyedia dapat membagikan salah satu hal di bawah ini dengan tim pengembangan:

- Kode eksploitasi.

- Daftar fungsi yang terdampak oleh kerentanan.

- Solusi untuk mencegah eksploitasi masalah.

#### Pendekatan

**Langkah 1:**

Jika solusi disediakan, solusi tersebut harus diterapkan dan divalidasi pada lingkungan pengujian, dan selanjutnya disebarkan ke produksi.

Jika penyedia telah memberi tim daftar fungsi yang terdampak, kode perlindungan harus membungkus panggilan ke fungsi-fungsi ini untuk memastikan bahwa data input dan output aman.

Selain itu, perangkat keamanan, seperti Web Application Firewall (WAF), dapat menangani masalah tersebut dengan melindungi aplikasi internal melalui validasi parameter dan dengan membuat aturan deteksi untuk pustaka tertentu tersebut. Namun, dalam lembar contekan ini, fokusnya ditetapkan pada level aplikasi untuk menambal kerentanan sedekat mungkin dengan sumbernya.

*Contoh penggunaan kode Java di mana fungsi yang terdampak mengalami masalah [Eksekusi Kode Jarak Jauh](https://www.netsparker.com/blog/web-security/remote-code-evaluation-execution/):*

```java
public void callFunctionWithRCEIssue(String externalInput){
//Terapkan validasi input pada input eksternal menggunakan regex
if(Pattern.matches("[a-zA-Z0-9]{1,50}", externalInput)){
//Panggil fungsi yang cacat menggunakan input yang aman
functionWithRCEIssue(externalInput);
}else{
//Catat deteksi eksploitasi
SecurityLogger.warn("Eksploitasi masalah RCE XXXXX terdeteksi!"); //Ajukan pengecualian yang mengarah ke kesalahan generik yang dikirim ke klien...
}
}
```

Jika penyedia tidak memberikan informasi apa pun tentang kerentanan, [Kasus 3](#-case-3) dapat diterapkan dengan melewati *langkah 2* dari kasus ini. Kami berasumsi di sini bahwa, setidaknya, [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) telah disediakan.

**Langkah 2:**

Jika penyedia telah memberikan kode eksploitasi kepada tim, dan tim membuat pembungkus keamanan di sekitar pustaka/kode yang rentan, jalankan kode eksploitasi untuk memastikan bahwa pustaka tersebut sekarang aman dan tidak memengaruhi aplikasi.

Jika Anda memiliki serangkaian pengujian unit atau integrasi atau fungsional atau keamanan otomatis yang ada untuk aplikasi, jalankan pengujian tersebut untuk memverifikasi bahwa kode perlindungan yang ditambahkan tidak memengaruhi stabilitas aplikasi.

Tambahkan komentar di proyek *README* yang menjelaskan bahwa masalah (sebutkan [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) terkait) ditangani selama waktu tunggu versi yang ditambal karena alat deteksi akan terus memunculkan peringatan tentang ketergantungan ini.

**Catatan:** Anda dapat menambahkan ketergantungan ke daftar abaikan, tetapi cakupan abaikan untuk ketergantungan ini hanya boleh mencakup [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) yang terkait dengan kerentanan karena ketergantungan dapat dipengaruhi oleh beberapa kerentanan yang masing-masing memiliki [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) sendiri.

### Kasus 3

#### Konteks

Penyedia memberi tahu tim bahwa mereka tidak dapat memperbaiki masalah tersebut, jadi tidak akan ada versi yang ditambal yang dirilis sama sekali (berlaku juga jika penyedia tidak ingin memperbaiki masalah atau tidak menjawab sama sekali).

Dalam kasus ini, satu-satunya informasi yang diberikan kepada tim pengembangan adalah [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures).

**Catatan:**

- Kasus ini benar-benar rumit dan memakan waktu dan umumnya digunakan sebagai pilihan terakhir.

- Jika dependensi yang terdampak adalah pustaka sumber terbuka, maka kami, tim pengembangan, dapat membuat tambalan dan membuat [permintaan tarik](https://help.github.com/en/articles/about-pull-requests) - dengan cara itu kami dapat melindungi perusahaan/aplikasi kami dari sumber tersebut serta membantu orang lain mengamankan aplikasi mereka.

#### Kondisi ideal penerapan pendekatan

Tidak ada yang spesifik karena di sini kita berada dalam kondisi *tambal sendiri*.

#### Pendekatan

**Langkah 1:**

Jika kita berada dalam kasus ini karena salah satu kondisi berikut, sebaiknya kita memulai studi paralel untuk menemukan komponen lain yang lebih terawat atau jika komponen tersebut merupakan komponen komersial dengan dukungan **maka berikan tekanan** pada penyedia dengan bantuan [Chief Risk Officer](https://en.wikipedia.org/wiki/Chief_risk_officer) (bisa juga menggunakan [Chief Information Security Officer](https://en.wikipedia.org/wiki/Chief_information_security_officer)):

- Penyedia tidak ingin memperbaiki masalah.

- Penyedia tidak menjawab sama sekali.

Dalam semua kasus, di sini, kita perlu menangani kerentanan sekarang juga.

**Langkah 2:**

Karena kita mengetahui dependensi yang rentan, kita tahu di mana dependensi tersebut digunakan dalam aplikasi (jika dependensi tersebut bersifat transitif, maka kita dapat mengidentifikasi dependensi tingkat pertama dengan menggunakannya menggunakan fitur bawaan [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment) atau sistem manajemen dependensi yang digunakan (Maven, Gradle, NuGet, npm, dll.). Perhatikan bahwa IDE juga digunakan untuk mengidentifikasi panggilan ke dependensi tersebut.

Mengidentifikasi panggilan ke dependensi ini baik-baik saja, tetapi ini adalah langkah pertama. Tim masih kekurangan informasi tentang jenis patching yang perlu dilakukan.

Untuk memperoleh informasi ini, tim menggunakan konten CVE untuk mengetahui jenis kerentanan yang memengaruhi dependensi. Properti `description` memberikan jawabannya: Injeksi SQL, Eksekusi Kode Jarak Jauh, Skrip Lintas Situs, Pemalsuan Permintaan Lintas Situs, dll.

Setelah mengidentifikasi 2 poin di atas, tim mengetahui jenis patching yang perlu dilakukan ([Kasus 2](#case-2) dengan kode perlindungan) dan tempat menambahkannya.

*Contoh:*

Tim memiliki aplikasi yang menggunakan API Jackson dalam versi yang terpapar pada [CVE-2016-3720](https://nvd.nist.gov/vuln/detail/CVE-2016-3720).

Uraian CVE adalah sebagai berikut:

```teks
Kerentanan entitas eksternal XML (XXE) di XmlMapper dalam ekstensi format Data untuk Jackson
(alias jackson-dataformat-xml) memungkinkan penyerang memiliki dampak yang tidak ditentukan melalui vektor yang tidak diketahui. ```

Berdasarkan informasi ini, tim menentukan bahwa perbaikan yang diperlukan adalah menambahkan **pra-validasi data XML apa pun** yang diteruskan ke API Jakson untuk mencegah kerentanan [entitas eksternal XML (XXE)](https://www.acunetix.com/blog/articles/xml-external-entity-xxe-vulnerabilities/).

**Langkah 3:**

Jika memungkinkan, buat pengujian unit yang meniru kerentanan untuk memastikan bahwa patch efektif dan memiliki cara untuk terus memastikan bahwa patch tersedia selama evolusi proyek.

Jika Anda memiliki serangkaian pengujian unit atau integrasi atau fungsional atau keamanan otomatis yang ada untuk aplikasi, jalankan pengujian tersebut untuk memverifikasi bahwa patch tidak memengaruhi stabilitas aplikasi.

### Kasus 4

#### Konteks

Ketergantungan yang rentan ditemukan selama salah satu situasi berikut di mana penyedia tidak menyadari kerentanan:

- Melalui penemuan posting pengungkapan penuh di Internet.
- Selama pengujian penetrasi.

#### Kondisi ideal penerapan pendekatan

Penyedia bekerja sama dengan Anda setelah diberi tahu tentang kerentanan tersebut.

#### Pendekatan

**Langkah 1:**

Beri tahu penyedia tentang kerentanan dengan membagikan posting tersebut kepada mereka.

**Langkah 2:**

Dengan menggunakan informasi dari postingan pengungkapan penuh atau umpan balik eksploitasi pentester, jika penyedia bekerja sama, terapkan [Kasus 2](#kasus-2), jika tidak, terapkan [Kasus 3](#kasus-3), dan alih-alih menganalisis informasi CVE, tim perlu menganalisis informasi dari postingan pengungkapan penuh/umpan balik eksploitasi pentester.

## Alat

Bagian ini mencantumkan beberapa alat yang dapat digunakan untuk menganalisis dependensi yang digunakan oleh proyek guna mendeteksi kerentanan.

Penting untuk memastikan, selama proses pemilihan alat deteksi dependensi yang rentan, bahwa alat ini:

- Menggunakan beberapa sumber masukan yang andal guna menangani kedua cara pengungkapan kerentanan.

- Dukungan untuk menandai masalah yang muncul pada komponen sebagai [false-positive](https://www.whitehatsec.com/glossary/content/false-positive).

- Free
    - [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/):
        - Full support: Java, .Net.
        - Experimental support: Python, Ruby, PHP (composer), NodeJS, C, C++.
    - [NPM Audit](https://docs.npmjs.com/cli/audit)
        - Full support: NodeJS, JavaScript.
        - HTML report available via this [module](https://www.npmjs.com/package/npm-audit-html).
    - [OWASP Dependency Track](https://dependencytrack.org/) can be used to manage vulnerable dependencies across an organization.
    - [ThreatMapper](https://github.com/deepfence/ThreatMapper)
        - Full support: Base OS, Java, NodeJS, JavaScript, Ruby, Python
        - Targets: Kubernetes (nodes and container), Docker (node and containers), Fargate (containers), Bare Metal/VM (Host and app)
- Commercial
    - [Snyk](https://snyk.io/) (open source and free option available):
        - [Full support](https://snyk.io/docs/) for many languages and package manager.
    - [JFrog XRay](https://jfrog.com/xray/):
        - [Full support](https://jfrog.com/integration/) for many languages and package manager.
    - [Renovate](https://renovatebot.com) (allow to detect old dependencies):
        - [Full support](https://renovatebot.com/docs/) for many languages and package manager.
    - [Requires.io](https://requires.io/) (allow to detect old dependencies - open source and free option available):
        - [Full support](https://requires.io/features/): Python only.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `