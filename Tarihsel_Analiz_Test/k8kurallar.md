# K8 (Uyku / Kuraklık) Kuralı - Uzman Rehberi

## 📊 Özet: K8 Kuralının Amacı

**K8 Kuralı**, sayısal loto tahmin motorunda "sıcak-soğuk sayı dengesi" sağlamak amacıyla geliştirilmiş bir puanlama mekanizmasıdır. Bir sayının ne kadar süredir çekilişte çıkmadığı (`uyku süresi`) analiz edilerek, istatistiksel olarak beklenen performansını tahmin etmeye yardımcı olur.

---

## 1️⃣ UYKU EŞİĞİ: Kaç Çekiliş Olmalı?

### 📋 Önerilen Değer: **15 Çekiliş**

#### Gerekçe:
- **Takvim Perspektifi**: Haftalık 2 çekiliş varsayıldığında, 15 çekiliş ≈ 7.5 hafta (≈ 2 ay)
- **İstatistiksel Güven**: 15 çekiliş, teorik rastgelelik için yeterli örneklem büyüklüğüdür
- **Döngü Kuramı**: Loto sayıları tipik olarak 60-90 gün içinde tekrar döngüye girer
- **Dengeli Hassasiyet**: Çok kısa eşik (5-8) = gürültüye duyarlı; çok uzun (25+) = geç tepki

#### Uygulamada:
```
- Uyku Eşiği = 15
- Son 15 çekiliş içinde çıkmayan sayı → "Uykuya Dalmış" durumu aktif
- 15 veya daha fazla çekiliş çıkmayan sayı → K8 puanı uygulanır
```

#### Alternatif Seçenekler (Veri Miktarına Göre):
| Çekiliş Adedi | Önerilen Eşik | Not |
|---|---|---|
| 100-200 çekiliş | 10-12 | Daha az veri: konservatif |
| 200-500 çekiliş | 15 | **Başlangıç (Önerilen)** |
| 500+ çekiliş | 18-20 | Geniş veri: daha güvenilir |

---

## 2️⃣ ÖDÜL MANTLIĞI: Uyku Süresi Arttıkça Puan Artmalı mı?

### ✅ Cevap: EVET - Doğrusal + İkinci Derece Etkili

#### Temel Felsefe:
Bir sayı ne kadar uzun uykudaysa, **istatistiksel olarak yakın zamanda çıkma olasılığı artar** (temsili döngü kuram). Ancak bu, **logaritmik** (düşen verim) değil, **doğrusal artış** ile gösterilir.

### 📐 Önerilen Puanlama Formülü:

```
K8_Puan = {
  0,                              if uyku_suresi < 15
  (uyku_suresi - 15) × 12,        if 15 ≤ uyku_suresi ≤ 50
  (50 - 15) × 12 + (uyku_suresi - 50) × 25,  if uyku_suresi > 50
}
```

### 📊 Somut Örnek Tablo:

| Uyku Süresi (Çekiliş) | K8 Puanı | Açıklama |
|---|---|---|
| 5 | 0 | Eşiğin altında, puan yok |
| 15 | 0 | Tam eşik, kırmızı alarm başlangıcı |
| 20 | +60 | 5 çekiliş × 12 puan |
| 30 | +180 | 15 çekiliş × 12 puan |
| 40 | +300 | 25 çekiliş × 12 puan |
| 50 | +420 | 35 çekiliş × 12 puan |
| 60 | +570 | 35×12 + 10×25 = 420 + 150 |
| 75 | +820 | 35×12 + 25×25 = 420 + 625 |

#### Mantık:
- **15-50 çekiliş arası**: Sabit hız (12 puan/çekiliş) → hassas, dengeli
- **50+ çekiliş arası**: Hızlı artış (25 puan/çekiliş) → çok uzun uykular için güçlü teşvik

---

## 3️⃣ CEZA MANTLIĞI: Ölü Sayılar için Eksi Puan?

### ✅ Cevap: EVET - Ancak Koşullu

#### Felsefe:
Çok uzun süredir çıkmayan sayılar "istatistiksel ölüm" durumuna girebilir. Bunlar ya **gerçekten problematik** (donanım hatası, sistematik dışlanma) veya **tamamen tesadüfi uç durumlardır**. Ceza, bu riskleri azaltır.

### ⚠️ Önerilen Ceza Eşiği: **55 Çekiliş**

#### Gerekçe:
- **55 = Kırmızı Alarm Sınırı**: Teorik rastgelelikte 1/90^(55) olasılık
- **Güvenlik Marjı**: Ödül + Ceza ikili yapısı maksimum risk yönetimi sağlar

### 📐 Ceza Formülü:

```
CEZA_Puan = {
  0,                                if uyku_suresi ≤ 55
  -200 - (uyku_suresi - 55) × 8,   if uyku_suresi > 55
}
```

### 📊 Ceza Örnekleri:

| Uyku Süresi | K8 Puanı (Ödül) | CEZA | Net Puan |
|---|---|---|---|
| 60 | +570 | -240 | **+330** |
| 70 | +820 | -320 | **+500** |
| 80 | +1,070 | -400 | **+670** |
| 90 | +1,320 | -480 | **+840** |

#### Mantık:
- **60-70 çekiliş**: Ödül hâlâ hakim, ancak ceza riski uyarı sinyali
- **70+**: Ödül ve ceza dengelendiğinde, net puan az ama kontrollü

---

## 4️⃣ ÖN-İŞLEM: Uyku Süresi Hesaplama Fonksiyonu

### Algoritma: `uykuSuresiHesapla(cekilisler)`

```
Giriş: cekilisler = [Tarihi sırayla çekilmiş tüm sayılar]
Çıkış: uykuSureleri = {1: 42, 2: 8, 3: 15, ..., 90: 67}

Her sayı n (1-90) için:
  1. cekilisler dizisinde n'nin son oluştuğu indeksi bul
  2. Dizinin son elemanının indeksinden farkını al
  3. uyku_suresi[n] = (son_indeks - n_indeksi)
```

#### Örnek:
```
cekilisler = [3, 7, 15, 3, 22, 45, 7, ..., 88]  (son index = 842)

Sayı 7:
  - Son oluştuğu index = 838
  - uyku_süresi[7] = 842 - 838 = 4 çekiliş

Sayı 42:
  - Son oluştuğu index = 710
  - uyku_süresi[42] = 842 - 710 = 132 çekiliş (ÇOK UZUN!)
```

---

## 5️⃣ MOTORa ENTEGRASYON: Parametreler

### `ayarlar` Nesnesi İçine Eklenecek K8 Parametreleri:

```javascript
ayarlar = {
  // ... diğer parametreler ...
  k8: {
    aktif: true,                    // K8 kuralını uygula/uygulama
    carpan: 1.0,                    // İç ağırlık (UI slider: 0-200%)
    esiklar: {
      uykuMin: 15,                  // Uyku başlangıç eşiği
      cezaBaslangici: 55,           // Ceza uygulanmaya başladığı eşik
      odul1Oran: 12,                // 15-50 arası puan/çekiliş
      odul2Oran: 25,                // 50+ arası puan/çekiliş
      cezaTemel: 200,               // Cezanın sabit kısmı
      cezaOran: 8                   // Ceza artış hızı
    }
  }
};
```

---

## 6️⃣ UI / ARAYÜZ DEĞİŞİKLİKLERİ

### "Kurallar ve Ağırlıklar" Bölümüne Eklenecek:

```html
<!-- K8 Kuralı Kontrol Grubu -->
<div class="rule-group">
  <label>K8 (Uyku/Kuraklık) Ağırlığı (%)</label>
  <input type="range" id="k8Carpan" min="0" max="200" value="100" step="5">
  <input type="number" id="k8CarpanText" min="0" max="200" value="100">
  <span>%</span>
</div>
```

### Detaylı Puan Tablosuna Eklenecek Sütunlar:

| Sayı | Toplam Puan | ... | **Uyku (Çek.)** | **K8 Puanı** |
|---|---|---|---|---|
| 7 | 1,250 | ... | 4 | 0 |
| 42 | 820 | ... | 132 | +1,320-480=-160 |
| 15 | 1,680 | ... | 42 | +324 |

---

## 7️⃣ TEST & DOĞRULAMA SENARYOSU

### Test Tarihi: **18.06.2026**

#### Adım 1: Manuel Kontrol
```
1. Detaylı Puan Tablosu aç
2. "Uyku (Çek.)" sütununda en yüksek değerleri bul
3. Excel veri dosyasında bu sayıların son çıkış tarihini doğrula
```

#### Adım 2: K8 Puan Doğrulaması
```
Örnek: Sayı 42, Uyku Süresi = 132
  K8_Puan = 35 × 12 + (132-50) × 25 - 200 - (132-55) × 8
          = 420 + 2,050 - 200 - 616
          = 1,654 puan (!) → Bu sayı ÇOK güçlü sinyal

Tablodan görülen değer ile karşılaştır.
```

#### Adım 3: Toplam Puanda Etkisi
```
Formül: Toplam_Puan = (Diğer Kurallar) × (1 + k8Carpan/100)
        
Örneğin k8Carpan = 100% (normal)
Sayı 42'nin Toplam: 820 + 1,654 = 2,474
```

---

## 8️⃣ NOTLAR VE UYARILAR

### ⚠️ Kritik Noktalar:

1. **Çekiliş Sayısı Yeterli mi?**
   - Eğer dataset < 200 çekiliş: Eşiği 12'ye indir
   - Eğer dataset 500+ çekiliş: Eşiği 18'e çıkartabilirsin

2. **Carpan Ayarı (UI Slider)**
   - `carpan = 0%` → K8 devre dışı
   - `carpan = 100%` → Normal uygulama
   - `carpan = 200%` → Uyku kuralı çok ağır

3. **Ceza vs Ödül Dengesi**
   - Ceza eşiği (55) > Ödül eşiği (15) olmalı
   - Oran: 55/15 ≈ 3.67 (optimal 3-4 aralığında)

4. **Uç Durum: Sayı Hiç Çıkmadıysa**
   - uyku_süresi = "toplam çekiliş sayısı"
   - Formül yine çalışır (çok yüksek ceza alır)

---

## 9️⃣ MOTORUN ÇIKTISI ÖRNEĞI

### `motorAtesle()` dönüş yapısı:

```javascript
{
  secilenSayilar: [7, 15, 23, ...],
  toplamPuan: 8540,
  detayliPuan: {
    7: { toplamPuan: 1250, k8: 0, uykuSuresi: 4 },
    42: { toplamPuan: 2474, k8: 1654, uykuSuresi: 132 },
    15: { toplamPuan: 1680, k8: 324, uykuSuresi: 42 },
    ...
  },
  uykuSureleri: {
    1: 87, 2: 12, ..., 90: 156
  },
  k8: {
    aktif: true,
    carpan: 100,
    ortalamaPuan: 245,
    enYuksekK8: 1654,
    enDusukK8: -480
  }
}
```

---

## 🔟 TÜZÜK ÖZETI

| Parametre | Değer | Birim |
|---|---|---|
| **Uyku Eşiği** | 15 | çekiliş |
| **Ödül Başlangıcı** | 15 | çekiliş |
| **Ödül Oranı (Sezon 1)** | 12 | puan/çekiliş |
| **Ödül Oranı (Sezon 2)** | 25 | puan/çekiliş |
| **Sezon 2 Başlangıcı** | 50 | çekiliş |
| **Ceza Başlangıcı** | 55 | çekiliş |
| **Ceza Tabanı** | 200 | puan |
| **Ceza Oranı** | 8 | puan/çekiliş |

---

## 📝 NOTLAR ANTIGRAVIТY İÇİN:

Bu parametreler, **k8kurallar.md** içinde sabit olarak kullanılabilir. Motor kodunda değişken tanımlamalarında bu değerleri referans alın:

```javascript
const K8_CONFIG = {
  UYKU_ESIGI: 15,
  CEZA_ESIGI: 55,
  ODUL_ORAN_1: 12,
  ODUL_ORAN_2: 25,
  ODUL_GEÇIS: 50,
  CEZA_TABAN: 200,
  CEZA_ORAN: 8
};
```

---

**Hazırlayan**: Veri Analisti / Loto Tahmin Motor Ekibi  
**Tarih**: Haziran 2026  
**Versiyon**: 1.0
