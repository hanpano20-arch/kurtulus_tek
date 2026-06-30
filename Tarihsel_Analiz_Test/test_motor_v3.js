// test_motoru.js - Aşama 1: K1, K2, K3 Frekans Puanlaması Testi

// Test için yapay bir çekiliş verisi ve joker listesi (Gerçekte Excel'den gelecek)
// Toplam 90 top olduğunu varsayıyoruz.
const MAX_TOP = 90;

function frekansHesapla(cekilisler, jokerler, sonKacCekilis = null) {
    // Eğer sonKacCekilis belirtilmişse, diziyi o kadar kes. Değilse tümünü al.
    let hedefCekilisler = sonKacCekilis ? cekilisler.slice(0, sonKacCekilis) : cekilisler;
    let hedefJokerler = sonKacCekilis ? jokerler.slice(0, sonKacCekilis) : jokerler;

    let frekanslar = {};
    for (let i = 1; i <= MAX_TOP; i++) frekanslar[i] = 0;

    // Normal çekiliş kürelerini say
    hedefCekilisler.forEach(cekilis => {
        if (cekilis && Array.isArray(cekilis)) {
            cekilis.forEach(sayi => {
                if (sayi >= 1 && sayi <= MAX_TOP) frekanslar[sayi]++;
            });
        }
    });

    // Jokerleri say (Sizin kuralınız: Joker 7. bir sayı gibi aynı kefeye konacak)
    hedefJokerler.forEach(joker => {
        if (joker >= 1 && joker <= MAX_TOP) frekanslar[joker]++;
    });

    return frekanslar;
}

function puanUret(frekanslar, tabanPuan, carpan) {
    // 1. Min ve Max frekansları bul
    let maxFrekans = Math.max(...Object.values(frekanslar));
    let minFrekans = Math.min(...Object.values(frekanslar));

    let puanlar = {};

    // Eğer tüm sayılar aynı sayıda çıkmışsa (Min == Max), kimseye puan verme (Bölme hatasını önle)
    if (maxFrekans === minFrekans) {
        for (let i = 1; i <= MAX_TOP; i++) puanlar[i] = 0;
        return { puanlar, minFrekans, maxFrekans };
    }

    // 2. Yeni Analitik Formül: Laplace Yumuşatmalı Doğrudan Orantı
    // 3. Çarpan Uygulaması (Çarpan % olarak gelir, örn 100 = 1.0, 50 = 0.5)
    for (let i = 1; i <= MAX_TOP; i++) {
        let f = frekanslar[i];
        
        // (Frekans + 1) / (Max Frekans + 1) -> Doğrudan orantı, ancak 0 değerleri için minik bir şans payı
        let oran = (f + 1) / (maxFrekans + 1);
        
        let hamPuan = oran * tabanPuan;
        puanlar[i] = Math.round(hamPuan * (carpan / 100));
    }

    return { puanlar, minFrekans, maxFrekans };
}

// Aşama 2: Komşuluk Hesaplama (Gerçek Izgara Mantığı)
function komsulukHesapla(cekilisler, jokerler, sonKacCekilis) {
    let limit = Math.min(sonKacCekilis, cekilisler.length);
    let cikanSayilar = new Set();
    for (let i = 0; i < limit; i++) {
        cekilisler[i].forEach(num => cikanSayilar.add(num));
        if (jokerler && jokerler[i]) {
            cikanSayilar.add(Number(jokerler[i]));
        }
    }

    let halka1 = {};
    let halka2 = {};
    for (let i = 1; i <= MAX_TOP; i++) {
        halka1[i] = 0;
        halka2[i] = 0;
    }

    // 2. Her bir sayı (1'den 90'a kadar) için gerçek ızgara (Grid) mesafesini hesapla
    for (let n = 1; n <= MAX_TOP; n++) {
        let row = Math.floor((n - 1) / 10); // 0 ile 8 arası
        let col = (n - 1) % 10;             // 0 ile 9 arası

        // 1. Halka (Mesafe = 1) -> 3x3 çember (merkez hariç)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // Kendisi
                let r = row + dr;
                let c = col + dc;
                if (r >= 0 && r <= 8 && c >= 0 && c <= 9) {
                    let komsuSayi = r * 10 + c + 1;
                    if (cikanSayilar.has(komsuSayi)) {
                        halka1[n]++;
                    }
                }
            }
        }

        // 2. Halka (Mesafe = 2) -> 5x5 çember çevresi (içteki 3x3 hariç)
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                if (Math.abs(dr) === 2 || Math.abs(dc) === 2) {
                    let r = row + dr;
                    let c = col + dc;
                    if (r >= 0 && r <= 8 && c >= 0 && c <= 9) {
                        let komsuSayi = r * 10 + c + 1;
                        if (cikanSayilar.has(komsuSayi)) {
                            halka2[n]++;
                        }
                    }
                }
            }
        }
    }

    return { halka1, halka2 };
}

// Aşama 3: Joker Zaman Ağırlıklı Etki Puanı (K6)
function jokerEtkisiHesapla(jokerler, tabanPuan, carpan) {
    let k6Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k6Puanlar[i] = 0;

    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 100 : tabanPuan;
    let safeCarpan = isNaN(carpan) ? 100 : carpan;

    let limit = Math.min(15, jokerler.length); // Son 15
    for (let i = 0; i < limit; i++) {
        let jNum = jokerler[i];
        if (!jNum) continue;

        // Zaman ağırlığı (En yeni çekiliş için 1.0, 15 çekiliş öncesi için 1/15)
        let weight = (15 - i) / 15;
        let puan = weight * safeTaban * (safeCarpan / 100);

        k6Puanlar[jNum] += puan;
    }

    for (let i = 1; i <= MAX_TOP; i++) {
        k6Puanlar[i] = Math.round(k6Puanlar[i]);
    }
    return k6Puanlar;
}

// K7 (Tekrar Cezası) Hesapla
function tekrarCezasiHesapla(cekilisler, jokerler, tabanCeza, carpan) {
    let k7Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k7Puanlar[i] = 0;

    if (!cekilisler || cekilisler.length === 0) return k7Puanlar;

    let safeTaban = (!tabanCeza || isNaN(tabanCeza) || tabanCeza === 0) ? -200 : tabanCeza;
    let safeCarpan = isNaN(carpan) ? 100 : carpan;

    // Kuralın amacı son 3 çekiliş içinde üst üste çıkma serisini (streak) yakalamaktır.
    let iterLimit = Math.min(3, cekilisler.length);

    for (let i = 1; i <= MAX_TOP; i++) {
        let currentStreak = 0;
        let maxStreak = 0;

        // j=0 (son çekiliş), j=1 (bir önceki), j=2 (iki önceki)
        // Geçmişe doğru okuduğumuz için seriyi ters takip ediyoruz ama mantık aynı.
        for (let j = 0; j < iterLimit; j++) {
            let asilSayıdaVar = cekilisler[j] && cekilisler[j].includes(i);
            let jokerdeVar = jokerler && Number(jokerler[j]) === i;

            if (asilSayıdaVar || jokerdeVar) {
                currentStreak++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 0; // Zincir bozuldu
            }
        }

        if (maxStreak >= 2) {
            let carpanOrani = safeCarpan / 100;
            // 2 kez üst üste: Taban ceza (örn -200)
            // 3 kez üst üste: Taban ceza x 10 (örn -2000)
            let multiplier = (maxStreak >= 3) ? 10 : 1;
            k7Puanlar[i] = Math.round(multiplier * safeTaban * carpanOrani);
        }
    }
    return k7Puanlar;
}

// K8 (Uyku/Kuraklık) Hesabı
function uykuSuresiHesapla(cekilisler, jokerler) {
    let uykuSureleri = {};
    for (let i = 1; i <= MAX_TOP; i++) {
        let sure = 0;
        let bulundu = false;
        for (let j = 0; j < cekilisler.length; j++) {
            let asilSayıdaVar = cekilisler[j] && cekilisler[j].includes(i);
            let jokerdeVar = jokerler && Number(jokerler[j]) === i;
            if (asilSayıdaVar || jokerdeVar) {
                bulundu = true;
                break;
            }
            sure++;
        }
        if (!bulundu) sure = cekilisler.length;
        uykuSureleri[i] = sure;
    }
    return uykuSureleri;
}

function uykuCezasiHesapla(uykuSureleri, tabanCeza, carpan, uykuSiniri, adimCezasi) {
    let k8Puanlar = {};
    let safeTaban = (!tabanCeza || isNaN(tabanCeza) || tabanCeza === 0) ? 100 : tabanCeza;
    let safeCarpan = isNaN(carpan) ? 100 : carpan;
    let safeSinir = (!uykuSiniri || isNaN(uykuSiniri) || uykuSiniri === 0) ? 25 : uykuSiniri;
    let safeAdim = (!adimCezasi || isNaN(adimCezasi) || adimCezasi === 0) ? 5 : adimCezasi;

    for (let i = 1; i <= MAX_TOP; i++) {
        let sure = uykuSureleri[i];
        if (sure >= safeSinir) {
            let rawCeza = -(safeTaban + ((sure - safeSinir) * safeAdim));
            k8Puanlar[i] = Math.round(rawCeza * (safeCarpan / 100));
        } else {
            k8Puanlar[i] = 0;
        }
    }
    return k8Puanlar;
}

// Aşama 6: Doygunluk (Aşırı Çıkma) Cezaları K9, K10, K11, K12
function doygunlukCezalariHesapla(cekilisler, jokerler, ayarlar) {
    let k9Puanlar = {};
    let k10Puanlar = {};
    let k11Puanlar = {};
    let k12Puanlar = {};

    for (let i = 1; i <= MAX_TOP; i++) {
        k9Puanlar[i] = 0; k10Puanlar[i] = 0; k11Puanlar[i] = 0; k12Puanlar[i] = 0;
    }

    if (!cekilisler || cekilisler.length === 0) return { k9: k9Puanlar, k10: k10Puanlar, k11: k11Puanlar, k12: k12Puanlar };

    let k9Sinir = isNaN(ayarlar.K9_SINIR) ? 4 : ayarlar.K9_SINIR;
    let k10Sinir = isNaN(ayarlar.K10_SINIR) ? 8 : ayarlar.K10_SINIR;
    let k11Sinir = isNaN(ayarlar.K11_SINIR) ? 12 : ayarlar.K11_SINIR;
    let k12Sinir = isNaN(ayarlar.K12_SINIR) ? 15 : ayarlar.K12_SINIR;

    let maxLimit = Math.max(k9Sinir, k10Sinir, k11Sinir, k12Sinir);
    let iterLimit = Math.min(maxLimit, cekilisler.length);

    for (let i = 1; i <= MAX_TOP; i++) {
        let hitsK9 = 0, hitsK10 = 0, hitsK11 = 0, hitsK12 = 0;

        for (let j = 0; j < iterLimit; j++) {
            let isHit = (cekilisler[j] && cekilisler[j].includes(i)) || (jokerler && Number(jokerler[j]) === i);
            if (isHit) {
                if (j < k9Sinir) hitsK9++;
                if (j < k10Sinir) hitsK10++;
                if (j < k11Sinir) hitsK11++;
                if (j < k12Sinir) hitsK12++;
            }
        }

        // K9: Eşik 2
        if (hitsK9 >= 2) {
            let taban = isNaN(ayarlar.K9_TABAN) ? -250 : ayarlar.K9_TABAN;
            let carpan = isNaN(ayarlar.K9_CARPAN) ? 100 : ayarlar.K9_CARPAN;
            k9Puanlar[i] = Math.round(taban * (carpan / 100));
        }
        // K10: Eşik 3
        if (hitsK10 >= 3) {
            let taban = isNaN(ayarlar.K10_TABAN) ? -250 : ayarlar.K10_TABAN;
            let carpan = isNaN(ayarlar.K10_CARPAN) ? 100 : ayarlar.K10_CARPAN;
            k10Puanlar[i] = Math.round(taban * (carpan / 100));
        }
        // K11: Eşik 4
        if (hitsK11 >= 4) {
            let taban = isNaN(ayarlar.K11_TABAN) ? -250 : ayarlar.K11_TABAN;
            let carpan = isNaN(ayarlar.K11_CARPAN) ? 100 : ayarlar.K11_CARPAN;
            k11Puanlar[i] = Math.round(taban * (carpan / 100));
        }
        // K12: Eşik 5
        if (hitsK12 >= 5) {
            let taban = isNaN(ayarlar.K12_TABAN) ? -250 : ayarlar.K12_TABAN;
            let carpan = isNaN(ayarlar.K12_CARPAN) ? 100 : ayarlar.K12_CARPAN;
            k12Puanlar[i] = Math.round(taban * (carpan / 100));
        }
    }

    return { k9: k9Puanlar, k10: k10Puanlar, k11: k11Puanlar, k12: k12Puanlar };
}

// K13 (Uyuyan Sayıları Diriltme) Hesabı — YENİ MANTIK
// Amaç: Son 3 çekilişte çıkan sayıların grid 1. halka komşularından,
//        son K13_UYKU_SINIRI çekilişte ÇIKMAYAN (uyuyan) sayılara puan vermek.
//        Son 3 çekilişte çıkan sayılar hiçbir şekilde K13 puanı ALMAZ.
//
// Parametreler:
//   cekilisler  : Tüm çekiliş geçmişi dizisi (index 0 = en son)
//   jokerler    : Tüm joker geçmişi dizisi
//   tabanPuan   : Temel puan (ayarlardan K13_TABAN)
//   carpan      : Slider çarpanı (%)
//   esik1       : 1x puan için minimum komşu sayısı
//   esik2       : 2x puan için minimum komşu sayısı
//   uykuSiniri  : Kaç çekilişten beri çıkmamış olmalı (K13_UYKU_SINIRI)
function canlandirmaCezasiHesapla(cekilisler, jokerler, tabanPuan, carpan, esik1, esik2, uykuSiniri) {
    let k13Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k13Puanlar[i] = 0;

    if (!cekilisler || cekilisler.length === 0) return k13Puanlar;

    let safeTaban     = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 100 : tabanPuan;
    let safeCarpan    = (carpan === undefined || isNaN(carpan)) ? 100 : carpan;
    if (safeCarpan === 0) return k13Puanlar;
    let safeEsik1     = (!esik1 || isNaN(esik1) || esik1 === 0)      ? 2  : esik1;
    let safeEsik2     = (!esik2 || isNaN(esik2) || esik2 === 0)      ? 3  : esik2;
    let safeUyku      = (!uykuSiniri || isNaN(uykuSiniri) || uykuSiniri === 0) ? 10 : uykuSiniri;

    // ADIM 1: Son 3 çekilişte çıkan benzersiz sayıları topla (joker dahil)
    let son3Limit = Math.min(3, cekilisler.length);
    let son3Sayilar = new Set();
    for (let i = 0; i < son3Limit; i++) {
        if (cekilisler[i] && Array.isArray(cekilisler[i])) {
            cekilisler[i].forEach(s => { if (s >= 1 && s <= MAX_TOP) son3Sayilar.add(s); });
        }
        if (jokerler && jokerler[i] >= 1 && jokerler[i] <= MAX_TOP) {
            son3Sayilar.add(Number(jokerler[i]));
        }
    }

    // ADIM 2: Son safeUyku çekilişte çıkmamış (uyuyan) sayıları bul (joker dahil)
    let uykuLimit = Math.min(safeUyku, cekilisler.length);
    let uyananSayilar = new Set(); // bu pencerede çıkmış olanlar
    for (let i = 0; i < uykuLimit; i++) {
        if (cekilisler[i] && Array.isArray(cekilisler[i])) {
            cekilisler[i].forEach(s => { if (s >= 1 && s <= MAX_TOP) uyananSayilar.add(s); });
        }
        if (jokerler && jokerler[i] >= 1 && jokerler[i] <= MAX_TOP) {
            uyananSayilar.add(Number(jokerler[i]));
        }
    }
    // Uyuyan = 1..90 arasındaki, bu pencerede ÇIKMAMIŞ sayılar
    let uyuyanSet = new Set();
    for (let i = 1; i <= MAX_TOP; i++) {
        if (!uyananSayilar.has(i)) uyuyanSet.add(i);
    }

    // ADIM 3: Her uyuyan sayı için, son 3 çekilişin sayıları içinde kaç grid-komşusu var?
    for (let n = 1; n <= MAX_TOP; n++) {
        // Eğer bu sayı son 3 çekilişte çıktıysa K13 puanı alamaz!
        if (son3Sayilar.has(n)) {
            k13Puanlar[n] = 0;
            continue;
        }
        // Eğer bu sayı uyumuyorsa (son uykuSiniri çekilişte çıkmış) K13 puanı alamaz
        if (!uyuyanSet.has(n)) {
            k13Puanlar[n] = 0;
            continue;
        }

        // Grid koordinatları
        let row = Math.floor((n - 1) / 10);
        let col = (n - 1) % 10;

        // 1. Halka komşularından kaç tanesi son3Sayilar içinde?
        let komsuSayisi = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                let r = row + dr;
                let c = col + dc;
                if (r >= 0 && r <= 8 && c >= 0 && c <= 9) {
                    let komsuSayi = r * 10 + c + 1;
                    if (son3Sayilar.has(komsuSayi)) komsuSayisi++;
                }
            }
        }

        // Eşik kontrolü
        let hamPuan = 0;
        if (komsuSayisi >= safeEsik2) {
            hamPuan = safeTaban * 2;  // 2x eşik
        } else if (komsuSayisi >= safeEsik1) {
            hamPuan = safeTaban;      // 1x eşik
        }

        k13Puanlar[n] = Math.round(hamPuan * (safeCarpan / 100));
    }

    return k13Puanlar;
}

// K14 (Dinamik Eleme - Son 3 Çekiliş)
function k14ElemeHesapla(cekilisler, jokerler, tabanPuan, carpan) {
    let k14Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k14Puanlar[i] = 0;
    
    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? -250 : tabanPuan;
    let safeCarpan = isNaN(carpan) ? 100 : carpan;
    if (safeCarpan === 0) return k14Puanlar;

    if (!cekilisler || cekilisler.length < 3) return k14Puanlar;

    let t1 = cekilisler[0] || [];
    let t2 = cekilisler[1] || [];
    let t3 = cekilisler[2] || [];
    let son3Sayilar = new Set([...t1, ...t2, ...t3]);
    // Jokerler 7. sayı olarak dahil et (K7, K8, K13 ile tutarlı)
    if (jokerler) {
        [0, 1, 2].forEach(idx => {
            let jn = Number(jokerler[idx]);
            if (jn >= 1 && jn <= MAX_TOP) son3Sayilar.add(jn);
        });
    }
    if (son3Sayilar.size === 0) return k14Puanlar;

    // Her çıkan sayıya performansına göre ceza ver (Kullanıcı hepsinin ceza almasını istiyor)
    son3Sayilar.forEach(n => {
        let count = 0;
        if (t1.includes(n) || (jokerler && Number(jokerler[0]) === n)) count++;
        if (t2.includes(n) || (jokerler && Number(jokerler[1]) === n)) count++;
        if (t3.includes(n) || (jokerler && Number(jokerler[2]) === n)) count++;
        
        // Sadece 1 kez çıksa bile mutlaka ceza alacak.
        // Eğer 2 veya 3 kez çıktıysa, cezası daha da artacak.
        let cezaOrani = 1.0;
        if (count === 2) cezaOrani = 1.5;
        if (count >= 3) cezaOrani = 2.0;

        let finalPuan = Math.round(safeTaban * cezaOrani * (safeCarpan / 100));
        // K14 kesinlikle bir cezadır (Eleme). Yanlışlıkla pozitif çıkarsa (eksi çarpan vb. yüzünden), negatife çevir!
        if (finalPuan > 0) finalPuan = -finalPuan;

        k14Puanlar[n] = finalPuan;
    });

    return k14Puanlar;
}

// K15 (Momentum ve Yankı Ödülü) Hesabı
function k15OdulHesapla(cekilisler, jokerler, tabanPuan, carpan, menzil) {
    let k15Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k15Puanlar[i] = 0;

    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 200 : tabanPuan;
    let safeCarpan = isNaN(carpan) ? 100 : carpan;
    if (safeCarpan === 0) return k15Puanlar;

    let safeMenzil = (menzil && !isNaN(menzil) && menzil >= 7 && menzil <= 15) ? parseInt(menzil, 10) : 10;

    if (!cekilisler || cekilisler.length < (safeMenzil + 1)) return k15Puanlar;

    let sonXFrekans = {};
    for (let j = 0; j < safeMenzil; j++) {
        let asilSayilar = cekilisler[j] || [];
        asilSayilar.forEach(n => {
            sonXFrekans[n] = (sonXFrekans[n] || 0) + 1;
        });
        if (jokerler && jokerler[j]) {
            let jn = Number(jokerler[j]);
            sonXFrekans[jn] = (sonXFrekans[jn] || 0) + 1;
        }
    }

    let hedefSayilar = Object.keys(sonXFrekans).map(Number).filter(n => sonXFrekans[n] >= 1 && sonXFrekans[n] <= 2);
    if (hedefSayilar.length === 0) return k15Puanlar;

    let k15Potansiyel = {};
    hedefSayilar.forEach(n => {
        let cikisEndeksleri = [];
        for (let j = 0; j < cekilisler.length; j++) {
            let asil = cekilisler[j] || [];
            if (asil.includes(n) || (jokerler && Number(jokerler[j]) === n)) {
                cikisEndeksleri.push(j);
            }
        }
        if (cikisEndeksleri.length < 2) {
            k15Potansiyel[n] = 0.5; 
            return;
        }
        let toplamUyku = 0;
        let yankiSayisi = 0; 
        for (let x = 0; x < cikisEndeksleri.length - 1; x++) {
            let fark = cikisEndeksleri[x + 1] - cikisEndeksleri[x];
            toplamUyku += fark;
            if (fark <= 10) yankiSayisi++;
        }
        let ortalamaUyku = toplamUyku / (cikisEndeksleri.length - 1);
        let yankiOrani = yankiSayisi / (cikisEndeksleri.length - 1); 
        let mevcutUyku = cikisEndeksleri[0]; 
        let uykuSapmasi = Math.abs(ortalamaUyku - mevcutUyku);
        let uykuSkoru = Math.max(0, 1.0 - (uykuSapmasi / 15.0));
        let seyreklikCarpani = (sonXFrekans[n] === 1) ? 1.2 : 1.0;
        let potansiyel = ((yankiOrani * 0.5) + (uykuSkoru * 0.5)) * seyreklikCarpani;
        k15Potansiyel[n] = potansiyel;
    });

    let minP = Math.min(...Object.values(k15Potansiyel));
    let maxP = Math.max(...Object.values(k15Potansiyel));
    let farkP = maxP - minP;
    if (farkP === 0) farkP = 1;

    hedefSayilar.forEach(n => {
        let p = k15Potansiyel[n];
        let normalized = (p - minP) / farkP; 
        let odulOrani = 0.20 + (0.80 * normalized);
        let anaOdul = safeTaban * (safeCarpan / 100);
        let finalPuan = Math.round(anaOdul * odulOrani);
        // K15 kesinlikle bir ödüldür. Negatif ise pozitif yap!
        if (finalPuan < 0) finalPuan = -finalPuan;
        k15Puanlar[n] = finalPuan;
    });

    return k15Puanlar;
}

// ============================================================
// K16 - Onluk Bölge Açlık/Tokluk Dengesi (Bölge Rotasyon Kuralı)
// Amaç: 90 sayıyı 9 onluğa böler (1-10, 11-20, ..., 81-90).
//        Son K16_PENCERE çekilişte hangi onluklar aşırı temsil edildiğine bakar.
//        Az çıkan (aç kalan) onluktaki sayılara bonus, çok çıkan (tok) onluktakilere ceza verir.
// Parametreler:
//   cekilisler  : Tüm çekiliş geçmişi dizisi (index 0 = en son)
//   jokerler    : Tüm joker geçmişi dizisi (joker 7. sayı sayılır)
//   tabanPuan   : Temel puan (ayarlardan K16_TABAN)
//   carpan      : Slider çarpa nı (%)
//   pencere     : Kaç çekilişe bakacağız (K16_PENCERE, varsayılan 9)
// ============================================================
function k16BolgeRotasyonHesapla(cekilisler, jokerler, tabanPuan, carpan, pencere) {
    let k16Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k16Puanlar[i] = 0;

    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 150 : tabanPuan;
    let safeCarpan = (carpan === undefined || isNaN(carpan)) ? 100 : carpan;
    if (safeCarpan === 0) return k16Puanlar;

    let safePencere = (pencere && !isNaN(pencere) && pencere >= 3 && pencere <= 30)
        ? parseInt(pencere, 10)
        : 9;

    if (!cekilisler || cekilisler.length < 1) return k16Puanlar;
    let limit = Math.min(safePencere, cekilisler.length);

    // ADIM 1: Her onluğun kaç sayı çıkardığını say (joker dahil)
    // 9 onluk: index 0 = 1-10, index 1 = 11-20, ... index 8 = 81-90
    let bolgeTemsil = new Array(9).fill(0);

    for (let j = 0; j < limit; j++) {
        let asil = cekilisler[j] || [];
        asil.forEach(n => {
            if (n >= 1 && n <= MAX_TOP) {
                let bolge = Math.floor((n - 1) / 10); // 0-8 arasi
                bolgeTemsil[bolge]++;
            }
        });
        if (jokerler && jokerler[j]) {
            let jn = Number(jokerler[j]);
            if (jn >= 1 && jn <= MAX_TOP) {
                let bolge = Math.floor((jn - 1) / 10);
                bolgeTemsil[bolge]++;
            }
        }
    }

    // ADIM 2: Beklenen temsil sayısını hesapla
    // Her çekilişte 7 sayı (6+joker) çıkıyor, 9 bölgeye eşit dağılırsa:
    let toplamCikan = bolgeTemsil.reduce((a, b) => a + b, 0);
    let beklenen = toplamCikan / 9; // Her bölgenin beklenen payı

    // ADIM 3: Sapma hesapla ve normalize et
    let sapmalar = bolgeTemsil.map(t => beklenen - t); // Pozitif = açlık, Negatif = tokluk
    let maxSapma = Math.max(...sapmalar.map(Math.abs));
    if (maxSapma === 0) return k16Puanlar; // Tüm bölgeler eşit çıkmış, hiç puan verme

    // ADIM 4: Her sayıya bölgesinin sapma puanını ver
    for (let n = 1; n <= MAX_TOP; n++) {
        let bolge = Math.floor((n - 1) / 10);
        let sapma = sapmalar[bolge]; // Pozitif: aç -> bonus; Negatif: tok -> ceza
        // Laplace yumulatmalı normalize: [-1, +1] aralığına sıkıştır
        let normalized = sapma / maxSapma; // [-1.0, +1.0]
        let hamPuan = normalized * safeTaban;
        k16Puanlar[n] = Math.round(hamPuan * (safeCarpan / 100));
    }

    return k16Puanlar;
}

// ============================================================
// K17 - Kanka Sayılar (İkili Birliktelik / Markov)
// Amaç: Son çekilişte çıkan sayıların tarihsel olarak peşinden
//       en çok sürüklediği sayıları (kankaları) tespit edip bonus vermek.
// Parametreler:
//   cekilisler    : Tüm çekiliş geçmişi (index 0 = en son)
//   jokerler      : Joker geçmişi
//   tabanPuan     : Temel puan (ayarlardan K17_TABAN)
//   carpan        : Slider çarpanı (%)
//   analizDerinligi: Geçmişe ne kadar gidilecek (K17_DERINLIK)
// ============================================================
function k17BirliktelikHesapla(cekilisler, jokerler, tabanPuan, carpan, analizDerinligi) {
    let k17Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k17Puanlar[i] = 0;

    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 150 : tabanPuan;
    let safeCarpan = (carpan === undefined || isNaN(carpan)) ? 100 : carpan;
    if (safeCarpan === 0) return k17Puanlar;

    let safeDerinlik = (analizDerinligi && !isNaN(analizDerinligi) && analizDerinligi > 10) 
        ? parseInt(analizDerinligi, 10) 
        : 200;

    if (!cekilisler || cekilisler.length < 2) return k17Puanlar; // En az 2 çekiliş lazım

    // Son çekiliş sayıları (hedef tarihten hemen önceki)
    let sonCekilis = [...(cekilisler[0] || [])];
    if (jokerler && jokerler[0]) sonCekilis.push(Number(jokerler[0]));
    
    // Geçerli sayılar
    sonCekilis = sonCekilis.filter(n => n >= 1 && n <= MAX_TOP);
    if (sonCekilis.length === 0) return k17Puanlar;

    // Geçmişte aranacak aralık
    let limit = Math.min(safeDerinlik, cekilisler.length);
    let takipEdenSayilar = new Array(MAX_TOP + 1).fill(0);

    // Kankaları bul: i=1'den başla (çünkü i=0 son çekiliş)
    // Her i için, eğer cekilisler[i] (veya joker) içinde sonCekilis'ten bir sayı varsa
    // bir SONRAKİ çekiliş (zaman olarak daha yeni olan) cekilisler[i-1]'dir.
    for (let i = 1; i < limit; i++) {
        let gecmisCekilis = [...(cekilisler[i] || [])];
        if (jokerler && jokerler[i]) gecmisCekilis.push(Number(jokerler[i]));
        
        // Bu geçmiş çekilişte son çekilişten ortak bir sayı var mı?
        let ortakSayisi = 0;
        for (let num of sonCekilis) {
            if (gecmisCekilis.includes(num)) {
                ortakSayisi++;
            }
        }

        if (ortakSayisi > 0) {
            // Varsa, bir sonraki çekilişe (i-1) bak ve o sayılara "kanka" oyu ver
            let sonrakiCekilis = [...(cekilisler[i - 1] || [])];
            if (jokerler && jokerler[i - 1]) sonrakiCekilis.push(Number(jokerler[i - 1]));
            
            for (let sn of sonrakiCekilis) {
                if (sn >= 1 && sn <= MAX_TOP) {
                    takipEdenSayilar[sn] += ortakSayisi; // Ortak sayı fazlaysa etkisi artsın
                }
            }
        }
    }

    let maxFrekans = Math.max(...takipEdenSayilar.slice(1));
    if (maxFrekans === 0) return k17Puanlar;

    // Puanla
    for (let n = 1; n <= MAX_TOP; n++) {
        if (takipEdenSayilar[n] > 0) {
            let normalized = takipEdenSayilar[n] / maxFrekans;
            let hamPuan = normalized * safeTaban;
            k17Puanlar[n] = Math.round(hamPuan * (safeCarpan / 100));
        }
    }

    return k17Puanlar;
}

// ============================================================
// K18 - Tek/Çift Dengeleyici (Ortalamaya Dönüş - Regression to Mean)
// Amaç: Son K18_PENCERE çekilişinde (joker dahil) çıkan sayılarda
//       Tek ve Çift sayıların dağılımını ölçer. 
//       Doğal oran (50/50) üzerinden sapmayı hesaplayıp,
//       Aç kalan (az çıkan) gruba bonus, çok çıkan (tok) gruba ceza verir.
// Parametreler:
//   cekilisler  : Tüm çekiliş geçmişi (index 0 = en son)
//   jokerler    : Joker geçmişi
//   tabanPuan   : Temel puan (ayarlardan K18_TABAN)
//   carpan      : Slider çarpanı (%)
//   pencere     : Kaç çekilişe bakılacak (K18_PENCERE, varsayılan 8)
// ============================================================
// K18 (Tek/Çift Dengesizliği Düzeltmesi)
function k18TekCiftDengesiHesapla(cekilisler, jokerler, komsuluk, tabanPuan, carpan, pencere) {
    let k18Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k18Puanlar[i] = 0;

    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 100 : tabanPuan;
    let safeCarpan = (carpan === undefined || isNaN(carpan)) ? 100 : carpan;
    if (safeCarpan === 0) return k18Puanlar;

    let safePencere = (pencere && !isNaN(pencere) && pencere >= 1 && pencere <= 50) ? parseInt(pencere, 10) : 8;

    if (!cekilisler || cekilisler.length < 1) return k18Puanlar;
    let limit = Math.min(safePencere, cekilisler.length);

    let tekSayisi = 0;
    let ciftSayisi = 0;

    // Pencere içindeki tek ve çift sayıları say (Joker dahil)
    for (let i = 0; i < limit; i++) {
        let asil = cekilisler[i] || [];
        asil.forEach(n => {
            if (n >= 1 && n <= MAX_TOP) {
                if (n % 2 === 0) ciftSayisi++;
                else tekSayisi++;
            }
        });
        if (jokerler && jokerler[i]) {
            let jn = Number(jokerler[i]);
            if (jn >= 1 && jn <= MAX_TOP) {
                if (jn % 2 === 0) ciftSayisi++;
                else tekSayisi++;
            }
        }
    }

    let toplamSayi = tekSayisi + ciftSayisi;
    if (toplamSayi === 0) return k18Puanlar;

    let beklenen = toplamSayi / 2; // Normalde %50 tek, %50 çift olmalı

    // Açlık/Tokluk sapması:
    // Örneğin 40 toptan 25'i çift, 15'i tek çıktıysa
    // Tek için sapma: Beklenen (20) - Gerçekleşen (15) = +5 (Aç, Bonus verilmeli)
    // Çift için sapma: Beklenen (20) - Gerçekleşen (25) = -5 (Tok, Ceza verilmeli)
    
    let tekSapma = beklenen - tekSayisi; 
    let ciftSapma = beklenen - ciftSayisi;

    // Öneri 1: Doğrusal Sapma Çarpanı
    // Sapma başına, Taban Puan'ın %10'u kadar bir kuvvet uyguluyoruz.
    let tekHamPuan = tekSapma * (safeTaban / 10);
    let ciftHamPuan = ciftSapma * (safeTaban / 10);

    // Sıcak Bölge Hedefleme (Son 3 Çekiliş Sayıları)
    let son3teCikanlar = new Set();
    let hotLimit = Math.min(3, cekilisler.length);
    for (let i = 0; i < hotLimit; i++) {
        let asil = cekilisler[i] || [];
        asil.forEach(n => son3teCikanlar.add(n));
        if (jokerler && jokerler[i]) {
            son3teCikanlar.add(Number(jokerler[i]));
        }
    }

    for (let n = 1; n <= MAX_TOP; n++) {
        // Hedefleme (Keskin Nişancı): Sadece Son 3 çekiliş sayıları ve 1. halka komşuları puan alır
        if (son3teCikanlar.has(n) || (komsuluk && komsuluk.halka1 && komsuluk.halka1[n] > 0)) {
            if (n % 2 === 0) { // Çift sayı
                k18Puanlar[n] = Math.round(ciftHamPuan * (safeCarpan / 100));
            } else { // Tek sayı
                k18Puanlar[n] = Math.round(tekHamPuan * (safeCarpan / 100));
            }
        } else {
            k18Puanlar[n] = 0; // Soğuk veya 2. halka sayılara K18 etki etmez
        }
    }

    return k18Puanlar;
}

// ============================================================
// K19 (Son Rakam / Birler Basamağı Dengesi)
function k19SonRakamDengesiHesapla(cekilisler, jokerler, komsuluk, tabanPuan, carpan, pencere) {
    let k19Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k19Puanlar[i] = 0;

    let safeTaban = (!tabanPuan || isNaN(tabanPuan) || tabanPuan === 0) ? 100 : tabanPuan;
    let safeCarpan = (carpan === undefined || isNaN(carpan)) ? 100 : carpan;
    if (safeCarpan === 0) return k19Puanlar;

    let safePencere = (pencere && !isNaN(pencere) && pencere >= 1 && pencere <= 50) ? parseInt(pencere, 10) : 8;

    if (!cekilisler || cekilisler.length < 1) return k19Puanlar;
    let limit = Math.min(safePencere, cekilisler.length);

    // Her birler basamağı (0-9) için frekansları tutacak dizi
    let sonRakamFrekans = [0,0,0,0,0,0,0,0,0,0];
    let toplamSayi = 0;

    for (let i = 0; i < limit; i++) {
        let asil = cekilisler[i] || [];
        asil.forEach(n => {
            if (n >= 1 && n <= MAX_TOP) {
                sonRakamFrekans[n % 10]++;
                toplamSayi++;
            }
        });
        if (jokerler && jokerler[i]) {
            let jn = Number(jokerler[i]);
            if (jn >= 1 && jn <= MAX_TOP) {
                sonRakamFrekans[jn % 10]++;
                toplamSayi++;
            }
        }
    }

    if (toplamSayi === 0) return k19Puanlar;

    // Normalde 90 topta her son rakamdan tam 9 tane vardır (tamamı eşit şansa sahip).
    // Beklenen çıkma sayısı = Toplam çıkan sayı / 10
    let beklenen = toplamSayi / 10;

    // Her rakam (0-9) için sapma (açlık) puanı hesapla
    let hamPuanlar = {};
    for (let r = 0; r <= 9; r++) {
        let sapma = beklenen - sonRakamFrekans[r];
        // Sapma pozitifse (aç kalmış), bonus. Sapma negatifse (çok çıkmış), ceza.
        hamPuanlar[r] = sapma * (safeTaban / 10);
    }

    // Sıcak Bölge Hedefleme (Son 3 Çekiliş Sayıları)
    let son3teCikanlar = new Set();
    let hotLimit = Math.min(3, cekilisler.length);
    for (let i = 0; i < hotLimit; i++) {
        let asil = cekilisler[i] || [];
        asil.forEach(n => son3teCikanlar.add(n));
        if (jokerler && jokerler[i]) {
            son3teCikanlar.add(Number(jokerler[i]));
        }
    }

    for (let n = 1; n <= MAX_TOP; n++) {
        // Keskin Nişancı: Sadece Son 3 çekiliş sayıları ve 1. halka komşuları puan alır
        if (son3teCikanlar.has(n) || (komsuluk && komsuluk.halka1 && komsuluk.halka1[n] > 0)) {
            let sonRakam = n % 10;
            k19Puanlar[n] = Math.round(hamPuanlar[sonRakam] * (safeCarpan / 100));
        } else {
            k19Puanlar[n] = 0;
        }
    }

    return k19Puanlar;
}

// Dışarıya açılacak ana fonksiyon
function motorAtesle(cekilisler, jokerler, ayarlar) {
    // Aşama 1: Frekansları Çıkar
    let frekansTumu = frekansHesapla(cekilisler, jokerler);               // K1 için
    let frekansSon50 = frekansHesapla(cekilisler, jokerler, 50);          // K2 için
    let frekansSon15 = frekansHesapla(cekilisler, jokerler, 15);          // K3 için

    // Aşama 2: Komşuluk Haritasını Çıkar (Son 3 Çekiliş)
    let komsuluk = komsulukHesapla(cekilisler, jokerler, 3);

    // Aşama 1: Taban Puan ve Çarpan (%) ayarlarına göre Puanlara Dönüştür
    let k1Sonuc = puanUret(frekansTumu, ayarlar.K1_TABAN, ayarlar.K1_CARPAN);
    let k2Sonuc = puanUret(frekansSon50, ayarlar.K2_TABAN, ayarlar.K2_CARPAN);
    let k3Sonuc = puanUret(frekansSon15, ayarlar.K3_TABAN, ayarlar.K3_CARPAN);

    // Aşama 2 Puanları (Komşu sayısı * Taban Puan * Çarpan Yüzdesi)
    let k4Puanlar = {};
    let k5Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) {
        let k4HamPuan = komsuluk.halka1[i] * ayarlar.K4_TABAN;
        k4Puanlar[i] = Math.round(k4HamPuan * (ayarlar.K4_CARPAN / 100));

        let k5HamPuan = komsuluk.halka2[i] * ayarlar.K5_TABAN;
        k5Puanlar[i] = Math.round(k5HamPuan * (ayarlar.K5_CARPAN / 100));
    }

    // Aşama 3 Puanları (Joker Puanı K6)
    let k6Puanlar = jokerEtkisiHesapla(jokerler, ayarlar.K6_TABAN, ayarlar.K6_CARPAN);

    // Aşama 4 Puanları (Tekrar Cezası K7)
    let k7Puanlar = tekrarCezasiHesapla(cekilisler, jokerler, ayarlar.K7_TABAN, ayarlar.K7_CARPAN);

    // Aşama 5: K8 (Uyku Cezası)
    let uykuSureleri = uykuSuresiHesapla(cekilisler, jokerler);
    let k8Puanlar = uykuCezasiHesapla(uykuSureleri, ayarlar.K8_TABAN, ayarlar.K8_CARPAN, ayarlar.K8_UYKU_SINIRI, ayarlar.K8_ADIM_CEZASI);
    // Aşama 6: Doygunluk (Aşırı Çıkma) Cezaları (K9, K10, K11, K12)
    let doygunluk = doygunlukCezalariHesapla(cekilisler, jokerler, ayarlar);

    // Aşama 7: K13 (Uyuyan Sayıları Diriltme Operasyonu)
    let k13Puanlar = canlandirmaCezasiHesapla(
        cekilisler, jokerler,
        ayarlar.K13_TABAN, ayarlar.K13_CARPAN,
        ayarlar.K13_ESIK_1, ayarlar.K13_ESIK_2,
        ayarlar.K13_UYKU_SINIRI
    );

    // Aşama 8: K14 (Dinamik Eleme)
    let k14Puanlar = k14ElemeHesapla(
        cekilisler,
        jokerler,
        ayarlar.K14_TABAN,
        ayarlar.K14_CARPAN
    );

    // Aşama 9: K15 (Momentum ve Yankı Ödülü)
    let k15Puanlar = k15OdulHesapla(
        cekilisler,
        jokerler,
        ayarlar.K15_TABAN, 
        ayarlar.K15_CARPAN,
        ayarlar.K15_SON_X
    );

    // Aşama 10: K16 (Onluk Bölge Rotasyon Dengesi)
    let k16Puanlar = k16BolgeRotasyonHesapla(
        cekilisler,
        jokerler,
        ayarlar.K16_TABAN,
        ayarlar.K16_CARPAN,
        ayarlar.K16_PENCERE
    );

    // Aşama 11: K17 (Kanka Sayılar / İkili Birliktelik)
    let k17Puanlar = k17BirliktelikHesapla(
        cekilisler,
        jokerler,
        ayarlar.K17_TABAN,
        ayarlar.K17_CARPAN,
        ayarlar.K17_DERINLIK
    );

    // Aşama 12: K18 (Tek/Çift Dengeleyici)
    let k18Puanlar = k18TekCiftDengesiHesapla(
        cekilisler,
        jokerler,
        komsuluk,
        ayarlar.K18_TABAN,
        ayarlar.K18_CARPAN,
        ayarlar.K18_PENCERE
    );

    // Aşama 13: K19 (Son Rakam Dengesi)
    let k19Puanlar = k19SonRakamDengesiHesapla(
        cekilisler,
        jokerler,
        komsuluk,
        ayarlar.K19_TABAN,
        ayarlar.K19_CARPAN,
        ayarlar.K19_PENCERE
    );

    return {
        frekanslar: {
            tumu: frekansTumu,
            son15: frekansSon15,
            son50: frekansSon50,
            halka1: komsuluk.halka1,
            halka2: komsuluk.halka2
        },
        puanlar: {
            k1: k1Sonuc.puanlar,
            k2: k2Sonuc.puanlar,
            k3: k3Sonuc.puanlar,
            k4: k4Puanlar,
            k5: k5Puanlar,
            k6: k6Puanlar,
            k7: k7Puanlar,
            k8: k8Puanlar,
            k9: doygunluk.k9,
            k10: doygunluk.k10,
            k11: doygunluk.k11,
            k12: doygunluk.k12,
            k13: k13Puanlar,
            k14: k14Puanlar,
            k15: k15Puanlar,
            k16: k16Puanlar,
            k17: k17Puanlar,
            k18: k18Puanlar,
            k19: k19Puanlar
        },
        uykuSureleri: uykuSureleri,
        istatistikler: {
            k1: { min: k1Sonuc.minFrekans, max: k1Sonuc.maxFrekans },
            k2: { min: k2Sonuc.minFrekans, max: k2Sonuc.maxFrekans },
            k3: { min: k3Sonuc.minFrekans, max: k3Sonuc.maxFrekans }
        },
        jokerler: jokerler.slice(0, 15)
    };
}

function zamanMakinesiTesti(tarihStr, testSayisi, havuzBoyutu, globalCekilisler, globalJokerler, ayarlar, targetInt, manualScores) {
    manualScores = manualScores || {};
    let startIndex = 0;

    function parseTarih(t) {
        if (!t) return 0;
        let s = t.toString().trim();
        let parts = s.split(/[\s\.\-\/]+/).filter(p => p.length > 0);
        if (parts.length === 3) {
            let d, m, y;
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                y = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10);
                d = parseInt(parts[2], 10);
            } else if (t.toString().includes('/')) {
                // M/D/Y (veri.js or US format)
                m = parseInt(parts[0], 10);
                d = parseInt(parts[1], 10);
                y = parseInt(parts[2], 10);
            } else {
                // D.M.Y or D M Y (European/Turkish format)
                d = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10);
                y = parseInt(parts[2], 10);
            }
            if (y < 100) y += 2000;
            if (m > 12) {
                let temp = d;
                d = m;
                m = temp;
            }
            if (isNaN(y) || isNaN(m) || isNaN(d)) return 0;
            return y * 10000 + m * 100 + d;
        }
        return 0;
    }

    // Tarih veya indeks eşleştirme
    let exactMatchFound = false;
    if (tarihStr && tarihStr.trim() !== "") {
        let ts = parseInt(tarihStr, 10);

        // Eğer tarihStr içinde nokta, boşluk veya eğik çizgi yoksa ve sadece sayıysa, indeks kabul et
        if (tarihStr.indexOf('.') === -1 && tarihStr.indexOf(' ') === -1 && tarihStr.indexOf('/') === -1 && !isNaN(ts) && ts >= 0 && ts < globalCekilisler.length) {
            startIndex = ts;
            exactMatchFound = true;
        } else if (typeof globalTarihler !== 'undefined' && globalTarihler.length > 0) {
            let targetInt = parseTarih(tarihStr);
            if (targetInt > 0) {
                for (let i = 0; i < globalTarihler.length; i++) {
                    let tInt = parseTarih(globalTarihler[i]);
                    if (tInt === targetInt) {
                        startIndex = i;
                        exactMatchFound = true;
                        break;
                    } else if (tInt > 0 && tInt < targetInt) {
                        startIndex = i;
                        exactMatchFound = false;
                        break;
                    }
                }
            }
        }
    }

    // Hedef çekilişleri ayarla
    let hedefCekilisler;
    let hedefJokerler;
    if (tarihStr && tarihStr.trim() !== "") {
        if (exactMatchFound) {
            hedefCekilisler = globalCekilisler.slice(startIndex + 1);
            hedefJokerler = globalJokerler.slice(startIndex + 1);
        } else {
            hedefCekilisler = globalCekilisler.slice(startIndex);
            hedefJokerler = globalJokerler.slice(startIndex);
        }
    } else {
        hedefCekilisler = globalCekilisler.slice(0);
        hedefJokerler = globalJokerler.slice(0);
    }

    let sonuclar = [];
    for (let i = startIndex; i < startIndex + testSayisi; i++) {
        if (i + 1 >= globalCekilisler.length) break;

        let hedefCekilisler = globalCekilisler.slice(i + 1);
        let hedefJokerler = globalJokerler.slice(i + 1);
        let gercekSayilar = globalCekilisler[i]; // dizi: [13, 21, 27, 44, 79, 90]
        let jokerler = [globalJokerler[i]];      // sayi: [4]

        let motorSonucu = motorAtesle(hedefCekilisler, hedefJokerler, ayarlar);

        let siralama = [];
        for (let num = 1; num <= 90; num++) {
            let toplam = (motorSonucu.puanlar.k1[num] || 0) +
                (motorSonucu.puanlar.k2[num] || 0) +
                (motorSonucu.puanlar.k3[num] || 0) +
                (motorSonucu.puanlar.k4[num] || 0) +
                (motorSonucu.puanlar.k5[num] || 0) +
                (motorSonucu.puanlar.k6[num] || 0) +
                (motorSonucu.puanlar.k7[num] || 0) +
                (motorSonucu.puanlar.k8 ? (motorSonucu.puanlar.k8[num] || 0) : 0) +
                (motorSonucu.puanlar.k9 ? (motorSonucu.puanlar.k9[num] || 0) : 0) +
                (motorSonucu.puanlar.k10 ? (motorSonucu.puanlar.k10[num] || 0) : 0) +
                (motorSonucu.puanlar.k11 ? (motorSonucu.puanlar.k11[num] || 0) : 0) +
                (motorSonucu.puanlar.k12 ? (motorSonucu.puanlar.k12[num] || 0) : 0) +
                (motorSonucu.puanlar.k13 ? (motorSonucu.puanlar.k13[num] || 0) : 0) +
                (motorSonucu.puanlar.k14 ? (motorSonucu.puanlar.k14[num] || 0) : 0) +
                (motorSonucu.puanlar.k15 ? (motorSonucu.puanlar.k15[num] || 0) : 0) +
                (motorSonucu.puanlar.k16 ? (motorSonucu.puanlar.k16[num] || 0) : 0) +
                (motorSonucu.puanlar.k17 ? (motorSonucu.puanlar.k17[num] || 0) : 0) +
                (motorSonucu.puanlar.k18 ? (motorSonucu.puanlar.k18[num] || 0) : 0) +
                (motorSonucu.puanlar.k19 ? (motorSonucu.puanlar.k19[num] || 0) : 0) +
                (manualScores[num] || 0);
            siralama.push({ num: num, toplam: toplam });
        }
        siralama.sort((a, b) => b.toplam - a.toplam);

        let secilenler = siralama.slice(0, havuzBoyutu).map(s => s.num);
        let secilenPuanlar = {};
        siralama.forEach(s => secilenPuanlar[s.num] = s.toplam);

        let hepsi = gercekSayilar; // Joker eklentisi kaldırıldı: concat(jokerler) iptal
        let bilenler = secilenler.filter(s => hepsi.includes(s));

        let cTarih = (typeof globalTarihler !== 'undefined' && globalTarihler[i]) ? globalTarihler[i] : (i + 1) + ". Önceki";

        sonuclar.push({
            tarih: cTarih,
            gercekSayilar: hepsi,
            k6Puanlar: motorSonucu.puanlar.k6,
            k7Puanlar: motorSonucu.puanlar.k7,
            secilenler: secilenler,
            secilenPuanlar: secilenPuanlar,
            kacBilen: bilenler.length,
            bilenler: bilenler
        });
    }

    return sonuclar;
}

// Tarayıcı ve Node.js uyumluluğu için
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { frekansHesapla, puanUret, motorAtesle };
}
