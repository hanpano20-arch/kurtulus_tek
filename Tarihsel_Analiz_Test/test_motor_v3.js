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

    // 2. Orantısal Ham Puan (0 ile tabanPuan arası)
    // 3. Çarpan Uygulaması (Çarpan % olarak gelir, örn 100 = 1.0, 50 = 0.5)
    for (let i = 1; i <= MAX_TOP; i++) {
        let f = frekanslar[i];
        let oran = (f - minFrekans) / (maxFrekans - minFrekans);
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
            cikanSayilar.add(jokerler[i]);
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
            let isHit = (cekilisler[j] && cekilisler[j].includes(i)) || (jokerler && jokerler[j] === i);
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
    let safeCarpan    = (!carpan || isNaN(carpan))      ? 100 : carpan;
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
            son3Sayilar.add(jokerler[i]);
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
            uyananSayilar.add(jokerler[i]);
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
            k13: k13Puanlar
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

function zamanMakinesiTesti(tarihStr, testSayisi, havuzBoyutu, globalCekilisler, globalJokerler, ayarlar, targetInt) {
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
                (motorSonucu.puanlar.k13 ? (motorSonucu.puanlar.k13[num] || 0) : 0);
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
