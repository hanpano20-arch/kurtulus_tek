

    // Global Tooltip Logic
    window.showTip = function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (!el) return;
      let tip = document.getElementById('slider-tip');
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'slider-tip';
        tip.style.position = 'fixed';
        tip.style.background = '#0a84ff';
        tip.style.color = '#fff';
        tip.style.padding = '4px 10px';
        tip.style.borderRadius = '6px';
        tip.style.fontSize = '14px';
        tip.style.fontWeight = 'bold';
        tip.style.pointerEvents = 'none';
        tip.style.zIndex = '99999';
        tip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
        tip.style.transform = 'translate(-50%, -100%)';
        tip.style.marginTop = '-12px';
        document.body.appendChild(tip);
      }
      tip.style.display = 'block';
      window.updateTip(el);
    };

    window.hideTip = function () {
      let tip = document.getElementById('slider-tip');
      if (tip) tip.style.display = 'none';
    };

    window.updateTip = function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (!el) return;
      let tip = document.getElementById('slider-tip');
      if (tip && tip.style.display !== 'none') {
        tip.textContent = el.value;
        const rect = el.getBoundingClientRect();
        const percent = (el.value - el.min) / (el.max - el.min);
        const thumbX = rect.left + (percent * rect.width);
        tip.style.left = thumbX + 'px';
        tip.style.top = rect.top + 'px';
      }
    };

  