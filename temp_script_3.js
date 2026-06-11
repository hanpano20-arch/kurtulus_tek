
    /* v6.8 FINAL BİRLEŞİK PATCH
       Ana iskelet: eski çalışan analiz motoru. Bu patch sadece öncelik, prompt, geometri, tema ve dar aday davranışını düzeltir. */
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const val = (id, def = '') => ($(id) && $(id).value !== undefined ? $(id).value : def);
      const intVal = (id, def = 0) => { const n = parseInt(val(id, def), 10); return Number.isFinite(n) ? n : def; };
      const numVal = (id, def = 0) => { const n = parseFloat(val(id, def)); return Number.isFinite(n) ? n : def; };
      const chk = id => !!($(id) && $(id).checked);

      function coord(n) { return { row: Math.floor((n - 1) / 10), col: (n - 1) % 10 }; }
      function sameRow(a, b) { return coord(a).row === coord(b).row; }
      function sameCol(a, b) { return coord(a).col === coord(b).col; }
      function isDiagStep(a, b, step) {
        const A = coord(a), B = coord(b);
        return B.row === A.row + 1 && ((step === 9 && B.col === A.col - 1) || (step === 11 && B.col === A.col + 1));
      }
      function groupBy(arr, fn) { const m = {}; arr.forEach(x => { const k = fn(x); (m[k] || (m[k] = [])).push(x); }); return Object.values(m); }
      function hasBannedGeometricDiff(sorted, state, mode, lineFn) {
        // v7.1 KESİN MANTIK: Aynı 9x10 kupon hattındaki seçili sayılar sıralanır;
        // yalnız arka arkaya gelen SEÇİLİ sayılar arasındaki fark kontrol edilir.
        // Örn. 62-64-70 için sadece 62-64 ve 64-70 kontrol edilir; 62-70 kontrol edilmez.
        const groups = groupBy(sorted, lineFn);
        for (const g of groups) {
          g.sort((a, b) => a - b);
          for (let i = 0; i < g.length - 1; i++) { const d = g[i + 1] - g[i]; if (state[d] === 'yasak') return true; }
        }
        return false;
      }
      function diagonalThreshold(step) {
        const id = step === 9 ? 'p-diag9-min' : 'p-diag11-min';
        const v = intVal(id, 2);
        return v <= 0 ? 0 : v;
      }
      function hasDiagonalChain(sorted, step, minLen) {
        if (!minLen || minLen < 2) return false;
        const set = new Set(sorted);
        for (const n of sorted) {
          let len = 1, cur = n;
          while (set.has(cur + step) && isDiagStep(cur, cur + step, step)) { len++; cur += step; if (len >= minLen) return true; }
        }
        return false;
      }
      function comboMatchesQuotaV68(c, p) {
        const s = c.slice().sort((a, b) => a - b);
        const sum = s.reduce((a, b) => a + b, 0);
        const odd = s.filter(n => n % 2 !== 0).length;
        const low = s.filter(n => n <= regionSplit()).length;
        const sumOk = !p.sumQuotas || !p.sumQuotas.length || p.sumQuotas.some(q => sum >= q.min && sum <= q.max);
        const oddOk = !p.oddQuotas || !p.oddQuotas.length || p.oddQuotas.some(q => odd === q.odd);
        const regionOk = !p.regionQuotas || !p.regionQuotas.length || p.regionQuotas.some(q => low === q.low);
        return sumOk && oddOk && regionOk;
      }
      window.checkCombo = function (combo, p) {
        const s = combo.slice().sort((a, b) => a - b);
        if (p.bankoList && p.bankoList.length && !p.bankoList.every(n => s.includes(n))) return false;
        if (!comboMatchesQuotaV68(s, p)) return false;
        const pc = s.filter(n => PR.has(n)).length;
        if (pc < p.primeMin || pc > p.primeMax) return false;
        const tab = {};
        for (const n of s) { const d = sayisalTabloBolgesi(n); tab[d] = (tab[d] || 0) + 1; if (tab[d] > p.dec) return false; }
        // Yatay sadece gerçek 9x10 satırında; dikey sadece gerçek sütunda çalışır.
        if (hasBannedGeometricDiff(s, adjState, p.hMode || 'neighbor', n => coord(n).row)) return false;
        if (hasBannedGeometricDiff(s, vertState, p.vMode || 'neighbor', n => coord(n).col)) return false;
        for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) { if (bannedPairs.has(pairKey(s[i], s[j]))) return false; }
        if (hasDiagonalChain(s, 9, diagonalThreshold(9))) return false;
        if (hasDiagonalChain(s, 11, diagonalThreshold(11))) return false;
        return true;
      };

      // ═══════════════════════════════════════════════════════
      // v7.13 — checkComboDetailed: hangi kurala takıldığını açıklar
      // ═══════════════════════════════════════════════════════
      window.checkComboDetailed = function (combo, p) {
        const s = combo.slice().sort((a, b) => a - b);
        const reasons = [];

        // 1. Banko kontrolü
        if (p.bankoList && p.bankoList.length) {
          const missing = p.bankoList.filter(n => !s.includes(n));
          if (missing.length) {
            reasons.push({ kural: 'Banko Sayı', detay: `Kolonda bulunması gereken banko sayılar eksik: [${missing.join(', ')}]`, engel: true });
            return reasons;
          }
        }

        // 2. Kota (toplam/tek-çift/bölge)
        if (!comboMatchesQuotaV68(s, p)) {
          const sum = s.reduce((a, b) => a + b, 0);
          const odd = s.filter(n => n % 2 !== 0).length;
          const low = s.filter(n => n <= regionSplit()).length;
          let kotaDetay = [];
          if (p.sumQuotas && p.sumQuotas.length && !p.sumQuotas.some(q => sum >= q.min && sum <= q.max))
            kotaDetay.push(`Toplam ${sum} — izin verilen aralıkların dışında [${p.sumQuotas.map(q => q.min + '-' + q.max).join(', ')}]`);
          if (p.oddQuotas && p.oddQuotas.length && !p.oddQuotas.some(q => odd === q.odd))
            kotaDetay.push(`Tek sayı adedi ${odd} — izin verilenler: [${p.oddQuotas.map(q => q.odd).join(', ')}]`);
          if (p.regionQuotas && p.regionQuotas.length && !p.regionQuotas.some(q => low === q.low))
            kotaDetay.push(`Alt bölge adedi ${low} — izin verilenler: [${p.regionQuotas.map(q => q.low).join(', ')}]`);
          reasons.push({ kural: 'Kota / Dağılım', detay: kotaDetay.join(' | ') || 'Toplam/tek-çift/bölge kotası dışında', engel: true });
          return reasons;
        }

        // 3. Asal sayı limiti
        const pc = s.filter(n => PR.has(n)).length;
        if (pc < p.primeMin || pc > p.primeMax) {
          reasons.push({ kural: 'Asal Sayı Limiti', detay: `Kolonda ${pc} asal var (${s.filter(n => PR.has(n)).join(', ') || 'yok'}), izin verilen: min ${p.primeMin} — max ${p.primeMax}`, engel: true });
          return reasons;
        }

        // 4. Sayısal tablo bölgesi
        const tab = {};
        for (const n of s) {
          const d = sayisalTabloBolgesi(n); tab[d] = (tab[d] || 0) + 1;
          if (tab[d] > p.dec) {
            const grpNums = s.filter(x => sayisalTabloBolgesi(x) === d);
            reasons.push({ kural: 'Sayısal Tablo Bölgesi', detay: `Bölge ${d} (${(d - 1) * 10 + 1}–${d * 10}) içinde ${tab[d]} sayı var: [${grpNums.join(', ')}], izin verilen max: ${p.dec}`, engel: true });
            return reasons;
          }
        }

        // 5. Yatay fark
        const rowGroups = {};
        s.forEach(n => { const r = coord(n).row; (rowGroups[r] = rowGroups[r] || []).push(n); });
        for (const r of Object.keys(rowGroups)) {
          const g = rowGroups[r].sort((a, b) => a - b);
          for (let i = 0; i < g.length - 1; i++) {
            const d = g[i + 1] - g[i];
            if (adjState[d] === 'yasak') {
              reasons.push({ kural: 'Yatay Fark', detay: `Sayı ${g[i]} → ${g[i + 1]}: fark +${d} yasak (aynı yatay satırda arka arkaya seçili)`, engel: true });
              return reasons;
            }
          }
        }

        // 6. Dikey fark
        const colGroups = {};
        s.forEach(n => { const c = coord(n).col; (colGroups[c] = colGroups[c] || []).push(n); });
        for (const c of Object.keys(colGroups)) {
          const g = colGroups[c].sort((a, b) => a - b);
          for (let i = 0; i < g.length - 1; i++) {
            const d = g[i + 1] - g[i];
            if (vertState[d] === 'yasak') {
              reasons.push({ kural: 'Dikey Fark', detay: `Sayı ${g[i]} → ${g[i + 1]}: fark +${d} yasak (aynı dikey sütunda arka arkaya seçili)`, engel: true });
              return reasons;
            }
          }
        }

        // 7. Özel çift yasağı
        for (let i = 0; i < s.length; i++) {
          for (let j = i + 1; j < s.length; j++) {
            if (bannedPairs.has(pairKey(s[i], s[j]))) {
              reasons.push({ kural: 'Özel Çift Yasağı', detay: `[${s[i]}, ${s[j]}] çifti özel olarak yasaklanmış`, engel: true });
              return reasons;
            }
          }
        }

        // 8. Çapraz zincir +9 ve +11
        for (const step of [9, 11]) {
          const minLen = diagonalThreshold(step);
          if (!minLen || minLen < 2) continue;
          const set = new Set(s);
          for (const n of s) {
            let len = 1, cur = n;
            const chain = [n];
            while (set.has(cur + step) && isDiagStep(cur, cur + step, step)) {
              cur += step; len++; chain.push(cur);
              if (len >= minLen) {
                reasons.push({
                  kural: `Çapraz Zincir +${step}`,
                  detay: `[${chain.join('→')}] — ${len}'li +${step} çapraz zincir bulundu (yasak eşiği: ${minLen}'li ve üzeri yasak). ` +
                    `Bu sayılar 9×10 kuponda satır+1/sütun${step === 9 ? '-1' : '+1'} yönünde gerçek çapraz hat oluşturuyor.`,
                  engel: true
                });
                return reasons;
              }
            }
          }
        }

        reasons.push({ kural: '✅ Tüm Kurallar Geçildi', detay: 'Bu kombinasyon aktif kesin kuralların tamamından geçiyor.', engel: false });
        return reasons;
      };

      function targetCols(p) { return p.packages && p.packages.active ? packageTotal(p.packages) : p.cols; }
      function packageList(p) {
        if (!p.packages || !p.packages.active) return [{ key: 'general', name: 'Genel üretim', cols: p.cols, t: p.t || intVal('p-t', 4), jaccard: p.jaccard, maxCommon: p.maxCommon, outMax: getOutlierParams().maxScore, purpose: 'Tek strateji' }];
        return [p.packages.main, p.packages.deep, p.packages.risk].filter(x => x && x.cols > 0);
      }
      function similarityOkLocal(a, b, j, maxC) {
        const inter = a.filter(x => b.includes(x)).length;
        const union = a.length + b.length - inter;
        return inter <= maxC && (union ? inter / union : 0) <= j;
      }
      function tryOrderLocal(items, target, j, maxC) {
        const selected = [];
        outer: for (const it of items) {
          for (const s of selected) { if (!similarityOkLocal(it.combo, s.combo, j, maxC)) continue outer; }
          selected.push(it); if (selected.length >= target) break;
        }
        return selected;
      }
      window.jaccardFeasibilityCheck = function (scoredItems, p) {
        const base = scoredItems.map((x, idx) => ({ combo: x.combo.slice().sort((a, b) => a - b), score: x.score || 0, idx, sum: comboSum(x.combo), reasons: x.reasons || [] }));
        const target = targetCols(p);
        if (!base.length) return { bestCount: 0, target, ok: false, selected: [], trials: [], status: 'Aday yok', packageDetails: [] };
        const freq = {}; pool.forEach(n => freq[n] = 0); base.forEach(it => it.combo.forEach(n => freq[n] = (freq[n] || 0) + 1));
        base.forEach(it => { it.rarity = it.combo.reduce((a, n) => a + (1 / Math.max(1, freq[n])), 0); it.centerDist = Math.abs(it.sum - (((p.sumMin || 0) + (p.sumMax || 0)) / 2)); });
        function makeOrders(items) {
          const orders = [
            ['uç skor düşük', items.slice().sort((a, b) => a.score - b.score || b.rarity - a.rarity)],
            ['nadir sayı dengesi', items.slice().sort((a, b) => b.rarity - a.rarity || a.score - b.score)],
            ['toplam merkeze yakın', items.slice().sort((a, b) => a.centerDist - b.centerDist || a.score - b.score)],
            ['orijinal aday sırası', items.slice()],
            ['toplam düşükten yükseğe', items.slice().sort((a, b) => a.sum - b.sum || a.score - b.score)],
            ['toplam yüksekten düşeğe', items.slice().sort((a, b) => b.sum - a.sum || a.score - b.score)]
          ];
          for (let seed = 1; seed <= 12; seed++) orders.push([`deterministik deneme ${seed}`, items.slice().sort((a, b) => (deterministicHash(a.idx, seed) + a.score / 250) - (deterministicHash(b.idx, seed) + b.score / 250))]);
          return orders;
        }
        if (!(p.packages && p.packages.active)) {
          let best = [], bestName = '', trials = [];
          for (const [name, order] of makeOrders(base)) { const sel = tryOrderLocal(order, p.cols, p.jaccard, p.maxCommon); trials.push({ name, count: sel.length }); if (sel.length > best.length) { best = sel; bestName = name; } if (sel.length >= p.cols) break; }
          return { bestCount: best.length, target: p.cols, ok: best.length >= p.cols, selected: best, bestName, stats: selectedSimilarityStats(best, p), trials: trials.sort((a, b) => b.count - a.count).slice(0, 8), status: best.length >= p.cols ? 'Uygun' : 'Yetersiz' };
        }
        const chosen = []; const used = new Set(); const details = [];
        for (const pkg of packageList(p)) {
          const candidates = base.filter(it => !used.has(it.combo.join('-')) && (it.score || 0) <= pkg.outMax);
          let best = [], bestName = '', trials = [];
          for (const [name, order0] of makeOrders(candidates)) { const order = order0.filter(it => !used.has(it.combo.join('-'))); const sel = tryOrderLocal(order, pkg.cols, pkg.jaccard, pkg.maxCommon); trials.push({ name, count: sel.length }); if (sel.length > best.length) { best = sel; bestName = name; } if (sel.length >= pkg.cols) break; }
          best.slice(0, pkg.cols).forEach(it => { it.packageName = pkg.name; used.add(it.combo.join('-')); chosen.push(it); });
          details.push({ name: pkg.name, target: pkg.cols, selected: Math.min(best.length, pkg.cols), bestName, jaccard: pkg.jaccard, maxCommon: pkg.maxCommon, outMax: pkg.outMax, trials });
        }
        return { bestCount: chosen.length, target, ok: chosen.length >= target, selected: chosen, bestName: 'paket bazlı seçim', stats: selectedSimilarityStats(chosen, { maxCommon: 99, jaccard: 1 }), trials: details.map(d => ({ name: d.name, count: d.selected })), status: chosen.length >= target ? 'Uygun' : 'Yetersiz', packageDetails: details };
      };

      window.renderJaccardReport = function () {
        const out = $('jacc-output'); if (!out) return;
        const r = lastAnalysisData && lastAnalysisData.jaccardReport; const p = lastAnalysisData && lastAnalysisData.params;
        if (!r || !p) { out.value = 'Önce Analiz Et butonuna bas.'; return; }
        const advice = lastAnalysisData.jaccardAdvice || buildJaccardSuggestionReport(r.bestCount, r.target, p.jaccard, p.maxCommon, lastAnalysisData.outValidCount, lastAnalysisData.validCount);
        if ($('jacc-target')) $('jacc-target').textContent = r.target;
        if ($('jacc-selected')) $('jacc-selected').textContent = r.bestCount;
        if ($('jacc-status')) $('jacc-status').textContent = r.ok ? 'UYGUN' : advice.level;
        const lines = [];
        lines.push('JACCARD / PAKET ÜRETİLEBİLİRLİK RAPORU');
        lines.push('---------------------------------------');
        lines.push(`Üretim modu              : ${p.packages && p.packages.active ? 'PAKETLİ' : 'GENEL'}`);
        lines.push(`Hedef kolon sayısı       : ${r.target}`);
        lines.push(`Seçilebilen kolon sayısı : ${r.bestCount}`);
        lines.push(`Durum                    : ${r.ok ? 'UYGUN' : advice.level}`);
        lines.push(`Kesin kurallardan geçen  : ${(lastAnalysisData.validCount || 0).toLocaleString()}`);
        lines.push(`Uç filtreden sonra aday  : ${(lastAnalysisData.outValidCount || 0).toLocaleString()}`);
        if (p.packages && p.packages.active) {
          lines.push(''); lines.push('Paket bazlı seçim:');
          (r.packageDetails || []).forEach(d => lines.push(`- ${d.name}: ${d.selected}/${d.target} · J≤${d.jaccard} · ortak≤${d.maxCommon} · uç≤${d.outMax}`));
          lines.push('Not: Paketli modda genel Jaccard / genel max ortak son kontrolü uygulanmaz; paket sınırları esas alınır.');
        } else {
          lines.push(`Genel Jaccard            : ${Number(p.jaccard).toFixed(2)}`);
          lines.push(`Genel max ortak          : ${p.maxCommon}`);
        }
        lines.push(`Seçilenlerde max ortak   : ${r.stats ? r.stats.maxCommon : '—'}`);
        lines.push(`Seçilenlerde max Jaccard : ${r.stats ? r.stats.maxJ.toFixed(3) : '—'}`);
        if (!r.ok) { lines.push(''); lines.push('ÖNERİ'); lines.push('-----'); lines.push(advice.primaryAction || 'Kural sıkılığını veya paket değerlerini kontrol et.'); }
        lines.push(''); lines.push('Seçilen kolonlar:');
        (r.selected || []).slice(0, 200).forEach((it, i) => lines.push(`${String(i + 1).padStart(3, '0')} | ${it.packageName ? it.packageName + ' | ' : ''}${formatComboPlain(it.combo)} | skor:${it.score}`));
        out.value = lines.join('\n');
      };

      function buildQuotaLines(p) {
        const sumLines = (p.sumQuotas && p.sumQuotas.length) ? p.sumQuotas.map(q => `• ${q.min}–${q.max} toplam aralığı: ${q.count} kolon`).join('\n') : '• Toplam aralığı bilinçli kapalı / pasif';
        const oddLines = (p.oddQuotas && p.oddQuotas.length) ? p.oddQuotas.map(q => `• ${q.odd} tek / ${p.k - q.odd} çift: ${q.count} kolon`).join('\n') : '• Tek/çift kotası bilinçli kapalı / pasif';
        const regLines = (p.regionQuotas && p.regionQuotas.length) ? p.regionQuotas.map(q => `• 1–${regionSplit()}: ${q.low} sayı / ${regionSplit() + 1}–${currentGameMax()}: ${q.high} sayı: ${q.count} kolon`).join('\n') : '• Bölge kotası bilinçli kapalı / pasif';
        return { sumLines, oddLines, regLines };
      }
      function stateLines(state, diffs) { return diffs.map(d => `• Fark = ${d} → ${(state[d] || 'serbest').toUpperCase()}`).join('\n'); }
      function diagText(step) {
        const th = diagonalThreshold(step);
        if (!th) return `• +${step} çapraz ardışık: KAPALI`;
        const parts = []; for (let i = 2; i <= 6; i++) parts.push(`${i}'li ${i >= th ? 'YASAK' : 'SERBEST'}`);
        return `• +${step} çapraz ardışık: ${parts.join(', ')}`;
      }
      function packagePromptLines(p) {
        const pkg = p.packages;
        if (!(pkg && pkg.active)) return '• Paketli üretim modu: PASİF\n• Temel Parametreler’deki genel kolon sayısı, genel t, genel Jaccard, genel max ortak ve genel uç skor geçerlidir.\n• Paket kartlarındaki değerler üretimde dikkate alınmayacaktır.';
        const total = packageTotal(pkg);
        const one = (title, x) => `${title}\n• Kolon sayısı: ${x.cols}\n• Paket t seviyesi: ${x.t}\n• Paket Jaccard üst sınırı: ${x.jaccard}\n• Paket max ortak sayı: ${x.maxCommon}\n• Paket uç skor limiti: ${x.outMax}\n• Hedef: ${x.purpose}`;
        return `• Paketli üretim modu: AKTİF\n• Paket kolon toplamı: ${total}\n• Temel Parametreler’deki genel kolon sayısı, genel t seviyesi, genel Jaccard, genel max ortak ve genel uç skor DEVRE DIŞIDIR.\n\n1) ${one('ANA DENGELİ PAKET', pkg.main)}\n\n2) ${one('ÇEKİRDEK DESTEK PAKETİ', pkg.deep)}\n\n3) ${one('KONTROLLÜ RİSK PAKETİ', pkg.risk)}\n\nPAKET KURALLARI:\n• Tüm paketlerde aktif kesin kurallar aynen uygulanacak.\n• Aynı kolon iki pakette tekrar edilmeyecek.\n• Paketler tamamlandıktan sonra genel Jaccard / genel max ortak son kontrolü uygulanmayacak; her paket kendi Jaccard ve max ortak sınırıyla değerlendirilmiş kabul edilecek.\n• Paketler birleştirildikten sonra yalnızca tekrar eden kolon kontrolü ve genel frekans dengesi raporlanacak.\n• Paket adı, satır numarası veya açıklama çıktıya yazılmayacak.`;
      }
      window.buildPrompt = function () {
        const p = getParams(); const pkg = p.packages || getPackageParams(); const packActive = !!(pkg && pkg.active); const target = packActive ? packageTotal(pkg) : p.cols;
        const banko = p.bankoList && p.bankoList.length ? p.bankoList.join(', ') : 'YOK';
        const primeList = pool.filter(n => PR.has(n)); const split = regionSplit(); const lowList = pool.filter(n => n <= split); const highList = pool.filter(n => n > split);
        const q = buildQuotaLines(p);
        const activeRules = [];
        if (p.sumQuotas && p.sumQuotas.length) activeRules.push('Toplam aralığı kota paketleri');
        if (p.oddQuotas && p.oddQuotas.length) activeRules.push('Tek/çift dağılım kotası');
        if (p.regionQuotas && p.regionQuotas.length) activeRules.push('Bölge dağılım kotası');
        activeRules.push('Asal sayı limiti', 'Sayısal tablo bölgesi', 'Yatay fark', 'Dikey fark', 'Çapraz zincir', 'Özel çift yasağı');
        const passive = []; if (!(p.sumQuotas && p.sumQuotas.length)) passive.push('Toplam aralığı'); if (!(p.oddQuotas && p.oddQuotas.length)) passive.push('Tek/çift kotası'); if (!(p.regionQuotas && p.regionQuotas.length)) passive.push('Bölge kotası');
        const banned = [...bannedPairs].map(k => k.split('-').map(Number).sort((a, b) => a - b));
        const bannedLines = banned.length ? '• Aşağıdaki sayı çiftleri aynı kolonda KESİNLİKLE bulunamaz:\n' + banned.map(a => `  {${a[0]}–${a[1]}} → sadece bu iki sayıya özel yasak, fark bazlı kural değildir`).join('\n') : '• Özel çift yasağı yok';
        const out = getOutlierParams();
        const checker = chk('p-checker') ? '\n════════════════════════════════════════\nCHECKER PROMPTU\n════════════════════════════════════════\nÜretilen kolonları yukarıdaki aktif kurallara göre denetle. Bilinçli kapatılan/pasif kuralları kontrol etme. Paketli üretim aktifse genel kolon/t/Jaccard/max ortak/uç skor değerlerini kontrol etme; paket değerlerini esas al. Yatay/dikey/çapraz kuralları sayı doğrusu farkına göre değil 9x10 kupon geometrisine göre denetle. Yatay/dikey kontrolde aynı hattaki tüm ikilileri değil, yalnız arka arkaya gelen seçili sayıların farklarını kontrol et. Her ihlali kolon ve ihlal nedeni ile raporla.' : '';
        const prompt = `KONU: Gelişmiş Sayı Analizi, Covering Design ve Optimizasyon ile Kolon Üretimi\n\nROLÜN:\nBir veri bilimci, kombinatorik uzmanı ve olasılık analisti gibi davran.\nBu rastgele üretim DEĞİLDİR. Tüm aktif kesin kurallar %100 uygulanacaktır.\n\n════════════════════════════════════════\n1. GİRDİLER\n════════════════════════════════════════\n• Oyun tipi                 : 6/${currentGameMax()}\n• Sayı Havuzu (v=${pool.length})   : [${pool.join(', ')}]\n• Kolon Boyutu (k)         : ${p.k}\n• Hedef Tutma Seviyesi (t) : ${packActive ? 'PAKETLİ MODDA GENEL t DEVRE DIŞI; paket t değerleri geçerli' : intVal('p-t', 4)}\n• Üretilecek Kolon Sayısı  : ${target}${packActive ? ' (paket toplamı)' : ''}\n• Banko Sayılar            : ${banko}\n  → Asal sayılar  : [${primeList.join(', ')}]\n  → 1–${split} grubu    : [${lowList.join(', ')}]\n  → ${split + 1}–${currentGameMax()} grubu   : [${highList.join(', ')}]\n\n════════════════════════════════════════\n1B. ÜRETİM MODU ÖNCELİĞİ\n════════════════════════════════════════\n• Üretim modu: ${packActive ? 'PAKETLİ ÜRETİM' : 'GENEL ÜRETİM'}.\n${packActive ? '• Temel Parametreler’deki genel kolon sayısı, genel t seviyesi, genel Jaccard, genel max ortak ve genel uç skor DEVRE DIŞIDIR.\n• Geçerli değerler her paketin kendi kolon/t/Jaccard/max ortak/uç skor değerleridir.' : '• Genel üretim modu aktif olduğu için Temel Parametreler’deki genel kolon/t/Jaccard/max ortak/uç skor değerleri geçerlidir.\n• Paket kartlarındaki değerler devre dışıdır.'}\n• Ortak kurallar iki modda da geçerlidir: toplam, tek/çift, bölge, asal, özel çift, yatay/dikey fark ve çapraz zincir.\n\nAKTİF / PASİF KURAL ÖZETİ\n• Aktif kesin kurallar: ${activeRules.join('; ')}\n• Optimizasyon / seçim önceliği: Frekans dengesi; Jaccard; max ortak; uç skor; geometrik kalite.\n• Bilinçli devre dışı / pasif kurallar: ${passive.length ? passive.join('; ') : 'YOK'}\n• Kapalı/pasif kurallar üretimde uygulanmayacak ve eksik sayılmayacak.\n\nDAR ADAYDAN SEÇİM MODU\n• AKTİF; alt sınır hedef kolon sayısı, üst sınır 150.\n• Aktif kesin kurallar sonrası aday havuzu hedef kolon sayısı ile dar aday üst sınırı arasında kalırsa bu hata değildir.\n• Aday havuzu kurallar gevşetilerek gereksiz yere 300+ seviyesine şişirilmeyecek; en iyi hedef kolon sayısı seçilecektir.\n• Dar aday modunda Jaccard / max ortak / uç skor / frekans dengesi otomatik red sebebi değil, seçim önceliğidir.\n\n════════════════════════════════════════\n2. KESİN KURALLAR\n════════════════════════════════════════\n• Asal Sayı Limiti : Minimum ${p.primeMin}, Maksimum ${p.primeMax} asal\n• Banko sayılar varsa her kolonda bulunacak ve frekans üst sınırından muaf kabul edilecek.\n\n════════════════════════════════════════\n3. TOPLAM ARALIĞI KOTA PAKETLERİ\n════════════════════════════════════════\n${q.sumLines}\nNOT: Toplam paketleri birbirinden bağımsızdır; aralıkların üst üste binmesi çakışma değildir.\n\n════════════════════════════════════════\n4. TEK / ÇİFT DAĞILIM KOTASI\n════════════════════════════════════════\n${q.oddLines}\n\n════════════════════════════════════════\n5. BÖLGE DAĞILIM KOTASI\n════════════════════════════════════════\n${q.regLines}\n\n════════════════════════════════════════\n6. SAYISAL TABLO BÖLGESİ FİLTRESİ\n════════════════════════════════════════\n• Aynı Sayısal Tablo Bölgesi : Kolonda maksimum ${p.dec} adet\n• Grup yapısı: 1–10, 11–20, 21–30, 31–40, 41–50, 51–60${currentGameMax() > 60 ? ', 61–70, 71–80, 81–90' : ''}\n\n════════════════════════════════════════\n7. YATAY FARK KURALI\n════════════════════════════════════════\n${stateLines(adjState, adjDiffs)}\nKontrol tipi: Yalnız aynı yatay sayı dizilimi içinde arka arkaya gelen seçili sayılar kontrol edilir. Sayılar önce 9x10 kupon koordinatına çevrilir. Matematiksel fark tek başına yeterli değildir. Aynı yatay dizilimde olsalar bile arada başka seçili sayı varsa uçtaki iki sayı ayrıca kontrol edilmez. Örnek: 62-64-70 varsa sadece 62-64 ve 64-70 kontrol edilir; 62-70 ayrıca kontrol edilmez. Bu nedenle +8 yasak olsa bile 62-64-70 dizilimi, +2 ve +6 serbestse yatay kurala takılmaz. 14-22 fark 8 olsa bile farklı satırda olduğu için yatay kural işlemez.\n\n════════════════════════════════════════\n8. DİKEY FARK KURALI\n════════════════════════════════════════\n${stateLines(vertState, activeVertDiffs())}\nKontrol tipi: Yalnız aynı dikey sütun içinde ${p.vMode === 'neighbor' ? 'arka arkaya gelen seçili sayılar' : 'tüm seçili çiftler'} kontrol edilir. Matematiksel fark tek başına yeterli değildir.\n\n════════════════════════════════════════\n9. ÖZEL ÇİFT YASAĞI\n════════════════════════════════════════\n${bannedLines}\nÖNEMLİ NOT: Bu bölümdeki yasaklar SADECE belirtilen iki sayıya özgüdür.\n\n════════════════════════════════════════\n10. ÇAPRAZ ARDIŞIK KURALI (+9 / +11)\n════════════════════════════════════════\n${diagText(9)}\n${diagText(11)}\nNOT: Bu kural genel +9/+11 farkını kontrol etmez. Sayılar 9x10 kupon koordinatına çevrilir; yalnız satır +1 ve sütun -1 veya satır +1 ve sütun +1 yönünde devam eden gerçek çapraz zincirler kontrol edilir. Örnek: 11-20 fark 9 olsa bile aynı yatay satırdadır; çapraz değildir ve çapraz kuraldan yasaklanmaz.\n\n════════════════════════════════════════\n11. OPTİMİZASYON / SEÇİM ÖNCELİĞİ\n════════════════════════════════════════\n• Frekans dengesi hedefi: Minimum ${p.freqMin}, Maksimum ${p.freqMax} kullanım.\n• Frekans dengesi, Jaccard, max ortak ve uç skor normal modda kalite sınırıdır; Dar Adaydan Seçim Modu devreye girerse otomatik red sebebi değil seçim önceliğidir.\n• Tek/çift, asal, bölge, kota veya kesin kurallar nedeniyle hiç kullanılamayan sayılar minimum frekans şartından muaftır.\n\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR\n════════════════════════════════════════\n${packActive ? `• Paketli üretim modu AKTİF olduğu için genel Jaccard / genel max ortak / genel uç skor DEVRE DIŞIDIR.\n• ${pkg.main.name}: Jaccard ≤ ${pkg.main.jaccard}, max ortak ≤ ${pkg.main.maxCommon}, uç skor ≤ ${pkg.main.outMax}\n• ${pkg.deep.name}: Jaccard ≤ ${pkg.deep.jaccard}, max ortak ≤ ${pkg.deep.maxCommon}, uç skor ≤ ${pkg.deep.outMax}\n• ${pkg.risk.name}: Jaccard ≤ ${pkg.risk.jaccard}, max ortak ≤ ${pkg.risk.maxCommon}, uç skor ≤ ${pkg.risk.outMax}` : `• Genel Jaccard üst sınırı: ${p.jaccard}\n• Genel max ortak sayı: ${p.maxCommon}\n• Genel uç skor limiti: ${out.active ? 'AKTİF · maksimum ' + out.maxScore : 'PASİF'}`}\n\n════════════════════════════════════════\n13. ÜRETİM STRATEJİSİ\n════════════════════════════════════════\n${packagePromptLines(p)}\n\n════════════════════════════════════════\n14. MATEMATİKSEL MODEL\n════════════════════════════════════════\n• Covering Design: C(v=${pool.length}, k=${p.k}, t=${packActive ? 'paket bazlı' : intVal('p-t', 4)})\n• Algoritma: Aktif kesin kurallar → kota paketleri → aday havuzu → optimizasyon/seçim öncelikleri → çıktı kontrolü\n\n════════════════════════════════════════\n15. ÜRETİM ÖNCESİ KONTROL\n════════════════════════════════════════\n[ ] Aktif toplam kota paketleri doğru mu?\n[ ] Aktif tek/çift dağılım kotası doğru mu?\n[ ] Aktif bölge dağılım kotası doğru mu?\n[ ] Asal sayı limiti doğru mu?\n[ ] Sayısal Tablo Bölgesi filtresi ≤ ${p.dec} mı?\n[ ] Yasaklı yatay/dikey komşu seçili fark, çapraz zincir ve özel çift ihlali yok mu?\n[ ] Paketli/genel üretim modu önceliği doğru uygulandı mı?\n[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi ${target} kolon seçildi mi?\nTüm AKTİF KESİN KURALLAR geçilmeden kolon kabul edilmeyecek.\n\nDAR ADAYDAN SEÇİM MODU ÖNCELİĞİ:\n• Dar aday modu devreye girerse Jaccard / max ortak / uç skor / frekans dengesi otomatik red sebebi değil, seçim önceliğidir.\n• Aktif kesin kurallardan geçen aday havuzu hedef kolon sayısı ile dar aday üst sınırı arasında kalırsa üretim engellenmeyecek.\n• Aday havuzu kurallar gevşetilerek gereksiz yere 300+ seviyesine şişirilmeyecek.\n• Dar aday havuzundan en iyi hedef kolon sayısı seçilecek.\n\n════════════════════════════════════════\n16. ÇIKTI FORMATI\n════════════════════════════════════════\n• Her satır: 6 sayı, TAB ile ayrılmış\n• Toplam ${target} satır, kod bloğu içinde\n• Sayılar küçükten büyüğe sıralı · Satır numarası ekleme${checker}`;
        return prompt;
      };

      function installDiagonalUI() {
        const arith = [...document.querySelectorAll('.card')].find(c => (c.querySelector('.card-title')?.textContent || '').toLowerCase().includes('aritmetik'));
        if (!arith || $('p-diag9-min')) return;
        const title = arith.querySelector('.card-title'); if (title) title.textContent = 'Çapraz zincir kuralı';
        const note = arith.querySelector('.card-note'); if (note) note.textContent = '9x10 kupon geometrisi';
        const body = arith.querySelector('.v55-card-body') || arith;
        body.innerHTML = `<div class="section-note purple">Bu bölüm genel +9/+11 farkını değil, 9x10 loto kuponundaki gerçek çapraz zincirleri kontrol eder. Örnek: 11-20 fark 9 olsa bile aynı yatay satırdadır; çapraz sayılmaz.</div>
      <div class="row"><div class="row-lbl">+9 çapraz zincir<div class="row-sub">Örnek: 15-24-33-42-51</div></div><select class="num-in" id="p-diag9-min" style="width:190px"><option value="0" selected>Kapalı</option><option value="2">2'li ve üzeri yasak</option><option value="3">3'lü ve üzeri yasak</option><option value="4">4'lü ve üzeri yasak</option></select></div>
      <div class="row"><div class="row-lbl">+11 çapraz zincir<div class="row-sub">Örnek: 14-25-36-47-58</div></div><select class="num-in" id="p-diag11-min" style="width:190px"><option value="0" selected>Kapalı</option><option value="2">2'li ve üzeri yasak</option><option value="3">3'lü ve üzeri yasak</option><option value="4">4'lü ve üzeri yasak</option></select></div>`;
      }
      function installThemeUI() {
        if ($('v68-theme')) return;
        const bar = document.querySelector('.v55-topbar') || document.querySelector('.app-header');
        if (!bar) return;
        const wrap = document.createElement('span');
        wrap.style.display = 'inline-flex'; wrap.style.alignItems = 'center'; wrap.style.gap = '6px'; wrap.style.marginLeft = '8px';
        wrap.innerHTML = '<span class="label">Renk</span><select id="v68-theme" class="num-in" style="width:110px"><option value="red">Kırmızı</option><option value="blue">Mavi</option><option value="green">Yeşil</option><option value="orange">Turuncu</option></select>';
        bar.appendChild(wrap);
        const apply = t => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('v68-theme', t); };
        $('v68-theme').value = localStorage.getItem('v68-theme') || 'red'; apply($('v68-theme').value);
        $('v68-theme').addEventListener('change', e => apply(e.target.value));
      }
      function installDrawMap() {
        if ($('draw-map-card')) return;
        const poolCard = [...document.querySelectorAll('.card')].find(c => (c.querySelector('.card-title')?.textContent || '').toLowerCase().includes('sayı havuzu'));
        if (!poolCard) return;
        const card = document.createElement('div'); card.className = 'card'; card.id = 'draw-map-card';
        card.innerHTML = `<div class="card-head"><div class="step-dot new">H</div><span class="card-title">Çekiliş Haritası / Son 7 Çekiliş</span><span class="new-badge">Final</span><span class="card-note">havuz öneri yardımcısı</span></div>
    <div class="section-note purple">Son 15 çekilişi 9x10 kupon yerleşiminde işaretle. Tekrar eden sayılar ve komşuluk yoğunlukları raporlanır; önerilenleri havuza ekleyebilirsin.</div>
    <div class="draw-tabs" id="draw-tabs"></div><div class="draw-map-toolbar"><button class="mini-btn" type="button" id="draw-clear-active">Aktif çekilişi temizle</button><button class="mini-btn" type="button" id="draw-clear-all">Tümünü temizle</button><button class="mini-btn" type="button" id="draw-analyze">Haritayı analiz et</button><button class="mini-btn" type="button" id="draw-add-selected">Seçilenleri havuza ekle</button><button class="mini-btn" type="button" id="draw-add-top">Önerilen 25'i havuza ekle</button></div>
    <div class="draw-grid" id="draw-grid"></div><div class="map-report-grid"><textarea id="draw-map-report" class="elim-output" readonly placeholder="Son 15 çekilişi işaretle, sonra Haritayı analiz et."></textarea><div id="map-suggestion-box" class="map-suggestion-box"></div></div>`;
        poolCard.parentNode.insertBefore(card, poolCard);
        let active = 0; const draws = Array.from({ length: 7 }, () => new Set()); let selected = new Set(); let suggestions = [];
        const max = () => currentGameMax();
        function renderTabs() { $('draw-tabs').innerHTML = draws.map((d, i) => `<button type="button" class="draw-tab ${i === active ? 'active' : ''}" data-i="${i}">Ç${i + 1} (${d.size})</button>`).join(''); }
        function renderGrid() { const m = max(); let html = ''; for (let n = 1; n <= m; n++) { const cnt = draws.reduce((a, d) => a + (d.has(n) ? 1 : 0), 0); const cls = cnt >= 3 ? ' rep3' : cnt === 2 ? ' rep2' : cnt === 1 ? ' d1' : ''; html += `<div class="draw-cell${cls}" data-n="${n}">${n}${cnt ? `<span class="mini-count">${cnt}</span>` : ''}</div>`; } $('draw-grid').innerHTML = html; }
        function analyze() { const counts = {}; draws.forEach(d => d.forEach(n => counts[n] = (counts[n] || 0) + 1)); suggestions = Object.keys(counts).map(Number).sort((a, b) => (counts[b] - counts[a]) || a - b); if (suggestions.length < 25) { for (const n of pool) { if (!suggestions.includes(n)) suggestions.push(n); if (suggestions.length >= 25) break; } } selected = new Set(suggestions.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10))); $('draw-map-report').value = `İşaretli farklı sayı: ${Object.keys(counts).length}\nTekrar edenler: ${Object.entries(counts).filter(([, c]) => c > 1).map(([n, c]) => n + '(' + c + ')').join(', ') || 'Yok'}\nÖnerilen ilk 25: ${suggestions.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10)).join(', ')}`; renderSuggestions(); }
        function renderSuggestions() { $('map-suggestion-box').innerHTML = suggestions.slice(0, 40).map(n => `<span class="map-chip ${selected.has(n) ? 'selected' : ''}" data-n="${n}">${n}<span class="score">${draws.reduce((a, d) => a + (d.has(n) ? 1 : 0), 0)}T</span></span>`).join('') || '<div class="elim-help">Analiz bekleniyor.</div>'; }
        function addNums(nums) { const cur = new Set(parseNumbers($('poolInput').value)); nums.forEach(n => cur.add(n)); $('poolInput').value = [...cur].sort((a, b) => a - b).join(', '); parsePool(); scheduleAutosave && scheduleAutosave(); }
        card.addEventListener('click', e => { const tab = e.target.closest('.draw-tab'); if (tab) { active = +tab.dataset.i; renderTabs(); return; } const cell = e.target.closest('.draw-cell'); if (cell) { const n = +cell.dataset.n; draws[active].has(n) ? draws[active].delete(n) : draws[active].add(n); renderTabs(); renderGrid(); return; } const chip = e.target.closest('.map-chip'); if (chip) { const n = +chip.dataset.n; selected.has(n) ? selected.delete(n) : selected.add(n); renderSuggestions(); } });
        $('draw-clear-active').onclick = () => { draws[active].clear(); renderTabs(); renderGrid(); }; $('draw-clear-all').onclick = () => { draws.forEach(d => d.clear()); renderTabs(); renderGrid(); $('draw-map-report').value = ''; $('map-suggestion-box').innerHTML = ''; }; $('draw-analyze').onclick = analyze; $('draw-add-selected').onclick = () => addNums([...selected]); $('draw-add-top').onclick = () => { if (!suggestions.length) analyze(); addNums(suggestions.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10))); };
        renderTabs(); renderGrid();
      }
      function installCheckerOption() {
        if ($('p-checker')) return;
        const promptCard = $('prompt-output')?.closest('.prompt-output-card');
        const anchor = promptCard || document.querySelector('.quick-guide');
        if (!anchor) return;
        const row = document.createElement('div'); row.className = 'section-note purple'; row.style.marginBottom = '10px'; row.innerHTML = '<label class="check-wrap"><input type="checkbox" id="p-checker" checked> Checker promptunu da ekle</label><div class="inline-help">Kolon üretildikten sonra aynı aktif kurallarla denetim yapabilmek için ek kontrol metni üretir.</div>';
        anchor.parentNode.insertBefore(row, anchor);
      }
      function patchPromptButtons() {
        document.querySelectorAll('button').forEach(b => { if ((b.textContent || '').toLowerCase().includes('analiz et')) b.id = b.id || 'analyze-btn'; });
      }
      function initPatch() {
        installDiagonalUI(); installThemeUI(); installDrawMap(); installCheckerOption(); patchPromptButtons();
        updateQuotaStatus && updateQuotaStatus();
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPatch); else setTimeout(initPatch, 0);
    })();
  