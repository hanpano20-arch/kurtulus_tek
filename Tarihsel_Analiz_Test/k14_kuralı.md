# K14 Kuralı: Son 3 Çekiliş Dinamik Eleme Algoritması

**Sürüm:** 1.0  
**Kural Kodu:** K14  
**Kategori:** İstatistiksel Havuz Daraltma  
**Bağımlılık:** T-1, T-2, T-3 çekiliş verisi + tüm tarihsel veri tabanı  

---

## 1. Kural Tanımı ve Amaç

K14, bir önceki 3 çekilişte (T-1, T-2, T-3) çıkmış sayılardan oluşan "taze havuzu" alır ve bu havuzun büyük çoğunluğunun bir sonraki çekilişte **tekrar etmeyeceği** gerçeğini istatistiksel algoritmalar ile işler. Havuzdaki her sayıya birden fazla istatistiksel kriter üzerinden bir **eleme skoru** hesaplar ve bu skora göre zayıf adayları havuz dışına atar.

> **Temel Kural:** "Son 3 çekilişte çıkmış olmak, bir sayıyı aday yapmaz; aksine, istatistiksel olarak **çoğunu eleman**  yapar."

---

## 2. Karar Mimarisi: 3 Katmanlı Bileşik Skor Modeli

Aşağıdaki 5 istatistiksel modelin tamamı incelenmiş; **sinyalin gücü ve hesaplanabilirliği** açısından değerlendirilerek hiyerarşik bir mimariye dönüştürülmüştür.

| Model | İstatistiksel Güç | Hesap Karmaşıklığı | K14'teki Rolü | Ağırlık |
|---|---|---|---|---|
| M1: Taze/Bayat İndeksi | ★★★★★ | Düşük | Katman 1 – Temel | %35 |
| M2: Bireysel Tekrar Oranı (Markov) | ★★★★★ | Orta | Katman 1 – Temel | %35 |
| M3: Bölgesel Yığılma Cezası | ★★★★☆ | Düşük | Katman 2 – Bağlam | %20 |
| M4: Hız/İvme Analizi | ★★★★☆ | Orta | Katman 2 – Bağlam | %10 |
| M5: Makro Denge (Çift/Tek) | ★★★☆☆ | Çok Düşük | Katman 3 – Düzeltici | ±bonus |

> **Seçim Gerekçesi:** M1 ve M2, birbirini tamamlayan en güçlü iki sinyal olduğu için temel oluşturur. M3 bağımsız bir bağlam katmanı sağlar. M4 M1/M2'ye derinlik katar. M5, en zayıf sinyal olduğundan skor belirleyici değil, sadece yüzeysel düzeltici (tiebreaker) işlevi görür.

---

## 3. Giriş Verisi Tanımı

K14 çalışmadan önce aşağıdaki veri yapısı hazır olmalıdır:

```
POOL_T  = Son 3 çekilişte çıkmış benzersiz sayılar (genellikle 15–22 sayı)
DRAW_T1 = T-1 çekiliş seti (en taze)
DRAW_T2 = T-2 çekiliş seti
DRAW_T3 = T-3 çekiliş seti (en bayat)
HIST    = Tüm tarihsel çekiliş verisi (skor hesaplamak için)
```

---

## 4. Algoritma Adımları

### ADIM 1 — Ön İşlem: Her Sayıya Pozisyon Etiketi Ver

`POOL_T` içindeki her sayıya hangi çekilişten (T-1, T-2, T-3) geldiği bilgisi etiketlenir.  
Bir sayı birden fazla çekilişte çıkmışsa en taze kayıt esas alınır.

```
için her s ∈ POOL_T:
    eğer s ∈ DRAW_T1 → s.pozisyon = "T1"
    yoksa eğer s ∈ DRAW_T2 → s.pozisyon = "T2"
    yoksa → s.pozisyon = "T3"
```

---

### ADIM 2 — M1: Taze/Bayat Ağırlık Puanı (W_recency)

Tüm tarihsel veri taranır. Bir önceki çekilişte çıkmış sayıların kaçının bir sonraki çekilişte tekrar ettiği pozisyona göre ölçülür.

**Tarihsel Tekrar Oranlarını Hesapla:**

```
R(T1) = (T-1'den gelen sayıların tekrar etme sayısı) / (T-1'den gelen toplam sayı sayısı)
R(T2) = (T-2'den gelen sayıların tekrar etme sayısı) / (T-2'den gelen toplam sayı sayısı)
R(T3) = (T-3'den gelen sayıların tekrar etme sayısı) / (T-3'den gelen toplam sayı sayısı)
```

**Beklenen tipik sonuç (kalibrasyona göre değişir):**

| Pozisyon | Beklenen Tarihsel Tekrar Oranı |
|---|---|
| T-1 | ~%18–25 |
| T-2 | ~%12–18 |
| T-3 | ~%6–12 |

**Normalize Edilmiş Ağırlık:**

```
W_recency(s) = R(s.pozisyon) / max(R(T1), R(T2), R(T3))
```

> Sonuç: Her sayı için 0.0–1.0 arasında bir taze/bayat puanı.

---

### ADIM 3 — M2: Bireysel Markov Tekrar Oranı (W_bounce)

Her sayının lotonun tüm tarihi boyunca "çıktıktan sonra 3 çekiliş içinde tekrar çıkma" oranı hesaplanır.

```
için her s ∈ POOL_T:
    toplam_cikis(s)  = HIST içinde s'nin çıktığı toplam çekiliş sayısı
    bounce_sayisi(s) = HIST içinde s çıktıktan sonraki 3 çekiliş içinde tekrar çıktığı vakaların sayısı
    
    BOUNCE_RATE(s) = bounce_sayisi(s) / toplam_cikis(s)
```

**Havuz Ortalamasını Hesapla:**

```
AVG_BOUNCE = POOL_T içindeki tüm sayıların BOUNCE_RATE ortalaması
```

**Normalize:**

```
W_bounce(s) = BOUNCE_RATE(s) / max_bounce_rate_in_pool
```

> Sayının tarihsel huyu bu adımda sayısallaşır. Düşük bounce → eleme adayı.

---

### ADIM 4 — M3: Onluk Dilim Yığılma Cezası (PENALTY_decile)

`POOL_T` içindeki sayıların hangi onluk dilimlere düştüğü analiz edilir.

**Dilim haritasını çıkar:**

```
Dilimler: [1-9], [10-19], [20-29], [30-39], [40-49], [50-59], [60-69], [70-79], [80-90]
(Lotonun sayı aralığına göre ayarlanır)

için her dilim D:
    doluluk(D) = POOL_T içinden D'ye düşen sayı sayısı

YOĞUN_DILIM_ESIGI = ceil(len(POOL_T) / dilim_sayisi) × 1.5
```

**Ceza Uygula:**

```
için her s ∈ POOL_T:
    eğer doluluk(s.dilimi) > YOĞUN_DILIM_ESIGI:
        PENALTY_decile(s) = 0.25   # Skor %25 düşürülür
    değilse:
        PENALTY_decile(s) = 0.0    # Ceza yok
```

---

### ADIM 5 — M4: Hız/İvme Sınıflandırması (W_velocity)

Her sayının son 10 çekilişteki aktivitesine göre durumu sınıflandırılır.

```
için her s ∈ POOL_T:
    son10_cikis(s) = Son 10 çekilişte s'nin kaç kez çıktığı (T-1/T-2/T-3 hariç)

    eğer son10_cikis(s) == 0:
        s.hiz = "UYANIS"      # Uzun sessizlik → potansiyel yüksek
    yoksa eğer son10_cikis(s) == 1:
        s.hiz = "AKTIF"       # Normal ısınma
    yoksa:
        s.hiz = "YORGUN"      # Aşırı ısınmış → saman alevi riski
```

**Hız Çarpanı:**

```
W_velocity:
    "UYANIS"  → 1.15  (bonus)
    "AKTIF"   → 1.00  (nötr)
    "YORGUN"  → 0.85  (hafif ceza)
```

---

### ADIM 6 — M5: Makro Denge Düzelticisi (DELTA_macro)

Bu katman yalnızca aşırı dengesiz durumlar için devreye girer.

```
cift_sayisi  = POOL_T içindeki çift sayıların adedi
tek_sayisi   = POOL_T içindeki tek sayıların adedi
POOL_BOYUTU = len(POOL_T)

cift_oran = cift_sayisi / POOL_BOYUTU

eğer cift_oran > 0.65:  # Havuzun %65'inden fazlası çift
    DELTA_macro(s) = -0.05 eğer s çift ise, +0.05 eğer s tek ise
yoksa eğer cift_oran < 0.35:  # Havuzun %65'inden fazlası tek
    DELTA_macro(s) = +0.05 eğer s çift ise, -0.05 eğer s tek ise
değilse:
    DELTA_macro(s) = 0.0
```

---

### ADIM 7 — Bileşik K14 Skoru Hesapla

Tüm katmanlar bir araya getirilir:

```
K14_RAW(s) = (W_recency(s) × 0.35) + (W_bounce(s) × 0.35) + (W_velocity(s) × 0.10)

K14_CONTEXT(s) = K14_RAW(s) × (1 - PENALTY_decile(s))

K14_FINAL(s) = K14_CONTEXT(s) + DELTA_macro(s)
```

> **Sonuç:** Her sayı için 0.0 – 1.2 arasında bir K14 nihai skoru elde edilir. Yüksek skor → havuzda kalmaya devam. Düşük skor → eleme.

---

### ADIM 8 — Eleme Kararı

```
ELEME_ESIGI = K14_FINAL skoru, havuz ortalamasının %60'ının altında kalan sayılar

için her s ∈ POOL_T:
    eğer K14_FINAL(s) < (AVG_K14_FINAL × 0.60):
        s → ELENDI  (K14 tarafından havuz dışına çıkarıldı)
    değilse:
        s → HAVUZDA  (Bir sonraki kurala geçer)
```

> **Hedef Eleme Oranı:** POOL_T'nin %40–60'ı K14 tarafından elenmeli. Daha azı → kural etkisiz. Daha fazlası → kural agresif, backtest gerekir.

---

## 5. Hesap Özeti Tablosu (Örnek Çalışma)

| Sayı | Pozisyon | W_recency | W_bounce | PENALTY_decile | W_velocity | DELTA_macro | K14_FINAL | Karar |
|---|---|---|---|---|---|---|---|---|
| 7 | T1 | 1.00 | 0.82 | 0.00 | 1.15 (Uyanış) | 0.00 | **0.760** | ✅ Havuzda |
| 34 | T2 | 0.71 | 0.55 | 0.25 | 1.00 (Aktif) | -0.05 | **0.364** | ❌ Elendi |
| 52 | T3 | 0.38 | 0.41 | 0.25 | 0.85 (Yorgun) | 0.00 | **0.213** | ❌ Elendi |
| 19 | T1 | 1.00 | 0.90 | 0.00 | 1.00 (Aktif) | +0.05 | **0.680** | ✅ Havuzda |

---

## 6. Kalibrasyon ve Backtest Gereksinimleri

K14 kodlamadan önce aşağıdaki ön kalibrasyon adımları çalıştırılmalıdır:

### 6.1 — R(T1), R(T2), R(T3) Oranlarını Ölç
En az **200 geçmiş çekiliş** üzerinde T-1, T-2, T-3 tekrar oranları hesaplanmalı. Bu oranlar lotodan lotoya değişir; varsayım kullanılmamalı.

### 6.2 — BOUNCE_RATE Dağılımını İncele
Tüm sayıların bireysel bounce oranları histogram olarak görselleştirilmeli. Eğer dağılım çok dardsa (örn: hepsi %15–18 arası), M2'nin ayırt edici gücü düşük demektir ve ağırlığı yeniden değerlendirilmelidir.

### 6.3 — Eleme Oranını İzle
100 geçmiş çekiliş üzerinde K14 simüle edilir. "K14 tarafından elenen sayılar gerçek çekilişte kaç kez çıktı?" sorusunun cevabı izlenir.

**Başarı Kriteri:**
```
K14_ELEME_ISABETSIZLIGI = (K14 tarafından elenen ama gerçekte çıkan sayı adedi) / (gerçekte çıkan toplam sayı)

Hedef: K14_ELEME_ISABETSIZLIGI < 0.25
(Elimize yanlış attığımız sayı, 6'lık kombinasyonun %25'inden az olmalı)
```

---

## 7. Uygulama Sözleşmeleri

| Madde | Kural |
|---|---|
| Minimum tarihsel veri | En az 150 çekiliş (ideal: 400+) |
| Güncelleme sıklığı | Her çekilişten sonra T-1/T-2/T-3 kaydırılır |
| BOUNCE_RATE güncelleme | Her 50 çekilişte bir yeniden hesaplanır |
| Ağırlık revizyonu | Her 200 çekilişte bir backtest yapılır, ağırlıklar güncellenir |
| Boş havuz güvenliği | K14 sonrası havuz 5 sayının altına düşerse eleme eşiği %50'ye çekilir |

---

## 8. Diğer Kurallarla Entegrasyon

```
K12 (Sıcak/Aşırı Isınmış) → K14 öncesi çalışır. K12'den geçen havuz K14'e girer.
K14 (Bu kural)             → Son 3 çekiliş havuzunu dinamik olarak daraltır.
K8  (Sleep/Drought)        → K14'ten bağımsız paralel çalışır; çıktılar birleştirilir.
```

> K14, zincirin ortasında konumlanır. Hem yukarıdan gelen veriyi işler hem de çıktısını bir sonraki filtreleme katmanına temizlenmiş halde gönderir.

---

## 9. Geliştirici Notu

K14'ün gücü, **isimsiz çalışmasından** gelir. Algoritma hiçbir zaman "34 kötü bir sayıdır" demez; "bu anda bu sayının profili zayıftır" der. Her çekilişten sonra profil değişir, karar değişir. Bu, kuralı tarih bağımsız ve tekrar edilebilir (reproducible) kılar — sağlam bir istatistiksel sistem için olmazsa olmaz özelliktir.

---

*K14 Kural Dokümanı — Analitik Loto Veri Bilimi Çerçevesi*
