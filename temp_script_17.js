
    (function () {
      const $ = id => document.getElementById(id);
      function getDrawKey() { return 'cpb_draws_' + (gameMax() <= 60 ? '60' : '90') + '_v714'; }
      const DRAW_N = 15;
      let v75Selected = new Set();
      let v75Suggestions = [];
      function txt(el) { return (el && el.textContent || '').trim(); }
      function titleOf(card) { return txt(card && card.querySelector(':scope > .card-head .card-title')); }
      function findCard(part) { part = part.toLowerCase(); return [...document.querySelectorAll('.card')].find(c => titleOf(c).toLowerCase().includes(part)); }
      function bodyOf(card) { return card ? (card.querySelector(':scope > .v55-card-body') || (() => { const d = document.createElement('div'); let n = card.querySelector(':scope > .card-head')?.nextSibling; while (n) { const nx = n.nextSibling; d.appendChild(n); n = nx; } return d; })()) : null; }
      function setCollapsed(card, collapsed) { card.classList.toggle('v55-collapsed', !!collapsed); const b = card.querySelector(':scope > .card-head .v55-toggle'); if (b) b.setAttribute('aria-expanded', collapsed ? 'false' : 'true'); }
      function ensureCollapsible(card) {
        if (!card || card.dataset.v55Ready === '1') return;
        const head = card.querySelector(':scope > .card-head'); if (!head) return;
        const body = document.createElement('div'); body.className = 'v55-card-body';
        let n = head.nextSibling; while (n) { const nx = n.nextSibling; body.appendChild(n); n = nx; } card.appendChild(body);
        const toggle = document.createElement('span'); toggle.className = 'v55-toggle'; toggle.setAttribute('role', 'button'); toggle.setAttribute('tabindex', '0'); toggle.setAttribute('aria-expanded', 'true'); toggle.innerHTML = '<span class="txt-open">Aç</span><span class="txt-close">Gizle</span>'; head.appendChild(toggle);
        function doToggle(e) { if (e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')) { if (!e.target.closest('.v55-toggle')) return; } setCollapsed(card, !card.classList.contains('v55-collapsed')); }
        head.addEventListener('click', doToggle); head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(e); } });
        card.dataset.v55Ready = '1';
      }
      function makeGroupedCard(id, title, note, items, insertBeforeCard) {
        if ($(id)) return;
        const existing = items.map(it => ({ it, card: findCard(it.match) })).filter(x => x.card);
        if (!existing.length) return;
        const card = document.createElement('div'); card.className = 'card'; card.id = id;
        card.innerHTML = `<div class="card-head"><div class="step-dot new">${items[0].dot || 'K'}</div><span class="card-title">${title}</span><span class="new-badge">v7.5</span><span class="card-note">tek sekme</span></div><div class="section-note purple">${note}</div>`;
        const container = document.createElement('div'); container.className = 'v75-group-container'; card.appendChild(container);
        existing.forEach(({ it, card: old }) => {
          const sec = document.createElement('div'); sec.className = 'v75-subsection';
          sec.innerHTML = `<div class="v75-subtitle"><span class="dot"></span>${it.label}</div>`;
          const oldBody = bodyOf(old);
          while (oldBody && oldBody.firstChild) sec.appendChild(oldBody.firstChild);
          container.appendChild(sec);
        });
        const first = insertBeforeCard || existing[0].card;
        first.parentNode.insertBefore(card, first);
        existing.forEach(({ card: old }) => old.remove());
        ensureCollapsible(card);
      }
      function groupRuleCards() {
        makeGroupedCard('v75-distribution-card', 'Dağılım ve Sayısal Filtreler', 'Asal sayı, toplam aralığı, tek/çift dağılımı, alt/üst bölge ve sayısal tablo bölgesi tek kart altında toplandı. Mevcut input ID\'leri korunduğu için analiz ve prompt kuralları değişmedi.', [
          { match: 'Asal sayı limitleri', label: 'Asal sayı limitleri', dot: 'D' },
          { match: 'Toplam aralığı kota paketleri', label: 'Toplam aralığı kota paketleri' },
          { match: 'Tek / çift dağılım kotası', label: 'Tek / çift dağılım kotası' },
          { match: 'Alt / üst bölge dağılım kotası', label: 'Alt / üst bölge dağılım kotası' },
          { match: 'Sayısal Tablo Bölgesi filtresi', label: 'Sayısal Tablo Bölgesi filtresi' }
        ]);
        makeGroupedCard('v75-positional-card', 'Konumsal Fark ve Zincir Kuralları', 'Yatay fark, dikey fark ve çapraz zincir kuralları tek kart altında toplandı. Yatay/dikey kontrolde komşu seçili fark mantığı aynen korunur; çapraz kural yalnız gerçek 9x10 çapraz zincirleri kontrol eder.', [
          { match: 'Yatay fark kuralı', label: 'Yatay fark kuralı — komşu seçili fark', dot: 'F' },
          { match: 'Dikey fark kuralı', label: 'Dikey fark kuralı — komşu seçili fark' },
          { match: 'Çapraz zincir kuralı', label: 'Çapraz zincir kuralı — +9 / +11 gerçek kupon geometrisi' }
        ]);
      }
      function hideOldSimilarityCard() {
        const old = findCard('Kolonlar arası benzerlik');
        if (old) { old.style.display = 'none'; old.setAttribute('aria-hidden', 'true'); old.dataset.v75Hidden = '1'; }
      }
      function removeDuplicateDrawMap() { const old = $('draw-map-card'); if (old) old.remove(); }
      function parseNums(str) { const gm = gameMax(); return [...new Set(String(str || '').split(/[^0-9]+/).map(x => parseInt(x, 10)).filter(n => Number.isFinite(n) && n >= 1 && n <= gm))].slice(0, 6).sort((a, b) => a - b); }
      function loadDraws() { try { const v = JSON.parse(localStorage.getItem(getDrawKey()) || 'null'); if (Array.isArray(v) && v.length === DRAW_N) return v.map(a => Array.isArray(a) ? a.slice(0, 6) : []); } catch (e) { } return Array.from({ length: DRAW_N }, () => []); }
      function saveDraws(draws) { try { localStorage.setItem(getDrawKey(), JSON.stringify(draws)); } catch (e) { } }
      function gameMax() { try { return typeof currentGameMax === 'function' ? currentGameMax() : 90; } catch (e) { return 90; } }
      function inRange(n) { return n >= 1 && n <= gameMax(); }
      function appearances(draws, n) { const arr = []; draws.forEach((d, i) => { if ((d || []).includes(n)) arr.push(i); }); return arr; }
      function streak(apps) { let c = 0; for (let i = 0; i < DRAW_N; i++) { if (apps.includes(i)) c++; else break; } return c; }
      function addToPool(nums) {
        const inp = $('poolInput'); if (!inp) return;
        const base = (typeof parseNumbers === 'function' ? parseNumbers(inp.value) : String(inp.value || '').split(/[^0-9]+/).map(x => parseInt(x, 10)).filter(Number.isFinite));
        const set = new Set(base.filter(inRange)); nums.filter(inRange).forEach(n => set.add(n));
        inp.value = [...set].sort((a, b) => a - b).join(', ');
        try { if (typeof parsePool === 'function') parsePool(); } catch (e) { }
        try { if (typeof autoSaveSettings === 'function') autoSaveSettings(); } catch (e) { }
      }
      function analyzeDraws() {
        const draws = loadDraws(); const max = gameMax(); const is60 = max <= 60;
        const drawn = new Set(); draws.forEach(d => (d || []).forEach(n => drawn.add(n)));

        // v7.14 — Ağırlıklı frekans: Ç1=1.0, Ç15=0.3 lineer azalma
        const wFreq = {}; // ağırlıklı skor
        const rawCnt = {}; // ham tekrar sayısı
        draws.forEach((d, i) => {
          const w = parseFloat((1.0 - (i / (DRAW_N - 1)) * 0.7).toFixed(3));
          (d || []).forEach(n => {
            wFreq[n] = (wFreq[n] || 0) + w;
            rawCnt[n] = (rawCnt[n] || 0) + 1;
          });
        });

        // v7.15 — 9×10 kupon geometrisi komşu
        function crd(n) { return { row: Math.floor((n - 1) / 10), col: (n - 1) % 10 }; }
        function isN1(a, b) { const ca = crd(a), cb = crd(b); return Math.abs(ca.row - cb.row) <= 1 && Math.abs(ca.col - cb.col) <= 1 && a !== b; }
        function isN2(a, b) { const ca = crd(a), cb = crd(b); return Math.abs(ca.row - cb.row) <= 2 && Math.abs(ca.col - cb.col) <= 2 && !isN1(a, b) && a !== b; }

        const rows = [];
        for (let n = 1; n <= max; n++) {
          const apps = appearances(draws, n);
          const cnt = rawCnt[n] || 0;
          const wScore = wFreq[n] || 0;
          let neigh = 0;
          draws.forEach((d, i) => {
            const dw = (i === 0 ? 3 : (i <= 2 ? 2 : 1));
            (d || []).forEach(x => {
              if (isN1(x, n)) neigh += dw;
              else if (isN2(x, n)) neigh += dw * 0.5;
            });
          });
          const st = streak(apps);
          const recent = apps.includes(0) ? 1 : (apps.includes(1) ? 0.7 : (apps.includes(2) ? 0.45 : 0));
          // v7.15 streak ceza: üst üste çıkan sayı puan kaybeder
          const streakPenalty = st === 0 ? 0 : st === 1 ? -5 : st === 2 ? -12 : -20;
          const score = wScore * 14 + recent * 8 + neigh * 2 + streakPenalty;
          let group = 'Soğuk';
          if (wScore >= 1.5 && st < 2) group = 'Sıcak';
          else if (wScore >= 1.0 && st >= 2) group = 'Ilık';
          else if (cnt === 1 && (apps.includes(0) || apps.includes(1) || neigh >= 5)) group = 'Ilık';
          else if (cnt >= 1 || neigh > 0) group = 'Orta';
          rows.push({ n, cnt, wScore, apps, st, neigh, score, streakPenalty, group });
        }
        const byGroup = g => rows.filter(r => r.group === g).sort((a, b) => b.score - a.score || b.cnt - a.cnt || a.n - b.n);
        const hot = byGroup('Sıcak'), warm = byGroup('Ilık'), mid = byGroup('Orta'), cold = byGroup('Soğuk');
        v75Suggestions = [...hot, ...warm, ...mid].filter(r => r.score > 0).map(r => r.n);
        v75Selected = new Set(v75Suggestions.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10)));

        // v7.14 — Her çekiliş için toplu istatistikler
        const drawStats = draws.map((d, i) => {
          if (!d || !d.length) return null;
          const nums = d.slice().sort((a, b) => a - b);
          const sum = nums.reduce((a, b) => a + b, 0);
          const odd = nums.filter(n => n % 2 !== 0).length;
          const even = nums.length - odd;
          const low = nums.filter(n => n <= (is60 ? 30 : 45)).length;
          const high = nums.length - low;
          const low30 = nums.filter(n => n <= 30).length;
          const mid60 = is60 ? 0 : nums.filter(n => n > 30 && n <= 60).length;
          const high90 = is60 ? 0 : nums.filter(n => n > 60).length;
          return { i, sum, odd, even, low, high, low30, mid60, high90, nums };
        }).filter(Boolean);

        // Toplu ortalamalar
        const allSums = drawStats.map(d => d.sum);
        const avgSum = drawStats.length ? Math.round(allSums.reduce((a, b) => a + b, 0) / drawStats.length) : 0;
        const avgOdd = drawStats.length ? (drawStats.reduce((a, d) => a + d.odd, 0) / drawStats.length).toFixed(1) : 0;
        const avgLow = drawStats.length ? (drawStats.reduce((a, d) => a + d.low, 0) / drawStats.length).toFixed(1) : 0;

        // Öneri üret
        const oneriler = [];
        const idealSum = is60 ? round2(max * 6 / 2 * 0.85) : round2(max * 6 / 2 * 0.87);
        if (avgSum < idealSum - 15) oneriler.push(`⚠ Son çekilişlerde toplam düşük (ort. ${avgSum}). Yüksek sayılara ağırlık ver.`);
        else if (avgSum > idealSum + 15) oneriler.push(`⚠ Son çekilişlerde toplam yüksek (ort. ${avgSum}). Düşük sayılara ağırlık ver.`);
        else oneriler.push(`✅ Toplam değer dengeli (ort. ${avgSum}).`);

        const idealOdd = 3.0;
        if (parseFloat(avgOdd) < 2.4) oneriler.push(`⚠ Çift sayı baskın (ort. ${avgOdd} tek). Bu çekiliş için tek sayı ağırlıklı kolon dene.`);
        else if (parseFloat(avgOdd) > 3.6) oneriler.push(`⚠ Tek sayı baskın (ort. ${avgOdd} tek). Çift sayı ağırlıklı kolon dene.`);
        else oneriler.push(`✅ Tek/çift dengesi iyi (ort. ${avgOdd} tek).`);

        const idealLow = 3.0;
        if (parseFloat(avgLow) < 2.4) oneriler.push(`⚠ Üst bölge baskın (ort. ${avgLow} alt). Alt bölge (1–${is60 ? 30 : 45}) sayılarına ağırlık ver.`);
        else if (parseFloat(avgLow) > 3.6) oneriler.push(`⚠ Alt bölge baskın (ort. ${avgLow} alt). Üst bölge (${is60 ? 31 : 46}–${max}) sayılarına ağırlık ver.`);
        else oneriler.push(`✅ Bölge dağılımı dengeli (ort. ${avgLow} alt / ${(6 - parseFloat(avgLow)).toFixed(1)} üst).`);

        // Per-draw stats tablosu
        const drawTable = drawStats.map(d => {
          const r30 = d.low30; const r31_60 = is60 ? d.high : d.mid60; const r61_90 = is60 ? 0 : d.high90;
          const bölge = is60 ? `Alt(1-30):${r30} Üst(31-60):${r31_60}` : `1-30:${r30} 31-60:${r31_60} 61-90:${r61_90} | Alt(1-45):${d.low} Üst(46-90):${d.high}`;
          return `Ç${d.i + 1}: [${d.nums.join(' ')}] toplam=${d.sum} tek=${d.odd}/çift=${d.even} ${bölge}`;
        }).join('\n');

        const rep = rows.filter(r => r.cnt > 1).sort((a, b) => b.cnt - a.cnt || a.n - b.n).map(r => `${r.n}(${r.cnt}kez${r.st >= 2 ? ',üst üste' + r.st : ''})`);
        const fmt = arr => arr.slice(0, 40).map(r => `${r.n}(${r.wScore.toFixed(1)}p)`).join(', ') || 'Yok';

        const report = [
          `SON ${DRAW_N} ÇEKİLİŞ ANALİZİ — ${is60 ? '6/60' : '6/90'} OYUNU`,
          `Ç1 en yeni (ağırlık 1.0) → Ç${DRAW_N} en eski (ağırlık 0.3)`,
          `────────────────────────────────────────`,
          `Doluluk: ${draws.map((d, i) => `Ç${i + 1}:${(d || []).length}/6`).join(' ')}`,
          `Farklı sayı: ${drawn.size}  |  Tekrar: ${rep.join(', ') || 'Yok'}`,
          ``,
          `ÇEKİLİŞ DETAYLARI (ağırlıklı analiz)`,
          drawTable || '(Henüz çekiliş girilmedi)',
          ``,
          `ORTALAMA İSTATİSTİKLER`,
          `• Toplam ort.: ${avgSum}  • Tek/çift ort.: ${avgOdd}/çift  • Alt/üst bölge ort.: ${avgLow}/${(6 - parseFloat(avgLow)).toFixed(1)}`,
          ``,
          `ÖNERİLER`,
          ...oneriler,
          ``,
          `SICAK SAYILAR (ağırlıklı): ${fmt(hot)}`,
          `ILIK SAYILAR: ${fmt(warm)}`,
          `ORTA TAKİP: ${fmt(mid)}`,
          `SOĞUK SAYILAR: ${fmt(cold)}`,
          ``,
          `Önerilen ilk 25: ${v75Suggestions.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10)).join(', ') || 'Yok'}`,
          ``,
          `Not: Ağırlıklı puan Ç1=1.0× → Ç15=0.3×. Streak ceza: 1üstüste=−5p, 2=−12p, 3+=−20p. Komşu: 9×10 kupon 8 yönlü geometri. Garanti iddiası içermez.`
        ].join('\n');

        const area = $('v75-draw-analysis'); if (area) area.value = report;
        renderSuggestions({ hot, warm, mid, cold });
      }
      function round2(n) { return Math.round(n); }
      function renderSuggestions(groups) {
        const box = $('v75-draw-suggestions'); if (!box) return;
        if (!groups) { analyzeDraws(); return; }
        function chips(title, arr, limit, selectable) {
          const shown = arr.slice(0, limit);
          return `<div class="v75-group-title">${title}</div>` + (shown.length ? shown.map(r => `<span class="v75-map-chip ${v75Selected.has(r.n) ? 'selected' : ''}" data-n="${r.n}" title="Ağırlıklı puan: ${r.wScore !== undefined ? r.wScore.toFixed(2) : r.cnt} | Tekrar: ${r.cnt} | Üst üste: ${r.st || 0} (ceza:${r.streakPenalty || 0}p) | Kupon komşu: ${Math.round(r.neigh || 0)} | Nihai: ${Math.round(r.score)}">${r.n}<span class="score">${r.wScore !== undefined ? r.wScore.toFixed(1) + 'p' : r.cnt + 'x'}${(r.st || 0) >= 2 ? ' ⚠' : ''}${(r.streakPenalty || 0) < 0 ? ' ↓' : ''}</span></span>`).join('') : '<span class="v75-muted">Yok</span>');
        }
        box.innerHTML = chips('Sıcak', groups.hot, 50, true) + chips('Ilık', groups.warm, 50, true) + chips('Orta', groups.mid, 50, true) + chips('Soğuk / uzak kalan', groups.cold, 30, true) + `<div class="v75-muted">Varsayılan seçili liste, sıcak + ılık + orta gruplardan ilk 25 sayıdır. İstediğin sayıya tıklayarak seçime ekleyip çıkarabilirsin.</div>`;
      }
      function enhanceDrawCard() {
        const card = $('v74-draw-card'); if (!card || $('v75-draw-analysis')) return;
        const note = card.querySelector('.new-badge'); if (note) note.textContent = 'v7.14';
        const cardNote = card.querySelector('.card-note'); if (cardNote) cardNote.textContent = '15 çekiliş · ağırlıklı analiz · 6/60 & 6/90';

        // Listen to static toggle inside Çekiliş DB
        const container = $('v714-game-toggle-container');
        if (container && !container._listenersSet) {
          container._listenersSet = true;
          container.querySelectorAll('input[name="v714game"]').forEach(r => {
            r.addEventListener('change', () => {
              const val = r.value;
              const pgame = $('p-game'); if (pgame) { pgame.value = val; pgame.dispatchEvent(new Event('change', { bubbles: true })); }
              const st = $('v714-game-status'); if (st) st.textContent = `Sayı aralığı: 1–${val}`;
              try { renderDrawMap714(); } catch (e) { }
              try {
                if (window.H && typeof window.H.updateGameModeUI === 'function') window.H.updateGameModeUI();
                if (window.H && typeof window.H.renderDB === 'function') window.H.renderDB();
              } catch (e) { }
            });
          });
          // Sync back from main p-game select changes
          const pgMain = $('p-game');
          if (pgMain) {
            pgMain.addEventListener('change', () => {
              const v = pgMain.value || '90';
              container.querySelectorAll('input[name="v714game"]').forEach(r => r.checked = (r.value === v));
              const st = $('v714-game-status'); if (st) st.textContent = `Sayı aralığı: 1–${v}`;
              try {
                if (window.H && typeof window.H.updateGameModeUI === 'function') window.H.updateGameModeUI();
                if (window.H && typeof window.H.renderDB === 'function') window.H.renderDB();
              } catch (e) { }
            });
          }
        }
        const actions = document.createElement('div'); actions.className = 'v75-draw-actions';
        actions.innerHTML = `<button class="mini-btn" type="button" id="v75-clear-all-draws">Tüm çekilişleri temizle</button><button class="mini-btn" type="button" id="v75-analyze-draws">Haritayı analiz et</button><button class="mini-btn" type="button" id="v75-add-selected">Seçilenleri havuza ekle</button><button class="mini-btn" type="button" id="v75-add-top25">Önerilen 25'i havuza ekle</button><button class="mini-btn" type="button" id="v75-add-all-suggested">Tüm önerileri havuza ekle</button>`;
        const panel = document.createElement('div'); panel.className = 'v75-analysis-grid';
        panel.innerHTML = `<textarea id="v75-draw-analysis" class="elim-output" readonly placeholder="Son 15 çekilişi gir, sonra Haritayı analiz et."></textarea><div id="v75-draw-suggestions" class="v75-suggestion-box"><div class="v75-muted">Analiz bekleniyor.</div></div>`;
        const summary = $('v74-draw-summary');
        if (summary && summary.parentNode) summary.parentNode.insertBefore(actions, summary.nextSibling); else body.appendChild(actions);
        body.appendChild(panel);
        $('v75-clear-all-draws').addEventListener('click', () => { saveDraws(Array.from({ length: DRAW_N }, () => [])); for (let i = 0; i < DRAW_N; i++) { const inp = $('v74-draw-input-' + i); if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); } } const area = $('v75-draw-analysis'); if (area) area.value = ''; const box = $('v75-draw-suggestions'); if (box) box.innerHTML = '<div class="v75-muted">Analiz bekleniyor.</div>'; v75Selected.clear(); v75Suggestions = []; });
        $('v75-analyze-draws').addEventListener('click', analyzeDraws);
        $('v75-add-selected').addEventListener('click', () => addToPool([...v75Selected]));
        $('v75-add-top25').addEventListener('click', () => { if (!v75Suggestions.length) analyzeDraws(); addToPool(v75Suggestions.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10))); });
        $('v75-add-all-suggested').addEventListener('click', () => { if (!v75Suggestions.length) analyzeDraws(); addToPool(v75Suggestions); });
        $('v75-draw-suggestions').addEventListener('click', e => { const chip = e.target.closest('.v75-map-chip'); if (!chip) return; const n = +chip.dataset.n; v75Selected.has(n) ? v75Selected.delete(n) : v75Selected.add(n); chip.classList.toggle('selected', v75Selected.has(n)); });
      }
      function updateToolbarMainOpen() {
        const bar = document.querySelector('.v55-topbar'); if (!bar || bar.dataset.v75Patched === '1') return; bar.dataset.v75Patched = '1';
        bar.addEventListener('click', function (e) { const btn = e.target.closest('[data-action="main-open"]'); if (!btn) return; setTimeout(() => { document.querySelectorAll('.card').forEach(c => { const t = titleOf(c).toLowerCase(); const keep = ['sayı havuzu', 'çekiliş haritası', 'temel parametre', 'genel üretim', 'dağılım ve sayısal', 'konumsal fark', 'paketli üretim']; setCollapsed(c, !keep.some(k => t.includes(k))); }); }, 0); }, true);
      }
      function finish() {
        document.title = 'Kolon Prompt Builder v7.5 - Tek Çekiliş Haritası';
        const ver = document.querySelector('.badge-ver'); if (ver) ver.textContent = 'v7.5';
        const sub = document.querySelector('.app-sub'); if (sub) sub.textContent = 'Covering Design · Tek Çekiliş Haritası · Kontrollü Sekme Toparlama';
        removeDuplicateDrawMap();
        groupRuleCards();
        hideOldSimilarityCard();
        enhanceDrawCard();
        document.querySelectorAll('.card').forEach(ensureCollapsible);
        updateToolbarMainOpen();
        const draw = $('v74-draw-card'); if (draw) setCollapsed(draw, false);
        const dist = $('v75-distribution-card'); if (dist) setCollapsed(dist, false);
        const pos = $('v75-positional-card'); if (pos) setCollapsed(pos, true);
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(finish, 80)); else setTimeout(finish, 80);
    })();
  