
    (function () {
      'use strict';

      function isPackageModeActive(p) {
        try {
          if (p && p.packages && p.packages.active) return true;
          const el = document.getElementById('p-pack-active');
          return !!(el && el.checked);
        } catch (e) { return false; }
      }

      function isGeneralSimilarityWarning(w) {
        const msg = String((w && w.msg) || '');
        // Paketli modda genel Jaccard / genel max ortak ayarları devre dışıdır.
        // Bu nedenle sadece genel ayarlardan doğan uyumsuzluk uyarısı gizlenir.
        // Paket isimleriyle gelen uyarılar korunur.
        const isGeneralJaccardMax = /^Jaccard\s+/i.test(msg) && /max ortak/i.test(msg) && /uyumsuz/i.test(msg);
        const mentionsPackage = /Ana dengeli paket|t=5 destek paketi|Kontrollü risk paketi|Çekirdek Destek Paketi|Ana Dengeli Paket/i.test(msg);
        return isGeneralJaccardMax && !mentionsPackage;
      }

      function patchRuleWarnings() {
        const old = window.getRuleWarnings || (typeof getRuleWarnings !== 'undefined' ? getRuleWarnings : null);
        if (!old || old._v79PackageWarningPatch) return;

        const wrapped = function (p) {
          const list = old(p) || [];
          if (!isPackageModeActive(p)) return list;
          return list.filter(w => !isGeneralSimilarityWarning(w));
        };
        wrapped._v79PackageWarningPatch = true;
        window.getRuleWarnings = wrapped;
        try { getRuleWarnings = wrapped; } catch (e) { }

        const oldBlocking = window.getBlockingWarnings || (typeof getBlockingWarnings !== 'undefined' ? getBlockingWarnings : null);
        const wrappedBlocking = function (p) {
          return (wrapped(p) || []).filter(w => w && w.type === 'red');
        };
        wrappedBlocking._v79PackageWarningPatch = true;
        window.getBlockingWarnings = wrappedBlocking;
        try { getBlockingWarnings = wrappedBlocking; } catch (e) { }
      }

      function markVersion() {
        const ver = document.querySelector('.badge-ver');
        if (ver) ver.textContent = 'v7.9';
        const sub = document.querySelector('.app-sub');
        if (sub) sub.textContent = 'Covering Design · Paketli Jaccard Uyarı Düzeltmesi · Sekme Düğmeleri Korundu';
        const app = document.querySelector('.app');
        if (app) app.setAttribute('data-version', 'v7.9-paketli-jaccard-uyari-duzeltme');
      }

      function init() {
        patchRuleWarnings();
        markVersion();
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
      else init();
    })();
  