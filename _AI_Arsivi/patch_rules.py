import re

file_path = r'D:\GitHub\kurtulus_tek\v8_hist_engine.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the rules definition
new_rules = """        const rules = [
          { id: 'tarihsel', name: 'Tarihsel Toplam', desc: 'K1, K2, K3 puanlarının Tarihsel Çarpan ile çarpılmış toplamı.' },
          { id: 'guncel', name: 'Güncel Toplam', desc: 'K4-K12 arası kuralların Güncel Çarpan ile çarpılmış toplamı.' },
          { id: 'k1', name: 'K1-Genel Frekans', desc: 'Tüm çekilişler tarihindeki toplam çıkma sıklığı.' },
          { id: 'k2', name: 'K2-Son 15 Frekans', desc: 'Yakın geçmişteki (son 15) sıcaklık.' },
          { id: 'k3', name: 'K3-Kuraklık', desc: 'Sayının en son kaç çekiliş önce çıktığı.' },
          { id: 'k4', name: 'K4-Joker Canlılık', desc: 'Son 15 çekilişte Joker olarak çıkmanın yarattığı canlılık.' },
          { id: 'k5', name: 'K5-1.Halka', desc: 'Son çekilişte çıkan sayıların etrafındaki 8 kare.' },
          { id: 'k6', name: 'K6-2.Halka', desc: 'Son çıkan sayılardan 2 kare uzaklıkta olanlar.' },
          { id: 'k7', name: 'K7-Onluk Blok', desc: 'Sayıların ondalık gruplarındaki (1-9, 10-19 vb.) hareketlilik.' },
          { id: 'k8', name: 'K8-Bölge Geçiş', desc: 'Uzun süredir çıkmayan bir sayının son çekilişlerde çıkarak uyanışa geçmesi.' },
          { id: 'k9', name: 'K9-Kinetik İvme', desc: 'Son 3 çekilişte 2 kere çıkması gibi aniden hızlanma.' },
          { id: 'k10', name: 'K10-Gecikmeli Tekrar', desc: 'Çıktı -> 1 Boş -> Tekrar Çıktı ritmini yakalayanlar.' },
          { id: 'k11', name: 'K11-Çapraz Kuraklık', desc: 'Isınmış ama son 5 çekilişte sessiz kalan patlamaya hazır sayılar.' },
          { id: 'k12', name: 'K12-Tam Isınma', desc: 'Son 15 çekilişte tam 2 kez çıkan ideal stabil sayılar.' },
          { id: 'k13', name: 'K13-Aşırı Isınma', desc: 'Son 15\'te 4 veya daha fazla kez çıkan yanmış sayılar (Ceza).' },
          { id: 'k14', name: 'K14-Çifte Tekrar', desc: 'Üst üste 3. kez gelme ihtimali düşük olan sayılar (Ceza).' },
          { id: 'k15', name: 'K15-Doygunluk', desc: 'Kısa periyotlarda çok yoğun çıkan sayılar (Ceza).' },
          { id: 'k16', name: 'K16-İzolasyon', desc: 'Grid şemasında hiçbir komşusu olmayan yalnız sayılar (Ceza).' },
          { id: 'k17', name: 'K17-Seri Kesintisi', desc: 'Düzenli ritmini son çekilişlerde bozan istikrarsız sayılar (Ceza).' },
          { id: 'k18', name: 'K18-Ölüm Sınırı', desc: 'Çok uzun süredir hiç çıkmayan ölü sayılar (Ceza).' }
        ];"""

text = re.sub(
    r'const rules = \[\s*\{ id: \'Tarihsel\'.*?\];',
    new_rules,
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("rules updated!")
