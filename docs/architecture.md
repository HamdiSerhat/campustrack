# Veri modeli ve tasarım notları

## Dosyalar neden ayrıldı?

`engine.js` hesaplama işlevlerini arayüzden ayırır. `university-import.js` kaynaklı verinin doğrulanmasını ve yeni çalışma alanının hazırlanmasını yapar. `app.js` görünümler, kullanıcı eylemleri ve depolama akışını yönetir. Gelecek bir düzenlemede arayüz ve depolama kodu da küçük modüllere ayrılabilir.

## Kişisel ders modeli

Dersler `courses`, oturumlar `sessions` içinde tutulur. Haftalık programdan türetilen oturumlar ilk oluşturulduğunda işaretlenmemiştir. Tamamlanan ve kaydedilen katılım/devamsızlık saatleri oran hesabına girer. İptaller paydadan çıkarılır. Dönem dışında kalan eski işaretli/notlu kayıtlar geçmişte korunur.

Tek bir devam eşiği ve kesin toplamı kullanıcı tarafından tanımlanan kişisel derslerde kalan hak ve gereken ek katılım hesaplanabilir. Sıfır kayıt varsa oran bilinmiyordur; yanlış bir yüzde gösterilmez.

## Kaynaklı üniversite modeli

`campustrack-portable-1.0` paketleri ayrı varlıklar içerir: dersler, programlar, yoklamalar, kurallar, dönem ayarları, kaynaklar ve sorunlar. Dersin `official` alanı bu bilgileri kaynağıyla birlikte korur. Karma lecture/lab/tutorial/sınav koşulları tek bir yüzdeye indirgenmez.

Bir planlanan oturumun varlığı, o dersin yapıldığını veya kişinin katılmadığını kanıtlamaz. Kaynakta bilinmeyen olan bir alan `null` kalır. 100 dakika öğretim ve 110 dakika takvim aralığı farklı bilgilerdir.

## İçe aktarma akışı

1. Dosya tarayıcıda okunur; şema ve ilişkiler doğrulanır.
2. Değişiklik planı bellekte oluşturulur. Bu adım depoya yazmaz.
3. Doğal anahtarlar üzerinden aynı kayıtlar atlanır. Çelişkili yinelenmeler reddedilir.
4. Ders adı, kayıt, program, kural ve kaynak değişiklikleri önizlenir.
5. Kullanıcı mevcut yedeğini indirir ve onay verir.
6. Mevcut çalışma alanının ek yerel yedeği oluşturulur; yeni çalışma alanı kaydedilir.

Yoklama anahtarı: dönem + ders + grup + tarih + başlangıç + portal türü. Saat/tür düzeltmesi olabilecek belirsizlikler otomatik birleştirilmez. Yeni pakette görünmeyen önceki kayıt sessizce silinmez. Tarihli oturumlar belirtilen haftalık slotların yerine geçer.

## Test yaklaşımı

`tests/fixtures/university.cjs`, yalnızca kurgusal dersler ve oluşturulmuş kayıtlarla bir paket üretir. Testler bu paketi kullanarak tekrar aktarımı, yerine-geçmeleri, bileşen ayrımını ve null korunmasını sınar. Kişisel veri dosyaları hiçbir testin ön koşulu değildir.

Depolama ve gerçek tarayıcı davranışının tümü birim testleriyle kanıtlanamaz. Mevcut testler hesaplama, doğrulama ve bazı arayüz çıktıları üzerinde çalışır; tam tarayıcı uçtan uca testleri sonraki geliştirmeler arasındadır.
