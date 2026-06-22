import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Patch the rules array
    pattern_rules = re.compile(r"const rules = \[.*?\];", re.DOTALL)
    
    replacement_rules = """const rules = [
          { id: 'historical', name: 'Tarihsel', desc: '<b>Tarihsel Temel Puan:</b><br>Bu sayı, tüm zamanlar boyunca (ilk çekilişten bugüne kadar) kaç kez çıkmış? Eğer bir sayı çok fazla çıkmışsa, makine bu sayıyı "Güvenilir" kabul eder ve yüksek bir taban puan verir. Ancak sayı çok az çıkmışsa ve barajın altında kalmışsa, makine buna "Düşük Frekans Cezası" keser. <i>Örnek: 100 çekilişte 30 kere çıkan bir sayı yüksek tarihsel puan alırken, sadece 5 kez çıkan bir sayı ceza alır.</i>' },
          { id: 'recent', name: 'Güncel', desc: '<b>Güncel Form Puanı:</b><br>Bu sayının son zamanlardaki performansı nedir? Son 15, son 10 ve son 5 çekilişteki çıkma sıklığına bakılır. Sayı son zamanlarda hareketlenmişse form grafiği yükselir ve ekstra "Güncel" puan kazanır.' },
          { id: 'k1', name: 'K1-Son 15', desc: '<b>Son 15 Çekiliş Puanı:</b><br>Sayı son 15 çekilişin herhangi birinde çıkmışsa, çıktığı tarihe göre ağırlıklı bir puan alır. Çıktığı çekiliş bugüne ne kadar yakınsa, o kadar yüksek puan kazanır. <i>Örnek: Dün çıkan bir sayı, 14 çekiliş önce çıkan bir sayıya göre çok daha fazla K1 puanı alır.</i>' },
          { id: 'k2', name: 'K2-Son 10', desc: '<b>Son 10 Çekiliş ve Taban Puan:</b><br>Son 10 çekilişte çıkmış olan sayılara verilen ekstra puandır. Loto havuzlarında son 10 çekilişteki sayılar her zaman en sıcak sayılardır. Bir sayı son 10 çekilişin içindeyse, listeye güçlü girmesi için ciddi bir "Taban Puan" bonusu alır.' },
          { id: 'k3', name: 'K3-Son 5', desc: '<b>Son 5 Çekiliş Zirve Puanı:</b><br>Lotonun en sıcak, en aktif, "ateş topu" gibi yanan sayıları son 5 çekilişte çıkanlardır. Bu sayı eğer son 5 çekilişin içindeyse, en yüksek çarpanla ödüllendirilir. Çok güçlü bir pozitif etkidir.' },
          { id: 'k4', name: 'K4-Kuraklık', desc: '<b>Kuraklık (Gelmeme) Durumu:</b><br>Bu sayı kaç çekiliştir uyuyor? Eğer sayı uzun bir süredir gelmiyorsa (kuraklıktaysa), önce "Zamanı geldi, patlama yapabilir" mantığıyla puanı yükseltilir (Kuraklık Bonusu). Ancak, bir sayı inatla, 25-30 çekiliştir <b>asla</b> gelmiyorsa, makine artık bundan umudu keser ve çok ağır bir eksi puan verir (Derin Kuraklık Cezası). Ayrıca sayının son rakamına (kuyruğuna) göre hiç çıkmayan bir grup varsa, o gruba da özel "Kuyruk Kuraklığı" bonusu verilir.' },
          { id: 'k5', name: 'K5-Joker', desc: '<b>Joker Etkisi ve Joker Komşuluğu:</b><br>Sayı, son 15 çekilişte <b>Joker</b> (veya Süperstar vs. ekstra sayı) olarak gelmişse, bu kuraldan devasa bir puan kazanır. Çünkü jokerler çok güçlü bir ritim işaretidir. Sadece joker olan değil, jokerin hemen bitişiğindeki sayılar da (örneğin joker 15 ise 14 ve 16) "Joker Komşusu" olarak ekstra puan alır.' },
          { id: 'k6', name: 'K6-1.Halka', desc: '<b>1. Derece Yakın Komşu Bonusu:</b><br>Son 3 çekilişte çıkan herhangi bir sayının tam bitişiğindeki sayılara (örneğin son çekilişte 20 çıktıysa, 19 ve 21 numaralara) verilen puandır. Aynı zamanda bir sayı ardışık olarak bir önceki veya bir sonraki çekilişteki sayıyla yan yanaysa "Ardışık Çekim" bonusu da buradan eklenir. <i>Loto topları makinede yan yana düştükleri için komşular birbirini çeker.</i>' },
          { id: 'k7', name: 'K7-2.Halka', desc: '<b>2. Derece Uzak Komşu Bonusu:</b><br>Son 3 çekilişte çıkan sayının iki adım uzağındaki sayılara (örneğin 20 çıktıysa 18 ve 22 numaralara) verilen daha düşük bir komşuluk bonusudur. Etkisi 1. halkaya göre daha zayıftır ama sürpriz yakalamak için önemlidir.' },
          { id: 'k8', name: 'K8-Onluk Blok', desc: '<b>Onluk Blok (Grup) Kuraklığı:</b><br>Eğer son 3 çekilişte (örneğin) 40 ile 49 arasındaki hiçbir sayı çıkmamışsa, makine bu grubun çok boş kaldığını anlar. Bu yüzden 40\'lı sayılara "Grup Boşluğu" bonusu verir. Bu kural, uzun süredir uyuyan onluk blokları uyandırır.' },
          { id: 'k9', name: 'K9-Kinetik', desc: '<b>Kinetik İvme (Hızlanma):</b><br>Zaten sıcak olan, yakın zamanda çıkmış olan bir sayının hareket hızına bakılır. Sayı ısınmaya ve tekrar gelmeye çok meyilliyse (son 10 çekilişte yoğunlaşmışsa), bu kural sayıya arkadan bir rüzgar (ivme) verir. <i>"Bu sayı zaten sıcak, bir daha düşebilir" mantığıdır.</i>' },
          { id: 'k10', name: 'K10-Gecikmeli', desc: '<b>Gecikmeli Tekrar Puanı:</b><br>Geçmişte (ilk 10 çekiliş diliminde) çok sık çıkmış ama nedense son 5 çekilişte birden bire susmuş, sessizliğe bürünmüş sayılara verilen gizli tehlike bonusudur. "Bir zamanların şampiyonu dinleniyor, her an sahalara dönebilir" puanıdır.' },
          { id: 'k11', name: 'K11-Bölge', desc: '<b>Bölgesel Geçiş ve Sarkaç Dengesi:</b><br>Sayıların ağırlık merkezi hep küçük sayılardaysa (örneğin hep 1-40 arası çıkıyorsa), makine bir sonraki çekilişin "Büyük" sayılara kayacağını tahmin eder (Sarkaç Dengesi). Eğer sarkaç büyük sayılara doğru kayıyorsa, büyük sayılar buradan puan alır. Tam tersi de geçerlidir.' },
          { id: 'k12', name: 'K12-Ölü Sayı', desc: '<b>Ölü Sayı / Yalancı Sıcak Cezası:</b><br>Bir sayı son zamanlarda sürekli çıkıyorsa ama artık frekansı tavan yapmış ve enerjisini tamamen tüketmişse "Ölü Sayı" limitine çarpar ve devasa bir ceza alır (eksi puan). Ayrıca son 3 çekilişte çıkıp da aslında tarihsel olarak zayıf olan "Yalancı Sıcak" sayılar da bu kuralda infaz edilir. <i>Makine "Bu sayı artık çok çıktı, bir süre daha gelmez" der.</i>' },
          { id: 'k13', name: 'K13-Çifte Tek.', desc: '<b>Çifte Tekrar (Üst Üste) Cezası:</b><br>Bir sayı eğer art arda son iki çekilişin <b>ikisinde birden</b> çıkmışsa, üçüncü kez arka arkaya çıkma ihtimali istatistiksel olarak çok düşük olduğu için çok ağır bir eksi ceza yer ve havuzdan büyük ölçüde atılır.' },
          { id: 'k14', name: 'K14-Doygunluk', desc: '<b>Doygunluk (Tükenmişlik) Cezası:</b><br>Kısa süre içinde o kadar çok çıkmıştır ki (Örneğin son 15 çekilişte 4 veya 5 kere), sayı artık tamamen "doymuş" kabul edilir. Doygunluk seviyesine göre (Doygun 4, Doygun 8 vb.) gittikçe ağırlaşan çok sert eksi puanlar alır.' },
          { id: 'k15', name: 'K15-TamIsınma', desc: '<b>Tam Isınma (Sinerji) Puanı:</b><br>Bir sayı hem yakın zamanda joker olarak çıkmış hem de son çekilişlerdeki sayıların komşusuysa, bu iki güç birleşir. Makine bu iki kuralın aynı anda bir sayıda birleştiğini fark ettiğinde, bu sayıya çok nadir görülen devasa bir "Sinerji (Tam Isınma)" puanı hediye eder.' },
          { id: 'k16', name: 'K16-İzolasyon', desc: '<b>İzolasyon (Yalnızlık) Cezası:</b><br>Sayı son zamanlarda çıkmış gibi görünüyor ama son 3 çekilişteki diğer hiçbir sayının komşusu değil. Yani diğer sayılarla hiçbir bağı (halkası) yok. Bu "İzole" ve "Yalnız" sayılar sahte sıcak kabul edilir ve makine tarafından ağır bir İzolasyon cezasına çarptırılır.' },
          { id: 'k17', name: 'K17-ÇaprazKur', desc: '<b>Çapraz Kuraklık Patlaması:</b><br>Bir sayının sadece kendisi değil, onun çaprazındaki komşuları da 19 çekiliştir (çok uzun süredir) hiç gelmiyorsa, o bölgede inanılmaz bir enerji birikimi oluşmuştur. O bölgedeki bir sayı her an patlama yapabilir. Bu, gizli kalmış bomba sayıları tespit etme kuralıdır.' },
          { id: 'k18', name: 'K18-Din.Seri', desc: '<b>Dinamik Seri Kapasitesi:</b><br>Eğer sayı en son çekilişte çıktıysa, tekrar etme ihtimali incelenir. Bu sayının geçmişte "Seri yapma" (üst üste çıkma) kapasitesi yüksekse, bir kez daha gelme potansiyeline karşılık ufak bir tekrar bonusu alır.' }
        ];"""
        
    match_rules = pattern_rules.search(content)
    if match_rules:
        content = content[:match_rules.start()] + replacement_rules + content[match_rules.end():]
        print("Patched rules array successfully.")
    else:
        print("Failed to find rules array.")

    # 2. Update Tooltip Window Dimensions and Border
    content = content.replace("modal.style.border = '2px solid #39ff14';", "modal.style.border = '4px solid #39ff14';")
    content = content.replace("modal.style.minWidth = '320px';", "modal.style.minWidth = '500px';")
    content = content.replace("modal.style.maxWidth = '500px';", "modal.style.maxWidth = '800px';")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
