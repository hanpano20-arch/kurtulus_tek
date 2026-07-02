# Devir Teslim Dosyası - Zaman Makinesi V1 (K1-K21 Kuralları)

Bu dosya, önceki yapay zeka oturumundan bir sonraki oturuma projeyi eksiksiz devretmek için hazırlanmıştır. Kullanıcı son oturumda bazı kuralların sonuçlarından memnun kalmadığı için sistemi temiz bir "kayıt noktasına" (git restore) döndürmüş ve yeni bir ajanla taze bir başlangıç yapmak istemiştir. Yeni ajan bu notları ÇOK DİKKATLİ okumalıdır.

## Proje Durumu ve Son Yapılanlar

- **K16 - K21 Kuralları Eklendi:** K15'ten sonra gelen K16 (Bölge Rotasyon), K17 (Kanka/Birliktelik), K18 (Tek/Çift-Düşük/Yüksek Dengesi + Keskin Nişancı Filtresi), K19 (Son Rakam Dengesi - Momentum Modu), K20 (Uyuyan Komşu) ve K21 (Isınma Turu) kuralları sisteme entegre edildi.
- **K19 Momentum Modu:** Kullanıcının talebi üzerine K19 kuralı "çok çıkan son rakama çok puan (bonus), az çıkana eksi puan (ceza)" verecek şekilde Momentum Moduna çevrildi.
- **UI Geliştirmeleri:** 
  - `Motor_Test_Paneli.html` içindeki "Puan Detayları" tablosunun başlıkları dikey (`transform: rotate(-90deg)`) yapılarak yerden tasarruf edildi.
  - Puan listesi modal penceresi genişletildi (`95vw`), alt scroll çubuğu gizlendi.
- **K20 ve K21 Durumu:** K20 ve K21 sisteme ve arayüze eklendi, ancak kullanıcı şu an için bu kuralları manuel olarak `KAPALI` (veya çarpanı 0) tutarak test etmeyi tercih ediyor.

## ⚠️ SON OTURUMDAKİ KRİTİK İPTAL (Geri Alınan İşlemler)

- **İptal Edilen Geliştirme (VIP Muafiyeti ve K6 Şişme Önleyici):** Kullanıcı Joker (K6) kuralında çok çıkan sayıların puanını %65 ile tırpanlamak istemişti. Ayrıca K4, K5 ve K6'dan aynı anda puan alan "VIP Sayıların" K16 ve K19 cezalarından muaf tutulması için bir "Kalkan" geliştirilmişti. 
- **Neden İptal Edildi?** Kullanıcı, 26-06-2024 (veya 2026) tarihi için test yaparken 7 ve 69 gibi daha önce joker olmayan sayıların toplam puanlarında ~100 puanlık açıklanamayan ani düşüşler yaşadı. Sistemin ayarlarını bozduğuna kanaat getirdiği için **işlem `git restore test_motor_v3.js` ile tamamen geri alındı.**
- **Şu Anki Durum:** `test_motor_v3.js` ve `Motor_Test_Paneli.html` dosyaları, GitHub'daki en son başarılı commit olan `3854782` (Salı akşamı) durumuna birebir geri döndürülmüştür. VIP kalkanı ve K6 tırpanlama kuralı ŞU AN KODDA YOKTUR.

## Mevcut Çalışma Yapısı
- **Ana Dosya:** `Motor_Test_Paneli.html` (Arayüz ve veri trafiği, sliderlar ve toggle butonları)
- **Motor Dosyası:** `test_motor_v3.js` (Kuralların asıl hesaplamalarının yapıldığı mantık dosyası)
- Yeni bir kural (K22 vb.) eklenecekse hem `test_motor_v3.js` içindeki `motorAtesle`'ye, hem `zamanMakinesiTesti` puan hesaplama toplamlarına, hem de `Motor_Test_Paneli.html`'deki UI kaydırıcılarına ve tablolara eksiksiz eklenmelidir.

## Yeni Ajan İçin Kritik Tavsiyeler
1. **Kullanıcı Çok Hassastır:** Test sonuçlarında 1 puanlık bir sapma bile kullanıcının test analizlerini alt üst edebilir. Herhangi bir kuralda (özellikle ceza/bonus mantıklarında) "+" ve "-" işaretlerine veya array indexlerine ÇOK dikkat et. 
2. **"Çuval İncir Berbat Oldu" Uyarısı:** Kullanıcı bir puan düşüşü yaşadığında, kodun başka bir yerine dokunmuş olma ihtimalini her zaman değerlendir (Örn: Javascript objelerinde pass-by-reference hataları veya default ayar çakışmaları).
3. **60 Sayılık Süper Loto Planı:** Kullanıcı ilerleyen aşamalarda 90 sayılık bu sistemi 60 sayılık (Süper Loto) sisteme adapte etmek isteyecek. Kodun tepesindeki `MAX_TOP = 90` sabiti bu yüzden çok önemlidir. 
4. **Onay Almadan Büyük Revizyon Yapma:** Her zaman `implementation_plan.md` kullanarak kodu revize etmeden önce mantığı kullanıcıya sun ve onayını al.

Yeni oturumda başarılar dilerim. Lütfen kullanıcıyı dikkatle dinleyerek ve her adımda emin olarak ilerle!
