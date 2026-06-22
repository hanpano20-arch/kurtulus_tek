with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix the extra </div> that was causing Sayı Listesi to disappear
# The buggy part ends with:
#         </div>
#       
#       </div>
#     </div>
# 
#     <!-- SAYI LİSTESİ -->

old_end = """        <div id="hm-backtest-results"
          style="color:#fff; background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; max-height:400px; overflow-y:auto; display:none;">
        </div>
      
      </div>
    </div>

    <!-- SAYI LİSTESİ -->"""

new_end = """        <div id="hm-backtest-results"
          style="color:#fff; background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; max-height:400px; overflow-y:auto; display:none;">
        </div>
      </div>

      <script>
          function populateTimeMachine() {
            let sel = document.getElementById('tm-select');
            if(!sel) return;
            // Get raw db without offset
            let rawDB = null;
            try {
              const v = JSON.parse(localStorage.getItem(dk()) || 'null');
              if (v && Array.isArray(v.entries)) rawDB = v;
            } catch (e) { }
            if (!rawDB) {
                if (typeof sd === 'function') {
                    const s = sd();
                    rawDB = { entries: s.d.map((nums, i) => ({ date: s.t[i], nums, joker: s.j ? s.j[i] : null })) };
                }
            }
            if (rawDB && rawDB.entries) {
                sel.innerHTML = '<option value="0">Bugündeyim (Kesinti Yok)</option>';
                rawDB.entries.slice(0, 50).forEach((entry, idx) => {
                    if(idx === 0) return;
                    let opt = document.createElement('option');
                    opt.value = idx;
                    let dateStr = entry.date ? entry.date.split("-").reverse().join("-") : "Bilinmeyen";
                    let numsStr = entry.nums ? entry.nums.join(',') : "";
                    opt.textContent = dateStr + " (Çekiliş: " + numsStr + ")";
                    sel.appendChild(opt);
                });
            }
          }
      </script>

    <!-- SAYI LİSTESİ -->"""

html = html.replace(old_end, new_end)

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("DOM fixed and populateTimeMachine restored.")
