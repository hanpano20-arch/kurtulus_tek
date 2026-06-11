
    (function () {
      function mark() {
        const ver = document.querySelector('.badge-ver'); if (ver) ver.textContent = 'v7.8';
        const sub = document.querySelector('.app-sub'); if (sub) sub.textContent = 'Covering Design · Jaccard Excel Çıktı · Sekme Düğmeleri Düzeltildi';
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark); else mark();
    })();
  