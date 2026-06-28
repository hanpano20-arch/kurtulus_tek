# Devir Teslim Dosyası - Zaman Makinesi V1 (K1-K15 Kuralları)

Bu dosya, önceki yapay zeka oturumundan bir sonraki oturuma projeyi eksiksiz devretmek için hazırlanmıştır. 

## Proje Durumu ve Son Yapılanlar

- **K1'den K15'e Kadar Kurallar Tamamlandı:** Toplam 15 kuralın tamamı sisteme entegre edildi. Son olarak **K14 (Eleme)** ve **K15 (Yankı)** kuralları hesaplama motoruna ve arayüze bağlandı.
- **Tüm Kurallara Açık/Kapalı Butonu:** Ana ekrandaki kaydırma çubuklarının (slider) yanına her kural için "AÇIK/KAPALI" özelliği (toggleRule) eklendi. Butonlar aktifken yeşil ve "AÇIK", pasifken kırmızı ve "KAPALI" olarak gözükür. Kurallar kapatıldığında hesaplamada "0" puan üretir.
- **Tabloların Güncellenmesi:** `Sayı Listesi ve Havuz` tablosu ile `Detaylı Puan Tablosu` modülüne K13, K14 ve K15 kurallarının özel puan sütunları eklendi.
- **Hesaplama Motoru Hata Düzeltmeleri:** K14 ve K15 kurallarının `testCalistir`'dan `motorAtesle`'ye gönderilmediği hata düzeltildi (`ayarlar` nesnesine eklendi). Puanların tablolar üzerinde sabit kalması sorunu aşıldı.
- **Yeşil Çerçeve (Havuz Seçimi) Optimizasyonu:** `inFinalPool` fonksiyonundaki toplam puan (tp) formülüne K14 ve K15 puanları da dahil edildi. Böylece havuz seçimi artık tamamen doğru sıradan (hedef havuz boyutu adedince) seçim yapmaktadır.
- **Ayarlar Modülü Tasarımı:** Ayarlar simgesine tıklandığında açılan menünün başlık kısmı yeniden tasarlandı. Sol tarafta "⚙️ Kuralların Taban Puanları", sağ tarafta ise aynı hizada kırmızı renkli **SAYFAYI KAPAT** ve mavi renkli **AYARLARI KAYDET** butonları konumlandırıldı. Değişiklik yapılıp kaydedilmeden çıkılmak istendiğinde uyarı verme sistemi aktif edildi.

## 2026-06-28 Tarihli Bug Fix Paketi

- **K14 Joker Dahil:** `k14ElemeHesapla(cekilisler, jokerler, ...)` — Fonksiyona `jokerler` parametresi eklendi. Son 3 çekilişin joker sayıları da `son3Sayilar` setine dahil ediliyor. Joker artık K14 eleme cezasını ATLAYAMIYOR.
- **K9-K12 Joker Tip Uyumsuzluğu Giderildi:** `doygunlukCezalariHesapla` içinde `Number(jokerler[j]) === i` olarak düzeltildi. Önceden `jokerler[j] === i` (string vs number karşılaştırması) yapıldığından jokerler K9-K12 cezalarına yansımıyordu.
- **K14_TABAN DEFAULTS -250 Oldu:** Önceden `100` (pozitif) yazılıydı, bu motor hesabını bozuyordu. Doğrusu `-250`.
- **K15_TABAN DEFAULTS 200 Oldu:** Önceden `100` yazılıydı, motorun `safe fallback` değeriyle tutarsızdı. Doğrusu `200`.
- **Zaman Makinesi manualScores Eklendi:** `zamanMakinesiTesti` fonksiyonuna `manualScores` parametresi eklendi. Artık manuel puanlar ZM tarihsel testine de yansıyor.
- **K8 Uyku Renk Eşiği Dinamik Oldu:** Tablodaki uyku süresi rengi artık sabit `25` yerine `baseSettings.K8_UYKU_SINIRI` değerini kullanıyor.

## Mevcut Çalışma Yapısı
- **Ana Dosya:** `Motor_Test_Paneli.html` (Arayüz ve veri trafiği)
- **Motor Dosyası:** `test_motor_v3.js` (Kuralların asıl hesaplamalarının yapıldığı mantık dosyası)
- Değişiklik yaparken lütfen `Motor_Test_Paneli.html` dosyasındaki JS fonksiyonlarını (`testCalistir`, `renderTable`, `inFinalPool`, `showSayiListesiModal`) ve `test_motor_v3.js` dosyasındaki (`motorAtesle`) veri alma/gönderme formatlarını bozmamaya dikkat et.

## Joker Kuralı — Önemli Not
**Joker sayısı, 6 sayıyla AYNI GÜNDE AYNI KÜREDEN çıkan 7. sayıdır.** Tüm kurallarda (K1-K15) joker bu mantıkla dahil edilmiştir:
- K1, K2, K3 → `frekansHesapla` içinde joker sayılıyor ✅
- K4, K5 → `komsulukHesapla` içinde joker sayılıyor ✅
- K6 → Joker'in kendi kuralı ✅
- K7 → `Number(jokerler[j]) === i` ile sayılıyor ✅
- K8 → `Number(jokerler[j]) === i` ile sayılıyor ✅
- K9-K12 → `Number(jokerler[j]) === i` ile sayılıyor ✅ (2026-06-28 fix)
- K13 → joker `son3Sayilar` ve `uyuyanSet`'e dahil ✅
- K14 → joker `son3Sayilar`'a dahil ✅ (2026-06-28 fix)
- K15 → joker `sonXFrekans` ve `cikisEndeksleri`'ne dahil ✅

## İleriye Yönelik Notlar / Kullanıcıdan Gelen Geri Bildirimler
- Kullanıcı arayüzde bir tasarım değişikliği istediğinde **(örneğin bir butonun yerini değiştirmek)**, var olan mantık döngüsünü (tabloları ve slider kurgusunu) kesinlikle değiştirmeden **yalnızca CSS veya HTML düzenlemesi yapmaya** özen göster.
- K14 ve K15 için tabloda renk formatları `p14` (Eleme - Kırmızı ağırlıklı), `p15` (Yankı - Mavi ağırlıklı) olarak ayarlandı.
- K9-K12 kümülatif ceza sistemi **kasıtlıdır** — kullanıcı aynı sayıya birden fazla pencerede ceza verebilmek istiyor.
- Github reposu son başarılı haliyle güncellenmelidir.

Lütfen işleme başlamadan önce bu dosyayı referans al. Kolay gelsin!
