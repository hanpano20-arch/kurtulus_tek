import re
import os

filepath = r"d:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_0.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the chips rendering
old_chips = """              return '<span class="h-chip ' + cls + selCls + jCls + '" data-n="' + x.n + '" onclick="H.toggleChip(' + x.n + ',this)">' +
                x.n + jBadge + '<small style="font-size:9px;margin-left:2px">' + scoreText + '</small></span>';"""
new_chips = """              return '<span class="h-chip ' + cls + selCls + jCls + '" data-n="' + x.n + '" onclick="H.toggleChip(' + x.n + ',this)" style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;gap:2px;min-width:32px;">' +
                '<span style="font-size:14px;font-weight:bold;line-height:1;display:flex;align-items:center;gap:2px;">' + x.n + jBadge + '</span>' +
                '<small style="font-size:9px;line-height:1;opacity:0.8;">' + scoreText + 'p</small></span>';"""

content = content.replace(old_chips, new_chips)

# 2. Add Detailed Table CSS and JS
# Look for </style> to inject CSS
css_to_add = """
/* Detailed Scoring Table */
.dst-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; font-family: 'Inter', sans-serif; }
.dst-table th, .dst-table td { border: 1px solid var(--color-border); padding: 4px; text-align: center; }
.dst-table th { background: var(--color-bg-alt); color: var(--color-text); position: sticky; top: 0; z-index: 5; }
.dst-table td.dst-num { font-weight: bold; font-size: 13px; }
.dst-table .dst-hot td.dst-num { color: #ff6b6b; }
.dst-table .dst-warm td.dst-num { color: #ffd93d; }
.dst-table .dst-cold td.dst-num { color: #6bcb77; }
.dst-table .dst-out td.dst-num { color: #888; }
.dst-table .dst-manual-input { width: 40px; background: var(--color-bg); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 3px; text-align: center; font-size: 11px; padding: 2px; }
.dst-tooltip-btn { cursor: pointer; text-decoration: underline dotted; color: var(--color-primary); }
.dst-balloon { display: none; position: fixed; background: var(--color-bg-alt); border: 1px solid var(--color-border); box-shadow: 0 4px 10px rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; z-index: 9999; max-width: 250px; font-size: 12px; }
.dst-balloon.active { display: block; }
.dst-balloon-close { float: right; cursor: pointer; color: #ff6b6b; font-weight: bold; margin-left: 10px; margin-top: -2px; }
"""
content = content.replace("</style>", css_to_add + "\n</style>")

# 3. Add ephemeral manual scores dict
if "let _ephemeral_ms = {};" not in content:
    content = content.replace("let _sc = {}, _sel = new Set();", "let _sc = {}, _sel = new Set(), _ephemeral_ms = {};")

# 4. Inject `H.renderDetailedTable` right before `H.renderList = function () {`
detailed_table_js = """
      H.updateEphemeralManual = function(n, val) {
        let v = parseFloat(val);
        if (isNaN(v)) v = 0;
        _ephemeral_ms[n] = v;
        
        // Recalculate final score:
        // We know that `res[n].final` initially comes from `res[n].hm_details` totals.
        // Wait, `_sc[n].final` is just the score. If we recalculate, we need the base score.
        // Let's store base score!
        if (_sc[n].base === undefined) {
           _sc[n].base = _sc[n].final; 
        }
        _sc[n].final = _sc[n].base + v;
        
        H.renderList(); // Re-render everything!
      };

      H.showTooltip = function(e, title, desc) {
        let balloon = document.getElementById('dst-balloon');
        if(!balloon) {
           balloon = document.createElement('div');
           balloon.id = 'dst-balloon';
           balloon.className = 'dst-balloon';
           document.body.appendChild(balloon);
        }
        balloon.innerHTML = '<span class="dst-balloon-close" onclick="document.getElementById(\\'dst-balloon\\').classList.remove(\\'active\\')">✖</span>' + 
                            '<b>' + title + '</b><br><br>' + desc;
        balloon.style.left = Math.min(e.clientX + 10, window.innerWidth - 260) + 'px';
        balloon.style.top = e.clientY + 10 + 'px';
        balloon.classList.add('active');
      };

      H.renderDetailedTable = function(grp) {
        const rules = [
          {id: 'k1_joker', name: 'K1-Joker', desc: 'Son 15 çekilişte joker olan sayılara verilen ekstra ağırlıklı puan.'},
          {id: 'k2_onluk_kuraklik', name: 'K2-Kuraklık(10luk)', desc: 'Son 3 haftada hiç çıkmayan onluk bloktaki tüm sayılara verilen bonus.'},
          {id: 'k3_gecmis', name: 'K3-Geçmiş', desc: 'Tüm zamanların frekansına göre verilen temel puan.'},
          {id: 'k4_yakin', name: 'K4-Yakın', desc: 'Son 15, 10 ve 5 çekilişteki frekansa göre verilen ivme puanı.'},
          {id: 'k5_kuraklik', name: 'K5-Kuraklık(Genel)', desc: 'Sayının çıkmadığı hafta sayısı kadar aldığı kuraklık bonusu.'},
          {id: 'k11_kinetik', name: 'K6-Kinetik', desc: 'Son çekilişlerde hızlanan sayılara verilen ivme bonusu.'},
          {id: 'k12_komsu1', name: 'K7-Komşu1', desc: 'Son 3 haftada çıkan sayıların 1. derece (yakın) komşularına verilen bonus.'},
          {id: 'k13_komsu2', name: 'K8-Komşu2', desc: 'Son 3 haftada çıkan sayıların 2. derece (uzak) komşularına verilen bonus.'},
          {id: 'k14_bolge_gecisi', name: 'K9-Bölge', desc: 'Ağırlık merkezinin diğer tarafa kayma ihtimaline karşı verilen bölge geçiş bonusu.'},
          {id: 'k8_gecikmeli', name: 'K10-Gecikmeli', desc: 'Eskiden sık çıkıp son 5 haftada susan sayılara verilen patlama bonusu.'},
          {id: 'cezalar', name: 'Cezalar', desc: 'Aşırı Doygunluk, Çifte Tekrar, Ölüm Cezası ve Ölü Sayı cezalarının toplamı.'}
        ];

        let html = '<div style="overflow-x:auto; margin-top:20px; border-top: 1px solid var(--color-border); padding-top:15px;">';
        html += '<div style="font-size:14px; color:var(--color-primary); font-weight:bold; margin-bottom:10px;">📊 Detaylı Puan Tablosu</div>';
        html += '<table class="dst-table">';
        
        // Header
        html += '<tr><th>Sayı</th>';
        rules.forEach(r => {
           let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
           html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th><th>FİNAL</th></tr>';

        function renderRows(arr, rowClass) {
          if(!arr) return '';
          let res = '';
          arr.forEach(x => {
             let details = (x.hm_details) || {};
             let c_doygunluk = details.k9_doygunluk || 0;
             let c_cifte = details.k10_cifte_tekrar || 0;
             let c_olum = details.k6_olum || 0;
             let c_olusayi = details.k7_olu_sayi || 0;
             let total_ceza = c_doygunluk + c_cifte + c_olum + c_olusayi;

             let man = _ephemeral_ms[x.n] || 0;
             
             res += '<tr class="' + rowClass + '">';
             res += '<td class="dst-num">' + x.n + '</td>';
             rules.forEach(r => {
                if(r.id === 'cezalar') {
                   res += '<td style="color:' + (total_ceza < 0 ? '#ff6b6b' : 'inherit') + '">' + total_ceza + '</td>';
                } else {
                   let val = details[r.id] || 0;
                   res += '<td>' + val + '</td>';
                }
             });
             res += '<td><input type="number" class="dst-manual-input" value="' + man + '" onchange="H.updateEphemeralManual(' + x.n + ', this.value)"></td>';
             res += '<td><b>' + x.score + '</b></td>';
             res += '</tr>';
          });
          return res;
        }

        html += renderRows(grp.hot, 'dst-hot');
        html += renderRows(grp.warm, 'dst-warm');
        html += renderRows(grp.cold, 'dst-cold');
        html += renderRows(grp.out, 'dst-out');

        html += '</table></div>';
        return html;
      };
"""

content = content.replace("H.renderList = function () {", detailed_table_js + "\n      H.renderList = function () {")

# 5. Append detailed table call
# find: const ct = document.getElementById('hc-list');
# we will inject `box.innerHTML += H.renderDetailedTable(grp);` before `const ct = ...`

append_call = """
          box.innerHTML += H.renderDetailedTable(grp);
          const ct = document.getElementById('hc-list');
"""
content = content.replace("const ct = document.getElementById('hc-list');", append_call)

# 6. We must ensure `hm_details` passes from `_sc` to `grp`!
# inside mkGroups:
# mapped is `n => ({ n, score: sc[n].final })`
# need `n => ({ n, score: sc[n].final, hm_details: sc[n].hm_details })`
mkGroups_old = ".map(n => ({ n, score: sc[n].final })).sort((a, b) => b.score - a.score);"
mkGroups_new = ".map(n => ({ n, score: sc[n].final, hm_details: sc[n].hm_details })).sort((a, b) => b.score - a.score);"
content = content.replace(mkGroups_old, mkGroups_new)


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("INJECTION SUCCESS")
