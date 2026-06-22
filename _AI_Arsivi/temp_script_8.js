
    (function () {
      const $ = id => document.getElementById(id);
      function getDrawKey() { return 'cpb_draws_' + (gameMax() <= 60 ? '60' : '90') + '_v714'; }
      const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#eab308', '#14b8a6', '#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#8b5cf6', '#10b981', '#6366f1', '#64748b'];
      const DRAW_N = 15; // v7.14
      const labels = ['Ç1 en yeni', 'Ç2', 'Ç3', 'Ç4', 'Ç5', 'Ç6', 'Ç7', 'Ç8', 'Ç9', 'Ç10', 'Ç11', 'Ç12', 'Ç13', 'Ç14', 'Ç15 en eski'];
      let activeDraw = 0;
      let syncing = false;
      function rowOf(id) { const e = $(id); return e ? e.closest('.row') : null; }
      function hideOldGeneralRows() { ['p-t', 'p-cols', 'p-jaccard', 'p-maxcommon', 'p-out-active', 'p-out-max'].forEach(id => { const r = rowOf(id); if (r) { r.style.display = 'none'; r.setAttribute('data-v74-hidden', '1'); } }); }
      function syncVal(srcId, dstId, kind) { const s = $(srcId), d = $(dstId); if (!s || !d) return; const v = (kind === 'check') ? s.checked : s.value; if (kind === 'check') d.checked = !!v; else d.value = v; }
      function bindMirror(a, b, kind) {
        const ea = $(a), eb = $(b); if (!ea || !eb) return; const ev = kind === 'check' ? 'change' : 'input'; const fn = (from, to) => { if (syncing) return; syncing = true; if (kind === 'check') to.checked = from.checked; else to.value = from.value; to.dispatchEvent(new Event(kind === 'check' ? 'change' : 'input', { bubbles: true })); syncing = false; try { if (typeof autoSaveSettings === 'function') autoSaveSettings(); } catch (e) { } updateGeneralState(); };
        ea.addEventListener(ev, () => fn(ea, eb)); eb.addEventListener(ev, () => fn(eb, ea));
      }
      function buildGeneralCard() {
        if ($('v74-general-card')) return;
        const card = document.createElement('div'); card.className = 'card'; card.id = 'v74-general-card';
        card.innerHTML = `
      <div class="card-head"><div class="step-dot new">G</div><span class="card-title">Genel Üretim Ayarları</span><span class="new-badge">v7.4</span><span class="card-note">paketli mod pasifken geçerli tek merkez</span></div>
      <div class="section-note purple">Paketli üretim <b>pasif</b> olduğunda bu karttaki genel kolon / t / Jaccard / max ortak / uç skor değerleri kullanılır. Paketli üretim aktifse bu genel değerler promptta devre dışı yazılır; paket kartlarındaki değerler geçerli olur.</div>
      <div class="v74-general-grid">
        <div class="v74-general-box"><label>Genel kolon sayısı</label><input type="number" id="v74-g-cols" min="1" max="300"></div>
        <div class="v74-general-box"><label>Genel t seviyesi</label><input type="number" id="v74-g-t" min="3" max="6"></div>
        <div class="v74-general-box"><label>Genel Jaccard</label><input type="number" id="v74-g-jaccard" min="0.1" max="0.95" step="0.05"></div>
        <div class="v74-general-box"><label>Genel max ortak</label><input type="number" id="v74-g-maxcommon" min="1" max="5"></div>
        <div class="v74-general-box"><label>Genel uç skor</label><input type="number" id="v74-g-outmax" min="0" max="100"></div>
      </div>
      <div class="row" style="border-bottom:none;margin-top:6px"><div class="row-lbl">Genel uç skor filtresi<div class="row-sub">Paketli üretim pasifse genel uç skor için kullanılır</div></div><label class="check-wrap"><input type="checkbox" id="v74-g-outactive">Aktif</label></div>
      <div class="v74-note" id="v74-general-status">Durum hazırlanıyor.</div>`;
        const basic = [...document.querySelectorAll('.card')].find(c => c.textContent.includes('Temel parametreler'));
        if (basic && basic.parentNode) basic.parentNode.insertBefore(card, basic.nextSibling); else document.querySelector('.app').appendChild(card);
        syncVal('p-cols', 'v74-g-cols'); syncVal('p-t', 'v74-g-t'); syncVal('p-jaccard', 'v74-g-jaccard'); syncVal('p-maxcommon', 'v74-g-maxcommon'); syncVal('p-out-max', 'v74-g-outmax'); syncVal('p-out-active', 'v74-g-outactive', 'check');
        bindMirror('p-cols', 'v74-g-cols'); bindMirror('p-t', 'v74-g-t'); bindMirror('p-jaccard', 'v74-g-jaccard'); bindMirror('p-maxcommon', 'v74-g-maxcommon'); bindMirror('p-out-max', 'v74-g-outmax'); bindMirror('p-out-active', 'v74-g-outactive', 'check');
        const pack = $('p-pack-active'); if (pack) pack.addEventListener('change', updateGeneralState);
        updateGeneralState();
      }
      function updateGeneralState() { const card = $('v74-general-card'), stat = $('v74-general-status'), pack = $('p-pack-active'); if (!card || !stat) return; const active = !(pack && pack.checked); card.classList.toggle('v74-card-dim', !active); stat.innerHTML = active ? '<span class="v74-ok">GENEL ÜRETİM AKTİF:</span> Bu karttaki değerler geçerlidir. Paket kartları dikkate alınmaz.' : '<span class="v74-warn">PAKETLİ ÜRETİM AKTİF:</span> Bu kart yalnız hazırlık amaçlıdır; üretimde paket kartlarındaki değerler geçerlidir.'; card.querySelectorAll('input').forEach(i => { if (i.id !== 'v74-g-outactive') i.disabled = !active; else i.disabled = !active; }); }
      function parseNums(str) { const gm = gameMax(); return [...new Set(String(str || '').split(/[^0-9]+/).map(x => parseInt(x, 10)).filter(n => Number.isFinite(n) && n >= 1 && n <= gm))].slice(0, 6).sort((a, b) => a - b); }
      function loadDraws() { try { const v = JSON.parse(localStorage.getItem(getDrawKey()) || 'null'); if (Array.isArray(v) && v.length === DRAW_N) return v.map(a => Array.isArray(a) ? a.slice(0, 6) : []); } catch (e) { } return Array.from({ length: DRAW_N }, () => []); }
      function saveDraws(draws) { try { localStorage.setItem(getDrawKey(), JSON.stringify(draws)); } catch (e) { } }
      function buildDrawMap() {
        if ($('v74-draw-card')) return; const card = document.createElement('div'); card.className = 'card'; card.id = 'v74-draw-card';
        const rows = labels.map((l, i) => `<div class="v74-draw-row"><button type="button" class="v74-draw-btn" id="v74-draw-btn-${i}" data-i="${i}" style="background:${COLORS[i]}">${l}</button><input class="v74-draw-input" id="v74-draw-input-${i}" placeholder="6 sayı gir" inputmode="numeric"><button type="button" class="v74-small-btn" data-clear="${i}">Temizle</button></div>`).join('');
        card.innerHTML = `<div class="card-head"><div class="step-dot new">H</div><span class="card-title">Çekiliş Haritası / Son 15 Çekiliş</span><span class="new-badge">v7.14</span><span class="card-note">15 çekiliş · ağırlıklı analiz · 6/60 & 6/90</span></div>
      <div class="section-note purple">Her çekilişe en fazla 6 sayı girilir. Aynı sayı farklı çekilişlerde işaretlenirse uyarı vermeden tekrar/üst üste bilgisiyle haritada vurgulanır. Ç1 en yeni çekiliş kabul edilir.</div>
      <div class="v74-draw-wrap"><div><div class="v74-draw-list">${rows}</div><div class="v74-legend">${labels.map((l, i) => `<span class="v74-legend-chip"><span class="v74-color-dot" style="background:${COLORS[i]}"></span>${l}</span>`).join('')}</div><div class="v74-summary" id="v74-draw-summary">Çekilişleri gir.</div></div><div><div class="v74-map" id="v74-map"></div></div></div>`;
        const poolCard = [...document.querySelectorAll('.card')].find(c => c.textContent.includes('Sayı havuzu'));
        if (poolCard && poolCard.parentNode) poolCard.parentNode.insertBefore(card, poolCard.nextSibling); else document.querySelector('.app').appendChild(card);
        for (let i = 0; i < DRAW_N; i++) { $('v74-draw-btn-' + i).addEventListener('click', () => { activeDraw = i; renderDrawMap(); }); $('v74-draw-input-' + i).addEventListener('input', () => { const draws = loadDraws(); const nums = parseNums($('v74-draw-input-' + i).value); draws[i] = nums; $('v74-draw-input-' + i).value = nums.join(' '); saveDraws(draws); renderDrawMap(); }); }
        card.querySelectorAll('[data-clear]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.clear; const draws = loadDraws(); draws[i] = []; saveDraws(draws); renderDrawInputs(draws); renderDrawMap(); }));
        renderDrawInputs(loadDraws()); renderDrawMap();
      }
      function renderDrawInputs(draws) { for (let i = 0; i < DRAW_N; i++) { const inp = $('v74-draw-input-' + i); if (inp) inp.value = (draws[i] || []).join(' '); } }
      function appearances(draws, n) { const arr = []; draws.forEach((d, i) => { if ((d || []).includes(n)) arr.push(i); }); return arr; }
      function streakFromNewest(apps) { let c = 0; for (let i = 0; i < DRAW_N; i++) { if (apps.includes(i)) c++; else break; } return c; }
      function renderDrawMap() {
        const draws = loadDraws(); renderDrawInputs(draws); for (let i = 0; i < DRAW_N; i++) { const b = $('v74-draw-btn-' + i); if (b) b.classList.toggle('active', i === activeDraw); }
        window.renderDrawMap714 = renderDrawMap; // v7.14 alias
        const map = $('v74-map'); if (!map) return; const gMax = gameMax(); let html = ''; for (let n = 1; n <= gMax; n++) { const apps = appearances(draws, n); const active = (draws[activeDraw] || []).includes(n); const st = streakFromNewest(apps); let bg = 'rgba(255,255,255,.05)'; if (apps.length === 1) bg = COLORS[apps[0]]; else if (apps.length > 1) bg = `linear-gradient(135deg,${apps.slice(0, 4).map(i => COLORS[i]).join(',')})`; html += `<button type="button" class="v74-num ${active ? 'selected-active' : ''} ${apps.length > 1 ? 'repeat' : ''}" data-n="${n}" style="background:${bg};color:${apps.length ? '#fff' : 'var(--color-text-primary)'}">${n}${st >= 2 ? `<span class="v74-streak">Ü${st}</span>` : ''}${apps.length >= 2 ? `<span class="v74-badge">${apps.length}x</span>` : ''}</button>`; }
        map.innerHTML = html; map.querySelectorAll('.v74-num').forEach(btn => btn.addEventListener('click', () => { const n = +btn.dataset.n; const draws = loadDraws(); const d = draws[activeDraw] || []; const ix = d.indexOf(n); if (ix >= 0) { d.splice(ix, 1); } else { if (d.length >= 6) { $('v74-draw-summary').innerHTML = '<span class="v74-warn">Bu çekiliş için 6 sayı sınırı dolu.</span>'; return; } d.push(n); } draws[activeDraw] = [...new Set(d)].sort((a, b) => a - b).slice(0, 6); saveDraws(draws); renderDrawMap(); }));
        const repeated = []; for (let n = 1; n <= 90; n++) { const apps = appearances(draws, n); const st = streakFromNewest(apps); if (apps.length > 1) repeated.push(`${n} (${apps.length} kez${st >= 2 ? ', üst üste ' + st : ''})`); }
        const counts = draws.map((d, i) => `${labels[i]}: ${(d || []).length}/6`).join(' · '); $('v74-draw-summary').innerHTML = `${counts}<br>${repeated.length ? '<b>Tekrar edenler:</b> ' + repeated.join(', ') : 'Tekrar eden sayı yok.'}`;
      }
      function init() { hideOldGeneralRows(); buildGeneralCard(); buildDrawMap(); }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    })();
  