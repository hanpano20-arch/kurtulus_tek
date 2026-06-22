
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
      function num(id, def) { const el = $(id); const v = el ? parseFloat(el.value) : NaN; return Number.isFinite(v) ? v : def; }
      function int(id, def) { const el = $(id); const v = el ? parseInt(el.value, 10) : NaN; return Number.isFinite(v) ? v : def; }
      function checked(id, def) { const el = $(id); return el ? !!el.checked : def; }
      function setVal(id, val) { const el = $(id); if (!el) return; el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
      function setCheck(id, val) { const el = $(id); if (!el) return; el.checked = !!val; el.dispatchEvent(new Event('change', { bubbles: true })); }
      function uniqueSorted(arr) { return [...new Set(arr.map(Number).filter(Number.isFinite))].sort((a, b) => a - b); }
      function comboKey(c) { return c.slice().sort((a, b) => a - b).join('-'); }
      function commonCount(a, b) { const s = new Set(a); let n = 0; for (const x of b) { if (s.has(x)) n++; } return n; }
      function jaccard(a, b) { const c = commonCount(a, b); return c / (a.length + b.length - c); }
      function combos3(c) { const out = []; for (let i = 0; i < c.length; i++)for (let j = i + 1; j < c.length; j++)for (let k = j + 1; k < c.length; k++)out.push(c[i] + '-' + c[j] + '-' + c[k]); return out; }
      function stats(sel, k) { let maxC = 0, maxJ = 0; for (let i = 0; i < sel.length; i++)for (let j = i + 1; j < sel.length; j++) { const c = commonCount(sel[i].combo, sel[j].combo); if (c > maxC) maxC = c; const jj = jaccard(sel[i].combo, sel[j].combo); if (jj > maxJ) maxJ = jj; } return { maxCommon: maxC, maxJ }; }
      function v76Settings() {
        return {
          active: checked('p-v76-final-active', true),
          coreActive: checked('p-v76-core-active', true),
          coreMax: int('p-v76-core-max', 5),
          score0Active: checked('p-v76-score0-active', true),
          score0Min: int('p-v76-score0-min', 10),
          backboneActive: checked('p-v76-backbone-active', true),
          backbonePct: num('p-v76-backbone-pct', 0.66),
          rotationActive: checked('p-v76-rotation-active', true)
        };
      }
      function bandKey(score) { if (score <= 5) return '0-5'; if (score <= 10) return '6-10'; if (score <= 15) return '11-15'; if (score <= 20) return '16-20'; return '21+'; }
      function countBy(arr, fn) { const o = {}; arr.forEach(x => { const k = fn(x); o[k] = (o[k] || 0) + 1; }); return o; }
      function getTarget(p) { return (p && p.cols) || int('p-cols', 60) || 60; }
      function pkgCfg(p, target) {
        const k = (p && p.k) || 6;
        const pack = p && p.packages && p.packages.active ? p.packages : null;
        if (pack) {
          return [
            { name: 'Ana Dengeli Paket', cols: pack.main.cols || 0, j: pack.main.jaccard || 0.6, c: pack.main.maxCommon || 4, outMax: Number.isFinite(Number(pack.main.outMax)) ? Number(pack.main.outMax) : 40, mode: 'clean' },
            { name: 'Çekirdek Destek Paketi', cols: pack.deep.cols || 0, j: pack.deep.jaccard || 0.7, c: pack.deep.maxCommon || 4, outMax: Number.isFinite(Number(pack.deep.outMax)) ? Number(pack.deep.outMax) : 45, mode: 'core' },
            { name: 'Kontrollü Risk Paketi', cols: pack.risk.cols || 0, j: pack.risk.jaccard || 0.75, c: pack.risk.maxCommon || 5, outMax: Number.isFinite(Number(pack.risk.outMax)) ? Number(pack.risk.outMax) : 55, mode: 'risk' }
          ].filter(x => x.cols > 0);
        }
        return [{ name: 'Genel Üretim', cols: target, j: (p && p.jaccard) || 0.6, c: (p && p.maxCommon) || 4, outMax: 100, mode: 'general' }];
      }
      function orderItems(items, mode) {
        const arr = items.slice();
        if (mode === 'clean') return arr.sort((a, b) => a.score - b.score || a._coreSeen - b._coreSeen || a.idx - b.idx);
        if (mode === 'risk') return arr.sort((a, b) => b.score - a.score || a._coreSeen - b._coreSeen || a.idx - b.idx);
        if (mode === 'core') return arr.sort((a, b) => Math.abs(a.score - 8) - Math.abs(b.score - 8) || a._coreSeen - b._coreSeen || a.idx - b.idx);
        return arr.sort((a, b) => a._coreSeen - b._coreSeen || a.score - b.score || a.idx - b.idx);
      }
      function canAdd(item, selected, cfg, settings, coreUse, relax) {
        const k = item.combo.length;
        const samePkg = selected.filter(x => x._pkg === cfg.name);
        for (const s of samePkg) {
          const cc = commonCount(item.combo, s.combo);
          if (!relax.sim && (cc > cfg.c || jaccard(item.combo, s.combo) > cfg.j + 1e-9)) return false;
          if (settings.backboneActive && !relax.backbone && (cc / k) > settings.backbonePct + 1e-9) return false;
        }
        if (settings.coreActive && !relax.core) {
          for (const ck of combos3(item.combo)) { if ((coreUse[ck] || 0) >= settings.coreMax) return false; }
        }
        return true;
      }
      function addOne(item, selected, keys, coreUse, cfg) {
        const key = comboKey(item.combo); keys.add(key); const cp = Object.assign({}, item, { _pkg: cfg.name, _band: bandKey(item.score) }); selected.push(cp); combos3(item.combo).forEach(ck => coreUse[ck] = (coreUse[ck] || 0) + 1); return cp;
      }
      function selectAdvanced(scoredItems, p) {
        const settings = v76Settings(); const target = getTarget(p); const k = (p && p.k) || 6;
        const base = scoredItems.map((x, idx) => { const raw = x.combo || x; const combo = uniqueSorted(raw); return { combo, score: Number(x.score) || 0, idx, reasons: x.reasons || [], sum: combo.reduce((a, b) => a + b, 0) }; }).filter(x => x.combo.length === k);
        const coreSeed = {}; base.forEach(it => { let m = 999; combos3(it.combo).forEach(ck => m = Math.min(m, coreSeed[ck] || 0)); it._coreSeen = Number.isFinite(m) ? m : 0; combos3(it.combo).forEach(ck => coreSeed[ck] = (coreSeed[ck] || 0) + 1); });
        const selected = [], keys = new Set(), coreUse = {};
        const cfgs = pkgCfg(p, target); const totalCfg = cfgs.reduce((a, b) => a + b.cols, 0) || target; if (totalCfg !== target && cfgs.length) { cfgs[cfgs.length - 1].cols += (target - totalCfg); }
        const pkgCount = cfg => selected.filter(x => x._pkg === cfg.name).length;
        const pkgNeed = cfg => Math.max(0, (cfg.cols || 0) - pkgCount(cfg));
        const scoreOk = (it, cfg) => Number(it.score || 0) <= Number(cfg.outMax || 100);
        const addFrom = (cands, need, cfg, relax = {}) => {
          let n = 0; const limit = Math.min(Math.max(0, need || 0), pkgNeed(cfg));
          for (const it of cands) {
            if (n >= limit || selected.length >= target || pkgNeed(cfg) <= 0) break;
            if (!scoreOk(it, cfg)) continue;
            const key = comboKey(it.combo); if (keys.has(key)) continue;
            if (!canAdd(it, selected, cfg, settings, coreUse, relax)) continue;
            addOne(it, selected, keys, coreUse, cfg); n++;
          }
          return n;
        };
        // Skor 0 temsil zorunluluğu yalnızca ana paket kontenjanı içinde uygulanır; paket kotasını aşamaz.
        if (settings.score0Active && cfgs.length) { const clean = orderItems(base.filter(it => it.score <= 0), 'clean'); addFrom(clean, Math.min(settings.score0Min, pkgNeed(cfgs[0])), cfgs[0], {}); }
        // 1) Her paket kendi kontenjanını, kendi uç skor limitini ve kendi Jaccard/max ortak sınırını kullanır.
        for (const cfg of cfgs) { addFrom(orderItems(base, cfg.mode), pkgNeed(cfg), cfg, {}); }
        // 2) Gerekirse sadece aynı paketin eksik kontenjanı için sırasıyla yumuşatılır; başka pakete taşma yapılmaz.
        for (const cfg of cfgs) { if (pkgNeed(cfg) > 0) addFrom(orderItems(base, cfg.mode), pkgNeed(cfg), cfg, { backbone: true }); }
        for (const cfg of cfgs) { if (pkgNeed(cfg) > 0) addFrom(orderItems(base, cfg.mode), pkgNeed(cfg), cfg, { backbone: true, core: true }); }
        for (const cfg of cfgs) { if (pkgNeed(cfg) > 0) addFrom(orderItems(base, cfg.mode), pkgNeed(cfg), cfg, { backbone: true, core: true, sim: true }); }
        const st = stats(selected, k); const coreCounts = Object.values(coreUse); const maxCore = coreCounts.length ? Math.max(...coreCounts) : 0;
        const details = cfgs.map(cfg => ({ name: cfg.name, target: cfg.cols, selected: pkgCount(cfg), bestName: 'v7.10 paket-kota/uç-skor kilidi', jaccard: cfg.j, maxCommon: cfg.c, outMax: cfg.outMax, trials: [{ name: 'seçilen', count: pkgCount(cfg) }] }));
        return { bestCount: selected.length, target, ok: selected.length >= target, selected, bestName: 'v7.10 final seçim: paket kotası + paket uç skor kilidi', stats: st, trials: [{ name: 'Skor 0 temsil', count: selected.filter(x => x.score <= 0).length }, { name: 'Max 3lü çekirdek tekrar', count: maxCore }, { name: 'Tekrarsız kolon', count: selected.length }], status: selected.length >= target ? 'Uygun' : 'Yetersiz', packageDetails: details, v76Summary: { settings, coreUse, maxCore, bandSelected: countBy(selected, x => x._band), pkgSelected: countBy(selected, x => x._pkg) } };
      }
      function makeFinalCard() {
        if ($('v76-final-selection-card')) return;
        const card = document.createElement('div'); card.className = 'card'; card.id = 'v76-final-selection-card';
        card.innerHTML = `
      <div class="card-head"><div class="step-dot new">F</div><span class="card-title">Final Seçim Gelişmiş Ayarlar</span><span class="new-badge">v7.6</span><span class="card-note">kaçan temiz kolonları koru</span></div>
      <div class="section-note purple">Bu bölüm aktif kesin kuralları değiştirmez. Sadece kurallardan geçen adaylar içinden final 60 kolonun seçimini dengeler: aynı 3'lü çekirdeğe yığılmayı azaltır, skor 0 temiz kolonlara temsil verir ve omurga benzerliğini kontrol eder. v7.10 ile paketli modda her paket kendi uç skor sınırına kilitlenir; paket kotası başka pakete taşmaz.</div>
      <div class="row"><div class="row-lbl">Final seçim gelişmiş modu<div class="row-sub">Kurallar aynı kalır; seçim motoru çeşitlilik ve temsil önceliğiyle çalışır.</div></div><label class="check-wrap"><input type="checkbox" id="p-v76-final-active" checked>Aktif</label></div>
      <div class="v76-final-grid">
        <div class="v76-final-box"><label><input type="checkbox" id="p-v76-core-active" checked> 3'lü çekirdek tekrar limiti</label><input type="number" id="p-v76-core-max" value="5" min="1" max="30"></div>
        <div class="v76-final-box"><label><input type="checkbox" id="p-v76-score0-active" checked> Skor 0 temsil zorunluluğu</label><input type="number" id="p-v76-score0-min" value="10" min="0" max="60"></div>
        <div class="v76-final-box"><label><input type="checkbox" id="p-v76-backbone-active" checked> Omurga benzerlik limiti</label><select id="p-v76-backbone-pct"><option value="0.50">%50</option><option value="0.66" selected>%66</option><option value="0.75">%75</option><option value="1">Kapalı gibi</option></select></div>
        <div class="v76-final-box"><label><input type="checkbox" id="p-v76-rotation-active" checked> Çekirdek rotasyon modu</label><select id="p-v76-rotation-mode"><option value="on" selected>Açık</option><option value="soft">Yumuşak</option></select></div>
      </div>
      <div class="v76-mini-status" id="v76-final-status">Aktif: Final seçim, iyi kolonları sadece skor/Jaccard yüzünden dışarıda bırakmadan daha dengeli temsil etmeye çalışır.</div>`;
        const jcard = [...document.querySelectorAll('.card')].find(c => /Jaccard Üretilebilirlik Raporu/i.test(c.textContent || ''));
        if (jcard && jcard.parentNode) jcard.parentNode.insertBefore(card, jcard.nextSibling); else { const app = document.querySelector('.app'); if (app) app.appendChild(card); }
        qsa('#v76-final-selection-card input,#v76-final-selection-card select').forEach(el => el.addEventListener('change', () => { try { if (typeof scheduleAutosave === 'function') scheduleAutosave(); } catch (e) { } updateV76Status(); }));
        updateV76Status();
        try { if (typeof ensureCollapsible === 'function') ensureCollapsible(card); } catch (e) { }
      }
      function updateV76Status() { const st = v76Settings(); const el = $('v76-final-status'); if (el) el.innerHTML = `${st.active ? 'AKTİF' : 'PASİF'} · 3'lü çekirdek max ${st.coreMax} · skor 0 min ${st.score0Min} · omurga benzerlik limiti ${Math.round(st.backbonePct * 100)}%`; }
      function addResetButton() {
        const grid = document.querySelector('.persist-grid'); if (!grid || $('v76-reset-inputs-btn')) return;
        const btn = document.createElement('button'); btn.className = 'btn small v76-reset-btn'; btn.id = 'v76-reset-inputs-btn'; btn.type = 'button'; btn.textContent = 'Bütün girdileri sıfırla';
        btn.addEventListener('click', resetAllInputsForNewAnalysis); grid.appendChild(btn);
      }
      function clearSpecialPairs() {
        // Havuz temizliği parsePool ile geçersiz çiftleri zaten siler; kalan varsa görünen etiketlerden kaldır.
        qsa('#banned-summary .banned-tag .rm').forEach(x => { try { x.click(); } catch (e) { } });
        try { if (typeof updateBannedSummary === 'function') updateBannedSummary(); if (typeof renderPairGrid === 'function') renderPairGrid(); } catch (e) { }
      }
      function setAllPositionFree() {
        qsa('#adj-rules .row,#vert-rules .row').forEach(row => { const free = [...row.querySelectorAll('.pill')].find(p => /Serbest/i.test(p.textContent || '')); if (free) { try { free.click(); } catch (e) { } } });
        qsa('#arith-area .pill-sm').forEach(p => { if (/Serbest/i.test(p.textContent || '')) { try { p.click(); } catch (e) { } } });
        setVal('p-diag9-min', '0'); setVal('p-diag11-min', '0');
      }
      function resetDrawMap() {
        try { localStorage.setItem('kolon_prompt_builder_v74_draws', JSON.stringify([[], [], [], [], [], [], []])); } catch (e) { }
        for (let i = 0; i < DRAW_N; i++) { const inp = $('v74-draw-input-' + i); if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); } }
        const area = $('v75-draw-analysis'); if (area) area.value = '';
        const box = $('v75-draw-suggestions'); if (box) box.innerHTML = '<div class="v75-muted">Analiz bekleniyor.</div>';
        const sum = $('v74-draw-summary'); if (sum) sum.innerHTML = Array.from({ length: DRAW_N }, (_, i) => `Ç${i + 1}${i === 0 ? ' en yeni' : i === DRAW_N - 1 ? ' en eski' : ''}: 0/6`).join(' · ');
      }
      function resetDistributionInputs() {
        for (let i = 1; i <= 4; i++) { setVal('p-sumq-' + i + '-min', '0'); setVal('p-sumq-' + i + '-max', '0'); setVal('p-sumq-' + i + '-count', '0'); }
        qsa('[id^="p-oddq-"]').forEach(el => setVal(el.id, '0'));
        qsa('[id^="p-regq-"]').forEach(el => setVal(el.id, '0'));
        const dec = $('p-dec'); if (dec) { dec.min = '0'; setVal('p-dec', '0'); }
        try { if (typeof updateQuotaStatus === 'function') updateQuotaStatus(); } catch (e) { }
      }
      function resetAllInputsForNewAnalysis() {
        if (!confirm('Yeni analiz için sayı havuzu, son 15 çekiliş, kota değerleri, konumsal fark/çapraz zincir ve özel çift yasakları temizlenecek. Emin misin?')) return;
        setVal('poolInput', '');
        try { if (typeof parsePool === 'function') parsePool(); } catch (e) { }
        resetDrawMap();
        resetDistributionInputs();
        setAllPositionFree();
        clearSpecialPairs();
        try { if (typeof runAnalysis === 'function') { ['warn-list', 'freq-area', 'elim-output', 'jacc-output', 'prompt-output'].forEach(id => { const el = $(id); if (el) el.value ? el.value = '' : el.innerHTML = ''; }); } } catch (e) { }
        try { if (typeof scheduleAutosave === 'function') scheduleAutosave(); else if (typeof saveSettingsNow === 'function') saveSettingsNow(true); } catch (e) { }
        alert('Yeni analiz için istenen girişler temizlendi. Ana altyapı ve diğer ayarlar korunuyor.');
      }
      function v76PromptBlock() {
        const st = v76Settings();
        return `
════════════════════════════════════════
11D. FINAL SEÇİM GELİŞMİŞ AYARLARI
════════════════════════════════════════
• Final seçim gelişmiş modu: ${st.active ? 'AKTİF' : 'PASİF'}.
• Bu bölüm aktif kesin kuralları değiştirmez; yalnızca aktif kesin kurallardan geçen adayların final 60 kolona seçim önceliğini düzenler.
• 3'lü çekirdek tekrar limiti: ${st.coreActive ? 'AKTİF · aynı 3lü çekirdek en fazla ' + st.coreMax + ' kolon' : 'PASİF'}.
• Skor 0 / dengeli kolon temsil zorunluluğu: ${st.score0Active ? 'AKTİF · en az ' + st.score0Min + ' kolon' : 'PASİF'}.
• Omurga benzerlik dengelemesi: ${st.backboneActive ? 'AKTİF · aynı paket içinde yaklaşık max ' + Math.round(st.backbonePct * 100) + '% ortak omurga' : 'PASİF'}.
• Çekirdek rotasyon modu: ${st.rotationActive ? 'AKTİF' : 'PASİF'}.
• Final seçimde aynı omurgaya aşırı yığılma yerine güçlü 2li/3lü çekirdekler farklı tamamlayıcılarla döndürülecek.
• Kurallardan geçen ve skoru temiz olan adaylar, sadece benzer aileden fazla kolon seçildiği için tamamen gözden kaçmayacak; temsil/rotasyon kontrolünden geçirilecek.
`;
      }
      function patchPrompt() {
        const prev = window.buildPrompt || (typeof buildPrompt !== 'undefined' ? buildPrompt : null);
        if (prev && !prev._v76Patched) {
          const fn = function () { let s = prev(); const block = v76PromptBlock(); if (!s.includes('11D. FINAL SEÇİM GELİŞMİŞ AYARLARI')) { s = s.replace('\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR', block + '\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR'); s = s.replace('[ ] Paketli/genel üretim modu önceliği doğru uygulandı mı?', '[ ] Paketli/genel üretim modu önceliği doğru uygulandı mı?\n[ ] Final seçim gelişmiş ayarları uygulandı mı? Aynı 3lü çekirdek aşırı tekrar etmedi mi? Skor 0 temiz kolonlar temsil edildi mi?'); } return s; };
          fn._v76Patched = true; window.buildPrompt = fn; try { buildPrompt = window.buildPrompt; } catch (e) { }
        }
      }
      function patchJaccard() {
        const prev = window.jaccardFeasibilityCheck || (typeof jaccardFeasibilityCheck !== 'undefined' ? jaccardFeasibilityCheck : null);
        if (prev && !prev._v76Patched) {
          const fn = function (scoredItems, p) { const st = v76Settings(); if (!st.active || !Array.isArray(scoredItems) || !scoredItems.length) return prev(scoredItems, p); try { const adv = selectAdvanced(scoredItems, p || {}); if (adv.bestCount >= Math.min(getTarget(p || {}), (p && p.cols) || 60)) return adv; } catch (e) { } return prev(scoredItems, p); };
          fn._v76Patched = true; window.jaccardFeasibilityCheck = fn; try { jaccardFeasibilityCheck = window.jaccardFeasibilityCheck; } catch (e) { }
        }
        const rj = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
        if (rj && !rj._v76Patched) {
          const nf = function () { rj(); const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null); const out = $('jacc-output'); const r = data && data.jaccardReport; if (out && r && r.v76Summary && !out.value.includes('v7.10 FINAL SEÇİM GELİŞMİŞ ÖZETİ')) { const s = r.v76Summary; out.value += '\n\nv7.10 FINAL SEÇİM GELİŞMİŞ ÖZETİ\n────────────────────────────\n' + `Max 3lü çekirdek tekrar : ${s.maxCore}\n` + `Skor 0 seçilen           : ${(r.selected || []).filter(x => x.score <= 0).length}\n` + `Paket dağılımı           : ${Object.entries(s.pkgSelected || {}).map(([k, v]) => k + ': ' + v).join(' · ') || '—'}\n` + `Skor bandı               : ${Object.entries(s.bandSelected || {}).map(([k, v]) => k + ': ' + v).join(' · ') || '—'}\n`; } };
          nf._v76Patched = true; window.renderJaccardReport = nf; try { renderJaccardReport = window.renderJaccardReport; } catch (e) { }
        }
      }
      function finish() {
        document.title = 'Kolon Prompt Builder v7.10 - Paket Uç Skor Kilidi';
        const ver = document.querySelector('.badge-ver'); if (ver) ver.textContent = 'v7.10';
        const sub = document.querySelector('.app-sub'); if (sub) sub.textContent = 'Covering Design · Paketli Uç Skor Kilidi · Final Seçim';
        addResetButton(); makeFinalCard(); patchPrompt(); patchJaccard(); updateV76Status();
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(finish, 180)); else setTimeout(finish, 180);
    })();
  