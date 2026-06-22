
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const fmt = c => (c || []).slice().sort((a, b) => a - b).join('-');
      const fmtTab = c => (c || []).slice().sort((a, b) => a - b).join('\t');
      function num(id, def) { const el = $(id); const v = el ? parseFloat(String(el.value).replace(',', '.')) : NaN; return Number.isFinite(v) ? v : def; }
      function bool(id, def) { const el = $(id); return el ? !!el.checked : !!def; }
      function save() { try { if (typeof scheduleAutosave === 'function') scheduleAutosave(); else if (typeof saveSettingsNow === 'function') saveSettingsNow(true); } catch (e) { } }

      function css() {
        if ($('v73-css')) return;
        const st = document.createElement('style');
        st.id = 'v73-css';
        st.textContent = `
      .v73-mini-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}
      .v73-mini-box{background:rgba(0,0,0,.18);border:1px solid var(--color-border-tertiary);border-radius:14px;padding:8px;text-align:center}
      .v73-mini-box .v{font-size:17px;font-weight:900;color:var(--color-text-primary)}
      .v73-mini-box .l{font-size:10px;color:var(--color-text-secondary);margin-top:2px;line-height:1.25}
      .v73-band-table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
      .v73-band-table th,.v73-band-table td{padding:6px;border-bottom:1px solid var(--color-border-tertiary);text-align:center}
      .v73-band-table th:first-child,.v73-band-table td:first-child{text-align:left}
      .v73-band-table input{width:70px;padding:5px 6px;border-radius:10px;border:1px solid var(--color-border-secondary);background:var(--color-background-secondary);color:var(--color-text-primary);text-align:center}
      .v73-ok{color:#7ff5bc!important}.v73-bad{color:#ff9fa8!important}.v73-warn{color:#ffd36f!important}
      @media(max-width:900px){.v73-mini-grid{grid-template-columns:repeat(2,1fr)}}
    `;
        document.head.appendChild(st);
      }

      function buildCards() {
        css();
        if (!$('v73-control-card')) {
          const card = document.createElement('div');
          card.className = 'card'; card.id = 'v73-control-card';
          card.innerHTML = `
        <div class="card-head"><div class="step-dot new">K</div><span class="card-title">Kontrol Kolonu Analizi</span><span class="new-badge">v7.3.1</span><span class="card-note">backtest sonucu nerede kaldı?</span></div>
        <div class="section-note purple">Backtest modunda girilen gerçek sonuç / kontrol kolonu üretime zorunlu eklenmez. Bu panel, o kolonun aktif kesin kurallardan geçip geçmediğini, skordan sonra kalıp kalmadığını ve final Jaccard seçimine girip girmediğini gösterir.</div>
        <div class="v73-mini-grid">
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-combo">—</div><div class="l">Kontrol kolonu</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-valid">—</div><div class="l">Kesin kurallar</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-score">—</div><div class="l">Skor / risk</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-passed">—</div><div class="l">Uç/skor sonrası</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-final">—</div><div class="l">Final seçim</div></div>
        </div>
        <textarea id="v73-control-output" class="elim-output" readonly style="margin-top:10px;min-height:150px" placeholder="Backtest modunda kontrol kolonu gir ve Analiz Et butonuna bas."></textarea>
      `;
          const score = document.querySelector('.score-panel');
          if (score && score.parentNode) score.parentNode.insertBefore(card, score.nextSibling);
        }
        if (!$('v73-band-card')) {
          const card = document.createElement('div');
          card.className = 'card'; card.id = 'v73-band-card';
          card.innerHTML = `
        <div class="card-head"><div class="step-dot new">B</div><span class="card-title">Skor Bandı Karışım Modu</span><span class="new-badge">v7.3.1</span><span class="card-note">Jaccard seçimi skor uçlarına yığılmasın</span></div>
        <div class="section-note purple">Bu mod Jaccard seçiminde yalnız skor 0 ve yüksek skor uçlarının baskın olmasını azaltır. Önce skor bantlarından minimum pay alınır, sonra Jaccard / max ortak / frekans öncelikleriyle tamamlanır.</div>
        <div class="row"><div class="row-lbl">Skor bandı kotası<div class="row-sub">aktifse final seçim skor bantlarından karışık yapılır</div></div><label class="check-wrap"><input type="checkbox" id="p-band-active" checked>Aktif</label></div>
        <table class="v73-band-table">
          <thead><tr><th>Skor bandı</th><th>Minimum</th><th>Maksimum</th></tr></thead>
          <tbody>
            <tr><td>0–5 düşük skor</td><td><input type="number" id="p-band-0-5-min" value="12" min="0" max="300"></td><td><input type="number" id="p-band-0-5-max" value="20" min="0" max="300"></td></tr>
            <tr><td>6–10 orta düşük</td><td><input type="number" id="p-band-6-10-min" value="8" min="0" max="300"></td><td><input type="number" id="p-band-6-10-max" value="18" min="0" max="300"></td></tr>
            <tr><td>11–15 orta</td><td><input type="number" id="p-band-11-15-min" value="8" min="0" max="300"></td><td><input type="number" id="p-band-11-15-max" value="18" min="0" max="300"></td></tr>
            <tr><td>16–20 orta risk</td><td><input type="number" id="p-band-16-20-min" value="8" min="0" max="300"></td><td><input type="number" id="p-band-16-20-max" value="18" min="0" max="300"></td></tr>
            <tr><td>21+ yüksek risk</td><td><input type="number" id="p-band-21-min" value="0" min="0" max="300"></td><td><input type="number" id="p-band-21-max" value="8" min="0" max="300"></td></tr>
          </tbody>
        </table>
        <div class="section-note" id="v73-band-status">Analiz sonrası seçilen kolonların skor bandı dağılımı burada raporlanır.</div>
      `;
          const jcard = $('jaccard-report-card');
          if (jcard && jcard.parentNode) jcard.parentNode.insertBefore(card, jcard.nextSibling);
          card.querySelectorAll('input').forEach(x => x.addEventListener('input', save));
          const active = $('p-band-active'); if (active) active.addEventListener('change', save);
        }
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildCards); else buildCards();

      function controlNums() {
        if (typeof window.v72ControlNumbers === 'function') return window.v72ControlNumbers();
        return String(($('p-control-result') || {}).value || '').split(/[^0-9]+/).map(x => parseInt(x, 10)).filter(Number.isFinite).sort((a, b) => a - b);
      }
      function sameCombo(a, b) { if (!a || !b || a.length !== b.length) return false; const x = a.slice().sort((m, n) => m - n), y = b.slice().sort((m, n) => m - n); return x.every((v, i) => v === y[i]); }
      function reasonText(it) { return ((it && it.reasons) || []).join(', ') || 'neden yok'; }
      function riskClass(it) {
        const score = Number(it && it.score) || 0; const txt = reasonText(it).toLowerCase();
        if (/dağınık|daginik|aritmetik|uç|uc|gap|sıçrama|sicrama|mekanik|risk/.test(txt) || score >= 16) return 'Riskli ama geçerli';
        if (score >= 6 || ((it && it.reasons) || []).length >= 2) return 'Orta riskli';
        return 'Dengeli';
      }
      function renderControlPanel() {
        const out = $('v73-control-output'); if (!out) return;
        const nums = controlNums();
        const mode = typeof window.v72Mode === 'function' ? window.v72Mode() : (($('p-work-mode') || {}).value || 'live');
        $('v73-ctrl-combo').textContent = nums.length ? nums.join('-') : '—';
        if (mode !== 'backtest') {
          ['v73-ctrl-valid', 'v73-ctrl-score', 'v73-ctrl-passed', 'v73-ctrl-final'].forEach(id => { const e = $(id); if (e) e.textContent = '—'; });
          out.value = 'Gerçek çekiliş üretim modunda kontrol kolonu aranmaz. Backtest moduna geçip gerçek sonucu girersen bu panel analiz yapar.';
          return;
        }
        if (nums.length !== 6) {
          ['v73-ctrl-valid', 'v73-ctrl-score', 'v73-ctrl-passed', 'v73-ctrl-final'].forEach(id => { const e = $(id); if (e) e.textContent = '—'; });
          out.value = 'Kontrol kolonu için 6 sayı gir ve Analiz Et butonuna bas.';
          return;
        }
        const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        if (!data) { out.value = 'Analiz sonucu yok. Önce Analiz Et butonuna bas.'; return; }
        const scored = (data.scored || []).find(x => sameCombo(x.combo, nums));
        const rejected = (data.rejected || []).find(x => sameCombo(x.combo, nums));
        const passed = (data.passed || []).find(x => sameCombo(x.combo, nums));
        const selected = (((data.jaccardReport || {}).selected) || []).find(x => sameCombo(x.combo, nums));
        const valid = !!scored;
        const after = !!passed && !rejected;
        const final = !!selected;
        const item = scored || passed || selected || null;
        const score = item ? Number(item.score || 0) : '—';
        const rclass = item ? riskClass(item) : '—';
        $('v73-ctrl-valid').innerHTML = valid ? '<span class="v73-ok">EVET</span>' : '<span class="v73-bad">HAYIR</span>';
        $('v73-ctrl-score').innerHTML = item ? `${score}<br><span style="font-size:10px">${rclass}</span>` : '—';
        $('v73-ctrl-passed').innerHTML = after ? '<span class="v73-ok">EVET</span>' : (valid ? '<span class="v73-bad">HAYIR</span>' : '—');
        $('v73-ctrl-final').innerHTML = final ? '<span class="v73-ok">EVET</span>' : (after ? '<span class="v73-warn">HAYIR</span>' : '—');
        const lines = [];
        lines.push('KONTROL KOLONU ANALİZİ');
        lines.push('-----------------------');
        lines.push(`Kontrol kolonu        : ${nums.join('-')}`);
        lines.push(`Aktif kesin kurallar  : ${valid ? 'GEÇTİ' : 'GEÇMEDİ / aday havuzunda yok'}`);
        if (item) {
          lines.push(`Skor                  : ${score}`);
          lines.push(`Risk sınıfı           : ${rclass}`);
          lines.push(`Nedenler              : ${reasonText(item)}`);
        }
        lines.push(`Uç/skor sonrası kaldı : ${after ? 'EVET' : 'HAYIR'}`);
        lines.push(`Final Jaccard seçimi  : ${final ? 'EVET' : 'HAYIR'}`);
        if (after && !final) {
          lines.push('');
          lines.push('Seçilmemişse muhtemel sebep: skor bandı kotası, paket kotası, Jaccard/max ortak rekabeti veya frekans dengeleme önceliği.');
        }
        out.value = lines.join('\n');
      }

      function bandSettings() {
        return {
          active: bool('p-band-active', true),
          bands: [
            { key: '0-5', label: '0–5', minScore: 0, maxScore: 5, min: num('p-band-0-5-min', 12), max: num('p-band-0-5-max', 20) },
            { key: '6-10', label: '6–10', minScore: 6, maxScore: 10, min: num('p-band-6-10-min', 8), max: num('p-band-6-10-max', 18) },
            { key: '11-15', label: '11–15', minScore: 11, maxScore: 15, min: num('p-band-11-15-min', 8), max: num('p-band-11-15-max', 18) },
            { key: '16-20', label: '16–20', minScore: 16, maxScore: 20, min: num('p-band-16-20-min', 8), max: num('p-band-16-20-max', 18) },
            { key: '21+', label: '21+', minScore: 21, maxScore: 999, min: num('p-band-21-min', 0), max: num('p-band-21-max', 8) }
          ]
        };
      }
      function bandOf(score, settings) { score = Number(score) || 0; return settings.bands.find(b => score >= b.minScore && score <= b.maxScore) || settings.bands[settings.bands.length - 1]; }
      function common(a, b) { if (typeof commonCount === 'function') return commonCount(a, b); const s = new Set(a); let c = 0; for (const n of b) if (s.has(n)) c++; return c; }
      function simOk(a, b, k, j, maxC) { const c = common(a, b); if (c > maxC) return false; return c / (k * 2 - c) <= Number(j || 0.9) + 1e-9; }
      function stats(selected, k) { let mc = 0, mj = 0; for (let i = 0; i < selected.length; i++) for (let j = i + 1; j < selected.length; j++) { const c = common(selected[i].combo, selected[j].combo); const jj = c / (k * 2 - c); if (c > mc) mc = c; if (jj > mj) mj = jj; } return { maxCommon: mc, maxJ: mj }; }
      function countsByBand(items, settings) { const m = {}; (items || []).forEach(it => { const b = bandOf(it.score, settings); m[b.key] = (m[b.key] || 0) + 1; }); return m; }
      function selectedBandCount(selected, key, settings) { return selected.filter(it => bandOf(it.score, settings).key === key).length; }
      function addCandidates(selected, keys, candidates, need, cfg, settings, bandMaxMap) {
        let add = 0; outer: for (const it of candidates) {
          if (add >= need) break;
          const key = fmt(it.combo); if (keys.has(key)) continue;
          const band = bandOf(it.score, settings); const max = bandMaxMap[band.key];
          if (Number.isFinite(max) && selectedBandCount(selected, band.key, settings) >= max) continue;
          const samePkg = selected.filter(x => x._pkg === cfg.pkgName);
          for (const s of samePkg) { if (!simOk(it.combo, s.combo, cfg.k, cfg.jaccard, cfg.maxCommon)) continue outer; }
          const copy = Object.assign({}, it, { _pkg: cfg.pkgName, _band: band.key, _bandLabel: band.label, _riskClass: riskClass(it) });
          selected.push(copy); keys.add(key); add++;
        }
        return add;
      }

      const prevJaccard = window.jaccardFeasibilityCheck || (typeof jaccardFeasibilityCheck !== 'undefined' ? jaccardFeasibilityCheck : null);
      window.jaccardFeasibilityCheck = function (scoredItems, p) {
        const settings = bandSettings();
        if (!settings.active || !Array.isArray(scoredItems) || !scoredItems.length) { return prevJaccard ? prevJaccard(scoredItems, p) : { bestCount: 0, target: (p && p.cols) || 0, ok: false, selected: [] }; }
        const target = (p && p.cols) || 60, k = (p && p.k) || 6;
        const items = scoredItems.map((x, idx) => ({ combo: (x.combo || x).slice().sort((a, b) => a - b), score: Number(x.score) || 0, idx, sum: (x.combo || x).reduce((a, b) => a + b, 0), reasons: x.reasons || [] }));
        const pack = (p && p.packages && p.packages.active) ? p.packages : null;
        const cfg = {
          main: { pkgName: 'Ana Dengeli Paket', k, jaccard: pack ? pack.main.jaccard : (p.jaccard || 0.6), maxCommon: pack ? pack.main.maxCommon : (p.maxCommon || 4), cols: pack ? pack.main.cols : Math.ceil(target * 0.35) },
          deep: { pkgName: 'Çekirdek Destek Paketi', k, jaccard: pack ? pack.deep.jaccard : (p.jaccard || 0.6), maxCommon: pack ? pack.deep.maxCommon : (p.maxCommon || 4), cols: pack ? pack.deep.cols : Math.ceil(target * 0.35) },
          risk: { pkgName: 'Kontrollü Risk Paketi', k, jaccard: pack ? pack.risk.jaccard : (p.jaccard || 0.6), maxCommon: pack ? pack.risk.maxCommon : (p.maxCommon || 4), cols: pack ? pack.risk.cols : target - Math.ceil(target * 0.70) }
        };
        const selected = [], keys = new Set();
        const bandMaxMap = {}; settings.bands.forEach(b => bandMaxMap[b.key] = Math.min(b.max, target));
        const byScore = items.slice().sort((a, b) => a.score - b.score || Math.abs(a.sum - 320) - Math.abs(b.sum - 320) || a.idx - b.idx);
        const byMid = items.slice().sort((a, b) => Math.abs(a.score - 12) - Math.abs(b.score - 12) || Math.abs(a.sum - 320) - Math.abs(b.sum - 320));
        const byRisk = items.slice().sort((a, b) => b.score - a.score || Math.abs(a.sum - 320) - Math.abs(b.sum - 320));
        const cfgForBand = b => (b.maxScore <= 5 ? cfg.main : (b.maxScore <= 15 ? cfg.deep : cfg.risk));
        // 1) Önce skor bandı minimumlarını doldur.
        for (const b of settings.bands) {
          const cands = items.filter(it => bandOf(it.score, settings).key === b.key).sort((a, b2) => Math.abs(a.sum - 320) - Math.abs(b2.sum - 320) || a.score - b2.score || a.idx - b2.idx);
          addCandidates(selected, keys, cands, Math.min(b.min, target - selected.length), cfgForBand(b), settings, bandMaxMap);
          if (selected.length >= target) break;
        }
        // 2) Paket amaçlarına göre doldur.
        addCandidates(selected, keys, byScore, cfg.main.cols - selected.filter(x => x._pkg === cfg.main.pkgName).length, cfg.main, settings, bandMaxMap);
        addCandidates(selected, keys, byMid, cfg.deep.cols - selected.filter(x => x._pkg === cfg.deep.pkgName).length, cfg.deep, settings, bandMaxMap);
        addCandidates(selected, keys, byRisk, cfg.risk.cols - selected.filter(x => x._pkg === cfg.risk.pkgName).length, cfg.risk, settings, bandMaxMap);
        // 3) Eksik kalırsa tüm bantlardan dönüşümlü tamamla.
        let guard = 0;
        while (selected.length < target && guard < 10) {
          guard++;
          for (const b of settings.bands) {
            const cands = items.filter(it => bandOf(it.score, settings).key === b.key).sort((a, b2) => a.idx - b2.idx);
            addCandidates(selected, keys, cands, 1, cfgForBand(b), settings, bandMaxMap);
            if (selected.length >= target) break;
          }
        }
        // 4) Hâlâ eksikse max band sınırını gevşet, ama kesin kurallardan çıkan aday dışına çıkma.
        if (selected.length < target) {
          settings.bands.forEach(b => bandMaxMap[b.key] = target);
          addCandidates(selected, keys, byMid.concat(byScore, byRisk), target - selected.length, cfg.risk, settings, bandMaxMap);
        }
        const st = stats(selected, k);
        const bandSummary = { settings, available: countsByBand(items, settings), selected: countsByBand(selected, settings) };
        return { bestCount: selected.length, target, ok: selected.length >= target, selected, bestName: 'Skor bandı karışım modu + Jaccard', stats: st, bandSummary, trials: settings.bands.map(b => ({ name: `Skor ${b.label}`, count: bandSummary.selected[b.key] || 0 })), status: selected.length >= target ? 'Uygun' : 'Yetersiz' };
      };
      try { jaccardFeasibilityCheck = window.jaccardFeasibilityCheck; } catch (e) { }

      const prevRenderJ = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
      window.renderJaccardReport = function () {
        if (prevRenderJ) prevRenderJ();
        const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        const r = data && data.jaccardReport;
        const out = $('jacc-output');
        const status = $('v73-band-status');
        if (!r || !r.bandSummary) { renderControlPanel(); return; }
        const bs = r.bandSummary, a = bs.available || {}, s = bs.selected || {};
        const lines = ['', 'SKOR BANDI DAĞILIMI', '────────────────────'];
        bs.settings.bands.forEach(b => lines.push(`Skor ${b.label.padEnd(5)} | aday: ${String(a[b.key] || 0).padStart(4)} | seçilen: ${String(s[b.key] || 0).padStart(3)} | min/max: ${b.min}/${b.max}`));
        if (out && !out.value.includes('SKOR BANDI DAĞILIMI')) out.value += '\n' + lines.join('\n');
        if (status) {
          status.innerHTML = bs.settings.bands.map(b => `<b>${b.label}</b>: aday ${a[b.key] || 0}, seçilen ${s[b.key] || 0}`).join(' · ');
        }
        renderControlPanel();
      };
      try { renderJaccardReport = window.renderJaccardReport; } catch (e) { }

      const prevRun = window.runAnalysis || (typeof runAnalysis !== 'undefined' ? runAnalysis : null);
      if (prevRun) {
        window.runAnalysis = function () { const r = prevRun.apply(this, arguments); setTimeout(() => { try { renderControlPanel(); if (window.renderJaccardReport) window.renderJaccardReport(); } catch (e) { } }, 220); return r; };
        try { runAnalysis = window.runAnalysis; } catch (e) { }
      }

      const prevBuild = window.buildPrompt || (typeof buildPrompt !== 'undefined' ? buildPrompt : null);
      function bandPromptBlock() {
        const st = bandSettings(); if (!st.active) return '\n• Skor bandı karışım modu: PASİF.\n';
        return `\n════════════════════════════════════════\n11C. SKOR BANDI KARIŞIM MODU\n════════════════════════════════════════\n• Skor bandı karışım modu: AKTİF.\n• Jaccard seçim motoru yalnızca en düşük skor veya en yüksek riskli skor uçlarına yığılmayacak.\n• Final seçimde skor bantlarından karışık pay alınacak; aynı bant içinde Jaccard / max ortak / frekans dengesi dikkate alınacak.\n${st.bands.map(b => `• Skor ${b.label}: minimum ${b.min}, maksimum ${b.max} kolon`).join('\n')}\n`;
      }
      window.buildPrompt = function () {
        let s = prevBuild ? prevBuild() : '';
        if (!s.includes('11C. SKOR BANDI KARIŞIM MODU')) {
          s = s.replace('\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR', bandPromptBlock() + '\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR');
        }
        return s;
      };
      try { buildPrompt = window.buildPrompt; } catch (e) { }
      window.v73RenderControlPanel = renderControlPanel;
    })();
  