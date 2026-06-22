
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

      function getComboArray(item) {
        if (!item) return [];
        const raw = Array.isArray(item.combo) ? item.combo : (Array.isArray(item) ? item : []);
        return raw.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
      }

      function selectedExcelText() {
        const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
        const report = data && data.jaccardReport;
        if (!report || !Array.isArray(report.selected) || !report.selected.length) return '';
        const p = (data && data.params) || (typeof getParams === 'function' ? getParams() : {}) || {};
        const target = Number(report.target || p.cols || 60) || 60;
        const rows = [];
        const seen = new Set();
        for (const item of report.selected) {
          if (rows.length >= target) break;
          const combo = getComboArray(item);
          if (combo.length !== 6) continue;
          const key = combo.join('-');
          if (seen.has(key)) continue;
          seen.add(key);
          rows.push(combo.join('\t'));
        }
        return rows.join('\n');
      }

      window.copyJaccardSelectedExcel = function () {
        const text = selectedExcelText();
        const out = $('jacc-excel-output');
        if (out) out.value = text;
        if (!text) { alert('Önce Analiz Et butonuna bas. Seçilen Jaccard kolonları oluşmadan Excel çıktısı alınamaz.'); return; }
        const copy = () => alert('Seçilen kolonlar Excel formatında kopyalandı. Sıra no ve açıklama yoktur.');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(copy).catch(() => { if (out) { out.select(); document.execCommand('copy'); copy(); } });
        } else if (out) { out.select(); document.execCommand('copy'); copy(); }
      };

      function fillJaccardExcelOutput() {
        const out = $('jacc-excel-output');
        if (!out) return;
        const text = selectedExcelText();
        if (text) out.value = text;
      }

      function patchRenderJaccard() {
        const fn = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
        if (!fn || fn._v77ExcelPatched) return;
        const wrapped = function () {
          const ret = fn.apply(this, arguments);
          try { fillJaccardExcelOutput(); } catch (e) { }
          return ret;
        };
        wrapped._v77ExcelPatched = true;
        window.renderJaccardReport = wrapped;
        try { renderJaccardReport = window.renderJaccardReport; } catch (e) { }
      }

      function ensureCardToggle(card) {
        if (!card || card.nodeType !== 1 || !card.classList.contains('card')) return;
        const head = card.querySelector(':scope > .card-head');
        if (!head) return;
        if (!card.querySelector(':scope > .v55-card-body')) {
          const body = document.createElement('div');
          body.className = 'v55-card-body';
          let n = head.nextSibling;
          while (n) { const next = n.nextSibling; body.appendChild(n); n = next; }
          card.appendChild(body);
        }
        let toggle = head.querySelector('.v55-toggle');
        if (!toggle) {
          toggle = document.createElement('span');
          toggle.className = 'v55-toggle';
          toggle.setAttribute('role', 'button');
          toggle.setAttribute('tabindex', '0');
          toggle.setAttribute('aria-expanded', card.classList.contains('v55-collapsed') ? 'false' : 'true');
          toggle.innerHTML = '<span class="txt-open">Aç</span><span class="txt-close">Gizle</span>';
          head.appendChild(toggle);
        }
        // v7.8 DÜZELTME: Eski v55 katlanabilir sisteminin event'i zaten bağlıysa
        // ikinci bir click event bağlama. Aksi halde tıklama iki kez çalışıp kart açılıp
        // aynı anda kapanıyor gibi görünür. Sadece toggle/body eksik olan yeni dinamik
        // kartlarda aşağıdaki yedek event devreye girer.
        if (card.dataset.v55Ready === '1' || card.dataset.v77ToggleReady === '1') return;
        const doToggle = function (e) {
          if (e && e.target && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')) {
            if (!e.target.closest('.v55-toggle')) return;
          }
          const collapsed = !card.classList.contains('v55-collapsed');
          card.classList.toggle('v55-collapsed', collapsed);
          const b = head.querySelector('.v55-toggle');
          if (b) b.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        };
        head.addEventListener('click', doToggle);
        head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(e); } });
        card.dataset.v77ToggleReady = '1';
        card.dataset.v55Ready = '1';
      }

      function ensureAllToggles() { qsa('.card').forEach(ensureCardToggle); }

      function init() {
        patchRenderJaccard();
        fillJaccardExcelOutput();
        ensureAllToggles();
        const root = document.querySelector('.app') || document.body;
        if (root && !root.dataset.v77CollapseObserver) {
          root.dataset.v77CollapseObserver = '1';
          const obs = new MutationObserver(() => setTimeout(ensureAllToggles, 30));
          obs.observe(root, { childList: true, subtree: true });
        }
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 250));
      else setTimeout(init, 250);
    })();
  