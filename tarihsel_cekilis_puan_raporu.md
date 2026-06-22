# 📊 Tarihsel Çekiliş Analizi — Detaylı Puan Tablosu Raporu

> **Kaynak Dosyalar:**  
> • `PROMPT_BUILDER_v8_1.html` — UI & v7.5 Çekiliş Haritası  
> • `v8_hist_engine.js` — Tarihsel Motor & Skor Tablosu Render  
> • `v8_havuz_motoru.js` — `puanlari_hesapla()` Ana Fonksiyonu

---

## 1. Sistemin Genel Mimarisi

Tarihsel çekiliş analizi **iki katmanlı** bir puan sistemi kullanır:

```
TOPLAM PUAN = (TARİHSEL TOPLAM × Tarihsel Çarpan)
            + (GÜNCEL TOPLAM × Güncel Çarpan)
            + CEZALAR TOPLAMI
```

### Hangi kurallar hangi kategoriye giriyor?

| Kategori | Kurallar | Çarpan |
|---|---|---|
| **Tarihsel** | K1, K2, K3 | `TARIHSEL_CARPAN` (×1.0) |
| **Güncel** | K4, K5, K6, K7, K8, K9, K10, K11, K12 | `GUNCEL_CARPAN` (×1.0) |
| **Ceza** | K13, K14, K15, K16, K17, K18 | Çarpan yok — sabit |

---

## 2. Tüm Kuralların Detaylı Açıklaması

### 🟢 GRUP A — TARİHSEL KURALLAR (×Tarihsel Çarpan)

---

#### K1 — Son 15 Frekans (Varsayılan: +100 puan)

**Mantık:** Sayının son 15 çekilişte (jokerler dahil) kaç kez çıktığını ölçer. En yüksek çıkış sayısına normalize edilir.

```javascript
k1_raw[i] = son15'teki çıkış sayısı + son15'teki joker sayısı
k1_val = (k1_raw[i] / max_k1_raw) * K1_PUAN
```

**Örnek:** Sayı 15 çekilişte 3 kez çıktı, en fazla çıkan 4 kez çıktıysa:
- k1 = (3 / 4) × 100 = **75 puan**

> ⚠️ **Sorun:** Jokerler ile çekiliş sayıları toplandıktan sonra normalize ediliyor. 
---

#### K2 — Genel (Tarihsel) Frekans (Varsayılan: ±50 puan)

**Mantık:** Sayının TÜM geçmiş çekiliş veritabanındaki frekansını ortalamaya göre karşılaştırır.

```javascript
Eğer benim_frekans >= ortalama:
    k2 = ((benim_frekans - ortalama) / (max - ortalama)) × K2_PUAN   // pozitif
Eğer benim_frekans < ortalama:
    k2 = -((ortalama - benim_frekans) / (ortalama - min)) × K2_PUAN  // negatif
```

**Sonuç aralığı:** −50 ile +50 arası.

> ⚠️ **Sorun:** Tarihsel veri SD90 gömülü (1373 satır), DB verisiyle AYRI hesaplanıyor. Hangi veri seti kullanılıyor tam netlik yok.

---

#### K3 — Kuraklık Puanı (Varsayılan: +5 puan × kuraklık gün sayısı)

**Mantık:** Sayının son kaç çekilişten beri hiç çıkmadığını sayar (kuraklık), bunu sabit çarpanla çarpar.

```javascript
for (idx = 0; idx < df.length; idx++) {
    if (df[idx].includes(i)) break;
    kuraklik++;
}
k3 = kuraklik × K3_PUAN
```

**Örnek:** 10 çekilişten beri çıkmadıysa: 10 × 5 = **+50 puan**

> ⚠️ **Kritik Sorun:** K18 (Ölüm Cezası) de kuraklık tabanlı. Çok uzun süre çıkmayan sayı önce K3 ile çok yüksek puan alıp sonra K18 ile ağır ceza yiyor — bu çelişkili bir davranış.

---

### 🔵 GRUP B — GÜNCEL KURALLAR (×Güncel Çarpan)

---

#### K4 — Joker Canlılık / Joker Komşuluğu (Varsayılan: +50 puan)

**Mantık:** Son 15 çekilişin joker sayılarına bakılır. Sayı bizzat joker ise doğrudan puan alır. Sayı joker'e 8 yönlü komşu ise yarı puan alır.

```javascript
// Sayı joker ise:
k4 += floor(K4_PUAN × (15 - index) / 15)

// Sayı joker komşusu ise (en fazla 2 kez):
k4 += floor((K4_PUAN × 0.5) × (15 - index) / 15)
```

**Zaman ağırlığı:** En yeni çekiliş (index=0) → tam ağırlık, en eski (index=14) → 1/15 ağırlık.

> ✅ **İyi tasarım:** Zaman ağırlıklı lineer bozunma mantıklı.

---

#### K5 — 1. Halka Komşu (Varsayılan: +15 puan × komşu sayısı)

**Mantık:** Son 3 çekilişte çıkan sayıların 9×10 kupon geometrisinde 8-yönlü doğrudan komşuları puan alır.

```javascript
// 8 yön: sol, sağ, üst, alt, 4 köşegen
Son 3 çekilişte her komşuluk için: komsuSayaci_1[n]++
k5 = komsuSayaci_1[i] × K5_PUAN
```

**9×10 kupon koordinatı:**
- Aynı satır: ±1 (sol/sağ, sütun sınırına dikkat)
- Bir üst/alt satır: ±10, ±9, ±11 (köşegenler)

---

#### K6 — 2. Halka Komşu (Varsayılan: +8 puan × komşu sayısı)

**Mantık:** K5'in 2 birim uzağındaki sayılar (2. halka). Daha az puan verir.

```javascript
// 2. halka: ±2 aynı satır, ±20 üst/alt, ±18, ±22 köşegenler
k6 = komsuSayaci_2[i] × K6_PUAN
```

---

#### K7 — Onluk Blok Bonusu (Varsayılan: +20 puan)

**Mantık:** Sayının bulunduğu onluk blok (1-10, 11-20, ...) son 2 çekilişte HİÇ temsil edilmemişse bonus alır.

```javascript
blok = floor((i - 1) / 10)
bas = blok × 10 + 1; bit = min(bas + 9, maxN)
cikti = son2'deki herhangi biri bu aralıkta mı?
if (!cikti) k7 = K7_PUAN
```

**Amaç:** Az temsil edilen bölgelere çekicilik katmak.

---

#### K8 — Bölge Geçiş Bonusu (Varsayılan: +25 puan)

**Koşul:** `hits_15 >= 1 VE hits_15 <= 2 VE hits_3 >= 1 VE komşuluk YOK`

```javascript
// Son 15'te 1-2 kez çıktı, son 3'te 1 kez çıktı ama komşusu yok
if (hits_15 >= 1 && hits_15 <= 2 && hits_3 >= 1 && !komsuluk)
    k8 = K8_PUAN
```

**Yorum:** Izole ama aktif sayı — bağımsız bir ısınma sinyali.

---

#### K9 — Kinetik İvme Bonusu (Varsayılan: +30 puan)

**Koşul:** `hits_3 >= 2 VE hits_15 <= 3`

```javascript
// Son 3'te 2 veya daha fazla çıktı, toplamda 15'te 3'ü geçmedi
if (hits_3 >= 2 && hits_15 <= 3)
    k9 = K9_PUAN
```

**Yorum:** Kısa vadede hızlanan ama henüz "doygun" olmayan sayı.

---

#### K10 — Gecikmeli Tekrar (Varsayılan: +25 puan)

**Koşul:** `hits_15 == 2 VE hits_5 == 0`

```javascript
// 15'te tam 2 kez çıktı ama son 5'te hiç çıkmadı
if (hits_15 === 2 && hits_5 === 0)
    k10 = K10_PUAN
```

**Yorum:** Orta vadede aktif ama son dönemde sessiz kalan sayı.

---

#### K11 — Bölge Geçişi + Komşuluk (Varsayılan: +40 puan)

**Koşul:** `kuraklık >= 5 VE kuraklık <= 15 VE hits_15 >= 2 VE komşuluk VAR`

```javascript
if (kuraklik >= 5 && kuraklik <= 15 && hits_15 >= 2 && komsuluk)
    k11 = K11_PUAN
```

**Yorum:** Biraz dinlenmiş, geçmişte aktif, şu an komşu aktivitesi olan sayı — "hazır" sinyali.

---

#### K12 — Aşırı Isınma + Komşuluk (Varsayılan: +35 puan)

**Koşul:** `hits_10 > 0 VE komşuluk VAR`

```javascript
// Son 10'da en az 1 kez çıkmış VE komşu aktivitesi var
if (hits_10 > 0 && komsuluk)
    k12 = K12_PUAN
```

> ⚠️ **İsim Tutarsızlığı:** Fonksiyon başındaki `K12_PUAN` için `mainItems` listesinde "K12 - Aşırı Isınma Cezası" yazıyor ama değer **pozitif** (+35). Slider etiketinde yanlış etiket var.

---

### 🔴 GRUP C — CEZA KURALLARI (Çarpan uygulanmıyor)

---

#### K13 — Çifte Tekrar Cezası (Varsayılan: −50 puan)

**Koşul:** `hits_15 >= 4`

```javascript
// Son 15'te 4 veya daha fazla kez çıktı
if (hits_15 >= 4)
    k13 = K13_PUAN  // negatif
```

---

#### K14 — Ardışık İki Çekilişte Çıkış (Varsayılan: −40 puan)

**Koşul:** `son çekilişte de VE ondan önceki çekilişte de çıktı`

```javascript
if (df[0].includes(i) || joks[0]===i) AND
   (df[1].includes(i) || joks[1]===i)
    k14 = K14_PUAN  // negatif
```

> ⚠️ **Kritik Sorun:** UI'da `K14_PUAN_4`, `K14_PUAN_8`, `K14_PUAN_12`, `K14_PUAN_16` şeklinde 4 ayrı slider var. Ancak `puanlari_hesapla()` fonksiyonu tek bir `config.K14_PUAN` kullanıyor — bu değerler **hiç kullanılmıyor!**

---

#### K15 — Doygunluk Cezası (Varsayılan: −30 puan)

**Koşul (doygun = true ise):**
```javascript
if (hits_3 >= 2) → doygun
else if (son_7'de >= 3 kez) → doygun
else if (son_11'de >= 4 kez) → doygun
```

> ⚠️ **İsim Tutarsızlığı:** K15 `showPuanAyarlari` modal'ında "K15 - Tam Isınma (Bonus)" olarak etiketlenmiş ama değer −30 (ceza). Yanıltıcı.

---

#### K16 — İzolasyon Cezası (Varsayılan: −100 puan)

**Koşul:** `komşuluk YOK VE son çekilişte çıkmadı`

```javascript
if (!komsuluk && !is_in_last)
    k16 = K16_PUAN  // -100
```

**Yorum:** Hem yakın geçmişte çıkmamış hem de komşu aktivitesi olmayan sayı büyük ceza alır.

---

#### K17 — Dinamik Seri (Varsayılan: −50 puan)

**Koşul:** `son çekilişte çıkmış VE geçmişte 2+ üst üste çıkış serisi EN FAZLA 1 kez yaşandı`

```javascript
if (is_in_last) {
    // Tüm geçmişte kaç kez 2+ ardışık çıkış serisi oldu?
    if (streak_events <= 1)
        k17 = K17_PUAN  // negatif
}
```

> ⚠️ **Mantık Kafa Karıştırıcı:** Bu ceza "son çekilişte çıkan ama seri yaşamamış" sayıya uygulanıyor. Neden ceza? Tutarsız tasarım — bonus olması daha mantıklı görünüyor.

---

#### K18 — Ölüm Cezası (Varsayılan: −200 puan)

**Koşul:** `kuraklık >= OLUM_CEZASI_SINIRI (varsayılan: 25)`

```javascript
if (kuraklik >= config.OLUM_CEZASI_SINIRI)
    k18 = K18_PUAN  // -200
```

**Amaç:** Çok uzun süredir çıkmayan "ölü sayıları" sistemden elemek.

> ⚠️ **Kritik Sorun:** K3 ile doğrudan çelişiyor. K3 kuraklık arttıkça puan artırıyor (+5×kuraklık), K18 belirli bir eşiği geçince ağır ceza veriyor. Eşik bölgesinde sayı ani puan kaybı yaşıyor.

---

## 3. v7.5 Çekiliş Haritası Puanlama Sistemi

Bu sistem `analyzeDraws()` fonksiyonuyla çalışır, **yukarıdaki K1-K18 sisteminden BAĞIMSIZDIR.**

### Ağırlıklı Frekans Hesabı

```javascript
// Ç1 en yeni (ağırlık 1.0), Ç15 en eski (ağırlık 0.3) — lineer azalma
w = 1.0 - (i / 14) × 0.7

wFreq[n] += w           // ağırlıklı skor
rawCnt[n]++             // ham tekrar
```

### Komşuluk (9×10 Geometri)

```javascript
// 1. Halka komşu (8 yön) ağırlığı:
dw = (i === 0 ? 3 : (i <= 2 ? 2 : 1))
neigh += dw          // 1. halka

// 2. Halka komşu:
neigh += dw × 0.5    // 2. halka
```

### Nihai Skor Formülü

```javascript
score = wScore × 14 + recent × 8 + neigh × 2 + streakPenalty
```

| Bileşen | Formül | Değer aralığı |
|---|---|---|
| `wScore × 14` | Ağırlıklı frekans | 0 — ~21 |
| `recent × 8` | Yakın çıkış bonusu | 0, 3.6, 5.6, 8 |
| `neigh × 2` | Komşuluk | 0+ |
| `streakPenalty` | Üst üste ceza | 0, −5, −12, −20 |

### Gruplandırma Kuralları

| Grup | Koşul |
|---|---|
| **Sıcak** | `wScore >= 1.5 VE streak < 2` |
| **Ilık** | `wScore >= 1.0 VE streak >= 2` VEYA `cnt==1 VE (yakın veya neigh>=5)` |
| **Orta** | `cnt >= 1 VEYA neigh > 0` |
| **Soğuk** | Yukarıdakilerden hiçbiri |

---

## 4. Varsayılan Puan Değerleri Özeti

| Kural | Tip | Varsayılan Puan | Kategori |
|---|---|---|---|
| K1 - Son 15 Frekans | Bonus | +100 | Tarihsel |
| K2 - Genel Frekans | ±Bonus | ±50 | Tarihsel |
| K3 - Kuraklık | Bonus | +5 × gün | Tarihsel |
| K4 - Joker Canlılık | Bonus | +50 (lineer) | Güncel |
| K5 - 1. Halka Komşu | Bonus | +15 × komşu | Güncel |
| K6 - 2. Halka Komşu | Bonus | +8 × komşu | Güncel |
| K7 - Onluk Blok | Bonus | +20 | Güncel |
| K8 - Bölge Geçiş | Bonus | +25 | Güncel |
| K9 - Kinetik İvme | Bonus | +30 | Güncel |
| K10 - Gecikmeli Tekrar | Bonus | +25 | Güncel |
| K11 - Bölge Geçiş+Komşu | Bonus | +40 | Güncel |
| K12 - Isınma+Komşu | Bonus | +35 | Güncel |
| K13 - Çifte Tekrar | Ceza | −50 | Ceza |
| K14 - Ardışık 2 Çıkış | Ceza | −40 | Ceza |
| K15 - Doygunluk | Ceza | −30 | Ceza |
| K16 - İzolasyon | Ceza | −100 | Ceza |
| K17 - Dinamik Seri | Ceza | −50 | Ceza |
| K18 - Ölüm Cezası | Ceza | −200 | Ceza |

---

## 5. Tespit Edilen Sorunlar ve Revizyons Önerileri

### 🔴 Kritik Sorunlar

#### S1 — K14 UI Slider'ları Hesaplamaya Bağlanmamış

**Sorun:** UI'da K14_PUAN_4, K14_PUAN_8, K14_PUAN_12, K14_PUAN_16 şeklinde 4 ayrı slider görünüyor ama `puanlari_hesapla()` fonksiyonu yalnızca `config.K14_PUAN` kullanıyor. Bu 4 slider değeri **hiçbir hesaplamayı etkilemiyor.**

**Öneri:** Ya bu 4 sliderı gerçekten "son 4/8/12/16 çekilişte ardışık" için ayrı koşullar olarak implement et, ya da UI'dan kaldır ve tek bir K14_PUAN bırak.

#### S2 — K3 ve K18 Çelişkisi

**Sorun:** K3 kuraklık arttıkça bonus ekliyor. K18 belirli bir eşiği (varsayılan 25) geçince −200 ceza uyguluyor. Eşik bölgesinde (örn. kuraklık=25) sayı hem +125 K3 puanı alıyor hem de −200 K18 cezası yiyor — ani ve sert bir düşüş.

**Öneri:** K3 puanını kuraklık eşiğini geçince sıfırlayan ya da azaltan bir düzeltme ekle. Örn: `if (kuraklik >= OLUM_SINIRI) k3 = 0`.

#### S3 — K12 Etiketi Yanlış

**Sorun:** Puan Ayarları modal'ında K12 için "K12 - Aşırı Isınma **Cezası**" yazıyor ama değer +35 (pozitif bonus). Kullanıcıyı yanıltıyor.

**Öneri:** Etiketi "K12 - Aktif + Komşuluk Bonusu" olarak düzelt.

#### S4 — K15 Etiketi Yanlış

**Sorun:** K15 için "K15 - Tam Isınma (Bonus)" yazıyor ama varsayılan değer −30 (ceza).

**Öneri:** Etiketi "K15 - Doygunluk Cezası" olarak düzelt.

---

### 🟡 Orta Düzey Sorunlar

#### S5 — K17 Mantığı Ters

**Sorun:** K17 "son çekilişte çıkmış ama seri serisi yaşamamış" sayıya ceza veriyor. Bu ceza değil bonus kriteriymiş gibi görünüyor.

**Öneri:** K17'nin pozitif bonus olmasını düşün — "son çekilişte çıktı, geçmişte denge sağladı" → güçlü sinyal.

#### S6 — v7.5 ve K1-K18 Puanlama Sistemleri Ayrı

**Sorun:** "Haritayı Analiz Et" butonu v7.5 sistemini, "Analiz Yap" butonu K1-K18 sistemini çalıştırıyor. İkisi farklı algoritma kullanıyor ama kullanıcıya bunu anlatan açıklama yok.

**Öneri:** Her iki panele "Bu analiz hangi algoritmayı kullanır?" açıklama notu ekle.

---

### 🟢 İyileştirme Önerileri

#### S7 — K1 Joker Ağırlığı

**Mevcut:** Joker sayılar çekiliş sayılarıyla eşit ağırlıkta K1'e ekleniyor.
**Öneri:** Joker sayılar için 0.5x ağırlık uygula (joker çekilişin etkisi daha az olmalı).

#### S8 — K4 Komşu Limiti

**Mevcut:** Joker komşuluğu en fazla 2 kez sayılıyor (`joker_komsu_count[komsu] < 2`).
**Açıklama:** 

#### S9 — Slider UI ve mult_config Mapping Hatası

**Sorun:** `v8_hist_engine.js` sat. 462–476'da slider id'leri ile `mult_config` key'leri arasındaki eşleme kısmen yanlış.

```javascript
// Mevcut (yanlış eşleme örnekleri):
'hm_komsu': 'K6_PUAN',    // K6 ama slider adı komsu → karışıklık
'hm_komsu2': 'K7_PUAN',   // K7 ama slider adı komsu2 → karışıklık
```

K5 ve K6 ile slider ID'leri uyuşmuyor. Puan ayarları modalinden kaydedilen değerler yanlış slider'ı güncelleyebilir.

---

## 6. Skor Tablosunun Sütun Yapısı

`H.renderScore()` fonksiyonu bu sütunları render eder:

| Sütun | Açıklama | `hm_details` Alanı |
|---|---|---|
| Sayı | 1-90 arası sayı | `n` |
| freq50 | Son 50 çekilişte frekans | `freq50` |
| effDrought | Efektif kuraklık | `effDrought` |
| jpen | Joker cezası (sadece 6/90) | `jpen` |
| histScore | Tarihsel skor (K1+K2+K3) | `histScore` |
| recScore | Güncel skor (K4-K12) | `recScore` |
| combined | Birleşik skor | `combined` |
| Manuel | Kullanıcı düzeltme | `manual` |
| Final | `combined + manuel` | `final` |
| Grup | hot/warm/cold/out | `group` |

> **Not:** `freq50`, `effDrought`, `jpen`, `histScore`, `recScore`, `combined` alanları DST tablosunda görünüyor ama `puanlari_hesapla()` bu alanları doldurmayabiliyor. Bunlar eski motordan kalma alanlar olabilir.

---

## 7. Revizyona Başlamak İçin Öncelik Sırası

1. **[Acil]** K14 slider'larının hesaplamaya bağlanması veya UI'dan kaldırılması
2. **[Acil]** K12 ve K15 etiketlerinin düzeltilmesi
3. **[Önemli]** K3/K18 çelişkisinin çözülmesi
4. **[Önemli]** K17 mantığının gözden geçirilmesi
5. **[İyileştirme]** Slider ↔ mult_config eşleme tutarsızlıklarının giderilmesi
6. **[İyileştirme]** v7.5 ve K1-K18 sistemleri arası kullanıcı açıklamaları
