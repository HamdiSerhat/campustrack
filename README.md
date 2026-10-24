# CampusTrack — University Attendance Manager

Üniversite derslerini ve devam durumunu takip etmek için geliştirilmiş, Türkçe/İngilizce arayüzlü bir öğrenci projesi. Veriler tarayıcıda saklanır; hesap açılması gerekmez.

**Geliştirme durumu:** İlk çalışan sürüm. Öğrenme ve geliştirme süreci devam ediyor. Resmî bir üniversite sistemi değildir; ders izlencesinin veya öğretim görevlisinin kararının yerine geçmez.

## Neden bu proje?

Bir öğrencinin ders programını, farklı devam koşullarını ve işlenmiş yoklama kayıtlarını tek yerde görebilmesi için başladı. Özellikle kaydı olmayan bir dersi devamsızlık saymamak, lab/sınav koşullarını ayırmak ve bilinmeyen değerlerden kesin sonuç üretmemek üzerinde duruyor.

## Özellikler

- Ders oluşturma, düzenleme, arşivleme ve arama.
- Haftalık program ve tarihli oturumlar.
- Katıldım, Katılmadım, Ders İptal ve İşaretlenmedi durumları.
- Saat/dakika bazlı kayıtlar; öğretim süresi ile takvim aralığının ayrılması.
- Devam grafikleri, ders raporları ve senaryo hesapları.
- Açık/koyu tema, Türkçe/İngilizce ve mobil uyumlu görünüm.
- JSON yedekleme/geri yükleme ve CSV dışa aktarımı.
- Kaynaklı üniversite paketleri için doğrulama, fark önizlemesi, yedek ve açık onay.
- Yinelenen kayıtların engellenmesi; belirsiz saat/tür değişikliklerinde otomatik birleştirmeyi durdurma.

Başlangıçtaki ders kodları yalnızca ad şablonlarıdır; gerçek program veya resmî devam eşiği içermez. Uygulamanın demo modu ve bu depodaki test verileri kurgusaldır.

## Çalıştırma

Node.js 20 veya üzeriyle, proje klasöründe:

```sh
npm start
```

Tarayıcıda **http://127.0.0.1:4173** adresini aç. Paket bağımlılığı veya derleme adımı yok; `npm install` gerekmez. Sunucu yalnızca kendi cihazındaki bağlantıları kabul eder.

`index.html` doğrudan da açılabilir. Dosya adresi ve yerel sunucu adresi farklı depolama alanları kullanabilir; verilerini taşırken JSON dışa/içe aktarımını kullan. Windows'taki başlatıcılar isteğe bağlıdır.

## Testler

```sh
npm test
npm run check
```

Testler Node'un yerleşik test çalıştırıcısını kullanır. Test paketleri tamamen sentetik olarak oluşturulur; gerçek öğrenci kaydı veya üniversite belgesi gerekmez.

Kontrol edilen durumlar arasında saat ağırlıklı oranlar, iptaller, sıfır kayıt, dönem değişiklikleri, bilinmeyen değerler, tarihli labların haftalık slotların yerine geçmesi, ayrı sınav türleri, yedek doğrulaması ve tekrar aktarım bulunur.

## Veriler ve gizlilik

- Öğrenci verileri `localStorage` içinde, yalnızca uygulamanın açıldığı tarayıcıda tutulur.
- Sunucu hesabı, cihazlar arası eşitleme veya şifrelenmiş veri deposu bulunmaz.
- Tarayıcı verilerini temizlemek kayıtları silebilir; düzenli JSON yedeği alınmalıdır.
- Bu depo kişisel yoklamalar, JSON yedekleri, üniversite kaynak belgeleri veya bunları gösteren ekran görüntüleri içermez.
- Gerçek veriler proje klasörüne kopyalanmamalıdır. Özel dosyalar için `.gitignore` kuralları bulunur; paylaşılacak dosyalar yine de incelenmelidir.
- Yazı tipleri Google Fonts üzerinden yüklenebilir. Çevrimdışı durumda sistem yazı tipleri kullanılır.

Kaynak sürümü, dönem paydası veya gerekli bileşenler belirsizse uygulama kesin devamsızlık hakkı/NG sonucu üretmez. `null`, bilinmiyor ve işaretlenmedi durumları sıfır veya devamsızlık olarak yorumlanmaz.

## Dosya düzeni

```text
index.html                 Sayfa iskeleti
styles.css                 Görünüm ve responsive düzen
app.js                     Arayüz, formlar ve tarayıcı depolaması
engine.js                  Devam hesapları
university-import.js       Kaynaklı paket doğrulaması ve eşleme
server.cjs                 Yerel statik sunucu
tests/                     Gerçek veriden bağımsız testler
docs/architecture.md       Tasarım ve veri akışı
```

## Geliştirme yöntemi ve öğrenme hedefleri

İlk uygulama, testler ve dokümantasyon **AI desteğiyle** üretildi. Ürün ihtiyaçları bir öğrencinin gerçek iş akışından geldi. Depo, öğrenme sürecini ve sonraki değişiklikleri belgelemek için tutuluyor.

Üzerinde çalışılan konular: HTML/CSS/JavaScript, tarih ve süre hesapları, form doğrulaması, JSON veri yapıları, birim testleri, Git ve veri gizliliği.

## Bilinen sınırlar ve sonraki adımlar

- `app.js` büyük bir dosya; daha küçük arayüz/depolama modüllerine ayrılması hedefleniyor.
- Bütün tarayıcılar ve erişilebilirlik senaryoları için kapsamlı test tamamlanmadı.
- Kayıt sayısı/kota hesapları üniversitenin resmî kararını belirlemez.
- Daha okunabilir saat/dakika gösterimi ve daha fazla klavye/ekran okuyucu testi planlanıyor.
- Kullanıcı hesabı ve bulut eşitlemesi mevcut kapsamın dışında.

---

**English:** CampusTrack is an AI-assisted student learning project for tracking university attendance. It uses vanilla JavaScript, browser-local storage, previewed imports and independent lecture/lab/exam rules. Run `npm start` and `npm test`. This repository contains synthetic test data only and is not an official university system.
