
    // --- Ayarlar ve Taban Puanlar ---
    const DEFAULTS = {
        K1_TABAN: 100,
        K2_TABAN: 100,
        K3_TABAN: 100,
        K4_TABAN: 20,
        K5_TABAN: 10
    };
    let baseSettings = {};

    function loadSettings() {
        let stored = localStorage.getItem('kurtulus_ayarlar');
        if (stored) {
            baseSettings = JSON.parse(stored);
        } else {
            baseSettings = { ...DEFAULTS };
        }
    }

    function renderSettings() {
        let html = '';
        const labels = {
            K1_TABAN: 'K1 (Tarihsel) Maks.',
            K2_TABAN: 'K2 (Son 50) Maks.',
            K3_TABAN: 'K3 (Son 15) Maks.',
            K4_TABAN: 'K4 (1.Halka) Başına',
            K5_TABAN: 'K5 (2.Halka) Başına'
        };

        for (let key in DEFAULTS) {
            html += `
            <div class="setting-row">
                <label>${labels[key]}</label>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, '${key}', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                    <input type="number" id="input_${key}" value="${baseSettings[key]}">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, '${key}', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                    <button class="btn-reset" onclick="document.getElementById('input_${key}').value = ${DEFAULTS[key]}" title="Varsayılana Dön">↺</button>
                </div>
            </div>`;
        }
        document.getElementById('settingsContainer').innerHTML = html;
    }

    function openSettings() {
        renderSettings();
        document.getElementById('settingsModal').style.display = 'flex';
    }

    function closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    function saveSettings() {
        for (let key in DEFAULTS) {
            baseSettings[key] = parseInt(document.getElementById(`input_${key}`).value, 10) || DEFAULTS[key];
        }
        localStorage.setItem('kurtulus_ayarlar', JSON.stringify(baseSettings));
        closeSettings();
        // Eğer sonuç varsa yeniden hesapla
        if (currentSonuc) {
            testCalistir(); 
        }
    }

    // Başlangıçta ayarları yükle
    loadSettings();

    // --- Hold-to-increment mantığı ---
    let holdInterval = null;
    let holdTimeout = null;
    let holdCount = 0;

    function startHold(actionFn, ...args) {
        actionFn(...args); // İlk tıklamayı anında yap
        holdCount = 0;
        
        holdTimeout = setTimeout(() => {
            holdInterval = setInterval(() => {
                holdCount++;
                let multiplier = 1;
                if (holdCount > 15) multiplier = 10;
                else if (holdCount > 5) multiplier = 5;
                
                let adjustedArgs = [...args];
                adjustedArgs[1] = args[1] * multiplier; // args[1] her zaman delta değeridir (-1 veya 1)
                actionFn(...adjustedArgs);
            }, 80); // Basılı tutulurken her 80ms'de bir tekrarla
        }, 350); // İlk 350ms basılı tutma süresi
    }

    function stopHold() {
        clearTimeout(holdTimeout);
        clearInterval(holdInterval);
        holdCount = 0;
    }

    function adjSlider(sliderId, step) {
        let s = document.getElementById(sliderId);
        let nv = parseInt(s.value) + step;
        if(nv > parseInt(s.max)) nv = s.max;
        if(nv < parseInt(s.min)) nv = s.min;
        s.value = nv;
        // İlgili text inputunu bul ve güncelle
        let valId = sliderId.replace('_weight', '_val');
        if (document.getElementById(valId)) {
            document.getElementById(valId).value = nv;
        }
    }

    function adjSetting(inputIdSuffix, step) {
        let input = document.getElementById('input_' + inputIdSuffix);
        if (!input) return;
        let nv = parseInt(input.value) + step;
        input.value = nv;
    }

    function resetSlider(id, defaultValue) {
        let el = document.getElementById(id);
        el.value = defaultValue;
        syncSlider(id, id.replace('_weight', '_val'));
    }

    function syncInputToSlider(inputId, sliderId) {
        let val = parseInt(document.getElementById(inputId).value, 10);
        if (isNaN(val)) val = 0;
        if (val < -200) val = -200;
        if (val > 200) val = 200;
        document.getElementById(inputId).value = val;
        document.getElementById(sliderId).value = val;
        testCalistir();
    }

    function syncSlider(sliderId, valId) {
        let slider = document.getElementById(sliderId);
        if (slider) {
            document.getElementById(valId).value = slider.value;
        }
    }

    let unsavedChanges = false;
    let manualScores = {}; // Her top için eklenmiş manuel puanları tutar
    let currentSonuc = null;

    // Ekranda herhangi bir yere tıklanınca kaydedilmemiş veriyi engelleme mantığı
    document.addEventListener('click', function(e) {
        if (unsavedChanges) {
            // Eğer tıklanan yer "manuel kontrol" veya "kaydet" butonu değilse, işlemi iptal et
            if (!e.target.closest('.manual-ctrl') && !e.target.classList.contains('manual-ctrl-ignore')) {
                e.preventDefault();
                e.stopPropagation();
                alert("Kaydedilmemiş veri var! Lütfen işlemi tamamlamak için 'KAYDET VE SIRALA' butonuna basın.");
            }
        }
    }, true);

    function changeManualScore(num, delta) {
        if (!manualScores[num]) manualScores[num] = 0;
        manualScores[num] += delta;
        document.getElementById(`man_val_${num}`).innerText = manualScores[num];
        document.getElementById(`man_val_${num}`).style.color = manualScores[num] < 0 ? '#f44336' : (manualScores[num] > 0 ? '#4caf50' : '#fff');
        unsavedChanges = true;
    }

    function saveAndSort() {
        unsavedChanges = false;
        if (currentSonuc) {
            renderTable(currentSonuc);
        } else {
            testCalistir();
        }
    }

    function searchTable() {
        let input = document.getElementById("searchInput").value.trim();
        let trs = document.getElementById("tableBody").getElementsByTagName("tr");
        for (let i = 0; i < trs.length; i++) {
            let td = trs[i].getElementsByTagName("td")[0];
            if (td) {
                let txtValue = td.textContent || td.innerText;
                if (input === "" || txtValue.trim() === input) {
                    trs[i].style.display = "";
                } else {
                    trs[i].style.display = "none";
                }
            }
        }
    }

    window.onload = function() {
        if (typeof globalCekilisler !== 'undefined' && globalCekilisler.length > 0) {
            document.getElementById('dataStatus').innerText = globalCekilisler.length + " adet çekiliş başarıyla yüklendi!";
        } else {
            document.getElementById('dataStatus').innerText = "Hata: Veri yüklenemedi!";
            document.getElementById('dataStatus').style.background = "#f44336";
        }
    };

    function testCalistir() {
        if (typeof globalCekilisler === 'undefined' || globalCekilisler.length === 0) {
            alert("Veriler yüklenmemiş!");
            return;
        }

        let offset = parseInt(document.getElementById('testOffset').value, 10) || 0;
        let hedefCekilisler = offset > 0 ? globalCekilisler.slice(offset) : globalCekilisler;
        let hedefJokerler = offset > 0 ? globalJokerler.slice(offset) : globalJokerler;

        if (hedefCekilisler.length === 0) {
            alert("Offset çok büyük, test edilecek çekiliş kalmadı!");
            return;
        }

        let ayarlar = {
            // Taban Puanlar (Local Storage'dan)
            K1_TABAN: baseSettings.K1_TABAN,
            K2_TABAN: baseSettings.K2_TABAN,
            K3_TABAN: baseSettings.K3_TABAN,
            K4_TABAN: baseSettings.K4_TABAN,
            K5_TABAN: baseSettings.K5_TABAN,
            // Çarpanlar (Arayüz Sürgülerinden %)
            K1_CARPAN: parseInt(document.getElementById('k1_weight').value, 10),
            K2_CARPAN: parseInt(document.getElementById('k2_weight').value, 10),
            K3_CARPAN: parseInt(document.getElementById('k3_weight').value, 10),
            K4_CARPAN: parseInt(document.getElementById('k4_weight').value, 10),
            K5_CARPAN: parseInt(document.getElementById('k5_weight').value, 10)
        };

        currentSonuc = motorAtesle(hedefCekilisler, hedefJokerler, ayarlar);
        renderTable(currentSonuc);
        renderPool(currentSonuc); // Aşama 7 Havuz gridini çiz
    }

    function renderTable(sonuc) {
        let tbody = document.getElementById("tableBody");
        tbody.innerHTML = "";
        
        let siralama = [];
        for (let i = 1; i <= MAX_TOP; i++) {
            let p1 = sonuc.puanlar.k1[i] || 0;
            let p2 = sonuc.puanlar.k2[i] || 0;
            let p3 = sonuc.puanlar.k3[i] || 0;
            let p4 = sonuc.puanlar.k4[i] || 0;
            let p5 = sonuc.puanlar.k5[i] || 0;
            let man = manualScores[i] || 0;
            let toplam = p1 + p2 + p3 + p4 + p5 + man;
            siralama.push({ i: i, p1, p2, p3, p4, p5, man, toplam });
        }

        siralama.sort((a, b) => b.toplam - a.toplam);

        siralama.forEach((item, index) => {
            let rank = index + 1;
            if (rank <= 22) { item.durum = "SICAK"; item.glowClass = "sicak-glow"; item.rankId = rank; }
            else if (rank <= 44) { item.durum = "ILIK"; item.glowClass = "ilik-glow"; item.rankId = rank; }
            else if (rank <= 66) { item.durum = "SOĞUK"; item.glowClass = "soguk-glow"; item.rankId = rank; }
            else { item.durum = "İHTİMAL DIŞI"; item.glowClass = "ihdisi-glow"; item.rankId = rank; }
        });

        siralama.forEach(item => {
            let i = item.i;
            let tr = document.createElement("tr");
            tr.className = item.glowClass;
            tr.innerHTML = `
                <td><div class="lotto-ball">${i}</div></td>
                <td class="durum-col">
                    <div class="durum-cell">
                        <span class="durum-rank">${item.rankId}</span>
                        <span class="durum-text">${item.durum}</span>
                    </div>
                </td>
                <td style="font-size:1.2em; font-weight:bold; color:${item.toplam < 0 ? '#f44336' : '#fff'};">${item.toplam}</td>
                <td class="manual-ctrl">
                    <button class="btn-m minus manual-ctrl-ignore" onmousedown="startHold(changeManualScore, ${i}, -1)" onmouseup="stopHold()" onmouseleave="stopHold()">-</button>
                    <span id="man_val_${i}" style="font-weight:bold; color:${item.man < 0 ? '#f44336' : (item.man > 0 ? '#4caf50' : '#fff')}">${item.man}</span>
                    <button class="btn-m plus manual-ctrl-ignore" onmousedown="startHold(changeManualScore, ${i}, 1)" onmouseup="stopHold()" onmouseleave="stopHold()">+</button>
                </td>
                <td>${sonuc.frekanslar.tumu[i]}</td>
                <td style="color:${item.p1 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p1}</td>
                <td>${sonuc.frekanslar.son50[i]}</td>
                <td style="color:${item.p3 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p3}</td>
                <td>${sonuc.frekanslar.son15[i]}</td>
                <td style="color:${item.p2 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p2}</td>
                <td>${sonuc.frekanslar.halka1[i]}</td>
                <td style="color:${item.p4 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p4}</td>
                <td>${sonuc.frekanslar.halka2[i]}</td>
                <td style="color:${item.p5 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p5}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Aşama 7: Sayı Havuzunu Çiz (Önizleme)
    function renderPool(sonucObj) {
        // Eski havuz gridi Sayı Listesi modülüne taşındı.
    }

    // SAYI LİSTESİ MODAL FONKSİYONLARI
    function openSayiListesi() {
        if (!currentSonuc) {
            alert("Lütfen önce motoru çalıştırın veya bir analiz yapın.");
            return;
        }
        
        let siralama = [];
        for (let num = 1; num <= 90; num++) {
            let p1 = currentSonuc.puanlar.k1[num] || 0;
            let p2 = currentSonuc.puanlar.k2[num] || 0;
            let p3 = currentSonuc.puanlar.k3[num] || 0;
            let p4 = currentSonuc.puanlar.k4[num] || 0;
            let p5 = currentSonuc.puanlar.k5[num] || 0;
            let man = manualScores[num] || 0;
            siralama.push({ num: num, tp: p1 + p2 + p3 + p4 + p5 + man });
        }
        siralama.sort((a, b) => b.tp - a.tp);

        let sicaklar = siralama.slice(0, 22);
        let iliklar = siralama.slice(22, 44);
        let soguklar = siralama.slice(44, 66);
        let ihdisi = siralama.slice(66, 90);

        function renderRowHtml(arr, title, color, dotColor) {
            let itemsHtml = arr.map(item => `
                <div class="pool-item" style="border-color:${color}; cursor:pointer;" onclick="this.classList.toggle('selected')">
                    <span class="pool-no" style="color:${color}">${item.num}</span>
                    <span class="pool-info" style="color:#aaa">${item.tp}p</span>
                </div>
            `).join('');

            return `
            <div class="list-row">
                <div class="list-label"><span style="color:${dotColor}; font-size:1.5em;">●</span> ${title} (${arr.length})</div>
                <div class="list-items">${itemsHtml}</div>
            </div>`;
        }

        let html = renderRowHtml(sicaklar, "SICAK", "#4caf50", "#4caf50") +
                   renderRowHtml(iliklar, "ILIK", "#ffeb3b", "#ffeb3b") +
                   renderRowHtml(soguklar, "SOĞUK", "#00bcd4", "#00bcd4") +
                   renderRowHtml(ihdisi, "İHTİMAL DIŞI", "#9e9e9e", "#9e9e9e");

        document.getElementById('sayiListesiContainer').innerHTML = html;
        document.getElementById('sayiListesiModal').style.display = 'flex';
    }

    function closeSayiListesi() {
        document.getElementById('sayiListesiModal').style.display = 'none';
    }

    // ZAMAN MAKİNESİ (GEÇMİŞİ TEST ET) FONKSİYONLARI
    function gecmisiTestEt() {
        if (typeof globalCekilisler === 'undefined' || globalCekilisler.length === 0) {
            alert("Veriler yüklenmemiş!");
            return;
        }

        let testSayisi = parseInt(document.getElementById('testCekilisSayisi').value, 10) || 15;
        let havuzBoyutu = parseInt(document.getElementById('havuzBoyutu').value, 10) || 30;
        
        let tarihVal = document.getElementById('hedefTarih').value || "";
        let tarihStr = "";
        if (tarihVal) {
            let parts = tarihVal.split('-');
            if (parts.length === 3) {
                tarihStr = parts[2] + "." + parts[1] + "." + parts[0];
            }
        }

        let ayarlar = {
            K1_TABAN: baseSettings.K1_TABAN,
            K2_TABAN: baseSettings.K2_TABAN,
            K3_TABAN: baseSettings.K3_TABAN,
            K4_TABAN: baseSettings.K4_TABAN,
            K5_TABAN: baseSettings.K5_TABAN,
            K1_CARPAN: parseInt(document.getElementById('k1_weight').value, 10),
            K2_CARPAN: parseInt(document.getElementById('k2_weight').value, 10),
            K3_CARPAN: parseInt(document.getElementById('k3_weight').value, 10),
            K4_CARPAN: parseInt(document.getElementById('k4_weight').value, 10),
            K5_CARPAN: parseInt(document.getElementById('k5_weight').value, 10)
        };

        // Zaman Makinesini Çalıştır
        let sonuclar = zamanMakinesiTesti(tarihStr, testSayisi, havuzBoyutu, globalCekilisler, globalJokerler, ayarlar);

        if (sonuclar.length === 0) {
            alert("Belirtilen tarihe uygun yeterli geçmiş veri bulunamadı.");
            return;
        }

        renderZamanMakinesi(sonuclar, testSayisi, havuzBoyutu);
    }

    function renderZamanMakinesi(sonuclar, testSayisi, havuzBoyutu) {
        let container = document.getElementById('zamanMakinesiContainer');
        let sonuclarDiv = document.getElementById('zamanMakinesiSonuclari');
        
        let groups = {
            6: [], 5: [], 4: [], 3: [], 2: [], 1: [], 0: []
        };
        
        let totalHits = 0;

        sonuclar.forEach(s => {
            let hit = s.kacBilen;
            if (hit > 6) hit = 6;
            groups[hit].push(s);
            totalHits += hit;
        });

        let avg = (totalHits / sonuclar.length).toFixed(2);
        document.getElementById('zmStats').innerText = `Test: ${sonuclar.length} | Havuz: ${havuzBoyutu} | Ortalama Başarı: ${avg} / 6`;

        let html = '';
        
        // Sadece sonucu olan grupları (4 bilen, 3 bilen vb.) yazdır (Görseldeki gibi)
        [6,5,4,3,2,1,0].forEach(hitLevel => {
            if (groups[hitLevel].length > 0 && hitLevel > 0) {
                let drawsHtml = groups[hitLevel].map(s => {
                    let ballsHtml = '';
                    s.gercekSayilar.concat(s.jokerler).sort((a,b)=>a-b).forEach(num => {
                        let isHit = s.bilenler.includes(num);
                        let tp = s.secilenPuanlar[num] || 0;
                        ballsHtml += `
                            <div class="zm-ball ${isHit ? 'hit' : ''}">
                                <span class="zm-no">${num}</span>
                                ${isHit ? `<span class="zm-score">${tp}p</span>` : ''}
                            </div>
                        `;
                    });

                    return `
                        <div class="zm-draw">
                            <div class="zm-date">${s.tarih || 'Tarihsiz'}</div>
                            <div class="zm-balls">${ballsHtml}</div>
                        </div>
                    `;
                }).join('');

                html += `
                <div class="zm-group">
                    <div class="zm-header">
                        <span>${hitLevel} Bilen Sayısı: ${groups[hitLevel].length}</span>
                        <span style="font-size:0.8em; color:#888; cursor:pointer;">▼ AÇ/KAPAT</span>
                    </div>
                    <div class="zm-draws-container">
                        ${drawsHtml}
                    </div>
                </div>`;
            }
        });

        sonuclarDiv.innerHTML = html;
        container.style.display = 'block';
    }

