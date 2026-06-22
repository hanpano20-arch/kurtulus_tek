
    const PR = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
    let pool = [];
    const bannedPairs = new Set(); // "a,b" formatında (a<b)
    let currentPairFilter = 'all';
    let pairSearchVal = '';
    let lastAnalysisData = null;

    const adjDiffs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const vertDiffs = [10, 20, 30, 40, 50, 60, 70, 80]; // 6/60 modunda +10..+50 aktif gösterilir
    const adjState = { 1: 'serbest', 2: 'serbest', 3: 'serbest', 4: 'serbest', 5: 'serbest', 6: 'serbest', 7: 'serbest', 8: 'serbest', 9: 'serbest' };
    const vertState = { 10: 'serbest', 20: 'serbest', 30: 'serbest', 40: 'serbest', 50: 'serbest', 60: 'serbest', 70: 'serbest', 80: 'serbest' };
    const arithState = {};
    const arithTouched = new Set(); // kullanıcı bilinçli dokunduysa çakışma kontrolünde dikkate alınır

    function gameMax() { return parseInt(document.getElementById('p-game')?.value) || 90; }
    function gameName() { return '6/' + gameMax(); }
    function regionSplit() { return gameMax() / 2; }
    function lowRegionLabel() { return '1–' + regionSplit(); }
    function highRegionLabel() { return (regionSplit() + 1) + '–' + gameMax(); }
    function tableRegionLabels() {
      const max = gameMax(), arr = [];
      for (let a = 1; a <= max; a += 10) { arr.push(a + '–' + Math.min(a + 9, max)); }
      return arr;
    }
    function activeVertDiffs() {
      const max = gameMax();
      return vertDiffs.filter(d => d < max);
    }
    function updateGameLabels() {
      const max = gameMax();
      const gl = document.getElementById('game-lbl'); if (gl) gl.textContent = '6/' + max + ' · sayı aralığı 1–' + max;
      const sLow = document.getElementById('s-low'); if (sLow && sLow.nextElementSibling) sLow.nextElementSibling.textContent = lowRegionLabel();
      const sHigh = document.getElementById('s-high'); if (sHigh && sHigh.nextElementSibling) sHigh.nextElementSibling.textContent = highRegionLabel();
      const legend = document.querySelector('.legend');
      if (legend) {
        const spans = legend.querySelectorAll(':scope > span');
        if (spans[3]) spans[3].lastChild.textContent = lowRegionLabel();
        if (spans[4]) spans[4].lastChild.textContent = highRegionLabel();
      }
    }
    function setGameType(value) {
      updateGameLabels();
      buildToggleRows(activeVertDiffs(), vertState, 'vert-rules');
      parsePool();
      updateQuotaStatus();
      // v7.15: oyun modu değişince çekiliş haritasını sıfırla
      try {
        // v74 haritası
        if (typeof renderDrawMap === 'function') renderDrawMap();
        // v75 analiz alanını temizle
        const area = document.getElementById('v75-draw-analysis');
        if (area) area.value = '';
        const box = document.getElementById('v75-draw-suggestions');
        if (box) box.innerHTML = '<div class="v75-muted">Oyun modu değişti (' + value + '). Yeniden analiz et.</div>';
        // Oyun modu toggle'ı senkronize et
        const r90 = document.getElementById('v714-game-90');
        const r60 = document.getElementById('v714-game-60');
        if (r90) r90.checked = (value === '90' || value === 90);
        if (r60) r60.checked = (value === '60' || value === 60);
        const st = document.getElementById('v714-game-status');
        if (st) st.textContent = 'Sayı aralığı: 1–' + value;
      } catch (e) { }
    }

    function buildToggleRows(diffs, states, cid) {
      const c = document.getElementById(cid); c.innerHTML = '';
      diffs.forEach(d => {
        const r = document.createElement('div'); r.className = 'row';
        r.innerHTML = `<div class="row-lbl" style="font-family:var(--font-mono);font-size:13px">+${d}</div>
    <div class="pill-grp">
      <span class="pill${states[d] === 'yasak' ? ' yasak' : ''}" onclick="setToggle('${cid}',${d},'yasak',this)">Yasak</span>
      <span class="pill${states[d] === 'serbest' ? ' serbest' : ''}" onclick="setToggle('${cid}',${d},'serbest',this)">Serbest</span>
    </div>`;
        c.appendChild(r);
      });
    }
    function setToggle(cid, diff, val, el) {
      const st = cid === 'adj-rules' ? adjState : vertState;
      st[diff] = val;
      el.parentElement.querySelectorAll('.pill').forEach(p => p.className = 'pill');
      el.className = 'pill ' + val;
    }

    function parsePool() {
      const raw = document.getElementById('poolInput').value;
      pool = [...new Set(raw.split(/[\s,;]+/).map(Number).filter(n => n > 0 && n <= gameMax()))].sort((a, b) => a - b);
      document.getElementById('pool-count').textContent = pool.length + ' sayı';
      // Havuz değişince geçersiz banned pairs temizle
      const toRemove = [];
      bannedPairs.forEach(p => {
        const [a, b] = p.split(',').map(Number);
        if (!pool.includes(a) || !pool.includes(b)) toRemove.push(p);
      });
      toRemove.forEach(p => bannedPairs.delete(p));
      updateStats(); renderTags(); buildArithTable(); renderPairGrid(); updateBannedSummary(); lastAnalysisData = null; renderElimReport();
    }

    function updateStats() {
      const odd = pool.filter(n => n % 2 !== 0).length;
      const prime = pool.filter(n => PR.has(n)).length;
      const low = pool.filter(n => n <= regionSplit()).length;
      document.getElementById('s-total').textContent = pool.length;
      document.getElementById('s-odd').textContent = odd;
      document.getElementById('s-even').textContent = pool.length - odd;
      document.getElementById('s-prime').textContent = prime;
      document.getElementById('s-low').textContent = low;
      document.getElementById('s-high').textContent = pool.length - low;
    }
    function updateEven() {
      const k = parseInt(document.getElementById('p-k').value) || 6;
      const o = parseInt(document.getElementById('p-odd').value) || 0;
      document.getElementById('even-lbl').textContent = '→ ' + (k - o) + ' çift';
    }
    function renderTags() {
      const area = document.getElementById('tagArea'); area.innerHTML = '';
      pool.forEach(n => {
        const odd = n % 2 !== 0, prime = PR.has(n), low = n <= regionSplit();
        let cls = 'tag';
        if (prime) cls += ' t-prime'; else if (odd) cls += ' t-odd'; else cls += ' t-even';
        cls += low ? ' r-low' : ' r-high';
        const t = document.createElement('span');
        t.className = cls; t.textContent = n + (prime ? ' ★' : '');
        t.title = (prime ? 'Asal · ' : '') + (odd ? 'Tek' : 'Çift') + ' · ' + (low ? lowRegionLabel() : highRegionLabel());
        area.appendChild(t);
      });
    }

    // ─── ÇİFT GRID ───
    function getAllPairs() {
      const pairs = [];
      for (let i = 0; i < pool.length; i++)
        for (let j = i + 1; j < pool.length; j++)
          pairs.push([pool[i], pool[j]]);
      return pairs;
    }
    function pairKey(a, b) { return a < b ? a + ',' + b : b + ',' + a; }

    function setPairFilter(f, el) {
      currentPairFilter = f;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      renderPairGrid();
    }
    function filterPairs() {
      pairSearchVal = document.getElementById('pair-search').value.trim();
      renderPairGrid();
    }

    function renderPairGrid() {
      const grid = document.getElementById('pair-grid');
      if (pool.length < 2) { grid.innerHTML = '<div style="font-size:12px;color:var(--color-text-secondary)">En az 2 sayı girin.</div>'; return; }
      let pairs = getAllPairs();

      // Filtre
      if (currentPairFilter === 'banned') pairs = pairs.filter(([a, b]) => bannedPairs.has(pairKey(a, b)));
      else if (currentPairFilter === 'diff4') pairs = pairs.filter(([a, b]) => b - a <= 4);
      else if (currentPairFilter === 'diff10') pairs = pairs.filter(([a, b]) => [10, 20, 30].includes(b - a));
      else if (currentPairFilter === 'same_dec') pairs = pairs.filter(([a, b]) => sayisalTabloBolgesi(a) === sayisalTabloBolgesi(b));

      // Arama
      if (pairSearchVal) {
        const v = parseInt(pairSearchVal);
        if (!isNaN(v)) pairs = pairs.filter(([a, b]) => a === v || b === v);
      }

      if (!pairs.length) { grid.innerHTML = '<div style="font-size:12px;color:var(--color-text-secondary);padding:8px 0">Eşleşen çift yok.</div>'; return; }

      grid.innerHTML = pairs.map(([a, b]) => {
        const k = pairKey(a, b);
        const banned = bannedPairs.has(k);
        const diff = b - a;
        return `<div class="pair-chip${banned ? ' banned' : ''}" onclick="togglePair('${k}')">
      <span>${a}–${b}</span>
      <span class="pair-diff">Δ${diff}</span>
    </div>`;
      }).join('');
    }

    function togglePair(key) {
      if (bannedPairs.has(key)) bannedPairs.delete(key);
      else bannedPairs.add(key);
      renderPairGrid();
      updateBannedSummary();
    }

    function updateBannedSummary() {
      const s = document.getElementById('banned-summary');
      if (!bannedPairs.size) { s.innerHTML = '<span style="color:var(--color-text-secondary)">Yasaklı çift seçilmedi.</span>'; return; }
      const tags = [...bannedPairs].sort().map(k => {
        const [a, b] = k.split(',');
        return `<span class="banned-tag">{${a},${b}}<span class="rm" onclick="removeBanned('${k}')">×</span></span>`;
      }).join('');
      s.innerHTML = `<div style="margin-bottom:4px;font-size:11px;color:var(--color-text-secondary)">${bannedPairs.size} çift yasaklandı:</div>` + tags;
    }
    function removeBanned(key) {
      bannedPairs.delete(key);
      renderPairGrid();
      updateBannedSummary();
    }

    // ─── ARİTMETİK DİZİ ───
    function buildArithTable() {
      const area = document.getElementById('arith-area');
      if (pool.length < 2) { area.innerHTML = '<div style="font-size:12px;color:var(--color-text-secondary);padding:8px 0">En az 2 sayı girin.</div>'; return; }
      const poolSet = new Set(pool);
      const found = {};
      for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          const step = pool[j] - pool[i];
          if (step < 1 || step > 30) continue;
          if (!found[step]) found[step] = { pairs: [], triples: [] };
          found[step].pairs.push([pool[i], pool[j]]);
          if (poolSet.has(pool[j] + step)) found[step].triples.push([pool[i], pool[j], pool[j] + step]);
        }
      }
      const steps = Object.keys(found).map(Number).filter(s => found[s].pairs.length > 0).sort((a, b) => a - b);
      if (!steps.length) { area.innerHTML = '<div style="font-size:12px;color:var(--color-text-secondary)">Anlamlı dizi bulunamadı.</div>'; return; }
      let html = `<table class="arith-table"><thead><tr><th style="text-align:left">Adım</th><th>2'li zincir</th><th>3'lü zincir</th></tr></thead><tbody>`;
      steps.forEach(s => {
        const p2 = found[s].pairs.length, p3 = found[s].triples.length;
        const k2 = 'arith_' + s + '_2', k3 = 'arith_' + s + '_3';
        if (!arithState[k2]) arithState[k2] = 'serbest';
        if (!arithState[k3]) arithState[k3] = 'serbest';
        const ex2 = found[s].pairs[0] ? found[s].pairs[0].join('→') : '—';
        const ex3 = found[s].triples[0] ? found[s].triples[0].join('→') : '—';
        html += `<tr>
      <td>+${s}<br><span style="font-size:10px;color:var(--color-text-secondary)">${p2}çift/${p3}üçlü</span></td>
      <td><div style="font-size:10px;color:var(--color-text-secondary);margin-bottom:3px">${ex2}</div>
        <div style="display:flex;gap:3px;justify-content:center">
          <span class="pill-sm${arithState[k2] === 'yasak' ? ' yasak' : ''}" onclick="setArith('${k2}','yasak',this)">Yasak</span>
          <span class="pill-sm${arithState[k2] === 'serbest' ? ' serbest' : ''}" onclick="setArith('${k2}','serbest',this)">Serbest</span>
        </div></td>
      <td>${p3 > 0 ? `<div style="font-size:10px;color:var(--color-text-secondary);margin-bottom:3px">${ex3}</div>
        <div style="display:flex;gap:3px;justify-content:center">
          <span class="pill-sm${arithState[k3] === 'yasak' ? ' yasak' : ''}" onclick="setArith('${k3}','yasak',this)">Yasak</span>
          <span class="pill-sm${arithState[k3] === 'serbest' ? ' serbest' : ''}" onclick="setArith('${k3}','serbest',this)">Serbest</span>
        </div>`: '<span style="font-size:10px;color:var(--color-text-tertiary)">—</span>'}</td>
    </tr>`;
      });
      html += '</tbody></table>';
      area.innerHTML = html;
    }
    function setArith(key, val, el) {
      arithState[key] = val;
      arithTouched.add(key);
      el.parentElement.querySelectorAll('.pill-sm').forEach(p => p.className = 'pill-sm');
      el.className = 'pill-sm ' + val;
    }

    // ─── KURAL KONTROL ───

    function getPackageParams() {
      const getBool = id => !!document.getElementById(id)?.checked;
      const getNum = (id, def) => parseFloat(document.getElementById(id)?.value) || def;
      return {
        active: getBool('p-pack-active'),
        main: { name: 'Ana dengeli paket', cols: getNum('p-pack-main-cols', 40), t: getNum('p-pack-main-t', 4), jaccard: getNum('p-pack-main-j', 0.60), maxCommon: getNum('p-pack-main-c', 4), outMax: getNum('p-pack-main-out', 40), purpose: '2–3–4 bilen istikrarı ve geniş t=4 kapsama' },
        deep: { name: 't=5 destek paketi', cols: getNum('p-pack-deep-cols', 12), t: getNum('p-pack-deep-t', 5), jaccard: getNum('p-pack-deep-j', 0.75), maxCommon: getNum('p-pack-deep-c', 5), outMax: getNum('p-pack-deep-out', 45), purpose: '5 bilen yaklaşımı için çekirdek yoğunlaşma' },
        risk: { name: 'Kontrollü risk paketi', cols: getNum('p-pack-risk-cols', 8), t: getNum('p-pack-risk-t', 3), jaccard: getNum('p-pack-risk-j', 0.75), maxCommon: getNum('p-pack-risk-c', 5), outMax: getNum('p-pack-risk-out', 55), purpose: 'ana paketin kaçırabileceği ama kabul edilebilir riskli dizilimlere küçük pay' }
      };
    }

    function packageTotal(pkg) { return (pkg.main?.cols || 0) + (pkg.deep?.cols || 0) + (pkg.risk?.cols || 0); }

    function getParams() {
      return {
        k: parseInt(document.getElementById('p-k').value) || 6,
        sumMin: parseInt(document.getElementById('p-summin').value) || 220,
        sumMax: parseInt(document.getElementById('p-summax').value) || 265,
        oddCnt: parseInt(document.getElementById('p-odd').value) || 1,
        primeMin: parseInt(document.getElementById('p-primemin').value) || 0,
        primeMax: parseInt(document.getElementById('p-primemax').value) || 1,
        low: parseInt(document.getElementById('p-low').value) || 3,
        high: parseInt(document.getElementById('p-high').value) || 3,
        dec: parseInt(document.getElementById('p-dec').value) || 2,
        freqMax: parseInt(document.getElementById('p-freqmax').value) || 36,
        freqMin: parseInt(document.getElementById('p-freqmin').value) || 2,
        cols: parseInt(document.getElementById('p-cols').value) || 60,
        jaccard: parseFloat(document.getElementById('p-jaccard').value) || 0.6,
        maxCommon: parseInt(document.getElementById('p-maxcommon').value) || 4,
        packages: getPackageParams(),
        hMode: 'neighbor',
        vMode: 'neighbor',
      };
    }

    function checkCombo(combo, p) {
      const s = combo.slice().sort((a, b) => a - b);
      const sum = s.reduce((a, b) => a + b, 0);
      if (sum < p.sumMin || sum > p.sumMax) return false;
      if (s.filter(n => n % 2 !== 0).length !== p.oddCnt) return false;
      const pc = s.filter(n => PR.has(n)).length;
      if (pc < p.primeMin || pc > p.primeMax) return false;
      if (s.filter(n => n <= 45).length !== p.low) return false;
      if (s.filter(n => n > 45).length !== p.high) return false;
      const dec = {};
      for (const n of s) { const d = Math.floor(n / 10); dec[d] = (dec[d] || 0) + 1; if (dec[d] > p.dec) return false; }
      const sset = new Set(s);
      for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j < s.length; j++) {
          const d = s[j] - s[i];
          if (adjState[d] === 'yasak') return false;
          if (vertState[d] === 'yasak') return false;
          // Özel çift yasağı
          if (bannedPairs.has(pairKey(s[i], s[j]))) return false;
        }
        for (let step = 1; step <= 30; step++) {
          const k2 = 'arith_' + step + '_2', k3 = 'arith_' + step + '_3';
          if (arithState[k2] === 'yasak' && sset.has(s[i] + step)) return false;
          if (arithState[k3] === 'yasak' && sset.has(s[i] + step) && sset.has(s[i] + step * 2)) return false;
        }
      }
      return true;
    }


    // ─── UÇ KOLON SKORU ───
    function getOutlierParams() {
      const getBool = id => !!document.getElementById(id)?.checked;
      const getNum = (id, def) => parseFloat(document.getElementById(id)?.value) || def;
      return {
        active: getBool('p-out-active'),
        maxScore: getNum('p-out-max', 40),
        centerActive: getBool('p-out-center'),
        unitActive: getBool('p-out-unit-active'),
        unitMax: getNum('p-out-unitmax', 2),
        gapActive: getBool('p-out-gap-active'),
        largeGap: getNum('p-out-largegap', 20),
        maxLarge: getNum('p-out-maxlarge', 2),
        mechActive: getBool('p-out-mech-active'),
        repeatMax: getNum('p-out-repeatmax', 2)
      };
    }

    function countArithmeticTriples(s) {
      const set = new Set(s); let cnt = 0;
      for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j < s.length; j++) {
          const step = s[j] - s[i];
          if (set.has(s[j] + step)) cnt++;
        }
      }
      return cnt;
    }

    function outlierScore(combo, p, o) {
      const s = combo.slice().sort((a, b) => a - b);
      const reasons = [];
      let score = 0;
      const sum = s.reduce((a, b) => a + b, 0);
      if (o.centerActive && p.sumMax > p.sumMin) {
        const center = (p.sumMin + p.sumMax) / 2;
        const half = (p.sumMax - p.sumMin) / 2;
        const dist = Math.abs(sum - center) / Math.max(1, half);
        if (dist >= 0.90) { score += 20; reasons.push('toplam sınırına çok yakın'); }
        else if (dist >= 0.75) { score += 12; reasons.push('toplam merkeze uzak'); }
        else if (dist >= 0.60) { score += 6; reasons.push('toplam hafif uçta'); }
      }
      if (o.unitActive) {
        const units = {};
        s.forEach(n => { const u = n % 10; units[u] = (units[u] || 0) + 1; });
        const maxUnit = Math.max(...Object.values(units));
        if (maxUnit > o.unitMax) { score += (maxUnit - o.unitMax) * 12; reasons.push('aynı birler basamağı fazla'); }
      }
      const gaps = [];
      for (let i = 1; i < s.length; i++)gaps.push(s[i] - s[i - 1]);
      if (o.gapActive) {
        const largeCount = gaps.filter(g => g >= o.largeGap).length;
        const closeAllowed = gaps.filter(g => g === 4 || g === 5).length;
        const span = s[s.length - 1] - s[0];
        if (largeCount > o.maxLarge) { score += (largeCount - o.maxLarge) * 10; reasons.push('büyük sıçrama fazla'); }
        if (closeAllowed > 2) { score += (closeAllowed - 2) * 6; reasons.push('4/5 yakın fark tekrarı fazla'); }
        if (span < 25) { score += 10; reasons.push('kolon çok sıkışık'); }
        if (span > 78) { score += 8; reasons.push('kolon çok dağınık'); }
      }
      if (o.mechActive) {
        const diffCount = {};
        for (let i = 0; i < s.length; i++) {
          for (let j = i + 1; j < s.length; j++) {
            const d = s[j] - s[i];
            diffCount[d] = (diffCount[d] || 0) + 1;
          }
        }
        const vals = Object.values(diffCount);
        const maxRepeat = vals.length ? Math.max(...vals) : 0;
        if (maxRepeat > o.repeatMax) { score += (maxRepeat - o.repeatMax) * 10; reasons.push('aynı fark tekrarı fazla'); }
        const triples = countArithmeticTriples(s);
        if (triples > 0) { score += Math.min(24, triples * 8); reasons.push('aritmetik üçlü içeriyor'); }
        const verticalPairs = Object.entries(diffCount).filter(([d, c]) => Number(d) % 10 === 0 && Number(d) > 0).reduce((a, [, c]) => a + c, 0);
        if (verticalPairs > 2) { score += (verticalPairs - 2) * 6; reasons.push('dikey ilişki yoğun'); }
      }
      score = Math.min(100, Math.round(score));
      return { score, reasons: [...new Set(reasons)] };
    }

    function summarizeOutlierReasons(scored) {
      const m = {};
      scored.forEach(x => x.reasons.forEach(r => m[r] = (m[r] || 0) + 1));
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }

    function comb(arr, k) {
      const res = [];
      function bt(s, cur) { if (cur.length === k) { res.push([...cur]); return } for (let i = s; i < arr.length; i++) { cur.push(arr[i]); bt(i + 1, cur); cur.pop(); } }
      bt(0, []); return res;
    }


    function maxCommonAllowedByJaccard(k, j) {
      return Math.floor((2 * k * j) / (1 + j) + 1e-9);
    }

    function getRuleWarnings(p) {
      const warns = [];

      // Temel parametre uyumları
      if (p.sumMin > p.sumMax) warns.push({ type: 'red', msg: 'Toplam min, toplam max değerinden büyük. Üretim durmalı.' });
      if (p.low + p.high !== p.k) warns.push({ type: 'red', msg: `Bölge toplamı k ile uyumsuz: düşük(${p.low}) + yüksek(${p.high}) ≠ k(${p.k}).` });
      if (p.oddCnt < 0 || p.oddCnt > p.k) warns.push({ type: 'red', msg: `Tek sayı adedi k sınırının dışında: ${p.oddCnt}.` });
      if (p.primeMin > p.primeMax) warns.push({ type: 'red', msg: `Asal minimum (${p.primeMin}), asal maksimumdan (${p.primeMax}) büyük.` });
      if (pool.filter(n => n % 2 !== 0).length < p.oddCnt) warns.push({ type: 'red', msg: 'Havuzdaki tek sayı adedi, istenen tek sayı adedinden az.' });
      if (pool.filter(n => n % 2 === 0).length < p.k - p.oddCnt) warns.push({ type: 'red', msg: 'Havuzdaki çift sayı adedi, istenen çift sayı adedinden az.' });
      if (pool.filter(n => n <= 45).length < p.low) warns.push({ type: 'red', msg: 'Havuzdaki 1–45 sayı adedi, istenen düşük bölge adedinden az.' });
      if (pool.filter(n => n > 45).length < p.high) warns.push({ type: 'red', msg: 'Havuzdaki 46–90 sayı adedi, istenen yüksek bölge adedinden az.' });
      if (pool.filter(n => PR.has(n)).length < p.primeMin) warns.push({ type: 'red', msg: 'Havuzdaki asal sayı adedi, minimum asal kuralını karşılamıyor.' });

      // Jaccard ve ortak sayı matematiksel uyumu
      const allowed = maxCommonAllowedByJaccard(p.k, p.jaccard);
      if (p.maxCommon > allowed) {
        warns.push({ type: 'red', msg: `Jaccard ${p.jaccard} ile max ortak ${p.maxCommon} uyumsuz. Bu Jaccard sınırında fiili max ortak ${allowed} olur.` });
      }


      // Paketli üretim tutarlılık kontrolü
      if (p.packages && p.packages.active) {
        const pt = packageTotal(p.packages);
        if (pt !== p.cols) {
          warns.push({ type: 'red', msg: `Paket kolon toplamı hedefle uyumsuz: paket toplamı ${pt}, hedef kolon ${p.cols}.` });
        }
        ['main', 'deep', 'risk'].forEach(key => {
          const pk = p.packages[key];
          if (!pk || pk.cols <= 0) return;
          const allow = maxCommonAllowedByJaccard(p.k, pk.jaccard);
          if (pk.maxCommon > allow) {
            warns.push({ type: 'red', msg: `${pk.name}: Jaccard ${pk.jaccard} ile max ortak ${pk.maxCommon} uyumsuz. Fiili max ortak ${allow} olur.` });
          }
          if (pk.t > p.k) {
            warns.push({ type: 'red', msg: `${pk.name}: t seviyesi (${pk.t}) kolon boyutundan (${p.k}) büyük olamaz.` });
          }
        });
      }

      // Frekans için basit kapasite kontrolü. Bu tek başına yeterli değildir ama erken uyarı verir.
      const need = p.cols * p.k;
      if (need > pool.length * p.freqMax) {
        warns.push({ type: 'red', msg: `Frekans max kapasitesi yetersiz: ${p.cols}×${p.k}=${need} kullanım gerekiyor, havuz×freqMax=${pool.length * p.freqMax}.` });
      }
      if (need < pool.length * p.freqMin) {
        warns.push({ type: 'red', msg: `Frekans min zorunluluğu fazla yüksek: toplam kullanım ${need}, gereken minimum ${pool.length * p.freqMin}.` });
      }

      // Aynı farkın iki yerde farklı niyetle işaretlenmesi
      for (let d = 1; d <= gameMax(); d++) {
        const globalState = adjState[d] || vertState[d] || null;
        const k2 = 'arith_' + d + '_2', k3 = 'arith_' + d + '_3';
        const ar2 = arithState[k2];
        const ar3 = arithState[k3];
        if (globalState && arithTouched.has(k2) && ar2 && globalState !== ar2) {
          warns.push({ type: 'red', msg: `Kural çakışması: Fark +${d} genel kuralda ${globalState.toUpperCase()}, aritmetik 2'li kuralda ${ar2.toUpperCase()}.` });
        }
        if (ar2 === 'yasak' && ar3 === 'serbest') {
          warns.push({ type: 'amber', msg: `Mantıksal uyarı: Adım +${d} için 2'li YASAK ama 3'lü SERBEST. 2'li yasaksa o 3'lü zaten oluşamaz.` });
        }
      }

      return warns;
    }

    function getBlockingWarnings(p) {
      return getRuleWarnings(p).filter(w => w.type === 'red');
    }


    // ─── ELEME RAPORU ───
    function fmtCombo(c) { return c.slice().sort((a, b) => a - b).join('\t'); }
    function csvEscape(v) { const s = String(v ?? ''); return '"' + s.replace(/"/g, '""') + '"'; }
    function reasonSummary(list, topN = 8) {
      const m = {};
      list.forEach(x => (x.reasons || []).forEach(r => m[r] = (m[r] || 0) + 1));
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, topN);
    }
    function getElimBaseList() {
      if (!lastAnalysisData) return [];
      const mode = document.getElementById('elim-mode')?.value || 'rejected';
      if (mode === 'rejected') return lastAnalysisData.rejected || [];
      if (mode === 'passed_risky') return (lastAnalysisData.passed || []).slice().sort((a, b) => b.score - a.score);
      if (mode === 'passed_best') return (lastAnalysisData.passed || []).slice().sort((a, b) => a.score - b.score);
      return (lastAnalysisData.scored || []).slice().sort((a, b) => b.score - a.score);
    }
    function getFilteredElimList() {
      const q = (document.getElementById('elim-search')?.value || '').trim().toLowerCase();
      let list = getElimBaseList();
      if (q) {
        list = list.filter(x => {
          const combo = (x.combo || []).join(' ');
          const reasons = (x.reasons || []).join(' ').toLowerCase();
          return combo.includes(q) || reasons.includes(q);
        });
      }
      return list;
    }
    function renderElimReport() {
      const out = document.getElementById('elim-output');
      if (!out) return;
      if (!lastAnalysisData) {
        out.value = 'Önce Analiz Et butonuna bas. Sonra elenen kolonlar burada görünecek.';
        ['elim-count', 'elim-total', 'elim-topreason'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });
        const r = document.getElementById('elim-reasons'); if (r) r.innerHTML = '';
        return;
      }
      const limit = Math.max(1, parseInt(document.getElementById('elim-limit')?.value) || 200);
      const base = getElimBaseList();
      const filtered = getFilteredElimList();
      const shown = filtered.slice(0, limit);
      const mode = document.getElementById('elim-mode')?.value || 'rejected';
      const title = {
        rejected: 'UÇ SKORUYLA ELENEN KOLONLAR',
        passed_risky: 'SKORDAN GEÇEN AMA RİSKLİ KALANLAR',
        passed_best: 'SKORDAN GEÇEN EN DENGELİ KOLONLAR',
        all_scored: 'TÜM GEÇERLİ ADAYLARIN SKOR TABLOSU'
      }[mode] || 'ELEME RAPORU';
      const reasonStats = reasonSummary(base, 8);
      const topReason = reasonStats[0] ? reasonStats[0][0] : '—';
      document.getElementById('elim-count').textContent = shown.length.toLocaleString();
      document.getElementById('elim-total').textContent = base.length.toLocaleString();
      document.getElementById('elim-topreason').textContent = topReason.length > 12 ? topReason.slice(0, 12) + '…' : topReason;
      const reasonBox = document.getElementById('elim-reasons');
      if (reasonBox) {
        reasonBox.innerHTML = reasonStats.length
          ? reasonStats.map(([r, c], i) => '<span class="reason-chip ' + (i < 3 ? 'strong' : '') + '">' + r + ': ' + c + '</span>').join('')
          : '<span class="reason-chip">Neden yok</span>';
      }
      const header = [
        title,
        'Toplam ilgili aday: ' + base.length,
        'Arama sonrası: ' + filtered.length,
        'Gösterilen: ' + shown.length,
        'Format: Kolon | Skor | Neden',
        ''.padEnd(80, '─')
      ];
      const rows = shown.map((x, i) => {
        const reasons = (x.reasons && x.reasons.length) ? x.reasons.join(', ') : 'neden yok';
        return String(i + 1).padStart(4, '0') + ' | ' + fmtCombo(x.combo) + ' | skor=' + String(x.score).padStart(3, ' ') + ' | ' + reasons;
      });
      out.value = header.concat(rows).join('\n') || 'Liste boş.';
    }
    function copyElimReport() {
      const out = document.getElementById('elim-output');
      if (!out) return;
      navigator.clipboard.writeText(out.value || '').then(() => alert('Eleme raporu kopyalandı.')).catch(() => { out.select(); document.execCommand('copy'); });
    }
    function downloadElimCsv() {
      if (!lastAnalysisData) { alert('Önce Analiz Et butonuna bas.'); return; }
      const list = getFilteredElimList();
      const mode = document.getElementById('elim-mode')?.value || 'rejected';
      const lines = ['mode;index;kolon;skor;nedenler'];
      list.forEach((x, i) => {
        lines.push([csvEscape(mode), i + 1, csvEscape((x.combo || []).join(' ')), x.score, csvEscape((x.reasons || []).join(', '))].join(';'));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eleme_raporu.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    // ─── JACCARD / BENZERLİK ÜRETİLEBİLİRLİK KONTROLÜ ───
    function commonCount(a, b) {
      let i = 0, j = 0, c = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { c++; i++; j++; }
        else if (a[i] < b[j]) i++;
        else j++;
      }
      return c;
    }

    function comboSum(c) { return c.reduce((a, b) => a + b, 0); }

    function similarityOk(a, b, p) {
      const com = commonCount(a, b);
      if (com > p.maxCommon) return false;
      const jac = com / (p.k * 2 - com);
      return jac <= p.jaccard + 1e-9;
    }

    function selectedSimilarityStats(selected, p) {
      let maxCommon = 0, maxJ = 0;
      for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
          const com = commonCount(selected[i].combo, selected[j].combo);
          const jac = com / (p.k * 2 - com);
          if (com > maxCommon) maxCommon = com;
          if (jac > maxJ) maxJ = jac;
        }
      }
      return { maxCommon, maxJ };
    }

    function deterministicHash(n, seed) {
      let x = (n + 1) * 1103515245 + (seed + 17) * 12345;
      x = (x >>> 0);
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      return (x >>> 0) / 4294967295;
    }

    function trySimilarityOrder(items, p) {
      const selected = [];
      const usageCount = {};  // v7.14: sayı bazlı kullanım sayacı
      const freqCap = p.freqMax || 60;
      // v7.14: havuzun en küçük 2 ve en büyük 2 sayısını düşük öncelikli say
      const sortedPool = [...(pool || [])].sort((a, b) => a - b);
      const edgeNums = new Set([
        ...sortedPool.slice(0, 2),
        ...sortedPool.slice(-2)
      ]);
      outer:
      for (const it of items) {
        // freqMax hard cap: bu kolondaki herhangi bir sayı sınırı doldurduysa atla
        for (const n of it.combo) {
          if ((usageCount[n] || 0) >= freqCap) continue outer;
        }
        for (const s of selected) {
          if (!similarityOk(it.combo, s.combo, p)) continue outer;
        }
        // v7.14: edge sayıların kullanımı freqCap'ın %60'ını geçtiyse bu kolonu
        // sona bırak (bucket'ta başka seçenek yoksa alınır, tam yasak değil)
        const edgeOverload = it.combo.some(n => edgeNums.has(n) && (usageCount[n] || 0) >= (freqCap * 0.6));
        if (edgeOverload && selected.length < p.cols * 0.85) {
          continue; // ilk %85 dolana kadar edge-ağırlıklı kolonları atla
        }
        selected.push(it);
        it.combo.forEach(n => { usageCount[n] = (usageCount[n] || 0) + 1; });
        if (selected.length >= p.cols) break;
      }
      // Eğer edge kısıtı yüzünden hedef dolmadıysa kısıtsız tur yap
      if (selected.length < p.cols) {
        outer2:
        for (const it of items) {
          if (selected.includes(it)) continue;
          for (const n of it.combo) {
            if ((usageCount[n] || 0) >= freqCap) continue outer2;
          }
          for (const s of selected) {
            if (!similarityOk(it.combo, s.combo, p)) continue outer2;
          }
          selected.push(it);
          it.combo.forEach(n => { usageCount[n] = (usageCount[n] || 0) + 1; });
          if (selected.length >= p.cols) break;
        }
      }
      return selected;
    }

    function jaccardFeasibilityCheck(scoredItems, p) {
      const items = scoredItems.map((x, idx) => ({
        combo: x.combo.slice().sort((a, b) => a - b),
        score: x.score || 0,
        idx,
        sum: comboSum(x.combo),
        reasons: x.reasons || []
      }));
      const target = p.cols;
      if (!items.length) {
        return { bestCount: 0, target, ok: false, selected: [], trials: [], status: 'Aday yok' };
      }

      const freq = {}; pool.forEach(n => freq[n] = 0);
      items.forEach(it => it.combo.forEach(n => freq[n] = (freq[n] || 0) + 1));
      items.forEach(it => {
        it.rarity = it.combo.reduce((a, n) => a + (1 / Math.max(1, freq[n])), 0);
        it.centerDist = Math.abs(it.sum - ((p.sumMin + p.sumMax) / 2));
      });

      const orders = [];
      orders.push(['uç skor düşük', items.slice().sort((a, b) => a.score - b.score || b.rarity - a.rarity)]);
      orders.push(['nadir sayı dengesi', items.slice().sort((a, b) => b.rarity - a.rarity || a.score - b.score)]);
      orders.push(['toplam merkeze yakın', items.slice().sort((a, b) => a.centerDist - b.centerDist || a.score - b.score)]);
      orders.push(['orijinal aday sırası', items.slice()]);
      orders.push(['toplam düşükten yükseğe', items.slice().sort((a, b) => a.sum - b.sum || a.score - b.score)]);
      orders.push(['toplam yüksekten düşüğe', items.slice().sort((a, b) => b.sum - a.sum || a.score - b.score)]);

      // Deterministik karışık denemeler: aynı veriyle aynı sonucu verir.
      for (let seed = 1; seed <= 18; seed++) {
        orders.push([`deterministik deneme ${seed}`, items.slice().sort((a, b) => {
          const ra = deterministicHash(a.idx, seed);
          const rb = deterministicHash(b.idx, seed);
          // Çok kötü uç skorları tamamen öne çıkmasın diye küçük skor avantajı eklenir.
          return (ra + a.score / 250) - (rb + b.score / 250);
        })]);
      }

      let best = [], bestName = '', trialRows = [];
      for (const [name, order] of orders) {
        const sel = trySimilarityOrder(order, p);
        trialRows.push({ name, count: sel.length });
        if (sel.length > best.length) { best = sel; bestName = name; }
        if (sel.length >= target) break;
      }

      const stats = selectedSimilarityStats(best, p);
      return {
        bestCount: best.length,
        target,
        ok: best.length >= target,
        selected: best,
        bestName,
        stats,
        trials: trialRows.sort((a, b) => b.count - a.count).slice(0, 8),
        status: best.length >= target ? 'Uygun' : 'Yetersiz'
      };
    }

    function formatComboPlain(c) { return c.join('\t'); }


    function suggestNextJaccardValue(currentJ) {
      const j = Number(currentJ) || 0.6;
      if (j <= 0.40) return Math.min(0.90, +(j + 0.10).toFixed(2));
      if (j <= 0.55) return Math.min(0.90, +(j + 0.10).toFixed(2));
      if (j <= 0.70) return Math.min(0.90, +(j + 0.05).toFixed(2));
      return Math.min(0.90, +(j + 0.05).toFixed(2));
    }
    function buildConstraintHint(validCount, afterOutlierCount, targetCount) {
      const hints = [];
      if (validCount < targetCount) {
        hints.push(`Kesin kurallardan sonra sadece ${validCount} aday kaldı. Önce temel kuralları esnet; Jaccard ayarı tek başına çözmez.`);
      } else if (validCount < targetCount * 3) {
        hints.push(`Kesin kurallardan geçen aday sayısı düşük (${validCount}). Sorun yalnızca Jaccard olmayabilir.`);
      }
      if (afterOutlierCount < targetCount) {
        hints.push(`Uç skor filtresinden sonra ${afterOutlierCount} aday kaldı. Uç skor limitini yükselt veya bazı uç kontrollerini gevşet.`);
      } else if (afterOutlierCount < targetCount * 2) {
        hints.push(`Uç skor filtresi sonrası aday sayısı sınırlı (${afterOutlierCount}). Skor limitini +5 artırmayı test et.`);
      }
      return hints;
    }
    function buildJaccardSuggestionReport(selectedCount, targetCount, jLimit, maxCommon, afterOutlierCount, validCount) {
      const ratio = targetCount > 0 ? selectedCount / targetCount : 0;
      const nextJ = suggestNextJaccardValue(jLimit);
      const bigNextJ = Math.min(0.90, +(jLimit + 0.15).toFixed(2));
      const suggestions = [];
      let level = 'UYGUN';
      let primaryAction = 'Mevcut ayarlarla devam edebilirsin.';

      if (ratio >= 1) {
        level = 'UYGUN';
        suggestions.push('Jaccard ve max ortak sayı kuralları bu ayarlarda üretimi engellemiyor.');
        suggestions.push('Mevcut ayarlarla devam edebilirsin.');
      } else if (ratio >= 0.85) {
        level = 'SINIRDA';
        primaryAction = `İlk test: Jaccard ${jLimit.toFixed(2)} → ${nextJ.toFixed(2)} yap.`;
        suggestions.push(primaryAction);
        if (maxCommon < 5) suggestions.push(`Hâlâ yetmezse max ortak sayı ${maxCommon} → ${maxCommon + 1} yap.`);
        suggestions.push('Önce tek değişiklik yap, tekrar Analiz Et. Sonra ikinci değişikliğe geç.');
      } else if (ratio >= 0.60) {
        level = 'SIKI';
        primaryAction = `İlk öneri: Jaccard ${jLimit.toFixed(2)} → ${nextJ.toFixed(2)} yap.`;
        suggestions.push(primaryAction);
        if (maxCommon < 5) suggestions.push(`İkinci öneri: max ortak sayı ${maxCommon} → ${maxCommon + 1} yap.`);
        suggestions.push('Uç kolon skor filtresi aktifse skor limitini +5 artırıp tekrar dene.');
        suggestions.push(`Hedefi test için geçici olarak ${targetCount} → ${Math.max(30, targetCount - 10)} indirip üretilebilirliği kontrol et.`);
      } else if (ratio >= 0.35) {
        level = 'ÇOK SIKI';
        primaryAction = `Jaccard belirgin sıkı. İlk deneme ${jLimit.toFixed(2)} → ${nextJ.toFixed(2)}, gerekirse ${bigNextJ.toFixed(2)} yap.`;
        suggestions.push(primaryAction);
        if (maxCommon < 5) suggestions.push(`Max ortak sayı değerini ${maxCommon} → ${Math.min(5, maxCommon + 1)} yap.`);
        suggestions.push('Toplam aralığı, tek/çift ve bölge kotası tek kalıba kilitlendiyse 1-2 alternatif kota daha aç.');
        suggestions.push('Özel çift yasakları, yatay/dikey komşu fark ve aritmetik yasakları birlikte sıkıştırıyor olabilir; en sert olanı gevşet.');
      } else {
        level = 'KRİTİK';
        primaryAction = `Mevcut ayarla 60 kolon pratikte çıkmıyor. Önce Jaccard ${jLimit.toFixed(2)} → ${Math.min(0.90, +(jLimit + 0.20).toFixed(2)).toFixed(2)} yap.`;
        suggestions.push(primaryAction);
        if (maxCommon < 5) suggestions.push(`Max ortak sayı ${maxCommon} → ${Math.min(5, maxCommon + 1)} yap.`);
        suggestions.push(`Kolon hedefini geçici test için ${targetCount} → ${Math.max(30, Math.floor(targetCount * 0.70))} indir.`);
        suggestions.push('Kesin kurallardan geçen aday sayısı da düşükse yatay/dikey/aritmetik yasakları ve özel çiftleri gevşetmeden Jaccard çözmez.');
        suggestions.push('Uç skor filtresi aktifse limitini +10 artır veya önce pasif test yap.');
      }

      const hints = buildConstraintHint(validCount || 0, afterOutlierCount || 0, targetCount || 0);
      return { level, ratio, nextJ, primaryAction, suggestions, hints };
    }
    function renderJaccardReport() {
      const out = document.getElementById('jacc-output');
      const targetEl = document.getElementById('jacc-target');
      const selectedEl = document.getElementById('jacc-selected');
      const statusEl = document.getElementById('jacc-status');
      if (!out || !lastAnalysisData || !lastAnalysisData.jaccardReport) {
        if (out) out.value = '';
        if (targetEl) targetEl.textContent = '—';
        if (selectedEl) selectedEl.textContent = '—';
        if (statusEl) statusEl.textContent = '—';
        return;
      }
      const r = lastAnalysisData.jaccardReport;
      const p = lastAnalysisData.params || getParams();
      const advice = lastAnalysisData.jaccardAdvice || buildJaccardSuggestionReport(r.bestCount, r.target, p.jaccard, p.maxCommon, lastAnalysisData.outValidCount || 0, lastAnalysisData.validCount || 0);
      if (targetEl) targetEl.textContent = r.target;
      if (selectedEl) selectedEl.textContent = r.bestCount;
      if (statusEl) statusEl.textContent = advice.level;

      const lines = [];
      lines.push('JACCARD ÜRETİLEBİLİRLİK RAPORU');
      lines.push('--------------------------------');
      lines.push(`Hedef kolon sayısı        : ${r.target}`);
      lines.push(`Seçilebilen kolon sayısı  : ${r.bestCount}`);
      lines.push(`Durum                     : ${advice.level}`);
      lines.push(`Seçim oranı               : %${(advice.ratio * 100).toFixed(1)}`);
      lines.push(`Mevcut Jaccard            : ${Number(p.jaccard).toFixed(2)}`);
      lines.push(`Mevcut max ortak sayı     : ${p.maxCommon}`);
      lines.push(`Kesin kurallardan geçen   : ${(lastAnalysisData.validCount || 0).toLocaleString()}`);
      lines.push(`Uç filtreden sonra aday   : ${(lastAnalysisData.outValidCount || 0).toLocaleString()}`);
      lines.push(`En iyi deneme             : ${r.bestName || '—'}`);
      lines.push(`Seçilenlerde max ortak    : ${r.stats ? r.stats.maxCommon : '—'}`);
      lines.push(`Seçilenlerde max Jaccard  : ${r.stats ? r.stats.maxJ.toFixed(3) : '—'}`);
      lines.push('');
      if (!r.ok) {
        lines.push('NET ÇÖZÜM ÖNERİSİ');
        lines.push('------------------');
        lines.push(`1. ${advice.primaryAction}`);
        (advice.suggestions || []).filter(s => s !== advice.primaryAction).forEach((s, i) => lines.push(`${i + 2}. ${s}`));
        if (advice.hints && advice.hints.length) {
          lines.push('');
          lines.push('EK TANI');
          lines.push('-------');
          advice.hints.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
        }
        lines.push('');
      } else {
        lines.push('SONUÇ');
        lines.push('-----');
        lines.push('Bu ayarla Jaccard/ortak sayı kontrolü üretimi engellemiyor.');
        lines.push('');
      }
      lines.push('Deneme sonuçları:');
      (r.trials || []).forEach(t => lines.push(`- ${t.name}: ${t.count}/${r.target}`));
      lines.push('');
      lines.push('İlk seçilebilir kolon örnekleri:');
      (r.selected || []).slice(0, 80).forEach((it, i) => lines.push(`${String(i + 1).padStart(3, '0')} | ${formatComboPlain(it.combo)}`));
      out.value = lines.join('\n');
    }

    function copyJaccardReport() {
      const out = document.getElementById('jacc-output');
      navigator.clipboard.writeText(out?.value || '').then(() => alert('Jaccard raporu kopyalandı.')).catch(() => { out.select(); document.execCommand('copy'); });
    }

    // ═══════════════════════════════════════════════════════════════
    // v7.13 — KURAL TEST PANELİ (runRuleTest)
    // ═══════════════════════════════════════════════════════════════
    window.runRuleTest = function () {
      const inp = document.getElementById('rtp-input');
      const res = document.getElementById('rtp-result');
      if (!inp || !res) return;
      const raw = inp.value.trim();
      if (!raw) { res.innerHTML = ''; return; }

      // Sayıları parse et
      const nums = raw.split(/[\s,;]+/).map(x => parseInt(x, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 90);
      if (!nums.length) { res.innerHTML = '<span style="color:var(--color-red,#e53)">Geçerli sayı girilemedi.</span>'; return; }

      const p = (typeof getParams === 'function') ? getParams() : {};
      const poolSet = new Set(pool || []);
      const sorted = [...new Set(nums)].sort((a, b) => a - b);

      let html = '';

      // Havuz kontrolü
      const inPool = sorted.filter(n => poolSet.has(n));
      const notInPool = sorted.filter(n => !poolSet.has(n));
      const poolColor = notInPool.length ? '#e53' : '#27ae60';
      html += `<div style="margin-bottom:8px;padding:8px;border-radius:6px;background:${notInPool.length ? 'rgba(229,83,51,.08)' : 'rgba(39,174,96,.08)'};border-left:3px solid ${poolColor};">`;
      html += `<b>Havuz Durumu:</b> ${sorted.map(n => poolSet.has(n) ? `<span style="color:#27ae60">${n}✓</span>` : `<span style="color:#e53">${n}✗</span>`).join(' ')}`;
      if (notInPool.length) html += `<br><span style="color:#e53">Havuzda olmayan: [${notInPool.join(', ')}]</span>`;
      html += '</div>';

      // Kupon koordinatları göster
      const coordInfo = sorted.map(n => {
        const c = { row: Math.floor((n - 1) / 10), col: (n - 1) % 10 };
        return `${n}→(satır${c.row + 1},sütun${c.col + 1})`;
      }).join('  ');
      html += `<div style="margin-bottom:8px;font-size:11px;color:var(--color-text-secondary)">9×10 Kupon Koordinatları: ${coordInfo}</div>`;

      // Çapraz zincir haritası — hangi sayılar aynı +9 veya +11 hattında?
      const diagInfo = [];
      for (const step of [9, 11]) {
        const visited = new Set();
        for (const n of sorted) {
          if (visited.has(n)) continue;
          // Bu sayının ait olduğu tam çapraz hattı bul (kupon içindeki tüm üyeler)
          let root = n;
          while (root - step >= 1) {
            const prev = root - step;
            const A = { row: Math.floor((root - 1) / 10), col: (root - 1) % 10 };
            const B = { row: Math.floor((prev - 1) / 10), col: (prev - 1) % 10 };
            const isD = B.row === A.row - 1 && ((step === 9 && B.col === A.col + 1) || (step === 11 && B.col === A.col - 1));
            if (isD) root = prev; else break;
          }
          const hat = [root];
          let cur = root;
          while (true) {
            const nxt = cur + step;
            const A = { row: Math.floor((cur - 1) / 10), col: (cur - 1) % 10 };
            const B = { row: Math.floor((nxt - 1) / 10), col: (nxt - 1) % 10 };
            const isD = nxt <= 90 && B.row === A.row + 1 && ((step === 9 && B.col === A.col - 1) || (step === 11 && B.col === A.col + 1));
            if (isD) { hat.push(nxt); cur = nxt; } else break;
          }
          hat.forEach(x => visited.add(x));
          const inCombo = hat.filter(x => sorted.includes(x));
          if (inCombo.length >= 2) {
            const th = (typeof diagonalThreshold === 'function') ? diagonalThreshold(step) : 0;
            const yasak = th >= 2 && inCombo.length >= th;
            diagInfo.push(`+${step} hattı: [${hat.join('→')}] — seçilenler: <b>${inCombo.join('-')}</b> (${inCombo.length} sayı) → <span style="color:${yasak ? '#e53' : '#27ae60'}">${yasak ? '❌ YASAK (eşik:' + th + 'li)' : '✅ Serbest'}</span>`);
          }
        }
      }
      if (diagInfo.length) {
        html += `<div style="margin-bottom:8px;padding:8px;border-radius:6px;background:rgba(120,80,200,.06);border-left:3px solid #7850c8;">`;
        html += `<b>Çapraz Hat Analizi:</b><br>${diagInfo.join('<br>')}`;
        html += '</div>';
      }

      // Sadece 2 sayı girildiyse kısmi test yapma uyarısı
      if (sorted.length < 2) {
        html += '<span style="color:var(--color-text-secondary)">En az 2 sayı gir.</span>';
        res.innerHTML = html; return;
      }

      // Kural testi
      const details = (typeof window.checkComboDetailed === 'function') ? window.checkComboDetailed(sorted, p) : null;
      if (!details) {
        html += '<span style="color:var(--color-text-secondary)">Önce Analiz Et butonuna bas (parametreler yüklensin).</span>';
        res.innerHTML = html; return;
      }

      html += '<div style="margin-top:4px;">';
      for (const d of details) {
        const color = d.engel ? '#e53' : '#27ae60';
        const bg = d.engel ? 'rgba(229,83,51,.07)' : 'rgba(39,174,96,.07)';
        html += `<div style="padding:7px 10px;border-radius:6px;background:${bg};border-left:3px solid ${color};margin-bottom:5px;">`;
        html += `<b style="color:${color}">${d.kural}</b><br>${d.detay}`;
        html += '</div>';
        if (d.engel) break; // İlk engeli bulduk, diğer kontrollere gerek yok
      }
      html += '</div>';

      res.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════════
    // v7.13 — BATCH SERİ ÇEKİM SİSTEMİ
    // ═══════════════════════════════════════════════════════════════
    window._batchState = { seriesNum: 0, excludeKeys: new Set(), lastBatch: [] };

    function _batchUpdateStatus(remaining) {
      const el = document.getElementById('batch-status');
      if (!el) return;
      const s = window._batchState;
      el.textContent = `Seri: ${s.seriesNum || '—'}  |  Dışlanan: ${s.excludeKeys.size} kolon  |  Havuzda kalan: ${remaining !== undefined ? remaining : '—'}`;
    }

    window.batchNextSeries = function () {
      const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
      const report = data && data.jaccardReport;
      if (!report || !Array.isArray(report.selected) || !report.selected.length) {
        alert('Önce Analiz Et butonuna bas. Jaccard raporu oluşmadan batch çekim yapılamaz.'); return;
      }
      const p = (data && data.params) || {};
      const target = Number(report.target || p.cols || 60) || 60;
      const s = window._batchState;

      // Tüm geçerli aday havuzunu al (jaccardReport.selected tüm geçerli adayları içeriyor)
      // Ama biz similarityPool'a ihtiyacımız var — lastAnalysisData.passed veya scored kullan
      const allCandidates = (data.passed || data.scored || []).map(x => ({
        combo: (x.combo || x).slice().sort((a, b) => a - b),
        score: x.score || 0,
        idx: x.idx || 0
      }));

      // Dışlama listesindeki kolonları çıkar
      const remaining = allCandidates.filter(item => {
        const key = item.combo.join('-');
        return !s.excludeKeys.has(key);
      });

      if (!remaining.length) {
        alert('Havuzda seçilebilecek kolon kalmadı. Dışlama listesini sıfırla.'); return;
      }

      // Jaccard greedy seçimi — round-robin bucket ile min/max çeşitliliği
      const selected = [];
      const maxC = p.maxCommon || 4;
      const jLimit = p.jaccard || 0.3;

      // Havuzdaki min sayıya göre 4 bucket'a böl (çeyrekler)
      const allMins = remaining.map(x => x.combo[0]);
      const minMin = Math.min(...allMins), maxMin = Math.max(...allMins);
      const step = (maxMin - minMin + 1) / 4 || 1;
      const buckets = [[], [], [], []];
      remaining.slice().sort((a, b) => a.score - b.score).forEach(item => {
        const bi = Math.min(3, Math.floor((item.combo[0] - minMin) / step));
        buckets[bi].push(item);
      });

      // Round-robin: her turda sıradaki bucket'tan uygun ilk kolonu al
      let bi = 0, attempts = 0, maxAttempts = remaining.length * 4;
      while (selected.length < target && attempts < maxAttempts) {
        attempts++;
        const bkt = buckets[bi % 4];
        bi++;
        if (!bkt.length) continue;
        // Bucket'tan uygun ilk adayı bul
        let found = -1;
        for (let i = 0; i < bkt.length; i++) {
          const item = bkt[i];
          const ok = selected.every(sel => {
            const inter = sel.combo.filter(x => item.combo.includes(x)).length;
            const union = 6 + 6 - inter;
            return inter <= maxC && (union ? inter / union : 0) <= jLimit;
          });
          if (ok) { found = i; break; }
        }
        if (found >= 0) { selected.push(bkt[found]); bkt.splice(found, 1); }
      }

      if (!selected.length) {
        alert('Mevcut Jaccard/max ortak kurallarıyla havuzdan yeni kolon seçilemiyor. Sıfırla veya kuralları gevşet.'); return;
      }

      // Bu serinin kolonlarını dışlama listesine ekle
      selected.forEach(item => s.excludeKeys.add(item.combo.join('-')));
      s.seriesNum++;
      s.lastBatch = selected;

      // Excel çıktısı
      const rows = selected.map(item => item.combo.join('\t'));
      const out = document.getElementById('batch-excel-output');
      if (out) out.value = rows.join('\n');

      _batchUpdateStatus(remaining.length - selected.length);
      alert(`Seri ${s.seriesNum}: ${selected.length} kolon seçildi. Havuzda kalan: ${remaining.length - selected.length} kolon.`);
    };

    window.batchCopyExcel = function () {
      const out = document.getElementById('batch-excel-output');
      const text = out ? out.value : '';
      if (!text) { alert('Önce Sonraki Seriyi Al butonuna bas.'); return; }
      const s = window._batchState;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert(`Seri ${s.seriesNum} Excel formatında kopyalandı.`));
      } else { if (out) { out.select(); document.execCommand('copy'); alert(`Seri ${s.seriesNum} kopyalandı.`); } }
    };

    window.batchReset = function () {
      if (!confirm('Tüm batch dışlama listesi sıfırlanacak. Emin misin?')) return;
      window._batchState = { seriesNum: 0, excludeKeys: new Set(), lastBatch: [] };
      const out = document.getElementById('batch-excel-output');
      if (out) out.value = '';
      _batchUpdateStatus(undefined);
    };

    // ═══════════════════════════════════════════════════════════════
    // v7.13 — t=3 KAPSAMA SKORU (Jaccard raporuna eklenir)
    // ═══════════════════════════════════════════════════════════════
    function computeT3Coverage(selected, poolArr) {
      if (!selected || selected.length < 1 || !poolArr || poolArr.length < 3) return null;
      // Tüm 3'lü kombinasyonları üret
      const triples = new Set();
      const covered = new Set();
      for (let i = 0; i < poolArr.length - 2; i++)
        for (let j = i + 1; j < poolArr.length - 1; j++)
          for (let k = j + 1; k < poolArr.length; k++)
            triples.add(poolArr[i] + ',' + poolArr[j] + ',' + poolArr[k]);
      // Seçilen kolonların kapladığı 3'lüleri bul
      for (const item of selected) {
        const c = (item.combo || item).slice().sort((a, b) => a - b);
        for (let i = 0; i < c.length - 2; i++)
          for (let j = i + 1; j < c.length - 1; j++)
            for (let k = j + 1; k < c.length; k++)
              covered.add(c[i] + ',' + c[j] + ',' + c[k]);
      }
      const total = triples.size;
      const cov = [...triples].filter(t => covered.has(t)).length;
      return { total, covered: cov, pct: total ? Math.round(cov / total * 100) : 0 };
    }

    // Jaccard raporuna kapsama satırı ekle — renderJaccardReport'u sarmala
    (function patchJaccardWithCoverage() {
      const origRender = window.renderJaccardReport;
      if (!origRender || origRender._v713CovPatched) return;
      window.renderJaccardReport = function () {
        const ret = origRender.apply(this, arguments);
        try {
          const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
          const report = data && data.jaccardReport;
          if (!report || !report.selected || !report.selected.length) return ret;
          const p = data.params || {};
          const target = Number(report.target || p.cols || 60);
          const sel = report.selected.slice(0, target);
          const poolArr = (pool || []).slice().sort((a, b) => a - b);
          const cov = computeT3Coverage(sel, poolArr);
          if (!cov) return ret;
          const out = document.getElementById('jacc-output');
          // v7.14: Kolon Fingerprint Çeşitlilik Skoru
          if (out && !out.value.includes('Fingerprint')) {
            const selCombos = sel.map(x => (x.combo || x).slice().sort((a, b) => a - b));
            const minNums = selCombos.map(c => c[0]);
            const maxNums = selCombos.map(c => c[c.length - 1]);
            const uniqMin = new Set(minNums).size;
            const uniqMax = new Set(maxNums).size;
            const minDist = minNums.reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
            const maxDist = maxNums.reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
            const topMin = Object.entries(minDist).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, c]) => `${n}(${c}x)`).join(', ');
            const topMax = Object.entries(maxDist).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, c]) => `${n}(${c}x)`).join(', ');
            const fpScore = Math.round((uniqMin + uniqMax) / 2);
            const fpGrade = fpScore >= 10 ? '✅ Mükemmel' : fpScore >= 6 ? '⚠️ Orta' : ' ❌ Zayıf';
            out.value += `\n────────────────────────────────────────\nFingerprint Çeşitlilik Skoru (v7.14)\n────────────────────────────────────────\n${fpGrade} Min çeşitliliği: ${uniqMin} farklı başlangıç sayısı — En sık: ${topMin}\n${fpGrade} Max çeşitliliği: ${uniqMax} farklı bitiş sayısı — En sık: ${topMax}\nNot: Düşük çeşitlilik → frekans max değerini düşür veya havuz min/max sayılarını çıkar.\n`;
          }
          if (out && !out.value.includes('t=3 Kapsama')) {
            const color = cov.pct >= 90 ? '✅' : cov.pct >= 70 ? '⚠️' : '❌';
            out.value += `\n────────────────────────────────────────\nt=3 Kapsama Skoru (v7.13)\n────────────────────────────────────────\n${color} ${cov.covered} / ${cov.total} üçlü kapsandı (%${cov.pct})\n• Havuzdaki ${poolArr.length} sayının tüm 3'lü kombinasyonları: ${cov.total}\n• Seçilen ${sel.length} kolon tarafından kapsanan: ${cov.covered}\n• %${cov.pct >= 90 ? '90+ mükemmel kapsama' : cov.pct >= 70 ? '70+ iyi kapsama' : cov.pct + ' — kurallar kısıtlıyor olabilir'}\n`;
          }
        } catch (e) { }
        return ret;
      };
      window.renderJaccardReport._v713CovPatched = true;
    })();

    function selectedFreqMaxInfoFromReport(report, p) {
      if (!report || !report.selected || !report.selected.length) return null;
      const target = p.cols || report.target || report.selected.length;
      const selected = report.selected.slice(0, target);
      const banko = new Set((p && p.bankoList) || []);
      const freq = {};
      selected.forEach(it => {
        const c = it.combo || it;
        (c || []).forEach(n => { if (!banko.has(n)) freq[n] = (freq[n] || 0) + 1; });
      });
      const entries = Object.entries(freq).map(([n, v]) => [Number(n), v]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      if (!entries.length) return null;
      const max = entries[0][1];
      const nums = entries.filter(([, v]) => v === max).map(([n]) => n);
      return { max, nums, entries, selectedCount: selected.length };
    }
    function addFreqMaxFeasibilityWarnings(warns, p, jaccardReport) {
      const banko = new Set((p && p.bankoList) || []);
      const activeSet = getActiveNumbersForFrequency(p);
      const activeNonBanko = [...activeSet].filter(n => !banko.has(n));
      const nonBankoNeed = (p.cols || 0) * Math.max(0, (p.k || 0) - banko.size);
      if (activeNonBanko.length) {
        const theoreticalMin = Math.ceil(nonBankoNeed / activeNonBanko.length);
        if (theoreticalMin > p.freqMax) {
          warns.push({ type: 'red', msg: `Frekans max kapasitesi yetersiz: bu aktif sayı havuzuyla ${p.cols} kolon için teorik minimum üst sınır en az ${theoreticalMin} olmalı. Sen ${p.freqMax} verdin.` });
        }
      }
      const info = selectedFreqMaxInfoFromReport(jaccardReport, p);
      if (info && info.selectedCount >= p.cols && info.max > p.freqMax) {
        warns.push({ type: 'red', msg: `Frekans max sınırı üretimi engelleyebilir: Jaccard seçilebilir 60 kolon denemesinde en yoğun sayı ${info.max} kez kullanılıyor (${info.nums.slice(0, 8).join(', ')}). Frekans maksimumu en az ${info.max} yap veya kuralları gevşet. Şu an: ${p.freqMax}.` });
      } else if (info && info.selectedCount >= p.cols && info.max >= Math.max(1, p.freqMax - 2)) {
        warns.push({ type: 'amber', msg: `Frekans max sınırı sınıra yakın: seçilebilir 60 kolon denemesinde en yüksek kullanım ${info.max}, mevcut max ${p.freqMax}.` });
      }
    }

    function mathCombCount(n, k) {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      if (k > n / 2) k = n - k;
      let res = 1;
      for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
      }
      return Math.round(res);
    }

    function getCombIterator(pool, k) {
      const n = pool.length;
      if (k > n || k <= 0) return null;
      const indices = [];
      for (let i = 0; i < k; i++) indices.push(i);
      let isDone = false;
      return {
        nextChunk(size) {
          const chunk = [];
          if (isDone) return { chunk, done: true };
          for (let c = 0; c < size; c++) {
            const combo = new Array(k);
            for (let i = 0; i < k; i++) {
              combo[i] = pool[indices[i]];
            }
            chunk.push(combo);
            let i;
            for (i = k - 1; i >= 0; i--) {
              if (indices[i] !== i + n - k) {
                break;
              }
            }
            if (i < 0) {
              isDone = true;
              break;
            }
            indices[i]++;
            for (let j = i + 1; j < k; j++) {
              indices[j] = indices[j - 1] + 1;
            }
          }
          return { chunk, done: isDone && chunk.length < size };
        }
      };
    }

    function runAnalysis() {
      const btn = document.getElementById('analyze-btn');
      btn.textContent = 'Hesaplanıyor...'; btn.disabled = true;
      setTimeout(() => {
        const p = getParams();
        if (pool.length < p.k) {
          document.getElementById('warn-list').innerHTML = '<div class="warn-item"><div class="warn-dot red"></div><div>Havuzda yeterli sayı yok.</div></div>';
          btn.textContent = 'Analiz Et ↗'; btn.disabled = false; return;
        }

        const totalCombos = mathCombCount(pool.length, p.k);
        const valid = [];
        const iter = getCombIterator(pool, p.k);

        let processed = 0;
        const chunkSize = 100000;

        function processChunk() {
          const { chunk, done } = iter.nextChunk(chunkSize);
          for (let i = 0; i < chunk.length; i++) {
            const c = chunk[i];
            if (checkCombo(c, p)) {
              valid.push(c);
            }
          }
          processed += chunk.length;

          if (done || processed >= totalCombos) {
            finishAnalysis(valid, totalCombos, p, btn);
            return;
          }

          const pct = Math.floor((processed / totalCombos) * 100);
          btn.textContent = `Hesaplanıyor... %${pct}`;
          setTimeout(processChunk, 0);
        }

        setTimeout(processChunk, 0);
      }, 30);
    }

    function finishAnalysis(valid, totalCombos, p, btn) {
      const validCount = valid.length;
      const ratio = (validCount / totalCombos * 100).toFixed(1);
      const out = getOutlierParams();
      const scored = valid.map(c => ({ combo: c, ...outlierScore(c, p, out) }));
      const outValid = out.active ? scored.filter(x => x.score <= out.maxScore).map(x => x.combo) : valid;
      const outRejected = out.active ? validCount - outValid.length : 0;
      const outAvg = scored.length ? (scored.reduce((a, x) => a + x.score, 0) / scored.length) : 0;
      const outBest = scored.length ? Math.min(...scored.map(x => x.score)) : 0;
      const outWorst = scored.length ? Math.max(...scored.map(x => x.score)) : 0;
      const effective = out.active ? outValid : valid;
      const activeNumbersForFreq = getActiveNumbersFromCombos(effective);
      p.activeNumbers = activeNumbersForFreq;
      const rejected = out.active ? scored.filter(x => x.score > out.maxScore).sort((a, b) => b.score - a.score) : [];
      const passed = out.active ? scored.filter(x => x.score <= out.maxScore).sort((a, b) => b.score - a.score) : scored.slice().sort((a, b) => b.score - a.score);
      const similarityPool = out.active ? scored.filter(x => x.score <= out.maxScore) : scored;
      const jaccardReport = jaccardFeasibilityCheck(similarityPool, p);
      const jaccardAdvice = buildJaccardSuggestionReport(jaccardReport.bestCount, p.cols, p.jaccard, p.maxCommon, outValid.length, validCount);
      lastAnalysisData = { scored, rejected, passed, validCount, outValidCount: outValid.length, outRejected, params: p, out, jaccardReport, jaccardAdvice };
      renderElimReport();
      renderJaccardReport();

      document.getElementById('sc-valid').textContent = validCount.toLocaleString();
      document.getElementById('sc-ratio').textContent = ratio + '%';
      document.getElementById('sc-outvalid').textContent = out.active ? outValid.length.toLocaleString() : 'Pasif';
      document.getElementById('sc-outavg').textContent = scored.length ? outAvg.toFixed(1) : '—';
      document.getElementById('sc-outrej').textContent = out.active ? outRejected.toLocaleString() : '—';
      document.getElementById('sc-jaccfit').textContent = jaccardReport.bestCount.toLocaleString() + '/' + p.cols;
      document.getElementById('sc-jaccstatus').textContent = jaccardReport.ok ? 'UYGUN' : jaccardAdvice.level;
      document.getElementById('sc-jaccmax').textContent = jaccardReport.stats ? (jaccardReport.stats.maxCommon + '/' + jaccardReport.stats.maxJ.toFixed(2)) : '—';
      document.getElementById('out-preview-count').textContent = out.active ? outValid.length.toLocaleString() : 'Pasif';
      document.getElementById('out-preview-best').textContent = scored.length ? outBest : '—';
      document.getElementById('out-preview-worst').textContent = scored.length ? outWorst : '—';

      const freq = {}; pool.forEach(n => freq[n] = 0);
      effective.forEach(c => c.forEach(n => freq[n]++));
      const activeFreqVals = [...activeNumbersForFreq].map(n => freq[n] || 0);
      const freqVals = activeFreqVals.length ? activeFreqVals : Object.values(freq);
      const maxFreq = Math.max(...freqVals) || 1;
      const minFreq = Math.min(...freqVals);
      const spreadRatio = (maxFreq / Math.max(1, minFreq)).toFixed(1);
      document.getElementById('sc-spread').textContent = spreadRatio + 'x';

      const lowThr = maxFreq * 0.30, highThr = maxFreq * 0.90;
      const primesInPool = pool.filter(n => PR.has(n));
      const isPrimeConstrained = p.primeMax <= 1 && primesInPool.length > 1;
      const warns = [];
      warns.push(...getRuleWarnings(p));
      const inactiveFreqNums = getInactiveNumbersForFrequency(p);
      if (inactiveFreqNums.length) {
        warns.push({ type: 'blue', msg: `Frekans min muafiyeti: aktif kurallarla hiç kullanılamayan ${inactiveFreqNums.length} sayı min frekans şartından muaf: ${inactiveFreqNums.join(', ')}.` });
      }

      if (validCount === 0) { warns.push({ type: 'red', msg: 'Geçerli kombinasyon YOK. Kurallar çok sıkı.' }); }
      else if (validCount < p.cols) { warns.push({ type: 'red', msg: `Geçerli kombinasyon (${validCount}) hedef kolon sayısından (${p.cols}) az.` }); }
      else if (out.active && outValid.length < p.cols) { warns.push({ type: 'red', msg: `Uç skor filtresinden sonra kalan aday (${outValid.length}) hedef kolon sayısından (${p.cols}) az. Skor limitini yükselt veya bazı uç kontrollerini gevşet.` }); }
      else if (out.active && outRejected / Math.max(1, validCount) > 0.60) { warns.push({ type: 'amber', msg: `Uç kolon filtresi adayların %${Math.round(outRejected / Math.max(1, validCount) * 100)} kadarını eliyor. Bu çok agresif olabilir.` }); }
      else if (validCount < p.cols * 2) { warns.push({ type: 'amber', msg: `Kombinasyon (${validCount}) yeterli ama çeşitlilik kısıtlı.` }); }
      else { warns.push({ type: 'green', msg: `${validCount.toLocaleString()} geçerli kombinasyon. ${p.cols} kolon için yeterli.` }); }
      if (out.active && scored.length) {
        const reasonStats = summarizeOutlierReasons(scored.filter(x => x.score > out.maxScore));
        if (reasonStats.length) { warns.push({ type: 'blue', msg: `Uç skorunda en sık görülen nedenler: ${reasonStats.map(([r, c]) => r + ' (' + c + ')').join(', ')}.` }); }
        warns.push({ type: 'purple', msg: `Uç kolon skoru aktif. Limit ${out.maxScore}; kalan aday ${outValid.length.toLocaleString()}, elenen ${outRejected.toLocaleString()}.` });
      }

      if (jaccardReport.bestCount >= p.cols) {
        warns.push({ type: 'green', msg: `Jaccard/ortak sayı üretilebilirlik kontrolü geçti: ${jaccardReport.bestCount}/${p.cols} kolon seçilebiliyor.` });
      } else {
        warns.push({ type: 'red', msg: `Jaccard/ortak sayı ${jaccardAdvice.level}: ${jaccardReport.bestCount}/${p.cols} kolonda kaldı. Çözüm: ${jaccardAdvice.primaryAction}` });
        (jaccardAdvice.hints || []).slice(0, 2).forEach(h => warns.push({ type: 'amber', msg: h }));
      }

      addFreqMaxFeasibilityWarnings(warns, p, jaccardReport);

      if (bannedPairs.size > 0) {
        warns.push({ type: 'purple', msg: `${bannedPairs.size} özel çift yasaklandı. Bu çiftler sadece o iki sayıya özel — adım bazlı kural değil.` });
      }
      if (isPrimeConstrained) {
        warns.push({ type: 'blue', msg: `Asal kısıtı aktif. [${primesInPool.join(', ')}] yapısal olarak az geçer — bu normaldir.` });
      }
      const realLow = pool.filter(n => activeNumbersForFreq.has(n) && freq[n] < lowThr && !(isPrimeConstrained && PR.has(n)));
      if (realLow.length > 0) warns.push({ type: 'amber', msg: `Düşük frekanslı aktif sayılar: ${realLow.map(n => n + '(' + freq[n] + ')').join(', ')}` });

      lastAnalysisData.analysisWarnings = warns;
      lastAnalysisData.analysisBlockers = warns.filter(w => w.type === 'red');

      document.getElementById('warn-list').innerHTML = warns.map(w =>
        `<div class="warn-item"><div class="warn-dot ${w.type}"></div><div>${w.msg}</div></div>`
      ).join('');

      const badge = document.getElementById('score-badge');
      const effCount = effective.length;
      if (validCount === 0) { badge.textContent = 'Kritik'; badge.className = 'score-badge score-bad'; }
      else if (effCount < p.cols) { badge.textContent = 'Yetersiz'; badge.className = 'score-badge score-bad'; }
      else if (jaccardReport.bestCount < p.cols) { badge.textContent = 'Jaccard: ' + jaccardAdvice.level; badge.className = 'score-badge score-bad'; }
      else if (effCount < p.cols * 2) { badge.textContent = 'Sıkı'; badge.className = 'score-badge score-warn'; }
      else { badge.textContent = 'Dengeli'; badge.className = 'score-badge score-ok'; }

      renderFreqBars(freq, maxFreq, lowThr, isPrimeConstrained, activeNumbersForFreq);
      btn.textContent = 'Analiz Et ↗'; btn.disabled = false;

      // Trigger post-analysis hooks immediately
      setTimeout(() => {
        try {
          if (typeof postAnalyzeFix === 'function') postAnalyzeFix();
        } catch (e) { }
        try {
          if (typeof renderControlPanel === 'function') renderControlPanel();
        } catch (e) { }
        try {
          if (window.renderJaccardReport) window.renderJaccardReport();
        } catch (e) { }
      }, 50);
    }

    function renderFreqBars(freq, maxFreq, lowThr, isPrimeConstrained, activeSet) {
      const area = document.getElementById('freq-area');
      let html = `<div class="freq-section"><div class="freq-section-title">Frekans dağılımı</div>
  <div style="display:flex;gap:16px;font-size:11px;color:var(--color-text-secondary);margin-bottom:8px;flex-wrap:wrap">
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#534AB7"></span>Normal</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#EF9F27"></span>Asal kısıtı</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#E24B4A"></span>Gerçek sorun</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#9AA0A6"></span>Pasif / min muaf</span>
  </div>`;
      pool.forEach(n => {
        const v = freq[n], pct = Math.round(v / maxFreq * 100);
        const isPrime = PR.has(n);
        const isInactive = activeSet instanceof Set ? !activeSet.has(n) : false;
        const isPrimeLow = !isInactive && isPrimeConstrained && isPrime && v < lowThr;
        const isRealLow = !isInactive && !isPrimeLow && v < lowThr;
        const barColor = isInactive ? '#9AA0A6' : isPrimeLow ? '#EF9F27' : isRealLow ? '#E24B4A' : '#534AB7';
        const flagText = isInactive ? 'min muaf' : isPrimeLow ? 'asal kısıtı' : isRealLow ? 'düşük ⚠' : '';
        const flagClass = isInactive ? 'flag-low-prime' : isPrimeLow ? 'flag-low-prime' : isRealLow ? 'flag-low-real' : 'flag-ok';
        html += `<div class="freq-row">
      <div class="freq-num">${n}</div>
      <div class="freq-badge ${isPrime ? 'fb-prime' : 'fb-normal'}">${isPrime ? '★' : ''}</div>
      <div class="freq-bar-bg"><div class="freq-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
      <div class="freq-val">${v}</div>
      <div class="freq-pct">${pct}%</div>
      <div class="freq-flag ${flagClass}">${flagText}</div>
    </div>`;
      });
      html += '</div>';
      area.innerHTML = html;
    }

    function buildPrompt() {
      const p = getParams();
      const banko = document.getElementById('p-banko').value.trim() || 'YOK';
      const jaccard = document.getElementById('p-jaccard').value;
      const maxCommon = document.getElementById('p-maxcommon').value;
      const out = getOutlierParams();
      const pkg = getPackageParams();
      const primes = pool.filter(n => PR.has(n));
      const lowPool = pool.filter(n => n <= 45);
      const highPool = pool.filter(n => n > 45);
      const adjLines = adjDiffs.map(d => `• Fark = ${d} → ${adjState[d].toUpperCase()}`).join('\n');
      const vertLines = activeVertDiffs().map(d => `• Fark = ${d} → ${vertState[d].toUpperCase()}`).join('\n');
      const arithEntries = Object.entries(arithState).filter(([, v]) => v === 'yasak');
      let arithLines = '• Tüm aritmetik diziler serbest';
      if (arithEntries.length) {
        const byStep = {};
        arithEntries.forEach(([key]) => { const [, step, len] = key.split('_'); if (!byStep[step]) byStep[step] = {}; byStep[step][len] = 'YASAK'; });
        arithLines = Object.entries(byStep).map(([step, rules]) => `• Adım +${step}: 2'li: ${rules['2'] || 'SERBEST'}, 3'lü: ${rules['3'] || 'SERBEST'}`).join('\n');
      }

      // Özel çift yasağı

      let packageLines = '• Paketli üretim modu: PASİF\n• Tüm kolonlar tek stratejiyle seçilecek.';
      if (pkg.active) {
        const totalPkg = packageTotal(pkg);
        packageLines = `• Paketli üretim modu: AKTİF
• Paket kolon toplamı: ${totalPkg} / ${p.cols}

1) ANA DENGELİ PAKET
• Kolon sayısı: ${pkg.main.cols}
• Hedef: ${pkg.main.purpose}
• Paket t seviyesi: ${pkg.main.t}
• Paket Jaccard üst sınırı: ${pkg.main.jaccard}
• Paket max ortak sayı: ${pkg.main.maxCommon}
• Paket uç skor limiti: ${pkg.main.outMax}
• Seçim önceliği: maksimum yeni ${pkg.main.t}'lü grup + düşük benzerlik + frekans dengesi

2) t=5 DESTEK / ÇEKİRDEK YOĞUNLAŞMA PAKETİ
• Kolon sayısı: ${pkg.deep.cols}
• Hedef: ${pkg.deep.purpose}
• Paket t seviyesi: ${pkg.deep.t}
• Paket Jaccard üst sınırı: ${pkg.deep.jaccard}
• Paket max ortak sayı: ${pkg.deep.maxCommon}
• Paket uç skor limiti: ${pkg.deep.outMax}
• Seçim önceliği: yeni 5'li grup kapsaması + sonuç adayı çekirdeklerde kontrollü yoğunlaşma

3) KONTROLLÜ RİSK PAKETİ
• Kolon sayısı: ${pkg.risk.cols}
• Hedef: ${pkg.risk.purpose}
• Paket t seviyesi: ${pkg.risk.t}
• Paket Jaccard üst sınırı: ${pkg.risk.jaccard}
• Paket max ortak sayı: ${pkg.risk.maxCommon}
• Paket uç skor limiti: ${pkg.risk.outMax}
• Seçim önceliği: ana paket dışında kalan ama kesin kurallardan geçen makul alternatif yapılar

PAKET KURALLARI:
• Tüm paketlerde kesin kurallar aynen uygulanacak.
• Aynı kolon iki pakette tekrar edilmeyecek.
• Paketler tamamlandıktan sonra 60 kolonun tamamı birlikte frekans, Jaccard ve max ortak sayı son kontrolünden geçirilecek.
• Paket adı, satır numarası veya açıklama çıktıya yazılmayacak; çıktı sadece sayılardan oluşacak.`;
      }

      let pairLines = '• Özel çift yasağı yok';
      if (bannedPairs.size > 0) {
        const pairs = [...bannedPairs].sort().map(k => `{${k.replace(',', '–')}}`);
        pairLines = `• Aşağıdaki sayı çiftleri aynı kolonda KESİNLİKLE bulunamaz:\n` +
          pairs.map(p => `  ${p} → sadece bu iki sayıya özel yasak, fark bazlı kural değildir`).join('\n');
      }

      return `KONU: Gelişmiş Sayı Analizi, Covering Design ve Optimizasyon ile Kolon Üretimi

ROLÜN:
Bir veri bilimci, kombinatorik uzmanı ve olasılık analisti gibi davran.
Bu rastgele üretim DEĞİLDİR. Tüm kurallar %100 uygulanacaktır.

════════════════════════════════════════
1. GİRDİLER
════════════════════════════════════════
• Oyun tipi                 : ${gameName()}
• Sayı Havuzu (v=${pool.length})   : [${pool.join(', ')}]
• Kolon Boyutu (k)         : ${p.k}
• Hedef Tutma Seviyesi (t) : ${document.getElementById('p-t').value}
• Üretilecek Kolon Sayısı  : ${p.cols}
• Banko Sayılar            : ${banko}
  → Asal sayılar  : [${primes.join(', ')}]
  → ${lowRegionLabel()} grubu    : [${lowPool.join(', ')}]
  → ${highRegionLabel()} grubu   : [${highPool.join(', ')}]

════════════════════════════════════════
2. KESİN KURALLAR
════════════════════════════════════════
• Toplam Aralığı   : ${p.sumMin} ≤ toplam ≤ ${p.sumMax}
• Tek/Çift Oranı   : Tam olarak ${p.oddCnt} tek, ${p.k - p.oddCnt} çift
• Asal Sayı Limiti : Minimum ${p.primeMin}, Maksimum ${p.primeMax} asal

════════════════════════════════════════
3. BÖLGE KURALLARI
════════════════════════════════════════
• 1–45 aralığından  : Tam olarak ${p.low} sayı
• 46–90 aralığından : Tam olarak ${p.high} sayı

════════════════════════════════════════
4. BASAMAK FİLTRESİ
════════════════════════════════════════
• Aynı onlar basamağı : Kolonda maksimum ${p.dec} adet

════════════════════════════════════════
5. KOLON İÇİ ARDIŞIK YASAĞI (TÜM ÇİFTLER)
════════════════════════════════════════
${adjLines}
Kontrol tipi: ${p.hMode === 'neighbor' ? 'Sadece aynı Sayısal Tablo Bölgesi içinde arka arkaya gelen seçili sayılar kontrol edilecek.' : 'Farkı X olan tüm sayı çiftleri kontrol edilecek.'}
Örnek: 4-6-8 varsa komşu modda 4-6 ve 6-8 kontrol edilir; 4-8 ayrıca kontrol edilmez.

════════════════════════════════════════
6. KOLON İÇİ DİKEY İLİŞKİ (TÜM ÇİFTLER)
════════════════════════════════════════
${vertLines}
Kontrol tipi: ${p.vMode === 'neighbor' ? 'Sadece aynı dikey hatta arka arkaya gelen seçili sayılar kontrol edilecek.' : 'Farkı X olan tüm sayı çiftleri kontrol edilecek.'}
Örnek: 10-30-50 varsa komşu modda 10-30 ve 30-50 kontrol edilir; 10-50 ayrıca kontrol edilmez.

════════════════════════════════════════
7. ÖZEL ÇİFT YASAĞI (SADECE BELİRTİLEN ÇİFTLER)
════════════════════════════════════════
${pairLines}
ÖNEMLI NOT: Bu bölümdeki yasaklar SADECE belirtilen iki sayıya özgüdür.
Fark değeri aynı olsa bile diğer sayı çiftleri bu kuraldan ETKİLENMEZ.
Örn: {10–20} yasak ise → 38 ve 48 (fark=10) aynı kolonda BULUNABİLİR.

════════════════════════════════════════
8. ARİTMETİK DİZİ FİLTRESİ (TÜM ZİNCİRLER)
════════════════════════════════════════
${arithLines}
NOT: Bu kural aynı adımla giden TÜM zincirleri etkiler.

════════════════════════════════════════
9. FREKANS DENGESİ
════════════════════════════════════════
• Her sayı minimum ${p.freqMin}, maksimum ${p.freqMax} kolona girecek

════════════════════════════════════════
10. KOLONLAR ARASI BENZERLİK
════════════════════════════════════════
• Jaccar
• Kolonlar arası max ortak sayı : ${maxCommon}d üst sınırı            : ${jaccard}

════════════════════════════════════════
11. UÇ KOLON KONTROLÜ
════════════════════════════════════════
• Uç kolon skor filtresi : ${out.active ? 'AKTİF' : 'PASİF'}
• Maksimum uç skor       : ${out.maxScore}
• Toplam merkez skoru    : ${out.centerActive ? 'AKTİF' : 'PASİF'}
• Aynı birler kontrolü   : ${out.unitActive ? 'AKTİF' : 'PASİF'} · maksimum ${out.unitMax} adet
• Gap kontrolü           : ${out.gapActive ? 'AKTİF' : 'PASİF'} · büyük sıçrama eşiği ≥ ${out.largeGap}, maksimum ${out.maxLarge} adet
• Mekanik kolon kontrolü : ${out.mechActive ? 'AKTİF' : 'PASİF'} · aynı fark tekrarı maksimum ${out.repeatMax}
NOT: Uç skor limiti aşan aday kolonlar seçime alınmayacak. Bu bölüm mekanik, aşırı sıkışık veya aşırı dağınık kolonları azaltmak içindir.

════════════════════════════════════════
12. PAKETLİ ÜRETİM STRATEJİSİ
════════════════════════════════════════
${packageLines}

════════════════════════════════════════
13. MATEMATİKSEL MODEL
════════════════════════════════════════
• Covering Design: C(v=${pool.length}, k=${p.k}, t=${document.getElementById('p-t').value})
• Algoritma: Paketli Greedy — önce kesin kurallar, sonra paket hedefleri uygulanır
• Ana mantık: t=4 ana kapsama + t=5 destek/çekirdek + kontrollü risk paketi
• Öncelik: Kesin kurallar → uç skor filtresi → paket seçimi → kapsama optimizasyonu → frekans/Jaccard dengesi

════════════════════════════════════════
14. ÜRETİM ÖNCESİ KONTROL
════════════════════════════════════════
[ ] Toplam ${p.sumMin}–${p.sumMax} arasında mı?
[ ] Tam ${p.oddCnt} tek, ${p.k - p.oddCnt} çift mi?
[ ] Asal sayı ${p.primeMin}–${p.primeMax} aralığında mı?
[ ] ${lowRegionLabel()}'ten ${p.low}, ${highRegionLabel()}'dan ${p.high} sayı mı?
[ ] Yatay/dikey fark kuralları seçilen kontrol tipine göre geçiyor mu?
[ ] Özel yasaklı çiftler aynı kolonda yok mu?
[ ] Aynı onlar basamağı ≤ ${p.dec} mü?
[ ] Yasaklı aritmetik diziler yok mu?
[ ] Her sayı ${p.freqMin}–${p.freqMax} kolon aralığında mı?
[ ] Jaccard ≤ ${jaccard}, ortak sayı ≤ ${maxCommon} mü?
[ ] Uç kolon skoru ${out.active ? 'aktifse her kolon ≤ ' + out.maxScore + ' mi?' : 'pasif mi?'}
Tüm maddeler geçilmeden kolon kabul edilmeyecek.

════════════════════════════════════════
14. ÇIKTI FORMATI
════════════════════════════════════════
• Her satır: ${p.k} sayı, TAB ile ayrılmış
• Toplam ${p.cols} satır, kod bloğu içinde
• Sayılar küçükten büyüğe sıralı · Satır numarası ekleme`;
    }


    // ─── v5.0 KOTA PAKETLERİ OVERRIDE ───
    function sayisalTabloBolgesi(n) { return Math.ceil(n / 10); } // 1–10=1, 11–20=2, ..., 81–90=9
    function dikeyHatNo(n) { return ((n - 1) % 10) + 1; } // 1,11,21... aynı hat; 10,20,30... aynı hat
    function getSelectVal(id, def) { const el = document.getElementById(id); return el ? el.value : def; }
    function hasBannedNeighborDiff(s, states, mode, groupFn) {
      // v7.1 KESİN MANTIK: Aynı yatay/dikey hatta seçilen sayılar sıralanır;
      // yalnız arka arkaya gelen SEÇİLİ sayılar arasındaki fark kontrol edilir.
      // Arada başka seçili sayı varsa uçtaki iki sayı ayrıca kontrol edilmez.
      const groups = {};
      s.forEach(n => { const g = groupFn(n); if (!groups[g]) groups[g] = []; groups[g].push(n); });
      for (const arr of Object.values(groups)) {
        arr.sort((a, b) => a - b);
        for (let i = 0; i < arr.length - 1; i++) {
          const d = arr[i + 1] - arr[i];
          if (states[d] === 'yasak') return true;
        }
      }
      return false;
    }
    function getNumVal(id, def = 0) { const el = document.getElementById(id); const v = el ? parseFloat(el.value) : NaN; return isNaN(v) ? def : v; }
    function getIntVal(id, def = 0) { return Math.trunc(getNumVal(id, def)); }
    function getBankoList() {
      const raw = (document.getElementById('p-banko')?.value || '').trim();
      if (!raw || raw.toUpperCase() === 'YOK') return [];
      return [...new Set(raw.split(/[\s,;]+/).map(Number).filter(n => n > 0 && n <= gameMax()))].sort((a, b) => a - b);
    }
    function renderQuotaBodies() {
      const oddBody = document.getElementById('odd-quota-body');
      if (oddBody && !oddBody.dataset.done) {
        oddBody.innerHTML = '';
        for (let odd = 0; odd <= 6; odd++) {
          const even = 6 - odd, val = 0;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${odd}T / ${even}Ç</td><td><input class="count-in" type="number" id="p-oddq-${odd}" value="${val}" min="0" max="300" oninput="updateQuotaStatus()"></td>`;
          oddBody.appendChild(tr);
        }
        oddBody.dataset.done = '1';
      }
      const regBody = document.getElementById('region-quota-body');
      if (regBody && !regBody.dataset.done) {
        regBody.innerHTML = '';
        for (let low = 0; low <= 6; low++) {
          const high = 6 - low, val = 0;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${low}D / ${high}Y</td><td><input class="count-in" type="number" id="p-regq-${low}" value="${val}" min="0" max="300" oninput="updateQuotaStatus()"></td>`;
          regBody.appendChild(tr);
        }
        regBody.dataset.done = '1';
      }
    }
    function quotaTotal(list) { return list.reduce((a, q) => a + (q.count || 0), 0); }
    function getSumQuotas() {
      const out = [];
      for (let i = 1; i <= 4; i++) {
        const min = getIntVal(`p-sumq-${i}-min`, 0), max = getIntVal(`p-sumq-${i}-max`, 0), count = getIntVal(`p-sumq-${i}-count`, 0);
        if (count > 0) out.push({ idx: i, min, max, count, label: `${min}–${max}` });
      }
      return out;
    }
    function getOddQuotas() {
      const out = []; const k = getIntVal('p-k', 6);
      for (let odd = 0; odd <= k; odd++) { const count = getIntVal(`p-oddq-${odd}`, 0); if (count > 0) out.push({ odd, even: k - odd, count, label: `${odd}T/${k - odd}Ç` }); }
      return out;
    }
    function getRegionQuotas() {
      const out = []; const k = getIntVal('p-k', 6);
      for (let low = 0; low <= k; low++) { const count = getIntVal(`p-regq-${low}`, 0); if (count > 0) out.push({ low, high: k - low, count, label: `${low}D/${k - low}Y` }); }
      return out;
    }
    function setQuotaStatus(id, total, target) {
      const el = document.getElementById(id); if (!el) return;
      el.className = 'quota-status';
      if (total === target) { el.classList.add('ok'); el.textContent = `Toplam ${total}/${target} → UYGUN`; }
      else if (total < target) { el.classList.add('bad'); el.textContent = `Toplam ${total}/${target} → ${target - total} kolon eksik`; }
      else { el.classList.add('bad'); el.textContent = `Toplam ${total}/${target} → ${total - target} kolon fazla`; }
    }
    function updateQuotaStatus() {
      const target = getIntVal('p-cols', 60);
      setQuotaStatus('sumq-status', quotaTotal(getSumQuotas()), target);
      setQuotaStatus('oddq-status', quotaTotal(getOddQuotas()), target);
      setQuotaStatus('regionq-status', quotaTotal(getRegionQuotas()), target);
    }
    function updateEven() { updateQuotaStatus(); }

    function getParams() {
      renderQuotaBodies();
      const sumQuotas = getSumQuotas(), oddQuotas = getOddQuotas(), regionQuotas = getRegionQuotas();
      return {
        k: getIntVal('p-k', 6),
        sumMin: sumQuotas.length ? Math.min(...sumQuotas.map(q => q.min)) : 0,
        sumMax: sumQuotas.length ? Math.max(...sumQuotas.map(q => q.max)) : 999,
        sumQuotas, oddQuotas, regionQuotas,
        bankoList: getBankoList(),
        primeMin: getIntVal('p-primemin', 0), primeMax: getIntVal('p-primemax', 1),
        dec: getIntVal('p-dec', 2),
        freqMax: getIntVal('p-freqmax', 36), freqMin: getIntVal('p-freqmin', 2),
        cols: getIntVal('p-cols', 60),
        jaccard: getNumVal('p-jaccard', 0.6), maxCommon: getIntVal('p-maxcommon', 4),
        packages: getPackageParams(),
        hMode: 'neighbor',
        vMode: 'neighbor',
      };
    }
    function comboMatchesQuota(c, p) {
      const s = c.slice().sort((a, b) => a - b);
      const sum = s.reduce((a, b) => a + b, 0), odd = s.filter(n => n % 2 !== 0).length, low = s.filter(n => n <= regionSplit()).length;
      return p.sumQuotas.some(q => sum >= q.min && sum <= q.max) &&
        p.oddQuotas.some(q => odd === q.odd) &&
        p.regionQuotas.some(q => low === q.low);
    }
    function checkCombo(combo, p) {
      const s = combo.slice().sort((a, b) => a - b);
      if (p.bankoList && p.bankoList.length && !p.bankoList.every(n => s.includes(n))) return false;
      if (!comboMatchesQuota(s, p)) return false;
      const pc = s.filter(n => PR.has(n)).length;
      if (pc < p.primeMin || pc > p.primeMax) return false;
      const tab = {};
      for (const n of s) { const d = sayisalTabloBolgesi(n); tab[d] = (tab[d] || 0) + 1; if (tab[d] > p.dec) return false; }
      const sset = new Set(s);
      if (hasBannedNeighborDiff(s, adjState, p.hMode || 'neighbor', sayisalTabloBolgesi)) return false;
      if (hasBannedNeighborDiff(s, vertState, p.vMode || 'neighbor', dikeyHatNo)) return false;
      for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j < s.length; j++) {
          if (bannedPairs.has(pairKey(s[i], s[j]))) return false;
        }
        for (let step = 1; step <= 30; step++) {
          const k2 = 'arith_' + step + '_2', k3 = 'arith_' + step + '_3';
          if (arithState[k2] === 'yasak' && sset.has(s[i] + step)) return false;
          if (arithState[k3] === 'yasak' && sset.has(s[i] + step) && sset.has(s[i] + step * 2)) return false;
        }
      }
      return true;
    }

    function getActiveNumbersFromCombos(combos) {
      const active = new Set();
      (combos || []).forEach(c => c.forEach(n => active.add(n)));
      return active;
    }
    function getActiveNumbersForFrequency(p) {
      if (p && p.activeNumbers instanceof Set) return p.activeNumbers;
      // Analiz öncesi yaklaşık güvenli varsayım: banko olmayan havuz sayıları.
      const banko = new Set((p && p.bankoList) || []);
      return new Set(pool.filter(n => !banko.has(n)));
    }
    function getInactiveNumbersForFrequency(p) {
      const active = getActiveNumbersForFrequency(p);
      const banko = new Set((p && p.bankoList) || []);
      return pool.filter(n => !banko.has(n) && !active.has(n));
    }
    function getRuleWarnings(p) {
      const warns = [], target = p.cols;
      const st = quotaTotal(p.sumQuotas), ot = quotaTotal(p.oddQuotas), rt = quotaTotal(p.regionQuotas);
      if (st !== target) warns.push({ type: 'red', msg: `Toplam aralığı kota toplamı hedefle uyumsuz: ${st}/${target}.` });
      if (ot !== target) warns.push({ type: 'red', msg: `Tek/çift kota toplamı hedefle uyumsuz: ${ot}/${target}.` });
      if (rt !== target) warns.push({ type: 'red', msg: `Bölge kota toplamı hedefle uyumsuz: ${rt}/${target}.` });
      if (!p.sumQuotas.length) warns.push({ type: 'red', msg: 'En az bir toplam aralığı paketi tanımlanmalı.' });
      if (!p.oddQuotas.length) warns.push({ type: 'red', msg: 'En az bir tek/çift dağılımı tanımlanmalı.' });
      if (!p.regionQuotas.length) warns.push({ type: 'red', msg: 'En az bir bölge dağılımı tanımlanmalı.' });
      p.sumQuotas.forEach(q => { if (q.min > q.max) warns.push({ type: 'red', msg: `Toplam Paketi ${q.idx}: min (${q.min}) max değerinden (${q.max}) büyük.` }); });
      if (p.primeMin > p.primeMax) warns.push({ type: 'red', msg: `Asal minimum (${p.primeMin}), asal maksimumdan (${p.primeMax}) büyük.` });
      const oddAvail = pool.filter(n => n % 2 !== 0).length, evenAvail = pool.filter(n => n % 2 === 0).length;
      p.oddQuotas.forEach(q => { if (q.odd > oddAvail || q.even > evenAvail) warns.push({ type: 'red', msg: `${q.label} dağılımı havuzla mümkün değil. Havuzda tek ${oddAvail}, çift ${evenAvail}.` }); });
      const lowAvail = pool.filter(n => n <= regionSplit()).length, highAvail = pool.filter(n => n > regionSplit()).length;
      p.regionQuotas.forEach(q => { if (q.low > lowAvail || q.high > highAvail) warns.push({ type: 'red', msg: `${q.label} bölge dağılımı havuzla mümkün değil. Havuzda düşük ${lowAvail}, yüksek ${highAvail}.` }); });
      const primes = pool.filter(n => PR.has(n));
      if (primes.length < p.primeMin) warns.push({ type: 'red', msg: 'Havuzdaki asal sayı adedi minimum asal kuralını karşılamıyor.' });
      const banko = p.bankoList || [];
      if (banko.length) {
        const missing = banko.filter(n => !pool.includes(n));
        if (missing.length) warns.push({ type: 'red', msg: `Banko sayılar havuzda yok: ${missing.join(', ')}.` });
        if (banko.length > p.k) warns.push({ type: 'red', msg: `Banko sayısı (${banko.length}) kolon boyutundan (${p.k}) büyük olamaz.` });
        warns.push({ type: 'purple', msg: `Banko sayılar frekans üst sınırından muaf kabul edilir; her seçilen kolonda bulunur: ${banko.join(', ')}.` });
      }
      const allowed = maxCommonAllowedByJaccard(p.k, p.jaccard);
      if (p.maxCommon > allowed) warns.push({ type: 'red', msg: `Jaccard ${p.jaccard} ile max ortak ${p.maxCommon} uyumsuz. Bu Jaccard sınırında fiili max ortak ${allowed} olur.` });
      if (p.packages && p.packages.active) {
        const pt = packageTotal(p.packages);
        if (pt !== p.cols) warns.push({ type: 'red', msg: `Paket kolon toplamı hedefle uyumsuz: paket toplamı ${pt}, hedef kolon ${p.cols}.` });
        ['main', 'deep', 'risk'].forEach(key => { const pk = p.packages[key]; if (!pk || pk.cols <= 0) return; const allow = maxCommonAllowedByJaccard(p.k, pk.jaccard); if (pk.maxCommon > allow) warns.push({ type: 'red', msg: `${pk.name}: Jaccard ${pk.jaccard} ile max ortak ${pk.maxCommon} uyumsuz. Fiili max ortak ${allow} olur.` }); if (pk.t > p.k) warns.push({ type: 'red', msg: `${pk.name}: t seviyesi (${pk.t}) kolon boyutundan (${p.k}) büyük olamaz.` }); });
      }
      const activeForFreq = getActiveNumbersForFrequency(p);
      const activeNonBanko = [...activeForFreq].filter(n => !banko.includes(n));
      const nonBankoPool = activeNonBanko.length, nonBankoNeed = p.cols * Math.max(0, p.k - banko.length);
      if (nonBankoPool === 0 && nonBankoNeed > 0) warns.push({ type: 'red', msg: 'Frekans kontrolü: banko dışı kullanılabilir aktif sayı yok; bu kurallarla kolon üretilemez.' });
      if (nonBankoNeed > nonBankoPool * p.freqMax) warns.push({ type: 'red', msg: `Frekans max kapasitesi yetersiz: aktif banko dışı ${nonBankoNeed} kullanım gerekiyor, kapasite ${nonBankoPool * p.freqMax}. Pasif sayılar kapasite hesabına katılmaz.` });
      if (nonBankoNeed < nonBankoPool * p.freqMin) warns.push({ type: 'red', msg: `Frekans min zorunluluğu fazla yüksek: aktif banko dışı toplam kullanım ${nonBankoNeed}, gereken minimum ${nonBankoPool * p.freqMin}. Pasif/muaf sayılar hesaba katılmaz.` });
      for (let d = 1; d <= gameMax(); d++) {
        const globalState = adjState[d] || vertState[d] || null, k2 = 'arith_' + d + '_2', k3 = 'arith_' + d + '_3', ar2 = arithState[k2], ar3 = arithState[k3];
        if (globalState && arithTouched.has(k2) && ar2 && globalState !== ar2) warns.push({ type: 'red', msg: `Kural çakışması: Fark +${d} genel kuralda ${globalState.toUpperCase()}, aritmetik 2'li kuralda ${ar2.toUpperCase()}.` });
        if (ar2 === 'yasak' && ar3 === 'serbest') warns.push({ type: 'amber', msg: `Mantıksal uyarı: Adım +${d} için 2'li YASAK ama 3'lü SERBEST. 2'li yasaksa o 3'lü zaten oluşamaz.` });
      }
      return warns;
    }
    function getBlockingWarnings(p) { return getRuleWarnings(p).filter(w => w.type === 'red'); }
    function quotaLinesSum(p) { return p.sumQuotas.map(q => `• ${q.min}–${q.max} toplam aralığı: ${q.count} kolon`).join('\n') || '• Toplam paketi tanımlanmadı'; }
    function quotaLinesOdd(p) { return p.oddQuotas.map(q => `• ${q.odd} tek / ${q.even} çift: ${q.count} kolon`).join('\n') || '• Tek/çift kotası tanımlanmadı'; }
    function quotaLinesRegion(p) { return p.regionQuotas.map(q => `• ${lowRegionLabel()}: ${q.low} sayı / ${highRegionLabel()}: ${q.high} sayı: ${q.count} kolon`).join('\n') || '• Bölge kotası tanımlanmadı'; }
    function buildPrompt() {
      const p = getParams();
      const banko = (p.bankoList && p.bankoList.length) ? p.bankoList.join(', ') : 'YOK';
      const jaccard = document.getElementById('p-jaccard').value, maxCommon = document.getElementById('p-maxcommon').value;
      const out = getOutlierParams(), pkg = getPackageParams();
      const primes = pool.filter(n => PR.has(n)), lowPool = pool.filter(n => n <= regionSplit()), highPool = pool.filter(n => n > regionSplit());
      const adjLines = adjDiffs.map(d => `• Fark = ${d} → ${adjState[d].toUpperCase()}`).join('\n');
      const vertLines = activeVertDiffs().map(d => `• Fark = ${d} → ${vertState[d].toUpperCase()}`).join('\n');
      const arithEntries = Object.entries(arithState).filter(([, v]) => v === 'yasak');
      let arithLines = '• Tüm aritmetik diziler serbest';
      if (arithEntries.length) { const byStep = {}; arithEntries.forEach(([key]) => { const [, step, len] = key.split('_'); if (!byStep[step]) byStep[step] = {}; byStep[step][len] = 'YASAK'; }); arithLines = Object.entries(byStep).map(([step, rules]) => `• Adım +${step}: 2'li: ${rules['2'] || 'SERBEST'}, 3'lü: ${rules['3'] || 'SERBEST'}`).join('\n'); }
      let pairLines = '• Özel çift yasağı yok';
      if (bannedPairs.size > 0) { const pairs = [...bannedPairs].sort().map(k => `{${k.replace(',', '–')}}`); pairLines = `• Aşağıdaki sayı çiftleri aynı kolonda KESİNLİKLE bulunamaz:\n` + pairs.map(p => `  ${p} → sadece bu iki sayıya özel yasak, fark bazlı kural değildir`).join('\n'); }
      let packageLines = '• Paketli üretim modu: PASİF\n• Tüm kolonlar tek stratejiyle seçilecek.';
      if (pkg.active) { const totalPkg = packageTotal(pkg); packageLines = `• Paketli üretim modu: AKTİF\n• Paket kolon toplamı: ${totalPkg} / ${p.cols}\n\n1) ANA DENGELİ PAKET\n• Kolon sayısı: ${pkg.main.cols}\n• Hedef: ${pkg.main.purpose}\n• Paket t seviyesi: ${pkg.main.t}\n• Paket Jaccard üst sınırı: ${pkg.main.jaccard}\n• Paket max ortak sayı: ${pkg.main.maxCommon}\n• Paket uç skor limiti: ${pkg.main.outMax}\n\n2) t=5 DESTEK / ÇEKİRDEK YOĞUNLAŞMA PAKETİ\n• Kolon sayısı: ${pkg.deep.cols}\n• Hedef: ${pkg.deep.purpose}\n• Paket t seviyesi: ${pkg.deep.t}\n• Paket Jaccard üst sınırı: ${pkg.deep.jaccard}\n• Paket max ortak sayı: ${pkg.deep.maxCommon}\n• Paket uç skor limiti: ${pkg.deep.outMax}\n\n3) KONTROLLÜ RİSK PAKETİ\n• Kolon sayısı: ${pkg.risk.cols}\n• Hedef: ${pkg.risk.purpose}\n• Paket t seviyesi: ${pkg.risk.t}\n• Paket Jaccard üst sınırı: ${pkg.risk.jaccard}\n• Paket max ortak sayı: ${pkg.risk.maxCommon}\n• Paket uç skor limiti: ${pkg.risk.outMax}\n\nPAKET KURALLARI:\n• Tüm paketlerde kesin kurallar aynen uygulanacak.\n• Aynı kolon iki pakette tekrar edilmeyecek.\n• Paketler tamamlandıktan sonra 60 kolonun tamamı birlikte frekans, Jaccard ve max ortak sayı son kontrolünden geçirilecek.\n• Paket adı, satır numarası veya açıklama çıktıya yazılmayacak.`; }
      return `KONU: Gelişmiş Sayı Analizi, Covering Design ve Optimizasyon ile Kolon Üretimi

ROLÜN:
Bir veri bilimci, kombinatorik uzmanı ve olasılık analisti gibi davran.
Bu rastgele üretim DEĞİLDİR. Tüm kurallar %100 uygulanacaktır.

════════════════════════════════════════
1. GİRDİLER
════════════════════════════════════════
• Oyun tipi                 : ${gameName()}
• Sayı Havuzu (v=${pool.length})   : [${pool.join(', ')}]
• Kolon Boyutu (k)         : ${p.k}
• Hedef Tutma Seviyesi (t) : ${document.getElementById('p-t').value}
• Üretilecek Kolon Sayısı  : ${p.cols}
• Banko Sayılar            : ${banko}
  → Asal sayılar  : [${primes.join(', ')}]
  → ${lowRegionLabel()} grubu    : [${lowPool.join(', ')}]
  → ${highRegionLabel()} grubu   : [${highPool.join(', ')}]

════════════════════════════════════════
2. KESİN KURALLAR
════════════════════════════════════════
• Asal Sayı Limiti : Minimum ${p.primeMin}, Maksimum ${p.primeMax} asal
• Banko sayılar varsa her kolonda bulunacak ve frekans üst sınırından muaf kabul edilecek.

════════════════════════════════════════
3. TOPLAM ARALIĞI KOTA PAKETLERİ
════════════════════════════════════════
${quotaLinesSum(p)}
NOT: Toplam paketleri birbirinden bağımsızdır; aralıkların üst üste binmesi çakışma değildir.

════════════════════════════════════════
4. TEK / ÇİFT DAĞILIM KOTASI
════════════════════════════════════════
${quotaLinesOdd(p)}

════════════════════════════════════════
5. BÖLGE DAĞILIM KOTASI
════════════════════════════════════════
${quotaLinesRegion(p)}

════════════════════════════════════════
6. SAYISAL TABLO BÖLGESİ FİLTRESİ
════════════════════════════════════════
• Aynı Sayısal Tablo Bölgesi : Kolonda maksimum ${p.dec} adet
• Grup yapısı: ${tableRegionLabels().join(', ')}

════════════════════════════════════════
7. YATAY FARK KURALI
════════════════════════════════════════
${adjLines}
Kontrol tipi: ${p.hMode === 'neighbor' ? 'Sadece aynı Sayısal Tablo Bölgesi içinde arka arkaya gelen seçili sayılar kontrol edilecek.' : 'Farkı X olan tüm sayı çiftleri kontrol edilecek.'}
Örnek: 4-6-8 varsa komşu modda 4-6 ve 6-8 kontrol edilir; 4-8 ayrıca kontrol edilmez.

════════════════════════════════════════
8. DİKEY FARK KURALI
════════════════════════════════════════
${vertLines}
Kontrol tipi: ${p.vMode === 'neighbor' ? 'Sadece aynı dikey hatta arka arkaya gelen seçili sayılar kontrol edilecek.' : 'Farkı X olan tüm sayı çiftleri kontrol edilecek.'}
Örnek: 10-30-50 varsa komşu modda 10-30 ve 30-50 kontrol edilir; 10-50 ayrıca kontrol edilmez.

════════════════════════════════════════
9. ÖZEL ÇİFT YASAĞI (SADECE BELİRTİLEN ÇİFTLER)
════════════════════════════════════════
${pairLines}
ÖNEMLI NOT: Bu bölümdeki yasaklar SADECE belirtilen iki sayıya özgüdür.

════════════════════════════════════════
10. ARİTMETİK DİZİ FİLTRESİ (TÜM ZİNCİRLER)
════════════════════════════════════════
${arithLines}
NOT: Bu kural aynı adımla giden TÜM zincirleri etkiler.

════════════════════════════════════════
11. FREKANS DENGESİ
════════════════════════════════════════
• Banko olmayan ve aktif kurallara göre kullanılabilir her sayı minimum ${p.freqMin}, maksimum ${p.freqMax} kolona girecek
• Tek/çift, asal, bölge, kota veya kesin kurallar nedeniyle hiç kullanılamayan sayılar minimum frekans şartından muaftır.
• Banko sayılar frekans üst sınırından muaftır.

════════════════════════════════════════
12. KOLONLAR ARASI BENZERLİK
════════════════════════════════════════
• Jaccard üst sınırı            : ${jaccard}
• Kolonlar arası max ortak sayı : ${maxCommon}

════════════════════════════════════════
13. UÇ KOLON KONTROLÜ
════════════════════════════════════════
• Uç kolon skor filtresi : ${out.active ? 'AKTİF' : 'PASİF'}
• Maksimum uç skor       : ${out.maxScore}
• Toplam merkez skoru    : ${out.centerActive ? 'AKTİF' : 'PASİF'}
• Aynı birler kontrolü   : ${out.unitActive ? 'AKTİF' : 'PASİF'} · maksimum ${out.unitMax} adet
• Gap kontrolü           : ${out.gapActive ? 'AKTİF' : 'PASİF'} · büyük sıçrama eşiği ≥ ${out.largeGap}, maksimum ${out.maxLarge} adet
• Mekanik kolon kontrolü : ${out.mechActive ? 'AKTİF' : 'PASİF'} · aynı fark tekrarı maksimum ${out.repeatMax}

════════════════════════════════════════
14. PAKETLİ ÜRETİM STRATEJİSİ
════════════════════════════════════════
${packageLines}

════════════════════════════════════════
15. MATEMATİKSEL MODEL
════════════════════════════════════════
• Covering Design: C(v=${pool.length}, k=${p.k}, t=${document.getElementById('p-t').value})
• Algoritma: Paketli Greedy — kesin kurallar → kota paketleri → uç skor filtresi → paket hedefleri → frekans/Jaccard dengesi

════════════════════════════════════════
16. ÜRETİM ÖNCESİ KONTROL
════════════════════════════════════════
[ ] Toplam kota paketleri toplamı ${p.cols} kolon ediyor mu?
[ ] Tek/çift kota toplamı ${p.cols} kolon ediyor mu?
[ ] Bölge kota toplamı ${p.cols} kolon ediyor mu?
[ ] Her kolon aktif kota paketlerinden en az bir toplam aralığına uyuyor mu?
[ ] Her kolon aktif tek/çift dağılım kotasına uyuyor mu?
[ ] Her kolon aktif bölge dağılım kotasına uyuyor mu?
[ ] Asal sayı ${p.primeMin}–${p.primeMax} aralığında mı?
[ ] Sayısal Tablo Bölgesi ≤ ${p.dec} mi?
[ ] Yasaklı ardışık/dikey farklar ve özel çiftler yok mu?
[ ] Kullanılabilir aktif sayılar ${p.freqMin}–${p.freqMax} kolon aralığında mı?
[ ] Kurallar nedeniyle kullanılamayan pasif sayılar frekans minimumundan muaf mı? Bankolar üst sınırdan muaf mı?
[ ] Jaccard ≤ ${jaccard}, ortak sayı ≤ ${maxCommon} mü?
[ ] Uç kolon skoru ${out.active ? 'aktifse her kolon ≤ ' + out.maxScore + ' mi?' : 'pasif mi?'}
Tüm maddeler geçilmeden kolon kabul edilmeyecek.

════════════════════════════════════════
17. ÇIKTI FORMATI
════════════════════════════════════════
• Her satır: ${p.k} sayı, TAB ile ayrılmış
• Toplam ${p.cols} satır, kod bloğu içinde
• Sayılar küçükten büyüğe sıralı · Satır numarası ekleme`;
    }

    let lastPrompt = '';
    function putPromptToScreen(prompt) {
      const out = document.getElementById('prompt-output');
      const card = document.getElementById('prompt-output-card');
      if (out) { out.value = prompt; }
      if (card) { card.classList.add('show'); card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
    function selectPromptText() {
      const out = document.getElementById('prompt-output');
      if (out) { out.focus(); out.select(); }
    }
    function stripHtmlForAlert(txt) {
      const div = document.createElement('div');
      div.innerHTML = String(txt || '');
      return (div.textContent || div.innerText || String(txt || '')).replace(/\s+/g, ' ').trim();
    }
    function uniqueWarningList(list) {
      const seen = new Set();
      const out = [];
      (list || []).forEach(w => {
        const msg = stripHtmlForAlert(w.msg || w);
        if (!msg || seen.has(msg)) return;
        seen.add(msg);
        out.push({ type: w.type || 'red', msg });
      });
      return out;
    }
    function showBlockingAlert(blockers) {
      const clean = uniqueWarningList(blockers);
      const lines = [];
      lines.push('Kritik kural çakışması / uyumsuzluk var.');
      lines.push('');
      if (clean.length) {
        lines.push('Düzeltilmesi gereken kırmızı uyarılar:');
        clean.slice(0, 12).forEach((w, i) => lines.push((i + 1) + '. ' + w.msg));
        if (clean.length > 12) lines.push('... +' + (clean.length - 12) + ' uyarı daha var.');
      } else {
        lines.push('Analiz panelinde kırmızı uyarı var, ama ayrıntı alınamadı. Analiz Et panelini kontrol et.');
      }
      lines.push('');
      lines.push('Önce bu maddeleri düzelt, sonra tekrar Prompt Oluştur.');
      alert(lines.join('\n'));
    }
    function buildAndSend() {
      const p = getParams();
      let blockers = getBlockingWarnings(p);
      // Analiz sonrası oluşan kırmızı uyarılar da dikkate alınır.
      if (lastAnalysisData && Array.isArray(lastAnalysisData.analysisBlockers)) {
        blockers = blockers.concat(lastAnalysisData.analysisBlockers);
      }
      blockers = uniqueWarningList(blockers).filter(w => w.type === 'red');
      if (blockers.length) {
        runAnalysis();
        showBlockingAlert(blockers);
        return;
      }
      lastPrompt = buildPrompt();
      putPromptToScreen(lastPrompt);
      navigator.clipboard.writeText(lastPrompt).then(() => {
        alert('Prompt oluşturuldu ve panoya kopyalandı. Şimdi bana yapıştırabilirsin.');
      }).catch(() => {
        alert('Prompt oluşturuldu. Aşağıdaki kutudan seçip kopyalayabilirsin.');
      });
    }
    function copyPrompt() {
      if (!lastPrompt) lastPrompt = buildPrompt();
      putPromptToScreen(lastPrompt);
      navigator.clipboard.writeText(lastPrompt).then(() => {
        const b = document.getElementById('copybtn');
        b.textContent = 'Kopyalandı ✓';
        setTimeout(() => b.textContent = 'Promptu kopyala', 1800);
      });
    }

    // ─── OTOMATİK KAYIT / GERİ YÜKLEME ───
    const SETTINGS_KEY = 'kolon_prompt_builder_v5_settings';
    let autosaveTimer = null;
    let autosaveReady = false;

    function nowStamp() {
      const d = new Date();
      return d.toLocaleString('tr-TR', { hour12: false });
    }
    function updateAutosaveStatus(msg) {
      const el = document.getElementById('autosave-status');
      if (el) el.textContent = msg;
    }
    function safeJsonParse(txt) {
      try { return JSON.parse(txt) } catch (e) { return null }
    }
    function serializableControls() {
      const controls = {};
      document.querySelectorAll('input, textarea, select').forEach(el => {
        if (!el.id) return;
        if (['elim-output', 'jacc-output', 'prompt-output', 'settings-import-file'].includes(el.id)) return;
        if (el.type === 'file') return;
        if (el.type === 'checkbox') controls[el.id] = { type: 'checkbox', checked: !!el.checked };
        else controls[el.id] = { type: el.tagName.toLowerCase(), value: el.value };
      });
      return controls;
    }
    function collectSettingsState() {
      return {
        appVersion: 'v6.8-final',
        savedAt: new Date().toISOString(),
        controls: serializableControls(),
        globals: {
          adjState: { ...adjState },
          vertState: { ...vertState },
          arithState: { ...arithState },
          arithTouched: [...arithTouched],
          bannedPairs: [...bannedPairs],
          currentPairFilter,
          pairSearchVal
        }
      };
    }
    function saveSettingsNow(silent = false) {
      try {
        const state = collectSettingsState();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
        updateAutosaveStatus('Kaydedildi: ' + nowStamp());
        if (!silent) alert('Ayarlar kaydedildi.');
        return true;
      } catch (e) {
        updateAutosaveStatus('Kayıt başarısız');
        if (!silent) alert('Ayarlar kaydedilemedi. Tarayıcı depolama izni/kotası engelliyor olabilir.');
        return false;
      }
    }
    function scheduleAutosave() {
      if (!autosaveReady) return;
      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => saveSettingsNow(true), 350);
    }
    function manualSaveSettings() { saveSettingsNow(false); }
    try { window.scheduleAutoSave = scheduleAutosave; } catch (e) { }
    function loadSavedSettingsRaw() {
      try { return safeJsonParse(localStorage.getItem(SETTINGS_KEY) || '') } catch (e) { return null }
    }
    function applySavedGlobalState(state) {
      if (!state || !state.globals) return;
      const g = state.globals;
      if (g.adjState) Object.keys(g.adjState).forEach(k => { if (k in adjState) adjState[k] = g.adjState[k]; });
      if (g.vertState) Object.keys(g.vertState).forEach(k => { if (k in vertState) vertState[k] = g.vertState[k]; });
      if (g.arithState) { Object.keys(arithState).forEach(k => delete arithState[k]); Object.assign(arithState, g.arithState); }
      if (Array.isArray(g.arithTouched)) { arithTouched.clear(); g.arithTouched.forEach(x => arithTouched.add(x)); }
      if (Array.isArray(g.bannedPairs)) { bannedPairs.clear(); g.bannedPairs.forEach(x => bannedPairs.add(x)); }
      if (g.currentPairFilter) currentPairFilter = g.currentPairFilter;
      if (typeof g.pairSearchVal === 'string') pairSearchVal = g.pairSearchVal;
    }
    function applySavedControls(state) {
      if (!state || !state.controls) return;
      Object.entries(state.controls).forEach(([id, data]) => {
        const el = document.getElementById(id);
        if (!el || !data) return;
        if (el.type === 'checkbox') el.checked = !!data.checked;
        else if ('value' in data) el.value = data.value;
      });
    }
    function restoreSettingsIfAny() {
      const state = loadSavedSettingsRaw();
      if (!state) { updateAutosaveStatus('Henüz kayıt yok'); return null; }
      applySavedGlobalState(state);
      return state;
    }
    function finishRestoreControls(state) {
      if (!state) return;
      applySavedControls(state);
      const search = document.getElementById('pair-search');
      if (search && state.globals && typeof state.globals.pairSearchVal === 'string') search.value = state.globals.pairSearchVal;
      updateAutosaveStatus('Geri yüklendi: ' + (state.savedAt ? new Date(state.savedAt).toLocaleString('tr-TR', { hour12: false }) : nowStamp()));
    }
    function initAutosaveListeners() {
      autosaveReady = true;
      document.addEventListener('input', scheduleAutosave, true);
      document.addEventListener('change', scheduleAutosave, true);
      document.addEventListener('click', () => setTimeout(scheduleAutosave, 0), true);
      window.addEventListener('beforeunload', () => { try { saveSettingsNow(true) } catch (e) { } });
    }
    function exportSettingsJson() {
      const state = collectSettingsState();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kolon_prompt_builder_ayar_yedegi_' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      saveSettingsNow(true);
    }
    function importSettingsJson(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const state = safeJsonParse(reader.result);
        if (!state || !state.controls) { alert('Bu dosya geçerli bir ayar yedeği gibi görünmüyor.'); input.value = ''; return; }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
        alert('Ayar yedeği yüklendi. Sayfa şimdi yeniden açılacak.');
        location.reload();
      };
      reader.readAsText(file, 'utf-8');
    }
    function clearSavedSettings() {
      if (!confirm('Kayıtlı ayarları silmek istiyor musun? Bu işlem mevcut sayfadaki değerleri değiştirmez; sadece tarayıcı kaydını temizler.')) return;
      localStorage.removeItem(SETTINGS_KEY);
      updateAutosaveStatus('Kayıt sıfırlandı');
      alert('Kayıt temizlendi. Yeni ayar girersen tekrar otomatik kaydedilir.');
    }

    const __savedSettings = restoreSettingsIfAny();
    buildToggleRows(adjDiffs, adjState, 'adj-rules');
    buildToggleRows(activeVertDiffs(), vertState, 'vert-rules');
    renderQuotaBodies();
    finishRestoreControls(__savedSettings);
    updateGameLabels();
    buildToggleRows(activeVertDiffs(), vertState, 'vert-rules');
    parsePool(); updateEven(); updateQuotaStatus(); renderPairGrid(); updateBannedSummary();
    initAutosaveListeners();
    if (!__savedSettings) saveSettingsNow(true);

  