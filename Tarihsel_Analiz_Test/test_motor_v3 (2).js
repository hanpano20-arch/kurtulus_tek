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
    
    let limit = Math.min(15, jokerler.length); // Son 15
    for (let i = 0; i < limit; i++) {
        let jNum = jokerler[i];
        if (!jNum) continue;
        
        // Zaman ağırlığı (En yeni çekiliş için 1.0, 15 çekiliş öncesi için 1/15)
        let weight = (15 - i) / 15;
        let puan = weight * tabanPuan * (carpan / 100);
        
        k6Puanlar[jNum] += puan;
    }
    
    for (let i = 1; i <= MAX_TOP; i++) {
        k6Puanlar[i] = Math.round(k6Puanlar[i]);
    }
    return k6Puanlar;
}

// K7 (Tekrar Cezası) Hesapla
function tekrarCezasiHesapla(cekilisler, tabanCeza, carpan) {
    let k7Puanlar = {};
    for (let i = 1; i <= MAX_TOP; i++) k7Puanlar[i] = 0;
    
    if (!cekilisler || cekilisler.length === 0) return k7Puanlar;
    
    let safeTaban = isNaN(tabanCeza) || tabanCeza === 0 ? -200 : tabanCeza;
    let safeCarpan = isNaN(carpan) || carpan === 0 ? 100 : carpan;

    for (let i = 1; i <= MAX_TOP; i++) {
        let streak = 0;
        for (let j = 0; j < cekilisler.length; j++) {
            if (cekilisler[j] && cekilisler[j].includes(i)) {
                streak++;
            } else {
                break; // Seri bozuldu
            }
        }
        
        if (streak >= 2) {
            let carpanOrani = safeCarpan / 100;
            let multiplier = (streak === 2) ? 1 : 10; // 3 ve üzeri çok ağır ceza (kesin elensin)
            k7Puanlar[i] = Math.round(multiplier * safeTaban * carpanOrani);
        }
    }
    return k7Puanlar;
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
    let k6Puanlar = jokerEtkisiHesapla(jokerler, ayarlar.K6_TABAN || 0, ayarlar.K6_CARPAN || 0);

    // Aşama 4 Puanları (Tekrar Cezası K7)
    let k7Puanlar = tekrarCezasiHesapla(cekilisler, ayarlar.K7_TABAN || 0, ayarlar.K7_CARPAN || 0);

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
            k7: k7Puanlar
        },
        istatistikler: {
            k1: { min: k1Sonuc.minFrekans, max: k1Sonuc.maxFrekans },
            k2: { min: k2Sonuc.minFrekans, max: k2Sonuc.maxFrekans },
            k3: { min: k3Sonuc.minFrekans, max: k3Sonuc.maxFrekans }
        }
    };
}

function zamanMakinesiTesti(tarihStr, testSayisi, havuzBoyutu, globalCekilisler, globalJokerler, ayarlar) {
    let startIndex = 0;
    
    function parseTarih(t) {
        if (!t) return 0;
        let s = t.toString().trim();
        
        // HTML input type="date" YYYY-MM-DD formatında gelir
        if (s.includes('-') && s.match(/^\d{4}-\d{2}-\d{2}$/)) {
            let parts = s.split('-');
            let y = parseInt(parts[0], 10);
            let m = parseInt(parts[1], 10);
            let d = parseInt(parts[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return y * 10000 + m * 100 + d;
            }
        }
        
        // Diğer format: DD.MM.YYYY veya DD/MM/YYYY
        let parts = s.includes('.') ? s.split('.') : s.split(/[-/\s]/);
        if (parts.length === 3) {
            let d = parseInt(parts[0], 10);
            let m = parseInt(parts[1], 10);
            let y = parseInt(parts[2], 10);
            
            // YYYY format ise
            if (parts[0].length === 4) {
                y = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10);
                d = parseInt(parts[2], 10);
            } else {
                // İki haneli yıl kontrolü
                if (y < 100) y += 2000;
            }
            
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return y * 10000 + m * 100 + d;
            }
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
            // Tarih metni olarak eşleştir
            let foundIdx = globalTarihler.indexOf(tarihStr);
            if (foundIdx !== -1) {
                startIndex = foundIdx;
                exactMatchFound = true;
            } else {
                // Farklı formatları (örn: Excel'den gelen M/D/YY) dene
                let parts = tarihStr.includes('.') ? tarihStr.split('.') : tarihStr.split(/[-/\s]/);
                if (parts.length === 3) {
                    let d = parseInt(parts[0], 10);
                    let m = parseInt(parts[1], 10);
                    let y = parseInt(parts[2], 10);
                    let yy = y % 100;
                    
                    let dPad = d.toString().padStart(2, '0');
                    let mPad = m.toString().padStart(2, '0');
                    
                    let altFormats = [
                        `${d}.${m}.${y}`,
                        `${d}/${m}/${y}`,
                        `${m}/${d}/${y}`,
                        `${m}/${d}/${yy}`,
                        `${dPad}.${mPad}.${y}`,
                        `${dPad}/${mPad}/${y}`,
                        `${mPad}/${dPad}/${y}`,
                        `${dPad}-${mPad}-${y}`,
                        `${dPad} ${mPad} ${y}`,
                        `${d} ${m} ${y}`
                    ];
                    
                    for (let i = 0; i < globalTarihler.length; i++) {
                        let t = globalTarihler[i] ? globalTarihler[i].toString().trim() : "";
                        if (altFormats.includes(t)) {
                            startIndex = i;
                            exactMatchFound = true;
                            break;
                        }
                    }
                }
                if (!exactMatchFound) {
                    // En yakın tarihi bul (geriye dönük)
                    let targetInt = parseTarih(tarihStr);
                    if (targetInt > 0) {
                        for (let i = 0; i < globalTarihler.length; i++) {
                            let tInt = parseTarih(globalTarihler[i]);
                            if (tInt > 0 && tInt <= targetInt) {
                                startIndex = i;
                                break;
                            }
                        }
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
                         (motorSonucu.puanlar.k7[num] || 0);
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
