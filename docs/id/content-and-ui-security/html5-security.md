---
sidebar_position: 3
---

# Keamanan HTML5

## Pengantar Keamanan HTML5

Lembar contekan berikut berfungsi sebagai panduan untuk mengimplementasikan HTML 5 dengan cara yang aman.

## API Komunikasi

### Perpesanan Web

Perpesanan Web (juga dikenal sebagai Perpesanan Lintas Domain) menyediakan sarana pengiriman pesan antar dokumen dari sumber yang berbeda dengan cara yang secara umum lebih aman daripada berbagai peretasan yang digunakan di masa lalu untuk menyelesaikan tugas ini. Namun, masih ada beberapa rekomendasi yang perlu diingat:

- Saat mengeposkan pesan, nyatakan secara eksplisit asal yang diharapkan sebagai argumen kedua untuk `postMessage` daripada `*` untuk mencegah pengiriman pesan ke asal yang tidak diketahui setelah pengalihan atau beberapa cara lain untuk mengubah asal jendela target.
- Halaman penerima harus **selalu**:
- Periksa atribut `origin` pengirim untuk memverifikasi bahwa data berasal dari lokasi yang diharapkan.
- Lakukan validasi input pada atribut `data` peristiwa untuk memastikan bahwa data tersebut dalam format yang diinginkan.
- Jangan berasumsi Anda memiliki kendali atas atribut `data`. Satu kelemahan **Cross Site Scripting** di halaman pengiriman memungkinkan penyerang mengirim pesan dalam format apa pun.
- Kedua halaman seharusnya hanya mengartikan pesan yang dipertukarkan sebagai **data**. Jangan pernah mengevaluasi pesan yang diteruskan sebagai kode (misalnya melalui `eval()`) atau memasukkannya ke DOM halaman (misalnya melalui `innerHTML`), karena hal itu akan menciptakan kerentanan XSS berbasis DOM.
- Untuk menetapkan nilai data ke suatu elemen, alih-alih menggunakan metode yang tidak aman seperti `element.innerHTML=data;`, gunakan opsi yang lebih aman: `element.textContent=data;`
- Periksa asal dengan tepat agar sesuai dengan FQDN yang Anda harapkan. Perhatikan bahwa kode berikut: `if(message.origin.indexOf(".owasp.org")!=-1) { /* ... */ }` sangat tidak aman dan tidak akan memiliki perilaku yang diinginkan karena `owasp.org.attacker.com` akan cocok.
- Jika Anda perlu menyematkan konten eksternal/gadget yang tidak tepercaya dan mengizinkan skrip yang dikendalikan pengguna (yang sangat tidak disarankan).

### Berbagi Sumber Daya Lintas Asal

- Validasi URL yang diteruskan ke `XMLHttpRequest.open`. Peramban saat ini mengizinkan URL ini menjadi lintas domain; perilaku ini dapat menyebabkan penyuntikan kode oleh penyerang jarak jauh. Berikan perhatian ekstra pada URL absolut.
- Pastikan bahwa URL yang merespons dengan `Access-Control-Allow-Origin: *` tidak menyertakan konten atau informasi sensitif apa pun yang dapat membantu penyerang dalam serangan lebih lanjut. Gunakan header `Access-Control-Allow-Origin` hanya pada URL terpilih yang perlu diakses lintas domain. Jangan gunakan header untuk seluruh domain.
- Izinkan hanya domain tertentu yang tepercaya di header `Access-Control-Allow-Origin`. Lebih baik mengizinkan domain tertentu daripada memblokir atau mengizinkan domain mana pun (jangan gunakan karakter pengganti `*` atau mengembalikan konten header `Origin` tanpa pemeriksaan apa pun).
- Perlu diingat bahwa CORS tidak mencegah data yang diminta masuk ke lokasi yang tidak sah. Tetap penting bagi server untuk melakukan pencegahan **CSRF** yang biasa.
- Meskipun [Fetch Standard](https://fetch.spec.whatwg.org/#http-cors-protocol) merekomendasikan permintaan pra-penerbangan dengan kata kerja `OPTIONS`, implementasi saat ini mungkin tidak melakukan permintaan ini, jadi penting bahwa permintaan "biasa" (`GET` dan `POST`) melakukan kontrol akses yang diperlukan.
- Buang permintaan yang diterima melalui HTTP biasa dengan asal HTTPS untuk mencegah bug konten campuran. - Jangan hanya mengandalkan header Origin untuk pemeriksaan Access Control. Browser selalu mengirimkan header ini dalam permintaan CORS, tetapi mungkin dipalsukan di luar browser. Protokol tingkat aplikasi harus digunakan untuk melindungi data sensitif.

### WebSockets

- Hilangkan kompatibilitas mundur pada klien/server yang diterapkan dan gunakan hanya versi protokol di atas hybi-00. Versi Hixie-76 yang populer (hiby-00) dan yang lebih lama sudah ketinggalan zaman dan tidak aman.
- Versi yang direkomendasikan yang didukung dalam versi terbaru dari semua browser saat ini adalah [RFC 6455](http://tools.ietf.org/html/rfc6455) (didukung oleh Firefox 11+, Chrome 16+, Safari 6, Opera 12.50, dan IE10).
- Meskipun relatif mudah untuk menyalurkan layanan TCP melalui WebSockets (misalnya VNC, FTP), tindakan tersebut memungkinkan akses ke layanan yang disalurkan ini untuk penyerang dalam browser jika terjadi serangan Cross Site Scripting. Layanan ini mungkin juga dipanggil langsung dari halaman atau program jahat.
- Protokol tidak menangani otorisasi dan/atau autentikasi. Protokol tingkat aplikasi harus menanganinya secara terpisah jika data sensitif sedang ditransfer.
- Memproses pesan yang diterima oleh websocket sebagai data. Jangan mencoba untuk menetapkannya langsung ke DOM atau mengevaluasinya sebagai kode. Jika responsnya adalah JSON, jangan pernah menggunakan fungsi `eval()` yang tidak aman; gunakan opsi aman JSON.parse() sebagai gantinya.
- Titik akhir yang diekspos melalui protokol `ws://` dapat dengan mudah dibalik menjadi teks biasa. Hanya `wss://` (WebSockets melalui SSL/TLS) yang harus digunakan untuk perlindungan terhadap serangan Man-In-The-Middle.
- Pemalsuan klien dimungkinkan di luar browser, sehingga server WebSockets harus dapat menangani input yang salah/berbahaya. Selalu validasi input yang datang dari situs jarak jauh, karena mungkin telah diubah.
- Saat mengimplementasikan server, periksa header `Origin:` di jabat tangan Websockets. Meskipun mungkin dipalsukan di luar browser, browser selalu menambahkan Asal halaman yang memulai koneksi Websockets. - Karena klien WebSockets di browser dapat diakses melalui panggilan JavaScript, semua komunikasi Websockets dapat dipalsukan atau dibajak melalui [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/). Selalu validasi data yang datang melalui koneksi WebSockets.

### Peristiwa yang Dikirim Server

- Validasi URL yang diteruskan ke konstruktor `EventSource`, meskipun hanya URL asal yang sama yang diizinkan.
- Seperti yang disebutkan sebelumnya, proses pesan (`event.data`) sebagai data dan jangan pernah mengevaluasi konten sebagai HTML atau kode skrip.
- Selalu periksa atribut asal pesan (`event.origin`) untuk memastikan pesan berasal dari domain tepercaya. Gunakan pendekatan daftar yang diizinkan.

## API Penyimpanan

### Penyimpanan Lokal

- Juga dikenal sebagai Penyimpanan Offline, Penyimpanan Web. Mekanisme penyimpanan yang mendasarinya dapat bervariasi dari satu agen pengguna ke agen pengguna lainnya. Dengan kata lain, autentikasi apa pun yang dibutuhkan aplikasi Anda dapat dilewati oleh pengguna dengan hak istimewa lokal ke mesin tempat data disimpan. Oleh karena itu, sebaiknya hindari menyimpan informasi sensitif apa pun di penyimpanan lokal tempat autentikasi diasumsikan.
- Karena jaminan keamanan browser, sebaiknya gunakan penyimpanan lokal tempat akses ke data tidak mengasumsikan autentikasi atau otorisasi.
- Gunakan objek sessionStorage alih-alih localStorage jika penyimpanan persisten tidak diperlukan. Objek sessionStorage hanya tersedia untuk jendela/tab tersebut hingga jendela ditutup.
- Satu [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/) dapat digunakan untuk mencuri semua data dalam objek ini, jadi sekali lagi sebaiknya jangan menyimpan informasi sensitif di penyimpanan lokal.
- Satu [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/) dapat digunakan untuk memuat data berbahaya ke dalam objek ini juga, jadi jangan anggap objek di sini dapat dipercaya. - Berikan perhatian ekstra pada panggilan "localStorage.getItem" dan "setItem" yang diterapkan di halaman HTML5. Ini membantu dalam mendeteksi saat pengembang membuat solusi yang menempatkan informasi sensitif di penyimpanan lokal, yang dapat menjadi risiko serius jika autentikasi atau otorisasi terhadap data tersebut diasumsikan secara tidak benar.

- Jangan simpan pengenal sesi di penyimpanan lokal karena data selalu dapat diakses oleh JavaScript. Cookie dapat mengurangi risiko ini menggunakan tanda `httpOnly`.

- Tidak ada cara untuk membatasi visibilitas objek ke jalur tertentu seperti dengan jalur atribut Cookie HTTP, setiap objek dibagikan dalam asal dan dilindungi dengan Kebijakan Asal yang Sama. Hindari menghosting beberapa aplikasi di asal yang sama, semuanya akan berbagi objek localStorage yang sama, gunakan subdomain yang berbeda sebagai gantinya.

### Basis data sisi klien

- Pada bulan November 2010, W3C mengumumkan Web SQL Database (basis data SQL relasional) sebagai spesifikasi yang tidak berlaku lagi. Indexed Database API atau IndexedDB (sebelumnya WebSimpleDB) standar baru tengah dikembangkan secara aktif, yang menyediakan penyimpanan basis data nilai kunci dan metode untuk menjalankan kueri tingkat lanjut.
- Mekanisme penyimpanan yang mendasarinya dapat bervariasi dari satu agen pengguna ke agen pengguna lainnya. Dengan kata lain, autentikasi apa pun yang dibutuhkan aplikasi Anda dapat dilewati oleh pengguna dengan hak istimewa lokal ke mesin tempat data disimpan. Oleh karena itu, sebaiknya jangan menyimpan informasi sensitif apa pun di penyimpanan lokal.
- Jika digunakan, konten WebDatabase di sisi klien dapat rentan terhadap injeksi SQL dan perlu memiliki validasi dan parameterisasi yang tepat.
- Seperti Penyimpanan Lokal, satu [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/) juga dapat digunakan untuk memuat data berbahaya ke dalam basis data web. Jangan anggap data di sini dapat dipercaya.

## Geolokasi

- [API Geolokasi](https://www.w3.org/TR/2021/WD-geolocation-20211124/#security) mengharuskan agen pengguna meminta izin pengguna sebelum menghitung lokasi. Apakah atau bagaimana keputusan ini diingat bervariasi dari satu browser ke browser lainnya. Beberapa agen pengguna mengharuskan pengguna untuk mengunjungi halaman tersebut lagi untuk menonaktifkan kemampuan mendapatkan lokasi pengguna tanpa bertanya, jadi untuk alasan privasi, sebaiknya minta masukan pengguna sebelum memanggil `getCurrentPosition` atau `watchPosition`.

## Pekerja Web

- Pekerja Web diizinkan untuk menggunakan objek `XMLHttpRequest` untuk melakukan permintaan Berbagi Sumber Daya Lintas Asal dan dalam domain. Lihat bagian yang relevan dari Lembar Contekan ini untuk memastikan keamanan CORS.
- Sementara Pekerja Web tidak memiliki akses ke DOM halaman pemanggil, Pekerja Web jahat dapat menggunakan CPU yang berlebihan untuk komputasi, yang mengarah ke kondisi Penolakan Layanan atau penyalahgunaan Berbagi Sumber Daya Lintas Asal untuk eksploitasi lebih lanjut. Pastikan kode dalam semua skrip Web Workers tidak jahat. Jangan izinkan pembuatan skrip Web Worker dari input yang diberikan pengguna.
- Validasi pesan yang dipertukarkan dengan Web Worker. Jangan mencoba untuk mempertukarkan cuplikan JavaScript untuk evaluasi, misalnya melalui `eval()` karena hal itu dapat menimbulkan kerentanan **DOM Based XSS**.

## Tabnabbing

Serangan dijelaskan secara terperinci dalam [artikel](https://owasp.org/www-community/attacks/Reverse_Tabnabbing) ini.

Singkatnya, ini adalah kapasitas untuk bertindak atas konten atau lokasi halaman induk dari halaman yang baru dibuka melalui tautan balik yang diekspos oleh instans objek JavaScript **pembuka**.

Ini berlaku untuk tautan HTML atau fungsi JavaScript `window.open` menggunakan atribut/instruksi `target` untuk menentukan [lokasi pemuatan target](https://www.w3schools.com/tags/att_a_target.asp) yang tidak menggantikan lokasi saat ini dan kemudian membuat jendela/tab saat ini tersedia.

Untuk mencegah masalah ini, tindakan berikut tersedia:

Potong tautan balik antara halaman induk dan halaman anak:

- Untuk tautan HTML:

Untuk memotong tautan balik ini, tambahkan atribut `rel="noopener"` pada tag yang digunakan untuk membuat tautan dari halaman induk ke halaman anak. Nilai atribut ini memotong tautan, tetapi bergantung pada browser, memungkinkan informasi rujukan hadir dalam permintaan ke halaman anak.

- Untuk juga menghapus informasi rujukan, gunakan nilai atribut ini: `rel="noopener noreferrer"`.
- Untuk fungsi JavaScript `window.open`, tambahkan nilai `noopener,noreferrer` di parameter [windowFeatures](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) dari fungsi `window.open`.

Karena perilaku penggunaan elemen di atas berbeda antara browser, gunakan tautan HTML atau JavaScript untuk membuka jendela (atau tab), lalu gunakan konfigurasi ini untuk memaksimalkan dukungan silang:

- Untuk [tautan HTML](https://www.scaler.com/topics/html/html-links/), tambahkan atribut `rel="noopener noreferrer"` ke setiap tautan.

- Untuk JavaScript, gunakan fungsi ini untuk membuka jendela (atau tab):

``` javascript
function openPopup(url, name, windowFeatures){
//Buka popup dan tetapkan instruksi kebijakan pembuka dan perujuk
var newWindow = window.open(url, name, 'noopener,noreferrer,' + windowFeatures);
//Atur ulang tautan pembuka
newWindow.opener = null; }
```

- Tambahkan header respons HTTP `Referrer-Policy: no-referrer` ke setiap respons HTTP yang dikirim oleh aplikasi ([Informasi Header Referrer-Policy](https://owasp.org/www-project-secure-headers/). Konfigurasi ini akan memastikan bahwa tidak ada informasi referrer yang dikirim bersama dengan permintaan dari halaman.

Matriks kompatibilitas:

- [noopener](https://caniuse.com/#search=noopener)
- [noreferrer](https://caniuse.com/#search=noreferrer)
- [referrer-policy](https://caniuse.com/#feat=referrer-policy)

## Bingkai yang di-sandbox

- Gunakan atribut `sandbox` dari `iframe` untuk konten yang tidak tepercaya.
- Atribut `sandbox` dari `iframe` mengaktifkan pembatasan pada konten dalam `iframe`. Pembatasan berikut aktif saat atribut `sandbox` ditetapkan:
1. Semua markup diperlakukan sebagai berasal dari asal yang unik.
2. Semua formulir dan skrip dinonaktifkan.
3. Semua tautan dicegah untuk menargetkan konteks penelusuran lain.
4. Semua fitur yang memicu secara otomatis diblokir.
5. Semua plugin dinonaktifkan.

Dimungkinkan untuk memiliki [kontrol terperinci](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox) atas kapabilitas `iframe` menggunakan nilai atribut `sandbox`.

- Pada versi lama agen pengguna yang tidak mendukung fitur ini, atribut ini akan diabaikan. Gunakan fitur ini sebagai lapisan perlindungan tambahan atau periksa apakah browser mendukung bingkai sandbox dan hanya tampilkan konten yang tidak tepercaya jika didukung. - Selain atribut ini, untuk mencegah serangan Clickjacking dan framing yang tidak diminta, disarankan untuk menggunakan header `X-Frame-Options` yang mendukung nilai `deny` dan `same-origin`. Solusi lain seperti framebusting `if(window!==window.top) { window.top.location=location;}` tidak disarankan.

## Petunjuk masukan Informasi Identitas Pribadi dan Kredensial (PII)

- Lindungi nilai masukan agar tidak di-cache oleh browser.

> Akses akun keuangan dari komputer umum. Meskipun seseorang dalam keadaan log-off, orang berikutnya yang menggunakan komputer tersebut dapat log-in karena fungsi pelengkapan otomatis browser. Untuk mengurangi hal ini, kami memberi tahu kolom masukan agar tidak membantu dengan cara apa pun.

```html
<input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></input>
```

Area teks dan kolom masukan untuk PII (nama, email, alamat, nomor telepon) dan kredensial login (nama pengguna, kata sandi) harus dicegah agar tidak disimpan di browser. Gunakan atribut HTML5 ini untuk mencegah browser menyimpan PII dari formulir Anda:

- `spellcheck="false"`
- `autocomplete="off"`
- `autocorrect="off"`
- `autocapitalize="off"`

## Aplikasi Offline

- Apakah agen pengguna meminta izin dari pengguna untuk menyimpan data untuk penjelajahan offline dan kapan cache ini dihapus, bervariasi dari satu browser ke browser lainnya. Peracunan cache menjadi masalah jika pengguna terhubung melalui jaringan yang tidak aman, jadi untuk alasan privasi, disarankan untuk meminta masukan pengguna sebelum mengirim file `manifest` apa pun.

- Pengguna hanya boleh menyimpan cache situs web tepercaya dan membersihkan cache setelah menjelajah melalui jaringan yang terbuka atau tidak aman.

## Peningkatan Progresif dan Risiko Degradasi yang Anggun

- Praktik terbaik sekarang adalah menentukan kapabilitas yang didukung browser dan melengkapinya dengan beberapa jenis pengganti untuk kapabilitas yang tidak didukung secara langsung. Ini dapat berarti elemen seperti bawang, misalnya gagal masuk ke Flash Player jika tag `<video>` tidak didukung, atau mungkin berarti kode skrip tambahan dari berbagai sumber yang harus ditinjau ulang kodenya.

## Header HTTP untuk meningkatkan keamanan

Lihat proyek [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/) untuk mendapatkan daftar header keamanan HTTP yang harus digunakan aplikasi untuk mengaktifkan pertahanan di tingkat browser.

## Petunjuk implementasi WebSocket

Selain elemen yang disebutkan di atas, berikut adalah daftar area yang harus diperhatikan selama implementasi.

- Penyaringan akses melalui header permintaan HTTP "Origin"
- Validasi Input/Output
- Autentikasi
- Otorisasi
- Pembatalan eksplisit token akses
- Kerahasiaan dan Integritas

Bagian di bawah ini akan mengusulkan beberapa petunjuk implementasi untuk setiap area dan akan disertai dengan contoh aplikasi yang menunjukkan semua poin yang dijelaskan.

Kode sumber lengkap dari contoh aplikasi tersedia [di sini](https://github.com/righettod/poc-websocket).

### Penyaringan akses

Selama inisiasi saluran websocket, browser mengirimkan header permintaan HTTP **Origin** yang berisi inisiasi domain sumber untuk permintaan yang akan dijabat tangan. Meskipun header ini dapat dipalsukan dalam permintaan HTTP palsu (bukan berbasis browser), header ini tidak dapat ditimpa atau dipaksakan dalam konteks browser. Header ini kemudian menjadi kandidat yang baik untuk menerapkan pemfilteran menurut nilai yang diharapkan.

Contoh serangan yang menggunakan vektor ini, yang diberi nama *Cross-Site WebSocket Hijacking (CSWSH)*, dijelaskan [di sini](https://www.christian-schneider.net/CrossSiteWebSocketHijacking.html).

Kode di bawah ini mendefinisikan konfigurasi yang menerapkan pemfilteran berdasarkan "daftar yang diizinkan" dari asal. Ini memastikan bahwa hanya asal yang diizinkan yang dapat membuat jabat tangan penuh:

``` java
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.server.ServerEndpointConfig;
import java.util.Arrays;
import java.util.List;

/**
 * Setup handshake rules applied to all WebSocket endpoints of the application.
 * Use to setup the Access Filtering using "Origin" HTTP header as input information.
 *
 * @see "http://docs.oracle.com/javaee/7/api/index.html?javax/websocket/server/
 * ServerEndpointConfig.Configurator.html"
 * @see "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin"
 */
public class EndpointConfigurator extends ServerEndpointConfig.Configurator {

    /**
     * Logger
     */
    private static final Logger LOG = LoggerFactory.getLogger(EndpointConfigurator.class);

    /**
     * Get the expected source origins from a JVM property in order to allow external configuration
     */
    private static final List<String> EXPECTED_ORIGINS =  Arrays.asList(System.getProperty("source.origins")
                                                          .split(";"));

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean checkOrigin(String originHeaderValue) {
        boolean isAllowed = EXPECTED_ORIGINS.contains(originHeaderValue);
        String safeOriginValue = Encode.forHtmlContent(originHeaderValue);
        if (isAllowed) {
            LOG.info("[EndpointConfigurator] New handshake request received from {} and was accepted.",
                      safeOriginValue);
        } else {
            LOG.warn("[EndpointConfigurator] New handshake request received from {} and was rejected !",
                      safeOriginValue);
        }
        return isAllowed;
    }

}
```

### Autentikasi dan Validasi Input/Output

Saat menggunakan websocket sebagai saluran komunikasi, penting untuk menggunakan metode autentikasi yang memungkinkan pengguna menerima *Token* akses yang tidak secara otomatis dikirim oleh browser dan kemudian harus secara eksplisit dikirim oleh kode klien selama setiap pertukaran.

Intisari HMAC adalah metode yang paling sederhana, dan [JSON Web Token](https://jwt.io/introduction/) adalah alternatif yang kaya fitur, karena memungkinkan pengangkutan informasi tiket akses dengan cara yang tidak memiliki status dan tidak dapat diubah. Selain itu, metode ini menentukan jangka waktu validitas.

[Skema Validasi JSON](http://json-schema.org/) digunakan untuk menentukan dan memvalidasi konten yang diharapkan dalam pesan input dan output.

Kode di bawah ini menentukan penanganan aliran pesan autentikasi lengkap:

**Titik akhir Web Socket Autentikasi** - Menyediakan titik akhir WS yang memungkinkan pertukaran autentikasi

``` java
import org.owasp.pocwebsocket.configurator.EndpointConfigurator;
import org.owasp.pocwebsocket.decoder.AuthenticationRequestDecoder;
import org.owasp.pocwebsocket.encoder.AuthenticationResponseEncoder;
import org.owasp.pocwebsocket.handler.AuthenticationMessageHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * Class in charge of managing the client authentication.
 *
 * @see "http://docs.oracle.com/javaee/7/api/javax/websocket/server/ServerEndpointConfig.Configurator.html"
 * @see "http://svn.apache.org/viewvc/tomcat/trunk/webapps/examples/WEB-INF/classes/websocket/"
 */
@ServerEndpoint(value = "/auth", configurator = EndpointConfigurator.class,
subprotocols = {"authentication"}, encoders = {AuthenticationResponseEncoder.class},
decoders = {AuthenticationRequestDecoder.class})
public class AuthenticationEndpoint {

    /**
     * Logger
     */
    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationEndpoint.class);

    /**
     * Handle the beginning of an exchange
     *
     * @param session Exchange session information
     */
    @OnOpen
    public void start(Session session) {
        //Define connection idle timeout and message limits in order to mitigate as much as possible
        //DOS attacks using massive connection opening or massive big messages sending
        int msgMaxSize = 1024 * 1024;//1 MB
        session.setMaxIdleTimeout(60000);//1 minute
        session.setMaxTextMessageBufferSize(msgMaxSize);
        session.setMaxBinaryMessageBufferSize(msgMaxSize);
        //Log exchange start
        LOG.info("[AuthenticationEndpoint] Session {} started", session.getId());
        //Affect a new message handler instance in order to process the exchange
        session.addMessageHandler(new AuthenticationMessageHandler(session.getBasicRemote()));
        LOG.info("[AuthenticationEndpoint] Session {} message handler affected for processing",
                  session.getId());
    }

    /**
     * Handle error case
     *
     * @param session Exchange session information
     * @param thr     Error details
     */
    @OnError
    public void onError(Session session, Throwable thr) {
        LOG.error("[AuthenticationEndpoint] Error occur in session {}", session.getId(), thr);
    }

    /**
     * Handle close event
     *
     * @param session     Exchange session information
     * @param closeReason Exchange closing reason
     */
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        LOG.info("[AuthenticationEndpoint] Session {} closed: {}", session.getId(),
                  closeReason.getReasonPhrase());
    }

}
```

**Penanganan pesan autentikasi** - Menangani semua permintaan autentikasi

``` java
import org.owasp.pocwebsocket.enumeration.AccessLevel;
import org.owasp.pocwebsocket.util.AuthenticationUtils;
import org.owasp.pocwebsocket.vo.AuthenticationRequest;
import org.owasp.pocwebsocket.vo.AuthenticationResponse;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.MessageHandler;
import javax.websocket.RemoteEndpoint;
import java.io.IOException;

/**
 * Handle authentication message flow
 */
public class AuthenticationMessageHandler implements MessageHandler.Whole<AuthenticationRequest> {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationMessageHandler.class);

    /**
     * Reference to the communication channel with the client
     */
    private RemoteEndpoint.Basic clientConnection;

    /**
     * Constructor
     *
     * @param clientConnection Reference to the communication channel with the client
     */
    public AuthenticationMessageHandler(RemoteEndpoint.Basic clientConnection) {
        this.clientConnection = clientConnection;
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public void onMessage(AuthenticationRequest message) {
        AuthenticationResponse response = null;
        try {
            //Authenticate
            String authenticationToken = "";
            String accessLevel = this.authenticate(message.getLogin(), message.getPassword());
            if (accessLevel != null) {
                //Create a simple JSON token representing the authentication profile
                authenticationToken = AuthenticationUtils.issueToken(message.getLogin(), accessLevel);
            }
            //Build the response object
            String safeLoginValue = Encode.forHtmlContent(message.getLogin());
            if (!authenticationToken.isEmpty()) {
                response = new AuthenticationResponse(true, authenticationToken, "Authentication succeed !");
                LOG.info("[AuthenticationMessageHandler] User {} authentication succeed.", safeLoginValue);
            } else {
                response = new AuthenticationResponse(false, authenticationToken, "Authentication failed !");
                LOG.warn("[AuthenticationMessageHandler] User {} authentication failed.", safeLoginValue);
            }
        } catch (Exception e) {
            LOG.error("[AuthenticationMessageHandler] Error occur in authentication process.", e);
            //Build the response object indicating that authentication fail
            response = new AuthenticationResponse(false, "", "Authentication failed !");
        } finally {
            //Send response
            try {
                this.clientConnection.sendObject(response);
            } catch (IOException | EncodeException e) {
                LOG.error("[AuthenticationMessageHandler] Error occur in response object sending.", e);
            }
        }
    }

    /**
     * Authenticate the user
     *
     * @param login    User login
     * @param password User password
     * @return The access level if the authentication succeed or NULL if the authentication failed
     */
    private String authenticate(String login, String password) {
      ....
    }
}
```

**Kelas utilitas untuk mengelola JWT** - Menangani penerbitan dan validasi token akses. JWT sederhana telah digunakan sebagai contoh (fokus di sini adalah pada implementasi titik akhir WS global)

``` java
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Calendar;
import java.util.Locale;

/**
 * Utility class to manage the authentication JWT token
 */
public class AuthenticationUtils {

    /**
     * Build a JWT token for a user
     *
     * @param login       User login
     * @param accessLevel Access level of the user
     * @return The Base64 encoded JWT token
     * @throws Exception If any error occur during the issuing
     */
    public static String issueToken(String login, String accessLevel) throws Exception {
        //Issue a JWT token with validity of 30 minutes
        Algorithm algorithm = Algorithm.HMAC256(loadSecret());
        Calendar c = Calendar.getInstance();
        c.add(Calendar.MINUTE, 30);
        return JWT.create().withIssuer("WEBSOCKET-SERVER").withSubject(login).withExpiresAt(c.getTime())
                  .withClaim("access_level", accessLevel.trim().toUpperCase(Locale.US)).sign(algorithm);
    }

    /**
     * Verify the validity of the provided JWT token
     *
     * @param token JWT token encoded to verify
     * @return The verified and decoded token with user authentication and
     * authorization (access level) information
     * @throws Exception If any error occur during the token validation
     */
    public static DecodedJWT validateToken(String token) throws Exception {
        Algorithm algorithm = Algorithm.HMAC256(loadSecret());
        JWTVerifier verifier = JWT.require(algorithm).withIssuer("WEBSOCKET-SERVER").build();
        return verifier.verify(token);
    }

    /**
     * Load the JWT secret used to sign token using a byte array for secret storage in order
     * to avoid persistent string in memory
     *
     * @return The secret as byte array
     * @throws IOException If any error occur during the secret loading
     */
    private static byte[] loadSecret() throws IOException {
        return Files.readAllBytes(Paths.get("src", "main", "resources", "jwt-secret.txt"));
    }
}
```

**Skema JSON dari pesan autentikasi input dan output** - Tentukan struktur yang diharapkan dari pesan input dan output dari sudut pandang titik akhir autentikasi

```json
{
    "$schema": "http://json-schema.org/schema#",
    "title": "AuthenticationRequest",
    "type": "object",
    "properties": {
    "login": {
        "type": "string",
        "pattern": "^[a-zA-Z]{1,10}$"
    },
    "password": {
        "type": "string"
    }
    },
    "required": [
    "login",
    "password"
    ]
}

{
"$schema": "http://json-schema.org/schema#",
"title": "AuthenticationResponse",
"type": "object",
"properties": {
    "isSuccess;": {
    "type": "boolean"
    },
    "token": {
    "type": "string",
    "pattern": "^[a-zA-Z0-9+/=\\._-]{0,500}$"
    },
    "message": {
    "type": "string",
    "pattern": "^[a-zA-Z0-9!\\s]{0,100}$"
    }
},
"required": [
    "isSuccess",
    "token",
    "message"
]
}
```

**Dekoder dan encoder pesan autentikasi** - Melakukan serialisasi/deserialisasi JSON dan validasi input/output menggunakan Skema JSON khusus. Hal ini memungkinkan untuk secara sistematis memastikan bahwa semua pesan yang diterima dan dikirim oleh titik akhir benar-benar mematuhi struktur dan konten yang diharapkan.

``` java
import com.fasterxml.jackson.databind.JsonNode;
import com.github.fge.jackson.JsonLoader;
import com.github.fge.jsonschema.core.exceptions.ProcessingException;
import com.github.fge.jsonschema.core.report.ProcessingReport;
import com.github.fge.jsonschema.main.JsonSchema;
import com.github.fge.jsonschema.main.JsonSchemaFactory;
import com.google.gson.Gson;
import org.owasp.pocwebsocket.vo.AuthenticationRequest;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;
import java.io.File;
import java.io.IOException;

/**
 * Decode JSON text representation to an AuthenticationRequest object
 * <p>
 * As there's one instance of the decoder class by endpoint session so we can use the
 * JsonSchema as decoder instance variable.
 */
public class AuthenticationRequestDecoder implements Decoder.Text<AuthenticationRequest> {

    /**
     * JSON validation schema associated to this type of message
     */
    private JsonSchema validationSchema = null;

    /**
     * Initialize decoder and associated JSON validation schema
     *
     * @throws IOException If any error occur during the object creation
     * @throws ProcessingException If any error occur during the schema loading
     */
    public AuthenticationRequestDecoder() throws IOException, ProcessingException {
        JsonNode node = JsonLoader.fromFile(
                        new File("src/main/resources/authentication-request-schema.json"));
        this.validationSchema = JsonSchemaFactory.byDefault().getJsonSchema(node);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AuthenticationRequest decode(String s) throws DecodeException {
        try {
            //Validate the provided representation against the dedicated schema
            //Use validation mode with report in order to enable further inspection/tracing
            //of the error details
            //Moreover the validation method "validInstance()" generate a NullPointerException
            //if the representation do not respect the expected schema
            //so it's more proper to use the validation method with report
            ProcessingReport validationReport = this.validationSchema.validate(JsonLoader.fromString(s),
                                                                               true);
            //Ensure there no error
            if (!validationReport.isSuccess()) {
                //Simply reject the message here: Don't care about error details...
                throw new DecodeException(s, "Validation of the provided representation failed !");
            }
        } catch (IOException | ProcessingException e) {
            throw new DecodeException(s, "Cannot validate the provided representation to a"
                                      + " JSON valid representation !", e);
        }

        return new Gson().fromJson(s, AuthenticationRequest.class);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean willDecode(String s) {
        boolean canDecode = false;

        //If the provided JSON representation is empty/null then we indicate that
        //representation cannot be decoded to our expected object
        if (s == null || s.trim().isEmpty()) {
            return canDecode;
        }

        //Try to cast the provided JSON representation to our object to validate at least
        //the structure (content validation is done during decoding)
        try {
            AuthenticationRequest test = new Gson().fromJson(s, AuthenticationRequest.class);
            canDecode = (test != null);
        } catch (Exception e) {
            //Ignore explicitly any casting error...
        }

        return canDecode;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void init(EndpointConfig config) {
        //Not used
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void destroy() {
        //Not used
    }
}
```

``` java
import com.fasterxml.jackson.databind.JsonNode;
import com.github.fge.jackson.JsonLoader;
import com.github.fge.jsonschema.core.exceptions.ProcessingException;
import com.github.fge.jsonschema.core.report.ProcessingReport;
import com.github.fge.jsonschema.main.JsonSchema;
import com.github.fge.jsonschema.main.JsonSchemaFactory;
import com.google.gson.Gson;
import org.owasp.pocwebsocket.vo.AuthenticationResponse;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import java.io.File;
import java.io.IOException;

/**
 * Encode AuthenticationResponse object to JSON text representation.
 * <p>
 * As there one instance of the encoder class by endpoint session so we can use
 * the JsonSchema as encoder instance variable.
 */
public class AuthenticationResponseEncoder implements Encoder.Text<AuthenticationResponse> {

    /**
     * JSON validation schema associated to this type of message
     */
    private JsonSchema validationSchema = null;

    /**
     * Initialize encoder and associated JSON validation schema
     *
     * @throws IOException If any error occur during the object creation
     * @throws ProcessingException If any error occur during the schema loading
     */
    public AuthenticationResponseEncoder() throws IOException, ProcessingException {
        JsonNode node = JsonLoader.fromFile(
                        new File("src/main/resources/authentication-response-schema.json"));
        this.validationSchema = JsonSchemaFactory.byDefault().getJsonSchema(node);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String encode(AuthenticationResponse object) throws EncodeException {
        //Generate the JSON representation
        String json = new Gson().toJson(object);
        try {
            //Validate the generated representation against the dedicated schema
            //Use validation mode with report in order to enable further inspection/tracing
            //of the error details
            //Moreover the validation method "validInstance()" generate a NullPointerException
            //if the representation do not respect the expected schema
            //so it's more proper to use the validation method with report
            ProcessingReport validationReport = this.validationSchema.validate(JsonLoader.fromString(json),
                                                                                true);
            //Ensure there no error
            if (!validationReport.isSuccess()) {
                //Simply reject the message here: Don't care about error details...
                throw new EncodeException(object, "Validation of the generated representation failed !");
            }
        } catch (IOException | ProcessingException e) {
            throw new EncodeException(object, "Cannot validate the generated representation to a"+
                                              " JSON valid representation !", e);
        }

        return json;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void init(EndpointConfig config) {
        //Not used
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void destroy() {
        //Not used
    }

}
```

Perhatikan bahwa pendekatan yang sama digunakan dalam bagian penanganan pesan dari POC. Semua pesan yang dipertukarkan antara klien dan server divalidasi secara sistematis menggunakan cara yang sama, menggunakan skema JSON khusus yang ditautkan ke Encoder/Decoder khusus pesan (serialisasi/deserialisasi).

### Pembatalan eksplisit token akses dan otorisasi

Informasi otorisasi disimpan dalam token akses menggunakan fitur *Klaim* JWT (dalam POC nama klaim adalah *access_level*). Otorisasi divalidasi saat permintaan diterima dan sebelum tindakan lain menggunakan informasi input pengguna.

Token akses diteruskan dengan setiap pesan yang dikirim ke titik akhir pesan dan daftar penolakan digunakan untuk memungkinkan pengguna meminta pembatalan token eksplisit.

Pembatalan token secara eksplisit menarik dari sudut pandang pengguna karena, sering kali ketika token digunakan, jangka waktu validitas token relatif panjang (umumnya jangka waktu valid lebih dari 1 jam) sehingga penting untuk memungkinkan pengguna memiliki cara untuk menunjukkan kepada sistem "Oke, saya telah menyelesaikan pertukaran saya dengan Anda, jadi Anda dapat menutup sesi pertukaran kita dan membersihkan tautan terkait".

Ini juga membantu pengguna untuk mencabut akses saat ini jika akses bersamaan yang berbahaya terdeteksi menggunakan token yang sama (kasus pencurian token).

**Daftar penolakan token** - Pertahankan daftar sementara menggunakan memori dan waktu terbatas Caching hash token yang tidak boleh digunakan lagi

``` java
import org.apache.commons.jcs.JCS;
import org.apache.commons.jcs.access.CacheAccess;
import org.apache.commons.jcs.access.exception.CacheException;

import javax.xml.bind.DatatypeConverter;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class to manage the access token that have been declared as no
 * more usable (explicit user logout)
 */
public class AccessTokenBlocklistUtils {
    /**
     * Message content send by user that indicate that the access token that
     * come along the message must be block-listed for further usage
     */
    public static final String MESSAGE_ACCESS_TOKEN_INVALIDATION_FLAG = "INVALIDATE_TOKEN";

    /**
     * Use cache to store block-listed token hash in order to avoid memory exhaustion and be consistent
     * because token are valid 30 minutes so the item live in cache 60 minutes
     */
    private static final CacheAccess<String, String> TOKEN_CACHE;

    static {
        try {
            TOKEN_CACHE = JCS.getInstance("default");
        } catch (CacheException e) {
            throw new RuntimeException("Cannot init token cache !", e);
        }
    }

    /**
     * Add token into the denylist
     *
     * @param token Token for which the hash must be added
     * @throws NoSuchAlgorithmException If SHA256 is not available
     */
    public static void addToken(String token) throws NoSuchAlgorithmException {
        if (token != null && !token.trim().isEmpty()) {
            String hashHex = computeHash(token);
            if (TOKEN_CACHE.get(hashHex) == null) {
                TOKEN_CACHE.putSafe(hashHex, hashHex);
            }
        }
    }

    /**
     * Check if a token is present in the denylist
     *
     * @param token Token for which the presence of the hash must be verified
     * @return TRUE if token is block-listed
     * @throws NoSuchAlgorithmException If SHA256 is not available
     */
    public static boolean isBlocklisted(String token) throws NoSuchAlgorithmException {
        boolean exists = false;
        if (token != null && !token.trim().isEmpty()) {
            String hashHex = computeHash(token);
            exists = (TOKEN_CACHE.get(hashHex) != null);
        }
        return exists;
    }

    /**
     * Compute the SHA256 hash of a token
     *
     * @param token Token for which the hash must be computed
     * @return The hash encoded in HEX
     * @throws NoSuchAlgorithmException If SHA256 is not available
     */
    private static String computeHash(String token) throws NoSuchAlgorithmException {
        String hashHex = null;
        if (token != null && !token.trim().isEmpty()) {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes());
            hashHex = DatatypeConverter.printHexBinary(hash);
        }
        return hashHex;
    }

}
```

**Penanganan pesan** - Memproses permintaan dari pengguna untuk menambahkan pesan dalam daftar. Tampilkan contoh pendekatan validasi otorisasi

``` java
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.owasp.pocwebsocket.enumeration.AccessLevel;
import org.owasp.pocwebsocket.util.AccessTokenBlocklistUtils;
import org.owasp.pocwebsocket.util.AuthenticationUtils;
import org.owasp.pocwebsocket.util.MessageUtils;
import org.owasp.pocwebsocket.vo.MessageRequest;
import org.owasp.pocwebsocket.vo.MessageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.RemoteEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Handle message flow
 */
public class MessageHandler implements javax.websocket.MessageHandler.Whole<MessageRequest> {

    private static final Logger LOG = LoggerFactory.getLogger(MessageHandler.class);

    /**
     * Reference to the communication channel with the client
     */
    private RemoteEndpoint.Basic clientConnection;

    /**
     * Constructor
     *
     * @param clientConnection Reference to the communication channel with the client
     */
    public MessageHandler(RemoteEndpoint.Basic clientConnection) {
        this.clientConnection = clientConnection;
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public void onMessage(MessageRequest message) {
        MessageResponse response = null;
        try {
            /*Step 1: Verify the token*/
            String token = message.getToken();
            //Verify if is it in the block list
            if (AccessTokenBlocklistUtils.isBlocklisted(token)) {
                throw new IllegalAccessException("Token is in the block list !");
            }

            //Verify the signature of the token
            DecodedJWT decodedToken = AuthenticationUtils.validateToken(token);

            /*Step 2: Verify the authorization (access level)*/
            Claim accessLevel = decodedToken.getClaim("access_level");
            if (accessLevel == null || AccessLevel.valueOf(accessLevel.asString()) == null) {
                throw new IllegalAccessException("Token have an invalid access level claim !");
            }

            /*Step 3: Do the expected processing*/
            //Init the list of the messages for the current user
            if (!MessageUtils.MESSAGES_DB.containsKey(decodedToken.getSubject())) {
                MessageUtils.MESSAGES_DB.put(decodedToken.getSubject(), new ArrayList<>());
            }

            //Add message to the list of message of the user if the message is a not a token invalidation
            //order otherwise add the token to the block list
            if (AccessTokenBlocklistUtils.MESSAGE_ACCESS_TOKEN_INVALIDATION_FLAG
                .equalsIgnoreCase(message.getContent().trim())) {
                AccessTokenBlocklistUtils.addToken(message.getToken());
            } else {
                MessageUtils.MESSAGES_DB.get(decodedToken.getSubject()).add(message.getContent());
            }

            //According to the access level of user either return only is message or return all message
            List<String> messages = new ArrayList<>();
            if (accessLevel.asString().equals(AccessLevel.USER.name())) {
                MessageUtils.MESSAGES_DB.get(decodedToken.getSubject())
                .forEach(s -> messages.add(String.format("(%s): %s", decodedToken.getSubject(), s)));
            } else if (accessLevel.asString().equals(AccessLevel.ADMIN.name())) {
                MessageUtils.MESSAGES_DB.forEach((k, v) ->
                v.forEach(s -> messages.add(String.format("(%s): %s", k, s))));
            }

            //Build the response object indicating that exchange succeed
            if (AccessTokenBlocklistUtils.MESSAGE_ACCESS_TOKEN_INVALIDATION_FLAG
                .equalsIgnoreCase(message.getContent().trim())) {
                response = new MessageResponse(true, messages, "Token added to the block list");
            }else{
                response = new MessageResponse(true, messages, "");
            }

        } catch (Exception e) {
            LOG.error("[MessageHandler] Error occur in exchange process.", e);
            //Build the response object indicating that exchange fail
            //We send the error detail on client because ware are in POC (it will not the case in a real app)
            response = new MessageResponse(false, new ArrayList<>(), "Error occur during exchange: "
                       + e.getMessage());
        } finally {
            //Send response
            try {
                this.clientConnection.sendObject(response);
            } catch (IOException | EncodeException e) {
                LOG.error("[MessageHandler] Error occur in response object sending.", e);
            }
        }
    }
}
```

### Kerahasiaan dan Integritas

Jika versi mentah protokol digunakan (protokol `ws://`) maka data yang ditransfer akan rentan terhadap penyadapan dan potensi perubahan mendadak.

Contoh penangkapan menggunakan [Wireshark](https://www.wireshark.org/) dan pencarian pertukaran kata sandi dalam file PCAP yang tersimpan, karakter yang tidak dapat dicetak telah dihapus secara eksplisit dari hasil perintah:

``` shell
$ grep -aE '(password)' capture.pcap
{"login":"bob","password":"bob123"}
```

There is a way to check, at WebSocket endpoint level, if the channel is secure by calling the method `isSecure()` on the *session* object instance.

Example of implementation in the method of the endpoint in charge of setup of the session and affects the message handler:

``` java
/**
 * Handle the beginning of an exchange
 *
 * @param session Exchange session information
 */
@OnOpen
public void start(Session session) {
    ...
    //Affect a new message handler instance in order to process the exchange only if the channel is secured
    if(session.isSecure()) {
        session.addMessageHandler(new AuthenticationMessageHandler(session.getBasicRemote()));
    }else{
        LOG.info("[AuthenticationEndpoint] Session {} do not use a secure channel so no message handler " +
                 "was affected for processing and session was explicitly closed !", session.getId());
        try{
            session.close(new CloseReason(CloseReason.CloseCodes.CANNOT_ACCEPT,"Insecure channel used !"));
        }catch(IOException e){
            LOG.error("[AuthenticationEndpoint] Session {} cannot be explicitly closed !", session.getId(),
                      e);
        }

    }
    LOG.info("[AuthenticationEndpoint] Session {} message handler affected for processing", session.getId());
}
```

Paparkan titik akhir WebSocket hanya pada protokol [wss://](https://kaazing.com/html5-websocket-security-is-strong/) (WebSockets melalui SSL/TLS) untuk memastikan *Kerahasiaan* dan *Integritas* lalu lintas seperti menggunakan HTTP melalui SSL/TLS untuk mengamankan pertukaran HTTP.

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `