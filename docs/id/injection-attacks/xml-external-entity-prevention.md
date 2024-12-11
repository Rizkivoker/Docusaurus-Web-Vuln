---
sidebar_position: 4
---

# Pencegahan XML External Entity

## Pengantar Pencegahan XML External Entity

*Injeksi Entitas Eksternal XML* (XXE), yang sekarang menjadi bagian dari [OWASP Top 10](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A4-XML_External_Entities_%28XXE%29) melalui titik **A4**, merupakan serangan terhadap aplikasi yang mengurai masukan XML. Masalah ini dirujuk dalam ID [611](https://cwe.mitre.org/data/definitions/611.html) dalam referensial [Common Weakness Enumeration](https://cwe.mitre.org/index.html). Serangan XXE terjadi saat input XML yang tidak tepercaya dengan **referensi ke entitas eksternal diproses oleh parser XML yang dikonfigurasi dengan lemah**, dan serangan ini dapat digunakan untuk melakukan beberapa insiden, termasuk:

- Serangan penolakan layanan pada sistem
- Serangan [Server Side Request Forgery](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery) (SSRF)
- Kemampuan untuk memindai port dari mesin tempat parser berada
- Dampak sistem lainnya.

Lembar contekan ini akan membantu Anda mencegah kerentanan ini.

Untuk informasi lebih lanjut tentang XXE, silakan kunjungi [XML External Entity (XXE)](https://en.wikipedia.org/wiki/XML_external_entity_attack).

## Panduan Umum

**Cara paling aman untuk mencegah XXE adalah dengan menonaktifkan DTD (Entitas Eksternal) sepenuhnya.** Bergantung pada parser, metodenya harus mirip dengan berikut ini:

``` java
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
```

Menonaktifkan [DTD](https://www.w3schools.com/xml/xml_dtd.asp) juga membuat parser aman terhadap serangan penolakan layanan (DOS) seperti [Billion Laughs](https://en.wikipedia.org/wiki/Billion_laughs_attack). **Jika tidak memungkinkan untuk menonaktifkan DTD sepenuhnya, maka entitas eksternal dan deklarasi tipe dokumen eksternal harus dinonaktifkan dengan cara yang khusus untuk setiap parser.**

**Panduan Pencegahan XXE Terperinci disediakan di bawah ini untuk beberapa bahasa (C++, Cold Fusion, Java, .NET, iOS, PHP, Python, Semgrep Rules) dan parser XML yang umum digunakan.**

## C/C++

### libxml2

Enum [xmlParserOption](http://xmlsoft.org/html/libxml-parser.html#xmlParserOption) tidak boleh memiliki opsi berikut yang ditetapkan:

- `XML_PARSE_NOENT`: Mengembangkan entitas dan menggantinya dengan teks pengganti
- `XML_PARSE_DTDLOAD`: Memuat DTD eksternal

Catatan:

Menurut: Menurut [ini post](https://mail.gnome.org/archives/xml/2012-October/msg00045.html), dimulai dengan libxml2 versi 2.9, XXE telah dinonaktifkan secara default sebagaimana yang dikomit oleh [patch](https://gitlab.gnome.org/GNOME/libxml2/commit/4629ee02ac649c27f9c0cf98ba017c6b5526070f) berikut.

Cari apakah API berikut sedang digunakan dan pastikan tidak ada `XML_PARSE_NOENT` dan `XML_PARSE_DTDLOAD` yang didefinisikan dalam parameter:

- `xmlCtxtReadDoc`
- `xmlCtxtReadFd`
- `xmlCtxtReadFile`
- `xmlCtxtReadIO`
- `xmlCtxtReadMemory`
- `xmlCtxtUseOptions`
- `xmlParseInNodeContext`
- `xmlReadDoc`
- `xmlReadFd`
- `xmlReadFile`
- `xmlReadIO`
- `xmlReadMemory`

### libxerces-c

Penggunaan `XercesDOMParser` lakukan ini untuk mencegah XXE:

``` cpp
XercesDOMParser *parser = new XercesDOMParser;
parser->setCreateEntityReferenceNodes(true);
parser->setDisableDefaultEntityResolution(true);
```

Penggunaan SAXParser, lakukan ini untuk mencegah XXE:

``` cpp
SAXParser* parser = new SAXParser;
parser->setDisableDefaultEntityResolution(true);
```

Penggunaan SAX2XMLReader, lakukan ini untuk mencegah XXE:

``` cpp
SAX2XMLReader* reader = XMLReaderFactory::createXMLReader(); parser->setFeature(XMLUni::fgXercesDisableDefaultEntityResolution, true);
```

## ColdFusion

Menurut [posting blog ini](https://hoyahaxa.blogspot.com/2022/11/on-coldfusion-xxe-and-other-xml-attacks.html), Adobe ColdFusion dan Lucee memiliki mekanisme bawaan untuk menonaktifkan dukungan untuk entitas XML eksternal.

### Adobe ColdFusion

Sejak ColdFusion 2018 Update 14 dan ColdFusion 2021 Update 4, semua fungsi ColdFusion asli yang memproses XML memiliki argumen parser XML yang menonaktifkan dukungan untuk entitas XML eksternal. Karena tidak ada pengaturan global yang menonaktifkan entitas eksternal, pengembang harus memastikan bahwa setiap panggilan fungsi XML menggunakan opsi keamanan yang benar.

Dari [dokumentasi untuk fungsi XmlParse()](https://helpx.adobe.com/coldfusion/cfml-reference/coldfusion-functions/functions-t-z/xmlparse.html), Anda dapat menonaktifkan XXE dengan kode di bawah ini:

```
<cfset parseroptions = structnew()>
<cfset parseroptions.ALLOWEXTERNALENTITIES = false>
<cfscript>
a = XmlParse("xml.xml", false, parseroptions);
writeDump(a);
</cfscript>
```

Anda dapat menggunakan struktur "parseroptions" yang ditunjukkan di atas sebagai argumen untuk mengamankan fungsi lain yang memproses XML juga, seperti:

```
XxmlSearch(xmldoc, xpath,parseroptions);

XmlTransform(xmldoc,xslt,parseroptions);

isXML(xmldoc,parseroptions);
```

### Lucee

Sejak Lucee 5.3.4.51 dan yang lebih baru, Anda dapat menonaktifkan dukungan untuk entitas eksternal XML dengan menambahkan yang berikut ke Application.cfc Anda:

```
this.xmlFeatures = {
     externalGeneralEntities: false,
     secure: true,
     disallowDoctypeDecl: true
};
```

Dukungan untuk entitas XML eksternal dinonaktifkan secara default sejak Lucee 5.4.2.10 dan Lucee 6.0.0.514.

## Java

**Karena sebagian besar parser XML Java mengaktifkan XXE secara default, bahasa ini sangat rentan terhadap serangan XXE, jadi Anda harus menonaktifkan XXE secara eksplisit untuk menggunakan parser ini dengan aman.** Bagian ini menjelaskan cara menonaktifkan XXE di parser XML Java yang paling umum digunakan.

### JAXP DocumentBuilderFactory, SAXParserFactory, dan DOM4J

Parser `DocumentBuilderFactory`, `SAXParserFactory`, dan `DOM4J` `XML` dapat dilindungi terhadap serangan XXE dengan teknik yang sama.

**Untuk singkatnya, kami hanya akan menunjukkan kepada Anda cara melindungi parser `DocumentBuilderFactory`. Petunjuk tambahan untuk melindungi parser ini disematkan dalam kode contoh**

Metode JAXP `DocumentBuilderFactory` [setFeature](https://docs.oracle.com/javase/7/docs/api/javax/xml/parsers/DocumentBuilderFactory.html#setFeature(java.lang.String,%20boolean)) memungkinkan pengembang untuk mengontrol fitur prosesor XML khusus implementasi mana yang diaktifkan atau dinonaktifkan.

Fitur-fitur ini dapat diatur di pabrik atau metode `XMLReader` [setFeature](https://docs.oracle.com/javase/7/docs/api/org/xml/sax/XMLReader.html#setFeature%28java.lang.String,%20boolean%29) yang mendasarinya.

**Setiap implementasi prosesor XML memiliki fiturnya sendiri yang mengatur bagaimana DTD dan entitas eksternal diproses. Dengan menonaktifkan pemrosesan DTD sepenuhnya, sebagian besar serangan XXE dapat dihindari, meskipun perlu juga menonaktifkan atau memverifikasi bahwa XInclude tidak diaktifkan.**

**Sejak JDK 6, tanda [FEATURE_SECURE_PROCESSING](https://docs.oracle.com/javase/6/docs/api/javax/xml/XMLConstants.html#FEATURE_SECURE_PROCESSING) dapat digunakan untuk menginstruksikan implementasi parser untuk memproses XML dengan aman**. Perilakunya bergantung pada implementasi. Ini dapat membantu mengatasi kehabisan sumber daya tetapi mungkin tidak selalu mengurangi perluasan entitas. Detail selengkapnya tentang bendera ini dapat ditemukan [di sini](https://docs.oracle.com/en/java/javase/13/security/java-api-xml-processing-jaxp-security-guide.html#GUID-88B04BE2-35EF-4F61-B4FA-57A0E9102342).

Untuk contoh cuplikan kode yang disorot sintaksis menggunakan `SAXParserFactory`, lihat [di sini](https://gist.github.com/asudhakar02/45e2e6fd8bcdfb4bc3b2).

Contoh kode yang menonaktifkan DTD (doctypes) secara keseluruhan:

``` java
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException; // catching unsupported features
import javax.xml.XMLConstants;

...

DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
String FEATURE = null;
try {
    // This is the PRIMARY defense. If DTDs (doctypes) are disallowed, almost all
    // XML entity attacks are prevented
    // Xerces 2 only - http://xerces.apache.org/xerces2-j/features.html#disallow-doctype-decl
    FEATURE = "http://apache.org/xml/features/disallow-doctype-decl";
    dbf.setFeature(FEATURE, true);

    // and these as well, per Timothy Morgan's 2014 paper: "XML Schema, DTD, and Entity Attacks"
    dbf.setXIncludeAware(false);

    // remaining parser logic
    ...
} catch (ParserConfigurationException e) {
    // This should catch a failed setFeature feature
    // NOTE: Each call to setFeature() should be in its own try/catch otherwise subsequent calls will be skipped.
    // This is only important if you're ignoring errors for multi-provider support.
    logger.info("ParserConfigurationException was thrown. The feature '" + FEATURE
    + "' is not supported by your XML processor.");
    ...
} catch (SAXException e) {
    // On Apache, this should be thrown when disallowing DOCTYPE
    logger.warning("A DOCTYPE was passed into the XML document");
    ...
} catch (IOException e) {
    // XXE that points to a file that doesn't exist
    logger.error("IOException occurred, XXE may still possible: " + e.getMessage());
    ...
}

// Load XML file or stream using a XXE agnostic configured parser...
DocumentBuilder safebuilder = dbf.newDocumentBuilder();
```

Jika Anda tidak dapat menonaktifkan DTD sepenuhnya:

``` java
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException; // catching unsupported features
import javax.xml.XMLConstants;

...

DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

String[] featuresToDisable = {
    // Xerces 1 - http://xerces.apache.org/xerces-j/features.html#external-general-entities
    // Xerces 2 - http://xerces.apache.org/xerces2-j/features.html#external-general-entities
    // JDK7+ - http://xml.org/sax/features/external-general-entities
    //This feature has to be used together with the following one, otherwise it will not protect you from XXE for sure
    "http://xml.org/sax/features/external-general-entities",

    // Xerces 1 - http://xerces.apache.org/xerces-j/features.html#external-parameter-entities
    // Xerces 2 - http://xerces.apache.org/xerces2-j/features.html#external-parameter-entities
    // JDK7+ - http://xml.org/sax/features/external-parameter-entities
    //This feature has to be used together with the previous one, otherwise it will not protect you from XXE for sure
    "http://xml.org/sax/features/external-parameter-entities",

    // Disable external DTDs as well
    "http://apache.org/xml/features/nonvalidating/load-external-dtd"
}

for (String feature : featuresToDisable) {
    try {    
        dbf.setFeature(FEATURE, false); 
    } catch (ParserConfigurationException e) {
        // This should catch a failed setFeature feature
        logger.info("ParserConfigurationException was thrown. The feature '" + feature
        + "' is probably not supported by your XML processor.");
        ...
    }
}

try {
    // Add these as per Timothy Morgan's 2014 paper: "XML Schema, DTD, and Entity Attacks"
    dbf.setXIncludeAware(false);
    dbf.setExpandEntityReferences(false);
        
    // As stated in the documentation, "Feature for Secure Processing (FSP)" is the central mechanism that will
    // help you safeguard XML processing. It instructs XML processors, such as parsers, validators, 
    // and transformers, to try and process XML securely, and the FSP can be used as an alternative to
    // dbf.setExpandEntityReferences(false); to allow some safe level of Entity Expansion
    // Exists from JDK6.
    dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);

    // And, per Timothy Morgan: "If for some reason support for inline DOCTYPEs are a requirement, then
    // ensure the entity settings are disabled (as shown above) and beware that SSRF attacks
    // (http://cwe.mitre.org/data/definitions/918.html) and denial
    // of service attacks (such as billion laughs or decompression bombs via "jar:") are a risk."

    // remaining parser logic
    ...
} catch (ParserConfigurationException e) {
    // This should catch a failed setFeature feature
    logger.info("ParserConfigurationException was thrown. The feature 'XMLConstants.FEATURE_SECURE_PROCESSING'"
    + " is probably not supported by your XML processor.");
    ...
} catch (SAXException e) {
    // On Apache, this should be thrown when disallowing DOCTYPE
    logger.warning("A DOCTYPE was passed into the XML document");
    ...
} catch (IOException e) {
    // XXE that points to a file that doesn't exist
    logger.error("IOException occurred, XXE may still possible: " + e.getMessage());
    ...
}

// Load XML file or stream using a XXE agnostic configured parser...
DocumentBuilder safebuilder = dbf.newDocumentBuilder();
```

[Xerces 1](https://xerces.apache.org/xerces-j/) [Fitur](https://xerces.apache.org/xerces-j/features.html):

- Jangan sertakan entitas eksternal dengan menyetel [fitur ini](https://xerces.apache.org/xerces-j/features.html#external-general-entities) ke `false`.

- Jangan sertakan entitas parameter dengan menyetel [fitur ini](https://xerces.apache.org/xerces-j/features.html#external-parameter-entities) ke `false`.

- Jangan sertakan DTD eksternal dengan menyetel [fitur ini](https://xerces.apache.org/xerces-j/features.html#load-external-dtd) ke `false`.

[Xerces 2](https://xerces.apache.org/xerces2-j/) [Fitur](https://xerces.apache.org/xerces2-j/features.html):

- Larang DTD sebaris dengan menyetel [fitur ini](https://xerces.apache.org/xerces2-j/features.html#disallow-doctype-decl) ke `true`.

- Jangan sertakan entitas eksternal dengan menyetel [fitur ini](https://xerces.apache.org/xerces2-j/features.html#external-general-entities) ke `false`.

- Jangan sertakan entitas parameter dengan menyetel [fitur ini](https://xerces.apache.org/xerces2-j/features.html#external-parameter-entities) ke `false`.

- Jangan sertakan DTD eksternal dengan menyetel [fitur ini](https://xerces.apache.org/xerces-j/features.html#load-external-dtd) ke `false`.

**Catatan:** Pertahanan di atas memerlukan Java 7 pembaruan 67, Java 8 pembaruan 20, atau yang lebih baru, karena tindakan pencegahan untuk `DocumentBuilderFactory` dan SAXParserFactory rusak di versi Java sebelumnya, per: [CVE-2014-6517](http://www.cvedetails.com/cve/CVE-2014-6517/).

### XMLInputFactory (parser StAX)

Parser [StAX](http://en.wikipedia.org/wiki/StAX) seperti [`XMLInputFactory`](http://docs.oracle.com/javase/7/docs/api/javax/xml/stream/XMLInputFactory.html) memungkinkan berbagai properti dan fitur untuk ditetapkan.

Untuk melindungi Java `XMLInputFactory` dari XXE, nonaktifkan DTD (doctypes) secara keseluruhan:

``` java
// Ini menonaktifkan DTD sepenuhnya untuk pabrik tersebut
xmlInputFactory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
```

atau jika Anda tidak dapat menonaktifkan DTD sepenuhnya:

``` java
// This causes XMLStreamException to be thrown if external DTDs are accessed.
xmlInputFactory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, "");
// disable external entities
xmlInputFactory.setProperty("javax.xml.stream.isSupportingExternalEntities", false);
```

Pengaturan `xmlInputFactory.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");` tidak diperlukan, karena XMLInputFactory bergantung pada Validator untuk melakukan validasi XML terhadap Skema. Periksa bagian [Validator](#Validator) untuk konfigurasi spesifik.

### Oracle DOM Parser

Ikuti [rekomendasi Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/18/adxdk/security-considerations-oracle-xml-developers-kit.html#GUID-45303542-41DE-4455-93B3-854A826EF8BB) misalnya:

``` java
// Perluas oracle.xml.parser.v2.XMLParser
DOMParser domParser = new DOMParser();

// Jangan perluas referensi entitas
domParser.setAttribute(DOMParser.EXPAND_ENTITYREF, false);

// dtdObj adalah contoh dari oracle.xml.parser.v2.DTD
domParser.setAttribute(DOMParser.DTD_OBJECT, dtdObj);

// Jangan izinkan lebih dari 11 level perluasan entitas
domParser.setAttribute(DOMParser.ENTITY_EXPANSION_DEPTH, 12);
```

### TransformerFactory

Untuk melindungi `javax.xml.transform.TransformerFactory` dari XXE, lakukan ini:

``` java
TransformerFactory tf = TransformerFactory.newInstance();
tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, ""); ```

### Validator

Untuk melindungi `javax.xml.validation.Validator` dari XXE, lakukan ini:

``` java
SchemaFactory factory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
factory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, "");
factory.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
Schema schema = factory.newSchema();
Validator validator = schema.newValidator();
validator.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, "");
validator.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, ""); ```

### SchemaFactory

Untuk melindungi `javax.xml.validation.SchemaFactory` dari XXE, lakukan ini:

``` java
SchemaFactory factory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
factory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, "");
factory.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
Schema schema = factory.newSchema(Sumber);
```

### SAXTransformerFactory

Untuk melindungi `javax.xml.transform.sax.SAXTransformerFactory` dari XXE, lakukan ini:

``` java
SAXTransformerFactory sf = SAXTransformerFactory.newInstance();
sf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
sf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
sf.newXMLFilter(Source);
```

**Catatan: Penggunaan `XMLConstants` berikut memerlukan JAXP 1.5, yang ditambahkan ke Java pada 7u40 dan Java 8:**

- `javax.xml.XMLConstants.ACCESS_EXTERNAL_DTD`
- `javax.xml.XMLConstants.ACCESS_EXTERNAL_SCHEMA`
- `javax.xml.XMLConstants.ACCESS_EXTERNAL_STYLESHEET`

### XMLReader

Untuk melindungi Java `org.xml.sax.XMLReader` dari serangan XXE, lakukan ini:

``` java
XMLReader reader = XMLReaderFactory.createXMLReader();
reader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true); // Ini mungkin tidak sepenuhnya diperlukan karena DTD tidak boleh diizinkan sama sekali, per baris sebelumnya.
reader.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
reader.setFeature("http://xml.org/sax/features/external-general-entities", false);
reader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```

### SAXReader

Untuk melindungi Java `org.dom4j.io.SAXReader` dari serangan XXE, lakukan ini:

``` java
saxReader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true); saxReader.setFeature("http://xml.org/sax/features/external-general-entities", false);
saxReader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```

Jika kode Anda tidak memiliki semua baris ini, Anda mungkin rentan terhadap serangan XXE.

### SAXBuilder

Untuk melindungi Java `org.jdom2.input.SAXBuilder` dari serangan XXE, larang DTD (doctype) sepenuhnya:

``` java
SAXBuilder builder = new SAXBuilder();
builder.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
Document doc = builder.build(new File(fileName)); ```

Alternatifnya, jika DTD tidak dapat dinonaktifkan sepenuhnya, nonaktifkan entitas eksternal dan perluasan entitas:

``` java
SAXBuilder builder = new SAXBuilder();
builder.setFeature("http://xml.org/sax/features/external-general-entities", false);
builder.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
builder.setExpandEntities(false);
Document doc = builder.build(new File(fileName)); ```

### No-op EntityResolver

Untuk API yang menggunakan `EntityResolver`, Anda dapat menetralkan kemampuan parser XML untuk menyelesaikan entitas dengan [menyediakan implementasi tanpa operasi](https://wiki.sei.cmu.edu/confluence/display/java/IDS17-J.+Prevent+XML+External+Entity+Attacks):

```java
public final class NoOpEntityResolver implements EntityResolver {
public InputSource resolveEntity(String publicId, String systemId) {
return new InputSource(new StringReader(""));
}
}

// ...

xmlReader.setEntityResolver(new NoOpEntityResolver());
documentBuilder.setEntityResolver(new NoOpEntityResolver()); ```

atau lebih sederhananya:

```java
EntityResolver noop = (publicId, systemId) -> new InputSource(new StringReader(""));
xmlReader.setEntityResolver(noop);
documentBuilder.setEntityResolver(noop);
```

### JAXB Unmarshaller

**Karena `javax.xml.bind.Unmarshaller` mengurai XML tetapi tidak mendukung tanda apa pun untuk menonaktifkan XXE, Anda harus mengurai XML yang tidak tepercaya melalui parser aman yang dapat dikonfigurasi terlebih dahulu, menghasilkan objek sumber sebagai hasilnya, dan meneruskan objek sumber ke Unmarshaller.** Misalnya:

``` java
SAXParserFactory spf = SAXParserFactory.newInstance();

//Opsi 1: Ini adalah pertahanan UTAMA terhadap XXE
spf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
spf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
spf.setXIncludeAware(false);

//Opsi 2: Jika menonaktifkan doctype tidak memungkinkan
spf.setFeature("http://xml.org/sax/features/external-general-entities", false);
spf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
spf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
spf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
spf.setXIncludeAware(false);

//Lakukan operasi unmarshall
Sumber xmlSource = new SAXSource(spf.newSAXParser().getXMLReader(),
new InputSource(new StringReader(xml))); JAXBContext jc = JAXBContext.newInstance(Object.class);

Unmarshaller um = jc.createUnmarshaller();

um.unmarshal(xmlSource);

```

### XPathExpression

**Karena `javax.xml.xpath.XPathExpression` tidak dapat dikonfigurasi dengan aman oleh dirinya sendiri, data yang tidak tepercaya harus diurai melalui parser XML lain yang dapat diamankan terlebih dahulu.**

Misalnya:

``` java
DocumentBuilderFactory df = DocumentBuilderFactory.newInstance();

df.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");

df.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

DocumentBuilder builder = df.newDocumentBuilder(); String hasil = new XPathExpression().evaluasi( builder.parse(
new ByteArrayInputStream(xml.getBytes())) ); ```

### java.beans.XMLDecoder

**Metode [readObject()](https://docs.oracle.com/javase/8/docs/api/java/beans/XMLDecoder.html#readObject--) di kelas ini pada dasarnya tidak aman.**

**XML yang diurai tidak hanya tunduk pada XXE, tetapi metode ini dapat digunakan untuk membuat objek Java apa pun, dan [mengeksekusi kode arbitrer seperti yang dijelaskan di sini](http://stackoverflow.com/questions/14307442/is-it-safe-to-use-xmldecoder-to-read-document-files).**

**Dan tidak ada cara untuk memanfaatkan kelas ini dengan aman kecuali dengan memercayai atau memvalidasi dengan benar input yang dimasukkan ke dalamnya.**

**Karena itu, kami sangat menyarankan untuk sepenuhnya menghindari penggunaan kelas ini dan menggantinya dengan parser XML yang aman atau dikonfigurasi dengan benar seperti yang dijelaskan di tempat lain dalam cheat ini sheet.**

### Parser XML Lainnya

**Ada banyak pustaka pihak ketiga yang mengurai XML baik secara langsung maupun melalui penggunaan pustaka lain. Harap uji dan verifikasi apakah parser XML mereka aman terhadap XXE secara default.** Jika parser tidak aman secara default, cari tanda yang didukung oleh parser untuk menonaktifkan semua kemungkinan penyertaan sumber daya eksternal seperti contoh yang diberikan di atas. Jika tidak ada kontrol yang terekspos ke luar, pastikan konten yang tidak tepercaya dilewatkan melalui parser yang aman terlebih dahulu, lalu diteruskan ke parser pihak ketiga yang tidak aman, mirip dengan cara Unmarshaller diamankan.

#### Kerentanan Spring Framework MVC/OXM XXE

**Beberapa kerentanan XXE ditemukan di [Spring OXM](https://pivotal.io/security/cve-2013-4152) dan [Spring MVC](https://pivotal.io/security/cve-2013-7315). Versi Spring Framework berikut rentan terhadap XXE:

- **3.0.0** hingga **3.2.3** (Spring OXM & Spring MVC)
- **4.0.0.M1** (Spring OXM)
- **4.0.0.M1-4.0.0.M2** (Spring MVC)

Ada juga masalah lain yang diperbaiki kemudian, jadi untuk mengatasi masalah ini sepenuhnya, Spring menyarankan Anda untuk memutakhirkan ke Spring Framework 3.2.8+ atau 4.0.2+.

Untuk Spring OXM, ini merujuk pada penggunaan org.springframework.oxm.jaxb.Jaxb2Marshaller. **Perhatikan bahwa CVE untuk Spring OXM secara khusus menunjukkan bahwa dua situasi penguraian XML merupakan tanggung jawab pengembang untuk memperbaikinya, dan dua lainnya merupakan tanggung jawab Spring dan telah diperbaiki untuk mengatasi CVE ini.**

Berikut ini yang mereka katakan:

Dua situasi yang harus ditangani pengembang:

- Untuk `DOMSource`, XML telah diurai oleh kode pengguna dan kode tersebut bertanggung jawab untuk melindungi dari XXE.

- Untuk `StAXSource`, XMLStreamReader telah dibuat oleh kode pengguna dan kode tersebut bertanggung jawab untuk melindungi dari XXE.

Masalah yang diperbaiki Spring:

Untuk instans SAXSource dan StreamSource, Spring memproses entitas eksternal secara default sehingga menciptakan kerentanan ini.

Berikut ini contoh penggunaan StreamSource yang rentan, tetapi sekarang aman, jika Anda menggunakan Spring OXM atau Spring MVC versi tetap:

``` java
import org.springframework.oxm.Jaxb2Marshaller;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;

Jaxb2Marshaller marshaller = new Jaxb2Marshaller(); // Harus mengembalikan Objek ke tipe apa pun yang Anda unmarshalling
marshaller.unmarshal(new StreamSource(new StringReader(some_string_containing_XML));
```

Jadi, menurut [penulisan Spring OXM CVE](https://pivotal.io/security/cve-2013-4152), hal di atas sekarang aman. Namun jika Anda menggunakan DOMSource atau StAXSource, terserah Anda untuk mengonfigurasi sumber tersebut agar aman dari XXE.

#### Castor

**Castor adalah kerangka kerja pengikatan data untuk Java. Kerangka kerja ini memungkinkan konversi antara objek Java, XML, dan tabel relasional. Fitur XML di Castor sebelum versi 1.3.3 rentan terhadap XXE, dan harus ditingkatkan ke versi terbaru.** Untuk informasi tambahan, periksa [konfigurasi XML] resmi file](https://castor-data-binding.github.io/castor/reference-guide/reference/xml/xml-properties.html)

## .NET

**Informasi terkini untuk injeksi XXE di .NET diambil langsung dari [aplikasi web pengujian unit oleh Dean Fleming](https://github.com/deanf1/dotnet-security-unit-tests), yang mencakup semua parser XML .NET yang saat ini didukung, dan memiliki kasus pengujian yang menunjukkan kapan parser aman dari injeksi XXE dan kapan tidak, tetapi pengujian ini hanya dilakukan dengan injeksi dari file dan bukan DTD langsung (digunakan oleh serangan DoS).**

Untuk serangan DoS yang menggunakan DTD langsung (seperti [serangan Billion laughs](https://en.wikipedia.org/wiki/Billion_laughs_attack)), [aplikasi pengujian terpisah dari Josh Grossman di Bounce Security](https://github.com/BounceSecurity/BillionLaughsTester) telah dibuat untuk memverifikasi bahwa .NET >=4.5.2 aman dari serangan ini.

Sebelumnya, informasi ini didasarkan pada beberapa artikel lama yang mungkin tidak 100% akurat termasuk:

- [Artikel .NET XXE karya James Jardine yang luar biasa](https://www.jardinesoftware.net/2016/05/26/xxe-and-net/).
- [Panduan dari Microsoft tentang cara mencegah XXE dan XML Denial of Service di .NET](http://msdn.microsoft.com/en-us/magazine/ee335713.aspx).

### Tinjauan Tingkat Keamanan Parser .NET

**Di bawah ini adalah tinjauan semua parser XML .NET yang didukung dan tingkat keamanan default-nya. Rincian lebih lanjut tentang setiap parser disertakan setelah daftar ini.

**XDocument (Ling ke XML)

Parser ini dilindungi dari entitas eksternal pada .NET Framework versi 4.5.2 dan dilindungi dari Billion Laughs pada versi 4.5.2 atau yang lebih tinggi, tetapi tidak pasti apakah parser ini dilindungi dari Billion Laughs sebelum versi 4.5.2.

#### Tingkat keamanan default XmlDocument, XmlTextReader, XPathNavigator

Parser ini rentan terhadap serangan entitas eksternal dan Billion Laughs pada versi di bawah versi 4.5.2 tetapi dilindungi pada versi yang sama atau lebih tinggi dari 4.5.2.

#### Tingkat keamanan bawaan XmlDictionaryReader, XmlNodeReader, XmlReader

Pengurai ini tidak rentan terhadap serangan entitas eksternal atau Billion Laughs sebelum atau sesudah versi 4.5.2. Selain itu, pada atau lebih tinggi dari versi ≥4.5.2, pustaka ini bahkan tidak akan memproses DTD sebaris secara bawaan. Bahkan jika Anda mengubah bawaan untuk mengizinkan pemrosesan DTD, jika upaya DoS dilakukan, pengecualian akan tetap muncul seperti yang didokumentasikan di atas.

### ASP.NET

Aplikasi ASP.NET ≥ .NET 4.5.2 juga harus memastikan pengaturan `<httpRuntime targetFramework="..." />` di `Web.config` mereka ke ≥4.5.2 atau berisiko menjadi rentan terlepas dari versi .NET yang sebenarnya. Mengabaikan tag ini juga akan mengakibatkan perilaku tidak aman secara bawaan.

Untuk tujuan memahami tabel di atas, `.NET Framework Version` untuk aplikasi ASP.NET adalah versi .NET yang digunakan untuk membuat aplikasi atau `targetFramework` httpRuntime (Web.config), **mana saja yang lebih rendah**.

Tag konfigurasi ini tidak boleh disamakan dengan tag konfigurasi yang serupa: `<compilation targetFramework="..." />` atau targetFramework rakitan/proyek, yang **tidak** cukup untuk mencapai perilaku aman secara default seperti yang diiklankan dalam tabel di atas.

### LINQ ke XML

**Baik objek `XElement` maupun `XDocument` dalam pustaka `System.Xml.Linq` aman dari injeksi XXE dari file eksternal dan serangan DoS secara default.** `XElement` hanya mengurai elemen dalam file XML, jadi DTD diabaikan sama sekali. `XDocument` memiliki XmlResolver [dinonaktifkan secara default](https://docs.microsoft.com/en-us/dotnet/standard/linq/linq-xml-security) sehingga aman dari SSRF. Sementara DTD [diaktifkan secara default](https://referencesource.microsoft.com/#System.Xml.Linq/System/Xml/Linq/XLinq.cs,71f4626a3d6f9bad), dari versi Framework ≥4.5.2, **tidak** rentan terhadap DoS seperti yang disebutkan tetapi mungkin rentan pada versi Framework sebelumnya. Untuk informasi selengkapnya, lihat [panduan Microsoft tentang cara mencegah XXE dan XML Denial of Service di .NET](http://msdn.microsoft.com/en-us/magazine/ee335713.aspx)

### XmlDictionaryReader

**`System.Xml.XmlDictionaryReader` aman secara default, karena saat mencoba mengurai DTD, kompiler memunculkan pengecualian yang mengatakan bahwa "Elemen CData tidak valid di tingkat atas dokumen XML". Ini menjadi tidak aman jika dibuat dengan parser XML lain yang tidak aman.**

### XmlDocument

**Sebelum .NET Framework versi 4.5.2, `System.Xml.XmlDocument` tidak aman secara default. Objek `XmlDocument` memiliki objek `XmlResolver` di dalamnya yang perlu disetel ke null dalam versi sebelum 4.5.2. Pada versi 4.5.2 dan yang lebih baru, `XmlResolver` ini disetel ke null secara default.**

Contoh berikut menunjukkan cara mengamankannya:

``` csharp
 static void LoadXML()
 {
   string xxePayload = "<!DOCTYPE doc [<!ENTITY win SYSTEM 'file:///C:/Users/testdata2.txt'>]>"
                     + "<doc>&win;</doc>";
   string xml = "<?xml version='1.0' ?>" + xxePayload;

   XmlDocument xmlDoc = new XmlDocument();
   // Setting this to NULL disables DTDs - Its NOT null by default.
   xmlDoc.XmlResolver = null;
   xmlDoc.LoadXml(xml);
   Console.WriteLine(xmlDoc.InnerText);
   Console.ReadLine();
 }
```

**Untuk versi .NET Framework ≥4.5.2, ini aman secara default**.

`XmlDocument` dapat menjadi tidak aman jika Anda membuat `XmlResolver` nonnull Anda sendiri dengan pengaturan default atau tidak aman. Jika Anda perlu mengaktifkan pemrosesan DTD, petunjuk tentang cara melakukannya dengan aman dijelaskan secara terperinci dalam [artikel MSDN yang dirujuk](https://msdn.microsoft.com/en-us/magazine/ee335713.aspx).

### XmlNodeReader

Objek `System.Xml.XmlNodeReader` aman secara default dan akan mengabaikan DTD bahkan saat dibuat dengan parser yang tidak aman atau dibungkus dalam parser lain yang tidak aman.

### XmlReader

Objek `System.Xml.XmlReader` aman secara default.

Objek-objek tersebut ditetapkan secara default agar properti ProhibitDtd-nya ditetapkan ke false di .NET Framework versi 4.0 dan sebelumnya, atau properti `DtdProcessing`-nya ditetapkan ke Prohibit di .NET versi 4.0 dan yang lebih baru.

Selain itu, di .NET versi 4.5.2 dan yang lebih baru, `XmlReaderSettings` yang termasuk dalam `XmlReader` memiliki `XmlResolver` yang ditetapkan ke null secara default, yang menyediakan lapisan keamanan tambahan.

Oleh karena itu, objek `XmlReader` hanya akan menjadi tidak aman di versi 4.5.2 dan yang lebih baru jika properti `DtdProcessing` ditetapkan ke Parse dan `XmlResolver` dari `XmlReaderSetting` ditetapkan ke XmlResolver nonnull dengan pengaturan default atau tidak aman. Jika Anda perlu mengaktifkan pemrosesan DTD, petunjuk tentang cara melakukannya dengan aman dijelaskan secara terperinci dalam [artikel MSDN yang dirujuk](https://msdn.microsoft.com/en-us/magazine/ee335713.aspx).

### XmlTextReader

`System.Xml.XmlTextReader` **tidak aman** secara default dalam versi .NET Framework sebelum 4.5.2. Berikut cara membuatnya aman dalam berbagai versi .NET:

#### Sebelum .NET 4.0

Dalam versi .NET Framework sebelum 4.0, perilaku penguraian DTD untuk objek `XmlReader` seperti `XmlTextReader` dikontrol oleh properti Boolean `ProhibitDtd` yang ditemukan dalam kelas `System.Xml.XmlReaderSettings` dan `System.Xml.XmlTextReader`.

Tetapkan nilai ini ke true untuk menonaktifkan DTD sebaris sepenuhnya.

``` csharp
XmlTextReader reader = new XmlTextReader(stream);
// DIPERLUKAN karena default-nya adalah FALSE!!
reader.ProhibitDtd = true;
```

#### .NET 4.0 - .NET 4.5.2

**Dalam .NET Framework versi 4.0, perilaku penguraian DTD telah diubah. Properti `ProhibitDtd` telah ditinggalkan dan digantikan oleh properti `DtdProcessing` yang baru.**

**Namun, mereka tidak mengubah pengaturan default sehingga `XmlTextReader` masih rentan terhadap XXE secara default.**

**Mengatur `DtdProcessing` ke `Prohibit` menyebabkan runtime memunculkan pengecualian jika elemen `<!DOCTYPE>` ada dalam XML.**

Untuk mengatur nilai ini sendiri, tampilannya seperti ini:

``` csharp
XmlTextReader reader = new XmlTextReader(stream);
// DIPERLUKAN karena defaultnya adalah Parse!!
reader.DtdProcessing = DtdProcessing.Prohibit; 
```

Alternatifnya, Anda dapat menyetel properti `DtdProcessing` ke `Ignore`, yang tidak akan memunculkan pengecualian saat menemukan elemen `<!DOCTYPE>` tetapi akan melewatinya dan tidak memprosesnya. Terakhir, Anda dapat menyetel `DtdProcessing` ke `Parse` jika Anda ingin mengizinkan dan memproses DTD sebaris.

#### .NET 4.5.2 dan yang lebih baru

Pada versi .NET Framework 4.5.2 dan yang lebih baru, `XmlResolver` internal `XmlTextReader` disetel ke null secara default, yang membuat `XmlTextReader` mengabaikan DTD secara default. `XmlTextReader` dapat menjadi tidak aman jika Anda membuat `XmlResolver` nonnull Anda sendiri dengan setelan default atau tidak aman.

### XPathNavigator

`System.Xml.XPath.XPathNavigator` **tidak aman** secara default dalam versi .NET Framework sebelum 4.5.2.

Hal ini disebabkan oleh fakta bahwa ia mengimplementasikan objek `IXPathNavigable` seperti `XmlDocument`, yang juga tidak aman secara default dalam versi sebelum 4.5.2.

Anda dapat membuat `XPathNavigator` aman dengan memberinya parser aman seperti `XmlReader` (yang aman secara default) dalam konstruktor `XPathDocument`.

Berikut ini contohnya:

``` csharp
XmlReader reader = XmlReader.Create("example.xml");
XPathDocument doc = new XPathDocument(reader);
XPathNavigator nav = doc.CreateNavigator();
string xml = nav.InnerXml.ToString(); 
```

Untuk versi .NET Framework ≥4.5.2, XPathNavigator **aman secara default**.

### XslCompiledTransform

`System.Xml.Xsl.XslCompiledTransform` (transformator XML) aman secara default selama parser yang diberikan aman.

Aman secara default karena parser default dari metode `Transform()` adalah `XmlReader`, yang aman secara default (seperti di atas).

[Kode sumber untuk metode ini ada di sini.](http://www.dotnetframework.org/default.aspx/4@0/4@0/DEVDIV_TFS/Dev10/Releases/RTMRel/ndp/fx/src/Xml/System/Xml/Xslt/XslCompiledTransform@cs/1305376/XslCompiledTransform@cs)

Beberapa metode `Transform()` menerima `XmlReader` atau `IXPathNavigable` (misalnya, `XmlDocument`) sebagai input, dan jika Anda memasukkan Parser XML yang tidak aman maka `Transform` juga tidak akan aman.

## iOS

### libxml2

**iOS menyertakan pustaka libxml2 C/C++ yang dijelaskan di atas, sehingga panduan tersebut berlaku jika Anda menggunakan libxml2 secara langsung.**

**Namun, versi libxml2 yang disediakan melalui iOS6 adalah versi sebelum libxml2 versi 2.9 (yang secara default melindungi dari XXE).**

### NSXMLDocument

**iOS juga menyediakan tipe `NSXMLDocument`, yang dibangun di atas libxml2.**

**Namun, `NSXMLDocument` menyediakan beberapa perlindungan tambahan terhadap XXE yang tidak tersedia di libxml2 secara langsung.**

Menurut bagian 'NSXMLDocument External Entity Restriction API' dari ini [halaman](https://developer.apple.com/library/archive/releasenotes/Foundation/RN-Foundation-iOS/Foundation_iOS5.html):

- iOS4 dan versi sebelumnya: Semua entitas eksternal dimuat secara default.
- iOS5 dan versi yang lebih baru: Hanya entitas yang tidak memerlukan akses jaringan yang dimuat. (yang lebih aman)

**Namun, untuk menonaktifkan XXE sepenuhnya dalam `NSXMLDocument` di versi iOS mana pun, Anda cukup menentukan `NSXMLNodeLoadExternalEntitiesNever` saat membuat `NSXMLDocument`.**

## PHP

**Saat menggunakan parser XML default (berdasarkan libxml2), PHP 8.0 dan yang lebih baru [mencegah XXE secara default](https://www.php.net/manual/en/function.libxml-disable-entity-loader.php).**

**Untuk versi PHP sebelum 8.0, per [dokumentasi PHP](https://www.php.net/manual/en/function.libxml-set-external-entity-loader.php), berikut ini harus ditetapkan saat menggunakan parser XML PHP default untuk mencegah XXE:**

``` php
libxml_set_external_entity_loader(null); 
```

Penjelasan tentang cara menyalahgunakan ini di PHP disajikan dalam [artikel SensePost](https://www.sensepost.com/blog/2014/revisting-xxe-and-abusing-protocols/) yang bagus yang menjelaskan kerentanan XXE berbasis PHP yang telah diperbaiki di Facebook.

## Python

Dokumentasi resmi Python 3 berisi bagian tentang [kerentanan XML](https://docs.python.org/3/library/xml.html#xml-vulnerabilities). Mulai 1 Januari 2020, Python 2 tidak lagi didukung, namun situs web Python masih berisi [beberapa dokumentasi lama](https://docs.Python.org/2/library/xml.html#xml-vulnerabilities).

Tabel di bawah ini menunjukkan berbagai modul parsing XML di Python 3 yang rentan terhadap serangan XXE tertentu.

| Attack Type               | sax        | etree      | minidom    | pulldom    | xmlrpc     |
|---------------------------|------------|------------|------------|------------|------------|
| Billion Laughs            | Vulnerable | Vulnerable | Vulnerable | Vulnerable | Vulnerable |
| Quadratic Blowup          | Vulnerable | Vulnerable | Vulnerable | Vulnerable | Vulnerable |
| External Entity Expansion | Safe       | Safe       | Safe       | Safe       | Safe       |
| DTD Retrieval             | Safe       | Safe       | Safe       | Safe       | Safe       |
| Decompression Bomb        | Safe       | Safe       | Safe       | Safe       | Vulnerable |

Untuk melindungi aplikasi Anda dari serangan yang berlaku, [dua paket](https://docs.python.org/3/library/xml.html#the-defusedxml-and-defusedexpat-packages) hadir untuk membantu Anda membersihkan input dan melindungi aplikasi Anda dari serangan DDoS dan serangan jarak jauh.

## Aturan Semgrep

[Semgrep](https://semgrep.dev/) adalah alat baris perintah untuk analisis statis offline. Gunakan aturan yang telah dibuat sebelumnya atau khusus untuk menegakkan kode dan standar keamanan dalam basis kode Anda.

### Java

Berikut ini adalah aturan untuk parser XML yang berbeda di Java

#### Digester

Mengidentifikasi kerentanan XXE di pustaka `org.apache.commons.digester3.Digester`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-Digester](https://semgrep.dev/s/salecharohit:xxe-Digester)

#### DocumentBuilderFactory

Mengidentifikasi kerentanan XXE di pustaka `javax.xml.parsers.DocumentBuilderFactory`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-dbf](https://semgrep.dev/s/salecharohit:xxe-dbf)

#### SAXBuilder

Mengidentifikasi kerentanan XXE di Pustaka `org.jdom2.input.SAXBuilder`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-saxbuilder](https://semgrep.dev/s/salecharohit:xxe-saxbuilder)

#### SAXParserFactory

Mengidentifikasi kerentanan XXE di pustaka `javax.xml.parsers.SAXParserFactory`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-SAXParserFactory](https://semgrep.dev/s/salecharohit:xxe-SAXParserFactory)

#### SAXReader

Mengidentifikasi kerentanan XXE di pustaka `org.dom4j.io.SAXReader`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-SAXReader](https://semgrep.dev/s/salecharohit:xxe-SAXReader)

#### XMLInputFactory

Mengidentifikasi kerentanan XXE di pustaka `javax.xml.stream.XMLInputFactory`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-XMLInputFactory](https://semgrep.dev/s/salecharohit:xxe-XMLInputFactory)

#### XMLReader

Mengidentifikasi kerentanan XXE di pustaka `org.xml.sax.XMLReader`
Aturan dapat diputar di sini [https://semgrep.dev/s/salecharohit:xxe-XMLReader](https://semgrep.dev/s/salecharohit:xxe-XMLReader)

## Referensi

- [XXE by InfoSecInstitute](https://resources.infosecinstitute.com/identify-mitigate-xxe-vulnerabilities/)
- [OWASP Top 10-2017 A4: XML External Entities (XXE)](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A4-XML_External_Entities_%28XXE%29)
- [Timothy Morgan's 2014 paper: "XML Schema, DTD, and Entity Attacks"](https://vsecurity.com//download/papers/XMLDTDEntityAttacks.pdf)
- [FindSecBugs XXE Detection](https://find-sec-bugs.github.io/bugs.htm#XXE_SAXPARSER)
- [XXEbugFind Tool](https://github.com/ssexxe/XXEBugFind)
- [Testing for XML Injection](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/07-Testing_for_XML_Injection.html)

###### Copyright © - This cheat sheet was created from the OWASP CheatSheetSeries reference - Source :` https://cheatsheetseries.owasp.org/ `