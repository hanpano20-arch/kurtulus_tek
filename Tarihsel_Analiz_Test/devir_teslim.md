# Devir Teslim Dosyası (Handover Document)

## Projenin Mevcut Durumu

Kullanıcı ile `kurtulus_tek` projesinin `Tarihsel_Analiz_Test` klasöründeki loto/sayı seçimi test motoru uygulaması üzerinde çalışılmaktadır. Ana dosyalar:
- `Motor_Test_Paneli.html` (Arayüz ve Modal Yönetimi)
- `test_motor_v3.js` (Hesaplama ve Puanlama Motoru)

### Son Oturumda Yapılanlar:
1. **Joker Körlüğü Sorunu:** `K8_UYKU_CEZASI` hesaplanırken joker sayılarının uykuyu bozmaması (Jokerlerin görülmemesi) sorunu çözüldü. Artık sayı joker olarak çıksa dahi uykusu sıfırlanıyor.
2. **K13 (Canlandırma) Kuralı Yeniden Düzenlendi:** K13 kuralı için "Eşik 1" ve "Eşik 2" şeklinde iki ayrı seçenek eklendi (örn: 2 komşu ve 3 komşu). İlk eşiği geçen taban puanı alıyor, ikinci eşiği geçen (daha çok komşusu olan) taban puanın 2 katını alıyor. Joker sayıları da artık komşuluk kontrollerine dâhil ediliyor.
3. **Havuz (Pool) Hatası:** Sistem 20 sayı seçmesi gerekirken 36 sayı seçiyordu. Bunun sebebi K13 puanlarının nihai havuza girmemesiydi, bu matematiksel mantık hatası düzeltildi.
4. **Settings (Ayarlar) Modalı Görsel Düzenlemeler:** K8, K9, K10, K12 ve K13 kurallarının "Ayarlar" sayfasındaki görünümleri, `K1` ile `K7` arasındaki standart görünüme uyacak şekilde "yan yana (inline)" tasarlandı.

### Son Oturumda Yaşanan Sorun (Kritik):
**Ayarlar Modalının İstenmeyen Şekilde Kapanması:** 
Kullanıcı, "Ayarlar" sayfasında değişiklik yapıp henüz kaydetmeden "X" (kapat) butonuna bastığında modalın **kesinlikle kapanmamasını**, sadece uyararak kapanışı engellemesini istiyor. 
Şu ana kadar `oninput="unsavedSettings = true"` yöntemi ve son olarak DOM üzerinden anlık değerlerin `baseSettings` ile kıyaslandığı `isSettingsChanged()` mekanizması kuruldu. Ancak kullanıcının ortamında modal halen uyarı vermeden kapanabiliyor. 

---

## Yeni Ajan İçin Notlar ve Görevler

Merhaba Yeni Ajan! Bu projeyi devraldığında lütfen aşağıdaki adımları sırasıyla uygula:

1. **Ayarlar Modalının Kapanma Sorununu Kalıcı Olarak Çöz:**
   Kullanıcının ortamında "X" tuşu (ya da modal overlay dışına tıklama vb.) bir şekilde JavaScript'in `return` komutunu bypass ediyor.
   - Lütfen `Motor_Test_Paneli.html` dosyasındaki `closeSettings(e)` fonksiyonunu incele.
   - Kullanıcı **değişiklik yapıldıysa** ve **"AYARLARI KAYDET"** butonuna basılmadıysa, X butonunun hiçbir şart altında çalışmamasını sağla.

2. **K13 (Canlandırma) Layout (Görsel Düzen) Kontrolü:**
   `renderSettings()` içindeki K13 kuralı için oluşturulan HTML satırının tıpkı K8, K9 gibi tamamen yatay (`flex-wrap`, `align-items: center`) olduğundan ve alt alta devrilmediğinden emin ol. 

3. **YENİ KURAL: K14'ün Eklenmesi:**
   Kullanıcı K14 kuralını entegre etmek istiyor. Önceki konuşmalarda K13 olarak tartışılan ama artık K14 olarak kodlanması gereken kural şudur:
   - "Son üç çekilişte çıkan 21 sayıyla ilgili kural."
   - K14'ün motor (`test_motor_v3.js`) içine yazılması ve `Motor_Test_Paneli.html` içerisine ayarlarının / UI bağlantılarının yapılması gerekiyor. Lütfen bu kuralın detaylarını kullanıcıya sorarak onaylat ve sadece K14'ü dikkatlice ekle.

---
## Kullanıcıya Prompt Önerisi (Kopyalayıp Yeni Sohbete Yapıştırın)

Lütfen aşağıdaki metni kopyalayıp açacağınız yeni sohbet penceresine yapıştırın:

"Merhaba. Devir teslim işlemi için `d:\GitHub\kurtulus_tek\Tarihsel_Analiz_Test\devir_teslim.md` dosyasını okuyarak projenin neresinde kaldığımızı ve senden önceki ajanın çözemediği Ayarlar penceresinin kapanma hatasını hemen analiz et. Öncelikle Modal'ın kaydetmeden kapanma sorununu çöz. Ardından K13'ün tasarımını düzelt ve K14 kuralı için benim vereceğim direktifleri bekle."
