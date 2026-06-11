
    (function () {
      function $v70(id) { return document.getElementById(id); }
      function v70Bool(id, def) { const el = $v70(id); return el ? !!el.checked : !!def; }
      function v70Num(id, def) { const el = $v70(id); const v = el ? parseFloat(String(el.value).replace(',', '.')) : NaN; return Number.isFinite(v) ? v : def; }
      function v70RiskSettings() {
        const packRiskCols = v70Num('p-pack-risk-cols', 8);
        return {
          active: v70Bool('p-risk-quota-active', true),
          minCols: v70Num('p-risk-min-cols', packRiskCols || 8),
          threshold: v70Num('p-risk-score-threshold', 14),
          mediumThreshold: Math.max(0, v70Num('p-risk-score-threshold', 14) - 5)
        };
      }
      function v70ReasonText(it) { return ((it && it.reasons) || []).join(' ').toLowerCase(); }
      function v70RiskClass(it, settings) {
        const score = Number(it && it.score) || 0;
        const txt = v70ReasonText(it);
        const riskyWords = /(dağınık|daginik|aritmetik|uç|uc|gap|sıçrama|sicrama|mekanik|toplam sınırı|toplam hafif|risk)/i;
        if (score >= settings.threshold || riskyWords.test(txt)) return 'Riskli ama geçerli';
        if (score >= settings.mediumThreshold || ((it && it.reasons) || []).length >= 2) return 'Orta riskli';
        return 'Dengeli';
      }
      function v70Common(a, b) {
        if (typeof commonCount === 'function') return commonCount(a, b);
        let c = 0, set = new Set(a); for (const n of b) { if (set.has(n)) c++; } return c;
      }
      function v70SimilarityOk(a, b, k, j, maxCommon) {
        const com = v70Common(a, b);
        if (com > maxCommon) return false;
        const jac = com / (k * 2 - com);
        return jac <= Number(j || 0.9) + 1e-9;
      }
      function v70AddBySimilarity(selected, candidates, count, cfg, selectedKeys) {
        let added = 0;
        outer: for (const it of candidates) {
          if (added >= count) break;
          const key = it.combo.join('-');
          if (selectedKeys.has(key)) continue;
          // Paket içi benzerlik kontrolü: global son kontrol değil, seçildiği paket içindeki sınır.
          for (const s of selected.filter(x => x._pkg === cfg.pkgName)) {
            if (!v70SimilarityOk(it.combo, s.combo, cfg.k, cfg.jaccard, cfg.maxCommon)) continue outer;
          }
          const copy = Object.assign({}, it, { _pkg: cfg.pkgName, _riskClass: v70RiskClass(it, v70RiskSettings()) });
          selected.push(copy); selectedKeys.add(key); added++;
        }
        return added;
      }
      function v70ComboSum(c) { return c.reduce((a, b) => a + b, 0); }
      function v70SelectedStats(selected, k) {
        let maxCommon = 0, maxJ = 0;
        for (let i = 0; i < selected.length; i++) for (let j = i + 1; j < selected.length; j++) {
          const com = v70Common(selected[i].combo, selected[j].combo);
          const jac = com / (k * 2 - com);
          if (com > maxCommon) maxCommon = com;
          if (jac > maxJ) maxJ = jac;
        }
        return { maxCommon, maxJ };
      }
      function v70RiskSummary(items, selected, settings) {
        const countBy = arr => arr.reduce((m, it) => { const c = v70RiskClass(it, settings); m[c] = (m[c] || 0) + 1; return m; }, {});
        const selBy = (selected || []).reduce((m, it) => { const c = it._riskClass || v70RiskClass(it, settings); m[c] = (m[c] || 0) + 1; return m; }, {});
        return { available: countBy(items || []), selected: selBy, threshold: settings.threshold, minCols: settings.minCols, active: settings.active };
      }

      const oldJaccard = window.jaccardFeasibilityCheck || (typeof jaccardFeasibilityCheck !== 'undefined' ? jaccardFeasibilityCheck : null);
      window.jaccardFeasibilityCheck = function (scoredItems, p) {
        const settings = v70RiskSettings();
        const pkg = p && p.packages;
        if (!settings.active || !pkg || !pkg.active || !Array.isArray(scoredItems) || !scoredItems.length) {
          const base = oldJaccard ? oldJaccard(scoredItems, p) : { bestCount: 0, target: (p && p.cols) || 0, ok: false, selected: [] };
          base.riskSummary = v70RiskSummary(scoredItems || [], base.selected || [], settings);
          return base;
        }
        const items = scoredItems.map((x, idx) => ({
          combo: (x.combo || x).slice().sort((a, b) => a - b),
          score: Number(x.score) || 0,
          idx,
          sum: v70ComboSum(x.combo || x),
          reasons: x.reasons || []
        }));
        const target = (p && p.cols) || ((pkg.main.cols || 0) + (pkg.deep.cols || 0) + (pkg.risk.cols || 0));
        const selected = [], keys = new Set();
        const classified = items.map(it => Object.assign({}, it, { _riskClass: v70RiskClass(it, settings) }));
        const balanced = classified.filter(it => it._riskClass === 'Dengeli').sort((a, b) => a.score - b.score || Math.abs(a.sum - 300) - Math.abs(b.sum - 300));
        const medium = classified.filter(it => it._riskClass === 'Orta riskli').sort((a, b) => a.score - b.score);
        const risky = classified.filter(it => it._riskClass === 'Riskli ama geçerli').sort((a, b) => b.score - a.score || b.sum - a.sum);
        const allCleanFirst = classified.slice().sort((a, b) => a.score - b.score || a.idx - b.idx);
        const allDiverse = classified.slice().sort((a, b) => Math.abs(a.sum - 300) - Math.abs(b.sum - 300) || a.score - b.score);
        const k = (p && p.k) || 6;
        const cfgMain = { pkgName: 'Ana Dengeli Paket', k, jaccard: pkg.main.jaccard, maxCommon: pkg.main.maxCommon };
        const cfgDeep = { pkgName: 'Çekirdek Destek Paketi', k, jaccard: pkg.deep.jaccard, maxCommon: pkg.deep.maxCommon };
        const cfgRisk = { pkgName: 'Kontrollü Risk Paketi', k, jaccard: pkg.risk.jaccard, maxCommon: pkg.risk.maxCommon };
        const riskNeed = Math.min(settings.minCols || 0, pkg.risk.cols || 0, target);
        // Önce risk paketine gerçekten riskli ama geçerli adayları ayır.
        v70AddBySimilarity(selected, risky, riskNeed, cfgRisk, keys);
        // Riskli aday yeterli değilse orta risklilerle tamamla.
        if (selected.filter(x => x._pkg === cfgRisk.pkgName).length < (pkg.risk.cols || 0)) {
          v70AddBySimilarity(selected, medium.slice().reverse(), (pkg.risk.cols || 0) - selected.filter(x => x._pkg === cfgRisk.pkgName).length, cfgRisk, keys);
        }
        // Ana ve destek paketlerini doldur.
        v70AddBySimilarity(selected, balanced.concat(medium), pkg.main.cols || 0, cfgMain, keys);
        v70AddBySimilarity(selected, medium.concat(balanced, risky), pkg.deep.cols || 0, cfgDeep, keys);
        // Risk paketi hâlâ eksikse tüm geçerli adaylardan tamamla.
        if (selected.filter(x => x._pkg === cfgRisk.pkgName).length < (pkg.risk.cols || 0)) {
          v70AddBySimilarity(selected, risky.concat(medium, balanced), (pkg.risk.cols || 0) - selected.filter(x => x._pkg === cfgRisk.pkgName).length, cfgRisk, keys);
        }
        // Toplam 60 eksikse tüm adaylardan doldur, ama paket isimlerini 'Tamamlama' yap.
        if (selected.length < target) {
          v70AddBySimilarity(selected, allCleanFirst.concat(allDiverse), target - selected.length, { pkgName: 'Tamamlama', k, jaccard: pkg.risk.jaccard, maxCommon: pkg.risk.maxCommon }, keys);
        }
        const stats = v70SelectedStats(selected, k);
        const riskSummary = v70RiskSummary(classified, selected, settings);
        const riskSelected = selected.filter(x => x._riskClass === 'Riskli ama geçerli').length;
        return {
          bestCount: selected.length,
          target,
          ok: selected.length >= target,
          selected,
          bestName: 'Riskli geçerli aday kotası + paket bazlı seçim',
          stats,
          riskSummary,
          trials: [
            { name: 'Riskli geçerli aday kotası', count: riskSelected },
            { name: 'Toplam seçilen', count: selected.length },
            { name: 'Riskli aday havuzu', count: (riskSummary.available['Riskli ama geçerli'] || 0) },
            { name: 'Orta riskli aday havuzu', count: (riskSummary.available['Orta riskli'] || 0) }
          ],
          status: selected.length >= target ? 'Uygun' : 'Yetersiz'
        };
      };
      try { jaccardFeasibilityCheck = window.jaccardFeasibilityCheck; } catch (e) { }

      // Jaccard raporuna risk sınıfı özetini ekle.
      const oldRenderJ = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
      window.renderJaccardReport = function () {
        if (oldRenderJ) oldRenderJ();
        const out = $v70('jacc-output');
        const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        const r = data && data.jaccardReport;
        if (!out || !r || !r.riskSummary) return;
        const rs = r.riskSummary;
        const a = rs.available || {}, s = rs.selected || {};
        const extra = [
          '',
          'RİSKLİ GEÇERLİ ADAY KOTASI',
          '────────────────────────────',
          `Risk kotası aktif        : ${rs.active ? 'EVET' : 'HAYIR'}`,
          `Risk skor eşiği          : ${rs.threshold}`,
          `Hedef riskli kolon       : ${rs.minCols}`,
          `Aday havuzunda dengeli   : ${a['Dengeli'] || 0}`,
          `Aday havuzunda orta risk : ${a['Orta riskli'] || 0}`,
          `Aday havuzunda riskli    : ${a['Riskli ama geçerli'] || 0}`,
          `Seçilen dengeli          : ${s['Dengeli'] || 0}`,
          `Seçilen orta risk        : ${s['Orta riskli'] || 0}`,
          `Seçilen riskli           : ${s['Riskli ama geçerli'] || 0}`,
          '',
          'Riskli ama geçerli adaylar aktif kesin kuralları ihlal etmediği sürece final seçim havuzunda korunur; Kontrollü Risk Paketi bu gruptan zorunlu pay alır.'
        ];
        if (!out.value.includes('RİSKLİ GEÇERLİ ADAY KOTASI')) out.value += '\n' + extra.join('\n');
      };
      try { renderJaccardReport = window.renderJaccardReport; } catch (e) { }

      // Prompt motoruna riskli geçerli aday kotası talimatını kilitle.
      const oldBuild = window.buildPrompt || (typeof buildPrompt !== 'undefined' ? buildPrompt : null);
      function v70RiskPromptBlock() {
        const st = v70RiskSettings();
        return `\n════════════════════════════════════════\n11B. GEÇERLİ ADAY HAVUZUNDAN FİNAL SEÇİM KURALI\n════════════════════════════════════════\n• Riskli ama geçerli aday kotası: ${st.active ? 'AKTİF' : 'PASİF'}\n• Riskli aday skor eşiği: ${st.threshold}\n• Final 60 kolon yalnızca en temiz/dengeli adaylardan seçilmeyecek.\n• Aktif kesin kuralları geçen adaylar üç sınıfa ayrılacak: Dengeli, Orta riskli, Riskli ama geçerli.\n• Kontrollü Risk Paketi için en az ${st.minCols} kolon riskli ama geçerli adaylardan seçilecek.\n• Bu gruba skor, gap, dağınıklık, aritmetik üçlü, toplam uca yakınlık veya geometrik kalite uyarısı olan ama aktif kesin kural ihlali yapmayan kolonlar girer.\n• Riskli ama geçerli adaylar kesin kural ihlali yapmadığı sürece final seçim havuzundan silinmeyecek.\n• Aday havuzu 60’tan büyük olduğunda seçim motoru 60 kolonu sadece düşük skorlu adaylardan değil; paketlerin risk amacına göre dağıtarak seçecek.\n`;
      }
      window.buildPrompt = function () {
        let s = oldBuild ? oldBuild() : '';
        const block = v70RiskPromptBlock();
        if (!s.includes('11B. GEÇERLİ ADAY HAVUZUNDAN FİNAL SEÇİM KURALI')) {
          s = s.replace('\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR', block + '\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR');
        }
        s = s.replace('[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi', '[ ] Riskli ama geçerli aday kotası uygulandı mı? Kontrollü Risk Paketi en temiz adaylardan değil riskli geçerli adaylardan pay aldı mı?\n[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi');
        return s;
      };
      try { buildPrompt = window.buildPrompt; } catch (e) { }
      window.buildAndSend = function () {
        if (typeof parsePool === 'function') parsePool();
        const prompt = window.buildPrompt();
        window.lastPrompt = prompt;
        try { if (typeof lastPrompt !== 'undefined') lastPrompt = prompt; } catch (e) { }
        if (typeof putPromptToScreen === 'function') putPromptToScreen(prompt); else { const out = $v70('prompt-output'); if (out) out.value = prompt; const card = $v70('prompt-output-card'); if (card) card.classList.add('show'); }
        if (navigator.clipboard) navigator.clipboard.writeText(prompt).then(() => alert('Prompt oluşturuldu ve panoya kopyalandı.')).catch(() => alert('Prompt oluşturuldu. Kutudan kopyalayabilirsin.'));
      };
      try { buildAndSend = window.buildAndSend; } catch (e) { }
      window.copyPrompt = function () { const prompt = window.buildPrompt(); window.lastPrompt = prompt; try { if (typeof lastPrompt !== 'undefined') lastPrompt = prompt; } catch (e) { } if (typeof putPromptToScreen === 'function') putPromptToScreen(prompt); if (navigator.clipboard) navigator.clipboard.writeText(prompt); };
      try { copyPrompt = window.copyPrompt; } catch (e) { }
    })();
  