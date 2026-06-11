
// --- HAVUZ MOTORU ENTEGRASYONU ---
window.HavuzMotoru = {
  updateConfigFromUI: function() {
    const val = (id) => parseFloat(document.getElementById('ws-' + id) ? document.getElementById('ws-' + id).value : 0);
    this.config.YUZDE_TUM_GECMIS = val('hm_hist') || 40;
    this.config.YUZDE_SON_15_DONEM = 100 - this.config.YUZDE_TUM_GECMIS;
    this.config.PUAN_1_HALKA_KOMSU = val('hm_komsu') !== undefined ? val('hm_komsu') : 8.0;
    this.config.CARPAN_KURAKLIK = val('hm_kurak') !== undefined ? val('hm_kurak') : 2.0;
    this.config.PUAN_ONLUK_KURAKLIK_BONUSU = val('hm_onluk') !== undefined ? val('hm_onluk') : 10.0;
    this.config.PUAN_KINETIK_IVME_BONUSU = val('hm_ivme') !== undefined ? val('hm_ivme') : 20.0;
    this.config.PUAN_GECIKMELI_TEKRAR = val('hm_gecik') !== undefined ? val('hm_gecik') : 15.0;
    this.config.CEZA_OLU_SAYI_4 = val('hm_olu') !== undefined ? val('hm_olu') : -15.0;
  },
  config: {
    YUZDE_SON_15_DONEM: 60,
    YUZDE_TUM_GECMIS: 40,
    CARPAN_15: 2.0,
    CARPAN_10: 3.0,
    CARPAN_5: 4.0,
    CARPAN_KURAKLIK: 2.0,
    PUAN_1_HALKA_KOMSU: 8,
    PUAN_GECIKMELI_TEKRAR: 15,
    PUAN_BOLGE_GECISI: 10,
    CEZA_OLU_SAYI_4: -15,
    CEZA_CIFTE_TEKRAR: -5,
    PUAN_ONLUK_KURAKLIK_BONUSU: 10,
    PUAN_KINETIK_IVME_BONUSU: 20
  },
  puanlari_hesapla: function(df, maxN) {
    if (!df || df.length === 0) return {};
    let puanlar = {};
    let genel_frekans = {};
    for (let i = 1; i <= maxN; i++) {
      puanlar[i] = 0;
      genel_frekans[i] = 0;
    }

    // Toplam frekans hesapla
    df.forEach(draw => {
      draw.forEach(num => {
        if (num >= 1 && num <= maxN) genel_frekans[num]++;
      });
    });

    const son_15_donem = df.slice(0, 15);
    const son_10_donem = df.slice(0, 10);
    const son_5_donem = df.slice(0, 5);
    const son_3_donem = df.slice(0, 3);
    const toplam_cekilis = df.length;

    // YENİ FİLTRE 1: ONLUK BLOK KURAKLIK ANALİZİ
    let son_3_hafta_sayilari = new Set();
    son_3_donem.forEach(draw => draw.forEach(n => son_3_hafta_sayilari.add(n)));

    const onlukBlokSayisi = Math.ceil(maxN / 10);
    for (let blok = 0; blok < onlukBlokSayisi; blok++) {
      let baslangic = blok * 10 + 1;
      let bitis = Math.min(baslangic + 9, maxN);
      let bloktan_cikan_var_mi = false;
      for (let n = baslangic; n <= bitis; n++) {
        if (son_3_hafta_sayilari.has(n)) {
          bloktan_cikan_var_mi = true;
          break;
        }
      }
      if (!bloktan_cikan_var_mi) {
        for (let n = baslangic; n <= bitis; n++) {
          puanlar[n] += this.config.PUAN_ONLUK_KURAKLIK_BONUSU;
        }
      }
    }

    // ANA PUANLAMA DÖNGÜSÜ
    for (let i = 1; i <= maxN; i++) {
      let gecmis_puani = ((genel_frekans[i] / (toplam_cekilis * 6)) * 1000) * this.config.YUZDE_TUM_GECMIS;
      
      let f15 = son_15_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
      let f10 = son_10_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
      let f5 = son_5_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
      let f3 = son_3_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);

      let yakin_puani = (f15 * this.config.CARPAN_15) + (f10 * this.config.CARPAN_10) + (f5 * this.config.CARPAN_5);
      yakin_puani = yakin_puani * this.config.YUZDE_SON_15_DONEM;

      puanlar[i] += Math.floor(gecmis_puani + yakin_puani);

      // Kuraklık Çarpanı
      let kuraklik_haftasi = 0;
      for (let idx = 0; idx < df.length; idx++) {
        if (df[idx].includes(i)) break;
        kuraklik_haftasi++;
      }
      puanlar[i] += Math.floor(kuraklik_haftasi * this.config.CARPAN_KURAKLIK);

      // Standart Filtreler
      if (f5 >= 3) puanlar[i] += this.config.CEZA_OLU_SAYI_4;
      if (f5 === 1 && df[0].includes(i)) puanlar[i] += this.config.CEZA_CIFTE_TEKRAR;
      if (f15 === 2 && f5 === 0) puanlar[i] += this.config.PUAN_GECIKMELI_TEKRAR;

      // Kinetik İvme Bonusu
      if (f15 <= 1 && f3 >= 2) puanlar[i] += this.config.PUAN_KINETIK_IVME_BONUSU;
    }

    // YENİ: Genişletilmiş Komşuluk Radarı (Son 3 Çekiliş)
    let uygulananKomsular = new Set();
    son_3_donem.forEach(cekilis => {
      cekilis.forEach(sayi => {
        // -1, +1, -10, +10, -11, -9, +9, +11
        const komsular = [sayi - 1, sayi + 1, sayi - 10, sayi + 10, sayi - 11, sayi - 9, sayi + 9, sayi + 11];
        komsular.forEach(komsu => {
          // Satır atlama kontrolü (örnek: 10'un sağındaki komşusu 11 olamaz, kolon başlar)
          // Fakat lotoda fiziksel kolon 1-10 şeklindedir, 10'un +1'i 11'dir ve alt satıra geçer.
          // Kullanıcı talebine göre fiziksel sütun düzeni dikkate alınırsa basitçe +10/-10 yukarı/aşağı, +1/-1 sağ/sol.
          // Basit sınırlar: 1 <= komsu <= maxN
          if (komsu >= 1 && komsu <= maxN) {
             let key = `${sayi}_${komsu}`;
             if(!uygulananKomsular.has(key)) {
                puanlar[komsu] += this.config.PUAN_1_HALKA_KOMSU;
                uygulananKomsular.add(key);
             }
          }
        });
      });
    });

    // Bölge Geçiş Bonusu (Sadece Son Çekiliş)
    if (son_15_donem.length > 0) {
      let son_cekilis = son_15_donem[0];
      let limit = Math.floor(maxN / 2);
      son_cekilis.forEach(sayi => {
        if (sayi <= limit) {
          for (let n = limit + 1; n <= maxN; n++) puanlar[n] += Math.floor(this.config.PUAN_BOLGE_GECISI / limit);
        } else {
          for (let n = 1; n <= limit; n++) puanlar[n] += Math.floor(this.config.PUAN_BOLGE_GECISI / limit);
        }
      });
    }

    return puanlar;
  },

  getFullData: function() {
    const is60 = document.getElementById('v714-game-60') && document.getElementById('v714-game-60').checked;
    const key = is60 ? 'cpb_hdb_60_v718' : 'cpb_hdb_90_v718';
    try {
      const db = JSON.parse(localStorage.getItem(key));
      if (db && Array.isArray(db.entries) && db.entries.length > 0) {
        return db.entries; // Contains {date, nums, joker}
      }
    } catch(e) {}
    
    try {
      if (typeof loadDraws === 'function') {
        const draws = loadDraws().filter(d => Array.isArray(d) && d.length > 0);
        if (draws.length > 0) {
          return draws.map(d => ({ date: "Bilinmeyen Tarih", nums: d }));
        }
      }
    } catch(e) {}

    return [];
  },
  getRawData: function() {
    const is60 = document.getElementById('v714-game-60') && document.getElementById('v714-game-60').checked;
    const key = is60 ? 'cpb_hdb_60_v718' : 'cpb_hdb_90_v718';
    try {
      const db = JSON.parse(localStorage.getItem(key));
      if (db && Array.isArray(db.entries) && db.entries.length > 0) {
        return db.entries.map(e => e.nums);
      }
    } catch(e) {}
    
    try {
      if (typeof loadDraws === 'function') {
        const draws = loadDraws().filter(d => Array.isArray(d) && d.length > 0);
        if (draws.length > 0) return draws;
      }
    } catch(e) {}

    return [];
  },

  generatePool: function() {
    const rawDraws = this.getRawData();
    if (rawDraws.length === 0) {
      alert("Çekiliş verisi bulunamadı!");
      return;
    }
    const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
    const size = parseInt(document.getElementById('hm-pool-size').value) || 25;
    
    this.updateConfigFromUI();
    const puanlar = this.puanlari_hesapla(rawDraws, maxN);
    let sirali = Object.entries(puanlar).sort((a,b) => b[1] - a[1]);
    let havuz = sirali.slice(0, size).map(x => parseInt(x[0]));
    havuz.sort((a,b) => a - b);
    
    // UI Update
    const poolInput = document.getElementById('poolInput');
    if (poolInput) {
      poolInput.value = havuz.join(" ");
      try { if (typeof parsePool === 'function') parsePool(); } catch(e){}
    }
    
    // YENİ: _sc değişkenini güncelle ve Liste görünümüne geç
    window._sc = {};
    for (let n = 1; n <= maxN; n++) {
       window._sc[n] = { n: n, final: puanlar[n] || 0 };
    }
    window._sel.clear();
    havuz.forEach(n => window._sel.add(n));
    
    if (window.H && window.H.tab) {
       window.H.tab('list'); // Bu işlem H.renderList() tetikler
    }
    alert(`Akıllı Motor hesaplamayı tamamladı.\nSayı Listesi'nde önerilen ${size} sayı seçili durumdadır. Seçimleri dilediğiniz gibi değiştirip "Havuza Ekle" diyebilirsiniz.`);
  },
  runBacktest: function() {
    this.updateConfigFromUI();
    const fullData = this.getFullData();
    const testCount = parseInt(document.getElementById('hm-test-count').value) || 10;
    const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 25;
    const maxN = (typeof gameMax === 'function') ? gameMax() : 90;

    if (fullData.length < testCount + 15) {
      alert(`Test için yeterli veri yok. En az ${testCount + 15} çekiliş gerekli.`);
      return;
    }

    const resDiv = document.getElementById('hm-backtest-results');
    resDiv.style.display = "block";
    
    let kategoriler = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[]};
    let toplam_dogru = 0;

    for (let i = testCount - 1; i >= 0; i--) {
      // Data available to the model at that point in time
      // Extract just the numbers for scoring
      let gercek_cekilis_df = fullData.slice(i + 1).map(e => e.nums);
      let hedef_entry = fullData[i];
      let hedef_cekilis = hedef_entry.nums.slice(0, 6);
      let hedef_tarih = hedef_entry.date || `Geçmiş -${i+1}`;

      let puanlar = this.puanlari_hesapla(gercek_cekilis_df, maxN);
      let sirali = Object.entries(puanlar).sort((a,b) => b[1] - a[1]);
      let havuz = sirali.slice(0, poolSize).map(x => parseInt(x[0]));
      
      let bilinenler = havuz.filter(x => hedef_cekilis.includes(x));
      let bilinen_sayi = bilinenler.length;

      // Hangi sayının kaç puan aldığını da kaydediyoruz
      let sayi_puanlari = {};
      hedef_cekilis.forEach(num => {
        sayi_puanlari[num] = puanlar[num] || 0;
      });

      kategoriler[bilinen_sayi].push({
        index: i,
        tarih: hedef_tarih,
        hedef: hedef_cekilis,
        bilinenler: bilinenler,
        puanlar: sayi_puanlari
      });
      toplam_dogru += bilinen_sayi;
    }

    let outputHtml = `<div style="font-family:sans-serif;">`;
    outputHtml += `<h3 style="margin-top:0; margin-bottom:15px; color:#53f0db; font-size:16px; border-bottom:1px solid rgba(83,240,219,0.3); padding-bottom:8px;">⏳ ZAMAN MAKİNESİ (BACKTEST) SONUÇLARI</h3>`;
    outputHtml += `<div style="font-size:13px; margin-bottom:15px; background:rgba(83,240,219,0.1); padding:12px; border-radius:6px; border:1px solid rgba(83,240,219,0.3); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">`;
    outputHtml += `<div><span style="color:#aaa;">Toplam Test Edilen:</span> <b style="color:#fff; font-size:14px;">${testCount}</b></div>`;
    outputHtml += `<div><span style="color:#aaa;">Hedef Havuz:</span> <b style="color:#fff; font-size:14px;">${poolSize}</b></div>`;
    outputHtml += `<div><span style="color:#aaa;">Ortalama Başarı:</span> <b style="color:#53f0db; font-size:14px;">${(toplam_dogru/testCount).toFixed(2)} / 6</b></div>`;
    outputHtml += `</div>`;

    for(let k=6; k>=0; k--) {
      let items = kategoriler[k];
      if(items && items.length > 0) {
        let catColor = k >= 4 ? '#28a745' : (k === 3 ? '#ffc107' : '#dc3545');
        
        outputHtml += `<div style="margin-bottom:8px;">`;
        outputHtml += `<button onclick="let d = document.getElementById('bt-cat-${k}'); d.style.display = d.style.display==='none'?'block':'none';" style="width:100%; text-align:left; background:rgba(0,0,0,0.6); color:${catColor}; border:1px solid #444; padding:10px 14px; border-radius:6px; cursor:pointer; font-size:14px; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;">
            <span><b style="font-size:16px;">${k} Bilen</b> Çekiliş Sayısı: <b style="color:#fff;">${items.length}</b></span>
            <span style="font-size:12px; color:#aaa; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px;">▼ GÖSTER / GİZLE</span>
          </button>`;
        
        outputHtml += `<div id="bt-cat-${k}" style="display:none; padding:12px; background:rgba(255,255,255,0.03); border-left:1px solid #444; border-right:1px solid #444; border-bottom:1px solid #444; border-radius:0 0 6px 6px;">`;
        
        items.forEach(item => {
          let rowHtml = `<div style="display:flex; align-items:center; margin-bottom:12px; flex-wrap:wrap; border-bottom:1px dashed #333; padding-bottom:8px;">`;
          rowHtml += `<span style="width:110px; color:#aaa; font-size:13px; font-weight:bold;">${item.tarih}</span>`;
          rowHtml += `<div style="display:flex; gap:8px;">`;
          
          let s_hedef = [...item.hedef].sort((a,b)=>a-b);
          s_hedef.forEach(num => {
            let isHit = item.bilinenler.includes(num);
            let bg = isHit ? '#28a745' : 'rgba(255,255,255,0.1)';
            let borderColor = isHit ? '#218838' : '#555';
            let txtColor = isHit ? '#fff' : '#ccc';
            let score = Math.round(item.puanlar[num] || 0);
            
            rowHtml += `<div style="display:flex; flex-direction:column; align-items:center;">
                          <span style="display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; font-size:15px; background:${bg}; color:${txtColor}; font-weight:bold; border-radius:6px; border:1px solid ${borderColor}; box-shadow:0 2px 4px rgba(0,0,0,0.3);">${num}</span>
                          <span style="font-size:10px; color:#888; margin-top:3px;">${score} p</span>
                        </div>`;
          });
          
          rowHtml += `</div></div>`;
          outputHtml += rowHtml;
        });
        
        outputHtml += `</div></div>`;
      }
    }
    
    outputHtml += `</div>`;
    resDiv.innerHTML = outputHtml;
  }
};
// --- HAVUZ MOTORU SONU ---
