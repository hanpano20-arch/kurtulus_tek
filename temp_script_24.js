
    (function () {
      'use strict';
      const KEY = 'v712_start_end_quota_lock_settings';
      const $ = id => document.getElementById(id);
      const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
      const DEFAULT_ROWS = [
        { name: 'Paket 1', sMin: 0, sMax: 0, eMin: 0, eMax: 0, count: 15 },
        { name: 'Paket 2', sMin: 0, sMax: 0, eMin: 0, eMax: 0, count: 15 },
        { name: 'Paket 3', sMin: 0, sMax: 0, eMin: 0, eMax: 0, count: 15 },
        { name: 'Paket 4', sMin: 0, sMax: 0, eMin: 0, eMax: 0, count: 15 }
      ];
      function num(id, def) { const el = $(id); const v = parseInt(el && el.value, 10); return Number.isFinite(v) ? v : def; }
      function bool(id, def) { const el = $(id); return el ? !!el.checked : !!def; }
      function comboKey(c) { return (c || []).slice().sort((a, b) => a - b).join('-'); }
      function sortedCombo(raw) { return (Array.isArray(raw) ? raw : []).map(Number).filter(Number.isFinite).sort((a, b) => a - b); }
      function common(a, b) { let i = 0, j = 0, c = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { c++; i++; j++; } else if (a[i] < b[j]) i++; else j++; } return c; }
      function jac(a, b) { const c = common(a, b); return c / Math.max(1, (a.length + b.length - c)); }
      function hash(n, seed) { let x = ((n + 1) * 1103515245 + (seed + 31) * 12345) >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967295; }
      function fmt(n) { return Number(n || 0).toLocaleString('tr-TR'); }
      function getTarget(p) { try { if (p && p.packages && p.packages.active) { const a = p.packages; return (Number(a.main && a.main.cols) || 0) + (Number(a.deep && a.deep.cols) || 0) + (Number(a.risk && a.risk.cols) || 0) || Number(p.cols) || 60; } } catch (e) { } return Number(p && p.cols) || num('p-cols', 60) || 60; }
      function loadSaved() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && Array.isArray(o.rows)) return o; } catch (e) { } return null; }
      function saveSettings() { try { localStorage.setItem(KEY, JSON.stringify(getSettings())); } catch (e) { } }
      function getRowsFromDom() {
        const rows = [];
        for (let i = 0; i < 4; i++) rows.push({
          name: 'Paket ' + (i + 1),
          sMin: num('v712-se-smin-' + i, DEFAULT_ROWS[i].sMin),
          sMax: num('v712-se-smax-' + i, DEFAULT_ROWS[i].sMax),
          eMin: num('v712-se-emin-' + i, DEFAULT_ROWS[i].eMin),
          eMax: num('v712-se-emax-' + i, DEFAULT_ROWS[i].eMax),
          count: num('v712-se-count-' + i, DEFAULT_ROWS[i].count)
        });
        return rows;
      }
      function getSettings() {
        return { active: bool('v712-se-active', true), mode: (($('v712-se-mode') || {}).value || 'quota'), rows: getRowsFromDom() };
      }
      function rowTotal(rows) { return (rows || []).reduce((a, r) => a + (Number(r.count) || 0), 0); }
      function rowMatches(combo, row) { const s = combo[0], e = combo[combo.length - 1]; return s >= row.sMin && s <= row.sMax && e >= row.eMin && e <= row.eMax; }
      function rowLabel(r) { return `Başlangıç ${r.sMin}-${r.sMax}, Bitiş ${r.eMin}-${r.eMax}`; }
      function packageConfigs(p, target) {
        try {
          const pack = p && p.packages && p.packages.active ? p.packages : null;
          if (pack) {
            const cfgs = [
              { name: 'Ana Dengeli Paket', cols: Number(pack.main.cols) || 0, j: Number(pack.main.jaccard) || 0.60, c: Number(pack.main.maxCommon) || 4, outMax: Number(pack.main.outMax) || 40, mode: 'clean' },
              { name: 'Çekirdek Destek Paketi', cols: Number(pack.deep.cols) || 0, j: Number(pack.deep.jaccard) || 0.75, c: Number(pack.deep.maxCommon) || 5, outMax: Number(pack.deep.outMax) || 45, mode: 'core' },
              { name: 'Kontrollü Risk Paketi', cols: Number(pack.risk.cols) || 0, j: Number(pack.risk.jaccard) || 0.75, c: Number(pack.risk.maxCommon) || 5, outMax: Number(pack.risk.outMax) || 55, mode: 'risk' }
            ].filter(x => x.cols > 0);
            const total = cfgs.reduce((a, b) => a + b.cols, 0);
            if (cfgs.length && total !== target) cfgs[cfgs.length - 1].cols += (target - total);
            return cfgs;
          }
        } catch (e) { }
        return [{ name: 'Genel Üretim', cols: target, j: Number(p && p.jaccard) || 0.60, c: Number(p && p.maxCommon) || 4, outMax: 999, mode: 'general' }];
      }
      function selectedStats(selected) {
        let maxCommon = 0, maxJ = 0;
        for (let i = 0; i < selected.length; i++) for (let j = i + 1; j < selected.length; j++) { const cc = common(selected[i].combo, selected[j].combo); const jj = jac(selected[i].combo, selected[j].combo); if (cc > maxCommon) maxCommon = cc; if (jj > maxJ) maxJ = jj; }
        return { maxCommon, maxJ };
      }
      function canAddToCfg(item, selected, cfg, relax) {
        if ((Number(item.score) || 0) > (Number(cfg.outMax) || 999)) return false;
        const same = selected.filter(x => x._pkg === cfg.name);
        for (const s of same) { const cc = common(item.combo, s.combo); if (!relax && (cc > cfg.c || jac(item.combo, s.combo) > cfg.j + 1e-9)) return false; }
        return true;
      }
      function sortItems(list, seed, mode) {
        const a = list.slice();
        a.sort((x, y) => {
          if (mode === 'risk') return (Number(y.score) || 0) - (Number(x.score) || 0) || hash(x.idx, seed) - hash(y.idx, seed);
          if (mode === 'core') return Math.abs((Number(x.score) || 0) - 8) - Math.abs((Number(y.score) || 0) - 8) || hash(x.idx, seed) - hash(y.idx, seed);
          return (Number(x.score) || 0) - (Number(y.score) || 0) || hash(x.idx, seed) - hash(y.idx, seed);
        });
        return a;
      }
      function runStartEndSelection(scoredItems, p, settings) {
        const target = getTarget(p);
        const rows = settings.rows.map((r, i) => Object.assign({ idx: i }, r));
        const total = rowTotal(rows);
        const items = (scoredItems || []).map((x, idx) => ({ combo: sortedCombo(x.combo || x), score: Number(x.score) || 0, idx, reasons: x.reasons || [], sum: sortedCombo(x.combo || x).reduce((a, b) => a + b, 0) })).filter(x => x.combo.length === (Number(p && p.k) || 6));
        const rawRowCounts = rows.map(r => items.filter(it => rowMatches(it.combo, r)).length);
        if (total !== target) {
          return { bestCount: 0, target, ok: false, selected: [], bestName: 'Başlangıç-Bitiş kota toplamı hatalı', stats: { maxCommon: 0, maxJ: 0 }, trials: [], status: 'Kota toplamı hatalı', startEndSummary: { active: true, total, target, totalMismatch: true, rows: rows.map((r, i) => ({ row: r, target: r.count, available: rawRowCounts[i], selected: 0, missing: Math.max(0, r.count) })), packageDetails: [], message: `Başlangıç-Bitiş toplam kotası ${total}; hedef ${target}. Toplam hedefe eşit olmalı.` } };
        }
        const cfgs = packageConfigs(p, target);
        let best = { selected: [], rowSel: [], pkgSel: {}, relaxed: false, name: 'Başlangıç-Bitiş kota kilidi' };
        const rowOrders = [rows.map(r => r.idx), rows.slice().sort((a, b) => rawRowCounts[a.idx] - rawRowCounts[b.idx]).map(r => r.idx), rows.slice().sort((a, b) => b.count - a.count).map(r => r.idx)];
        for (let seed = 1; seed <= 36; seed++) {
          for (const order of rowOrders) {
            for (const relax of [false, true]) {
              const selected = [], keys = new Set(), rowSel = rows.map(() => 0), pkgSel = {}; cfgs.forEach(c => pkgSel[c.name] = 0);
              const pkgNeed = cfg => Math.max(0, (Number(cfg.cols) || 0) - (pkgSel[cfg.name] || 0));
              for (const ri of order) {
                const row = rows[ri];
                const candidates = sortItems(items.filter(it => rowMatches(it.combo, row)), seed, (seed % 3 === 0 ? 'core' : (seed % 5 === 0 ? 'risk' : 'clean')));
                for (const it of candidates) {
                  if (rowSel[ri] >= row.count || selected.length >= target) break;
                  const key = comboKey(it.combo); if (keys.has(key)) continue;
                  const cfgOrder = cfgs.slice().sort((a, b) => pkgNeed(b) - pkgNeed(a) || (a.mode === 'clean' ? -1 : 1));
                  let chosen = null;
                  for (const cfg of cfgOrder) { if (pkgNeed(cfg) > 0 && canAddToCfg(it, selected, cfg, relax)) { chosen = cfg; break; } }
                  if (!chosen) continue;
                  const cp = Object.assign({}, it, { _pkg: chosen.name, _startEndRow: ri, _startEndLabel: rowLabel(row) });
                  selected.push(cp); keys.add(key); rowSel[ri]++; pkgSel[chosen.name] = (pkgSel[chosen.name] || 0) + 1;
                }
              }
              if (selected.length > best.selected.length || (selected.length === best.selected.length && !relax && best.relaxed)) { best = { selected, rowSel, pkgSel, relaxed: relax, name: relax ? 'Başlangıç-Bitiş kota kilidi · son aşamada benzerlik yumuşatma' : 'Başlangıç-Bitiş kota kilidi' }; }
              if (selected.length >= target) seed = 999;
            }
          }
        }
        const rowDetails = rows.map((r, i) => ({ row: r, target: r.count, available: rawRowCounts[i], selected: best.rowSel[i] || 0, missing: Math.max(0, (Number(r.count) || 0) - (best.rowSel[i] || 0)), label: rowLabel(r) }));
        const pkgDetails = cfgs.map(c => ({ name: c.name, target: c.cols, selected: best.pkgSel[c.name] || 0, jaccard: c.j, maxCommon: c.c, outMax: c.outMax, trials: [{ name: 'seçilen', count: best.pkgSel[c.name] || 0 }] }));
        const ok = best.selected.length >= target && rowDetails.every(r => r.missing <= 0);
        const trials = rowDetails.map(r => ({ name: `${r.row.name} · ${r.label}`, count: r.selected, target: r.target, available: r.available }));
        return { bestCount: best.selected.length, target, ok, selected: best.selected, bestName: best.name, stats: selectedStats(best.selected), trials, status: ok ? 'Uygun' : 'Başlangıç-Bitiş kotası eksik', packageDetails: pkgDetails, startEndSummary: { active: true, total, target, totalMismatch: false, rows: rowDetails, packageDetails: pkgDetails, relaxed: best.relaxed, message: ok ? 'Başlangıç-Bitiş kotaları 60 kolon içinde karşılandı.' : 'Başlangıç-Bitiş kotaları belirlenen adetlerde tamamlanamadı.' } };
      }
      function renderStartEndCard() {
        if ($('v712-start-end-card')) return;
        const saved = loadSaved(); const rows = (saved && saved.rows) || DEFAULT_ROWS; const active = saved ? saved.active : true; const mode = saved ? saved.mode : 'quota';
        const card = document.createElement('div'); card.className = 'card'; card.id = 'v712-start-end-card';
        const trs = rows.map((r, i) => `<tr><td>Paket ${i + 1}</td><td><input type="number" id="v712-se-smin-${i}" value="${r.sMin}" min="1" max="90"></td><td><input type="number" id="v712-se-smax-${i}" value="${r.sMax}" min="1" max="90"></td><td><input type="number" id="v712-se-emin-${i}" value="${r.eMin}" min="1" max="90"></td><td><input type="number" id="v712-se-emax-${i}" value="${r.eMax}" min="1" max="90"></td><td><input class="v712-count" type="number" id="v712-se-count-${i}" value="${r.count}" min="0" max="60"></td></tr>`).join('');
        card.innerHTML = `
      <div class="card-head"><div class="step-dot new">B</div><span class="card-title">Kolon Başlangıç-Bitiş Dağılımı</span><span class="new-badge">v7.12 kilit</span><span class="card-note">ilk ve son sayı profilini final seçimde zorunlu uygula</span></div>
      <div class="section-note purple">Bu bölüm seçilen 60 kolonun <b>en küçük sayısını</b> ve <b>en büyük sayısını</b> kontrol eder. Analiz Et dediğinde Jaccard önce 60 seçip sonra kontrol etmez; kuralları doğrudan üretilebilir aday havuzu içinde arar ve belirlenen adetlerde seçmeye çalışır.</div>
      <div class="row"><div class="row-lbl">Başlangıç-bitiş dağılımı<div class="row-sub">Kota toplamı hedef kolon sayısına eşit olmalı. Paketli modda hedef, paket kolon toplamıdır.</div></div><label class="check-wrap"><input type="checkbox" id="v712-se-active" ${active ? 'checked' : ''}>Aktif</label></div>
      <div class="v712-se-grid">
        <div class="v712-se-box"><div class="v712-box-title">Mod</div><select id="v712-se-mode"><option value="quota" ${mode === 'quota' ? 'selected' : ''}>Kota / seçim önceliği</option><option value="strict" ${mode === 'strict' ? 'selected' : ''}>Kesin filtre</option></select><div class="v712-mini-muted">Bu revizyonda aktifken final 60 içinde kota zorunludur.</div></div>
        <div class="v712-se-box"><div class="v712-box-title">Oyun tipine göre otomatik</div><button type="button" class="btn small" id="v712-se-default">Varsayılan doldur</button></div>
        <div class="v712-se-box"><div class="v712-box-title">Sayı havuzuna göre öner</div><button type="button" class="btn small" id="v712-se-pool">Havuza göre ayarla</button></div>
        <div class="v712-se-box"><div class="v712-box-title">Toplam kota</div><div class="v712-box-value" id="v712-se-total">—</div></div>
      </div>
      <table class="v712-se-table"><thead><tr><th>Paket</th><th>Baş. min</th><th>Baş. max</th><th>Bitiş min</th><th>Bitiş max</th><th>Kolon</th></tr></thead><tbody>${trs}</tbody></table>
      <div class="v712-se-status" id="v712-se-status">Hazır.</div>`;
        const finalCard = $('v76-final-selection-card');
        const jcard = qsa('.card').find(c => /Jaccard Üretilebilirlik Raporu/i.test(c.textContent || ''));
        const anchor = finalCard || jcard;
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor); else { const app = document.querySelector('.app'); if (app) app.appendChild(card); }
        qsa('input,select', card).forEach(el => el.addEventListener('input', () => { updateStartEndStatus(); saveSettings(); }));
        $('v712-se-default').addEventListener('click', () => { DEFAULT_ROWS.forEach((r, i) => { $('v712-se-smin-' + i).value = r.sMin; $('v712-se-smax-' + i).value = r.sMax; $('v712-se-emin-' + i).value = r.eMin; $('v712-se-emax-' + i).value = r.eMax; $('v712-se-count-' + i).value = r.count; }); updateStartEndStatus(); saveSettings(); });
        $('v712-se-pool').addEventListener('click', () => { suggestFromPool(); updateStartEndStatus(); saveSettings(); });
        try { if (typeof ensureCollapsible === 'function') ensureCollapsible(card); } catch (e) { }
        updateStartEndStatus();
      }
      function suggestFromPool() {
        const arr = (Array.isArray(window.pool) ? window.pool : (typeof pool !== 'undefined' ? pool : [])).slice().map(Number).filter(Number.isFinite).sort((a, b) => a - b);
        if (arr.length < 6) { alert('Önce sayı havuzunu doldur.'); return; }
        const firstMin = arr[0], firstMax = arr[Math.min(arr.length - 1, Math.max(0, Math.floor(arr.length * 0.45)))];
        const midMin = arr[Math.max(0, Math.floor(arr.length * 0.20))], midMax = arr[Math.min(arr.length - 1, Math.floor(arr.length * 0.60))];
        const endMin = arr[Math.max(0, Math.floor(arr.length * 0.55))], endMax = arr[arr.length - 1];
        const rows = [{ sMin: firstMin, sMax: firstMax, eMin: endMin, eMax: endMax, count: 15 }, { sMin: midMin, sMax: midMax, eMin: Math.max(firstMin, endMin - 8), eMax: endMax, count: 21 }, { sMin: midMin, sMax: midMax, eMin: Math.max(firstMin, endMin - 9), eMax: Math.max(endMin, arr[Math.floor(arr.length * 0.82)] || endMax), count: 15 }, { sMin: Math.min(midMax, midMin + 1), sMax: midMax, eMin: Math.max(firstMin, endMin - 9), eMax: endMax, count: 9 }];
        rows.forEach((r, i) => { $('v712-se-smin-' + i).value = r.sMin; $('v712-se-smax-' + i).value = r.sMax; $('v712-se-emin-' + i).value = r.eMin; $('v712-se-emax-' + i).value = r.eMax; $('v712-se-count-' + i).value = r.count; });
      }
      function updateStartEndStatus() {
        const p = (typeof getParams === 'function' ? getParams() : {}); const target = getTarget(p); const s = getSettings(); const total = rowTotal(s.rows); const el = $('v712-se-status'), val = $('v712-se-total');
        if (val) val.textContent = total + '/' + target;
        if (!el) return;
        el.className = 'v712-se-status';
        if (!s.active) { el.textContent = 'Pasif: Başlangıç-bitiş dağılımı final seçime uygulanmaz.'; return; }
        if (total < target) { el.classList.add('bad'); el.textContent = `Eksik kota: toplam ${total}, hedef ${target}. ${target - total} kolon eksik tanımlandı.`; }
        else if (total > target) { el.classList.add('bad'); el.textContent = `Fazla kota: toplam ${total}, hedef ${target}. ${total - target} kolon fazla tanımlandı.`; }
        else { el.textContent = `Aktif · ${s.mode === 'strict' ? 'Kesin filtre' : 'Kota / seçim önceliği'} modu. Final seçimde başlangıç/bitiş profili ${s.rows.length} satıra göre zorunlu dengelenecek.`; }
      }
      function applyOutlierLabels() {
        const packActive = bool('p-pack-active', false);
        const outEl = $('p-out-active');
        if (outEl) {
          const row = outEl.closest('.row') || outEl.closest('.card') || outEl.parentElement;
          if (row && !$('v712-general-out-note')) { const div = document.createElement('div'); div.id = 'v712-general-out-note'; div.className = 'v712-out-note'; row.appendChild(div); }
          const note = $('v712-general-out-note');
          if (note) { note.className = 'v712-out-note' + (packActive ? ' warn' : ''); note.textContent = packActive ? 'Genel uç skor pasif. Paketli modda her paketin kendi uç skor limiti kullanılır.' : 'Genel üretim aktif. Bu bölümdeki genel uç skor ayarı kullanılır.'; }
        }
        ['p-pack-main-out', 'p-pack-deep-out', 'p-pack-risk-out'].forEach(id => { const el = $(id); const card = el && (el.closest('.package-card') || el.closest('td') || el.parentElement); if (card && !card.querySelector('.v712-lock-badge')) { const b = document.createElement('div'); b.className = 'v712-lock-badge'; b.textContent = 'Paket uç skor kilidi aktif'; card.appendChild(b); } });
      }
      function applyPackageOutScoreRuntimeFix() {
        const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        if (!data || !data.params || !(data.params.packages && data.params.packages.active) || !Array.isArray(data.scored)) return null;
        const p = data.params;
        const target = getTarget(p);
        const cfgs = packageConfigs(p, target);
        const scored = data.scored;
        const maxOut = Math.max.apply(null, cfgs.map(c => Number(c.outMax) || 0));
        const passAny = scored.filter(it => (Number(it.score) || 0) <= maxOut);
        const rejected = scored.filter(it => (Number(it.score) || 0) > maxOut).sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
        const passed = passAny.slice().sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
        const byPackage = cfgs.map(c => ({
          name: c.name,
          target: Number(c.cols) || 0,
          outMax: Number(c.outMax) || 0,
          available: scored.filter(it => (Number(it.score) || 0) <= (Number(c.outMax) || 0)).length,
          rejected: scored.filter(it => (Number(it.score) || 0) > (Number(c.outMax) || 0)).length
        }));
        data.packageOutSummary = { active: true, maxOut, passedAny: passAny.length, rejectedAny: rejected.length, byPackage };
        data.outValidCount = passAny.length;
        data.outRejected = rejected.length;
        data.rejected = rejected;
        data.passed = passed;
        const sc = $('sc-outvalid'); if (sc) sc.textContent = 'Paket uç aktif';
        const sub = sc && sc.parentElement && sc.parentElement.querySelector('.sub'); if (sub) sub.textContent = `en geniş limit ≤${maxOut}: ${fmt(passAny.length)} aday`;
        const rej = $('sc-outrej'); if (rej) rej.textContent = fmt(rejected.length);
        const prev = $('out-preview-count'); if (prev) prev.textContent = `Paket: ${fmt(passAny.length)}`;
        return data.packageOutSummary;
      }

      function renderStartEndReport(report) {
        const s = report.startEndSummary; const p = (window.lastAnalysisData && window.lastAnalysisData.params) || (typeof lastAnalysisData !== 'undefined' && lastAnalysisData && lastAnalysisData.params) || {};
        const lines = [];
        lines.push('JACCARD / BAŞLANGIÇ-BİTİŞ KOTA KİLİDİ RAPORU');
        lines.push('-----------------------------------------------');
        lines.push(`Üretim modu              : ${p && p.packages && p.packages.active ? 'PAKETLİ' : 'GENEL'}`);
        lines.push(`Hedef kolon sayısı       : ${report.target}`);
        lines.push(`Seçilebilen kolon sayısı : ${report.bestCount}`);
        lines.push(`Durum                    : ${report.ok ? 'UYGUN' : 'YETERSİZ'}`);
        const data = (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        if (data) {
          lines.push(`Kesin kurallardan geçen  : ${fmt(data.validCount || 0)}`);
          if (data.packageOutSummary && data.packageOutSummary.active) {
            lines.push(`Paket uç filtresi        : AKTİF · en geniş limit ≤${data.packageOutSummary.maxOut} · aday ${fmt(data.packageOutSummary.passedAny)}`);
            (data.packageOutSummary.byPackage || []).forEach(x => lines.push(`  - ${x.name}: uç≤${x.outMax} · aday ${fmt(x.available)} / hedef ${x.target}`));
          } else {
            lines.push(`Uç filtreden sonra aday  : ${fmt(data.outValidCount || 0)}`);
          }
        }
        lines.push(`Seçim yöntemi            : ${report.bestName || 'Başlangıç-Bitiş kota kilidi'}`);
        lines.push('');
        lines.push('Başlangıç-Bitiş satır kontrolü:');
        (s.rows || []).forEach(r => { const mark = r.missing > 0 ? 'EKSİK' : 'OK'; lines.push(`- ${r.row.name}: ${r.selected}/${r.target} · ${r.label || rowLabel(r.row)} · üretilebilir aday ${r.available} · ${mark}${r.missing > 0 ? ' · eksik ' + r.missing : ''}`); });
        if (s.totalMismatch) { lines.push(''); lines.push('NET SORUN'); lines.push('---------'); lines.push(s.message); }
        else if (!report.ok) { lines.push(''); lines.push('NET SORUN'); lines.push('---------'); lines.push('Sorun genel Jaccard değerini körlemesine değiştirmek değil; yukarıdaki başlangıç-bitiş satırlarından biri istenen kolon adedini tamamlayamıyor. Eksik satırın başlangıç/bitiş aralığını veya kolon kotasını düzelt.'); }
        lines.push('');
        if (report.packageDetails && report.packageDetails.length) { lines.push('Paket bazlı seçim:'); report.packageDetails.forEach(d => lines.push(`- ${d.name}: ${d.selected}/${d.target} · J≤${d.jaccard} · ortak≤${d.maxCommon} · uç≤${d.outMax}`)); lines.push(''); }
        lines.push(`Seçilenlerde max ortak   : ${report.stats ? report.stats.maxCommon : '—'}`);
        lines.push(`Seçilenlerde max Jaccard : ${report.stats ? Number(report.stats.maxJ || 0).toFixed(3) : '—'}`);
        lines.push('');
        lines.push('İlk seçilebilir kolon örnekleri:');
        (report.selected || []).slice(0, 80).forEach((it, i) => lines.push(`${String(i + 1).padStart(3, '0')} | ${(it.combo || []).join('\t')}`));
        return lines.join('\n');
      }
      function patchSelection() {
        const prev = window.jaccardFeasibilityCheck || (typeof jaccardFeasibilityCheck !== 'undefined' ? jaccardFeasibilityCheck : null);
        if (prev && prev._v712StartEndQuotaLock) return;
        const fn = function (scoredItems, p) {
          const s = getSettings();
          if (!s.active) return prev ? prev(scoredItems, p) : { bestCount: 0, target: getTarget(p), ok: false, selected: [], trials: [], status: 'Pasif' };
          const report = runStartEndSelection(scoredItems, p || {}, s);
          window.__v712LastStartEndReport = report;
          return report;
        };
        fn._v712StartEndQuotaLock = true; window.jaccardFeasibilityCheck = fn; try { jaccardFeasibilityCheck = fn; } catch (e) { }

        const oldBuild = window.buildJaccardSuggestionReport || (typeof buildJaccardSuggestionReport !== 'undefined' ? buildJaccardSuggestionReport : null);
        const bf = function (selectedCount, targetCount, jLimit, maxCommon, afterOutlierCount, validCount) {
          const rep = window.__v712LastStartEndReport;
          if (rep && rep.startEndSummary) { return { level: rep.ok ? 'UYGUN' : 'BAŞLANGIÇ-BİTİŞ EKSİK', ratio: targetCount ? selectedCount / targetCount : 0, nextJ: jLimit, primaryAction: rep.ok ? 'Başlangıç-bitiş kotası uygun.' : (rep.startEndSummary.totalMismatch ? rep.startEndSummary.message : 'Eksik satırı raporda gör; başlangıç/bitiş aralığını veya o satırın kolon kotasını düzelt.'), suggestions: [], hints: [] }; }
          return oldBuild ? oldBuild(selectedCount, targetCount, jLimit, maxCommon, afterOutlierCount, validCount) : { level: '—', ratio: 0, primaryAction: '—', suggestions: [], hints: [] };
        };
        window.buildJaccardSuggestionReport = bf; try { buildJaccardSuggestionReport = bf; } catch (e) { }

        const oldRender = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
        const rf = function () {
          const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null); const r = data && data.jaccardReport;
          if (r && r.startEndSummary) {
            const out = $('jacc-output'); if (out) out.value = renderStartEndReport(r);
            const targetEl = $('jacc-target'), selectedEl = $('jacc-selected'), statusEl = $('jacc-status');
            if (targetEl) targetEl.textContent = r.target; if (selectedEl) selectedEl.textContent = r.bestCount; if (statusEl) statusEl.textContent = r.ok ? 'UYGUN' : 'B-B EKSİK';
            return;
          }
          if (oldRender) return oldRender.apply(this, arguments);
        };
        window.renderJaccardReport = rf; try { renderJaccardReport = rf; } catch (e) { }

        const oldRun = window.runAnalysis || (typeof runAnalysis !== 'undefined' ? runAnalysis : null);
        if (oldRun && !oldRun._v712StartEndQuotaLock) {
          const wrapped = function () { const res = oldRun.apply(this, arguments); setTimeout(postAnalyzeFix, 180); setTimeout(postAnalyzeFix, 420); return res; };
          wrapped._v712StartEndQuotaLock = true; window.runAnalysis = wrapped; try { runAnalysis = wrapped; } catch (e) { }
        }
      }
      function postAnalyzeFix() {
        const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        if (data) applyPackageOutScoreRuntimeFix();
        const r = data && data.jaccardReport; if (!r || !r.startEndSummary) return;
        if ($('sc-jaccstatus')) $('sc-jaccstatus').textContent = r.ok ? 'UYGUN' : 'Başlangıç-Bitiş eksik';
        const badge = $('score-badge'); if (badge && !r.ok) { badge.textContent = 'Başlangıç-Bitiş Eksik'; badge.className = 'score-badge score-bad'; }
        if (Array.isArray(data.analysisWarnings)) {
          const filtered = data.analysisWarnings.filter(w => !(w && /^Jaccard\/ortak sayı/i.test(String(w.msg || ''))));
          if (!r.ok) {
            const missing = (r.startEndSummary.rows || []).filter(x => x.missing > 0).map(x => `${x.row.name}: eksik ${x.missing}`).join(' · ');
            filtered.push({ type: 'red', msg: r.startEndSummary.totalMismatch ? r.startEndSummary.message : `Başlangıç-Bitiş kota kilidi tamamlanamadı. ${missing || 'Detay Jaccard raporunda.'}` });
          } else filtered.push({ type: 'green', msg: `Başlangıç-Bitiş kota kilidi geçti: ${r.bestCount}/${r.target} kolon seçildi.` });
          data.analysisWarnings = filtered; data.analysisBlockers = filtered.filter(w => w.type === 'red');
          const list = $('warn-list'); if (list) list.innerHTML = filtered.map(w => `<div class="warn-item"><div class="warn-dot ${w.type}"></div><div>${w.msg}</div></div>`).join('');
        }
        try { if (window.renderJaccardReport) window.renderJaccardReport(); } catch (e) { }
      }
      function markVersion() {
        const ver = document.querySelector('.badge-ver'); if (ver) ver.textContent = 'v7.12';
        const sub = document.querySelector('.app-sub'); if (sub) sub.textContent = 'v7.10 Stabil Taban · Paket Uç Skor Kilidi · Başlangıç-Bitiş Kota Kilidi · Paket Uç Runtime Fix';
        const app = document.querySelector('.app'); if (app) app.setAttribute('data-version', 'v7.12-start-end-quota-lock-package-out-fix');
      }
      function init() { renderStartEndCard(); applyOutlierLabels(); patchSelection(); markVersion(); updateStartEndStatus(); const pack = $('p-pack-active'); if (pack) pack.addEventListener('change', () => { setTimeout(() => { applyOutlierLabels(); updateStartEndStatus(); applyPackageOutScoreRuntimeFix(); }, 50); });['p-pack-main-out', 'p-pack-deep-out', 'p-pack-risk-out'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', () => setTimeout(applyPackageOutScoreRuntimeFix, 50)); }); }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 260)); else setTimeout(init, 260);
    })();
  