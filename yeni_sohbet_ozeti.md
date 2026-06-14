# Yeni Sohbet İçin Devir Özeti (Görev Kartı)

**Proje:** `PROMPT_BUILDER_v8_0.html` - Sayı Havuzu ve Detaylı Puan Tablosu Geliştirmesi
**Durum:** Hatalı bir motor güncellemesi yapıldı (NaN hatası veriyor). Yeni sohbette ilk iş motor geri alınacak ve sadece görsel (UI) bazlı bir detaylı tablo oluşturulacak.

## 1. Kesin Kurallar (Asla İhlal Edilmeyecek)
*   **Motora Dokunmak Yasak:** `HavuzMotoru.puanlari_hesapla` içindeki kodlara, matematiksel sisteme ve altyapıya ASLA dokunulmayacak. Önceki sohbette yapılan refactor (detay objesi döndürme) işlemi tamamen geri alınarak orijinal, çalışan sisteme dönülecek.
*   **UI ve Motor Ayrımı:** Detaylı tablo için gereken kural puanları, motoru bozmadan sadece ekran (UI) için çalışan bağımsız bir izleme fonksiyonuyla (örn: `extractDetailsForUI`) alınacak.

## 2. Tasarım İstekleri (Görsellere Sadık Kalınacak)
*   **Sayı Baloncukları (1. Görsel):** Koyu zemin üstünde, büyük, kalın beyaz fontlu ve köşeleri hafif yuvarlatılmış **yeşil kare/dikdörtgen** olacak. Sayının puanı hemen altında "p" harfiyle (Örn: `45 p`) yer alacak. (Şu anki NaN hatası motor düzeltilince gidecek).
*   **Detaylı Tablo (2. Görsel / Dark Neon Tema):** Sadece tablo alanı koyu (lacivert/siyah) olacak. Çerçeveler yuvarlak, sayılar beyaz, eksi puanlar (cezalar) **kırmızı**, Final Puanı ise **neon yeşil** olacak.

## 3. Yeni Özellikler
*   **Kaydet ve Sırala Butonu:** Manuel puan kutusuna sayı yazıldığında tablo *anında sıralanıp sayıyı kaybetmeyecek*. "Kaydet ve Sırala" butonuna basılana kadar hiçbir sayı yer değiştirmeyecek.
*   **Sayı Bul ve Parlat:** Tablonun üstüne eklenecek "Sayı Ara" kutusuna bir sayı (Örn: 19) yazıp Bul denildiğinde; tablo o satıra kayacak ve o satır **neon yeşil bir çerçeveyle** parlayacak. Kullanıcı işlemi bitirip "Kaydet" diyene kadar o parlama sönmeyecek.

## 4. Tablo Sütunları (Tam 16 Kural + Manuel + Final)
Tabloda cezalar tek bir yere toplanmayacak, Havuz Motoru'ndaki 14 ayar ve 2 Oran tek tek sütun yapılacak:
1.  **Tarihsel Puan** (Tüm Geçmiş Oranı)
2.  **Güncel Puan** (Son 15/10/5 Oranı)
3.  **K1- Son 15 Çarpanı**
4.  **K2- Son 10 Çarpanı**
5.  **K3- Son 5 Çarpanı**
6.  **K4- Kuraklık Çarpanı**
7.  **K5- Joker Çarpanı**
8.  **K6- 1. Halka Komşu**
9.  **K7- 2. Halka Komşu**
10. **K8- Onluk Blok Bonusu**
11. **K9- Kinetik İvme Bonusu**
12. **K10- Gecikmeli Tekrar**
13. **K11- Bölge Geçişi**
14. **K12- Ölü Sayı Cezası**
15. **K13- Çifte Tekrar Cezası**
16. **K14- Doygunluk (Tükenmişlik) Cezası**
17. **Manuel** (Elle Girilen Puan)
18. **Final Puan** (Sıralamayı belirleyen son puan)

---
*Yeni yapay zeka asistanına not: Yukarıdaki özeti okuyup onaylamadan hiçbir kod yazma ve kesinlikle HavuzMotoru'nu eski haline (NaN hatasız haline) döndürmekle işe başla.*
