
    /* === v5.7.1 Katlanabilir Bölümler === */
    (function () {
      function titleOf(card) {
        const t = card.querySelector('.card-title');
        return t ? t.textContent.trim() : '';
      }
      function makeToolbar() {
        const app = document.querySelector('.app');
        if (!app || document.querySelector('.v55-topbar')) return;
        const bar = document.createElement('div');
        bar.className = 'v55-topbar';
        bar.innerHTML = '<span class="label">Hızlı görünüm</span>' +
          '<button type="button" class="v55-chip" data-action="all-open">Tümünü aç</button>' +
          '<button type="button" class="v55-chip" data-action="all-close">Tümünü kapat</button>' +
          '<button type="button" class="v55-chip" data-action="main-open">Sadece ana girişleri aç</button>' +
          '<button type="button" class="v55-chip" data-action="reports-open">Raporları aç</button>';
        const anchor = document.querySelector('.persist-panel') || app.firstElementChild;
        app.insertBefore(bar, anchor);
        bar.addEventListener('click', function (e) {
          const btn = e.target.closest('[data-action]'); if (!btn) return;
          const cards = [...document.querySelectorAll('.card')];
          const action = btn.getAttribute('data-action');
          if (action === 'all-open') cards.forEach(c => setCollapsed(c, false));
          if (action === 'all-close') cards.forEach(c => setCollapsed(c, true));
          if (action === 'reports-open') cards.forEach(c => {
            const t = titleOf(c).toLowerCase();
            setCollapsed(c, !(t.includes('raporu') || t.includes('eleme')));
          });
          if (action === 'main-open') cards.forEach(c => {
            const t = titleOf(c).toLowerCase();
            const keep = ['sayı havuzu', 'temel parametre', 'toplam aralığı', 'tek / çift', 'alt / üst', 'benzerlik', 'paketli üretim'];
            setCollapsed(c, !keep.some(k => t.includes(k)));
          });
        });
      }
      function setCollapsed(card, collapsed) {
        card.classList.toggle('v55-collapsed', !!collapsed);
        const btn = card.querySelector(':scope > .card-head .v55-toggle');
        if (btn) btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      }
      function wrapCard(card) {
        if (card.dataset.v55Ready === '1') return;
        const head = card.querySelector(':scope > .card-head');
        if (!head) return;
        const body = document.createElement('div');
        body.className = 'v55-card-body';
        let n = head.nextSibling;
        const toMove = [];
        while (n) { const next = n.nextSibling; toMove.push(n); n = next; }
        toMove.forEach(x => body.appendChild(x));
        card.appendChild(body);
        const toggle = document.createElement('span');
        toggle.className = 'v55-toggle';
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.innerHTML = '<span class="txt-open">Aç</span><span class="txt-close">Gizle</span>';
        head.appendChild(toggle);
        function doToggle(e) {
          if (e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle')) {
            if (!e.target.closest('.v55-toggle')) return;
          }
          setCollapsed(card, !card.classList.contains('v55-collapsed'));
        }
        head.addEventListener('click', doToggle);
        head.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(e); } });
        card.dataset.v55Ready = '1';
      }
      function init() {
        makeToolbar();
        const cards = [...document.querySelectorAll('.card')];
        cards.forEach(wrapCard);
        const defaultOpen = ['Sayı havuzu', 'Temel parametreler', 'Kural', 'Jaccard Üretilebilirlik'];
        cards.forEach(c => {
          const t = titleOf(c);
          const open = defaultOpen.some(x => t.includes(x));
          setCollapsed(c, !open);
        });
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
    })();
  