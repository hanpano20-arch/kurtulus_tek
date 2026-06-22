
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);

      function v72CleanNumbers(text) {
        return String(text || '').split(/[^0-9]+/).map(x => parseInt(x, 10)).filter(n => Number.isFinite(n) && n > 0 && n <= 90);
      }
      function v72UniqueSorted(nums) { return Array.from(new Set(nums)).sort((a, b) => a - b); }
      function v72Mode() { return (($('p-work-mode') || {}).value || 'live'); }
      function v72ControlNumbers() { return v72UniqueSorted(v72CleanNumbers(($('p-control-result') || {}).value || '')); }
      function v72Save() { try { if (typeof scheduleAutosave === 'function') scheduleAutosave(); else if (typeof saveSettingsNow === 'function') saveSettingsNow(true); } catch (e) { } }

      function v72BuildCard() {
        if ($('v72-mode-card')) return;
        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'v72-mode-card';
        card.innerHTML = `
      <div class="card-head">
        <div class="step-dot new">M</div>
        <span class="card-title">Çalışma Modu</span>
        <span class="new-badge">v7.3.1</span>
        <span class="card-note">gerçek çekiliş / simülasyon ayrımı</span>
      </div>
      <div class="section-note purple">
        <b>Gerçek Çekiliş Üretimi:</b> Sonuç bilinmez; kontrol kolonu kullanılmaz. <br>
        <b>Simülasyon / Backtest:</b> Gerçek sonuç yalnızca sonradan kontrol ve kural kalibrasyonu için girilir; üretime zorunlu kolon olarak eklenmez.
      </div>
      <div class="row">
        <div class="row-lbl">Çalışma modu<div class="row-sub">Gerçek çekilişte kontrol sonucu istenmez. Backtestte girilen sonuç üretimi yönlendirmez.</div></div>
        <select class="num-in" id="p-work-mode" style="width:230px">
          <option value="live" selected>Gerçek Çekiliş Üretimi</option>
          <option value="backtest">Simülasyon / Backtest</option>
        </select>
      </div>
      <div class="row" id="v72-control-row" style="display:none">
        <div class="row-lbl">Gerçek sonuç / kontrol kolonu<div class="row-sub">Sadece backtest analizi içindir; promptta kesin üretilecek kolon olarak kullanılmaz.</div></div>
        <input class="num-in" id="p-control-result" placeholder="3 37 62 64 70 87" style="width:260px;text-align:left">
      </div>
      <div class="section-note" id="v72-mode-status">
        Mod: Gerçek Çekiliş Üretimi. Uygulama 6 bilen sayıyı istemez; sadece havuz ve kurallarla üretim yapar.
      </div>
    `;
        const quick = document.querySelector('.quick-guide');
        if (quick && quick.parentNode) quick.parentNode.insertBefore(card, quick.nextSibling);
        else { const app = document.querySelector('.app'); if (app) app.insertBefore(card, app.firstChild); }
        const mode = $('p-work-mode'), ctrl = $('p-control-result');
        if (mode) { mode.addEventListener('change', () => { v72RefreshModeUI(); v72Save(); }); }
        if (ctrl) { ctrl.addEventListener('input', () => { v72RefreshModeUI(); v72Save(); }); }
        v72RefreshModeUI();
      }

      function v72RefreshModeUI() {
        const mode = v72Mode();
        const row = $('v72-control-row');
        const status = $('v72-mode-status');
        if (row) row.style.display = mode === 'backtest' ? 'flex' : 'none';
        if (status) {
          if (mode === 'backtest') {
            const nums = v72ControlNumbers();
            status.innerHTML = `Mod: <b>Simülasyon / Backtest</b>. Kontrol kolonu ${nums.length ? '[' + nums.join(', ') + ']' : 'girilmedi'}. Bu sayılar üretime zorunlu kolon olarak eklenmeyecek; sadece analiz/kalibrasyon için kullanılacak.`;
          } else {
            status.innerHTML = 'Mod: <b>Gerçek Çekiliş Üretimi</b>. Uygulama 6 bilen sayıyı istemez; kontrol kolonu üretimde kullanılmaz.';
          }
        }
      }

      function v72ModePromptBlock() {
        const mode = v72Mode();
        const nums = v72ControlNumbers();
        if (mode === 'backtest') {
          return `\n════════════════════════════════════════\n0. ÇALIŞMA MODU\n════════════════════════════════════════\n• Mod: SİMÜLASYON / BACKTEST.\n• Gerçek sonuç / kontrol kolonu: ${nums.length ? '[' + nums.join(', ') + ']' : 'GİRİLMEDİ'}.\n• Bu kontrol kolonu üretime zorunlu kolon olarak EKLENMEYECEK.\n• Kontrol kolonu yalnızca üretimden sonra şu analizler için kullanılacak: aktif kesin kurallardan geçer mi, aday havuzunda var mı, risk/uç sonrası kalır mı, final seçime girer mi, seçilmediyse hangi seçim önceliği nedeniyle geride kalır.\n• Backtest bilgisi kolon üretimini hileli biçimde yönlendirmek için değil, kural kalibrasyonu ve geriye dönük başarı ölçümü için kullanılacaktır.\n`;
        }
        return `\n════════════════════════════════════════\n0. ÇALIŞMA MODU\n════════════════════════════════════════\n• Mod: GERÇEK ÇEKİLİŞ ÜRETİMİ.\n• Gerçek sonuç bilinmediği için kontrol kolonu istenmez ve kullanılmaz.\n• Üretim yalnızca sayı havuzu, aktif kesin kurallar, optimizasyon öncelikleri ve paket/genel seçim ayarlarına göre yapılacaktır.\n• Sistem kullanıcıdan 6 bilen sayıyı istemeyecek; simülasyon/backtest alanları gerçek çekiliş üretimine dahil edilmeyecektir.\n`;
      }

      function v72AppendCheckerSafety(s) {
        if (!s.includes('CHECKER PROMPTU')) return s;
        const safety = ' Backtest modunda girilen kontrol kolonunu üretilen kolonlara zorla ekleme; yalnızca kural geçişi ve final seçim durumu için raporla. Gerçek çekiliş modunda kontrol kolonu arama veya isteme.';
        if (s.includes(safety.trim())) return s;
        return s.replace(/(Her ihlali kolon ve ihlal nedeni ile raporla\.?)/, '$1' + safety);
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', v72BuildCard); else v72BuildCard();

      const prevBuild = window.buildPrompt || (typeof buildPrompt !== 'undefined' ? buildPrompt : null);
      window.buildPrompt = function () {
        let s = prevBuild ? prevBuild() : '';
        const block = v72ModePromptBlock();
        if (!s.includes('0. ÇALIŞMA MODU')) {
          s = s.replace('════════════════════════════════════════\n1. GİRDİLER', block + '\n════════════════════════════════════════\n1. GİRDİLER');
        }
        s = v72AppendCheckerSafety(s);
        return s;
      };
      try { buildPrompt = window.buildPrompt; } catch (e) { }

      window.buildAndSend = function () {
        try { if (typeof parsePool === 'function') parsePool(); } catch (e) { }
        const prompt = window.buildPrompt();
        window.lastPrompt = prompt;
        try { if (typeof lastPrompt !== 'undefined') lastPrompt = prompt; } catch (e) { }
        if (typeof putPromptToScreen === 'function') putPromptToScreen(prompt);
        else { const out = $('prompt-output'); if (out) out.value = prompt; const card = $('prompt-output-card'); if (card) card.classList.add('show'); }
        if (navigator.clipboard) navigator.clipboard.writeText(prompt).then(() => alert('Prompt oluşturuldu ve panoya kopyalandı.')).catch(() => alert('Prompt oluşturuldu. Kutudan kopyalayabilirsin.'));
      };
      try { buildAndSend = window.buildAndSend; } catch (e) { }
      window.copyPrompt = function () {
        const prompt = window.buildPrompt(); window.lastPrompt = prompt;
        try { if (typeof lastPrompt !== 'undefined') lastPrompt = prompt; } catch (e) { }
        if (typeof putPromptToScreen === 'function') putPromptToScreen(prompt);
        const out = $('prompt-output'); if (out) out.value = prompt;
        if (navigator.clipboard) navigator.clipboard.writeText(prompt);
      };
      try { copyPrompt = window.copyPrompt; } catch (e) { }

      window.v72Mode = v72Mode;
      window.v72ControlNumbers = v72ControlNumbers;
    })();
  