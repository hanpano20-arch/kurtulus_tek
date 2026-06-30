
        // --- Ayarlar ve Taban Puanlar ---
        const DEFAULTS = {
            K1_TABAN: 75,
            K2_TABAN: 100,
            K3_TABAN: 100,
            K4_TABAN: 20,
            K5_TABAN: 5,
            K6_TABAN: 100,
            K7_TABAN: -200,
            K8_TABAN: 100,
            K8_UYKU_SINIRI: 22,
            K8_ADIM_CEZASI: 5,
            K9_TABAN: -250, K9_SINIR: 4,
            K10_TABAN: -250, K10_SINIR: 8,
            K11_TABAN: -250, K11_SINIR: 12,
            K12_TABAN: -250, K12_SINIR: 15,
            K13_TABAN: 100, K13_ESIK_1: 2, K13_ESIK_2: 3, K13_UYKU_SINIRI: 10,
            K14_TABAN: 100,
            K15_TABAN: 100, K15_SON_X: 10,
            K16_TABAN: 150, K16_PENCERE: 10,
            K17_TABAN: 100, K17_DERINLIK: 200,
            K18_TABAN: 60, K18_PENCERE: 8
        };
        let baseSettings = {};
        let unsavedSettings = false;

        function loadSettings() {
            let stored = localStorage.getItem('kurtulus_ayarlar');
            if (stored) {
                try {
                    baseSettings = JSON.parse(stored);
                } catch (e) {
                    baseSettings = { ...DEFAULTS };
                }
            } else {
                baseSettings = { ...DEFAULTS };
            }

            // Yeni eklenen ayarların undefined kalmasını engelle
            for (let key in DEFAULTS) {
                if (baseSettings[key] === undefined) {
                    baseSettings[key] = DEFAULTS[key];
                }
            }
        }

        function renderSettings() {
            let html = '';
            const labels = {
                K1_TABAN: 'K1 (Tarihsel) Maks.',
                K2_TABAN: 'K2 (Son 50) Maks.',
                K3_TABAN: 'K3 (Son 15) Maks.',
                K4_TABAN: 'K4 (1.Halka) Başına',
                K5_TABAN: 'K5 (2.Halka) Başına',
                K6_TABAN: 'K6 (Joker) Puanı',
                K7_TABAN: 'K7 (Tekrar Cezası) Tabanı'
            };

            // K1-K7 Standart Satırlar
            for (let key in labels) {
                html += `
                <div class="setting-row">
                    <label style="min-width: 150px; flex-shrink: 0;">${labels[key]}</label>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, '${key}', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_${key}" value="${baseSettings[key]}" style="width: 55px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, '${key}', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_${key}').value = ${DEFAULTS[key]}; unsavedSettings = true;" title="Varsayılana Dön">↺</button>
                    </div>
                </div>`;
            }

            // K8 Özel Satır (Hepsi yan yana)
            html += `
            <div class="setting-row" style="align-items: center;">
                <label style="min-width: 150px; flex-shrink: 0;">K8 (Derin Uyku)</label>
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="font-size: 0.8em; color: #aaa;">Sınır:</label>
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K8_UYKU_SINIRI', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_K8_UYKU_SINIRI" value="${baseSettings.K8_UYKU_SINIRI}" style="width: 55px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K8_UYKU_SINIRI', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_K8_UYKU_SINIRI').value = ${DEFAULTS.K8_UYKU_SINIRI}; unsavedSettings = true;" title="Sıfırla">↺</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="font-size: 0.8em; color: #aaa;">Adım:</label>
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K8_ADIM_CEZASI', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_K8_ADIM_CEZASI" value="${baseSettings.K8_ADIM_CEZASI}" style="width: 55px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K8_ADIM_CEZASI', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_K8_ADIM_CEZASI').value = ${DEFAULTS.K8_ADIM_CEZASI}; unsavedSettings = true;" title="Sıfırla">↺</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="font-size: 0.8em; color: #aaa;">Puan:</label>
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K8_TABAN', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_K8_TABAN" value="${baseSettings.K8_TABAN}" style="width: 60px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K8_TABAN', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_K8_TABAN').value = ${DEFAULTS.K8_TABAN}; unsavedSettings = true;" title="Sıfırla">↺</button>
                    </div>
                </div>
            </div>`;

            // K9, K10, K11, K12 (Hepsi yan yana)
            const kLabels = {
                9: 'K9 Min.', 10: 'K10 Min.', 11: 'K11 Min.', 12: 'K12 Min.'
            };
            [9, 10, 11, 12].forEach(k => {
                html += `
                <div class="setting-row" style="align-items: center;">
                    <label style="min-width: 150px; flex-shrink: 0;">${kLabels[k]}</label>
                    <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <label style="font-size: 0.8em; color: #aaa;">Sınır:</label>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K${k}_SINIR', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K${k}_SINIR" value="${baseSettings['K' + k + '_SINIR']}" style="width: 55px;" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K${k}_SINIR', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K${k}_SINIR').value = ${DEFAULTS['K' + k + '_SINIR']}; unsavedSettings = true;" title="Sıfırla">↺</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <label style="font-size: 0.8em; color: #aaa;">Puan:</label>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K${k}_TABAN', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K${k}_TABAN" value="${baseSettings['K' + k + '_TABAN']}" style="width: 60px;" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K${k}_TABAN', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K${k}_TABAN').value = ${DEFAULTS['K' + k + '_TABAN']}; unsavedSettings = true;" title="Sıfırla">↺</button>
                        </div>
                    </div>
                </div>`;
            });

            // K13 Özel Sekme
            html += `
                <div class="setting-row" style="align-items: center; background: rgba(0, 188, 212, 0.05); border-left: 3px solid #00bcd4; min-height: 70px;">
                    <label style="color: #00bcd4; min-width: 130px; flex-shrink: 0;">K13 (Diriltme)</label>
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; overflow-x: auto;">
                        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                            <span style="font-size: 0.8em; color: #aaa; white-space:nowrap;">1x Eşik:</span>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_ESIK_1', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K13_ESIK_1" value="${baseSettings.K13_ESIK_1}" style="width: 50px;" min="1" max="5" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_ESIK_1', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K13_ESIK_1').value = ${DEFAULTS.K13_ESIK_1}; unsavedSettings = true;" title="Sıfırla">↺</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                            <span style="font-size: 0.8em; color: #aaa; white-space:nowrap;">2x Eşik:</span>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_ESIK_2', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K13_ESIK_2" value="${baseSettings.K13_ESIK_2}" style="width: 50px;" min="1" max="5" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_ESIK_2', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K13_ESIK_2').value = ${DEFAULTS.K13_ESIK_2}; unsavedSettings = true;" title="Sıfırla">↺</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                            <span style="font-size: 0.8em; color: #aaa; white-space:nowrap;">Taban:</span>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_TABAN', -10)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K13_TABAN" value="${baseSettings.K13_TABAN}" style="width: 55px;" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_TABAN', 10)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K13_TABAN').value = ${DEFAULTS.K13_TABAN}; unsavedSettings = true;" title="Tabanı Sıfırla">↺</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                            <span style="font-size: 0.8em; color: #aaa; white-space:nowrap;">Uyku Sınırı:</span>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_UYKU_SINIRI', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K13_UYKU_SINIRI" value="${baseSettings.K13_UYKU_SINIRI}" style="width: 50px;" min="1" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K13_UYKU_SINIRI', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K13_UYKU_SINIRI').value = ${DEFAULTS.K13_UYKU_SINIRI}; unsavedSettings = true;" title="Sıfırla">↺</button>
                        </div>
                    </div>
                </div>`;

            // K14 Özel Sekme
            html += `
                <div class="setting-row" style="align-items: center; background: rgba(255, 87, 34, 0.05); border-left: 3px solid #ff5722; min-height: 50px;">
                    <label style="color: #ff5722; min-width: 130px; flex-shrink: 0;">K14 (Son 3 Eleme)</label>
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; overflow-x: auto;">
                        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                            <span style="font-size: 0.8em; color: #aaa; white-space:nowrap;">Taban Puan:</span>
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K14_TABAN', -10)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                            <input type="number" id="input_K14_TABAN" value="${baseSettings.K14_TABAN}" style="width: 55px;" oninput="unsavedSettings = true;">
                            <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K14_TABAN', 10)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                            <button class="btn-reset" onclick="document.getElementById('input_K14_TABAN').value = ${DEFAULTS.K14_TABAN}; unsavedSettings = true;" title="Taban Sıfırla">↺</button>
                        </div>
                    </div>
                </div>`;

            document.getElementById('settingsContainer').innerHTML = html;
        }

        function adjSetting(key, dir) {
            let el = document.getElementById(`input_${key}`);
            if (el) {
                el.value = parseInt(el.value, 10) + dir;
                unsavedSettings = true;
            }
        }

        function openSettings() {
            unsavedSettings = false;
            renderSettings();
            document.getElementById('settingsModal').style.display = 'flex';
        }

        function isSettingsChanged() {
            for (let key in DEFAULTS) {
                let el = document.getElementById(`input_${key}`);
                if (el) {
                    let currentVal = parseInt(el.value, 10);
                    // Eğer kutudaki değer, en son kaydedilmiş ayardan (baseSettings) farklıysa değişiklik vardır
                    if (!isNaN(currentVal) && currentVal !== baseSettings[key]) {
                        return true;
                    }
                }
            }
            return false;
        }

        function closeSettings(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            // Hem unsavedSettings flag hem de DOM kıyaslaması ile çift kontrol
            if (unsavedSettings || isSettingsChanged()) {
                alert("⚠️ Kaydedilmemiş değişiklik var!\n\nLütfen önce 'AYARLARI KAYDET' butonuna basın.\nKaydetmeden bu pencere kapatılamaz!");
                return; // Kesinlikle kapatma!
            }
            document.getElementById('settingsModal').style.display = 'none';
        }

        function saveSettings(e) {
            if (e) e.preventDefault();
            for (let key in DEFAULTS) {
                baseSettings[key] = parseInt(document.getElementById(`input_${key}`).value, 10) || DEFAULTS[key];
            }
            localStorage.setItem('kurtulus_ayarlar', JSON.stringify(baseSettings));
            unsavedSettings = false;
            // Ekranda yeşil Kaydedildi mesajı gösterebiliriz ama alert ile bölmeyelim
            let btn = document.querySelector("#settingsModal .btn");
            let oldText = btn.innerText;
            btn.innerText = "KAYDEDİLDİ ✔";
            btn.style.background = "#4caf50";
            setTimeout(() => {
                btn.innerText = oldText;
                btn.style.background = "#00bcd4";
            }, 1500);

            // Eğer sonuç varsa yeniden hesapla
            if (currentSonuc) {
                testCalistir();
            }
        }

        // Başlangıçta ayarları yükle
        loadSettings();

        // Çekiliş Verilerini (Excel/Manuel) Yerel Hafızadan Yükle
        function loadSavedData() {
            try {
                let saved = localStorage.getItem('kurtulus_data');
                if (saved) {
                    let parsed = JSON.parse(saved);
                    if (parsed.c && parsed.c.length > 0) {
                        globalCekilisler = parsed.c;
                        globalJokerler = parsed.j;
                        globalTarihler = parsed.t;
                        console.log("Önceki oturumdan " + parsed.c.length + " çekiliş yüklendi.");
                    }
                }
            } catch (e) { console.error("Veri yükleme hatası", e); }
        }
        loadSavedData();

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
            if (nv > parseInt(s.max)) nv = s.max;
            if (nv < parseInt(s.min)) nv = s.min;
            s.value = nv;
            // İlgili text inputunu bul ve güncelle
            let valId = sliderId.replace('_weight', '_val');
            if (document.getElementById(valId)) {
                document.getElementById(valId).value = nv;
            }
        }

        function syncSlider(sliderId, valId) {
            let s = document.getElementById(sliderId);
            let v = document.getElementById(valId);
            v.value = s.value;
        }

        function adjSetting(inputIdSuffix, step) {
            let input = document.getElementById('input_' + inputIdSuffix);
            if (!input) return;
            let nv = parseInt(input.value) + step;
            input.value = nv;
            // Değer değiştiğinde unsaved flag'ini her iki mekanizma için de set et
            if (typeof unsavedSettings !== 'undefined') unsavedSettings = true;
        }

        function resetSlider(id, defaultValue) {
            let el = document.getElementById(id);
            el.value = defaultValue;
            syncSlider(id, id.replace('_weight', '_val'));
        }

        function syncInputToSlider(inputId, sliderId) {
            let val = parseInt(document.getElementById(inputId).value, 10);
            if (isNaN(val)) val = 0;
            let slider = document.getElementById(sliderId);
            let min = parseInt(slider.min, 10);
            let max = parseInt(slider.max, 10);
            if (val < min) val = min;
            if (val > max) val = max;
            document.getElementById(inputId).value = val;
            slider.value = val;
            testCalistir();
        }

        // --- Veri Ekleme Modal İşlevleri ---
        function openVeriEkleModal() {
            document.getElementById('veriEkleModal').style.display = 'flex';
            renderCekilisListesi();
        }

        function closeVeriEkleModal() {
            document.getElementById('veriEkleModal').style.display = 'none';
            cancelEditCekilis();
        }

        function formatTarih(t) {
            if (!t || t === 'Belirsiz') return t;
            // Eğer m/d/yy veya m/d/yyyy ise
            if (t.includes('/')) {
                let parts = t.split('/');
                if (parts.length === 3) {
                    let m = parts[0].padStart(2, '0');
                    let d = parts[1].padStart(2, '0');
                    let y = parts[2];
                    if (y.length === 2) y = "20" + y;
                    return `${d}.${m}.${y}`;
                }
            }
            // Eğer yyyy-mm-dd ise
            if (t.includes('-')) {
                let parts = t.split('-');
                if (parts.length === 3) {
                    return `${parts[2]}.${parts[1]}.${parts[0]}`;
                }
            }
            return t;
        }

        function renderCekilisListesi() {
            let container = document.getElementById('gecmisCekilislerListesi');
            if (!globalCekilisler || globalCekilisler.length === 0) {
                container.innerHTML = '<div style="color:#aaa; text-align:center; padding:10px;">Henüz hiç çekiliş yok.</div>';
                return;
            }

            let html = '<table style="width:100%; border-collapse:collapse; font-size:12px; text-align:center;">';
            html += '<tr style="background:#3a3a48; color:#fff;"><th>Sıra</th><th>Tarih</th><th>Sayılar</th><th>Joker</th><th>İşlem</th></tr>';
            
            for (let i = 0; i < globalCekilisler.length; i++) {
                let rawTarih = (globalTarihler && globalTarihler[i]) ? globalTarihler[i] : 'Belirsiz';
                let t = formatTarih(rawTarih);
                let s = globalCekilisler[i].join(', ');
                let j = (globalJokerler && globalJokerler[i]) ? globalJokerler[i] : '-';
                let no = globalCekilisler.length - i; // Eski çekilişler küçük numaralı
                
                html += `<tr style="border-bottom:1px solid #333; height: 30px;">
                    <td style="color:#aaa;">#${no}</td>
                    <td>${t}</td>
                    <td style="color:#4caf50; font-weight:bold; letter-spacing:1px;">${s}</td>
                    <td style="color:#ff9800; font-weight:bold;">${j}</td>
                    <td>
                        <div style="display:flex; justify-content:center; gap:5px; white-space:nowrap;">
                            <button class="btn" style="background:#2196f3; padding:4px 8px; font-size:11px;" onclick="editCekilis(${i})">✏️ Düzenle</button>
                            <button class="btn" style="background:#f44336; padding:4px 8px; font-size:11px;" onclick="silCekilis(${i})">🗑️ Sil</button>
                        </div>
                    </td>
                </tr>`;
            }
            html += '</table>';
            container.innerHTML = html;
        }

        function editCekilis(index) {
            let c = globalCekilisler[index];
            if (!c) return;
            
            document.getElementById('m_editIndex').value = index;
            document.getElementById('m_tarih').value = (globalTarihler && globalTarihler[index]) ? globalTarihler[index] : '';
            document.getElementById('m_s1').value = c[0] || '';
            document.getElementById('m_s2').value = c[1] || '';
            document.getElementById('m_s3').value = c[2] || '';
            document.getElementById('m_s4').value = c[3] || '';
            document.getElementById('m_s5').value = c[4] || '';
            document.getElementById('m_s6').value = c[5] || '';
            document.getElementById('m_joker').value = (globalJokerler && globalJokerler[index]) ? globalJokerler[index] : '';

            document.getElementById('btnEkleGuncelle').innerText = '🔄 GÜNCELLE';
            document.getElementById('btnEkleGuncelle').style.background = '#ff9800';
            document.getElementById('btnIptal').style.display = 'inline-block';
        }

        function cancelEditCekilis() {
            document.getElementById('m_editIndex').value = '-1';
            document.getElementById('m_tarih').value = '';
            document.getElementById('m_s1').value = '';
            document.getElementById('m_s2').value = '';
            document.getElementById('m_s3').value = '';
            document.getElementById('m_s4').value = '';
            document.getElementById('m_s5').value = '';
            document.getElementById('m_s6').value = '';
            document.getElementById('m_joker').value = '';

            document.getElementById('btnEkleGuncelle').innerText = '+ YENİ EKLE';
            document.getElementById('btnEkleGuncelle').style.background = '#4caf50';
            document.getElementById('btnIptal').style.display = 'none';
        }

        function silCekilis(index) {
            if (confirm('Bu çekilişi tamamen silmek istediğinize emin misiniz?')) {
                globalCekilisler.splice(index, 1);
                if(globalJokerler) globalJokerler.splice(index, 1);
                if(globalTarihler) globalTarihler.splice(index, 1);
                kaydetCekilisler();
                renderCekilisListesi();
            }
        }

        function kaydetCekilisler() {
            try {
                localStorage.setItem('kurtulus_data', JSON.stringify({
                    c: globalCekilisler,
                    j: globalJokerler,
                    t: globalTarihler
                }));
            } catch(e) { console.warn("Yerel hafıza sınırı aşıldı", e); }
        }

        function manuelCekilisEkle() {
            let editIdx = parseInt(document.getElementById('m_editIndex').value);
            let tarih = document.getElementById('m_tarih').value || "Yeni";
            let s1 = parseInt(document.getElementById('m_s1').value);
            let s2 = parseInt(document.getElementById('m_s2').value);
            let s3 = parseInt(document.getElementById('m_s3').value);
            let s4 = parseInt(document.getElementById('m_s4').value);
            let s5 = parseInt(document.getElementById('m_s5').value);
            let s6 = parseInt(document.getElementById('m_s6').value);
            let joker = parseInt(document.getElementById('m_joker').value);

            if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !joker) {
                alert("Lütfen 6 sayı ve 1 joker bilgisini eksiksiz girin.");
                return;
            }

            let yeniSayilar = [s1, s2, s3, s4, s5, s6].sort((a,b)=>a-b);
            
            if (editIdx > -1) {
                // Güncelleme Modu
                globalCekilisler[editIdx] = yeniSayilar;
                if(globalJokerler) globalJokerler[editIdx] = joker;
                if(globalTarihler) globalTarihler[editIdx] = tarih;
                alert("Çekiliş başarıyla GÜNCELLENDİ!");
            } else {
                // Yeni Ekleme Modu (En Başa / En Yeni)
                globalCekilisler.unshift(yeniSayilar);
                if(globalJokerler) globalJokerler.unshift(joker);
                if(globalTarihler) globalTarihler.unshift(tarih);
                alert("Yeni çekiliş başarıyla EKLENDİ!");
            }

            kaydetCekilisler();
            cancelEditCekilis();
            renderCekilisListesi();
        }

        function loadExcelFile() {
            const fileInput = document.getElementById('excelFile');
            if (!fileInput.files.length) {
                alert("Lütfen bir Excel dosyası seçin!");
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

                let newCekilisler = [];
                let newJokerler = [];
                let newTarihler = [];

                for (let i = 1; i < json.length; i++) {
                    let row = json[i];
                    if (!row || row.length < 8) continue;

                    let s1 = parseInt(row[1]), s2 = parseInt(row[2]), s3 = parseInt(row[3]);
                    let s4 = parseInt(row[4]), s5 = parseInt(row[5]), s6 = parseInt(row[6]);
                    let joker = parseInt(row[7]);
                    let tarih = row[8] || "Tarihsiz";

                    if (!isNaN(s1) && !isNaN(joker)) {
                        newTarihler.push(tarih);
                        newCekilisler.push([s1, s2, s3, s4, s5, s6]);
                        newJokerler.push(joker);
                    }
                }

                if (newCekilisler.length > 0) {
                    globalCekilisler = newCekilisler;
                    globalJokerler = newJokerler;
                    globalTarihler = newTarihler;

                    // Yerel hafızaya kaydet
                    try {
                        localStorage.setItem('kurtulus_data', JSON.stringify({
                            c: globalCekilisler,
                            j: globalJokerler,
                            t: globalTarihler
                        }));
                    } catch (e) { console.warn("Yerel hafıza sınırı aşıldı", e); }

                    alert(newCekilisler.length + " adet çekiliş Excel'den başarıyla yüklendi!");
                    closeVeriEkleModal();
                } else {
                    alert("Excel dosyasından veri okunamadı. Lütfen formatı kontrol edin.");
                }
            };

            reader.readAsArrayBuffer(file);
        }

        let unsavedChanges = false;
        let manualScores = {}; // Her top için eklenmiş manuel puanları tutar
        let poolOverrides = {}; // Havuz seçimi (true=zorla ekle, false=zorla çıkar)
        let currentSonuc = null;

        function inFinalPool(num) {
            if (poolOverrides[num] !== undefined) return poolOverrides[num];
            // Varsayılan: havuzBoyutu kadar en yüksek puanlı
            let havuzBoyutu = parseInt(document.getElementById('havuzBoyutu').value, 10) || 30;
            let sorted = Object.keys(currentSonuc.puanlar.k1).map(n => ({
                num: parseInt(n),
                tp: (currentSonuc.puanlar.k1[n] || 0) +
                    (currentSonuc.puanlar.k2[n] || 0) +
                    (currentSonuc.puanlar.k3[n] || 0) +
                    (currentSonuc.puanlar.k4[n] || 0) +
                    (currentSonuc.puanlar.k5[n] || 0) +
                    (currentSonuc.puanlar.k6[n] || 0) +
                    (currentSonuc.puanlar.k7[n] || 0) +
                    (currentSonuc.puanlar.k8 ? (currentSonuc.puanlar.k8[n] || 0) : 0) +
                    (currentSonuc.puanlar.k9 ? (currentSonuc.puanlar.k9[n] || 0) : 0) +
                    (currentSonuc.puanlar.k10 ? (currentSonuc.puanlar.k10[n] || 0) : 0) +
                    (currentSonuc.puanlar.k11 ? (currentSonuc.puanlar.k11[n] || 0) : 0) +
                    (currentSonuc.puanlar.k12 ? (currentSonuc.puanlar.k12[n] || 0) : 0) +
                    (currentSonuc.puanlar.k13 ? (currentSonuc.puanlar.k13[n] || 0) : 0) +
                    (manualScores[n] || 0)
            }));
            sorted.sort((a, b) => b.tp - a.tp);
            let top = sorted.slice(0, havuzBoyutu).map(s => s.num);
            return top.includes(num);
        }

        function changeManualScore(num, delta) {
            if (!manualScores[num]) manualScores[num] = 0;
            manualScores[num] += delta;
            let els = document.querySelectorAll(`.man-val-${num}`);
            els.forEach(el => {
                el.innerText = manualScores[num];
                el.style.color = manualScores[num] < 0 ? '#f44336' : (manualScores[num] > 0 ? '#4caf50' : '#fff');
            });
            unsavedChanges = true;
        }

        function togglePoolOverride(num) {
            poolOverrides[num] = !inFinalPool(num);
            openSayiListesi(false);
        }

        function saveAndSort() {
            let tarihVal = document.getElementById('hedefTarih').value;
            if (!tarihVal) {
                alert("Lütfen 'Testin Başlayacağı Tarih' kısmına geçerli bir tarih girin!");
                return;
            }
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

        window.onload = function () {
            let ds = document.getElementById('dataStatus');
            if (typeof globalCekilisler !== 'undefined' && globalCekilisler.length > 0) {
                if (ds) ds.innerText = globalCekilisler.length + " adet çekiliş başarıyla yüklendi!";
            } else {
                if (ds) {
                    ds.innerText = "Hata: Veri yüklenemedi!";
                    ds.style.background = "#f44336";
                }
            }

            // Otomatik bugünün tarihini atayalım
            let today = new Date();
            let yyyy = today.getFullYear();
            let mm = String(today.getMonth() + 1).padStart(2, '0');
            let dd = String(today.getDate()).padStart(2, '0');
            document.getElementById('hedefTarih').value = `${yyyy}-${mm}-${dd}`;
        };

        function testCalistir() {
            let tarihVal = document.getElementById('hedefTarih').value;
            if (!tarihVal) {
                alert("Lütfen 'Testin Başlayacağı Tarih' kısmına geçerli bir tarih girin!");
                return;
            }

            if (typeof globalCekilisler === 'undefined' || globalCekilisler.length === 0) {
                alert("Veriler yüklenmemiş!");
                return;
            }

            let startIndex = 0;
            let exactMatchFound = false;

            if (tarihVal) {
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
                        if (m > 12) { let temp = d; d = m; m = temp; }
                        if (isNaN(y) || isNaN(m) || isNaN(d)) return 0;
                        return y * 10000 + m * 100 + d;
                    }
                    return 0;
                }

                let targetInt = parseTarih(tarihVal);
                if (targetInt > 0) {
                    // 1. Tam Eşleşme Ara
                    for (let i = 0; i < globalTarihler.length; i++) {
                        let tInt = parseTarih(globalTarihler[i]);
                        if (tInt === targetInt) {
                            startIndex = i;
                            exactMatchFound = true;
                            break;
                        }
                    }

                    // 2. Tam Eşleşme Yoksa Fallback (Ondan küçük en yakın tarih)
                    if (!exactMatchFound) {
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

            let hedefCekilisler;
            let hedefJokerler;

            if (tarihVal) {
                // Eğer girilen tarih excel'deki tarihle tamamen aynıysa (exactMatchFound)
                // KULLANICI İSTEĞİ: Girilen tarihi geçmişin en son çekilişi (Bugün) olarak kabul et.
                // Yani o tarihi saklamak yerine hesaplamaya dahil et.
                if (exactMatchFound) {
                    hedefCekilisler = globalCekilisler.slice(startIndex);
                    hedefJokerler = globalJokerler.slice(startIndex);
                } else {
                    hedefCekilisler = globalCekilisler.slice(startIndex);
                    hedefJokerler = globalJokerler.slice(startIndex);
                }
            } else {
                hedefCekilisler = globalCekilisler.slice(0);
                hedefJokerler = globalJokerler.slice(0);
            }

            if (!hedefCekilisler || hedefCekilisler.length === 0) {
                alert("Test edilecek çekiliş bulunamadı!");
                return;
            }

            let ayarlar = {
                K1_TABAN: baseSettings.K1_TABAN,
                K2_TABAN: baseSettings.K2_TABAN,
                K3_TABAN: baseSettings.K3_TABAN,
                K4_TABAN: baseSettings.K4_TABAN,
                K5_TABAN: baseSettings.K5_TABAN,
                K6_TABAN: baseSettings.K6_TABAN,
                K7_TABAN: baseSettings.K7_TABAN,
                K8_TABAN: baseSettings.K8_TABAN,
                K8_UYKU_SINIRI: baseSettings.K8_UYKU_SINIRI,
                K8_ADIM_CEZASI: baseSettings.K8_ADIM_CEZASI,
                K13_TABAN: baseSettings.K13_TABAN,
                K13_ESIK_1: baseSettings.K13_ESIK_1,
                K13_ESIK_2: baseSettings.K13_ESIK_2,
                K13_UYKU_SINIRI: baseSettings.K13_UYKU_SINIRI,
                K14_TABAN: baseSettings.K14_TABAN,
                K15_TABAN: baseSettings.K15_TABAN,
                K15_CARPAN: parseInt(document.getElementById('k15_weight') ? document.getElementById('k15_weight').value : 100, 10),
                K16_TABAN: baseSettings.K16_TABAN,
                K16_PENCERE: baseSettings.K16_PENCERE,
                K16_CARPAN: parseInt(document.getElementById('k16_weight') ? document.getElementById('k16_weight').value : 100, 10),
                K1_CARPAN: parseInt(document.getElementById('k1_weight').value, 10),
                K2_CARPAN: parseInt(document.getElementById('k2_weight').value, 10),
                K3_CARPAN: parseInt(document.getElementById('k3_weight').value, 10),
                K4_CARPAN: parseInt(document.getElementById('k4_weight').value, 10),
                K5_CARPAN: parseInt(document.getElementById('k5_weight').value, 10),
                K6_CARPAN: parseInt(document.getElementById('k6_weight').value, 10),
                K7_CARPAN: parseInt(document.getElementById('k7_weight').value, 10),
                K8_CARPAN: parseInt(document.getElementById('k8_weight').value, 10),
                K9_TABAN: baseSettings.K9_TABAN,
                K9_SINIR: baseSettings.K9_SINIR,
                K9_CARPAN: parseInt(document.getElementById('k9_weight') ? document.getElementById('k9_weight').value : 100, 10),
                K10_TABAN: baseSettings.K10_TABAN,
                K10_SINIR: baseSettings.K10_SINIR,
                K10_CARPAN: parseInt(document.getElementById('k10_weight') ? document.getElementById('k10_weight').value : 100, 10),
                K11_TABAN: baseSettings.K11_TABAN,
                K11_SINIR: baseSettings.K11_SINIR,
                K11_CARPAN: parseInt(document.getElementById('k11_weight') ? document.getElementById('k11_weight').value : 100, 10),
                K12_TABAN: baseSettings.K12_TABAN,
                K12_SINIR: baseSettings.K12_SINIR,
                K12_CARPAN: parseInt(document.getElementById('k12_weight') ? document.getElementById('k12_weight').value : 100, 10),
                K13_CARPAN: parseInt(document.getElementById('k13_weight') ? document.getElementById('k13_weight').value : 100, 10),
                K14_CARPAN: parseInt(document.getElementById('k14_weight') ? document.getElementById('k14_weight').value : 100, 10)
            };

            currentSonuc = motorAtesle(hedefCekilisler, hedefJokerler, ayarlar);
            renderTable(currentSonuc);
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
                let p6 = sonuc.puanlar.k6[i] || 0;
                let p7 = sonuc.puanlar.k7[i] || 0;
                let p8 = sonuc.puanlar.k8 ? (sonuc.puanlar.k8[i] || 0) : 0;
                let p9 = sonuc.puanlar.k9 ? (sonuc.puanlar.k9[i] || 0) : 0;
                let p10 = sonuc.puanlar.k10 ? (sonuc.puanlar.k10[i] || 0) : 0;
                let p11 = sonuc.puanlar.k11 ? (sonuc.puanlar.k11[i] || 0) : 0;
                let p12 = sonuc.puanlar.k12 ? (sonuc.puanlar.k12[i] || 0) : 0;
                let p13 = sonuc.puanlar.k13 ? (sonuc.puanlar.k13[i] || 0) : 0;
                let p14 = sonuc.puanlar.k14 ? (sonuc.puanlar.k14[i] || 0) : 0;
                let p15 = sonuc.puanlar.k15 ? (sonuc.puanlar.k15[i] || 0) : 0;
                let p16 = sonuc.puanlar.k16 ? (sonuc.puanlar.k16[i] || 0) : 0;
                let uyku = sonuc.uykuSureleri ? (sonuc.uykuSureleri[i] || 0) : 0;
                let man = manualScores[i] || 0;
                let toplam = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13 + p14 + p15 + p16 + man;
                siralama.push({ i: i, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, uyku, man, toplam });
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
                let isJoker = (sonuc.jokerler && sonuc.jokerler.some(j => Number(j) === Number(i))) ? 'J' : 'N';
                let jokerColor = (isJoker === 'J') ? '#ff9800' : '#888';
                tr.className = item.glowClass;
                tr.innerHTML = `
                <td><div class="lotto-ball">${i}</div></td>
                <td style="font-weight:bold; color:${jokerColor}; text-align:center;">${isJoker}</td>
                <td class="durum-col">
                    <div class="durum-cell">
                        <span class="durum-rank">${item.rankId}</span>
                        <span class="durum-text">${item.durum}</span>
                    </div>
                </td>
                <td style="font-size:1.2em; font-weight:bold; color:${item.toplam < 0 ? '#f44336' : '#fff'};">${item.toplam}</td>
                <td class="manual-ctrl">
                    <button class="btn-m minus manual-ctrl-ignore" onmousedown="startHold(changeManualScore, ${i}, -1)" onmouseup="stopHold()" onmouseleave="stopHold()">-</button>
                    <span class="man-val-${i}" style="font-weight:bold; color:${item.man < 0 ? '#f44336' : (item.man > 0 ? '#4caf50' : '#fff')}">${item.man}</span>
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
                <td style="color:${item.p6 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p6}</td>
                <td style="color:${item.p7 < 0 ? '#f44336' : '#fff'}; font-weight:bold;">${item.p7}</td>
                <td style="color:${item.uyku > 25 ? '#ff9800' : '#fff'};">${item.uyku}</td>
                <td style="color:${item.p8 < 0 ? '#ff9800' : '#fff'}; font-weight:bold;">${item.p8}</td>
                <td style="color:${item.p9 < 0 ? '#f44336' : (item.p9 > 0 ? '#fff' : '#888')}; font-weight:bold;">${item.p9}</td>
                <td style="color:${item.p10 < 0 ? '#f44336' : (item.p10 > 0 ? '#fff' : '#888')}; font-weight:bold;">${item.p10}</td>
                <td style="color:${item.p11 < 0 ? '#f44336' : (item.p11 > 0 ? '#fff' : '#888')}; font-weight:bold;">${item.p11}</td>
                <td style="color:${item.p12 < 0 ? '#f44336' : (item.p12 > 0 ? '#fff' : '#888')}; font-weight:bold;">${item.p12}</td>
                <td style="color:${item.p13 > 0 ? '#00bcd4' : '#888'}; font-weight:bold;">${item.p13}</td>
                <td style="color:${item.p14 !== 0 ? '#f44336' : '#888'}; font-weight:bold;">${item.p14}</td>
                <td style="color:${item.p15 > 0 ? '#8bc34a' : '#888'}; font-weight:bold;">${item.p15}</td>
                <td style="color:${item.p16 > 0 ? '#ff9800' : (item.p16 < 0 ? '#f44336' : '#888')}; font-weight:bold;">${item.p16}</td>
            </tr>`;
                tbody.appendChild(tr);
            });
        }

        // SAYI LİSTESİ MODAL FONKSİYONLARI
        function openSayiListesi(checkSonuc = true) {
            let tarihVal = document.getElementById('hedefTarih').value;
            if (!tarihVal) {
                alert("Lütfen 'Testin Başlayacağı Tarih' kısmına geçerli bir tarih girin!");
                return;
            }

            if (checkSonuc && !currentSonuc) {
                testCalistir(); // Motoru otomatik çalıştır
            }

            if (!currentSonuc) {
                alert("Lütfen önce motoru çalıştırın.");
                return;
            }

            let siralama = [];
            for (let num = 1; num <= 90; num++) {
                let p1 = currentSonuc.puanlar.k1[num] || 0;
                let p2 = currentSonuc.puanlar.k2[num] || 0;
                let p3 = currentSonuc.puanlar.k3[num] || 0;
                let p4 = currentSonuc.puanlar.k4[num] || 0;
                let p5 = currentSonuc.puanlar.k5[num] || 0;
                let p6 = currentSonuc.puanlar.k6[num] || 0;
                let p7 = currentSonuc.puanlar.k7[num] || 0;
                let p8 = currentSonuc.puanlar.k8 ? (currentSonuc.puanlar.k8[num] || 0) : 0;
                let p9 = currentSonuc.puanlar.k9 ? (currentSonuc.puanlar.k9[num] || 0) : 0;
                let p10 = currentSonuc.puanlar.k10 ? (currentSonuc.puanlar.k10[num] || 0) : 0;
                let p11 = currentSonuc.puanlar.k11 ? (currentSonuc.puanlar.k11[num] || 0) : 0;
                let p12 = currentSonuc.puanlar.k12 ? (currentSonuc.puanlar.k12[num] || 0) : 0;
                let p13 = currentSonuc.puanlar.k13 ? (currentSonuc.puanlar.k13[num] || 0) : 0;
                let p14 = currentSonuc.puanlar.k14 ? (currentSonuc.puanlar.k14[num] || 0) : 0;
                let p15 = currentSonuc.puanlar.k15 ? (currentSonuc.puanlar.k15[num] || 0) : 0;
                let p16 = currentSonuc.puanlar.k16 ? (currentSonuc.puanlar.k16[num] || 0) : 0;
                let man = manualScores[num] || 0;
                siralama.push({ num: num, tp: p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13 + p14 + p15 + p16 + man });
            }
            siralama.sort((a, b) => b.tp - a.tp);

            let groups = [
                { id: "SICAK (1-22)", color: "#f44336", condition: (s, rank) => rank <= 22 },
                { id: "ILIK (23-44)", color: "#ffeb3b", condition: (s, rank) => rank > 22 && rank <= 44 },
                { id: "SOĞUK (45-66)", color: "#00bcd4", condition: (s, rank) => rank > 44 && rank <= 66 },
                { id: "İHTİMAL DIŞI (67-90)", color: "#888", condition: (s, rank) => rank > 66 }
            ];

            let poolHtml = '';
            groups.forEach(grp => {
                let slice = siralama.filter((s, i) => grp.condition(s, i + 1));
                if (slice.length === 0) return;

                let itemsHtml = slice.map(s => {
                    let inPool = inFinalPool(s.num);
                    let bgStyle = inPool ? '#4caf50' : 'rgba(255,255,255,0.05)';
                    let borderColor = inPool ? '#4caf50' : grp.color;
                    let numColor = inPool ? '#fff' : '#fff';
                    let infoColor = inPool ? '#e8f5e9' : '#aaa';

                    return `
                <div id="pool_item_${s.num}" class="pool-item ${inPool ? 'selected' : ''} modal-ball-item" data-num="${s.num}" style="cursor: pointer; background: ${bgStyle}; padding: 5px; border-radius: 4px; border: 2px solid ${borderColor}; text-align: center; width: 40px;" onclick="togglePoolOverride(${s.num})">
                    <div class="pool-no" style="color:${numColor}; font-weight: bold; font-size: 1.2em; text-shadow: ${inPool ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'};">${s.num}</div>
                    <div class="pool-info" style="color:${infoColor}; font-size: 0.75em;">${s.tp}p</div>
                </div>`;
                }).join('');

                poolHtml += `
            <div class="list-row modal-grp-row" style="margin-bottom: 20px; background: #222; padding: 15px; border-radius: 8px; border-left: 5px solid ${grp.color};">
                <div class="list-label modal-grp-label" style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <span style="color:${grp.color}; font-size:1.5em;">●</span> ${grp.id}
                </div>
                <div class="list-items modal-grp-items" style="display: flex; gap: 10px; flex-wrap: wrap;">${itemsHtml}</div>
            </div>`;
            });

            document.getElementById('havuzContainer').innerHTML = poolHtml;

            // --- TABLO OLUŞTURMA ---
            let html = `
        <table id="sayiListesiTable">
            <thead style="position: sticky; top: 0; z-index: 10; background: #333; box-shadow: 0 2px 2px -1px rgba(0,0,0,0.5);">
                <tr>
                    <th style="padding: 4px; font-size: 0.85em;">Sıra</th>
                    <th style="padding: 4px; font-size: 0.85em;">Sayı</th>
                    <th style="padding: 4px; font-size: 0.85em;">Toplam Puan</th>
                    <th style="padding: 4px; font-size: 0.85em;">Manuel Puan</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k1')" title="Bilgi için tıkla">K1 Puanı</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k2')" title="Bilgi için tıkla">K2 Puanı</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k3')" title="Bilgi için tıkla">K3 Puanı</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k4')" title="Bilgi için tıkla">K4 Puanı</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k5')" title="Bilgi için tıkla">K5 Puanı</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k6')" title="Bilgi için tıkla">K6 Puanı</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k7')" title="Bilgi için tıkla">K7 (Ceza)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k8')" title="Bilgi için tıkla">K8 (Uyku)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k9')" title="Bilgi için tıkla">K9 (Son 4)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k10')" title="Bilgi için tıkla">K10 (Son 8)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k11')" title="Bilgi için tıkla">K11 (Son 12)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg);" onclick="showKInfo('k12')" title="Bilgi için tıkla">K12 (Son 15)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#00bcd4;" onclick="showKInfo('k13')" title="Bilgi için tıkla">K13 (Diriltme)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#ff5722;" onclick="showKInfo('k14')" title="Bilgi için tıkla">K14 (Eleme)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#8bc34a;" onclick="showKInfo('k15')" title="Bilgi için tıkla">K15 (Yankı)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#ff9800;" onclick="showKInfo('k16')" title="Bilgi için tıkla">K16 (Bölge)</th>
                </tr>
            </thead>
            <tbody>
        `;

            siralama.forEach((item, index) => {
                let isSelected = inFinalPool(item.num);
                let bgClass = isSelected ? 'background: rgba(76, 175, 80, 0.2);' : '';
                let ballStyle = isSelected ? 'background: #4caf50; color: #fff; border-color: #4caf50;' : '';

                let p1 = currentSonuc.puanlar.k1[item.num] || 0;
                let p2 = currentSonuc.puanlar.k2[item.num] || 0;
                let p3 = currentSonuc.puanlar.k3[item.num] || 0;
                let p4 = currentSonuc.puanlar.k4[item.num] || 0;
                let p5 = currentSonuc.puanlar.k5[item.num] || 0;
                let p6 = currentSonuc.puanlar.k6[item.num] || 0;
                let p7 = currentSonuc.puanlar.k7[item.num] || 0;
                let p8 = currentSonuc.puanlar.k8 ? (currentSonuc.puanlar.k8[item.num] || 0) : 0;
                let p9 = currentSonuc.puanlar.k9 ? (currentSonuc.puanlar.k9[item.num] || 0) : 0;
                let p10 = currentSonuc.puanlar.k10 ? (currentSonuc.puanlar.k10[item.num] || 0) : 0;
                let p11 = currentSonuc.puanlar.k11 ? (currentSonuc.puanlar.k11[item.num] || 0) : 0;
                let p12 = currentSonuc.puanlar.k12 ? (currentSonuc.puanlar.k12[item.num] || 0) : 0;
                let p13 = currentSonuc.puanlar.k13 ? (currentSonuc.puanlar.k13[item.num] || 0) : 0;
                let p14 = currentSonuc.puanlar.k14 ? (currentSonuc.puanlar.k14[item.num] || 0) : 0;
                let p15 = currentSonuc.puanlar.k15 ? (currentSonuc.puanlar.k15[item.num] || 0) : 0;
                let p16 = currentSonuc.puanlar.k16 ? (currentSonuc.puanlar.k16[item.num] || 0) : 0;
                let man = manualScores[item.num] || 0;

                html += `
            <tr style="${bgClass}" class="modal-table-row" data-num="${item.num}">
                <td style="color:#888; font-weight:bold;">${index + 1}</td>
                <td><div class="lotto-ball" style="${ballStyle}">${item.num}</div></td>
                <td style="font-size:1.2em; font-weight:bold; color:${item.tp < 0 ? '#f44336' : '#fff'};">${item.tp}</td>
                <td class="manual-ctrl">
                    <button class="btn-m minus manual-ctrl-ignore" onmousedown="startHold(changeManualScore, ${item.num}, -1)" onmouseup="stopHold()" onmouseleave="stopHold()">-</button>
                    <span class="man-val-${item.num}" style="font-weight:bold; color:${man < 0 ? '#f44336' : (man > 0 ? '#4caf50' : '#fff')}">${man}</span>
                    <button class="btn-m plus manual-ctrl-ignore" onmousedown="startHold(changeManualScore, ${item.num}, 1)" onmouseup="stopHold()" onmouseleave="stopHold()">+</button>
                </td>
                <td style="color:${p1 < 0 ? '#f44336' : '#fff'}">${p1}</td>
                <td style="color:${p2 < 0 ? '#f44336' : '#fff'}">${p2}</td>
                <td style="color:${p3 < 0 ? '#f44336' : '#fff'}">${p3}</td>
                <td style="color:${p4 < 0 ? '#f44336' : '#fff'}">${p4}</td>
                <td style="color:${p5 < 0 ? '#f44336' : '#fff'}">${p5}</td>
                <td style="color:${p6 < 0 ? '#f44336' : '#fff'}">${p6}</td>
                <td style="color:#f44336; font-weight:bold;">${p7}</td>
                <td style="color:${p8 < 0 ? '#ff9800' : '#fff'}; font-weight:bold;">${p8}</td>
                <td style="color:${p9 < 0 ? '#f44336' : (p9 > 0 ? '#fff' : '#888')}; font-weight:bold;">${p9}</td>
                <td style="color:${p10 < 0 ? '#f44336' : (p10 > 0 ? '#fff' : '#888')}; font-weight:bold;">${p10}</td>
                <td style="color:${p11 < 0 ? '#f44336' : (p11 > 0 ? '#fff' : '#888')}; font-weight:bold;">${p11}</td>
                <td style="color:${p12 < 0 ? '#f44336' : (p12 > 0 ? '#fff' : '#888')}; font-weight:bold;">${p12}</td>
                <td style="color:${p13 > 0 ? '#00bcd4' : '#888'}; font-weight:bold;">${p13}</td>
                <td style="color:${p14 !== 0 ? '#f44336' : '#888'}; font-weight:bold;">${p14}</td>
                <td style="color:${p15 > 0 ? '#8bc34a' : '#888'}; font-weight:bold;">${p15}</td>
                <td style="color:${p16 > 0 ? '#ff9800' : (p16 < 0 ? '#f44336' : '#888')}; font-weight:bold;">${p16}</td>
            </tr>`;
            });

            html += `</tbody></table>`;
            document.getElementById('sayiListesiContainer').innerHTML = html;
            document.getElementById('sayiListesiModal').style.display = 'flex';
        }

        function saveAndSortModal() {
            if (unsavedChanges) {
                saveAndSort(); // Ana sayfadaki tabloyu günceller
                openSayiListesi(); // Modalı güncel puanlarla tekrar çizer
            }
        }

        function closeSayiListesi() {
            if (unsavedChanges) {
                alert("Kaydedilmemiş manuel puan değişiklikleriniz var! Lütfen çıkmadan önce 'Kaydet ve Yenile' butonuna basın.");
                return;
            }
            document.getElementById('sayiListesiModal').style.display = 'none';
        }

        function openDetayliTablo() {
            let tarihVal = document.getElementById('hedefTarih').value;
            if (!tarihVal) {
                alert("Lütfen 'Testin Başlayacağı Tarih' kısmına geçerli bir tarih girin!");
                return;
            }
            if (!currentSonuc) {
                testCalistir();
            }
            if (!currentSonuc) {
                alert("Motor çalıştırılamadı.");
                return;
            }
            document.getElementById('detayliTabloModal').style.display = 'flex';
        }

        function saveAndSortDetayliModal() {
            if (unsavedChanges) {
                saveAndSort(); // Ana sayfadaki tabloyu günceller
            }

            let searchInput = document.getElementById('detayliSearchInput');
            if (searchInput) searchInput.value = '';

            let tbody = document.getElementById('tableBody');
            if (tbody) {
                let rows = tbody.getElementsByTagName('tr');
                for (let i = 0; i < rows.length; i++) {
                    rows[i].style.boxShadow = '';
                    rows[i].style.backgroundColor = '';
                }
            }

            openDetayliTablo();
        }

        function closeDetayliTablo() {
            let searchInput = document.getElementById('detayliSearchInput');
            if (searchInput && searchInput.value.trim() !== '') {
                alert("Sayı arama işlemi aktiftir. Çıkmak için lütfen önce 'Kaydet ve Sırala' butonuna basınız.");
                return;
            }
            document.getElementById('detayliTabloModal').style.display = 'none';
        }

        function searchDetayliNumber() {
            let val = document.getElementById('detayliSearchInput').value.trim();
            if (!val) return;
            let tbody = document.getElementById('tableBody');
            let rows = tbody.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                let tr = rows[i];
                tr.style.boxShadow = '';
                tr.style.backgroundColor = '';
                let ball = tr.querySelector('.lotto-ball');
                if (ball && ball.innerText === val) {
                    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    tr.style.boxShadow = '0 -4px 10px -2px #0f0, 0 4px 10px -2px #0f0';
                    tr.style.backgroundColor = 'rgba(0, 255, 0, 0.15)';
                }
            }
        }

        let isGroupsCollapsed = false;
        function toggleModalGroups() {
            isGroupsCollapsed = !isGroupsCollapsed;
            let poolContainer = document.getElementById('havuzContainer');
            if (isGroupsCollapsed) {
                poolContainer.style.display = 'none'; // Sadece tablo kalsın
            } else {
                poolContainer.style.display = 'block';
            }
        }

        function searchModalNumber() {
            let val = document.getElementById('modalSearchInput').value.trim();
            let ballItems = document.querySelectorAll('.modal-ball-item');
            let tableRows = document.querySelectorAll('.modal-table-row');

            // 1) Topları Filitrele
            ballItems.forEach(item => {
                if (!val) {
                    item.style.display = 'block';
                } else {
                    if (item.getAttribute('data-num') === val) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });

            // 2) Tablo Satırlarını Filitrele
            tableRows.forEach(row => {
                if (!val) {
                    row.style.display = '';
                } else {
                    if (row.getAttribute('data-num') === val) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });

            // Eğer sayı temizlendiyse topların gruplarını da aç
            if (!val && !isGroupsCollapsed) {
                document.getElementById('havuzContainer').style.display = 'block';
            }
        }

        // ZAMAN MAKİNESİ (GEÇMİŞİ TEST ET) FONKSİYONLARI
        function gecmisiTestEt() {
            let tarihVal = document.getElementById('hedefTarih').value || "";
            if (!tarihVal) {
                alert("Lütfen 'Testin Başlayacağı Tarih' kısmına geçerli bir tarih girin!");
                return;
            }

            if (typeof globalCekilisler === 'undefined' || globalCekilisler.length === 0) {
                alert("Veriler yüklenmemiş!");
                return;
            }

            let testSayisi = parseInt(document.getElementById('testCekilisSayisi').value, 10) || 15;
            let havuzBoyutu = parseInt(document.getElementById('havuzBoyutu').value, 10) || 30;
            let tarihStr = "";
            let targetInt = 0;

            function parseTarih(t) {
                if (!t) return 0;
                let s = t.toString().trim();
                let parts = s.split(/[\s\.\-\/]+/).filter(p => p.length > 0);
                if (parts.length === 3) {
                    let d, m, y;
                    if (parts[0].length === 4) {
                        y = parseInt(parts[0], 10);
                        m = parseInt(parts[1], 10);
                        d = parseInt(parts[2], 10);
                    } else if (t.toString().includes('/')) {
                        m = parseInt(parts[0], 10);
                        d = parseInt(parts[1], 10);
                        y = parseInt(parts[2], 10);
                    } else {
                        d = parseInt(parts[0], 10);
                        m = parseInt(parts[1], 10);
                        y = parseInt(parts[2], 10);
                    }
                    if (y < 100) y += 2000;
                    if (m > 12) { let temp = d; d = m; m = temp; }
                    if (isNaN(y) || isNaN(m) || isNaN(d)) return 0;
                    return y * 10000 + m * 100 + d;
                }
                return 0;
            }

            if (tarihVal) {
                targetInt = parseTarih(tarihVal);
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
                K6_TABAN: baseSettings.K6_TABAN,
                K7_TABAN: baseSettings.K7_TABAN,
                K8_TABAN: baseSettings.K8_TABAN,
                K8_UYKU_SINIRI: baseSettings.K8_UYKU_SINIRI,
                K8_ADIM_CEZASI: baseSettings.K8_ADIM_CEZASI,
                K1_CARPAN: parseInt(document.getElementById('k1_weight').value, 10),
                K2_CARPAN: parseInt(document.getElementById('k2_weight').value, 10),
                K3_CARPAN: parseInt(document.getElementById('k3_weight').value, 10),
                K4_CARPAN: parseInt(document.getElementById('k4_weight').value, 10),
                K5_CARPAN: parseInt(document.getElementById('k5_weight').value, 10),
                K6_CARPAN: parseInt(document.getElementById('k6_weight').value, 10),
                K7_CARPAN: parseInt(document.getElementById('k7_weight').value, 10),
                K8_CARPAN: parseInt(document.getElementById('k8_weight').value, 10),
                K9_TABAN: baseSettings.K9_TABAN,
                K9_SINIR: baseSettings.K9_SINIR,
                K9_CARPAN: parseInt(document.getElementById('k9_weight') ? document.getElementById('k9_weight').value : 100, 10),
                K10_TABAN: baseSettings.K10_TABAN,
                K10_SINIR: baseSettings.K10_SINIR,
                K10_CARPAN: parseInt(document.getElementById('k10_weight') ? document.getElementById('k10_weight').value : 100, 10),
                K11_TABAN: baseSettings.K11_TABAN,
                K11_SINIR: baseSettings.K11_SINIR,
                K11_CARPAN: parseInt(document.getElementById('k11_weight') ? document.getElementById('k11_weight').value : 100, 10),
                K12_TABAN: baseSettings.K12_TABAN,
                K12_SINIR: baseSettings.K12_SINIR,
                K12_CARPAN: parseInt(document.getElementById('k12_weight') ? document.getElementById('k12_weight').value : 100, 10),
                K13_TABAN: baseSettings.K13_TABAN,
                K13_ESIK_1: baseSettings.K13_ESIK_1,
                K13_ESIK_2: baseSettings.K13_ESIK_2,
                K13_UYKU_SINIRI: baseSettings.K13_UYKU_SINIRI,
                K14_TABAN: baseSettings.K14_TABAN,
                K15_TABAN: baseSettings.K15_TABAN,
                K15_CARPAN: parseInt(document.getElementById('k15_weight') ? document.getElementById('k15_weight').value : 100, 10),
                K16_TABAN: baseSettings.K16_TABAN,
                K16_PENCERE: baseSettings.K16_PENCERE,
                K16_CARPAN: parseInt(document.getElementById('k16_weight') ? document.getElementById('k16_weight').value : 100, 10),
                K13_CARPAN: parseInt(document.getElementById('k13_weight') ? document.getElementById('k13_weight').value : 100, 10),
                K14_CARPAN: parseInt(document.getElementById('k14_weight') ? document.getElementById('k14_weight').value : 100, 10)
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
            [6, 5, 4, 3, 2, 1, 0].forEach(hitLevel => {
                if (groups[hitLevel].length > 0 && hitLevel > 0) {
                    let drawsHtml = groups[hitLevel].map(s => {
                        let ballsHtml = '';
                        s.gercekSayilar.sort((a, b) => a - b).forEach(num => {
                            let isHit = s.bilenler.includes(num);
                            let tp = s.secilenPuanlar[num] || 0;
                            let isJokerSourced = s.k6Puanlar && s.k6Puanlar[num] > 0;

                            let jBadge = isJokerSourced ? `<div style="position:absolute; top:-6px; right:-6px; background:#ff9800; color:#fff; font-size:0.7em; font-weight:bold; padding:1px 4px; border-radius:4px; box-shadow:0 0 3px #000;">J</div>` : '';

                            ballsHtml += `
                            <div class="zm-ball ${isHit ? 'hit' : ''}" style="position:relative;">
                                ${jBadge}
                                <span class="zm-no">${num}</span>
                                <span class="zm-score">${tp}p</span>
                            </div>
                        `;
                        });

                        let formattedTarih = s.tarih || 'Tarihsiz';
                        if (formattedTarih && formattedTarih.includes('/')) {
                            let p = formattedTarih.split('/');
                            if (p.length === 3) {
                                let m = p[0].padStart(2, '0');
                                let d = p[1].padStart(2, '0');
                                let y = p[2];
                                if (y.length === 2) y = "20" + y;
                                formattedTarih = d + "." + m + "." + y;
                            }
                        }

                        return `
                        <div class="zm-draw">
                            <div class="zm-date" style="font-size: 1.5em; font-weight: bold; min-width: 130px; text-align: center;">${formattedTarih}</div>
                            <div class="zm-balls">${ballsHtml}</div>
                        </div>
                    `;
                    }).join('');

                    html += `
                <div class="zm-group">
                    <div class="zm-header">
                        <span>${hitLevel} Bilen Sayısı: ${groups[hitLevel].length}</span>
                        <span style="font-size:0.8em; color:#888; cursor:pointer;" onclick="toggleZMAccordion(this)">▼ AÇ/KAPAT</span>
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

        function toggleZMAccordion(el) {
            let container = el.parentElement.nextElementSibling;
            if (container.style.display === 'none') {
                container.style.display = 'grid';
                el.innerHTML = '▼ AÇ/KAPAT';
            } else {
                container.style.display = 'none';
                el.innerHTML = '▲ AÇ/KAPAT';
            }
        }

    

        const K_RULE_INFO = {
            'k1': {
                title: "K1 - Tüm Zamanlar Frekansı",
                what: "Bir sayının loto tarihindeki tüm çekilişlerde toplamda kaç kere çıktığını gösterir.",
                how: "Makine, sayının genel sıcaklığını (popülerliğini) hesaplar.",
                ex: "Çok çıkan sayılar 'Sıcak', az çıkanlar 'Soğuk' olarak değerlendirilir.",
                eff: "Sayı ne kadar çok çıkmışsa genel potansiyel puanı o kadar yüksektir."
            },
            'k2': {
                title: "K2 - Son 50 Frekansı",
                what: "Bir sayının sadece son 50 çekilişte kaç kere çıktığını gösterir.",
                how: "Makine, orta vadeli trendleri yakalamaya çalışır.",
                ex: "Tarihsel olarak soğuk olsa da son zamanlarda açılan sayıları bulur.",
                eff: "Orta vadeli yükseliş trendinde olan sayılara puan verir."
            },
            'k3': {
                title: "K3 - Son 15 Frekansı",
                what: "Bir sayının sadece son 15 çekilişte kaç kere çıktığını gösterir.",
                how: "Makine, çok kısa vadeli ve anlık sıcak olan sayıları tespit eder.",
                ex: "Şu anda en çok kazandıran ve ardı ardına çıkan sayılara odaklanır.",
                eff: "Kısa vadeli sıcak sayılara ekstra puan kazandırır."
            },
            'k4': {
                title: "K4 - 1. Halka Komşusu",
                what: "Son 3 çekilişte çıkan sayıların ızgaradaki (biletteki) bitişik komşularını inceler.",
                how: "Lotoda çıkan bir sayının etrafındaki sayıların da çıkma eğilimi olduğunu varsayar.",
                ex: "Eğer 15 sayısı çıkmışsa, 14, 16, 5, 25 gibi hemen yanındaki sayılara puan verir.",
                eff: "Çıkan sayıların 1. halkasındaki yakın komşularına yüksek puan aktarır."
            },
            'k5': {
                title: "K5 - 2. Halka Komşusu",
                what: "Son 3 çekilişte çıkan sayıların ikinci mesafe (dış çember) komşularını inceler.",
                how: "Etki alanını biraz daha genişleterek çıkan sayının etrafındaki daha geniş bölgeyi tarar.",
                ex: "Eğer 15 sayısı çıkmışsa, 13, 17, 4, 6 gibi 2 adım uzaktaki sayılara puan verir.",
                eff: "Isınan bölgelerin biraz dış çeperinde kalan sayılara ılımlı puan aktarır."
            },
            'k6': {
                title: "K6 - Joker Etkisi",
                what: "Geçmişteki joker sayıların mevcut sayılara olan gizli çekim etkisini analiz eder.",
                how: "Son 15 çekilişteki joker sayıları, zaman aşımına göre azalan bir güçle diğer sayıları çeker.",
                ex: "Eğer bir sayı yeni joker olmuşsa, ona ve onun belirlediği çekim alanındaki sayılara yüksek puan verir.",
                eff: "Jokerlerin oluşturduğu şans alanındaki sayılara ekstra puan kazandırır."
            },
            'k7': {
                title: "K7 - Tekrar Cezası",
                what: "Son 3 çekilişte art arda veya çok sık çıkan sayılara ceza keserek onları eler.",
                how: "Bir sayı zaten daha yeni çıkmışsa, bir sonraki çekilişte çıkma ihtimalinin düştüğünü varsayar.",
                ex: "Makine 'Bu sayı daha geçen hafta ve ondan önceki hafta çıktı, bu hafta çıkmaz' der.",
                eff: "Aşırı tekrarlanan sayıların puanını kırarak eksi değerlere düşürür."
            },
            'k8': {
                title: "K8 - Derin Uyku",
                what: "Uzun süredir (aylarca veya yıllarca) hiç çıkmayan sayıları bulur.",
                how: "Uyuyan sayıları uykudan uyanma ihtimaline göre ödüllendirir veya çok derindeyse cezalandırır.",
                ex: "Makine 'Bu sayı 1 yıldır çıkmıyor, artık çıkma zamanı gelmiş olabilir' diyerek puanını artırır.",
                eff: "Uyku sınırını geçen (ama ölmemiş) sayılara diriltici bonus puanlar verir."
            },
            'k9': {
                title: "K9 - Doygunluk (Son 4 Çekiliş)",
                what: "Son 4 çekilişte çok fazla (2 ve üzeri) çıkan sayıları tespit eder.",
                how: "Sayıların kısa vadede doyuma ulaştığını ve enerjisini tükettiğini varsayar.",
                ex: "Makine 'Bu sayı son 1 ayda çok çıktı, enerjisini tüketti' diyerek puanını düşürür.",
                eff: "Son 4 çekilişte aşırı çıkan sayıların puanını ciddi şekilde kırar."
            },
            'k10': {
                title: "K10 - Doygunluk (Son 8 Çekiliş)",
                what: "Son 8 çekilişte çok fazla (3 ve üzeri) çıkan sayıları tespit eder.",
                how: "Sayıların orta vadede doyuma ulaştığını ve enerjisini tükettiğini varsayar.",
                ex: "Makine 'Bu sayı son 2 ayda çok çıktı, bir süre dinlenecek' diyerek puanını düşürür.",
                eff: "Son 8 çekilişte aşırı çıkan sayıların puanını ciddi şekilde kırar."
            },
            'k11': {
                title: "K11 - Doygunluk (Son 12 Çekiliş)",
                what: "Son 12 çekilişte çok fazla (4 ve üzeri) çıkan sayıları tespit eder.",
                how: "Sayıların uzun vadede doyuma ulaştığını ve enerjisini tükettiğini varsayar.",
                ex: "Makine 'Bu sayı son 3 ayda çok çıktı, artık yoruldu' diyerek puanını düşürür.",
                eff: "Son 12 çekilişte aşırı çıkan sayıların puanını ciddi şekilde kırar."
            },
            'k12': {
                title: "K12 - Aşırı Isınma (Son 15)",
                what: "Bir sayı son zamanlarda sürekli çıkıyorsa ama artık enerjisini tamamen tüketmişse devasa bir ceza alır.",
                how: "Tarihsel olarak zayıf olan 'Yalancı Sıcak' sayılar bu kuralda infaz edilir.",
                ex: "Makine 'Bu sayı artık çok çıktı, bir süre daha gelmez' der ve puanını kırar.",
                eff: "Ceza puanı: Varsayılan -45 (Ayarlardan değiştirilebilir)."
            },
            'k13': {
                title: "K13 - Diriltme (Komşu Etkisi)",
                what: "Son 3 çekilişte çıkan sayıların komşularından, uzun zamandır uyuyan (çıkmayan) sayıları bulur.",
                how: "Izgaradaki ısınan bölgelerin etrafındaki uyuyan sayıların, sıcaktan etkilenip uyanacağını varsayar.",
                ex: "Makine 'Bu bölge çok ısındı, sıra hemen yanındaki uyuyan 22 sayısına geldi' der.",
                eff: "Isınan bölgedeki uyuyan sayılara 'Diriltme' (can suyu) puanı verir."
            },
            'k14': {
                title: "K14 - Dinamik Eleme (Son 3 Çekiliş)",
                what: "Son 3 çekilişte çıkmış 'taze' sayıları istatistiksel filtreden geçirir.",
                how: "Loto doğası gereği son 3 çekilişte çıkan ~18 sayının çoğu tekrar etmez. K14 kuralı bu sayıları 5 farklı modele (Taze/Bayat İndeksi, Bireysel Tekrar Huyu, Bölgesel Yığılma, İvme ve Çift/Tek Dengesi) göre analiz eder. Tüm bu modellerden düşük puan (eleme) alan sayıları havuz dışına atar.",
                ex: "Örneğin, '22' sayısı son çekilişte çıkmış olabilir. Ancak aynı onluk gruptan 4 sayı daha çıkmışsa ve '22'nin tarihsel tekrar huyu zayıfsa, K14 devreye girip 22'ye eksi ceza verir.",
                eff: "Sadece son 3 çekilişten gelen sayılara NEGATİF (ceza) etki eder. Yanlış pozitifleri (çıkmış ama bir daha çıkmayacak olanları) eler."
            },
            'k15': {
                title: "K15 - Momentum ve Yankı Ödülü (Son 10 Çekiliş)",
                what: "Son 10 çekilişte yeni uyanmış, 1-2 kez çıkmış sayıları karakter analiziyle inceler ve tekrar etme huyları yüksekse onlara ekstra ödül puanı verir.",
                how: "Öncelikle son 10 çekilişte 1 veya 2 kez çıkan 'taze ve potansiyelli' sayıları bulur. Sonra bu sayıların bütün geçmişine bakar. Bu sayı geçmişte ne kadar aralıklarla uyumuş ve ne sıklıkla tekrar etmiş, bunu bulur. Şu anki uyku durumu geçmiş uyku ortalamasına uyuyorsa (sweet spot) ona ekstra artı (+) puan basar.",
                ex: "Örneğin, 45 sayısı son 10 çekilişin 8. sırasında çıktı. Tüm geçmişine bakıldığında 45 sayısının ortalama 7-8 haftada bir geldiği görülüyor. Ayrıca 45 sayısı geldiğinde genelde ilk 10 hafta içinde bir daha tekrarlamayı seven yankılı bir sayıdır. Bu sayının durumu K15 için 'Mükemmel Kıvam' demektir ve +200 puana kadar ödül alır.",
                eff: "Sadece son 10'da çıkan ancak aşırı doymamış sayılara POZİTİF (ödül) etki eder. Sayıların karakteristik tekrar huylarını kullanıp momentum kazanmasını sağlar."
            }
        };

        function showKInfo(kId) {
            const info = K_RULE_INFO[kId.toLowerCase()];
            if (!info) return;
            
            const html = `
                <h2>${info.title}</h2>
                <div class="kinfo-section">
                    <h4>📌 Ne İşe Yarar?</h4>
                    <p>${info.what}</p>
                </div>
                <div class="kinfo-section">
                    <h4>⚙️ Nasıl Çalışır?</h4>
                    <p>${info.how}</p>
                </div>
                <div class="kinfo-section">
                    <h4>💡 Örnek</h4>
                    <p>${info.ex}</p>
                </div>
                <div class="kinfo-section">
                    <h4>📊 Etki</h4>
                    <p>${info.eff}</p>
                </div>
                <button class="kinfo-close-btn" onclick="closeKInfo()">KAPAT</button>
            `;
            
            document.getElementById('kInfoBox').innerHTML = html;
            document.getElementById('kInfoOverlay').style.display = 'flex';
        }

        function closeKInfo() {
            document.getElementById('kInfoOverlay').style.display = 'none';
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeKInfo();
        });
    
